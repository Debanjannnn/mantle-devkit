/**
 * Blockchain Verification
 *
 * Direct on-chain payment verification for Mantle network
 * - Verifies transaction receipts
 * - Validates ERC20 token transfers
 * - Validates native MNT transfers
 */

import type { ProjectConfig } from './platform'
import {
  getRpcUrl,
  getChainId,
  getTokenConfig,
  ERC20_TRANSFER_SIGNATURE,
  AMOUNT_TOLERANCE,
} from './constants'

/** Blockchain verification result */
export interface BlockchainVerification {
  valid: boolean
  transactionHash?: string
  amount?: string
  token?: string
  blockNumber?: number
  error?: string
}

/** JSON-RPC response structure */
interface RPCResponse<T = unknown> {
  jsonrpc: '2.0'
  id: number
  result?: T
  error?: {
    code: number
    message: string
  }
}

/** Raw transaction receipt from RPC */
interface RawTransactionReceipt {
  transactionHash: string
  blockNumber: string
  status: string
  from: string
  to: string | null
  logs: Array<{
    address: string
    topics: string[]
    data: string
  }>
}

/** Raw transaction from RPC */
interface RawTransaction {
  hash: string
  from: string
  to: string | null
  value: string
  input: string
  blockNumber: string | null
}

/** Parsed transaction receipt */
interface TransactionReceipt {
  transactionHash: string
  blockNumber: number
  status: 'success' | 'failed'
  from: string
  to: string | null
  value: string
  logs: Array<{
    address: string
    topics: string[]
    data: string
  }>
}

/** Decoded ERC20 Transfer event */
interface ERC20Transfer {
  from: string
  to: string
  value: bigint
  tokenAddress: string
}

/**
 * Call JSON-RPC method
 */
