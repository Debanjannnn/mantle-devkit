"use client"

import { useRouter } from "next/navigation"
import { Menu, LogOut } from "lucide-react"
import { usePrivy } from "@privy-io/react-auth"

interface DashboardHeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function DashboardHeader({ sidebarOpen, setSidebarOpen }: DashboardHeaderProps) {
  const router = useRouter()
  const { user, logout } = usePrivy()

  const handleLogout = async () => {
    await logout()
    router.replace("/")
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-foreground/10 bg-foreground/5 px-6">
      <div className="flex items-center gap-4">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-foreground/60 transition-colors hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="font-sans text-xl font-light text-foreground">Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/10 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="font-mono text-xs text-foreground/80">
                {user.wallet?.address
                  ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
                  : "Connected"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 text-sm font-sans text-foreground transition-colors hover:bg-foreground/15"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}



