/**
 * React components for x402 client
 *
 * @example
 * ```tsx
 * import { PaymentModal } from '@x402-devkit/sdk/client/react'
 *
 * <PaymentModal
 *   request={paymentRequest}
 *   isOpen={isOpen}
 *   onComplete={handleComplete}
 *   onCancel={handleCancel}
 * />
 * ```
 */

export { PaymentModal } from './modal-react'

// Re-export types that React components need
export type { PaymentRequest, PaymentResponse } from './types'
