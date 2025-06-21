"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3, Home, History, Menu } from "lucide-react"

interface NavigationProps {
  currentPage: "dashboard" | "metrics" | "history"
  onPageChange: (page: "dashboard" | "metrics" | "history") => void
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: Home },
    { id: "metrics" as const, label: "Metrics", icon: BarChart3 },
    { id: "history" as const, label: "History", icon: History },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={currentPage === item.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageChange(item.id)}
            className="flex items-center gap-2"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu className="h-5 w-5" />
        </Button>

        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-gray-800 border-b border-gray-700 z-50">
            <div className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    onPageChange(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-2 justify-start"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
