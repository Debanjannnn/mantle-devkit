"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePrivy } from "@privy-io/react-auth"
import { LayoutDashboard, BarChart3, Settings, FileText, Zap, Menu, X, Plus, Copy, Check, Eye, EyeOff, Wallet, Edit2, Save, Shield, Banknote } from "lucide-react"
import { getProjects, createProject, updatePayoutWallet } from "@/lib/api-client"

// Treasury contract details
const TREASURY_ADDRESS = "0xB27705342ACE73736AE490540Ea031cc06C3eF49"
const TREASURY_ADMIN = "0xDacCF30F8BB2aEb8D76E68E03033629809ed08E1"
const MANTLE_SEPOLIA_RPC = "https://rpc.sepolia.mantle.xyz"

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [payoutWallet, setPayoutWallet] = useState("")
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
  const [activeTab, setActiveTab] = useState<"overview" | "admin">("overview")
  // Admin state
  const [isAdmin, setIsAdmin] = useState(false)
  const [pendingFees, setPendingFees] = useState<string>("0")
  const [totalCollected, setTotalCollected] = useState<string>("0")
  const [isCollecting, setIsCollecting] = useState(false)
  const [collectError, setCollectError] = useState("")
  const [collectSuccess, setCollectSuccess] = useState(false)
  const router = useRouter()
  const { ready, authenticated, user, logout } = usePrivy()

  const validateWalletAddress = (address: string): boolean => {
    // Ethereum address validation: starts with 0x and is 42 characters (0x + 40 hex chars)
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
    return ethAddressRegex.test(address)
  }

  // Check if connected wallet is admin
  useEffect(() => {
    if (user?.wallet?.address) {
      const walletAddress = user.wallet.address.toLowerCase()
      const adminAddress = TREASURY_ADMIN.toLowerCase()
      setIsAdmin(walletAddress === adminAddress)
    } else {
      setIsAdmin(false)
    }
  }, [user?.wallet?.address])

  // Load treasury data if admin
  useEffect(() => {
    if (isAdmin) {
      loadTreasuryData()
    }
  }, [isAdmin])

  const loadTreasuryData = async () => {
    try {
      // Call balance() function - selector: 0xb69ef8a8
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

      // Call totalCollected() function - selector: 0xe2ee65d7
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
    if (!user?.wallet?.address || !isAdmin) return

    setIsCollecting(true)
    setCollectError("")
    setCollectSuccess(false)

    try {
      // Get the ethereum provider from window
      const ethereum = (window as any).ethereum
      if (!ethereum) {
        throw new Error("No wallet found")
      }

      // Request account access
      await ethereum.request({ method: "eth_requestAccounts" })

      // Send transaction to call collect() - selector: 0xe5225381
      const txHash = await ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: user.wallet.address,
          to: TREASURY_ADDRESS,
          data: "0xe5225381", // collect() function selector
        }],
      })

      setCollectSuccess(true)
      // Reload treasury data after a delay
      setTimeout(() => {
        loadTreasuryData()
        setCollectSuccess(false)
      }, 3000)
    } catch (error: any) {
      console.error("Error collecting fees:", error)
      setCollectError(error.message || "Failed to collect fees")
    } finally {
      setIsCollecting(false)
    }
  }

  // Set default payout wallet to user's connected wallet
  useEffect(() => {
    if (user?.wallet?.address) {
      setPayoutWallet(user.wallet.address)
      if (!currentPayoutWallet) {
        setCurrentPayoutWallet(user.wallet.address)
      }
    }
  }, [user, currentPayoutWallet])

  // Load existing projects on mount
  useEffect(() => {
    if (ready && authenticated) {
      loadProjects()
    }
  }, [ready, authenticated])

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const projects = await getProjects()
      // Get the most recent active project
      const activeProject = projects.find((p) => p.status === 'ACTIVE')
      if (activeProject) {
        setCurrentProjectName(activeProject.name)
        setCurrentPayoutWallet(activeProject.payTo)
        setAppId(activeProject.appId)
        // Note: We don't have the original projectId, only the hashed appId
        // You might want to store the original projectId separately or use appId
        setCreatedProjectId(activeProject.appId.slice(0, 12)) // Show first 12 chars as display
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/")
    }
  }, [ready, authenticated, router])

  if (!ready) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground mx-auto" />
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
      const project = await createProject({
        name: projectName.trim(),
        payTo: trimmedWallet,
        network: 'mantle',
      })

      setCreatedProjectId(project.projectId)
      setAppId(project.appId)
      setCurrentProjectName(project.name)
      setCurrentPayoutWallet(project.payTo)
      setShowProjectId(false) // Hide by default
      setCreateWalletError("")
    } catch (error: any) {
      console.error('Error creating project:', error)
      setCreateWalletError(error.message || 'Failed to create project. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyProjectId = () => {
    const textToCopy = createdProjectId || appId || ''
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCloseDialog = () => {
    setCreateDialogOpen(false)
    setProjectName("")
    setPayoutWallet(user?.wallet?.address || "")
    setCopied(false)
    setCreateWalletError("")
    // Don't clear createdProjectId - keep it so it shows in overview
  }

  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", id: "overview" as const },
    { icon: BarChart3, label: "Analytics", id: "analytics" as const },
    { icon: Zap, label: "Endpoints", id: "endpoints" as const },
    { icon: FileText, label: "Logs", id: "logs" as const },
    { icon: Settings, label: "Settings", id: "settings" as const },
    ...(isAdmin ? [{ icon: Shield, label: "Admin", id: "admin" as const }] : []),
  ]

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-foreground/10 bg-foreground/5 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        <div className="flex h-16 items-center justify-between border-b border-foreground/10 px-6">
          {sidebarOpen && (
            <>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/15">
                  <span className="font-mono text-sm font-bold text-foreground">x402</span>
                </div>
                <span className="font-sans text-lg font-semibold text-foreground">DevKit</span>
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
                  onClick={() => setActiveTab(item.id as "overview" | "admin")}
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

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
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
            {ready && authenticated && user ? (
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
                  onClick={logout}
                  className="rounded-lg border border-foreground/20 bg-foreground/5 px-3 py-1.5 font-sans text-xs text-foreground/80 transition-colors hover:bg-foreground/10"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 font-sans text-sm text-foreground transition-colors hover:bg-foreground/15"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            {/* Admin Panel */}
            {activeTab === "admin" && isAdmin && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-sans text-2xl font-light text-foreground">
                    Admin Panel
                  </h2>
                  <button
                    onClick={loadTreasuryData}
                    className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 font-sans text-sm text-foreground transition-colors hover:bg-foreground/15"
                  >
                    Refresh
                  </button>
                </div>

                {/* Treasury Stats */}
                <div className="mb-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm">
                    <p className="mb-2 font-mono text-xs text-foreground/60">Pending Fees</p>
                    <p className="mb-1 font-sans text-3xl font-light text-foreground">{pendingFees} MNT</p>
                    <p className="font-mono text-xs text-foreground/50">Available to collect</p>
                  </div>
                  <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm">
                    <p className="mb-2 font-mono text-xs text-foreground/60">Total Collected</p>
                    <p className="mb-1 font-sans text-3xl font-light text-foreground">{totalCollected} MNT</p>
                    <p className="font-mono text-xs text-foreground/50">All time</p>
                  </div>
                </div>

                {/* Collect Button */}
                <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm">
                  <h3 className="mb-4 font-sans text-lg font-light text-foreground">Collect Fees</h3>
                  <p className="mb-4 font-mono text-sm text-foreground/60">
                    Withdraw all accumulated platform fees to your admin wallet.
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleCollectFees}
                      disabled={isCollecting || pendingFees === "0" || pendingFees === "0.000000"}
                      className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/15 px-6 py-3 font-sans text-sm text-foreground transition-colors hover:bg-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Banknote className="h-4 w-4" />
                      {isCollecting ? "Collecting..." : "Collect Fees"}
                    </button>
                    {collectSuccess && (
                      <span className="flex items-center gap-2 font-mono text-sm text-green-500">
                        <Check className="h-4 w-4" />
                        Fees collected successfully!
                      </span>
                    )}
                    {collectError && (
                      <span className="font-mono text-sm text-red-500">{collectError}</span>
                    )}
                  </div>
                </div>

                {/* Treasury Contract Info */}
                <div className="mt-6 rounded-lg border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm">
                  <h3 className="mb-4 font-sans text-lg font-light text-foreground">Treasury Contract</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="mb-1 font-mono text-xs text-foreground/60">Contract Address</p>
                      <code className="font-mono text-sm text-foreground">{TREASURY_ADDRESS}</code>
                    </div>
                    <div>
                      <p className="mb-1 font-mono text-xs text-foreground/60">Admin Address</p>
                      <code className="font-mono text-sm text-foreground">{TREASURY_ADMIN}</code>
                    </div>
                    <div>
                      <p className="mb-1 font-mono text-xs text-foreground/60">Network</p>
                      <p className="font-mono text-sm text-foreground">Mantle Sepolia (Chain ID: 5003)</p>
                    </div>
                    <div>
                      <p className="mb-1 font-mono text-xs text-foreground/60">Platform Fee</p>
                      <p className="font-mono text-sm text-foreground">0.5%</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <>
                {/* Create Project Button */}
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-sans text-2xl font-light text-foreground">Overview</h2>
                  <button
                    onClick={() => setCreateDialogOpen(true)}
                    className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 font-sans text-sm text-foreground transition-colors hover:bg-foreground/15"
                  >
                    <Plus className="h-4 w-4" />
                    Create
                  </button>
                </div>

            {/* Project ID Display - Only show if project is created */}
            {createdProjectId && (
              <div className="mb-6 space-y-4 rounded-lg border border-foreground/10 bg-foreground/5 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="mb-1 font-mono text-xs text-foreground/60">Project</p>
                    <p className="font-sans text-sm text-foreground">{currentProjectName}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="mb-1 font-mono text-xs text-foreground/60">Project ID</p>
                      <button
                        onClick={() => setShowProjectId(!showProjectId)}
                        className="text-foreground/60 transition-colors hover:text-foreground"
                        title={showProjectId ? "Hide Project ID" : "Show Project ID"}
                      >
                        {showProjectId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {showProjectId ? (
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm text-foreground">{appId || createdProjectId}</code>
                        <button
                          onClick={() => {
                            const textToCopy = appId || createdProjectId || ''
                            navigator.clipboard.writeText(textToCopy)
                            setCopied(true)
                            setTimeout(() => setCopied(false), 2000)
                          }}
                          className="text-foreground/60 transition-colors hover:text-foreground"
                          title="Copy Project ID"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    ) : (
                      <p className="font-mono text-sm text-foreground/40">••••••••••••••••</p>
                    )}
                  </div>
                </div>

                {/* Payout Wallet */}
                <div className="border-t border-foreground/10 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="mb-1 font-mono text-xs text-foreground/60">Payout Wallet</p>
                      {isEditingPayoutWallet ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editedPayoutWallet}
                              onChange={(e) => {
                                const value = e.target.value
                                setEditedPayoutWallet(value)
                                if (value.trim() && !validateWalletAddress(value.trim())) {
                                  setWalletError("Invalid wallet address")
                                } else {
                                  setWalletError("")
                                }
                              }}
                              className={`flex-1 rounded-lg border px-3 py-1.5 font-mono text-sm text-foreground focus:outline-none ${
                                walletError
                                  ? "border-red-500/50 bg-red-500/5 focus:border-red-500/70"
                                  : "border-foreground/20 bg-background focus:border-foreground/40"
                              }`}
                              placeholder="0x..."
                              autoFocus
                            />
                            <button
                              onClick={async () => {
                                const trimmed = editedPayoutWallet.trim()
                                if (!trimmed || !validateWalletAddress(trimmed)) {
                                  setWalletError("Invalid wallet address")
                                  return
                                }

                                if (!appId) {
                                  setWalletError("Project not found")
                                  return
                                }

                                try {
                                  setIsSaving(true)
                                  const updated = await updatePayoutWallet(appId, trimmed)
                                  setCurrentPayoutWallet(updated.payTo)
                                  setIsEditingPayoutWallet(false)
                                  setWalletError("")
                                } catch (error: any) {
                                  console.error('Error updating payout wallet:', error)
                                  setWalletError(error.message || 'Failed to update wallet. Please try again.')
                                } finally {
                                  setIsSaving(false)
                                }
                              }}
                              disabled={!!walletError || !editedPayoutWallet.trim() || isSaving}
                              className="text-foreground/60 transition-colors hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Save"
                            >
                              {isSaving ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setIsEditingPayoutWallet(false)
                                setEditedPayoutWallet(currentPayoutWallet || "")
                                setWalletError("")
                              }}
                              className="text-foreground/60 transition-colors hover:text-foreground"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          {walletError && (
                            <p className="font-mono text-xs text-red-500/80">{walletError}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-sm text-foreground">{currentPayoutWallet}</code>
                          <button
                            onClick={() => {
                              setIsEditingPayoutWallet(true)
                              setEditedPayoutWallet(currentPayoutWallet || "")
                              setWalletError("")
                            }}
                            className="text-foreground/60 transition-colors hover:text-foreground"
                            title="Edit Payout Wallet"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {user?.wallet?.address && (
                            <button
                              onClick={() => {
                                if (user?.wallet?.address) {
                                  setCurrentPayoutWallet(user.wallet.address)
                                }
                              }}
                              className="text-foreground/60 transition-colors hover:text-foreground"
                              title="Use Connected Wallet"
                            >
                              <Wallet className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Grid - Only show if project is created */}
            {createdProjectId && (
              <>
                <div className="mb-8 grid gap-6 md:grid-cols-3">
                  {[
                    { label: "Total Revenue", value: "$12,458", change: "+12.5%" },
                    { label: "Active Endpoints", value: "24", change: "+3" },
                    { label: "Success Rate", value: "99.2%", change: "+0.3%" },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm"
                    >
                      <p className="mb-2 font-mono text-xs text-foreground/60">{stat.label}</p>
                      <p className="mb-1 font-sans text-3xl font-light text-foreground">{stat.value}</p>
                      <p className="font-mono text-xs text-foreground/50">{stat.change}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Activity - Only show if project is created */}
                <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm">
                  <h2 className="mb-4 font-sans text-lg font-light text-foreground">Recent Activity</h2>
                  <div className="space-y-3">
                    {[
                      { time: "2m ago", action: "Payment received", amount: "$0.01" },
                      { time: "5m ago", action: "Payment received", amount: "$0.05" },
                      { time: "12m ago", action: "Payment received", amount: "$0.02" },
                      { time: "18m ago", action: "Payment received", amount: "$0.01" },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b border-foreground/5 pb-3 last:border-0"
                      >
                        <div>
                          <p className="font-sans text-sm text-foreground">{activity.action}</p>
                          <p className="font-mono text-xs text-foreground/50">{activity.time}</p>
                        </div>
                        <p className="font-mono text-sm font-medium text-foreground">{activity.amount}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

                {/* Loading State */}
                {isLoading && !createdProjectId && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
                    <p className="font-sans text-sm text-foreground/60">Loading projects...</p>
                  </div>
                )}

                {/* Empty State - Show if no project is created */}
                {!isLoading && !createdProjectId && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 rounded-full border border-foreground/20 bg-foreground/5 p-6">
                      <Plus className="h-12 w-12 text-foreground/40" />
                    </div>
                    <h3 className="mb-2 font-sans text-xl font-light text-foreground">No Project Yet</h3>
                    <p className="mb-6 max-w-md font-mono text-sm text-foreground/60">
                      Create your first project to start tracking revenue and monitoring your API endpoints.
                    </p>
                    <button
                      onClick={() => setCreateDialogOpen(true)}
                      className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/10 px-6 py-3 font-sans text-sm text-foreground transition-colors hover:bg-foreground/15"
                    >
                      <Plus className="h-4 w-4" />
                      Create Your First Project
                    </button>
                  </div>
                )}
              </>
            )}
            {/* End of Overview Tab */}
          </div>
        </main>
      </div>

      {/* Create Project Dialog */}
      {createDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-foreground/20 bg-foreground/5 p-6 shadow-lg backdrop-blur-xl">
            {!createdProjectId ? (
              <>
                <h2 className="mb-4 font-sans text-xl font-light text-foreground">Create New Project</h2>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <label className="mb-2 block font-mono text-xs text-foreground/60">Project Name</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Enter project name"
                      className="w-full rounded-lg border border-foreground/20 bg-background px-4 py-2.5 font-sans text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/40 focus:outline-none"
                      required
                      autoFocus
                    />
                    <p className="mt-1.5 font-mono text-xs text-foreground/50">Network: Mantle Sepolia Testnet</p>
                  </div>
                  <div>
                    <label className="mb-2 block font-mono text-xs text-foreground/60">Payout Wallet</label>
                    <input
                      type="text"
                      value={payoutWallet}
                      onChange={(e) => {
                        const value = e.target.value
                        setPayoutWallet(value)
                        if (value.trim() && !validateWalletAddress(value.trim())) {
                          setCreateWalletError("Invalid wallet address")
                        } else {
                          setCreateWalletError("")
                        }
                      }}
                      placeholder="0x..."
                      className={`w-full rounded-lg border px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-foreground/40 focus:outline-none ${
                        createWalletError
                          ? "border-red-500/50 bg-red-500/5 focus:border-red-500/70"
                          : "border-foreground/20 bg-background focus:border-foreground/40"
                      }`}
                      required
                    />
                    {createWalletError && (
                      <p className="mt-1.5 font-mono text-xs text-red-500/80">{createWalletError}</p>
                    )}
                    {user?.wallet?.address && (
                      <button
                        type="button"
                        onClick={() => {
                          if (user?.wallet?.address) {
                            setPayoutWallet(user.wallet.address)
                            setCreateWalletError("")
                          }
                        }}
                        className="mt-1.5 font-mono text-xs text-foreground/60 underline transition-colors hover:text-foreground/80"
                      >
                        Use connected wallet
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCloseDialog}
                      className="flex-1 rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-2.5 font-sans text-sm text-foreground/80 transition-colors hover:bg-foreground/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 rounded-lg border border-foreground/20 bg-foreground/15 px-4 py-2.5 font-sans text-sm text-foreground transition-colors hover:bg-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? "Creating..." : "Create Project"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className="mb-4 font-sans text-xl font-light text-foreground">Project Created</h2>
                <div className="mb-4 space-y-3">
                  <div>
                    <p className="mb-2 font-mono text-xs text-foreground/60">Project Name</p>
                    <p className="font-sans text-base text-foreground">{currentProjectName}</p>
                    <p className="mt-1 font-mono text-xs text-foreground/50">Network: Mantle Sepolia Testnet</p>
                  </div>
                  <div>
                    <p className="mb-2 font-mono text-xs text-foreground/60">Payout Wallet</p>
                    <p className="font-mono text-sm text-foreground">{currentPayoutWallet}</p>
                  </div>
                  <div>
                    <p className="mb-2 font-mono text-xs text-foreground/60">Project ID</p>
                    <div className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-background px-4 py-2.5">
                      <code className="flex-1 font-mono text-sm text-foreground">{createdProjectId || appId}</code>
                      <button
                        onClick={handleCopyProjectId}
                        className="text-foreground/60 transition-colors hover:text-foreground"
                        title="Copy Project ID"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCloseDialog}
                  className="w-full rounded-lg border border-foreground/20 bg-foreground/15 px-4 py-2.5 font-sans text-sm text-foreground transition-colors hover:bg-foreground/20"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

