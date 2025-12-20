/**
 * Type definitions for x402 client SDK
 */

import type { CustomNetworkConfig, CustomTokenConfig } from './constants'

/** Payment request from HTTP 402 response */
export interface PaymentRequest {
  amount: string
  token: string
  network: string
  chainId?: number
  recipient: string
  description?: string // Optional: Description of what's being paid for
  endpoint?: string // Optional: API endpoint being paid for
}

/** Payment response after successful payment */
export interface PaymentResponse {
  transactionHash: string
  timestamp?: string
}

/** x402 Client options */
export interface X402ClientOptions {
  /** Wallet provider (MetaMask, WalletConnect, etc.) */
  walletProvider?: WalletProvider
  /** Use testnet (mantle-sepolia) */
  testnet?: boolean
  /** Network identifier (e.g., 'mantle', 'mantle-sepolia') */
  network?: string
  /** Custom network configuration */
  customNetwork?: CustomNetworkConfig
  /** Custom token configurations */
  customTokens?: CustomTokenConfig
  /** Custom payment modal handler */
  paymentModal?: (request: PaymentRequest) => Promise<PaymentResponse | null>
  /** Auto-retry after payment (default: true) */
  autoRetry?: boolean
  /** Auto-switch network if needed (default: true) */
  autoSwitchNetwork?: boolean
}

/** EIP-1193 provider request arguments */
export interface EIP1193RequestArgs {
  method: string
  params?: readonly unknown[] | object
}

/** EIP-1193 compatible provider */
export interface EIP1193Provider {
  request(args: EIP1193RequestArgs): Promise<unknown>
  on?(event: string, listener: (...args: unknown[]) => void): void
  removeListener?(event: string, listener: (...args: unknown[]) => void): void
  isMetaMask?: boolean
}

/** Network parameters for wallet_addEthereumChain */
export interface AddEthereumChainParameter {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
}

/** Wallet provider interface */
export interface WalletProvider {
  /** Check if wallet is available */
  isAvailable(): boolean
  /** Connect wallet and return address */
  connect(): Promise<string>
  /** Get current account */
  getAccount(): Promise<string | null>
  /** Get current chain ID */
  getChainId(): Promise<number | null>
  /** Switch network */
  switchNetwork(chainId: number): Promise<void>
  /** Add and switch to network */
  addNetwork(params: AddEthereumChainParameter): Promise<void>
  /** Send transaction */
  sendTransaction(tx: TransactionRequest): Promise<string>
  /** Sign message (optional) */
  signMessage?(message: string): Promise<string>
}

/** Transaction request */
export interface TransactionRequest {
  from?: string
  to: string
  value?: string
  data?: string
  gasLimit?: string
  gasPrice?: string
}

/** Window with ethereum provider */
export interface WindowWithEthereum extends Window {
  ethereum?: EIP1193Provider
}
