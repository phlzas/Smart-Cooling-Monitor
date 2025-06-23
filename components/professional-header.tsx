"use client";

import { Badge } from "@/components/ui/badge";
import { Logo } from "./logo";
import { Navigation } from "./navigation";
import { Activity, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchLatestEiaRates, EIASectorData } from "@/lib/Api/eiaApi";

interface ProfessionalHeaderProps {
  currentPage: "dashboard" | "metrics" | "history";
  onPageChange: (page: "dashboard" | "metrics" | "history") => void;
  activeAlerts: number;
  totalEvents: number;
  isSimulating: boolean;
}

export function ProfessionalHeader({
  currentPage,
  onPageChange,
  activeAlerts,
  totalEvents,
  isSimulating,
}: ProfessionalHeaderProps) {
  const [eiaData, setEiaData] = useState<Record<
    "RES" | "COM",
    EIASectorData | null
  > | null>(null);

  useEffect(() => {
    fetchLatestEiaRates().then((data) => setEiaData(data));
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 sticky top-0 z-30 shadow-lg">
      <div className="flex items-center justify-between max-w-full">
        <div className="flex items-center gap-6">
          <Logo />
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Navigation */}
          <Navigation currentPage={currentPage} onPageChange={onPageChange} />
          {/* System Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isSimulating ? "bg-green-500 animate-pulse" : "bg-gray-500"
                }`}
              />
              <span className="text-xs text-gray-400 font-medium">
                {isSimulating ? "LIVE" : "PAUSED"}
              </span>
            </div>

            <Badge
              variant={activeAlerts > 0 ? "destructive" : "secondary"}
              className={`text-xs font-medium ${
                activeAlerts > 0
                  ? "bg-red-500/20 text-red-300 border-red-500/30"
                  : "bg-gray-600/20 text-gray-300 border-gray-600/30"
              }`}
            >
              <Activity className="h-3 w-3 mr-1" />
              {activeAlerts} Alerts • {totalEvents} Events
            </Badge>

            <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400 font-mono">
              <Wifi className="h-4 w-4" />
              {mounted ? currentTime.toLocaleTimeString() : "--:--:--"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
