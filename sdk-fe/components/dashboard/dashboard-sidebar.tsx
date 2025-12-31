"use client"

import { useRouter } from "next/navigation"
import { LayoutDashboard, BarChart3, Settings, X, Shield, BookOpen, Boxes, Cpu, Puzzle } from "lucide-react"

interface DashboardSidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  activeTab: string
  setActiveTab: (tab: "overview" | "admin" | "docs" | "analytics" | "endpoints" | "components" | "settings" | "mcp" | "x402") => void
  isAdmin: boolean
  onTabChange?: (tab: string) => void
}

export function DashboardSidebar({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  isAdmin,
  onTabChange,
}: DashboardSidebarProps) {
  const router = useRouter()

  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", id: "overview" as const },
    ...(isAdmin ? [{ icon: BarChart3, label: "Analytics", id: "analytics" as const }] : []),
    { icon: Puzzle, label: "Components", id: "x402" as const },
    { icon: Boxes, label: "Agent Kit", id: "components" as const },
    { icon: Cpu, label: "MCP Server", id: "mcp" as const },
    { icon: BookOpen, label: "Docs", id: "docs" as const },
    ...(isAdmin ? [{ icon: Shield, label: "Admin", id: "admin" as const }] : []),
    { icon: Settings, label: "Settings", id: "settings" as const },
  ]

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId as "overview" | "admin" | "docs" | "analytics" | "endpoints" | "components" | "settings" | "mcp" | "x402")
    onTabChange?.(tabId)
  }

  return (
    <aside
      className={`flex flex-col border-r border-foreground/10 bg-foreground/5 transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-0"
      } overflow-hidden`}
    >
      <div className="flex h-16 items-center justify-between border-b border-foreground/10 px-6">
        {sidebarOpen && (
          <>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden">
                <img src="/X402.png" alt="x402" className="h-full w-full object-contain" />
              </div>
              <span className="font-sans text-sm font-semibold text-foreground">Mantle DevKit</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-foreground/60 transition-colors hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {sidebarOpen && (
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={index}
                onClick={() => handleTabClick(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-sans text-sm transition-colors ${
                  isActive
                    ? "bg-foreground/10 text-foreground"
                    : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      )}

      {sidebarOpen && (
        <div className="border-t border-foreground/10 p-4">
          <button
            onClick={() => router.push("/")}
            className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-2 text-sm font-sans text-foreground/80 transition-colors hover:bg-foreground/10"
          >
            Back to Home
          </button>
        </div>
      )}
    </aside>
  )
}

