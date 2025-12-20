"use client"

import { useState } from "react"
import { Plus, Eye, EyeOff, Copy, Check, Edit2, Save, Wallet, X, Trash2 } from "lucide-react"
import { updatePayoutWallet, deleteProject, Project } from "@/lib/api-client"

interface OverviewTabProps {
  onCreateProject: () => void
  projects: Project[]
  selectedProject: Project | null
  onSelectProject: (project: Project) => void
  onProjectDeleted: () => void
  createdProjectId: string | null
  appId: string | null
  currentProjectName: string | null
  currentPayoutWallet: string | null
  showProjectId: boolean
  setShowProjectId: (show: boolean) => void
  copied: boolean
  setCopied: (copied: boolean) => void
  isEditingPayoutWallet: boolean
  setIsEditingPayoutWallet: (editing: boolean) => void
  editedPayoutWallet: string
  setEditedPayoutWallet: (wallet: string) => void
  walletError: string
  setWalletError: (error: string) => void
  isSaving: boolean
  setIsSaving: (saving: boolean) => void
  setCurrentPayoutWallet: (wallet: string) => void
  userWalletAddress?: string
  isLoading: boolean
  validateWalletAddress: (address: string) => boolean
}

export function OverviewTab({
  onCreateProject,
  projects,
  selectedProject,
  onSelectProject,
  onProjectDeleted,
  createdProjectId,
  appId,
  currentProjectName,
  currentPayoutWallet,
  showProjectId,
  setShowProjectId,
  copied,
  setCopied,
  isEditingPayoutWallet,
  setIsEditingPayoutWallet,
  editedPayoutWallet,
  setEditedPayoutWallet,
  walletError,
  setWalletError,
  isSaving,
  setIsSaving,
  setCurrentPayoutWallet,
  userWalletAddress,
  isLoading,
  validateWalletAddress,
}: OverviewTabProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const handleDeleteProject = async () => {
    if (!appId) return

    try {
      setIsDeleting(true)
      setDeleteError("")
      await deleteProject(appId)
      setShowDeleteConfirm(false)
      onProjectDeleted()
    } catch (error: any) {
      console.error('Error deleting project:', error)
      setDeleteError(error.message || 'Failed to delete project')
    } finally {
      setIsDeleting(false)
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
                if (project) onSelectProject(project)
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
                    onClick={handleCopyProjectId}
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
                    {userWalletAddress && (
                      <button
                        onClick={() => {
                          if (userWalletAddress) {
                            setCurrentPayoutWallet(userWalletAddress)
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

          {/* Recent Activity */}
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

      {/* Empty State */}
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
              Are you sure you want to delete <span className="text-foreground">{currentProjectName}</span>? This action cannot be undone.
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

