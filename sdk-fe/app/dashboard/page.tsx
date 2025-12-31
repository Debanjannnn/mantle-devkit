"use client"

import { useState, useEffect, Suspense } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardProvider, useDashboard } from "@/contexts/dashboard-context"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { OverviewTab } from "@/components/dashboard/overview-tab"
import { DocsTab } from "@/components/dashboard/docs-tab"
import { AdminTab } from "@/components/dashboard/admin-tab"
import { AnalyticsTab, SettingsTab } from "@/components/dashboard/placeholder-tabs"
import { AgentKitTab } from "@/components/dashboard/agent-kit-tab"
import { EndpointsTab } from "@/components/dashboard/endpoints-tab"
import { McpTab } from "@/components/dashboard/mcp-tab"
import { X402Tab } from "@/components/dashboard/x402-tab"
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog"

function DashboardContent() {
  const { ready, authenticated } = usePrivy()
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    sidebarOpen,
    setSidebarOpen,
    activeTab,
    setActiveTab,
    isAdmin,
    handleCreateProject: createProjectAction,
  } = useDashboard()
  
  // Local UI state (dialogs, tabs)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  
  // Get docs state from URL or default
  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get("page")
    return page ? parseInt(page, 10) : 1
  })
  const [selectedDoc, setSelectedDoc] = useState<number | null>(() => {
    const doc = searchParams.get("doc")
    return doc ? parseInt(doc, 10) : null
  })
  
  // Update URL when docs state changes (only when on docs tab)
  useEffect(() => {
    if (activeTab !== "docs") return

    const params = new URLSearchParams()
    if (currentPage > 1) {
      params.set("page", currentPage.toString())
    }
    if (selectedDoc !== null) {
      params.set("doc", selectedDoc.toString())
    }

    const newSearch = params.toString()
    const currentSearch = window.location.search.replace("?", "")

    if (newSearch !== currentSearch) {
      router.replace(`/dashboard${newSearch ? `?${newSearch}` : ""}`, { scroll: false })
    }
  }, [activeTab, currentPage, selectedDoc, router])

  if (!ready) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          <p className="font-sans text-sm text-foreground/60">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  const handleCreateProject = async (e: React.FormEvent, name: string, wallet: string) => {
    e.preventDefault()
    if (!name.trim() || !wallet.trim()) return null

    const project = await createProjectAction(name, wallet)
    return project
  }

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setCreateDialogOpen(false)
  }

  const handleTabChange = (tab: string) => {
    setCurrentPage(1)
    setSelectedDoc(null)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        onTabChange={handleTabChange}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            {activeTab === "overview" && (
              <OverviewTab onCreateProject={handleOpenCreateDialog} />
            )}

            {activeTab === "analytics" && <AnalyticsTab />}
            {activeTab === "endpoints" && <EndpointsTab />}
            {activeTab === "x402" && <X402Tab />}
            {activeTab === "components" && <AgentKitTab />}
            {activeTab === "mcp" && <McpTab />}
            {activeTab === "docs" && (
              <DocsTab
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                selectedDoc={selectedDoc}
                setSelectedDoc={setSelectedDoc}
              />
            )}
            {activeTab === "settings" && <SettingsTab />}
            {activeTab === "admin" && <AdminTab />}
          </div>
        </main>
      </div>

      <CreateProjectDialog
        isOpen={createDialogOpen}
        onClose={handleCloseDialog}
        handleCreateProject={handleCreateProject}
      />
    </div>
  )
}

function DashboardPageContent() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          <p className="font-sans text-sm text-foreground/60">Loading...</p>
        </div>
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  )
}
