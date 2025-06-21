"use client"

import { Badge } from "@/components/ui/badge"
import { Zap, DollarSign, TrendingDown, Activity } from "lucide-react"

interface ProfessionalFooterProps {
  sessionKwh: number
  baselineKwh: number
  electricityRate: number
  totalEvents: number
  isSimulating: boolean
}

export function ProfessionalFooter({
  sessionKwh,
  baselineKwh,
  electricityRate,
  totalEvents,
  isSimulating,
}: ProfessionalFooterProps) {
  const sessionCost = sessionKwh * electricityRate
  const baselineCost = baselineKwh * electricityRate
  const costSaved = baselineCost - sessionCost
  const energySaved = baselineKwh - sessionKwh
  const efficiencyPercent = baselineKwh > 0 ? (energySaved / baselineKwh) * 100 : 0

  return (
    <footer className="bg-gray-800 border-t border-gray-700 px-6 py-3 sticky bottom-0 z-30 shadow-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        {/* Energy Metrics */}
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-gray-400 font-medium">Energy:</span>
            <span className="font-mono font-bold text-white">{sessionKwh.toFixed(3)} kWh</span>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-400" />
            <span className="text-gray-400 font-medium">Cost:</span>
            <span className="font-mono font-bold text-white">${sessionCost.toFixed(3)}</span>
          </div>

          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-blue-400" />
            <span className="text-gray-400 font-medium">Saved:</span>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 font-mono">
              ${costSaved.toFixed(3)}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-400" />
            <span className="text-gray-400 font-medium">Events:</span>
            <span className="font-mono font-bold text-white">{totalEvents}</span>
          </div>
        </div>

        {/* Efficiency Indicator */}
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-400">
            Efficiency: <span className="font-mono font-bold text-white">{efficiencyPercent.toFixed(1)}%</span> vs
            baseline
          </div>
          <div className="text-xs text-gray-500">@ ${electricityRate.toFixed(3)}/kWh</div>
        </div>
      </div>
    </footer>
  )
}
