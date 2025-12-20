/**
 * Enhanced Payment Modal Component
 * 
 * A beautiful, feature-rich payment modal with success states,
 * transaction tracking, and explorer links.
 * 
 * Based on the dashboard preview component UI.
 */

import React, { useState, useEffect, useCallback } from 'react'
import type { PaymentRequest, PaymentResponse } from './types'
import { connectWallet, detectWalletProvider, ensureNetwork } from './wallet'
import { processPayment } from './payment'
import { getNetworkConfig } from './constants'

interface EnhancedPaymentModalProps {
  request: PaymentRequest
  onComplete: (payment: PaymentResponse) => void
  onCancel: () => void
  isOpen: boolean
  simulation?: boolean // When true, simulates payment without executing real transactions
  description?: string // Optional: Description of what's being paid for
  endpoint?: string // Optional: API endpoint being paid for
}

/**
 * Format address for display
 */
function formatAddress(address: string | null | undefined): string {
  if (!address || typeof address !== 'string') {
    return 'N/A'
  }
  if (address.length < 10) {
    return address
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Get block explorer URL for transaction
 */
function getExplorerUrl(txHash: string, network: string): string {
  const config = getNetworkConfig(network)
  if (config.blockExplorer) {
    return `${config.blockExplorer}/tx/${txHash}`
  }
  // Fallback to Mantle explorer
  if (network.includes('sepolia') || network.includes('testnet')) {
    return `https://explorer.sepolia.mantle.xyz/tx/${txHash}`
  }
  return `https://explorer.mantle.xyz/tx/${txHash}`
}

/**
 * Enhanced Payment Modal Component
 *
 * @example
 * ```tsx
 * <EnhancedPaymentModal
 *   request={paymentRequest}
 *   isOpen={isOpen}
 *   onComplete={(payment) => console.log('Paid:', payment.transactionHash)}
 *   onCancel={() => setIsOpen(false)}
 *   description="Premium API access"
 *   endpoint="/api/premium-data"
 * />
 * ```
 */
export function EnhancedPaymentModal({
  request,
  onComplete,
  onCancel,
  isOpen,
  simulation = false,
  description,
  endpoint,
}: EnhancedPaymentModalProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false)
      setError(null)
      setTxHash(null)
      setCopied(false)
      setWalletAddress(null)
    }
  }, [isOpen])

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  const checkWalletConnection = useCallback(async () => {
    const wallet = detectWalletProvider()
    if (wallet) {
      try {
        const account = await wallet.getAccount()
        if (account) {
          setWalletAddress(account)
        }
      } catch {
        // Not connected
      }
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      checkWalletConnection()
    }
  }, [isOpen, checkWalletConnection])

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      const wallet = detectWalletProvider()
      if (!wallet) {
        throw new Error('No wallet found. Please install MetaMask.')
      }

      const address = await connectWallet(wallet)
      setWalletAddress(address)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const handlePayment = async () => {
    // Simulation mode - just simulate the payment flow
    if (simulation) {
      setIsProcessing(true)
      setError(null)

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate a mock transaction hash
      const mockTxHash = `0x${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`
      setTxHash(mockTxHash)

      // Simulate success after another delay
      setTimeout(() => {
        const paymentResponse: PaymentResponse = {
          transactionHash: mockTxHash,
          timestamp: new Date().toISOString(),
        }
        setIsProcessing(false)
        onComplete(paymentResponse)
      }, 1500)
      return
    }

    // Real payment execution
    if (!walletAddress) {
      setError('Please connect your wallet first')
      return
    }

    try {
      setIsProcessing(true)
      setError(null)

      const wallet = detectWalletProvider()
      if (!wallet) {
        throw new Error('Wallet not connected')
      }

      // Ensure wallet is on the correct network before processing payment
      try {
        await ensureNetwork(wallet, request.network, true)
      } catch (networkError) {
        const errorMessage =
          networkError instanceof Error ? networkError.message : 'Network switch failed'
        throw new Error(
          `Failed to switch network: ${errorMessage}. Please ensure you're on ${request.network}`
        )
      }

      // Process the payment
      const payment = await processPayment(request, wallet)
      setTxHash(payment.transactionHash)

      // Wait a moment to show the success state
      setTimeout(() => {
        onComplete(payment)
      }, 2000)
    } catch (err) {
      // Provide more specific error messages
      let errorMessage = 'Payment failed'
      if (err instanceof Error) {
        errorMessage = err.message
        // Check for common error patterns
        if (err.message.includes('user rejected') || err.message.includes('User denied')) {
          errorMessage = 'Transaction was rejected. Please try again.'
        } else if (
          err.message.includes('insufficient funds') ||
          err.message.includes('insufficient balance')
        ) {
          errorMessage = 'Insufficient funds. Please ensure you have enough MNT in your wallet.'
        } else if (err.message.includes('network')) {
          errorMessage = err.message
        }
      }
      setError(errorMessage)
      setIsProcessing(false)
    }
  }

  // Validate request early
  if (!request || !request.amount || !request.recipient || !request.network) {
    console.error('Invalid payment request:', request)
    if (isOpen) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            padding: '1rem',
          }}
          onClick={(e) => e.target === e.currentTarget && onCancel()}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '28rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              background: 'rgba(24, 24, 27, 0.95)',
              padding: '1.5rem',
              color: '#fafafa',
            }}
          >
            <h2 style={{ margin: '0 0 1rem 0', color: 'rgba(239, 68, 68, 0.9)' }}>
              Invalid Payment Request
            </h2>
            <p style={{ margin: '0 0 1rem 0', color: 'rgba(250, 250, 250, 0.8)' }}>
              The payment request is missing required information. Please try again.
            </p>
            <button
              onClick={onCancel}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fafafa',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )
    }
    return null
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        padding: '1rem',
      }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '28rem',
          borderRadius: '0.75rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(24, 24, 27, 0.95)',
          padding: '1.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(16px)',
          color: '#fafafa',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 300,
                color: '#fafafa',
              }}
            >
              {txHash ? 'Payment Complete' : 'Payment Required'}
            </h2>
            {simulation && (
              <span
                style={{
                  borderRadius: '9999px',
                  border: '1px solid rgba(234, 179, 8, 0.4)',
                  background: 'rgba(234, 179, 8, 0.2)',
                  padding: '0.125rem 0.5rem',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: 'rgba(234, 179, 8, 1)',
                }}
              >
                SIMULATION
              </span>
            )}
          </div>
          {!isProcessing && (
            <button
              onClick={onCancel}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'rgba(250, 250, 250, 0.6)',
                lineHeight: 1,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close"
            >
              &times;
            </button>
          )}
        </div>

        {/* Success State */}
        {txHash ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem 0',
              }}
            >
              <div
                style={{
                  borderRadius: '50%',
                  background: 'rgba(34, 197, 94, 0.2)',
                  padding: '0.75rem',
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(34, 197, 94, 1)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            </div>
            <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <p
                  style={{
                    marginBottom: '0.5rem',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: 'rgba(250, 250, 250, 0.6)',
                  }}
                >
                  Transaction Hash
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '0.5rem 0.75rem',
                    overflow: 'hidden',
                  }}
                >
                  <code
                    style={{
                      minWidth: 0,
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      color: '#fafafa',
                    }}
                  >
                    {txHash}
                  </code>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      flexShrink: 0,
                    }}
                  >
                    <button
                      onClick={() => handleCopy(txHash)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        borderRadius: '0.375rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '0.25rem 0.625rem',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        color: '#fafafa',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                      title="Copy transaction hash"
                    >
                      {copied ? (
                        <>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          Copied
                        </>
                      ) : (
                        <>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                    <a
                      href={getExplorerUrl(txHash, request.network)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0.375rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '0.375rem',
                        color: 'rgba(250, 250, 250, 0.6)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                        e.currentTarget.style.color = '#fafafa'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                        e.currentTarget.style.color = 'rgba(250, 250, 250, 0.6)'
                      }}
                      title="View on explorer"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                        <path d="M15 3h6v6" />
                        <path d="M10 14L21 3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              <div>
                <p
                  style={{
                    marginBottom: '0.5rem',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: 'rgba(250, 250, 250, 0.6)',
                  }}
                >
                  Amount Paid
                </p>
                <p
                  style={{
                    fontFamily: 'sans-serif',
                    fontSize: '1rem',
                    color: '#fafafa',
                    margin: 0,
                  }}
                >
                  {request.amount} {request.token}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              style={{
                width: '100%',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '0.625rem 1rem',
                fontFamily: 'sans-serif',
                fontSize: '0.875rem',
                color: '#fafafa',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Payment Details */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {description && (
                <div>
                  <p
                    style={{
                      marginBottom: '0.5rem',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      color: 'rgba(250, 250, 250, 0.6)',
                    }}
                  >
                    Description
                  </p>
                  <p
                    style={{
                      fontFamily: 'sans-serif',
                      fontSize: '0.875rem',
                      color: '#fafafa',
                      margin: 0,
                    }}
                  >
                    {description}
                  </p>
                </div>
              )}

              {endpoint && (
                <div>
                  <p
                    style={{
                      marginBottom: '0.5rem',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      color: 'rgba(250, 250, 250, 0.6)',
                    }}
                  >
                    Endpoint
                  </p>
                  <code
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      color: 'rgba(250, 250, 250, 0.8)',
                      wordBreak: 'break-all',
                    }}
                  >
                    {endpoint}
                  </code>
                </div>
              )}

              <div
                style={{
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '1rem',
                }}
              >
                <div
                  style={{
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      color: 'rgba(250, 250, 250, 0.6)',
                      margin: 0,
                    }}
                  >
                    Amount
                  </p>
                  <p
                    style={{
                      fontFamily: 'sans-serif',
                      fontSize: '1.5rem',
                      fontWeight: 300,
                      color: '#fafafa',
                      margin: 0,
                    }}
                  >
                    {request.amount} {request.token}
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    paddingTop: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        color: 'rgba(250, 250, 250, 0.6)',
                        margin: 0,
                      }}
                    >
                      Network
                    </p>
                    <p
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        color: '#fafafa',
                        margin: 0,
                      }}
                    >
                      {request.network}
                    </p>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        color: 'rgba(250, 250, 250, 0.6)',
                        margin: 0,
                      }}
                    >
                      Recipient
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <code
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          color: '#fafafa',
                        }}
                      >
                        {formatAddress(request.recipient)}
                      </code>
                      <button
                        onClick={() => handleCopy(request.recipient)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'rgba(250, 250, 250, 0.6)',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#fafafa')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250, 250, 250, 0.6)')}
                        title="Copy address"
                      >
                        {copied ? (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="rgba(34, 197, 94, 1)"
                            strokeWidth="2"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        ) : (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {walletAddress && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          color: 'rgba(250, 250, 250, 0.6)',
                          margin: 0,
                        }}
                      >
                        From
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="rgba(250, 250, 250, 0.6)"
                          strokeWidth="2"
                        >
                          <path d="M21 12V7H5a2 2 0 01 0-4h14v4" />
                          <path d="M3 5v14a2 2 0 002 2h16v-5" />
                          <path d="M5 21a2 2 0 110-4h14" />
                        </svg>
                        <code
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            color: '#fafafa',
                          }}
                        >
                          {formatAddress(walletAddress)}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'start',
                  gap: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  padding: '0.75rem',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(239, 68, 68, 1)"
                  strokeWidth="2"
                  style={{ flexShrink: 0, marginTop: '0.125rem' }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
                <p
                  style={{
                    flex: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: 'rgba(239, 68, 68, 1)',
                    wordBreak: 'break-word',
                    margin: 0,
                  }}
                >
                  {error}
                </p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={onCancel}
                disabled={isProcessing}
                style={{
                  flex: 1,
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '0.625rem 1rem',
                  fontFamily: 'sans-serif',
                  fontSize: '0.875rem',
                  color: 'rgba(250, 250, 250, 0.8)',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  opacity: isProcessing ? 0.5 : 1,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isProcessing) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  if (!isProcessing) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={walletAddress ? handlePayment : handleConnect}
                disabled={isProcessing || isConnecting}
                style={{
                  flex: 1,
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '0.625rem 1rem',
                  fontFamily: 'sans-serif',
                  fontSize: '0.875rem',
                  color: '#fafafa',
                  cursor: isProcessing || isConnecting ? 'not-allowed' : 'pointer',
                  opacity: isProcessing || isConnecting ? 0.5 : 1,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isProcessing && !isConnecting)
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                }}
                onMouseLeave={(e) => {
                  if (!isProcessing && !isConnecting)
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                }}
              >
                {isProcessing ? (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{
                        animation: 'spin 1s linear infinite',
                      }}
                    >
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                    {simulation ? 'Simulating...' : 'Processing...'}
                  </span>
                ) : isConnecting ? (
                  'Connecting...'
                ) : !walletAddress ? (
                  'Connect Wallet'
                ) : simulation ? (
                  `Simulate ${request.amount} ${request.token}`
                ) : (
                  `Pay ${request.amount} ${request.token}`
                )}
              </button>
            </div>
          </>
        )}
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

