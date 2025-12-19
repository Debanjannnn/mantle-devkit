/**
 * Platform Configuration & Validation
 *
 * Validates project configuration via platform API
 */

import { DEFAULT_PLATFORM_URL } from './constants'

/** Project configuration from platform */
export interface ProjectConfig {
  appId: string
  name: string
  payTo: string
  network: string
  status: string
}

/** Platform API response */
interface PlatformResponse {
  appId: string
  name: string
  payTo: string
  network: string
  status: string
}

/** Cached configuration (singleton) */
let cachedConfig: ProjectConfig | null = null
let validationPromise: Promise<ProjectConfig> | null = null

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

/**
 * Validate project with platform API
 */
async function validateProject(appId: string): Promise<ProjectConfig> {
  const baseUrl = getPlatformBaseUrl()
  const url = `${baseUrl}/v1/validate?appId=${encodeURIComponent(appId)}`

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Project not found: Invalid X402_APP_ID')
    }
    if (response.status === 401) {
      throw new Error('Unauthorized: Invalid X402_APP_ID')
    }
    throw new Error(`Platform validation failed: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as PlatformResponse

  if (!data.appId || !data.payTo || !data.network) {
    throw new Error('Invalid platform response: missing required fields')
  }

  if (data.status !== 'ACTIVE') {
    throw new Error(`Project is not active: status is ${data.status}`)
  }

  return {
    appId: data.appId,
    name: data.name,
    payTo: data.payTo,
    network: data.network,
    status: data.status,
  }
}

/**
 * Initialize platform configuration
 *
 * Reads X402_APP_ID from environment and validates with platform API.
 * Uses singleton pattern - multiple calls return same promise.
 */
export async function initializePlatform(): Promise<ProjectConfig> {
  if (cachedConfig) {
    return cachedConfig
  }

  if (validationPromise) {
    return validationPromise
  }

  const appId = process.env.X402_APP_ID || process.env.NEXT_PUBLIC_X402_APP_ID

  if (!appId || typeof appId !== 'string' || appId.trim().length === 0) {
    throw new Error('X402_APP_ID is required. Set it in your environment variables.')
  }

  validationPromise = validateProject(appId.trim())

  try {
    cachedConfig = await validationPromise
    return cachedConfig
  } catch (error) {
    validationPromise = null
    throw error
  }
}

/**
 * Get cached project configuration
 *
 * @throws Error if platform not initialized
 */
export function getProjectConfig(): ProjectConfig {
  if (!cachedConfig) {
    throw new Error('Platform not initialized. Call initializePlatform() first.')
  }
  return cachedConfig
}

/**
 * Clear cached configuration (for testing)
 */
export function clearCache(): void {
  cachedConfig = null
  validationPromise = null
}
