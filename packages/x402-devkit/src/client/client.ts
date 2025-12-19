/**
 * x402 Client
 *
 * Main client that intercepts HTTP 402 responses and handles payment flow
 */

import type { X402ClientOptions, PaymentRequest, PaymentResponse, WalletProvider } from './types'
import { detectWalletProvider } from './wallet'
import { createPaymentModal } from './modal'

/**
 * Parse HTTP 402 Payment Required response
 */
function parse402Response(response: Response): PaymentRequest | null {
  if (response.status !== 402) {
    return null
  }

  const amount = response.headers.get('X-402-Amount') || response.headers.get('x-402-amount')
  const token = response.headers.get('X-402-Token') || response.headers.get('x-402-token')
  const network = response.headers.get('X-402-Network') || response.headers.get('x-402-network')
  const recipient =
    response.headers.get('X-402-Recipient') || response.headers.get('x-402-recipient')

  if (!amount || !token || !network || !recipient) {
    return null
  }

  return { amount, token, network, recipient }
}

/**
 * Add payment headers to request
 */
function addPaymentHeaders(headers: HeadersInit, payment: PaymentResponse): Headers {
  const newHeaders = new Headers(headers)

  newHeaders.set('X-402-Transaction-Hash', payment.transactionHash)

  if (payment.timestamp) {
    newHeaders.set('X-402-Timestamp', payment.timestamp)
  }

  return newHeaders
}

/**
 * x402 Client class
 *
 * Provides automatic HTTP 402 handling for fetch requests
 */
export class X402Client {
  private options: X402ClientOptions
  private wallet: WalletProvider | null = null

  constructor(options: X402ClientOptions = {}) {
    this.options = {
      autoRetry: true,
      ...options,
    }
  }

  /**
   * Initialize wallet connection
   */
  async initialize(): Promise<void> {
    if (this.options.walletProvider) {
      this.wallet = this.options.walletProvider
    } else {
      this.wallet = detectWalletProvider()
    }
  }

  /**
   * Fetch with automatic 402 handling
   */
  async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const response = await globalThis.fetch(input, init)

    const paymentRequest = parse402Response(response)
    if (!paymentRequest) {
      return response
    }

    // Handle payment
    let payment: PaymentResponse | null = null

    if (this.options.paymentModal) {
      payment = await this.options.paymentModal(paymentRequest)
    } else {
      payment = await createPaymentModal(paymentRequest)
    }

    if (!payment) {
      // User cancelled or payment failed
      return response
    }

    // Retry request with payment headers
    if (this.options.autoRetry !== false) {
      const newHeaders = addPaymentHeaders(init?.headers || {}, payment)

      return globalThis.fetch(input, {
        ...init,
        headers: newHeaders,
      })
    }

    // Return payment info (user will retry manually)
    return new Response(JSON.stringify(payment), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

/**
 * Create x402 client instance
 */
export function x402Client(options?: X402ClientOptions): X402Client {
  return new X402Client(options)
}

/**
 * Enhanced fetch with automatic 402 handling
 *
 * @example
 * ```typescript
 * const response = await x402Fetch('https://api.example.com/data')
 * ```
 */
export async function x402Fetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: X402ClientOptions
): Promise<Response> {
  const client = x402Client(options)
  await client.initialize()
  return client.fetch(input, init)
}
