/**
 * Constants and Configuration
 *
 * Centralized configuration for networks, tokens, and RPC endpoints
 * Supports both preset networks (mainnet/testnet) and custom configurations
 */

/** Supported network identifiers */
export type NetworkId = 'mantle' | 'mantle-sepolia' | 'mantle-testnet'

/** Network environment */
export type NetworkEnvironment = 'mainnet' | 'testnet'

/** Network configuration */
export interface NetworkConfig {
  chainId: number
  rpcUrl: string
  name: string
  environment: NetworkEnvironment
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  blockExplorer: string
}

/** Token configuration */
export interface TokenConfig {
  address: string
  decimals: number
  symbol: string
}

/** Custom network configuration (user-provided) */
export interface CustomNetworkConfig {
  chainId: number
  rpcUrl: string
  name?: string
  environment?: NetworkEnvironment
  blockExplorer?: string
}

/** Custom token configuration (user-provided) */
export interface CustomTokenConfig {
  [symbol: string]: {
    address: string
    decimals: number
  }
}

/** Network configurations */
export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  mantle: {
    chainId: 5000,
    rpcUrl: 'https://rpc.mantle.xyz',
    name: 'Mantle',
    environment: 'mainnet',
    nativeCurrency: { name: 'Mantle', symbol: 'MNT', decimals: 18 },
    blockExplorer: 'https://explorer.mantle.xyz',
  },
  'mantle-sepolia': {
    chainId: 5003,
    rpcUrl: 'https://rpc.sepolia.mantle.xyz',
    name: 'Mantle Sepolia',
    environment: 'testnet',
    nativeCurrency: { name: 'Mantle', symbol: 'MNT', decimals: 18 },
    blockExplorer: 'https://explorer.sepolia.mantle.xyz',
  },
  'mantle-testnet': {
    chainId: 5003,
    rpcUrl: 'https://rpc.sepolia.mantle.xyz',
    name: 'Mantle Testnet',
    environment: 'testnet',
    nativeCurrency: { name: 'Mantle', symbol: 'MNT', decimals: 18 },
    blockExplorer: 'https://explorer.sepolia.mantle.xyz',
  },
} as const

/** Token addresses by network */
export const TOKENS: Record<NetworkId, Record<string, TokenConfig>> = {
  mantle: {
    USDC: {
      address: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9',
      decimals: 6,
      symbol: 'USDC',
    },
    USDT: {
      address: '0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE',
      decimals: 6,
      symbol: 'USDT',
    },
    mETH: {
      address: '0xcDA86A272531e8640cD7F1a92c01839911B90bb0',
      decimals: 18,
      symbol: 'mETH',
    },
    WMNT: {
      address: '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8',
      decimals: 18,
      symbol: 'WMNT',
    },
  },
  'mantle-sepolia': {
    USDC: {
      address: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9',
      decimals: 6,
      symbol: 'USDC',
    },
    mETH: {
      address: '0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111',
      decimals: 18,
      symbol: 'mETH',
    },
    WMNT: {
      address: '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8',
      decimals: 18,
      symbol: 'WMNT',
    },
  },
  'mantle-testnet': {
    USDC: {
      address: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9',
      decimals: 6,
      symbol: 'USDC',
    },
    mETH: {
      address: '0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111',
      decimals: 18,
      symbol: 'mETH',
    },
    WMNT: {
      address: '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8',
      decimals: 18,
      symbol: 'WMNT',
    },
  },
} as const

/** ERC20 Transfer event signature */
export const ERC20_TRANSFER_SIGNATURE = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

/** Default platform URL (for project config) */
export const DEFAULT_PLATFORM_URL = 'https://mantle-x402.vercel.app'

/** Amount tolerance for payment verification (0.001 tokens) */
export const AMOUNT_TOLERANCE = BigInt(1e15)

/** Custom network registry (populated at runtime) */
const customNetworks: Map<string, NetworkConfig> = new Map()

/** Custom token registry (populated at runtime) */
const customTokens: Map<string, Map<string, TokenConfig>> = new Map()

