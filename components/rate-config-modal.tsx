"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, DollarSign } from "lucide-react";
import { useElectricityRate } from "@/context/ElectricityRateContext";

interface RateConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RateConfigModal({ isOpen, onClose }: RateConfigModalProps) {
  const { electricityRate, setElectricityRate, resetToEiaRate, isManual } =
    useElectricityRate();
  const [rate, setRate] = useState(electricityRate.toString());

  if (!isOpen) return null;

  const handleSave = () => {
    const numRate = Number.parseFloat(rate);
    if (!isNaN(numRate) && numRate > 0) {
      setElectricityRate(numRate, true);
      onClose();
    }
  };

  const presetRates = [
    { label: "Residential (US Average)", value: 0.13 },
    { label: "Commercial (US Average)", value: 0.11 },
    { label: "Industrial (US Average)", value: 0.07 },
    { label: "Data Center (Bulk)", value: 0.05 },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-gray-800 border-gray-600 w-full max-w-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              Electricity Rate
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rate">Rate ($ per kWh)</Label>
            <Input
              id="rate"
              type="number"
              step="0.001"
              min="0"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="0.100"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label>Common Rates</Label>
            <div className="grid grid-cols-1 gap-2">
              {presetRates.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setRate(preset.value.toString())}
                  className="justify-between text-left"
                >
                  <span className="text-xs">{preset.label}</span>
                  <span className="font-mono">${preset.value.toFixed(3)}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Rate
            </Button>
            {!isManual && (
              <Button
                variant="secondary"
                onClick={resetToEiaRate}
                className="flex-1"
              >
                Reset to EIA Rate
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
