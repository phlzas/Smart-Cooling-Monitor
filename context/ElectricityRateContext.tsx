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
    const resRate = rates.RES?.price ? rates.RES.price / 100 : undefined;
    const comRate = rates.COM?.price ? rates.COM.price / 100 : undefined;
    let selectedRate: number | undefined = undefined;
    if (rateType === "RES" && resRate !== undefined) selectedRate = resRate;
    else if (rateType === "COM" && comRate !== undefined) selectedRate = comRate;
    else if (resRate !== undefined) selectedRate = resRate;
    else if (comRate !== undefined) selectedRate = comRate;
    setElectricityRateState(selectedRate ?? 0.1);
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
