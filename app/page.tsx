"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, BarChart3, Play, Pause } from "lucide-react";
import { RackTile } from "@/components/rack-tile";
import { AlertStack } from "@/components/alert-stack";
import { RackDetailPanel } from "@/components/rack-detail-panel";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CoolingInsightCard } from "@/components/cooling-insight-card";
import { AIAssistantBubble } from "@/components/ai-assistant-bubble";
import { HistoryLog } from "@/components/history-log";
import { ProfessionalHeader } from "@/components/professional-header";
import { ProfessionalFooter } from "@/components/professional-footer";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { MetricsPage } from "@/components/metrics-page";
import { useRackTracking } from "@/hooks/useRackTracking";
import {
  useElectricityRate,
  ElectricityRateProvider,
} from "@/context/ElectricityRateContext";

import { fetchLatestEiaRates } from "@/lib/Api/eiaApi";
import type { EIASectorData } from "@/lib/Api/eiaApi";

export interface RackData {
  id: string;
  name: string;
  temperature: number;
  humidity: number;
  status: "cool" | "warm" | "hot";
  lastAlert?: number;
  uptime: number;
  airflowDelta: number;
  overheatEvents?: number;
  fanBoosts?: number;
  tempDrops?: number;
  powerWatts?: number;
  fanSpeed?: number;
  lastMaintenance?: number;
}

interface Alert {
  id: string;
  rackId: string;
  rackName: string;
  severity: "warning" | "critical";
  message: string;
  timestamp: number;
  dismissed: boolean;
}

interface ChartData {
  timestamp: string;
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  avgHumidity: number;
  avgAirflow: number;
}

const GRID_SIZE = 4;
const ALERT_COOLDOWN = 30000;
const UPDATE_INTERVAL = 30000; // 30 seconds
const MAX_DATA_POINTS = 300; // ~10 minutes at 2s interval, adjust as needed
const MAX_HISTORY_POINTS = 300;
const MAX_EVENTS = 200;

interface EfficiencyMetrics {
  current: number;
  potential: number;
  savings: number;
  trend: "improving" | "declining" | "stable";
}

