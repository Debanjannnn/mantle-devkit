/**
 * Hono Framework Integration
 *
 * Provides x402 middleware for Hono framework
 *
 * @example
 * ```typescript
 * import { x402 } from '@x402-devkit/server'
 *
 * app.use('/api/data', x402({ price: '0.001', token: 'USDC' }))
 * ```
 */

import { processPaymentMiddleware, type X402Options } from './middleware'
import { initializePlatform, getProjectConfig } from './platform'

/** Hono context interface (generic to avoid requiring hono at build time) */
interface HonoContext {
  req: {
    header(): Record<string, string>
    url?: string
    path?: string
    method?: string
  }
  json(data: unknown, status?: number, headers?: Record<string, string>): Response
}

/** Hono next function */
type HonoNext = () => Promise<void>

/**
 * x402 Hono Middleware
 *
 * Validates payment before allowing request to proceed.
 * Returns HTTP 402 if payment is missing or invalid.
 *
 * @param options - Payment options (price, token, network)
 * @returns Hono middleware function
 */
export function x402(options: X402Options) {
  if (!options.price || !options.token) {
    throw new Error('x402 middleware requires price and token options')
  }

  let initPromise: Promise<void> | null = null
  let initialized = false

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

  return async (c: HonoContext, next: HonoNext) => {
    try {
      await ensureInitialized()

      // Extract endpoint path from request (for automatic registration)
      const requestPath = c.req.path || (c.req.url ? new URL(c.req.url).pathname : undefined)
      const requestMethod = c.req.method

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

      const result = await processPaymentMiddleware(
        options,
        c.req.header(),
        requestPath,
        requestMethod
      )

      if (!result.allowed) {
        if (result.paymentRequired) {
          return c.json(result.paymentRequired.body, 402, result.paymentRequired.headers)
        }
        if (result.error) {
          return c.json({ error: result.error.message }, result.error.status)
        }
      }

      await next()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error'
      return c.json({ error: message }, 500)
    }
  }
}
