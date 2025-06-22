import { useState } from "react";
import type { RackData } from "@/app/page";

export function useRackData() {
  const [racks, setRacks] = useState<RackData[]>([]);
  const [selectedRack, setSelectedRack] = useState<RackData | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [rackHistory, setRackHistory] = useState<any>({});
  const [automatedActions, setAutomatedActions] = useState<any[]>([]);
  const [aiMessages, setAIMessages] = useState<any[]>([]);

  return {
    racks,
    setRacks,
    selectedRack,
    setSelectedRack,
    alerts,
    setAlerts,
    chartData,
    setChartData,
    rackHistory,
    setRackHistory,
    automatedActions,
    setAutomatedActions,
    aiMessages,
    setAIMessages,
  };
}
