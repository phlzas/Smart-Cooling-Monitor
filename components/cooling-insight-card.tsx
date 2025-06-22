"use client";

/*
  Overheat Tracking & Diagnostics:
  - We use a local useRef to track overheat events per rack (no backend).
  - When a rack's temperature crosses above 28°C from below, we call trackOverheatEvent(rackId, temp).
  - Diagnostics panel counts recent overheats (last 72h), fan boosts, and adjusts maintenance/efficiency.
  - This avoids hydration issues and is performant for client-only simulation.
*/

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Zap, Bot, Settings } from "lucide-react";

export interface CoolingInsightCardProps {
  autoModeEnabled: boolean;
  onAutoModeToggle: (enabled: boolean) => void;
  systemEfficiency: number;
  automatedActions: Array<{
    id: string;
    timestamp: number;
    action: string;
    rackName: string;
    result: string;
    rackId: string;
    temp?: number;
  }>;
  onClearLog: () => void;
  racks: Array<{ id: string; temperature: number }>;
  energyData: Array<{
    timestamp: string;
    actualKwh: number;
    baselineKwh: number;
    savingsKwh: number;
  }>;
}

export function CoolingInsightCard({
  autoModeEnabled,
  onAutoModeToggle,
  automatedActions,
  onClearLog,
  racks,
}: CoolingInsightCardProps) {
  // Track overheats per rack: { [rackId]: Array<{timestamp, temp}> }
  const overheatEventsRef = useRef<
    Record<string, Array<{ timestamp: number; temp: number }>>
  >({});
  // Track last temp per rack to detect crossing
  const lastTempsRef = useRef<Record<string, number>>({});

  // Track fan boosts per rack (if you want to count them)
  const fanBoostsRef = useRef<Record<string, Array<{ timestamp: number }>>>({});

  // On every rack update, check for overheat crossing and track
  useEffect(() => {
    racks.forEach((rack) => {
      const prev = lastTempsRef.current[rack.id];
      if (prev !== undefined && prev <= 28 && rack.temperature > 28) {
        trackOverheatEvent(rack.id, rack.temperature);
      }
      lastTempsRef.current[rack.id] = rack.temperature;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    JSON.stringify(
      racks.map((r) => ({ id: r.id, temperature: r.temperature }))
    ),
  ]); // Only rerun if temps change

  // Function to track an overheat event
  function trackOverheatEvent(rackId: string, temp: number) {
    if (!overheatEventsRef.current[rackId])
      overheatEventsRef.current[rackId] = [];
    overheatEventsRef.current[rackId].push({ timestamp: Date.now(), temp });
    // Optionally: log or trigger UI update
  }

  // Function to track a fan boost (if auto-mode triggers it)
  function trackFanBoost(rackId: string) {
    if (!fanBoostsRef.current[rackId]) fanBoostsRef.current[rackId] = [];
    fanBoostsRef.current[rackId].push({ timestamp: Date.now() });
  }

  // Diagnostics: count events in last 72h
  const now = Date.now();
  const HOURS_72 = 72 * 60 * 60 * 1000;

  function getRecentOverheats(rackId: string) {
    return (overheatEventsRef.current[rackId] || []).filter(
      (e) => now - e.timestamp < HOURS_72
    );
  }
  function getRecentFanBoosts(rackId: string) {
    return (fanBoostsRef.current[rackId] || []).filter(
      (e) => now - e.timestamp < HOURS_72
    );
  }

  // Example: diagnostics for all racks (could be per rack panel)
  const diagnostics = racks.map((rack) => {
    const overheats = getRecentOverheats(rack.id);
    const fanBoosts = getRecentFanBoosts(rack.id);
    const maintenanceDaysLost = overheats.length * 3;
    const coolingEfficiency = 100 - Math.min(overheats.length * 5, 50); // lose 5% per overheat, max -50%
    return {
      rackId: rack.id,
      overheatCount: overheats.length,
      fanBoostCount: fanBoosts.length,
      maintenanceDaysLost,
      coolingEfficiency,
    };
  });

  // Hydration-safe: Only render after mount to avoid SSR/client mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const recentActions = automatedActions.slice(-5);

  // New code for recent overheats in last 72h
  const nowInMillis = new Date().getTime();
  const seventyTwoHoursAgo = nowInMillis - 72 * 60 * 60 * 1000;
  const recentOverheats = racks.flatMap((rack) =>
    getRecentOverheats(rack.id)
  ).length;

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
              <p className="text-xs text-gray-400">
                AI handles cooling adjustments
              </p>
            </div>
            <Switch
              checked={autoModeEnabled}
              onCheckedChange={onAutoModeToggle}
            />
          </div>
          {autoModeEnabled && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <Zap className="h-4 w-4" />
                <span>Auto-mode active</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                System will automatically increase fan flow for overheating
                racks
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Automated Actions Log */}
      {mounted && recentActions.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-cyan-400" />
                Recent Auto Actions
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearLog}
                className="text-xs h-6"
              >
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 space-y-2">
              {recentActions.map((action) => (
                <div key={action.id} className="bg-gray-700/30 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm font-medium">
                      {action.rackName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(action.timestamp).toLocaleTimeString()}
                    </span>
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
  );
}
