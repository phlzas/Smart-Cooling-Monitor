import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function EfficiencyVisualizer({
  efficiencyMetrics,
  electricityRate,
}: {
  efficiencyMetrics: {
    current: number;
    potential: number;
    savings: number;
    trend: "improving" | "declining" | "stable";
  };
  electricityRate: number;
}) {
  return (
    <Card className="bg-gray-800 border-gray-700 p-4 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">System Cooling Efficiency</span>
          <span
            className={`text-sm font-medium ${
              efficiencyMetrics.trend === "improving"
                ? "text-green-500"
                : efficiencyMetrics.trend === "declining"
                ? "text-red-500"
                : "text-blue-500"
            }`}
          >
            {efficiencyMetrics.trend === "improving"
              ? "↑ Improving"
              : efficiencyMetrics.trend === "declining"
              ? "↓ Declining"
              : "→ Stable"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Current Efficiency</span>
              <span className="font-mono">
                {efficiencyMetrics.current.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                style={{ width: `${efficiencyMetrics.current}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Potential Efficiency</span>
              <span className="font-mono">
                {efficiencyMetrics.potential.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                style={{ width: `${efficiencyMetrics.potential}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-gray-750 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Energy Saved</div>
              <div className="text-xl font-bold text-green-400">
                {efficiencyMetrics.savings.toFixed(2)} kWh
              </div>
            </div>
            <div className="bg-gray-750 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Cost Savings</div>
              <div className="text-xl font-bold text-green-400">
                ${(efficiencyMetrics.savings * electricityRate).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
