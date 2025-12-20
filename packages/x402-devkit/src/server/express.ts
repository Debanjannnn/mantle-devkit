/**
 * Express Middleware for x402 Payments
 *
 * @example
 * ```typescript
 * import express from 'express'
 * import { x402Express } from 'x402-mantle-sdk/server'
 *
 * const app = express()
 *
 * // Protect a route with payment
 * app.get('/api/premium', x402Express({ price: '0.001', token: 'MNT', testnet: true }), (req, res) => {
 *   res.json({ data: 'Premium content' })
 * })
 *
 * // With custom options
 * app.post('/api/data', x402Express({
 *   price: '0.01',
 *   token: 'USDC',
 *   network: 'mantle',
 *   endpoint: '/api/data',
 *   method: 'POST',
 *   enableAnalytics: true
 * }), (req, res) => {
 *   res.json({ data: 'Premium data' })
 * })
 * ```
 */

import type { Request, Response, NextFunction } from 'express'
import { processPaymentMiddleware, type X402Options } from './middleware'
import { initializePlatform, getProjectConfig } from './platform'

let initialized = false
let initPromise: Promise<void> | null = null

/**
 * Express middleware for x402 payments
 *
 * Validates payment before allowing request to proceed.
 * Returns HTTP 402 if payment is missing or invalid.
 *
 * @param options - Payment options (price, token, network, etc.)
 * @returns Express middleware function
 */
export function x402Express(options: X402Options) {
  if (!options.price || !options.token) {
    throw new Error('x402Express middleware requires price and token options')
  }

  const ensureInitialized = async () => {
    if (initialized) return
    if (initPromise) {
      await initPromise
      return
    }
    initPromise = initializePlatform().then(() => {
      initialized = true
      initPromise = null
    })
    await initPromise
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Initialize platform on first request
      await ensureInitialized()

      // Extract endpoint path and method from request (for automatic registration)
      const requestPath = options.endpoint || req.path || req.route?.path
      const requestMethod = options.method || req.method

      // Auto-register endpoint on first use (fire and forget)
      if (requestPath && options.enableAnalytics !== false) {
        import('./endpoint-registry').then(({ registerEndpoint }) => {
          const config = getProjectConfig()
          const network = options.network || (options.testnet ? 'mantle-sepolia' : config.network)
          
          registerEndpoint({
            endpoint: requestPath,
            method: requestMethod || options.method,
            price: options.price,
            token: options.token,
            network,
          }).catch(() => {
            // Silently fail - registration shouldn't break payment flow
          })
        }).catch(() => {
          // Silently fail if module can't be loaded
        })
      }

      // Convert Express headers to plain object
      const headers: Record<string, string> = {}
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === 'string') {
          headers[key] = value
        } else if (Array.isArray(value)) {
          headers[key] = value[0]
        }
      }

      // Process payment middleware
      const result = await processPaymentMiddleware(options, headers, requestPath, requestMethod)

      // Payment required - return 402
      if (result.paymentRequired) {
        res.status(402)

        // Set x402 headers
        for (const [key, value] of Object.entries(result.paymentRequired.headers)) {
          res.setHeader(key, value)
        }

        return res.json(result.paymentRequired.body)
      }

      // Error occurred
      if (result.error) {
        return res.status(result.error.status).json({ error: result.error.message })
      }

      // Payment verified - proceed to next middleware
      if (result.allowed) {
        // Attach payment info to request for use in route handler
        ;(req as any).x402 = {
          verified: true,
          transactionHash: headers['x-402-transaction-hash'],
        }
        return next()
      }

      // Unexpected state
      return res.status(500).json({ error: 'Unexpected middleware state' })
    } catch (error) {
      console.error('x402 Express middleware error:', error)
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}

/**
 * Reset initialization state (useful for testing)
 */
export function resetExpressMiddleware() {
  initialized = false
  initPromise = null
}
