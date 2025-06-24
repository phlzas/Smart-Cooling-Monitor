"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { fetchLatestEiaRates } from "@/lib/Api/eiaApi";
import type { EIASectorData } from "@/lib/Api/eiaApi";

interface ElectricityRateContextType {
  rates: Record<"RES" | "COM", EIASectorData | null>;
  rateType: "RES" | "COM";
  setRateType: (type: "RES" | "COM") => void;
  electricityRate: number;
  setElectricityRate: (rate: number, manual?: boolean) => void;
  isManual: boolean;
  resetToEiaRate: () => void;
  loading: boolean;
}

const ElectricityRateContext = createContext<
  ElectricityRateContextType | undefined
>(undefined);

export function ElectricityRateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [rates, setRates] = useState<
    Record<"RES" | "COM", EIASectorData | null>
  >({ RES: null, COM: null });
  const [rateType, setRateType] = useState<"RES" | "COM">("RES");
  const [electricityRate, setElectricityRateState] = useState<number>(0.1);
  const [isManual, setIsManual] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch EIA rates on mount
  useEffect(() => {
    setLoading(true);
    fetchLatestEiaRates()
      .then((data) => {
        setRates(data);
        setLoading(false);
      })
      .catch(() => {
        setRates({ RES: null, COM: null }); // Ensure rates are always set
        setLoading(false);
      });
  }, []);

  // Reactively update electricityRate from EIA unless manually overridden
  useEffect(() => {
    if (isManual) return;
    if (loading) return; // Don't update until loading is done
    // Always use rates[rateType] if available
    const selected = rates[rateType]?.price;
    let newRate: number | undefined = undefined;
    if (typeof selected === "number") {
      newRate = selected / 100;
    } else {
      // Fallback: try the other rate
      const altType = rateType === "RES" ? "COM" : "RES";
      const alt = rates[altType]?.price;
      if (typeof alt === "number") {
        newRate = alt / 100;
      } else {
        newRate = 0.1; // Only fallback if both are missing
      }
    }
    setElectricityRateState(newRate);
    // Debug log
    // eslint-disable-next-line no-console
    console.log({ rateType, electricityRate: newRate, rates });
  }, [rates, rateType, isManual, loading]);

  // Manual override
  const setElectricityRate = useCallback((rate: number, manual = true) => {
    setElectricityRateState(rate);
    setIsManual(manual);
  }, []);

  // Ensure dropdown always resets manual override
  const setRateTypeAndResetManual = useCallback((type: "RES" | "COM") => {
    setRateType(type);
    setIsManual(false);
  }, []);

  // Reset to EIA rate (disable manual override)
  const resetToEiaRate = useCallback(() => {
    setIsManual(false);
  }, []);

  return (
    <ElectricityRateContext.Provider
      value={{
        rates,
        rateType,
        setRateType: setRateTypeAndResetManual,
        electricityRate,
        setElectricityRate,
        isManual,
        resetToEiaRate,
        loading,
      }}
    >
      {children}
    </ElectricityRateContext.Provider>
  );
}

export function useElectricityRate() {
  const ctx = useContext(ElectricityRateContext);
  if (!ctx)
    throw new Error(
      "useElectricityRate must be used within ElectricityRateProvider"
    );
  return ctx;
}
