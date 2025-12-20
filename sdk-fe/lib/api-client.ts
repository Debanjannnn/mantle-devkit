/**
 * API Client for Projects
 * Helper functions to interact with the Projects API
 */

export interface Project {
  id: string
  appId: string
  name: string
  payTo: string
  createdBy: string // Wallet address of the user who created the project
  network: string
  status: string
  createdAt: string
  updatedAt: string
  projectId?: string // Original project ID (only returned on creation)
}

export interface CreateProjectData {
  name: string
  payTo: string
  createdBy: string // Wallet address of the user creating the project
  network?: string
}

export interface UpdateProjectData {
  name?: string
  payTo?: string
  network?: string
  status?: string
}

/**
 * Get all projects, optionally filtered by wallet address
 */
export async function getProjects(walletAddress?: string): Promise<Project[]> {
  // Normalize wallet address to lowercase and trim
  const normalizedWallet = walletAddress ? walletAddress.toLowerCase().trim() : undefined
  const url = normalizedWallet 
    ? `/api/projects?walletAddress=${encodeURIComponent(normalizedWallet)}`
    : '/api/projects'
  
  console.log('[Client] Fetching projects from:', url)
  console.log('[Client] Wallet address:', walletAddress, '-> Normalized:', normalizedWallet)
  
  try {
    const response = await fetch(url)
    console.log('[Client] Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Client] Failed to fetch projects:', response.status, errorText)
      throw new Error(`Failed to fetch projects: ${response.status}`)
    }
    
    const projects = await response.json()
    console.log('[Client] Received projects:', projects)
    console.log('[Client] Number of projects:', projects.length)
    
    return projects
  } catch (error) {
    console.error('[Client] Error in getProjects:', error)
    throw error
  }
}

/**
 * Get a project by appId
 */
export async function getProject(appId: string): Promise<Project> {
  const response = await fetch(`/api/projects?appId=${appId}`)
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Project not found')
    }
    throw new Error('Failed to fetch project')
  }
  return response.json()
}

/**
 * Create a new project
 */
export async function createProject(data: CreateProjectData): Promise<Project & { projectId: string }> {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: data.name,
      payTo: data.payTo,
      createdBy: data.createdBy,
      network: data.network || 'mantle',
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create project')
  }

  return response.json()
}

/**
 * Update a project
 */
export async function updateProject(appId: string, data: UpdateProjectData): Promise<Project> {
  const response = await fetch(`/api/projects/${appId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update project')
  }

  return response.json()
}

/**
 * Update payout wallet
 */
export async function updatePayoutWallet(appId: string, payTo: string): Promise<Project> {
  const response = await fetch(`/api/projects/${appId}/payTo`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payTo }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update payout wallet')
  }

  return response.json()
}

/**
 * Delete a project (soft delete)
 */
export async function deleteProject(appId: string): Promise<{ message: string; project: Project }> {
  const response = await fetch(`/api/projects/${appId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete project')
  }

  return response.json()
}


