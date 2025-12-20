"use client"

import { Copy, Check } from "lucide-react"

interface CreateProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  projectName: string
  setProjectName: (name: string) => void
  payoutWallet: string
  setPayoutWallet: (wallet: string) => void
  createdProjectId: string | null
  appId: string | null
  currentProjectName: string | null
  currentPayoutWallet: string | null
  isSaving: boolean
  createWalletError: string
  setCreateWalletError: (error: string) => void
  copied: boolean
  setCopied: (copied: boolean) => void
  userWalletAddress?: string
  validateWalletAddress: (address: string) => boolean
  handleCreateProject: (e: React.FormEvent) => void
  handleCopyProjectId: () => void
}

export function CreateProjectDialog({
  isOpen,
  onClose,
  projectName,
  setProjectName,
  payoutWallet,
  setPayoutWallet,
  createdProjectId,
  appId,
  currentProjectName,
  currentPayoutWallet,
  isSaving,
  createWalletError,
  setCreateWalletError,
  copied,
  setCopied,
  userWalletAddress,
  validateWalletAddress,
  handleCreateProject,
  handleCopyProjectId,
}: CreateProjectDialogProps) {
  if (!isOpen) return null

  return (
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
                {userWalletAddress && (
                  <button
                    type="button"
                    onClick={() => {
                      if (userWalletAddress) {
                        setPayoutWallet(userWalletAddress)
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
                  onClick={onClose}
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
                <p className="break-all font-mono text-sm text-foreground">{currentPayoutWallet}</p>
              </div>
              <div>
                <p className="mb-2 font-mono text-xs text-foreground/60">Project ID</p>
                <div className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-background px-3 py-2 overflow-hidden">
                  <code className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">{createdProjectId || appId}</code>
                  <button
                    onClick={handleCopyProjectId}
                    className="flex-shrink-0 flex items-center gap-1.5 rounded-md border border-foreground/20 bg-foreground/10 px-2.5 py-1 font-mono text-xs text-foreground transition-colors hover:bg-foreground/20"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full rounded-lg border border-foreground/20 bg-foreground/15 px-4 py-2.5 font-sans text-sm text-foreground transition-colors hover:bg-foreground/20"
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  )
}


