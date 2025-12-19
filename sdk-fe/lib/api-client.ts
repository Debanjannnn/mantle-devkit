/**
 * API Client for Projects
 * Helper functions to interact with the Projects API
 */

export interface Project {
  id: string
  appId: string
  name: string
  payTo: string
  network: string
  status: string
  createdAt: string
  updatedAt: string
  projectId?: string // Original project ID (only returned on creation)
}

export interface CreateProjectData {
  name: string
  payTo: string
  network?: string
}

export interface UpdateProjectData {
  name?: string
  payTo?: string
  network?: string
  status?: string
}

/**
 * Get all projects
 */
export async function getProjects(): Promise<Project[]> {
  const response = await fetch('/api/projects')
  if (!response.ok) {
    throw new Error('Failed to fetch projects')
  }
  return response.json()
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


