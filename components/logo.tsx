"use client"

import { Snowflake } from "lucide-react"

interface LogoProps {
  className?: string
  showText?: boolean
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
          <Snowflake className="h-5 w-5 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-extrabold text-white leading-none tracking-tight">Smart Cooling Monitor</span>
          <span className="text-xs font-medium text-gray-400 leading-none tracking-wide">Enterprise Edition</span>
        </div>
      )}
    </div>
  )
}
