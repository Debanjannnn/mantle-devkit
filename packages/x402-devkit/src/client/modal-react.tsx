/**
 * React Payment Modal Component
 */

import React, { useState, useEffect, useCallback } from 'react'
import type { PaymentRequest, PaymentResponse } from './types'
import { connectWallet, detectWalletProvider, ensureNetwork } from './wallet'
import { processPayment } from './payment'

interface PaymentModalProps {
  request: PaymentRequest
  onComplete: (payment: PaymentResponse) => void
  onCancel: () => void
  isOpen: boolean
  /** Custom logo URL or base64 data URI */
  logo?: string
  /** Logo alt text */
  logoAlt?: string
}

/** Default X402 logo as SVG data URI - styled to match the x402 brand */
const DEFAULT_LOGO = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%231a1a2e'/%3E%3Cstop offset='100%25' style='stop-color:%230f0f1a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='120' height='120' rx='24' fill='url(%23bg)'/%3E%3Crect x='4' y='4' width='112' height='112' rx='20' fill='none' stroke='%23ffffff15' stroke-width='1'/%3E%3Ctext x='60' y='72' text-anchor='middle' font-family='-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif' font-size='32' font-weight='600' fill='%23ffffff'%3Ex402%3C/text%3E%3C/svg%3E`

type Step = 'connect' | 'confirm' | 'processing'

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
 * Payment Modal Component
 *
 * @example
 * ```tsx
 * <PaymentModal
 *   request={paymentRequest}
 *   isOpen={isOpen}
 *   onComplete={(payment) => console.log('Paid:', payment.transactionHash)}
 *   onCancel={() => setIsOpen(false)}
 * />
 * ```
 */
export function PaymentModal({ request, onComplete, onCancel, isOpen, logo, logoAlt = 'x402' }: PaymentModalProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('connect')

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
            <h2 style={{ margin: '0 0 1rem 0', color: 'rgba(239, 68, 68, 0.9)' }}>Invalid Payment Request</h2>
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

  const checkWalletConnection = useCallback(async () => {
    const wallet = detectWalletProvider()
    if (wallet) {
      try {
        const account = await wallet.getAccount()
        if (account) {
          setWalletAddress(account)
          setStep('confirm')
        }
      } catch {
        // Not connected
      }
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      checkWalletConnection()
    } else {
      // Reset state when modal closes
      setStep('connect')
      setError(null)
      setWalletAddress(null)
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
      setStep('confirm')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const handlePay = async () => {
    setIsProcessing(true)
    setError(null)
    setStep('processing')

    try {
      const wallet = detectWalletProvider()
      if (!wallet) {
        throw new Error('Wallet not connected')
      }

      // Ensure wallet is on the correct network before processing payment
      try {
        await ensureNetwork(wallet, request.network, true)
      } catch (networkError) {
        const errorMessage = networkError instanceof Error ? networkError.message : 'Network switch failed'
        throw new Error(`Failed to switch network: ${errorMessage}. Please ensure you're on ${request.network}`)
      }

      // Process the payment
      const payment = await processPayment(request, wallet)
      onComplete(payment)
    } catch (err) {
      // Provide more specific error messages
      let errorMessage = 'Payment failed'
      if (err instanceof Error) {
        errorMessage = err.message
        // Check for common error patterns
        if (err.message.includes('user rejected') || err.message.includes('User denied')) {
          errorMessage = 'Transaction was rejected. Please try again.'
        } else if (err.message.includes('insufficient funds') || err.message.includes('insufficient balance')) {
          errorMessage = 'Insufficient funds. Please ensure you have enough MNT in your wallet.'
        } else if (err.message.includes('network')) {
          errorMessage = err.message
        }
      }
      setError(errorMessage)
      setStep('confirm')
    } finally {
      setIsProcessing(false)
    }
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
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img
              src={logo || DEFAULT_LOGO}
              alt={logoAlt}
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '0.5rem',
                objectFit: 'contain',
              }}
            />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 300 }}>Payment Required</h2>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'rgba(250, 250, 250, 0.6)',
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {/* Payment Details */}
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}
          >
            <span
              style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(250,250,250,0.6)' }}
            >
              Amount
            </span>
            <span style={{ fontSize: '1.125rem', fontWeight: 500 }}>
              {request.amount} {request.token}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}
          >
            <span
              style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(250,250,250,0.6)' }}
            >
              Network
            </span>
            <span style={{ fontSize: '0.875rem' }}>{request.network}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span
              style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(250,250,250,0.6)' }}
            >
              Recipient
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
              {formatAddress(request.recipient)}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              background: 'rgba(239, 68, 68, 0.1)',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: 'rgba(239, 68, 68, 0.9)',
            }}
          >
            {error}
          </div>
        )}

        {/* Connect Step */}
        {step === 'connect' && (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.05)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              opacity: isConnecting ? 0.7 : 1,
              color: '#fafafa',
            }}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}

        {/* Confirm Step */}
        {step === 'confirm' && walletAddress && (
          <>
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <p
                style={{
                  margin: '0 0 0.25rem 0',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: 'rgba(250, 250, 250, 0.6)',
                }}
              >
                Connected Wallet
              </p>
              <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {formatAddress(walletAddress)}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={onCancel}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  color: 'rgba(250, 250, 250, 0.8)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                disabled={isProcessing}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  opacity: isProcessing ? 0.7 : 1,
                  color: '#fafafa',
                }}
              >
                Pay {request.amount} {request.token}
              </button>
            </div>
          </>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem 0',
            }}
          >
            <div
              style={{
                width: '2rem',
                height: '2rem',
                marginBottom: '1rem',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderTopColor: '#fafafa',
                borderRadius: '50%',
                animation: 'x402-spin 1s linear infinite',
              }}
            />
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(250, 250, 250, 0.6)' }}>
              Processing payment...
            </p>
            <p
              style={{
                margin: '0.5rem 0 0 0',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                color: 'rgba(250, 250, 250, 0.4)',
              }}
            >
              Please confirm the transaction in your wallet
            </p>
            <style>{`
              @keyframes x402-spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  )
}
