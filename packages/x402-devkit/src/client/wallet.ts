/**
 * Wallet Connection & Management
 *
 * Handles web3 wallet connections (MetaMask, WalletConnect, etc.)
 * Supports network switching and custom network addition
 */

import type {
  TransactionRequest,
  WalletProvider,
  EIP1193Provider,
  WindowWithEthereum,
  AddEthereumChainParameter,
} from './types'
import { getNetworkConfig, getChainId as getChainIdForNetwork } from './constants'

/**
 * Get ethereum provider from window
 */
function getEthereumProvider(): EIP1193Provider | null {
  if (typeof window === 'undefined') {
    return null
  }
  return (window as WindowWithEthereum).ethereum || null
}

/**
 * MetaMask/EIP-1193 wallet provider
 */
export class MetaMaskProvider implements WalletProvider {
  private ethereum: EIP1193Provider | null

  constructor() {
    this.ethereum = getEthereumProvider()
  }

  isAvailable(): boolean {
    return this.ethereum !== null && this.ethereum.isMetaMask === true
  }

  async connect(): Promise<string> {
    if (!this.ethereum) {
      throw new Error('MetaMask is not available')
    }

    const accounts = (await this.ethereum.request({
      method: 'eth_requestAccounts',
    })) as string[]

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found')
    }

    return accounts[0]
  }

  async getAccount(): Promise<string | null> {
    if (!this.ethereum) {
      return null
    }

    try {
      const accounts = (await this.ethereum.request({
        method: 'eth_accounts',
      })) as string[]

      return accounts && accounts.length > 0 ? accounts[0] : null
    } catch {
      return null
    }
  }

  async getChainId(): Promise<number | null> {
    if (!this.ethereum) {
      return null
    }

    try {
      const chainIdHex = (await this.ethereum.request({
        method: 'eth_chainId',
      })) as string

      return parseInt(chainIdHex, 16)
    } catch {
      return null
    }
  }

  async switchNetwork(chainId: number): Promise<void> {
    if (!this.ethereum) {
      throw new Error('MetaMask is not available')
    }

    const chainIdHex = `0x${chainId.toString(16)}`

    try {
      await this.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      })
    } catch (error) {
      const switchError = error as { code?: number }
      if (switchError.code === 4902) {
        // Chain not added, throw specific error
        throw new Error(`Network with chainId ${chainId} not found. Use addNetwork() first.`)
      }
      throw error
    }
  }

  async addNetwork(params: AddEthereumChainParameter): Promise<void> {
    if (!this.ethereum) {
      throw new Error('MetaMask is not available')
    }

    await this.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [params],
    })
  }

  async sendTransaction(tx: TransactionRequest): Promise<string> {
    if (!this.ethereum) {
      throw new Error('MetaMask is not available')
    }

    // Get the current account to set as 'from'
    const account = await this.getAccount()
    if (!account) {
      throw new Error('No account connected. Please connect your wallet first.')
    }

    // Ensure 'from' field is set
    const txWithFrom = {
      ...tx,
      from: account,
    }

    try {
      const txHash = (await this.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txWithFrom],
      })) as string

      return txHash
    } catch (error: any) {
      // Provide more specific error messages
      if (error.code === 4001) {
        throw new Error('Transaction rejected by user')
      } else if (error.code === -32602) {
        throw new Error('Invalid transaction parameters')
      } else if (error.message?.includes('insufficient funds') || error.message?.includes('insufficient balance')) {
        throw new Error('Insufficient funds for this transaction')
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error(`Transaction failed: ${error.code || 'Unknown error'}`)
      }
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.ethereum) {
      throw new Error('MetaMask is not available')
    }

    const account = await this.getAccount()
    if (!account) {
      throw new Error('No account connected')
    }

    const signature = (await this.ethereum.request({
      method: 'personal_sign',
      params: [message, account],
    })) as string

    return signature
  }
}

/**
 * Auto-detect wallet provider
 */
export function detectWalletProvider(): WalletProvider | null {
  const metaMask = new MetaMaskProvider()
  if (metaMask.isAvailable()) {
    return metaMask
  }

  // Add more providers here (WalletConnect, Coinbase Wallet, etc.)
  return null
}

/**
 * Connect wallet (auto-detect or use provided)
 */
export async function connectWallet(provider?: WalletProvider): Promise<string> {
  const wallet = provider || detectWalletProvider()

  if (!wallet) {
    throw new Error(
      'No wallet provider found. Please install MetaMask or another compatible wallet.'
    )
  }

  return wallet.connect()
}

/**
 * Ensure wallet is on the correct network
 *
 * @param wallet - Wallet provider
 * @param network - Network identifier (e.g., 'mantle', 'mantle-sepolia')
 * @param autoAdd - Auto-add network if not found (default: true)
 */
export async function ensureNetwork(
  wallet: WalletProvider,
  network: string,
  autoAdd = true
): Promise<void> {
  const config = getNetworkConfig(network)
  const targetChainId = config.chainId
  const currentChainId = await wallet.getChainId()

  if (currentChainId === targetChainId) {
    return // Already on correct network
  }

  try {
    await wallet.switchNetwork(targetChainId)
  } catch (error) {
    const switchError = error as { message?: string }

    // If network not found and autoAdd is enabled, add it
    if (autoAdd && switchError.message?.includes('not found')) {
      await wallet.addNetwork({
        chainId: `0x${targetChainId.toString(16)}`,
        chainName: config.name,
        nativeCurrency: config.nativeCurrency,
        rpcUrls: [config.rpcUrl],
        blockExplorerUrls: config.blockExplorer ? [config.blockExplorer] : undefined,
      })
    } else {
      throw error
    }
  }
}

/**
 * Get network config for adding to wallet
 */
export function getAddNetworkParams(network: string): AddEthereumChainParameter {
  const config = getNetworkConfig(network)
  return {
    chainId: `0x${config.chainId.toString(16)}`,
    chainName: config.name,
    nativeCurrency: config.nativeCurrency,
    rpcUrls: [config.rpcUrl],
    blockExplorerUrls: config.blockExplorer ? [config.blockExplorer] : undefined,
  }
}
