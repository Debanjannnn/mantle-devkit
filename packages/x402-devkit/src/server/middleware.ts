/**
 * Core Payment Middleware Logic
 *
 * Framework-agnostic payment verification middleware
 */

import { getProjectConfig } from './platform'
import { extractPaymentReceipt, verifyPayment } from './verify'
import {
  type CustomNetworkConfig,
  type CustomTokenConfig,
  registerCustomNetwork,
  registerCustomTokens,
} from './constants'

/** x402 middleware options */
export interface X402Options {
  /** Payment amount (e.g., "0.001") */
  price: string
  /** Payment token (e.g., "USDC", "MNT") */
  token: string
  /** Network identifier (defaults to project network) */
  network?: string
  /** Custom RPC URL (overrides default for the network) */
  rpcUrl?: string
  /** Use testnet (shorthand for network: 'mantle-sepolia') */
  testnet?: boolean
  /** Custom network configuration */
  customNetwork?: CustomNetworkConfig
  /** Custom token configurations for this network */
  customTokens?: CustomTokenConfig
}

/** HTTP 402 Payment Required response */
export interface PaymentRequiredResponse {
  status: 402
  headers: Record<string, string>
  body: {
    error: 'Payment Required'
    amount: string
    token: string
    network: string
    chainId: number
    recipient: string
  }
}

/** Middleware result */
export interface MiddlewareResult {
  allowed: boolean
  paymentRequired?: PaymentRequiredResponse
  error?: {
    status: number
    message: string
  }
}

/**
 * Resolve network from options
 */
function resolveNetwork(options: X402Options, projectNetwork: string): string {
  // Explicit network takes priority
  if (options.network) {
    return options.network
  }

  // testnet shorthand
  if (options.testnet) {
    return 'mantle-sepolia'
  }

  // Fall back to project network
  return projectNetwork
}

/**
 * Create HTTP 402 Payment Required response
 */
function createPaymentRequiredResponse(
  options: X402Options,
  config: { payTo: string; network: string },
  chainId: number
): PaymentRequiredResponse {
  const network = resolveNetwork(options, config.network)

  return {
    status: 402,
    headers: {
      'Content-Type': 'application/json',
      'X-402-Amount': options.price,
      'X-402-Token': options.token,
      'X-402-Network': network,
      'X-402-Chain-Id': chainId.toString(),
      'X-402-Recipient': config.payTo,
    },
    body: {
      error: 'Payment Required',
      amount: options.price,
      token: options.token,
      network,
      chainId,
      recipient: config.payTo,
    },
  }
}

/**
 * Process payment middleware
 *
 * Core logic for payment verification:
 * 1. Gets project config
 * 2. Extracts payment receipt from headers
 * 3. Returns 402 if no payment
 * 4. Verifies payment on blockchain if present
 */
export async function processPaymentMiddleware(
  options: X402Options,
  headers: Headers | Record<string, string | string[] | undefined>
): Promise<MiddlewareResult> {
  try {
    // Register custom network if provided
    if (options.customNetwork) {
      const networkId = options.network || 'custom-network'
      registerCustomNetwork(networkId, options.customNetwork)
    }

    // Register custom tokens if provided
    if (options.customTokens) {
      const config = getProjectConfig()
      const network = resolveNetwork(options, config.network)
      registerCustomTokens(network, options.customTokens)
    }

    const config = getProjectConfig()
    const network = resolveNetwork(options, config.network)

    // Import getChainId dynamically to avoid circular dependency
    const { getChainId } = await import('./constants')
    const chainId = getChainId(network)

    const receipt = extractPaymentReceipt(headers)

    // No payment → return 402 Payment Required
    if (!receipt) {
      return {
        allowed: false,
        paymentRequired: createPaymentRequiredResponse(options, config, chainId),
      }
    }

    // Verify payment on blockchain
    const verification = await verifyPayment(
      receipt,
      { ...config, network },
      options.price,
      options.token,
      true,
      options.rpcUrl
    )

    if (!verification.valid) {
      return {
        allowed: false,
        error: {
          status: 402,
          message: verification.error || 'Payment verification failed',
        },
      }
    }

    return { allowed: true }
  } catch (error) {
    return {
      allowed: false,
      error: {
        status: 500,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
    }
  }
}
