/**
 * x402 Client SDK
 *
 * Client SDK for x402 payments on Mantle Network
 *
 * @example
 * ```typescript
 * import { x402Fetch } from '@x402-devkit/sdk/client'
 *
 * // Basic usage (auto-detects network from 402 response)
 * const response = await x402Fetch('https://api.example.com/data')
 *
 * // With testnet option
 * const response = await x402Fetch('https://api.example.com/data', undefined, {
 *   testnet: true
 * })
 *
 * // With custom network
 * import { registerCustomNetwork } from '@x402-devkit/sdk/client'
 * registerCustomNetwork('my-network', { chainId: 12345, rpcUrl: 'https://...' })
 * ```
 *
 * For React components:
 * ```tsx
 * import { PaymentModal } from '@x402-devkit/sdk/client/react'
 * ```
 */

// Core client
export { x402Client, x402Fetch, X402Client } from './client'

// Payment modal (vanilla JS)
export { createPaymentModal } from './modal'
export { createVanillaPaymentModal } from './modal-vanilla'

// Wallet utilities
export {
  connectWallet,
  detectWalletProvider,
  MetaMaskProvider,
  ensureNetwork,
  getAddNetworkParams,
} from './wallet'

// Payment processing
export { processPayment } from './payment'

// Types
export type {
  PaymentRequest,
  PaymentResponse,
  X402ClientOptions,
  TransactionRequest,
  WalletProvider,
  EIP1193Provider,
  AddEthereumChainParameter,
} from './types'

// Constants and configuration
export {
  // Network presets
  NETWORKS,
  TOKENS,

  // Treasury
  TREASURY_ADDRESS,
  TREASURY_ADMIN,
  PLATFORM_FEE_BPS,

  // Network utilities
  getNetworkConfig,
  getTokenConfig,
  getChainId,
  isTestnet,
  isMainnet,
  getAvailableNetworks,
  getNetworksByEnvironment,

  // Custom network/token registration
  registerCustomNetwork,
  registerCustomTokens,

  // Types
  type NetworkId,
  type NetworkEnvironment,
  type NetworkConfig,
  type TokenConfig,
  type CustomNetworkConfig,
  type CustomTokenConfig,
} from './constants'
