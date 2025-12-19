/**
 * Payment Modal
 *
 * Default payment modal implementation using vanilla JS
 */

import type { PaymentRequest, PaymentResponse } from './types'
import { createVanillaPaymentModal } from './modal-vanilla'

/**
 * Create payment modal
 *
 * Uses vanilla JS modal that works in any browser environment
 */
export async function createPaymentModal(
  request: PaymentRequest
): Promise<PaymentResponse | null> {
  if (typeof window === 'undefined') {
    return null
  }

  return createVanillaPaymentModal(request)
}
