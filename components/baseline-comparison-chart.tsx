"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Zap, TrendingDown } from "lucide-react";

interface EnergyData {
  timestamp: string;
  actualKwh: number;
  baselineKwh: number;
  savingsKwh: number;
}

interface BaselineComparisonChartProps {
  data: EnergyData[];
  electricityRate: number;
}

export function BaselineComparisonChart({
  data,
  electricityRate,
}: BaselineComparisonChartProps) {
  const totalSavings =
    data.length > 0 ? data[data.length - 1].savingsKwh * electricityRate : 0;

  if (data.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-400">
            No energy data available.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Energy Consumption vs Baseline
          </CardTitle>
          <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
            <TrendingDown className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-green-300">
              ${totalSavings.toFixed(2)} saved
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
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
                tickFormatter={(value) => `${value.toFixed(3)} kWh`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F3F4F6",
                }}
                labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(4)} kWh`,
                  name === "actualKwh"
                    ? "Smart Cooling"
                    : name === "baselineKwh"
                    ? "Baseline (100%)"
                    : "Savings",
                ]}
              />
              <Line
                type="monotone"
                dataKey="baselineKwh"
                stroke="#EF4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Baseline (100%)"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="actualKwh"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Smart Cooling"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="savingsKwh"
                stroke="#10B981"
                strokeWidth={2}
                name="Energy Saved"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-500/10 rounded-lg p-3">
            <div className="text-xs text-gray-400">Smart Cooling</div>
            <div className="text-lg font-mono font-bold text-blue-400">
              {data.length > 0
                ? data[data.length - 1].actualKwh.toFixed(3)
                : "0.000"}{" "}
              kWh
            </div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-3">
            <div className="text-xs text-gray-400">Baseline (100%)</div>
            <div className="text-lg font-mono font-bold text-red-400">
              {data.length > 0
                ? data[data.length - 1].baselineKwh.toFixed(3)
                : "0.000"}{" "}
              kWh
            </div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-3">
            <div className="text-xs text-gray-400">Energy Saved</div>
            <div className="text-lg font-mono font-bold text-green-400">
              {data.length > 0
                ? data[data.length - 1].savingsKwh.toFixed(3)
                : "0.000"}{" "}
              kWh
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