/**
 * Register a custom network configuration
 *
 * @example
 * ```typescript
 * registerCustomNetwork('my-network', {
 *   chainId: 12345,
 *   rpcUrl: 'https://my-rpc.example.com',
 *   name: 'My Custom Network',
 *   environment: 'testnet'
 * })
 * ```
 */
export function registerCustomNetwork(networkId: string, config: CustomNetworkConfig): void {
  customNetworks.set(networkId.toLowerCase(), {
    chainId: config.chainId,
    rpcUrl: config.rpcUrl,
    name: config.name || networkId,
    environment: config.environment || 'testnet',
    nativeCurrency: { name: 'Native', symbol: 'ETH', decimals: 18 },
    blockExplorer: config.blockExplorer || '',
  })
}

/**
 * Register custom tokens for a network
 *
 * @example
 * ```typescript
 * registerCustomTokens('mantle', {
 *   'MYTOKEN': { address: '0x...', decimals: 18 }
 * })
 * ```
 */
export function registerCustomTokens(networkId: string, tokens: CustomTokenConfig): void {
  const networkKey = networkId.toLowerCase()
  if (!customTokens.has(networkKey)) {
    customTokens.set(networkKey, new Map())
  }
  const tokenMap = customTokens.get(networkKey)!
  for (const [symbol, config] of Object.entries(tokens)) {
    tokenMap.set(symbol.toUpperCase(), {
      address: config.address,
      decimals: config.decimals,
      symbol: symbol.toUpperCase(),
    })
  }
}

/**
 * Check if network is testnet
 */
export function isTestnet(network: string): boolean {
  const config = getNetworkConfig(network)
  return config.environment === 'testnet'
}

/**
 * Check if network is mainnet
 */
export function isMainnet(network: string): boolean {
  const config = getNetworkConfig(network)
  return config.environment === 'mainnet'
}

/**
 * Get network configuration (supports preset and custom networks)
 */
export function getNetworkConfig(network: string): NetworkConfig {
  const networkKey = network.toLowerCase()

  // Check custom networks first
  const custom = customNetworks.get(networkKey)
  if (custom) {
    return custom
  }

  // Check preset networks
  const preset = NETWORKS[networkKey as NetworkId]
  if (preset) {
    return preset
  }

  // Default to mainnet
  return NETWORKS.mantle
}

/**
 * Get token configuration (supports preset and custom tokens)
 */
export function getTokenConfig(token: string, network: string): TokenConfig | null {
  const networkKey = network.toLowerCase()
  const tokenKey = token.toUpperCase()

  // Native MNT doesn't have a token config
  if (tokenKey === 'MNT') {
    return null
  }

  // Check custom tokens first
  const customMap = customTokens.get(networkKey)
  if (customMap?.has(tokenKey)) {
    return customMap.get(tokenKey)!
  }

  // Check preset tokens
  return TOKENS[networkKey as NetworkId]?.[tokenKey] || null
}

/**
 * Get RPC URL for network (with environment override)
 */
export function getRpcUrl(network: string, customRpcUrl?: string): string {
  // Custom RPC takes priority
  if (customRpcUrl) {
    return customRpcUrl
  }

  // Check environment variables
  const envRpc = process.env.X402_RPC_URL || process.env[`X402_RPC_URL_${network.toUpperCase()}`]
  if (envRpc) {
    return envRpc
  }

  return getNetworkConfig(network).rpcUrl
}

/**
 * Get chain ID for network
 */
export function getChainId(network: string): number {
  return getNetworkConfig(network).chainId
}

/**
 * Get all available networks (preset + custom)
 */
export function getAvailableNetworks(): string[] {
  const preset = Object.keys(NETWORKS)
  const custom = Array.from(customNetworks.keys())
  return [...new Set([...preset, ...custom])]
}

/**
 * Get networks by environment
 */
export function getNetworksByEnvironment(env: NetworkEnvironment): string[] {
  return getAvailableNetworks().filter((network) => {
    const config = getNetworkConfig(network)
    return config.environment === env
  })
}
