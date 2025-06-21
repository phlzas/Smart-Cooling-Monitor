"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Zap, DollarSign, TrendingDown } from "lucide-react"
import { RateConfigModal } from "./rate-config-modal"

interface EnergyCostFooterProps {
  sessionKwh: number
  baselineKwh: number
  electricityRate: number
  onRateChange: (rate: number) => void
  totalSavings: number
}

export function EnergyCostFooter({
  sessionKwh,
  baselineKwh,
  electricityRate,
  onRateChange,
  totalSavings,
}: EnergyCostFooterProps) {
  const [showRateModal, setShowRateModal] = useState(false)

  const sessionCost = sessionKwh * electricityRate
  const baselineCost = baselineKwh * electricityRate
  const costSaved = baselineCost - sessionCost

  return (
    <>
      <div className="bg-gray-800/80 backdrop-blur-sm border-t border-gray-700 px-4 py-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          {/* Energy Metrics */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-gray-400">Session:</span>
              <span className="font-mono font-medium">{sessionKwh.toFixed(3)} kWh</span>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-gray-400">Cost:</span>
              <span className="font-mono font-medium">${sessionCost.toFixed(3)}</span>
            </div>

            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-400" />
              <span className="text-gray-400">Saved:</span>
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 font-mono">
                ${costSaved.toFixed(3)}
              </Badge>
            </div>
          </div>

          {/* Rate Configuration */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">@ ${electricityRate.toFixed(3)}/kWh</span>
            <Button variant="ghost" size="sm" onClick={() => setShowRateModal(true)} className="h-6 w-6 p-0">
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Efficiency Indicator */}
        <div className="mt-2 flex items-center justify-center">
          <div className="text-xs text-gray-400">
            Efficiency: {sessionKwh > 0 ? ((1 - sessionKwh / baselineKwh) * 100).toFixed(1) : 0}% better than baseline
          </div>
        </div>
      </div>

      <RateConfigModal
        isOpen={showRateModal}
        onClose={() => setShowRateModal(false)}
        currentRate={electricityRate}
        onRateChange={onRateChange}
      />
    </>
  )
}
