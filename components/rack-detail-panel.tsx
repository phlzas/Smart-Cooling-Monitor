"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { X, Thermometer, Droplets, Activity, Wind, Wrench, Zap, AlertTriangle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RackData {
  id: string
  name: string
  temperature: number
  humidity: number
  status: "cool" | "warm" | "hot"
  lastAlert?: number
  uptime: number
  airflowDelta: number
}

interface RackStats {
  overheatEvents: number
  recentOverheats: number
  fanBoosts: number
  tempRecoveries: number
  lastMaintenance: number
  maintenancePrediction: {
    days: number
    status: "good" | "warning" | "critical"
    message: string
    color: string
  }
  coolingEfficiency: number
}

interface RackDetailPanelProps {
  rack: RackData
  rackHistory?: Array<{ timestamp: string; temperature: number; humidity: number }>
  rackStats?: RackStats
  isCelsius: boolean
  onClose: () => void
}

export function RackDetailPanel({ rack, rackHistory, rackStats, isCelsius, onClose }: RackDetailPanelProps) {
  const convertTemp = (temp: number) => {
    return isCelsius ? temp : (temp * 9) / 5 + 32
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "cool":
        return "bg-green-500"
      case "warm":
        return "bg-yellow-500"
      case "hot":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "hot":
        return "🔥"
      case "warm":
        return "⚠️"
      default:
        return "✅"
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))

    if (days > 0) return `${days}d ${hours}h ago`
    if (hours > 0) return `${hours}h ago`
    return "Recently"
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <Card className="bg-gray-800 border-gray-600 w-full max-w-[600px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <CardHeader className="pb-3 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {getStatusIcon(rack.status)} {rack.name} Diagnostics
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="max-h-[calc(90vh-80px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            <div className="p-6 space-y-6">
              {/* Current Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Current Status</span>
                <Badge className={getStatusColor(rack.status)}>{rack.status.toUpperCase()}</Badge>
              </div>

              {/* Intelligence Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Predictive Maintenance */}
                <Card className="bg-gray-700/50 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Wrench className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-medium">Predictive Maintenance</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">{rackStats?.maintenancePrediction.days || 28} Days</span>
                        <Badge className={rackStats?.maintenancePrediction.color || "bg-green-500"} variant="secondary">
                          {(rackStats?.maintenancePrediction.status || "good").toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">
                        {rackStats?.maintenancePrediction.message || "Normal maintenance schedule"}
                      </p>
                      <div className="text-xs text-gray-500">
                        {rackStats?.recentOverheats || 0} overheat events in last 72h
                      </div>
                      {rackStats && rackStats.recentOverheats >= 2 && (
                        <div className="flex items-center gap-1 text-xs text-yellow-400">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Frequent overheating detected</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Cooling Efficiency */}
                <Card className="bg-gray-700/50 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium">Cooling Efficiency</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">{rackStats?.coolingEfficiency || 85}%</span>
                        <Badge
                          className={
                            (rackStats?.coolingEfficiency || 85) >= 80
                              ? "bg-green-500"
                              : (rackStats?.coolingEfficiency || 85) >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }
                          variant="secondary"
                        >
                          {(rackStats?.coolingEfficiency || 85) >= 80
                            ? "EXCELLENT"
                            : (rackStats?.coolingEfficiency || 85) >= 60
                              ? "GOOD"
                              : "POOR"}
                        </Badge>
                      </div>
                      <Progress value={rackStats?.coolingEfficiency || 85} className="h-2" />
                      <div className="text-xs text-gray-500">
                        {rackStats?.fanBoosts || 0} fan boosts, {rackStats?.tempRecoveries || 0} successful recoveries
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="h-4 w-4 text-orange-400" />
                    <span className="text-sm text-gray-400">Temperature</span>
                  </div>
                  <div className="text-2xl font-mono font-bold">
                    {convertTemp(rack.temperature).toFixed(1)}°{isCelsius ? "C" : "F"}
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-400">Humidity</span>
                  </div>
                  <div className="text-2xl font-mono font-bold">{rack.humidity.toFixed(1)}%</div>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-gray-400">Uptime</span>
                  </div>
                  <div className="text-2xl font-mono font-bold">{rack.uptime.toFixed(2)}%</div>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-gray-400">Airflow Delta</span>
                  </div>
                  <div className="text-2xl font-mono font-bold">
                    {rack.airflowDelta > 0 ? "+" : ""}
                    {rack.airflowDelta.toFixed(1)} CFM
                  </div>
                </div>
              </div>

              {/* Historical Chart */}
              {rackHistory && rackHistory.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-200">Historical Trends</h4>

                  {/* Temperature Chart */}
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h5 className="text-sm font-medium mb-3 text-gray-300 flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Temperature History (Last 60s)
                    </h5>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={rackHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis
                            dataKey="timestamp"
                            stroke="#9CA3AF"
                            fontSize={10}
                            tickFormatter={(value) => new Date(value).toLocaleTimeString().slice(0, 5)}
                          />
                          <YAxis
                            stroke="#9CA3AF"
                            fontSize={10}
                            tickFormatter={(value) => `${convertTemp(value).toFixed(0)}°`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1F2937",
                              border: "1px solid #374151",
                              borderRadius: "8px",
                              color: "#F3F4F6",
                            }}
                            formatter={(value: number) => [
                              `${convertTemp(value).toFixed(1)}°${isCelsius ? "C" : "F"}`,
                              "Temperature",
                            ]}
                            labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                          />
                          <Line
                            type="monotone"
                            dataKey="temperature"
                            stroke="#F59E0B"
                            strokeWidth={2}
                            dot={false}
                            strokeDasharray={rack.status === "hot" ? "5 5" : "0"}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Humidity Chart */}
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h5 className="text-sm font-medium mb-3 text-gray-300 flex items-center gap-2">
                      <Droplets className="h-4 w-4" />
                      Humidity History (Last 60s)
                    </h5>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={rackHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis
                            dataKey="timestamp"
                            stroke="#9CA3AF"
                            fontSize={10}
                            tickFormatter={(value) => new Date(value).toLocaleTimeString().slice(0, 5)}
                          />
                          <YAxis stroke="#9CA3AF" fontSize={10} tickFormatter={(value) => `${value}%`} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1F2937",
                              border: "1px solid #374151",
                              borderRadius: "8px",
                              color: "#F3F4F6",
                            }}
                            formatter={(value: number) => [`${value.toFixed(1)}%`, "Humidity"]}
                            labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                          />
                          <Line type="monotone" dataKey="humidity" stroke="#06B6D4" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Indicators */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h5 className="text-sm font-medium mb-3 text-gray-300">Performance Indicators</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Total Overheat Events</span>
                    <span className="text-sm font-medium text-orange-400">{rackStats?.overheatEvents || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Energy Usage</span>
                    <span className="text-sm font-medium">
                      {(rack.temperature * 0.8 + rack.humidity * 0.2).toFixed(1)} kW
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Last Maintenance</span>
                    <span className="text-sm font-medium text-gray-300">
                      {rackStats ? formatTimeAgo(rackStats.lastMaintenance) : "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Predicted Maintenance</span>
                    <span
                      className={`text-sm font-medium ${
                        rackStats?.maintenancePrediction.status === "critical"
                          ? "text-red-400"
                          : rackStats?.maintenancePrediction.status === "warning"
                            ? "text-yellow-400"
                            : "text-green-400"
                      }`}
                    >
                      {rackStats?.maintenancePrediction.days || 28} days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
