/**
 * x402 Server SDK
 *
 * Server middleware for x402 paid APIs on Mantle Network
 *
 * @example
 * ```typescript
 * import { x402 } from '@x402-devkit/sdk/server'
 *
 * // Basic usage (mainnet)
 * app.use('/api/data', x402({ price: '0.001', token: 'MNT' }))
 *
 * // Testnet
 * app.use('/api/data', x402({ price: '0.001', token: 'MNT', testnet: true }))
 *
 * // Custom network
 * app.use('/api/data', x402({
 *   price: '0.001',
 *   token: 'MNT',
 *   network: 'my-network',
 *   customNetwork: {
 *     chainId: 12345,
 *     rpcUrl: 'https://my-rpc.example.com'
 *   }
 * }))
 * ```
 */

// Main middleware export
export { x402 } from './hono'

// Express middleware
export { x402Express, resetExpressMiddleware } from './express'

// Platform configuration
export {
  initializePlatform,
  getProjectConfig,
  clearCache,
  type ProjectConfig,
} from './platform'

// Payment verification
export {
  verifyPayment,
  extractPaymentReceipt,
  type PaymentVerification,
  type PaymentReceipt,
} from './verify'

// Blockchain verification
export { verifyPaymentOnChain, type BlockchainVerification } from './blockchain'

// Middleware utilities
export {
  processPaymentMiddleware,
  type X402Options,
  type MiddlewareResult,
  type PaymentRequiredResponse,
} from './middleware'

// Constants and configuration
export {
  // Network presets
  NETWORKS,
  TOKENS,
  DEFAULT_PLATFORM_URL,

  // Network utilities
  getNetworkConfig,
  getTokenConfig,
  getRpcUrl,
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

// Analytics and payment tracking
export {
  logPayment,
  type PaymentEvent,
} from './analytics'

// Endpoint registration
export {
  registerEndpoint,
  type EndpointRegistration,
} from './endpoint-registry'
