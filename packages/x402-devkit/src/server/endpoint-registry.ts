/**
 * Endpoint Registry
 *
 * Automatically registers endpoints when x402 middleware is used
 * This allows endpoints to appear in the dashboard even before payments are made
 */

import { getProjectConfig } from './platform'
import { DEFAULT_PLATFORM_URL } from './constants'

/** Endpoint registration data */
export interface EndpointRegistration {
  endpoint: string
  method?: string
  price: string
  token: string
  network: string
}

/**
 * Get platform API base URL
 */
function getPlatformBaseUrl(): string {
  return (
    process.env.X402_PLATFORM_URL ||
    process.env.NEXT_PUBLIC_X402_PLATFORM_URL ||
    DEFAULT_PLATFORM_URL
  )
}

/** Cache of registered endpoints to avoid duplicate registrations */
const registeredEndpoints = new Set<string>()

/**
 * Register an endpoint with the platform
 *
 * This is called automatically when x402 middleware is first invoked for an endpoint.
 * Endpoints appear in the dashboard even before any payments are made.
 *
 * @param registration - Endpoint registration data
 */
export async function registerEndpoint(registration: EndpointRegistration): Promise<void> {
  try {
    const config = getProjectConfig()
    const baseUrl = getPlatformBaseUrl()

    // Create unique key for this endpoint
    const endpointKey = `${config.appId}:${registration.endpoint}:${registration.method || 'ANY'}`

    // Skip if already registered in this session
    if (registeredEndpoints.has(endpointKey)) {
      return
    }

    // Mark as registered
    registeredEndpoints.add(endpointKey)

    const url = `${baseUrl}/api/endpoints/register`

    const payload = {
      appId: config.appId,
      endpoint: registration.endpoint,
      method: registration.method || null,
      price: registration.price,
      token: registration.token,
      network: registration.network || config.network,
    }

    // Fire and forget - don't block on registration
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((error) => {
      // Silently fail - registration shouldn't break the payment flow
      console.warn('Failed to register endpoint:', error)
      // Remove from cache so we can retry next time
      registeredEndpoints.delete(endpointKey)
    })
  } catch (error) {
    // Silently fail - registration shouldn't break the payment flow
    console.warn('Failed to register endpoint:', error)
  }
}

