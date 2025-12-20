/**
 * React components for x402 client
 *
 * @example
 * ```tsx
 * import { PaymentModal, EnhancedPaymentModal } from '@x402-devkit/sdk/client/react'
 *
 * // Basic modal
 * <PaymentModal
 *   request={paymentRequest}
 *   isOpen={isOpen}
 *   onComplete={handleComplete}
 *   onCancel={handleCancel}
 * />
 *
 * // Enhanced modal with success states and explorer links
 * <EnhancedPaymentModal
 *   request={paymentRequest}
 *   isOpen={isOpen}
 *   onComplete={handleComplete}
 *   onCancel={handleCancel}
 *   description="Premium API access"
 *   endpoint="/api/premium-data"
 *   simulation={false}
 * />
 * ```
 */

export { PaymentModal } from './modal-react'
export { EnhancedPaymentModal } from './payment-modal-enhanced'

// Re-export types that React components need
export type { PaymentRequest, PaymentResponse } from './types'
