"use client"

import { useState } from "react"
import { Banknote, Check, RefreshCw, Edit2, Save, X } from "lucide-react"

const TREASURY_ADDRESS = "0xB27705342ACE73736AE490540Ea031cc06C3eF49"
const MANTLE_SEPOLIA_RPC = "https://rpc.sepolia.mantle.xyz"

interface AdminTabProps {
  pendingFees: string
  totalCollected: string
  isCollecting: boolean
  collectError: string
  collectSuccess: boolean
  onCollectFees: () => void
  onRefresh: () => void
  adminAddress: string
  onUpdateAdmin: (address: string) => Promise<void>
  validateWalletAddress: (address: string) => boolean
}

export function AdminTab({
  pendingFees,
  totalCollected,
  isCollecting,
  collectError,
  collectSuccess,
  onCollectFees,
  onRefresh,
  adminAddress,
  onUpdateAdmin,
  validateWalletAddress,
}: AdminTabProps) {
  const [isEditingAdmin, setIsEditingAdmin] = useState(false)
  const [editedAdminAddress, setEditedAdminAddress] = useState(adminAddress)
  const [adminError, setAdminError] = useState("")
  const [isSavingAdmin, setIsSavingAdmin] = useState(false)

  const handleSaveAdmin = async () => {
    const trimmed = editedAdminAddress.trim()
    if (!trimmed || !validateWalletAddress(trimmed)) {
      setAdminError("Invalid wallet address")
      return
    }

    try {
      setIsSavingAdmin(true)
      setAdminError("")
      await onUpdateAdmin(trimmed)
      setIsEditingAdmin(false)
    } catch (error: any) {
      console.error('Error updating admin address:', error)
      setAdminError(error.message || 'Failed to update admin address. Please try again.')
    } finally {
      setIsSavingAdmin(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingAdmin(false)
    setEditedAdminAddress(adminAddress)
    setAdminError("")
  }
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-sans text-2xl font-light text-foreground">Admin Panel</h2>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 font-sans text-sm text-foreground transition-colors hover:bg-foreground/15"
        >
          <RefreshCw className="h-4 w-4" />
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
            onClick={onCollectFees}
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
            {isEditingAdmin ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedAdminAddress}
                    onChange={(e) => {
                      const value = e.target.value
                      setEditedAdminAddress(value)
                      if (value.trim() && !validateWalletAddress(value.trim())) {
                        setAdminError("Invalid wallet address")
                      } else {
                        setAdminError("")
                      }
                    }}
                    className={`flex-1 rounded-lg border px-3 py-1.5 font-mono text-sm text-foreground focus:outline-none ${
                      adminError
                        ? "border-red-500/50 bg-red-500/5 focus:border-red-500/70"
                        : "border-foreground/20 bg-background focus:border-foreground/40"
                    }`}
                    placeholder="0x..."
                    autoFocus
                  />
                  <button
                    onClick={handleSaveAdmin}
                    disabled={!!adminError || !editedAdminAddress.trim() || isSavingAdmin}
                    className="text-foreground/60 transition-colors hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Save"
                  >
                    {isSavingAdmin ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-foreground/60 transition-colors hover:text-foreground"
                    title="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {adminError && (
                  <p className="font-mono text-xs text-red-500/80">{adminError}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm text-foreground">{adminAddress}</code>
                <button
                  onClick={() => {
                    setIsEditingAdmin(true)
                    setEditedAdminAddress(adminAddress)
                    setAdminError("")
                  }}
                  className="text-foreground/60 transition-colors hover:text-foreground"
                  title="Edit Admin Address"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            )}
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
  )
}


