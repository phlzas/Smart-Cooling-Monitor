"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Thermometer, Droplets, Wind, AlertTriangle } from "lucide-react"

interface RackData {
  id: string
  name: string
  temperature: number
  humidity: number
  status: "cool" | "warm" | "hot"
  airflowDelta: number
}

interface RoomSummaryProps {
  racks: RackData[]
  isCelsius: boolean
}

export function RoomSummary({ racks, isCelsius }: RoomSummaryProps) {
  const convertTemp = (temp: number) => {
    return isCelsius ? temp : (temp * 9) / 5 + 32
  }

  // Calculate averages
  const avgTemp = racks.reduce((sum, rack) => sum + rack.temperature, 0) / racks.length
  const avgHumidity = racks.reduce((sum, rack) => sum + rack.humidity, 0) / racks.length
  const avgAirflow = racks.reduce((sum, rack) => sum + rack.airflowDelta, 0) / racks.length

  // Calculate room status
  const hotRacks = racks.filter((r) => r.status === "hot").length
  const hotPercentage = (hotRacks / racks.length) * 100

  const getRoomStatus = () => {
    if (hotPercentage > 50) return { status: "Critical", color: "bg-red-500", textColor: "text-red-100" }
    if (hotPercentage > 30) return { status: "Attention", color: "bg-amber-500", textColor: "text-amber-100" }
    return { status: "Optimal", color: "bg-green-500", textColor: "text-green-100" }
  }

  const roomStatus = getRoomStatus()

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Room Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Room Status:</span>
            </div>
            <Badge className={`${roomStatus.color} ${roomStatus.textColor} font-semibold`}>{roomStatus.status}</Badge>
            <span className="text-xs text-gray-400 font-mono">
              ({hotRacks}/{racks.length} racks overheating)
            </span>
          </div>

          {/* Metrics */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-3">
              <Thermometer className="h-4 w-4 text-orange-400" />
              <span className="text-gray-400">Avg Temp:</span>
              <span className="font-mono font-semibold text-white">
                {convertTemp(avgTemp).toFixed(1)}°{isCelsius ? "C" : "F"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Droplets className="h-4 w-4 text-blue-400" />
              <span className="text-gray-400">Avg Humidity:</span>
              <span className="font-mono font-semibold text-white">{avgHumidity.toFixed(1)}%</span>
            </div>

            <div className="flex items-center gap-3">
              <Wind className="h-4 w-4 text-cyan-400" />
              <span className="text-gray-400">Avg Airflow:</span>
              <span className="font-mono font-semibold text-white">
                {avgAirflow > 0 ? "+" : ""}
                {avgAirflow.toFixed(1)} CFM
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
