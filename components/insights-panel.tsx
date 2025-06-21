"use client"

import { useState } from "react"
import { Lightbulb, AlertTriangle, Fan, Wrench, TrendingDown } from "lucide-react"
import type { EventLogEntry } from "@/hooks/useEventLogging"

interface InsightsPanelProps {
  eventLog?: EventLogEntry[]
  onExportCSV: () => void
  className?: string
}

export function InsightsPanel({ eventLog = [], onExportCSV, className = "" }: InsightsPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "Overheat":
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      case "FanBoost":
        return <Fan className="h-4 w-4 text-blue-400" />
      case "AutoAction":
        return <Fan className="h-4 w-4 text-green-400" />
      case "MaintenanceForecast":
        return <Wrench className="h-4 w-4 text-orange-400" />
      case "TempRecovery":
        return <TrendingDown className="h-4 w-4 text-green-400" />
      default:
        return <Lightbulb className="h-4 w-4 text-gray-400" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 border-l-red-500"
      case "warning":
        return "bg-amber-500/10 border-l-amber-500"
      default:
        return "bg-blue-500/10 border-l-blue-500"
    }
  }

  const events = eventLog
  const recentEvents = events.slice(-20).reverse() // Show last 20 events, most recent first

  const stats = {
    totalEvents: events.length,
    totalEnergy: events.reduce((sum, e) => sum + e.energyDelta, 0),
    totalCost: events.reduce((sum, e) => sum + e.costDelta, 0),
  }

  return null
}
