/**
 * Analytics & Payment Tracking
 *
 * Optional utility to log payment events to the platform for dashboard tracking
 */

import { getProjectConfig } from './platform'
import { DEFAULT_PLATFORM_URL } from './constants'

/** Payment event data */
export interface PaymentEvent {
  transactionHash: string
  amount: string
  token: string
  network: string
  endpoint?: string // API endpoint that was paid for
  method?: string // HTTP method (GET, POST, etc.)
  fromAddress?: string // Payer wallet address
  toAddress: string // Recipient wallet address
  blockNumber?: number // Block number of transaction
  status?: 'SUCCESS' | 'FAILED' | 'PENDING'
}

/**
 * Get platform API base URL
 */
function getPlatformBaseUrl(): string {
  return (
    process.env.X402_PLATFORM_URL ||
    process.env.NEXT_PUBLIC_X402_PLATFORM_URL ||
    DEFAULT_PLATFORM_URL
  )
}

/**
 * Log a payment event to the platform
 *
 * This is optional - call this after successful payment verification
 * to track endpoint usage in the dashboard.
 *
 * @param event - Payment event data
 * @param requestPath - Optional: Request path (e.g., "/api/premium-data")
 * @param requestMethod - Optional: HTTP method (e.g., "GET", "POST")
 *
 * @example
 * ```typescript
 * import { logPayment } from '@x402-devkit/sdk/server'
 *
 * // After successful payment verification
 * await logPayment({
 *   transactionHash: receipt.transactionHash,
 *   amount: '0.001',
 *   token: 'MNT',
 *   network: 'mantle',
 *   toAddress: config.payTo,
 * }, '/api/premium-data', 'GET')
 * ```
 */
export async function logPayment(
  event: PaymentEvent,
  requestPath?: string,
  requestMethod?: string
): Promise<void> {
  try {
    const config = getProjectConfig()
    const baseUrl = getPlatformBaseUrl()
    const url = `${baseUrl}/api/payments`

    const payload = {
      appId: config.appId,
      transactionHash: event.transactionHash,
      amount: event.amount,
      token: event.token,
      network: event.network || config.network,
      endpoint: event.endpoint || requestPath || null,
      method: event.method || requestMethod || null,
      fromAddress: event.fromAddress || null,
      toAddress: event.toAddress || config.payTo,
      blockNumber: event.blockNumber || null,
      status: event.status || 'SUCCESS',
    }

    // Fire and forget - don't block on analytics
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((error) => {
      // Silently fail - analytics shouldn't break the payment flow
      console.warn('Failed to log payment event:', error)
    })
  } catch (error) {
    // Silently fail - analytics shouldn't break the payment flow
    console.warn('Failed to log payment event:', error)
  }
}

