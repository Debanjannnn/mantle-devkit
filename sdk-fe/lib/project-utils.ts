import { createHash } from 'crypto'

/**
 * Hash a project ID to create a unique appId
 * @param projectId - The original project ID (e.g., "proj_abc123")
 * @returns Hashed appId
 */
export function hashProjectId(projectId: string): string {
  return createHash('sha256').update(projectId).digest('hex')
}

/**
 * Generate a new project ID
 * @returns Project ID in format: proj_xxxxxxxxxxxx
 */
export function generateProjectId(): string {
  const randomString = Math.random().toString(36).substring(2, 14)
  return `proj_${randomString}`
}

