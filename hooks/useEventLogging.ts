"use client"

import { useState, useCallback } from "react"

export interface EventLogEntry {
  id: string
  timestamp: number
  rackId: string
  rackName: string
  eventType: "Overheat" | "FanBoost" | "AutoAction" | "MaintenanceForecast" | "TempRecovery" | "Alert"
  cause: string
  actionTaken: string
  outcome: string
  energyDelta: number // kWh
  costDelta: number // USD
  severity: "info" | "warning" | "critical"
  duration?: number // seconds
  tempBefore?: number
  tempAfter?: number
}

export function useEventLogging() {
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([])

  const logEvent = useCallback((entry: Omit<EventLogEntry, "id" | "timestamp">) => {
    const newEntry: EventLogEntry = {
      ...entry,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }

    setEventLog((prev) => [...prev, newEntry].slice(-1000)) // Keep last 1000 events
  }, [])

  const logOverheat = useCallback(
    (rackId: string, rackName: string, tempBefore: number, tempAfter: number, electricityRate: number) => {
      const energyDelta = 0.05 // Estimated 0.05 kWh for detection overhead
      logEvent({
        rackId,
        rackName,
        eventType: "Overheat",
        cause: `Temperature rose from ${tempBefore.toFixed(1)}°C to ${tempAfter.toFixed(1)}°C`,
        actionTaken: "Alert generated, monitoring increased",
        outcome: "System flagged for intervention",
        energyDelta,
        costDelta: energyDelta * electricityRate,
        severity: tempAfter > 32 ? "critical" : "warning",
        tempBefore,
        tempAfter,
      })
    },
    [logEvent],
  )

  const logFanBoost = useCallback(
    (
      rackId: string,
      rackName: string,
      boostPercent: number,
      tempBefore: number,
      tempAfter: number,
      duration: number,
      electricityRate: number,
      isAuto = false,
    ) => {
      const powerIncrease = (boostPercent / 100) * 500 // 500W base fan power
      const energyDelta = (powerIncrease * (duration / 3600)) / 1000 // Convert to kWh

      logEvent({
        rackId,
        rackName,
        eventType: isAuto ? "AutoAction" : "FanBoost",
        cause: `Temperature at ${tempBefore.toFixed(1)}°C exceeded threshold`,
        actionTaken: `Fan speed increased by ${boostPercent}% for ${Math.round(duration)}s`,
        outcome: `Temperature reduced to ${tempAfter.toFixed(1)}°C`,
        energyDelta,
        costDelta: energyDelta * electricityRate,
        severity: "info",
        duration,
        tempBefore,
        tempAfter,
      })
    },
    [logEvent],
  )

  const logMaintenanceForecast = useCallback(
    (rackId: string, rackName: string, daysUntilMaintenance: number, triggerCondition: string) => {
      logEvent({
        rackId,
        rackName,
        eventType: "MaintenanceForecast",
        cause: triggerCondition,
        actionTaken: "Maintenance scheduled",
        outcome: `Maintenance required in ${daysUntilMaintenance} days`,
        energyDelta: 0,
        costDelta: 0,
        severity: daysUntilMaintenance <= 1 ? "critical" : daysUntilMaintenance <= 3 ? "warning" : "info",
      })
    },
    [logEvent],
  )

  const logTempRecovery = useCallback(
    (rackId: string, rackName: string, tempBefore: number, tempAfter: number, recoveryTime: number) => {
      logEvent({
        rackId,
        rackName,
        eventType: "TempRecovery",
        cause: `Cooling intervention completed`,
        actionTaken: `Temperature monitoring during recovery`,
        outcome: `Stabilized from ${tempBefore.toFixed(1)}°C to ${tempAfter.toFixed(1)}°C in ${Math.round(recoveryTime / 1000)}s`,
        energyDelta: 0,
        costDelta: 0,
        severity: "info",
        duration: recoveryTime / 1000,
        tempBefore,
        tempAfter,
      })
    },
    [logEvent],
  )

  const exportToCSV = useCallback(() => {
    const headers = [
      "Timestamp",
      "Rack ID",
      "Rack Name",
      "Event Type",
      "Cause",
      "Action Taken",
      "Outcome",
      "Energy Delta (kWh)",
      "Cost Delta ($)",
      "Severity",
      "Duration (s)",
      "Temp Before (°C)",
      "Temp After (°C)",
    ]

    const csvData = [
      headers.join(","),
      ...eventLog.map((entry) =>
        [
          new Date(entry.timestamp).toISOString(),
          entry.rackId,
          `"${entry.rackName}"`,
          entry.eventType,
          `"${entry.cause}"`,
          `"${entry.actionTaken}"`,
          `"${entry.outcome}"`,
          entry.energyDelta.toFixed(6),
          entry.costDelta.toFixed(4),
          entry.severity,
          entry.duration?.toFixed(1) || "",
          entry.tempBefore?.toFixed(1) || "",
          entry.tempAfter?.toFixed(1) || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `smart-cooling-log-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [eventLog])

  const getEventStats = useCallback(() => {
    const totalEvents = eventLog.length
    const totalEnergy = eventLog.reduce((sum, entry) => sum + entry.energyDelta, 0)
    const totalCost = eventLog.reduce((sum, entry) => sum + entry.costDelta, 0)
    const criticalEvents = eventLog.filter((entry) => entry.severity === "critical").length
    const warningEvents = eventLog.filter((entry) => entry.severity === "warning").length

    return {
      totalEvents,
      totalEnergy,
      totalCost,
      criticalEvents,
      warningEvents,
    }
  }, [eventLog])

  return {
    eventLog,
    logEvent,
    logOverheat,
    logFanBoost,
    logMaintenanceForecast,
    logTempRecovery,
    exportToCSV,
    getEventStats,
  }
}
