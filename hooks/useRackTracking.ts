"use client";

import { useState, useCallback } from "react";

export interface OverheatEvent {
  timestamp: number;
  temperature: number;
}

export interface FanBoostAction {
  timestamp: number;
  percentBoost: number;
  initialTemp: number;
}

export interface TempRecoveryRecord {
  startTemp: number;
  endTemp: number;
  timestamp: number;
  recoveryTime: number;
}

export interface RackTrackingData {
  overheatEvents: OverheatEvent[];
  lastMaintenanceDate: number;
  fanBoostActions: FanBoostAction[];
  tempRecoveryRecords: TempRecoveryRecord[];
  wasOverheating: boolean;
  lastFanBoost?: FanBoostAction;
  pendingRecovery?: {
    startTime: number;
    initialTemp: number;
    fanBoostTime: number;
  };
}

export function useRackTracking() {
  const [rackTracking, setRackTracking] = useState<
    Record<string, RackTrackingData>
  >({});

  const initializeRack = useCallback((rackId: string) => {
    setRackTracking((prev) => {
      if (prev[rackId]) return prev;

      return {
        ...prev,
        [rackId]: {
          overheatEvents: [],
          lastMaintenanceDate:
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Random date within last 30 days
          fanBoostActions: [],
          tempRecoveryRecords: [],
          wasOverheating: false,
        },
      };
    });
  }, []);

  const trackOverheatEvent = useCallback(
    (rackId: string, temperature: number) => {
      const OVERHEAT_THRESHOLD = 28; // 28°C threshold

      setRackTracking((prev) => {
        const rackData = prev[rackId];
        if (!rackData) return prev;

        const isCurrentlyOverheating = temperature > OVERHEAT_THRESHOLD;
        const wasOverheating = rackData.wasOverheating;

        // Only log new overheat event if transitioning from normal to overheating
        if (isCurrentlyOverheating && !wasOverheating) {
          const newEvent: OverheatEvent = {
            timestamp: Date.now(),
            temperature,
          };

          return {
            ...prev,
            [rackId]: {
              ...rackData,
              overheatEvents: [...rackData.overheatEvents, newEvent],
              wasOverheating: true,
            },
          };
        } else if (!isCurrentlyOverheating && wasOverheating) {
          // Transitioning from overheating to normal
          return {
            ...prev,
            [rackId]: {
              ...rackData,
              wasOverheating: false,
            },
          };
        }

        return prev;
      });
    },
    []
  );

  const recordFanBoost = useCallback(
    (rackId: string, percentBoost: number, initialTemp: number) => {
      setRackTracking((prev) => {
        const rackData = prev[rackId];
        if (!rackData) return prev;

        const now = Date.now();
        return {
          ...prev,
          [rackId]: {
            ...rackData,
            fanBoostActions: [
              ...rackData.fanBoostActions,
              { timestamp: now, percentBoost, initialTemp },
            ],
            lastFanBoost: { timestamp: now, percentBoost, initialTemp },
            pendingRecovery: {
              startTime: now,
              initialTemp,
              fanBoostTime: now,
            },
          },
        };
      });
    },
    []
  );

  const recordTempRecovery = useCallback(
    (rackId: string, currentTemp: number) => {
      setRackTracking((prev) => {
        const rackData = prev[rackId];
        if (!rackData || !rackData.lastFanBoost) return prev;

        const timeSinceBoost = Date.now() - rackData.lastFanBoost.timestamp;

        // Only record recovery if enough time has passed and temperature has dropped
        if (
          timeSinceBoost > 4000 &&
          currentTemp < rackData.lastFanBoost.initialTemp
        ) {
          // 4 seconds
          const recoveryRecord: TempRecoveryRecord = {
            startTemp: rackData.lastFanBoost.initialTemp,
            endTemp: currentTemp,
            timestamp: Date.now(),
            recoveryTime: timeSinceBoost,
          };

          return {
            ...prev,
            [rackId]: {
              ...rackData,
              tempRecoveryRecords: [
                ...rackData.tempRecoveryRecords,
                recoveryRecord,
              ],
              lastFanBoost: undefined, // Clear the pending boost
            },
          };
        }

        return prev;
      });
    },
    []
  );

  const getMaintenancePrediction = useCallback(
    (rackId: string) => {
      const rackData = rackTracking[rackId];
      if (!rackData)
        return {
          days: 28,
          status: "good",
          message: "Normal maintenance schedule",
        };

      const now = Date.now();
      const last72Hours = now - 72 * 60 * 60 * 1000;

      const recentOverheats = rackData.overheatEvents.filter(
        (event) => event.timestamp > last72Hours
      );
      const overheatCount = recentOverheats.length;

      if (overheatCount >= 4) {
        return {
          days: 1,
          status: "critical" as const,
          message: "Immediate maintenance required",
          color: "bg-red-500",
        };
      } else if (overheatCount >= 2) {
        return {
          days: 3,
          status: "warning" as const,
          message: "Schedule maintenance soon",
          color: "bg-yellow-500",
        };
      }

      return {
        days: 28,
        status: "good" as const,
        message: "Normal maintenance schedule",
        color: "bg-green-500",
      };
    },
    [rackTracking]
  );

  const getCoolingEfficiency = useCallback(
    (rackId: string) => {
      const rackData = rackTracking[rackId];
      if (!rackData || rackData.tempRecoveryRecords.length === 0) {
        return 85; // Default efficiency for new racks
      }

      const recentRecords = rackData.tempRecoveryRecords.slice(-10); // Last 10 recovery events

      if (recentRecords.length === 0) return 85;

      const totalTempDrop = recentRecords.reduce(
        (sum, record) => sum + (record.startTemp - record.endTemp),
        0
      );
      const totalBoosts = rackData.fanBoostActions
        .slice(-10)
        .reduce((sum, action) => sum + action.percentBoost, 0);

      if (totalBoosts === 0) return 85;

      // Calculate efficiency as temperature drop per unit of fan boost
      const efficiency = Math.min(
        100,
        Math.max(0, (totalTempDrop / totalBoosts) * 100)
      );
      return Math.round(efficiency);
    },
    [rackTracking]
  );

  const getOverheatCount = useCallback(
    (rackId: string, hours = 72) => {
      const rackData = rackTracking[rackId];
      if (!rackData) return 0;

      const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
      return rackData.overheatEvents.filter(
        (event) => event.timestamp > cutoffTime
      ).length;
    },
    [rackTracking]
  );

  const getRackStats = useCallback(
    (rackId: string) => {
      const rackData = rackTracking[rackId];
      if (!rackData) return null;

      // Ensure maintenancePrediction always matches RackStats type
      const prediction = getMaintenancePrediction(rackId);
      const normalizedPrediction = {
        days: prediction.days ?? 28,
        status:
          prediction.status === "critical"
            ? "critical"
            : prediction.status === "warning"
            ? "warning"
            : "good",
        message: prediction.message ?? "Normal maintenance schedule",
        color: prediction.color ?? "bg-green-500",
      };

      const now = Date.now();
      const last72Hours = now - 72 * 60 * 60 * 1000;
      const recentOverheats = rackData.overheatEvents.filter(
        (event) => event.timestamp > last72Hours
      );
      const overheatCount = recentOverheats.length;

      let maintenancePrediction;
      if (overheatCount >= 4) {
        maintenancePrediction = {
          days: 1,
          status: "critical" as const,
          message: "Immediate maintenance required",
          color: "bg-red-500",
        };
      } else if (overheatCount >= 2) {
        maintenancePrediction = {
          days: 3,
          status: "warning" as const,
          message: "Schedule maintenance soon",
          color: "bg-yellow-500",
        };
      } else {
        maintenancePrediction = {
          days: 28,
          status: "good" as const,
          message: "Normal maintenance schedule",
          color: "bg-green-500",
        };
      }

      return {
        overheatEvents: rackData.overheatEvents.length,
        recentOverheats: overheatCount,
        fanBoosts: rackData.fanBoostActions.length,
        tempRecoveries: rackData.tempRecoveryRecords.length,
        lastMaintenance: rackData.lastMaintenanceDate,
        maintenancePrediction,
        coolingEfficiency: getCoolingEfficiency(rackId),
      };
    },
    [
      rackTracking,
      getOverheatCount,
      getMaintenancePrediction,
      getCoolingEfficiency,
    ]
  );

  return {
    initializeRack,
    trackOverheatEvent,
    recordFanBoost,
    recordTempRecovery,
    getMaintenancePrediction,
    getCoolingEfficiency,
    getOverheatCount,
    getRackStats,
    rackTracking,
    setRackTracking, // <-- ADD THIS LINE
  };
}


