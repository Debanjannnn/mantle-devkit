/**
 * Payment Verification
 *
 * Handles direct blockchain verification of payments
 */

import type { ProjectConfig } from './platform'
import { verifyPaymentOnChain, type BlockchainVerification } from './blockchain'

/** Payment verification result */
export interface PaymentVerification {
  valid: boolean
  transactionHash?: string
  amount?: string
  token?: string
  error?: string
}

/** Payment receipt from client (in request headers) */
export interface PaymentReceipt {
  transactionHash: string
  timestamp?: string
}

/**
 * Verify payment on blockchain
 *
 * @param receipt - Payment receipt from request headers
 * @param config - Project configuration
 * @param requiredAmount - Required payment amount
 * @param requiredToken - Required payment token
 * @param customRpcUrl - Custom RPC URL for blockchain verification
 */
export async function verifyPayment(
  receipt: PaymentReceipt,
  config: ProjectConfig,
  requiredAmount: string,
  requiredToken: string,
  _useBlockchain = true,
  customRpcUrl?: string
): Promise<PaymentVerification> {
  const result = await verifyPaymentOnChain(
    receipt.transactionHash,
    config,
    requiredAmount,
    requiredToken,
    customRpcUrl
  )

  return {
    valid: result.valid,
    transactionHash: result.transactionHash,
    amount: result.amount,
    token: result.token,
    error: result.error,
  }
}

/**
 * Extract payment receipt from request headers
 */
export function extractPaymentReceipt(
  headers: Headers | Record<string, string | string[] | undefined>
): PaymentReceipt | null {
  const getHeader = (name: string): string | null => {
    if (headers instanceof Headers) {
      return headers.get(name)
    }
    const value = headers[name.toLowerCase()] || headers[name]
    return Array.isArray(value) ? value[0] || null : value || null
  }

  const transactionHash =
    getHeader('x-402-transaction-hash') || getHeader('X-402-Transaction-Hash')

  if (!transactionHash) {
    return null
  }

  return {
    transactionHash,
    timestamp: getHeader('x-402-timestamp') || getHeader('X-402-Timestamp') || undefined,
  }
}
