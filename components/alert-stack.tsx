"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Fan, Eye, X, ChevronDown, ChevronUp, Bot } from "lucide-react"

interface Alert {
  id: string
  rackId: string
  rackName: string
  severity: "warning" | "critical"
  message: string
  timestamp: number
  dismissed: boolean
}

interface AlertStackProps {
  alerts: Alert[]
  onAlertAction: (alertId: string, action: "increase_fan" | "monitor") => void
  onDismiss: (alertId: string) => void
  autoModeEnabled?: boolean
  className?: string
}

export function AlertStack({
  alerts,
  onAlertAction,
  onDismiss,
  autoModeEnabled = false,
  className = "",
}: AlertStackProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const activeAlerts = alerts.filter((a) => !a.dismissed)

  const handleSwipeGesture = (alertId: string, direction: "left" | "right") => {
    if (direction === "left") {
      onAlertAction(alertId, "increase_fan")
    } else {
      onAlertAction(alertId, "monitor")
    }
  }

  if (activeAlerts.length === 0) {
    return (
      <Card className={`bg-gray-800 border-gray-700 ${className}`}>
        <CardContent className="p-6 text-center">
          <Eye className="h-8 w-8 mx-auto mb-3 text-green-500" />
          <p className="text-gray-300 font-medium">All Systems Optimal</p>
          <p className="text-sm text-gray-500 mt-1">No active alerts</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-400" />
          AI Recommendations
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
            {activeAlerts.length}
          </Badge>
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="md:hidden">
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>

      {/* Alert Cards */}
      <div
        className={`max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 space-y-3 transition-all duration-300 ${isCollapsed ? "max-h-0 overflow-hidden" : ""}`}
      >
        {autoModeEnabled ? (
          <div className="text-center py-8">
            <Card className="bg-green-500/10 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-3 text-green-400 mb-3">
                  <Bot className="h-6 w-6" />
                  <span className="font-semibold">Auto-Mode Active</span>
                </div>
                <p className="text-sm text-gray-300">AI is automatically handling all cooling adjustments</p>
                <p className="text-xs text-gray-500 mt-2">Manual suggestions are disabled</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          activeAlerts.map((alert, index) => (
            <Card
              key={alert.id}
              className={`bg-gray-800 border-l-4 ${
                alert.severity === "critical" ? "border-red-500" : "border-amber-500"
              } transform transition-all duration-300 hover:scale-[1.01] animate-in slide-in-from-right-5 shadow-lg`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <Badge
                    variant={alert.severity === "critical" ? "destructive" : "secondary"}
                    className={
                      alert.severity === "critical"
                        ? "bg-red-500/20 text-red-300 border-red-500/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }
                  >
                    {alert.severity === "critical" ? "CRITICAL" : "WARNING"}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismiss(alert.id)}
                      className="h-6 w-6 p-0 hover:bg-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <h4 className="font-semibold text-white mb-1">{alert.rackName}</h4>
                <p className="text-sm text-gray-300 mb-4">{alert.message}</p>

                {/* Desktop Actions */}
                <div className="hidden md:block">
                  <div className="flex flex-col gap-2 w-full">
                    <Button
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                      onClick={() => onAlertAction(alert.id, "increase_fan")}
                    >
                      <Fan className="h-4 w-4 mr-2" />
                      Increase Fan Flow
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => onAlertAction(alert.id, "monitor")}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Monitor Only
                    </Button>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="md:hidden">
                  <div className="text-xs text-gray-400 mb-3 text-center">Tap to take action</div>
                  <div className="flex flex-col gap-2 w-full">
                    <Button
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                      onClick={() => handleSwipeGesture(alert.id, "left")}
                    >
                      <Fan className="h-4 w-4 mr-2" />
                      Increase Fan Flow
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => handleSwipeGesture(alert.id, "right")}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Monitor Only
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
