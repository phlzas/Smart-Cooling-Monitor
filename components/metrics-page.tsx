"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Thermometer,
  Droplets,
  Wind,
  Download,
  Activity,
  Zap,
  DollarSign,
} from "lucide-react";
import { RoomSummary } from "./room-summary";
import { BaselineComparisonChart } from "./baseline-comparison-chart";
import { Badge } from "@/components/ui/badge";
import { fetchLatestEiaRates } from "@/lib/Api/eiaApi";
import type { EIASectorData } from "@/lib/Api/eiaApi";

interface RackData {
  id: string;
  name: string;
  temperature: number;
  humidity: number;
  status: "cool" | "warm" | "hot";
  airflowDelta: number;
}

interface ChartData {
  timestamp: string;
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  avgHumidity: number;
  avgAirflow: number;
}

interface MetricsPageProps {
  racks: RackData[];
  chartData: ChartData[];
  rackHistory: Record<
    string,
    Array<{ timestamp: string; temperature: number; humidity: number }>
  >;
  simulationStartTime: number;
  isCelsius: boolean;
  onExportCSV: () => void;
  energyData: Array<{
    timestamp: string;
    actualKwh: number;
    baselineKwh: number;
    savingsKwh: number;
  }>;
  electricityRate: number;
  setElectricityRate: (rate: number) => void; // <-- Add this line
  eventLog: Array<any>;
  onExportEventCSV: () => void;
}

