"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePrivy } from "@privy-io/react-auth"
import { getProjects, createProject, Project } from "@/lib/api-client"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { OverviewTab } from "@/components/dashboard/overview-tab"
import { DocsTab } from "@/components/dashboard/docs-tab"
import { AdminTab } from "@/components/dashboard/admin-tab"
import { AnalyticsTab, EndpointsTab, LogsTab, SettingsTab } from "@/components/dashboard/placeholder-tabs"
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog"

// Treasury contract details
const TREASURY_ADDRESS = "0xB27705342ACE73736AE490540Ea031cc06C3eF49"
const TREASURY_ADMIN = "0xDacCF30F8BB2aEb8D76E68E03033629809ed08E1"
const MANTLE_SEPOLIA_RPC = "https://rpc.sepolia.mantle.xyz"

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [payoutWallet, setPayoutWallet] = useState("")
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [currentProjectName, setCurrentProjectName] = useState<string | null>(null)
  const [currentPayoutWallet, setCurrentPayoutWallet] = useState<string | null>(null)
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null)
  const [appId, setAppId] = useState<string | null>(null)
  const [showProjectId, setShowProjectId] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isEditingPayoutWallet, setIsEditingPayoutWallet] = useState(false)
  const [editedPayoutWallet, setEditedPayoutWallet] = useState("")
  const [walletError, setWalletError] = useState("")
  const [createWalletError, setCreateWalletError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "admin" | "docs" | "analytics" | "endpoints" | "components" | "settings">("overview")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null)
  
  // Admin state
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminAddress, setAdminAddress] = useState<string>(TREASURY_ADMIN)
  const [pendingFees, setPendingFees] = useState<string>("0")
  const [totalCollected, setTotalCollected] = useState<string>("0")
  const [isCollecting, setIsCollecting] = useState(false)
  const [collectError, setCollectError] = useState("")
  const [collectSuccess, setCollectSuccess] = useState(false)
  
  const router = useRouter()
  const { ready, authenticated, user, logout } = usePrivy()

  const validateWalletAddress = (address: string): boolean => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
    return ethAddressRegex.test(address)
  }

  // Check if connected wallet is admin
  useEffect(() => {
    if (user?.wallet?.address) {
      const walletAddress = user.wallet.address.toLowerCase()
      const normalizedAdminAddress = adminAddress.toLowerCase()
      setIsAdmin(walletAddress === normalizedAdminAddress)
    } else {
      setIsAdmin(false)
    }
  }, [user?.wallet?.address, adminAddress])

  // Load treasury data if admin
  useEffect(() => {
    if (isAdmin) {
      loadTreasuryData()
    }
  }, [isAdmin])

  const loadTreasuryData = async () => {
    try {
      const balanceResponse = await fetch(MANTLE_SEPOLIA_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{ to: TREASURY_ADDRESS, data: "0xb69ef8a8" }, "latest"],
          id: 1,
        }),
      })
      const balanceData = await balanceResponse.json()
      if (balanceData.result) {
        const balanceWei = BigInt(balanceData.result)
        const balanceMnt = Number(balanceWei) / 1e18
        setPendingFees(balanceMnt.toFixed(6))
      }

      const totalResponse = await fetch(MANTLE_SEPOLIA_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{ to: TREASURY_ADDRESS, data: "0xe2ee65d7" }, "latest"],
          id: 2,
        }),
      })
      const totalData = await totalResponse.json()
      if (totalData.result) {
        const totalWei = BigInt(totalData.result)
        const totalMnt = Number(totalWei) / 1e18
        setTotalCollected(totalMnt.toFixed(6))
      }
    } catch (error) {
      console.error("Error loading treasury data:", error)
    }
  }

  const handleCollectFees = async () => {
    try {
      setIsCollecting(true)
      setCollectError("")
      setCollectSuccess(false)

      // This would need to be implemented with a wallet connection
      // For now, just show a message
      setCollectError("Fee collection requires wallet interaction. Please use a wallet extension.")
    } catch (error: any) {
      console.error("Error collecting fees:", error)
      setCollectError(error.message || "Failed to collect fees")
    } finally {
      setIsCollecting(false)
    }
  }

  const handleUpdateAdmin = async (newAdminAddress: string) => {
    // In a real implementation, this would update the admin address in the Treasury contract
    // For now, we'll just update the local state
    // TODO: Implement contract interaction to update admin address
    setAdminAddress(newAdminAddress.toLowerCase())
    console.log('Admin address updated to:', newAdminAddress)
  }

  // Set default payout wallet to user's connected wallet
  useEffect(() => {
    if (user?.wallet?.address && !payoutWallet) {
      setPayoutWallet(user.wallet.address)
    }
  }, [user?.wallet?.address, payoutWallet])

  // Redirect to home if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.replace("/")
    }
  }, [ready, authenticated, router])

  // Load existing projects on mount and when user changes
  useEffect(() => {
    if (ready && authenticated && user?.wallet?.address) {
      loadProjects()
    }
  }, [ready, authenticated, user?.wallet?.address])

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      // Filter projects by the connected wallet address (createdBy)
      const walletAddress = user?.wallet?.address ? user.wallet.address.toLowerCase() : undefined
      console.log('Loading projects for wallet:', walletAddress)
      const fetchedProjects = await getProjects(walletAddress)
      console.log('Fetched projects:', fetchedProjects)
      
      setProjects(fetchedProjects)
      
      if (fetchedProjects.length > 0) {
        // Select the first project by default, or keep the currently selected one if it still exists
        const projectToSelect = selectedProject 
          ? fetchedProjects.find(p => p.appId === selectedProject.appId) || fetchedProjects[0]
          : fetchedProjects[0]
        
        setSelectedProject(projectToSelect)
        // Use appId as createdProjectId if projectId is not available (for existing projects)
        setCreatedProjectId(projectToSelect.projectId ?? projectToSelect.appId ?? null)
        setAppId(projectToSelect.appId ?? null)
        setCurrentProjectName(projectToSelect.name ?? null)
        setCurrentPayoutWallet(projectToSelect.payTo ?? null)
      } else {
        setSelectedProject(null)
        setCreatedProjectId(null)
        setAppId(null)
        setCurrentProjectName(null)
        setCurrentPayoutWallet(null)
      }
    } catch (error) {
      console.error("Error loading projects:", error)
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectName.trim() || !payoutWallet.trim()) return

    const trimmedWallet = payoutWallet.trim()
    if (!validateWalletAddress(trimmedWallet)) {
      setCreateWalletError("Invalid wallet address")
      return
    }

    try {
      setIsSaving(true)
      if (!user?.wallet?.address) {
        setCreateWalletError("Wallet not connected")
        return
      }

      const project = await createProject({
        name: projectName.trim(),
        payTo: trimmedWallet,
        createdBy: user.wallet.address,
        network: 'mantle',
      })

      // Update state to show success dialog
      setCreatedProjectId(project.projectId ?? project.appId ?? null)
      setAppId(project.appId ?? null)
      setCurrentProjectName(project.name ?? null)
      setCurrentPayoutWallet(project.payTo ?? null)
      setCreateWalletError("")

      // Reload projects to include the new one
      await loadProjects()
      setShowProjectId(false)
    } catch (error: any) {
      console.error('Error creating project:', error)
      setCreateWalletError(error.message || 'Failed to create project. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyProjectId = (): void => {
    const textToCopy = createdProjectId || appId || '';
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOpenCreateDialog = () => {
    // Reset all state when opening dialog for a new project
    setCreatedProjectId(null)
    setAppId(null)
    setCurrentProjectName(null)
    setCurrentPayoutWallet(null)
    setProjectName("")
    setPayoutWallet(user?.wallet?.address ? user.wallet.address : "")
    setCopied(false)
    setCreateWalletError("")
    setCreateDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setCreateDialogOpen(false)
    setProjectName("")
    setPayoutWallet(user?.wallet?.address ? user.wallet.address : "")
    setCopied(false)
    setCreateWalletError("")
    // Reset success state so dialog shows form next time
    setCreatedProjectId(null)
  }

  const handleTabChange = (tab: string) => {
    if (tab === "docs") {
      setCurrentPage(1)
      setSelectedDoc(null)
    } else {
      setSelectedDoc(null)
    }
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
              <OverviewTab
                onCreateProject={handleOpenCreateDialog}
                projects={projects}
                selectedProject={selectedProject}
                onSelectProject={(project: Project) => {
                  setSelectedProject(project)
                  setCreatedProjectId(project.projectId ?? null)
                  setAppId(project.appId ?? null)
                  setCurrentProjectName(project.name ?? null)
                  setCurrentPayoutWallet(project.payTo ?? null)
                }}
                onProjectDeleted={loadProjects}
                createdProjectId={createdProjectId}
                appId={appId}
                currentProjectName={currentProjectName}
                currentPayoutWallet={currentPayoutWallet}
                showProjectId={showProjectId}
                setShowProjectId={setShowProjectId}
                copied={copied}
                setCopied={setCopied}
                isEditingPayoutWallet={isEditingPayoutWallet}
                setIsEditingPayoutWallet={setIsEditingPayoutWallet}
                editedPayoutWallet={editedPayoutWallet}
                setEditedPayoutWallet={setEditedPayoutWallet}
                walletError={walletError}
                setWalletError={setWalletError}
                isSaving={isSaving}
                setIsSaving={setIsSaving}
                setCurrentPayoutWallet={setCurrentPayoutWallet}
                userWalletAddress={user?.wallet?.address}
                isLoading={isLoading}
                validateWalletAddress={validateWalletAddress}
              />
            )}

            {activeTab === "analytics" && <AnalyticsTab />}
            {activeTab === "endpoints" && <EndpointsTab />}
            {activeTab === "components" && <LogsTab />}
            {activeTab === "docs" && (
              <DocsTab
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                selectedDoc={selectedDoc}
                setSelectedDoc={setSelectedDoc}
              />
            )}
            {activeTab === "settings" && <SettingsTab />}
            {activeTab === "admin" && (
              <AdminTab
                pendingFees={pendingFees}
                totalCollected={totalCollected}
                isCollecting={isCollecting}
                collectError={collectError}
                collectSuccess={collectSuccess}
                onCollectFees={handleCollectFees}
                onRefresh={loadTreasuryData}
                adminAddress={adminAddress}
                onUpdateAdmin={handleUpdateAdmin}
                validateWalletAddress={validateWalletAddress}
              />
            )}
          </div>
        </main>
      </div>

      <CreateProjectDialog
        isOpen={createDialogOpen}
        onClose={handleCloseDialog}
        projectName={projectName}
        setProjectName={setProjectName}
        payoutWallet={payoutWallet}
        setPayoutWallet={setPayoutWallet}
        createdProjectId={createdProjectId}
        appId={appId}
        currentProjectName={currentProjectName}
        currentPayoutWallet={currentPayoutWallet}
        isSaving={isSaving}
        createWalletError={createWalletError}
        setCreateWalletError={setCreateWalletError}
        copied={copied}
        setCopied={setCopied}
        userWalletAddress={user?.wallet?.address}
        validateWalletAddress={validateWalletAddress}
        handleCreateProject={handleCreateProject}
        handleCopyProjectId={handleCopyProjectId}
      />
    </div>
  )
}
