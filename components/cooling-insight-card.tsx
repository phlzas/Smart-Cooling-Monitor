"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Zap, Bot, Settings } from "lucide-react"

interface CoolingInsightCardProps {
  autoModeEnabled: boolean
  onAutoModeToggle: (enabled: boolean) => void
  automatedActions: Array<{
    id: string
    timestamp: number
    action: string
    rackName: string
    result: string
  }>
  onClearLog: () => void
}

export function CoolingInsightCard({
  autoModeEnabled,
  onAutoModeToggle,
  automatedActions,
  onClearLog,
}: CoolingInsightCardProps) {
  const recentActions = automatedActions.slice(-5)

  return (
    <div className="space-y-4">
      {/* Auto-Adaptive Control */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="h-4 w-4 text-purple-400" />
            Auto-Adaptive Cooling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Automated Response</p>
              <p className="text-xs text-gray-400">AI handles cooling adjustments</p>
            </div>
            <Switch checked={autoModeEnabled} onCheckedChange={onAutoModeToggle} />
          </div>
          {autoModeEnabled && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <Zap className="h-4 w-4" />
                <span>Auto-mode active</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                System will automatically increase fan flow for overheating racks
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Automated Actions Log */}
      {recentActions.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-cyan-400" />
                Recent Auto Actions
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClearLog} className="text-xs h-6">
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 space-y-2">
              {recentActions.map((action) => (
                <div key={action.id} className="bg-gray-700/30 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm font-medium">{action.rackName}</span>
                    <span className="text-xs text-gray-400">{new Date(action.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-gray-300 mb-1">{action.action}</p>
                  <p className="text-xs text-green-400">{action.result}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