export default function SmartCoolingMonitor() {
  // ======================
  // State Management
  // ======================
  const {
    initializeRack,
    getRackStats,
    setRackTracking,
    recordTempRecovery,
    recordFanBoost,
    rackTracking,
    trackOverheatEvent,
    getMaintenancePrediction,
    getCoolingEfficiency,
  } = useRackTracking();
  const {
    rates,
    rateType,
    setRateType,
    electricityRate,
    setElectricityRate,
    isManual,
    resetToEiaRate,
    loading: loadingRates,
  } = useElectricityRate();
  const [racks, setRacks] = useState<RackData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationIntensity, setSimulationIntensity] = useState([50]);
  const [isCelsius, setIsCelsius] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRack, setSelectedRack] = useState<RackData | null>(null);
  const [energySavings, setEnergySavings] = useState(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [rackHistory, setRackHistory] = useState<
    Record<
      string,
      Array<{ timestamp: string; temperature: number; humidity: number }>
    >
  >({});
  const [showCharts, setShowCharts] = useState(false);
  const [autoModeEnabled, setAutoModeEnabled] = useState(false);
  const [systemEfficiency, setSystemEfficiency] = useState(85);
  const [automatedActions, setAutomatedActions] = useState<
    Array<{
      id: string;
      timestamp: number;
      action: string;
      rackName: string;
      result: string;
      rackId: string;
      temp: number;
    }>
  >([]);
  const [aiMessages, setAIMessages] = useState<
    Array<{
      id: string;
      message: string;
      timestamp: number;
      type: "info" | "warning" | "success";
    }>
  >([]);
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "metrics" | "history"
  >("dashboard");

  const [simulationStartTime] = useState(Date.now());
  const [historyEvents, setHistoryEvents] = useState<
    Array<{
      id: string;
      timestamp: number;
      rackId: string;
      rackName: string;
      eventType:
        | "overheat"
        | "maintenance"
        | "auto_action"
        | "manual_action"
        | "alert";
      details: string;
      severity?: "info" | "warning" | "critical";
    }>
  >([]);
  // Set electricityRate to undefined initially, will set after rates load
  const [sessionKwh, setSessionKwh] = useState(0);
  const [baselineKwh, setBaselineKwh] = useState(0);
  const [energyData, setEnergyData] = useState<
    Array<{
      timestamp: string;
      actualKwh: number;
      baselineKwh: number;
      savingsKwh: number;
    }>
  >([]);

  const [eventLog, setEventLog] = useState<
    Array<{
      id: string;
      timestamp: number;
      rackId: string;
      rackName: string;
      eventType: string;
      cause: string;
      actionTaken: string;
      outcome: string;
      energyDelta: number;
      costDelta: number;
      severity: string;
      duration?: number;
      tempBefore?: number;
      tempAfter?: number;
    }>
  >([]);
  const [hydrated, setHydrated] = useState(false);
  const [efficiencyMetrics, setEfficiencyMetrics] = useState<EfficiencyMetrics>(
    {
      current: 0,
      potential: 0,
      savings: 0,
      trend: "stable",
    }
  );

  useEffect(() => setHydrated(true), []);

  // ======================
  // Rack Initialization
  // ======================
  useEffect(() => {
    const initialRacks: RackData[] = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const rackId = `rack-${i}`;
      const baseTemp = 18 + Math.random() * 8; // 18-26°C
      initialRacks.push({
        id: rackId,
        name: `Rack ${String.fromCharCode(65 + Math.floor(i / GRID_SIZE))}${
          (i % GRID_SIZE) + 1
        }`,
        temperature: baseTemp,
        humidity: 45 + Math.random() * 20, // 45-65%
        status: baseTemp > 24 ? "warm" : baseTemp > 28 ? "hot" : "cool",
        uptime: 99.2 + Math.random() * 0.7,
        airflowDelta: -2 + Math.random() * 4,
      });
    }
    setRacks(initialRacks);
    initialRacks.forEach((rack) => initializeRack(rack.id));
  }, []);

  // ======================
  // Chart Data Updates
  // ======================
  const updateChartData = useCallback(
    (currentRacks: RackData[]) => {
      const now = new Date().toISOString();
      const temps = currentRacks.map((r) => r.temperature);
      const humidities = currentRacks.map((r) => r.humidity);
      const airflows = currentRacks.map((r) => r.airflowDelta);

      const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
      const maxTemp = Math.max(...temps);
      const minTemp = Math.min(...temps);
      const avgHumidity =
        humidities.reduce((a, b) => a + b, 0) / humidities.length;
      const avgAirflow = airflows.reduce((a, b) => a + b, 0) / airflows.length;

      setChartData((prev) => {
        const newData = [
          ...prev,
          {
            timestamp: now,
            avgTemp,
            maxTemp,
            minTemp,
            avgHumidity,
            avgAirflow,
          },
        ];
        // Keep only the last MAX_DATA_POINTS
        return newData.length > MAX_DATA_POINTS
          ? newData.slice(newData.length - MAX_DATA_POINTS)
          : newData;
      });

      setRackHistory((prev) => {
        const updated = { ...prev };
        currentRacks.forEach((rack) => {
          if (!updated[rack.id]) updated[rack.id] = [];
          updated[rack.id].push({
            timestamp: now,
            temperature: rack.temperature,
            humidity: rack.humidity,
          });
          // Limit history length per rack
          if (updated[rack.id].length > MAX_HISTORY_POINTS) {
            updated[rack.id] = updated[rack.id].slice(
              updated[rack.id].length - MAX_HISTORY_POINTS
            );
          }
        });
        return updated;
      });
    },
    [setChartData, setRackHistory]
  );
  const calculateEfficiency = useCallback(() => {
    if (racks.length === 0 || baselineKwh === 0) return;

    const totalPower =
      racks.reduce((sum, rack) => sum + (rack.powerWatts || 0), 0) / 1000;
    const baselinePower = (500 * racks.length) / 1000; // 500W per rack at 100%
    const currentEfficiency = Math.max(
      0,
      (1 - totalPower / baselinePower) * 100
    );

    const hotRacks = racks.filter((r) => r.status === "hot").length;
    const potentialSavings = hotRacks * 0.15; // 15% per hot rack

    const prevEfficiency = efficiencyMetrics.current;
    let trend: EfficiencyMetrics["trend"] = "stable";
    if (currentEfficiency > prevEfficiency + 2) trend = "improving";
    else if (currentEfficiency < prevEfficiency - 2) trend = "declining";

    setEfficiencyMetrics({
      current: currentEfficiency,
      potential: Math.min(100, currentEfficiency + potentialSavings),
      savings: baselineKwh - sessionKwh,
      trend,
    });
  }, [racks, baselineKwh, sessionKwh, efficiencyMetrics.current]);

  // ======================
  // Simulation Logic
  // ======================

  useEffect(() => {
    calculateEfficiency();
  }, [racks, baselineKwh, sessionKwh]);
  useEffect(() => {
    console.log("electricityRate changed:", electricityRate);
  }, [electricityRate]);
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setRacks((prevRacks) => {
        const updatedRacks = prevRacks.map((rack) => {
          const intensity = simulationIntensity[0] / 100;
          const tempChange = (Math.random() - 0.5) * 2 * intensity;
          const humidityChange = (Math.random() - 0.5) * 4 * intensity;

          const oldTemp = rack.temperature;
          const newTemp = Math.max(
            15,
            Math.min(40, rack.temperature + tempChange)
          );
          const newHumidity = Math.max(
            30,
            Math.min(80, rack.humidity + humidityChange)
          );

          let status: "cool" | "warm" | "hot" = "cool";
          if (newTemp > 28) status = "hot";
          else if (newTemp > 24) status = "warm";

          // Event Logging Logic
          const nowTimestamp = Date.now();

          // Overheat event detection
          if (newTemp > 35 && oldTemp <= 35) {
            const energyDelta = 0.008;
            const costDelta = energyDelta * (electricityRate ?? 0);

            setEventLog((prev) => [
              ...prev,
              {
                id: `event-${nowTimestamp}-${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
                timestamp: nowTimestamp,
                rackId: rack.id,
                rackName: rack.name,
                eventType: "Overheat",
                cause: `Temp rose from ${oldTemp.toFixed(
                  1
                )}°C to ${newTemp.toFixed(1)}°C`,
                actionTaken: "Alert generated, monitoring increased",
                outcome: "System flagged for intervention",
                energyDelta,
                costDelta,
                severity: newTemp > 38 ? "critical" : "warning",
                tempBefore: oldTemp,
                tempAfter: newTemp,
              },
            ]);
          }

          // Track overheat event for diagnostics/maintenance prediction
          trackOverheatEvent(rack.id, newTemp);
          // --- Add this block here ---
          const now = Date.now();
          const tracking = rackTracking[rack.id];
          if (tracking?.pendingRecovery) {
            const { fanBoostTime } = tracking.pendingRecovery;
            if (rack.temperature < 28 && now - fanBoostTime > 60 * 1000) {
              // Success: record recovery
              recordTempRecovery(rack.id, rack.temperature);
              setRackTracking((prev) => ({
                ...prev,
                [rack.id]: { ...prev[rack.id], pendingRecovery: undefined },
              }));
            } else if (now - fanBoostTime > 5 * 60 * 1000) {
              // Too late, clear pendingRecovery
              setRackTracking((prev) => ({
                ...prev,
                [rack.id]: { ...prev[rack.id], pendingRecovery: undefined },
              }));
            }
          }
          // --- End block ---

          return {
            ...rack,
            temperature: newTemp,
            humidity: newHumidity,
            status,
            uptime: Math.max(95, rack.uptime + (Math.random() - 0.5) * 0.1),
            airflowDelta: rack.airflowDelta + (Math.random() - 0.5) * 0.5,
          };
        });

        const updatedRacksWithPower = updatedRacks.map((rack) => ({
          ...rack,
          powerWatts: calculateRackPower(rack),
          fanSpeed:
            rack.status === "hot" ? 100 : rack.status === "warm" ? 75 : 50,
        }));

        // Energy calculations
        const totalPowerKw =
          updatedRacksWithPower.reduce(
            (sum, rack) => sum + (rack.powerWatts || 0),
            0
          ) / 1000;
        const baselinePowerKw = (500 * updatedRacksWithPower.length) / 1000;
        const intervalHours = 2 / 3600;

        setSessionKwh((prev) => prev + totalPowerKw * intervalHours);
        setBaselineKwh((prev) => prev + baselinePowerKw * intervalHours);

        // Update energy data
        const now = new Date();
        setEnergyData((prev) => {
          const newEntry = {
            timestamp: now.toISOString(),
            actualKwh: sessionKwh + totalPowerKw * intervalHours,
            baselineKwh: baselineKwh + baselinePowerKw * intervalHours,
            savingsKwh:
              baselineKwh +
              baselinePowerKw * intervalHours -
              (sessionKwh + totalPowerKw * intervalHours),
          };
          const newArr = [...prev, newEntry];
          return newArr.length > MAX_DATA_POINTS
            ? newArr.slice(newArr.length - MAX_DATA_POINTS)
            : newArr;
        });

        // Generate alerts
        const nowTimestamp = Date.now();
        const newAlerts: Alert[] = [];

        updatedRacksWithPower.forEach((rack) => {
          if (
            rack.status === "hot" &&
            (!rack.lastAlert || nowTimestamp - rack.lastAlert > ALERT_COOLDOWN)
          ) {
            const alertId = `alert-${rack.id}-${nowTimestamp}-${Math.random()
              .toString(36)
              .slice(2, 8)}`;
            newAlerts.push({
              id: alertId,
              rackId: rack.id,
              rackName: rack.name,
              severity: rack.temperature > 32 ? "critical" : "warning",
              message: `Temperature critical: ${rack.temperature.toFixed(1)}°${
                isCelsius ? "C" : "F"
              }`,
              timestamp: nowTimestamp,
              dismissed: false,
            });
            rack.lastAlert = nowTimestamp;
          }
        });

        if (newAlerts.length > 0) {
          const newHistoryEvents = newAlerts.map((alert) => ({
            id: `history-auto-${alert.id}-${Math.random()
              .toString(36)
              .slice(2, 8)}`,
            timestamp: alert.timestamp,
            rackId: alert.rackId,
            rackName: alert.rackName,
            eventType: "alert" as const,
            details: alert.message,
            severity: alert.severity,
          }));

          setHistoryEvents((prev) => [...prev, ...newHistoryEvents]);
          setAlerts((prev) => [
            ...prev.filter((a) => !a.dismissed),
            ...newAlerts,
          ]);
        }

        // Auto-mode handling
        if (autoModeEnabled && newAlerts.length > 0) {
          newAlerts.forEach((alert) => {
            const rackIndex = updatedRacksWithPower.findIndex(
              (r) => r.id === alert.rackId
            );
            if (rackIndex !== -1) {
              const rack = updatedRacksWithPower[rackIndex];
              const tempBefore = rack.temperature;
              const boostPercent = 15;

              // Apply cooling effect
              updatedRacksWithPower[rackIndex].temperature -= 2;
              const tempAfter = updatedRacksWithPower[rackIndex].temperature;

              // Track fan boost for diagnostics/recovery logic
              recordFanBoost(rack.id, boostPercent, tempBefore);

              // Log AutoAction event
              const energyDelta = (boostPercent / 100) * 0.5 * (120 / 3600);
              const costDelta = energyDelta * (electricityRate ?? 0);

              setEventLog((prev) => [
                ...prev,
                {
                  id: `auto-${alert.id}-${
                    crypto.randomUUID?.() ||
                    Math.random().toString(36).slice(2, 8)
                  }`,
                  timestamp: nowTimestamp,
                  rackId: rack.id,
                  rackName: rack.name,
                  eventType: "AutoAction",
                  cause: `Temperature at ${tempBefore.toFixed(
                    1
                  )}°C exceeded threshold`,
                  actionTaken: `Auto increased fan to 90% for 2 minutes`,
                  outcome: `Stabilized at ${tempAfter.toFixed(1)}°C`,
                  energyDelta,
                  costDelta,
                  severity: "info",
                  duration: 120,
                  tempBefore,
                  tempAfter,
                },
              ]);

              const action = {
                id: `auto-${alert.id}-${Math.random()
                  .toString(36)
                  .slice(2, 8)}`,
                timestamp: nowTimestamp,
                action: "Auto-increased fan flow by 15%",
                rackName: alert.rackName,
                result: "Temperature reduced by 2.1°C",
                rackId: alert.rackId,
                temp: tempAfter,
              };
              setAutomatedActions((prev) => [...prev, action]);

              setHistoryEvents((prev) => [
                ...prev,
                {
                  id: `history-auto-${alert.id}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`,
                  timestamp: nowTimestamp,
                  rackId: alert.rackId,
                  rackName: alert.rackName,
                  eventType: "auto_action" as const,
                  details: `${action.action} - ${action.result}`,
                  severity: "info" as const,
                },
              ]);
            }
          });
        }

        // Update chart data
        updateChartData(updatedRacksWithPower);
        return updatedRacksWithPower;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [
    isSimulating,
    simulationIntensity,
    isCelsius,
    autoModeEnabled,
    electricityRate,
    sessionKwh,
    baselineKwh,
    updateChartData,
    rackTracking, // Make sure this is included as a dependency
  ]);

  // ======================
  // Alert Handlers
  // ======================
  const handleAlertAction = (
    alertId: string,
    action: "increase_fan" | "monitor"
  ) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, dismissed: true } : alert
      )
    );

    if (action === "increase_fan") {
      const alert = alerts.find((a) => a.id === alertId);
      if (alert) {
        setRacks((prev) =>
          prev.map((rack) => {
            if (rack.id === alert.rackId) {
              const tempBefore = rack.temperature;
              const newTemp = rack.temperature - 2;
              const nowTimestamp = Date.now();
              // Track manual fan boost
              recordFanBoost(rack.id, 35, tempBefore);

              // Log manual FanBoost event
              const energyDelta = 0.01 * (90 / 3600);
              const costDelta = energyDelta * (electricityRate ?? 0);

              setEventLog((prev) => [
                ...prev,
                {
                  id: `manual-${nowTimestamp}-${rack.id}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`,
                  timestamp: nowTimestamp,
                  rackId: rack.id,
                  rackName: rack.name,
                  eventType: "FanBoost",
                  cause: `Manual intervention requested for ${tempBefore.toFixed(
                    1
                  )}°C`,
                  actionTaken: "Manual fan boost to 85% for 90 seconds",
                  outcome: `Temperature reduced to ${newTemp.toFixed(1)}°C`,
                  energyDelta,
                  costDelta,
                  severity: "info",
                  duration: 90,
                  tempBefore,
                  tempAfter: newTemp,
                },
              ]);

              return { ...rack, temperature: newTemp };
            }
            return rack;
          })
        );
      }
    }
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, dismissed: true } : alert
      )
    );
  };

  // ======================
  // Utility Functions
  // ======================
  const activeAlerts = alerts.filter((a) => !a.dismissed);

  const handleExportCSV = () => {
    const csvData = [];
    csvData.push(
      "Timestamp,Rack ID,Rack Name,Temperature,Humidity,Airflow,Status,Insights"
    );

    racks.forEach((rack) => {
      const insights = aiMessages
        .filter((m) => m.message.includes(rack.name))
        .map((m) => m.message)
        .join("; ");
      csvData.push(
        [
          new Date().toISOString(),
          rack.id,
          rack.name,
          rack.temperature.toFixed(2),
          rack.humidity.toFixed(2),
          rack.airflowDelta.toFixed(2),
          rack.status,
          insights || "No insights",
        ].join(",")
      );
    });

    const csvContent = csvData.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cooling-monitor-data-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ======================
  // Render
  // ======================
  if (!hydrated || loadingRates) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
          <span className="text-white text-lg font-mono">
            Loading electricity rates…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden max-w-full box-border">
      <ProfessionalHeader
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        activeAlerts={activeAlerts.length}
        totalEvents={historyEvents.length}
        isSimulating={isSimulating}
      />

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-140px)]">
        {/* Main Content */}
        {currentPage === "dashboard" && (
          <main className="flex-1 p-6 max-w-full overflow-x-hidden">
            {/* Mobile Charts Toggle */}
            <div className="md:hidden mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCharts(!showCharts)}
                className="w-full bg-slate-700"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {showCharts ? "Hide" : "Show"} Overview Chart
              </Button>
            </div>

            {/* Professional Overview Chart */}
            {showCharts && (
              <div className="mb-6">
                <Card className="bg-gray-800 border-gray-700 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                      Temperature Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#374151"
                          />
                          <XAxis
                            dataKey="timestamp"
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickFormatter={(value) =>
                              new Date(value).toLocaleTimeString().slice(0, 5)
                            }
                          />
                          <YAxis
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickFormatter={(value) =>
                              `${(isCelsius
                                ? value
                                : (value * 9) / 5 + 32
                              ).toFixed(0)}°${isCelsius ? "C" : "F"}`
                            }
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1F2937",
                              border: "1px solid #374151",
                              borderRadius: "8px",
                              color: "#F3F4F6",
                            }}
                            labelFormatter={(value) =>
                              new Date(value).toLocaleTimeString()
                            }
                            formatter={(value: number) => [
                              `${(isCelsius
                                ? value
                                : (value * 9) / 5 + 32
                              ).toFixed(1)}°${isCelsius ? "C" : "F"}`,
                              "",
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="avgTemp"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            name="Average"
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="maxTemp"
                            stroke="#EF4444"
                            strokeWidth={1}
                            strokeDasharray="5 5"
                            name="Maximum"
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="minTemp"
                            stroke="#10B981"
                            strokeWidth={1}
                            strokeDasharray="5 5"
                            name="Minimum"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Professional Rack Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center max-w-full">
              {racks.map((rack) => (
                <RackTile
                  key={rack.id}
                  rack={rack}
                  isCelsius={isCelsius}
                  onClick={() => setSelectedRack(rack)}
                />
              ))}
            </div>

            {/* Mobile Alert Stack */}
            <div className="lg:hidden mt-6">
              <AlertStack
                alerts={alerts}
                onAlertAction={handleAlertAction}
                onDismiss={handleDismissAlert}
                autoModeEnabled={autoModeEnabled}
              />
            </div>
          </main>
        )}

        {currentPage === "metrics" && (
          <main className="flex-1 p-6 max-w-full overflow-x-hidden">
            <MetricsPage
              racks={racks}
              chartData={chartData}
              rackHistory={rackHistory}
              simulationStartTime={simulationStartTime}
              isCelsius={isCelsius}
              onExportCSV={handleExportCSV}
              energyData={energyData}
              eventLog={eventLog}
              onExportEventCSV={() => {}}
            />
          </main>
        )}

        {currentPage === "history" && (
          <main className="flex-1 p-6 max-w-full overflow-x-hidden">
            <HistoryLog events={historyEvents} />
          </main>
        )}

        {/* Professional Desktop Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          } lg:translate-x-0 fixed lg:relative top-0 right-0 w-80 h-full bg-gray-800 border-l border-gray-700 transition-transform duration-300 z-20 lg:z-auto flex flex-col shadow-xl`}
        >
          <div className="p-4 border-b border-gray-700 flex items-center justify-between lg:hidden flex-shrink-0">
            <h2 className="text-lg font-bold text-white">
              Controls & Insights
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="p-4 h-full space-y-6">
              <CoolingInsightCard
                racks={racks}
                autoModeEnabled={autoModeEnabled}
                onAutoModeToggle={setAutoModeEnabled}
                systemEfficiency={systemEfficiency}
                energyData={energyData}
                automatedActions={automatedActions}
                onClearLog={() => setAutomatedActions([])}
              />

              <div className="hidden lg:block">
                <AlertStack
                  alerts={alerts}
                  onAlertAction={handleAlertAction}
                  onDismiss={handleDismissAlert}
                  autoModeEnabled={autoModeEnabled}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Professional Footer */}
      <ProfessionalFooter
        sessionKwh={sessionKwh}
        baselineKwh={baselineKwh}
        totalEvents={historyEvents.length}
        isSimulating={isSimulating}
      />

      {/* Simulation Controls */}
      <div className="bg-gray-800 border-t border-gray-700 p-4 sticky bottom-0 z-30 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-full">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`${
                isSimulating
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              } w-full sm:w-auto font-semibold shadow-md`}
            >
              {isSimulating ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isSimulating ? "Pause Simulation" : "Start Simulation"}
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-sm font-medium text-gray-300 whitespace-nowrap">
                Intensity:
              </span>
              <Slider
                value={simulationIntensity}
                onValueChange={setSimulationIntensity}
                max={100}
                step={10}
                className="w-24 sm:w-32"
              />
              <span className="text-sm font-mono text-gray-400 min-w-[3ch]">
                {simulationIntensity[0]}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-300">°C</span>
              <Switch
                checked={!isCelsius}
                onCheckedChange={(checked) => setIsCelsius(!checked)}
              />
              <span className="text-sm font-medium text-gray-300">°F</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rack Detail Panel */}
      {selectedRack && rackHistory[selectedRack.id] && (
        <RackDetailPanel
          rack={selectedRack}
          rackHistory={rackHistory[selectedRack.id]}
          rackStats={getRackStats ? getRackStats(selectedRack.id) : null}
          isCelsius={isCelsius}
          onClose={() => setSelectedRack(null)}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* AI Assistant Bubble */}
      <AIAssistantBubble
        messages={aiMessages}
        onDismiss={(messageId) =>
          setAIMessages((prev) => prev.filter((m) => m.id !== messageId))
        }
      />
    </div>
  );
}

function calculateRackPower(rack: RackData): number {
  const baseFanPower = 500; // 500W at 100% fan speed
  const fanSpeed =
    rack.status === "hot" ? 100 : rack.status === "warm" ? 75 : 50;
  const tempMultiplier = 1 + (rack.temperature - 20) / 100; // 20°C ambient
  return baseFanPower * (fanSpeed / 100) * tempMultiplier;
}

// Wrap the app in the provider
export function AppWithElectricityRateProvider() {
  return (
    <ElectricityRateProvider>
      <SmartCoolingMonitor />
    </ElectricityRateProvider>
  );
}