export function MetricsPage({
  racks,
  chartData,
  rackHistory,
  simulationStartTime,
  isCelsius,
  onExportCSV,
  energyData,
  electricityRate,
  setElectricityRate,
  eventLog,
  onExportEventCSV,
}: MetricsPageProps) {
  const [selectedInterval, setSelectedInterval] = useState("all");
  const [rates, setRates] = useState<
    Record<"RES" | "COM", EIASectorData | null>
  >({
    RES: null,
    COM: null,
  });
  const [rateType, setRateType] = useState<"RES" | "COM">("RES");

  // Fetch EIA rates
  useEffect(() => {
    fetchLatestEiaRates().then(setRates);
  }, []);

  // Calculate elapsed time and available intervals
  const elapsedMinutes = (Date.now() - simulationStartTime) / (1000 * 60);
  const elapsedHours = elapsedMinutes / 60;

  const availableIntervals = useMemo(() => {
    const intervals = [{ value: "all", label: "All Data" }];

    if (elapsedMinutes >= 5) {
      intervals.push({ value: "5m", label: "Last 5 minutes" });
    }
    if (elapsedMinutes >= 10) {
      intervals.push({ value: "10m", label: "Last 10 minutes" });
    }
    return intervals;
  }, [elapsedMinutes, elapsedHours]);

  // Filter chart data based on selected interval
  const filteredChartData = useMemo(() => {
    if (selectedInterval === "all") return chartData;

    const now = Date.now();
    let cutoffTime = now;

    switch (selectedInterval) {
      case "5m":
        cutoffTime = now - 5 * 60 * 1000;
        break;
      case "10m":
        cutoffTime = now - 10 * 60 * 1000;
        break;
    }

    return chartData.filter(
      (data) => new Date(data.timestamp).getTime() >= cutoffTime
    );
  }, [chartData, selectedInterval]);

  const convertTemp = (temp: number) => {
    return isCelsius ? temp : (temp * 9) / 5 + 32;
  };

  // Mock maintenance predictions for insights
  const maintenancePredictions = useMemo(() => {
    const predictions: Record<string, { days: number; status: string }> = {};
    racks.forEach((rack) => {
      const hotCount =
        rack.status === "hot" ? 3 : rack.status === "warm" ? 1 : 0;
      predictions[rack.id] = {
        days: Math.max(1, 28 - hotCount * 5),
        status: hotCount >= 3 ? "critical" : hotCount >= 1 ? "warning" : "good",
      };
    });
    return predictions;
  }, [racks]);

  const selectedRate = rates[rateType] ?? electricityRate;

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Room Summary */}
      <RoomSummary racks={racks} isCelsius={isCelsius} />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Time Range:</span>
            <Select
              value={selectedInterval}
              onValueChange={setSelectedInterval}
            >
              <SelectTrigger className="w-40 bg-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableIntervals.map((interval) => (
                  <SelectItem key={interval.value} value={interval.value}>
                    {interval.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-gray-500">
            {elapsedMinutes < 60
              ? `${Math.floor(elapsedMinutes)}m elapsed`
              : `${Math.floor(elapsedHours)}h ${Math.floor(
                  elapsedMinutes % 60
                )}m elapsed`}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Rate Type:</span>
            <Select
              value={rateType}
              onValueChange={(value) => {
                setRateType(value as "RES" | "COM");
                // If EIA rate is available, update the parent state
                const selected = rates[value as "RES" | "COM"];
                if (selected && typeof selected.price === "number") {
                  setElectricityRate(selected.price / 100);
                }
              }}
            >
              <SelectTrigger className="w-48 bg-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RES">
                  Residential{" "}
                  {rates.RES && `($${(rates.RES.price / 100).toFixed(4)}/kWh)`}
                </SelectItem>
                <SelectItem value="COM">
                  Commercial{" "}
                  {rates.COM && `($${(rates.COM.price / 100).toFixed(4)}/kWh)`}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-gray-500">
            Current Rate: $
            {typeof selectedRate === "number"
              ? selectedRate.toFixed(4)
              : (selectedRate.price / 100).toFixed(4)}
            / kWh
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Charts Section */}
        <div className="space-y-6">
          {/* Temperature Chart */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-orange-400" />
                Temperature Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="timestamp"
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleTimeString().slice(0, 5)
                      }
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) =>
                        `${convertTemp(value).toFixed(0)}°`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#F3F4F6",
                      }}
                      labelFormatter={(value) =>
                        new Date(value).toLocaleTimeString()
                      }
                      formatter={(value: number, name: string) => [
                        `${convertTemp(value).toFixed(1)}°${
                          isCelsius ? "C" : "F"
                        }`,
                        name === "avgTemp"
                          ? "Average"
                          : name === "maxTemp"
                          ? "Maximum"
                          : "Minimum",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="maxTemp"
                      stackId="1"
                      stroke="#EF4444"
                      fill="#EF4444"
                      fillOpacity={0.1}
                    />
                    <Area
                      type="monotone"
                      dataKey="avgTemp"
                      stackId="2"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                    <Line
                      type="monotone"
                      dataKey="minTemp"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Energy Comparison Chart */}
          <BaselineComparisonChart
            data={energyData}
            electricityRate={electricityRate}
          />

          {/* Secondary Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Humidity Chart */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-400" />
                  Humidity Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="timestamp"
                        stroke="#9CA3AF"
                        fontSize={10}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleTimeString().slice(0, 5)
                        }
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={10}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F3F4F6",
                        }}
                        formatter={(value: number) => [
                          `${value.toFixed(1)}%`,
                          "Humidity",
                        ]}
                        labelFormatter={(value) =>
                          new Date(value).toLocaleTimeString()
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="avgHumidity"
                        stroke="#06B6D4"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Airflow Chart */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wind className="h-4 w-4 text-cyan-400" />
                  Airflow Delta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="timestamp"
                        stroke="#9CA3AF"
                        fontSize={10}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleTimeString().slice(0, 5)
                        }
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={10}
                        tickFormatter={(value) => `${value} CFM`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F3F4F6",
                        }}
                        formatter={(value: number) => [
                          `${value.toFixed(1)} CFM`,
                          "Airflow",
                        ]}
                        labelFormatter={(value) =>
                          new Date(value).toLocaleTimeString()
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="avgAirflow"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Event Log Section - Dedicated component */}
      <div className="mt-8">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-400" />
                Event Log ({eventLog.length} events)
              </CardTitle>
              <Button
                onClick={onExportEventCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Event CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {eventLog.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No events logged yet</p>
                  <p className="text-xs">
                    System monitoring will generate events automatically
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {eventLog
                    .slice(-20)
                    .reverse()
                    .map((event) => (
                      <div
                        key={event.id}
                        className="bg-gray-700/50 rounded-lg p-4 border-l-4 border-blue-500"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="text-xs bg-blue-500/20 text-blue-300"
                            >
                              {event.eventType}
                            </Badge>
                            <span className="text-sm font-semibold text-white">
                              {event.rackName}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 font-mono">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-gray-400">Cause:</span>{" "}
                            <span className="text-gray-200 ml-2">
                              {event.cause}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Action:</span>{" "}
                            <span className="text-gray-200 ml-2">
                              {event.actionTaken}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Outcome:</span>{" "}
                            <span className="text-gray-200 ml-2">
                              {event.outcome}
                            </span>
                          </div>

                          {(event.energyDelta > 0 || event.costDelta > 0) && (
                            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-600">
                              {event.energyDelta > 0 && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Zap className="h-3 w-3 text-yellow-400" />
                                  <span className="text-gray-400">Energy:</span>
                                  <span className="text-white font-mono">
                                    {event.energyDelta.toFixed(4)} kWh
                                  </span>
                                </div>
                              )}
                              {event.costDelta > 0 && (
                                <div className="flex items-center gap-1 text-xs">
                                  <DollarSign className="h-3 w-3 text-green-400" />
                                  <span className="text-gray-400">Cost:</span>
                                  <span className="text-white font-mono">
                                    ${event.costDelta.toFixed(3)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
