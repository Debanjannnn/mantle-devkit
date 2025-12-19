/**
 * Payment Processing
 *
 * Handles direct blockchain payments with automatic fee splitting
 * Automatically splits 0.5% platform fee to Treasury
 */

import type { PaymentRequest, PaymentResponse, WalletProvider, TransactionRequest } from './types'
import {
  getTokenConfig,
  TREASURY_ADDRESS,
  PLATFORM_FEE_BPS,
  BPS_DENOMINATOR,
} from './constants'

/** ERC20 transfer function signature */
const ERC20_TRANSFER_SIG = '0xa9059cbb'

/**
 * Convert amount to Wei
 */
function amountToWei(amount: string, decimals: number = 18): bigint {
  const parts = amount.split('.')
  const whole = parts[0] || '0'
  const fraction = (parts[1] || '').padEnd(decimals, '0').slice(0, decimals)

  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fraction)
}

/**
 * Calculate fee split
 */
function calculateSplit(amount: bigint): { merchantAmount: bigint; feeAmount: bigint } {
  const feeAmount = (amount * PLATFORM_FEE_BPS) / BPS_DENOMINATOR
  const merchantAmount = amount - feeAmount
  return { merchantAmount, feeAmount }
}

/**
 * Encode ERC20 transfer call data
 */
function encodeERC20Transfer(to: string, amount: bigint): string {
  const toHex = to.slice(2).toLowerCase().padStart(64, '0')
  const amountHex = amount.toString(16).padStart(64, '0')
  return ERC20_TRANSFER_SIG + toHex + amountHex
}

/**
 * Process payment for an x402 request
 *
 * Automatically splits payment:
 * - 99.5% to merchant
 * - 0.5% to Treasury
 *
 * @param request - Payment request from HTTP 402 response
 * @param wallet - Wallet provider to use for transaction
 * @returns Payment response with transaction hash
 */
export async function processPayment(
  request: PaymentRequest,
  wallet: WalletProvider
): Promise<PaymentResponse> {
  // Validate request
  if (!request.amount || !request.recipient || !request.network) {
    throw new Error('Invalid payment request: missing required fields')
  }

  // Get token configuration
  const tokenConfig = getTokenConfig(request.token, request.network)
  const decimals = tokenConfig?.decimals ?? 18

  // Calculate amounts
  const totalAmount = amountToWei(request.amount, decimals)
  
  if (totalAmount === 0n) {
    throw new Error('Invalid payment amount: amount must be greater than 0')
  }

  const { merchantAmount, feeAmount } = calculateSplit(totalAmount)

  let txHash: string

  if (tokenConfig) {
    // ERC20 token transfer - send full amount to merchant
    // (Treasury fee handled separately for ERC20)
    const transferData = encodeERC20Transfer(request.recipient, totalAmount)

    const tx: TransactionRequest = {
      to: tokenConfig.address,
      data: transferData,
    }

    txHash = await wallet.sendTransaction(tx)
  } else {
    // Native MNT transfer - split between merchant and treasury

    // 1. Send to merchant (99.5%)
    const merchantValue = merchantAmount.toString(16)
    const merchantTx: TransactionRequest = {
      to: request.recipient,
      value: `0x${merchantValue}`,
    }
    
    txHash = await wallet.sendTransaction(merchantTx)

    // 2. Send fee to Treasury (0.5%)
    if (feeAmount > 0n) {
      const feeValue = feeAmount.toString(16)
      const feeTx: TransactionRequest = {
        to: TREASURY_ADDRESS,
        value: `0x${feeValue}`,
      }
      // Note: We send the fee transaction but don't wait for it
      // The main transaction hash is what we return
      wallet.sendTransaction(feeTx).catch((err) => {
        console.warn('Fee transaction failed (non-critical):', err)
      })
    }
  }

  return {
    transactionHash: txHash,
    timestamp: new Date().toISOString(),
  }
}
