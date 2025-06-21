"use client"

import { useState } from "react"
import { Zap } from "lucide-react"

interface PowerUsageBadgeProps {
  powerWatts: number
  fanSpeed: number
  temperature: number
  ambientTemp?: number
  className?: string
}

export function PowerUsageBadge({
  powerWatts,
  fanSpeed,
  temperature,
  ambientTemp = 20,
  className = "",
}: PowerUsageBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const basePower = 500 // Base fan power at 100%
  const tempMultiplier = 1 + (temperature - ambientTemp) / 100

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Zap className="h-3 w-3 text-yellow-400" />
        <span className="font-mono">{powerWatts.toFixed(0)}W</span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-xs opacity-100 transition-all duration-200 z-20 whitespace-nowrap shadow-lg">
          <div className="space-y-1">
            <div>Base Power: {basePower}W</div>
            <div>Fan Speed: {fanSpeed.toFixed(0)}%</div>
            <div>Temp Multiplier: {tempMultiplier.toFixed(2)}x</div>
            <div className="border-t border-gray-600 pt-1">
              <strong>Total: {powerWatts.toFixed(0)}W</strong>
            </div>
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
        </div>
      )}
    </div>
  )
}
