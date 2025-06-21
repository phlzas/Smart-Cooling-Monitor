"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { History, Search, ArrowUpDown } from "lucide-react"

interface HistoryEvent {
  id: string
  timestamp: number
  rackId: string
  rackName: string
  eventType: "overheat" | "maintenance" | "auto_action" | "manual_action" | "alert"
  details: string
  severity?: "info" | "warning" | "critical"
}

interface HistoryLogProps {
  events: HistoryEvent[]
}

export function HistoryLog({ events }: HistoryLogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterRack, setFilterRack] = useState("all")
  const [sortField, setSortField] = useState<"timestamp" | "rackName" | "eventType">("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Get unique rack names for filter
  const uniqueRacks = useMemo(() => {
    const racks = [...new Set(events.map((e) => e.rackName))].sort()
    return racks
  }, [events])

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = events

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.rackName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.eventType.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((event) => event.eventType === filterType)
    }

    // Apply rack filter
    if (filterRack !== "all") {
      filtered = filtered.filter((event) => event.rackName === filterRack)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case "timestamp":
          aValue = a.timestamp
          bValue = b.timestamp
          break
        case "rackName":
          aValue = a.rackName
          bValue = b.rackName
          break
        case "eventType":
          aValue = a.eventType
          bValue = b.eventType
          break
        default:
          aValue = a.timestamp
          bValue = b.timestamp
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      } else {
        return sortDirection === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number)
      }
    })

    return filtered
  }, [events, searchTerm, filterType, filterRack, sortField, sortDirection])

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case "overheat":
        return "bg-red-500"
      case "maintenance":
        return "bg-yellow-500"
      case "auto_action":
        return "bg-blue-500"
      case "manual_action":
        return "bg-green-500"
      case "alert":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case "overheat":
        return "🔥"
      case "maintenance":
        return "🔧"
      case "auto_action":
        return "🤖"
      case "manual_action":
        return "👤"
      case "alert":
        return "⚠️"
      default:
        return "📝"
    }
  }

  const handleSort = (field: "timestamp" | "rackName" | "eventType") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-purple-400" />
            Event History ({filteredEvents.length} events)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="overheat">Overheat</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="auto_action">Auto Action</SelectItem>
                  <SelectItem value="manual_action">Manual Action</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterRack} onValueChange={setFilterRack}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Rack" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Racks</SelectItem>
                  {uniqueRacks.map((rack) => (
                    <SelectItem key={rack} value={rack}>
                      {rack}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full table-auto bg-gray-900/50 rounded-lg">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("timestamp")}
                        className="flex items-center gap-1 text-gray-300 hover:text-white"
                      >
                        Date/Time
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="text-left p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("rackName")}
                        className="flex items-center gap-1 text-gray-300 hover:text-white"
                      >
                        Rack
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="text-left p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("eventType")}
                        className="flex items-center gap-1 text-gray-300 hover:text-white"
                      >
                        Event Type
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="text-left p-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="p-3 text-sm">
                        <div>
                          <div className="font-medium">{new Date(event.timestamp).toLocaleDateString()}</div>
                          <div className="text-gray-400 text-xs">{new Date(event.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </td>
                      <td className="p-3 text-sm font-medium">{event.rackName}</td>
                      <td className="p-3">
                        <Badge className={`${getEventTypeColor(event.eventType)} text-white`}>
                          {getEventTypeIcon(event.eventType)} {event.eventType.replace("_", " ").toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-gray-300">{event.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="bg-gray-700/50 border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getEventTypeColor(event.eventType)} text-white text-xs`}>
                        {getEventTypeIcon(event.eventType)} {event.eventType.replace("_", " ").toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium">{event.rackName}</span>
                    </div>
                    <div className="text-xs text-gray-400 text-right">
                      <div>{new Date(event.timestamp).toLocaleDateString()}</div>
                      <div>{new Date(event.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">{event.details}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No events found</p>
              <p className="text-xs">Try adjusting your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
