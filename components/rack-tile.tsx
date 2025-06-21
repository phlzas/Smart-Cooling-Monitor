"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Thermometer, Droplets, Info, Zap } from "lucide-react"
import { StatusIndicator } from "./status-indicator"

interface RackData {
  id: string
  name: string
  temperature: number
  humidity: number
  status: "cool" | "warm" | "hot"
  lastAlert?: number
  uptime: number
  airflowDelta: number
  powerWatts?: number
  fanSpeed?: number
}

interface RackTileProps {
  rack: RackData
  isCelsius: boolean
  onClick: (rack: RackData) => void
}

export function RackTile({ rack, isCelsius, onClick }: RackTileProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const convertTemp = (temp: number) => {
    return isCelsius ? temp : (temp * 9) / 5 + 32
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "cool":
        return "border-green-500 bg-green-500/5"
      case "warm":
        return "border-amber-500 bg-amber-500/5"
      case "hot":
        return "border-red-500 bg-red-500/5"
      default:
        return "border-gray-600 bg-gray-800/50"
    }
  }

  return (
    <div className="relative">
      <Card
        className={`${getStatusColor(rack.status)} border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg w-[140px] h-[140px] min-w-[140px] min-h-[140px] max-w-[140px] max-h-[140px] overflow-hidden ${
          rack.status === "hot" ? "animate-pulse" : ""
        }`}
        onClick={() => onClick(rack)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <CardContent className="p-3 h-full flex flex-col justify-between relative">
          {/* Status Indicator */}
          <div className="absolute top-2 right-2">
            <StatusIndicator status={rack.status} size="sm" />
          </div>

          {/* Rack Name */}
          <div className="text-xs font-semibold text-gray-200 truncate pr-6">{rack.name}</div>

          {/* Metrics */}
          <div className="space-y-2 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <Thermometer className="h-3 w-3 text-orange-400 flex-shrink-0" />
              <span className="text-sm font-mono font-medium text-white truncate">
                {convertTemp(rack.temperature).toFixed(1)}°{isCelsius ? "C" : "F"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Droplets className="h-3 w-3 text-blue-400 flex-shrink-0" />
              <span className="text-xs font-mono text-gray-300 truncate">{rack.humidity.toFixed(0)}%</span>
            </div>

            {/* Power Usage */}
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3 text-yellow-400 flex-shrink-0" />
              <span className="text-xs font-mono text-gray-300 truncate">{rack.powerWatts?.toFixed(0) || 0}W</span>
            </div>
          </div>

          {/* Mobile Info Button */}
          <button
            className="md:hidden absolute bottom-1 right-1 p-1 rounded-md bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setShowTooltip(!showTooltip)
            }}
          >
            <Info className="h-3 w-3 text-gray-300" />
          </button>

          {/* Alert Indicator */}
          {rack.status === "hot" && (
            <div className="absolute -top-1 -right-1">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
              <div className="absolute top-0 w-3 h-3 bg-red-500 rounded-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs opacity-100 transition-all duration-200 z-20 whitespace-nowrap shadow-xl">
          <div className="space-y-1 text-gray-200">
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Uptime:</span>
              <span className="font-mono">{rack.uptime.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Airflow:</span>
              <span className="font-mono">
                {rack.airflowDelta > 0 ? "+" : ""}
                {rack.airflowDelta.toFixed(1)} CFM
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Power:</span>
              <span className="font-mono">{rack.powerWatts?.toFixed(0) || 0}W</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Status:</span>
              <span className="font-medium capitalize">{rack.status}</span>
            </div>
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  )
}
