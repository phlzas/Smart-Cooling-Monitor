"use client"

import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"

interface StatusIndicatorProps {
  status: "cool" | "warm" | "hot"
  size?: "sm" | "md" | "lg"
}

export function StatusIndicator({ status, size = "md" }: StatusIndicatorProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  const iconSize = sizeClasses[size]

  switch (status) {
    case "hot":
      return <AlertTriangle className={`${iconSize} text-red-500`} />
    case "warm":
      return <AlertCircle className={`${iconSize} text-amber-500`} />
    default:
      return <CheckCircle className={`${iconSize} text-green-500`} />
  }
}
