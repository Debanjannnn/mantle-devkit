"use client"

import { useState, useEffect } from "react"
import { X, Loader2, CheckCircle2, AlertCircle, Copy, ExternalLink, Wallet, Check } from "lucide-react"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { MagicCard } from "@/components/ui/magic-card"

export interface PaymentRequest {
  amount: string // Amount in tokens (e.g., "0.001")
  token: string // Token symbol (e.g., "MNT", "USDC")
  network: string // Network name (e.g., "mantle")
  recipient: string // Recipient wallet address
  endpoint?: string // Optional: API endpoint being paid for
  description?: string // Optional: Description of what's being paid for
}

export interface PaymentResponse {
  transactionHash: string
  amount: string
  token: string
  network: string
  recipient: string
}

interface PaymentModalProps {
  isOpen: boolean
  request: PaymentRequest | null
  onComplete: (payment: PaymentResponse) => void
  onCancel: () => void
  simulation?: boolean // When true, simulates payment without executing real transactions
}

export function PaymentModal({ isOpen, request, onComplete, onCancel, simulation = false }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  
  const { ready, authenticated, user } = usePrivy()
  const { wallets } = useWallets()

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false)
      setError(null)
      setTxHash(null)
      setCopied(false)
    }
  }, [isOpen])

  if (!isOpen || !request) return null

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getExplorerUrl = (hash: string) => {
    if (request.network === "mantle" || request.network === "mantle-sepolia") {
      return `https://explorer.sepolia.mantle.xyz/tx/${hash}`
    }
    return `https://explorer.mantle.xyz/tx/${hash}`
  }

  const handlePayment = async () => {
    // Simulation mode - just simulate the payment flow
    if (simulation) {
      setIsProcessing(true)
      setError(null)

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate a mock transaction hash
      const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`
      setTxHash(mockTxHash)

      // Simulate success after another delay
      setTimeout(() => {
        const paymentResponse: PaymentResponse = {
          transactionHash: mockTxHash,
          amount: request.amount,
          token: request.token,
          network: request.network,
          recipient: request.recipient,
        }
        setIsProcessing(false)
        onComplete(paymentResponse)
      }, 1500)
      return
    }

    // Real payment execution
    if (!ready || !authenticated) {
      setError("Please connect your wallet first")
      return
    }

    if (!user?.wallet?.address) {
      setError("No wallet connected")
      return
    }

    try {
      setIsProcessing(true)
      setError(null)

      // Find the connected wallet
      const wallet = wallets.find((w) => w.address.toLowerCase() === user.wallet?.address?.toLowerCase())

      if (!wallet) {
        setError("No wallet found. Please connect your wallet.")
        return
      }

      // Get the Ethereum provider
      const provider = await wallet.getEthereumProvider()

      // Switch to Mantle Sepolia if needed
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x138B" }], // 5003 in hex for Mantle Sepolia
        })
      } catch (switchError: any) {
        // Chain not added, try to add it
        if (switchError.code === 4902) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0x138B",
              chainName: "Mantle Sepolia Testnet",
              nativeCurrency: {
                name: "MNT",
                symbol: "MNT",
                decimals: 18,
              },
              rpcUrls: ["https://rpc.sepolia.mantle.xyz"],
              blockExplorerUrls: ["https://explorer.sepolia.mantle.xyz"],
            }],
          })
        } else {
          throw switchError
        }
      }

      // Convert amount to Wei (assuming 18 decimals for MNT)
      const amountWei = BigInt(Math.floor(parseFloat(request.amount) * 1e18)).toString(16)
      const amountHex = `0x${amountWei}`

      // Send the payment transaction
      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [{
          from: wallet.address,
          to: request.recipient,
          value: amountHex,
        }],
      })

      console.log("Payment transaction sent:", txHash)
      setTxHash(txHash as string)

      // Wait for transaction confirmation (simplified - in production, you'd want to poll)
      // For now, we'll assume success after a short delay
      setTimeout(() => {
        const paymentResponse: PaymentResponse = {
          transactionHash: txHash as string,
          amount: request.amount,
          token: request.token,
          network: request.network,
          recipient: request.recipient,
        }
        setIsProcessing(false)
        onComplete(paymentResponse)
      }, 2000)
    } catch (error: any) {
      console.error("Payment error:", error)
      setIsProcessing(false)
      
      const errorMsg = error.message || "Payment failed"
      if (errorMsg.includes("user rejected") || errorMsg.includes("User denied")) {
        setError("Transaction cancelled by user")
      } else if (errorMsg.includes("insufficient funds")) {
        setError("Insufficient balance. Please add funds to your wallet.")
      } else {
        setError(errorMsg)
      }
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-lg border border-foreground/20 bg-foreground/5 p-6 shadow-lg backdrop-blur-xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-sans text-xl font-light text-foreground">
                {txHash ? "Payment Complete" : "Payment Required"}
              </h2>
              {simulation && (
                <span className="rounded-full border border-yellow-500/40 bg-yellow-500/20 px-2 py-0.5 font-mono text-xs text-yellow-400">
                  SIMULATION
                </span>
              )}
            </div>
            {!isProcessing && (
              <button
                onClick={onCancel}
                className="text-foreground/60 transition-colors hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Success State */}
          {txHash ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-2">
                <div className="rounded-full bg-green-500/20 p-3">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="mb-4 space-y-3">
                <div>
                  <p className="mb-2 font-mono text-xs text-foreground/60">Transaction Hash</p>
                  <div className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-background px-3 py-2 overflow-hidden">
                    <code className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">{txHash}</code>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleCopy(txHash)}
                        className="flex items-center gap-1.5 rounded-md border border-foreground/20 bg-foreground/10 px-2.5 py-1 font-mono text-xs text-foreground transition-colors hover:bg-foreground/20"
                        title="Copy transaction hash"
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                      <a
                        href={getExplorerUrl(txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center rounded-md border border-foreground/20 bg-foreground/10 p-1.5 text-foreground/60 transition-colors hover:bg-foreground/20 hover:text-foreground"
                        title="View on explorer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="mb-2 font-mono text-xs text-foreground/60">Amount Paid</p>
                  <p className="font-sans text-base text-foreground">
                    {request.amount} {request.token}
                  </p>
                </div>
              </div>
              <button
                onClick={onCancel}
                className="w-full rounded-lg border border-foreground/20 bg-foreground/15 px-4 py-2.5 font-sans text-sm text-foreground transition-colors hover:bg-foreground/20"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Payment Details */}
              <div className="mb-6 space-y-4">
                {request.description && (
                  <div>
                    <p className="mb-2 font-mono text-xs text-foreground/60">Description</p>
                    <p className="font-sans text-sm text-foreground">{request.description}</p>
                  </div>
                )}

                {request.endpoint && (
                  <div>
                    <p className="mb-2 font-mono text-xs text-foreground/60">Endpoint</p>
                    <code className="font-mono text-xs text-foreground/80 break-all">{request.endpoint}</code>
                  </div>
                )}

                <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-mono text-xs text-foreground/60">Amount</p>
                    <p className="font-sans text-2xl font-light text-foreground">
                      {request.amount} {request.token}
                    </p>
                  </div>
                  <div className="space-y-2 border-t border-foreground/10 pt-3">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-xs text-foreground/60">Network</p>
                      <p className="font-mono text-xs text-foreground">{request.network}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-xs text-foreground/60">Recipient</p>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs text-foreground">
                          {formatAddress(request.recipient)}
                        </code>
                        <button
                          onClick={() => handleCopy(request.recipient)}
                          className="text-foreground/60 transition-colors hover:text-foreground flex-shrink-0"
                          title="Copy address"
                        >
                          {copied ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    {user?.wallet?.address && (
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-mono text-xs text-foreground/60">From</p>
                        <div className="flex items-center gap-2">
                          <Wallet className="h-3.5 w-3.5 text-foreground/60 flex-shrink-0" />
                          <code className="font-mono text-xs text-foreground">
                            {formatAddress(user.wallet.address)}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                  <p className="flex-1 font-mono text-xs text-red-500 break-words">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  disabled={isProcessing}
                  className="flex-1 rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-2.5 font-sans text-sm text-foreground/80 transition-colors hover:bg-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || (!simulation && (!ready || !authenticated))}
                  className="flex-1 rounded-lg border border-foreground/20 bg-foreground/15 px-4 py-2.5 font-sans text-sm text-foreground transition-colors hover:bg-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {simulation ? "Simulating..." : "Processing..."}
                    </span>
                  ) : !simulation && (!ready || !authenticated) ? (
                    "Connect Wallet"
                  ) : (
                    simulation ? `Simulate ${request.amount} ${request.token}` : `Pay ${request.amount} ${request.token}`
                  )}
                </button>
              </div>
            </>
          )}
      </div>
    </div>
  )
}

