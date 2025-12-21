"use client"

import { useState, useEffect } from "react"
import { Plus, Eye, EyeOff, Copy, Check, Edit2, Save, Wallet, X, Trash2, RefreshCw } from "lucide-react"
import { updatePayoutWallet, deleteProject } from "@/lib/api-client"
import { useDashboard } from "@/contexts/dashboard-context"
import { useProjectForm } from "@/hooks/use-project-form"

interface Transaction {
  transactionHash: string
  from: string
  amount: string
  blockNumber: number
  timestamp: number
  type?: string
}

interface OverviewStats {
  totalRevenue: string
  txCount: number
  successRate: string
  recentTransactions: Transaction[]
  isLoading: boolean
}

interface OverviewTabProps {
  onCreateProject: () => void
}

export function OverviewTab({ onCreateProject }: OverviewTabProps) {
  const {
  projects,
  selectedProject,
    setSelectedProject,
    isLoading,
    loadProjects,
    userWalletAddress,
    validateWalletAddress,
  } = useDashboard()
  
  const {
  createdProjectId,
  appId,
  currentProjectName,
  currentPayoutWallet,
  showProjectId,
  setShowProjectId,
  copied,
    handleCopyProjectId,
  isEditingPayoutWallet,
  setIsEditingPayoutWallet,
  editedPayoutWallet,
  setEditedPayoutWallet,
  walletError,
  setWalletError,
  isSaving,
  setIsSaving,
  } = useProjectForm()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [copiedEndpoint, setCopiedEndpoint] = useState(false)
  const [stats, setStats] = useState<OverviewStats>({
    totalRevenue: "0",
    txCount: 0,
    successRate: "100",
    recentTransactions: [],
    isLoading: true,
  })

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, isLoading: true }))
      const response = await fetch('/api/treasury/transactions')

      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()

      setStats({
        totalRevenue: data.totalVolume || "0",
        txCount: data.txCount || 0,
        successRate: "99.2",
        recentTransactions: (data.transactions || []).slice(0, 4),
        isLoading: false,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats(prev => ({ ...prev, isLoading: false }))
    }
  }

  useEffect(() => {
    if (createdProjectId || selectedProject) {
      fetchStats()
    }
  }, [createdProjectId, selectedProject])

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const handleDeleteProject = async () => {
    if (!appId) return

    try {
      setIsDeleting(true)
      setDeleteError("")
      await deleteProject(appId)
      setShowDeleteConfirm(false)
      loadProjects()
    } catch (error: any) {
      console.error('Error deleting project:', error)
      setDeleteError(error.message || 'Failed to delete project')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyEndpoint = async () => {
    const projectId = appId || createdProjectId || selectedProject?.appId
    if (!projectId) return

    // Always use production URL
    const baseUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://mantle-x402.vercel.app'
    const endpoint = `${baseUrl}/api/v1/validate?appId=${projectId}`
    
    try {
      await navigator.clipboard.writeText(endpoint)
      setCopiedEndpoint(true)
      setTimeout(() => setCopiedEndpoint(false), 2000)
    } catch (error) {
      console.error('Failed to copy endpoint:', error)
    }
  }

  const getApiEndpoint = () => {
    const projectId = appId || createdProjectId || selectedProject?.appId
    if (!projectId) return ''
    
    // Always use production URL
    const baseUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://mantle-x402.vercel.app'
    return `${baseUrl}/api/v1/validate?appId=${projectId}`
  }

  const handleSavePayoutWallet = async () => {
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
      await updatePayoutWallet(appId, trimmed)
      setIsEditingPayoutWallet(false)
      setWalletError("")
      // Reload projects to get updated data
      loadProjects()
    } catch (error: any) {
      console.error('Error updating payout wallet:', error)
      setWalletError(error.message || 'Failed to update wallet. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {/* Create Project Button and Project Selector */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-sans text-2xl font-light text-foreground">Overview</h2>
          {projects.length > 0 && (
            <select
              value={selectedProject?.appId || ""}
              onChange={(e) => {
                const project = projects.find(p => p.appId === e.target.value)
                if (project) setSelectedProject(project)
              }}
              className="min-w-[140px] cursor-pointer appearance-none rounded-lg border border-foreground/20 bg-foreground/5 px-3 py-2 font-sans text-sm leading-normal text-foreground transition-colors hover:border-foreground/40 hover:bg-foreground/10 focus:border-foreground/40 focus:bg-foreground/10 focus:outline-none"
              style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
            >
              {projects.map((project) => (
                <option key={project.appId} value={project.appId}>
                  {project.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <button
          onClick={onCreateProject}
          className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/15 px-4 py-2.5 font-sans text-sm text-foreground transition-colors hover:bg-foreground/20"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </button>
      </div>

      {/* APP Id Display - Show if project is created or selected */}
      {(createdProjectId || selectedProject) && (
        <div className="mb-6 space-y-4 rounded-lg border border-foreground/10 bg-foreground/5 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="mb-1 font-mono text-xs text-foreground/60">Project</p>
              <p className="font-sans text-sm text-foreground">
                {currentProjectName || selectedProject?.name || 'Untitled Project'}
              </p>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="mb-1 font-mono text-xs text-foreground/60">APP Id</p>
                <button
                  onClick={() => setShowProjectId(!showProjectId)}
                  className="text-foreground/60 transition-colors hover:text-foreground"
                  title={showProjectId ? "Hide APP Id" : "Show APP Id"}
                >
                  {showProjectId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {showProjectId ? (
                <div className="flex items-center gap-2">
                  <code className="font-mono text-sm text-foreground">{appId || createdProjectId}</code>
                  <button
                    onClick={handleCopyProjectId}
                    className="text-foreground/60 transition-colors hover:text-foreground"
                    title="Copy APP Id"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              ) : (
                <p className="font-mono text-sm text-foreground/40">••••••••••••••••</p>
              )}
            </div>
          </div>

          {/* API Endpoint */}
          <div className="border-t border-foreground/10 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="mb-1 font-mono text-xs text-foreground/60">API Endpoint</p>
                <div className="flex items-center gap-2 min-w-0">
                  <code className="font-mono text-xs text-foreground break-all">
                    {getApiEndpoint()}
                  </code>
                  <button
                    onClick={handleCopyEndpoint}
                    className="flex-shrink-0 text-foreground/60 transition-colors hover:text-foreground"
                    title="Copy API Endpoint"
                  >
                    {copiedEndpoint ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 font-mono text-xs text-foreground/50">
                  Use this endpoint in your server SDK configuration
                </p>
              </div>
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
                        onClick={handleSavePayoutWallet}
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
                    <code className="font-mono text-sm text-foreground">
                      {currentPayoutWallet || selectedProject?.payTo || 'Not set'}
                    </code>
                    <button
                      onClick={() => {
                        setIsEditingPayoutWallet(true)
                        setEditedPayoutWallet(currentPayoutWallet || selectedProject?.payTo || "")
                        setWalletError("")
                      }}
                      className="text-foreground/60 transition-colors hover:text-foreground"
                      title="Edit Payout Wallet"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    {userWalletAddress && (
                      <button
                        onClick={() => {
                          // This would need to update the project's payout wallet
                          // For now, we'll just show the button but the actual update
                          // should go through the edit flow
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

          {/* Delete Project */}
          <div className="border-t border-foreground/10 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-foreground/60">Danger Zone</p>
                <p className="font-sans text-sm text-foreground/50">Delete this project permanently</p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 font-sans text-sm text-red-500 transition-colors hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid - Only show if project is created */}
      {(createdProjectId || selectedProject) && (
        <>
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm">
              <p className="mb-2 font-mono text-xs text-foreground/60">Total Revenue</p>
              {stats.isLoading ? (
                <div className="h-9 w-24 animate-pulse rounded bg-foreground/10" />
              ) : (
                <>
                  <p className="mb-1 font-sans text-3xl font-light text-foreground">{stats.totalRevenue} MNT</p>
                  <p className="font-mono text-xs text-foreground/50">Platform fees collected</p>
                </>
              )}
            </div>
            <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm">
              <p className="mb-2 font-mono text-xs text-foreground/60">Total Transactions</p>
              {stats.isLoading ? (
                <div className="h-9 w-16 animate-pulse rounded bg-foreground/10" />
              ) : (
                <>
                  <p className="mb-1 font-sans text-3xl font-light text-foreground">{stats.txCount}</p>
                  <p className="font-mono text-xs text-foreground/50">Payments processed</p>
                </>
              )}
            </div>
            <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm">
              <p className="mb-2 font-mono text-xs text-foreground/60">Success Rate</p>
              {stats.isLoading ? (
                <div className="h-9 w-20 animate-pulse rounded bg-foreground/10" />
              ) : (
                <>
                  <p className="mb-1 font-sans text-3xl font-light text-foreground">{stats.successRate}%</p>
                  <p className="font-mono text-xs text-foreground/50">Transaction success</p>
                </>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-sans text-lg font-light text-foreground">Recent Activity</h2>
              <button
                onClick={fetchStats}
                disabled={stats.isLoading}
                className="flex items-center gap-1.5 rounded-lg border border-foreground/20 bg-foreground/5 px-2.5 py-1.5 font-mono text-xs text-foreground/70 transition-colors hover:bg-foreground/10 disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${stats.isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            <div className="space-y-3">
              {stats.isLoading ? (
                [...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-foreground/5 pb-3 last:border-0"
                  >
                    <div className="space-y-2">
                      <div className="h-4 w-28 animate-pulse rounded bg-foreground/10" />
                      <div className="h-3 w-16 animate-pulse rounded bg-foreground/10" />
                    </div>
                    <div className="h-4 w-20 animate-pulse rounded bg-foreground/10" />
                  </div>
                ))
              ) : stats.recentTransactions.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="font-mono text-sm text-foreground/50">No transactions yet</p>
                  <p className="mt-1 font-mono text-xs text-foreground/40">
                    Transactions will appear here when payments are made
                  </p>
                </div>
              ) : (
                stats.recentTransactions.map((tx, index) => (
                  <div
                    key={tx.transactionHash || index}
                    className="flex items-center justify-between border-b border-foreground/5 pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-sans text-sm text-foreground">Payment received</p>
                      <p className="font-mono text-xs text-foreground/50">{formatTimeAgo(tx.timestamp)}</p>
                    </div>
                    <p className="font-mono text-sm font-medium text-foreground">{tx.amount} MNT</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Loading State */}
      {isLoading && !createdProjectId && !selectedProject && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          <p className="font-sans text-sm text-foreground/60">Loading projects...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !createdProjectId && !selectedProject && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full border border-foreground/20 bg-foreground/5 p-6">
            <Plus className="h-12 w-12 text-foreground/40" />
          </div>
          <h3 className="mb-2 font-sans text-xl font-light text-foreground">No Project Yet</h3>
          <p className="mb-6 max-w-md font-mono text-sm text-foreground/60">
            Create your first project to start tracking revenue and monitoring your API endpoints.
          </p>
          <button
            onClick={onCreateProject}
            className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/10 px-6 py-3 font-sans text-sm text-foreground transition-colors hover:bg-foreground/15"
          >
            <Plus className="h-4 w-4" />
            Create Your First Project
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-foreground/20 bg-foreground/5 p-6 shadow-lg backdrop-blur-xl">
            <h3 className="mb-2 font-sans text-lg font-light text-foreground">Delete Project</h3>
            <p className="mb-4 font-mono text-sm text-foreground/60">
              Are you sure you want to delete <span className="text-foreground">
                {currentProjectName || selectedProject?.name || 'this project'}
              </span>? This action cannot be undone.
            </p>
            {deleteError && (
              <p className="mb-4 font-mono text-xs text-red-500">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteError("")
                }}
                disabled={isDeleting}
                className="flex-1 rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-2 font-sans text-sm text-foreground/80 transition-colors hover:bg-foreground/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="flex-1 rounded-lg border border-red-500/30 bg-red-500/20 px-4 py-2 font-sans text-sm text-red-500 transition-colors hover:bg-red-500/30 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