async function callRPC<T>(url: string, method: string, params: unknown[]): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  })

  if (!response.ok) {
    throw new Error(`RPC call failed: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as RPCResponse<T>

  if (data.error) {
    throw new Error(`RPC error: ${data.error.message}`)
  }

  return data.result as T
}

/**
 * Get transaction by hash
 */
async function getTransaction(
  rpcUrl: string,
  txHash: string
): Promise<RawTransaction | null> {
  return await callRPC<RawTransaction | null>(
    rpcUrl,
    'eth_getTransactionByHash',
    [txHash]
  )
}

/**
 * Get and parse transaction receipt with transaction value
 */
async function getTransactionReceipt(
  rpcUrl: string,
  txHash: string
): Promise<TransactionReceipt | null> {
  // Get both receipt and transaction (for value)
  const [receipt, tx] = await Promise.all([
    callRPC<RawTransactionReceipt | null>(rpcUrl, 'eth_getTransactionReceipt', [txHash]),
    callRPC<RawTransaction | null>(rpcUrl, 'eth_getTransactionByHash', [txHash]),
  ])

  if (!receipt) {
    return null
  }

  return {
    transactionHash: receipt.transactionHash,
    blockNumber: parseInt(receipt.blockNumber, 16),
    status: receipt.status === '0x1' ? 'success' : 'failed',
    from: receipt.from,
    to: tx?.to || receipt.to,
    value: tx?.value || '0x0',
    logs: receipt.logs || [],
  }
}

/**
 * Decode ERC20 Transfer event from log
 */
function decodeERC20Transfer(log: {
  topics: string[]
  data: string
  address: string
}): ERC20Transfer | null {
  // Check Transfer event signature
  if (log.topics[0]?.toLowerCase() !== ERC20_TRANSFER_SIGNATURE.toLowerCase()) {
    return null
  }

  // Transfer has 3 topics: signature, from, to
  if (log.topics.length !== 3) {
    return null
  }

  return {
    from: ('0x' + log.topics[1].slice(-40)).toLowerCase(),
    to: ('0x' + log.topics[2].slice(-40)).toLowerCase(),
    value: BigInt(log.data),
    tokenAddress: log.address.toLowerCase(),
  }
}

/**
 * Convert Wei to token units
 */
function weiToTokenUnits(wei: bigint, decimals: number = 18): string {
  const divisor = 10n ** BigInt(decimals)
  const whole = wei / divisor
  const remainder = wei % divisor

  if (remainder === 0n) {
    return whole.toString()
  }

  const remainderStr = remainder.toString().padStart(decimals, '0')
  const trimmed = remainderStr.replace(/0+$/, '')
  return `${whole}.${trimmed}`
}

/**
 * Parse amount string to Wei
 */
function parseAmountToWei(amount: string, decimals: number = 18): bigint {
  const parts = amount.split('.')
  const whole = parts[0] || '0'
  const fraction = (parts[1] || '').padEnd(decimals, '0').slice(0, decimals)

  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fraction)
}

/**
 * Verify payment directly on blockchain
 *
 * @param transactionHash - Transaction hash to verify
 * @param config - Project configuration
 * @param requiredAmount - Required payment amount (e.g., "0.001")
 * @param requiredToken - Required token symbol (e.g., "USDC", "MNT")
 * @param customRpcUrl - Custom RPC URL (optional, overrides default)
 */
export async function verifyPaymentOnChain(
  transactionHash: string,
  config: ProjectConfig,
  requiredAmount: string,
  requiredToken: string,
  customRpcUrl?: string
): Promise<BlockchainVerification> {
  try {
    const rpcUrl = getRpcUrl(config.network, customRpcUrl)

    // Get transaction receipt
    const receipt = await getTransactionReceipt(rpcUrl, transactionHash)

    if (!receipt) {
      return {
        valid: false,
        error: 'Transaction not found or not yet confirmed',
      }
    }

    if (receipt.status !== 'success') {
      return {
        valid: false,
        error: 'Transaction failed',
      }
    }

    const recipient = config.payTo.toLowerCase()

    // Check for native MNT transfer
    if (requiredToken.toUpperCase() === 'MNT') {
      const valueWei = BigInt(receipt.value)
      const requiredWei = parseAmountToWei(requiredAmount, 18)

      if (receipt.to?.toLowerCase() !== recipient) {
        return {
          valid: false,
          error: `Recipient mismatch: expected ${config.payTo}, got ${receipt.to}`,
        }
      }

      // Check amount with tolerance
      if (valueWei < requiredWei - AMOUNT_TOLERANCE || valueWei > requiredWei + AMOUNT_TOLERANCE) {
        return {
          valid: false,
          error: `Amount mismatch: expected ${requiredAmount} MNT, got ${weiToTokenUnits(valueWei)} MNT`,
        }
      }

      return {
        valid: true,
        transactionHash: receipt.transactionHash,
        amount: weiToTokenUnits(valueWei),
        token: 'MNT',
        blockNumber: receipt.blockNumber,
      }
    }

    // Check for ERC20 token transfer
    const tokenConfig = getTokenConfig(requiredToken, config.network)
    if (!tokenConfig) {
      return {
        valid: false,
        error: `Unknown token: ${requiredToken}`,
      }
    }

    // Find Transfer event in logs
    let transfer: ERC20Transfer | null = null

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== tokenConfig.address.toLowerCase()) {
        continue
      }

      const decoded = decodeERC20Transfer(log)
      if (decoded && decoded.to === recipient) {
        transfer = decoded
        break
      }
    }

    if (!transfer) {
      return {
        valid: false,
        error: `No ${requiredToken} transfer found to ${config.payTo}`,
      }
    }

    // Verify amount with tolerance (adjusted for token decimals)
    const requiredWei = parseAmountToWei(requiredAmount, tokenConfig.decimals)
    const toleranceAdjusted = AMOUNT_TOLERANCE / 10n ** BigInt(18 - tokenConfig.decimals)

    if (
      transfer.value < requiredWei - toleranceAdjusted ||
      transfer.value > requiredWei + toleranceAdjusted
    ) {
      return {
        valid: false,
        error: `Amount mismatch: expected ${requiredAmount} ${requiredToken}, got ${weiToTokenUnits(transfer.value, tokenConfig.decimals)} ${requiredToken}`,
      }
    }

    return {
      valid: true,
      transactionHash: receipt.transactionHash,
      amount: weiToTokenUnits(transfer.value, tokenConfig.decimals),
      token: requiredToken,
      blockNumber: receipt.blockNumber,
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to verify payment on blockchain',
    }
  }
}
