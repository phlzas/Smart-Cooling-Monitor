import { useState } from "react";

export function useCoolingMonitorControls() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationIntensity, setSimulationIntensity] = useState([50]);
  const [isCelsius, setIsCelsius] = useState(true);
  const [autoModeEnabled, setAutoModeEnabled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "metrics" | "history"
  >("dashboard");

  return {
    isSimulating,
    setIsSimulating,
    simulationIntensity,
    setSimulationIntensity,
    isCelsius,
    setIsCelsius,
    autoModeEnabled,
    setAutoModeEnabled,
    sidebarOpen,
    setSidebarOpen,
    showCharts,
    setShowCharts,
    currentPage,
    setCurrentPage,
  };
}
