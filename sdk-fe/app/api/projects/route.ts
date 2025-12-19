import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateProjectId, hashProjectId } from '@/lib/project-utils'

// GET /api/projects - Get all projects or a specific project by appId
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const appId = searchParams.get('appId')

    if (appId) {
      // Get single project by appId
      const project = await prisma.project.findUnique({
        where: { appId },
      })

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }

      return NextResponse.json(project)
    }

    // Get all projects
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, payTo, network = 'mantle' } = body

    // Validate required fields
    if (!name || !payTo) {
      return NextResponse.json(
        { error: 'Name and payTo are required' },
        { status: 400 }
      )
    }

    // Validate wallet address format
    const walletRegex = /^0x[a-fA-F0-9]{40}$/
    if (!walletRegex.test(payTo)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      )
    }

    // Generate project ID and hash it
    const projectId = generateProjectId()
    const appId = hashProjectId(projectId)

    // Check if appId already exists (very unlikely but check anyway)
    const existing = await prisma.project.findUnique({
      where: { appId },
    })

    if (existing) {
      // Regenerate if collision (extremely rare)
      const newProjectId = generateProjectId()
      const newAppId = hashProjectId(newProjectId)
      
      const project = await prisma.project.create({
        data: {
          appId: newAppId,
          name,
          payTo,
          network,
          status: 'ACTIVE',
        },
      })

      return NextResponse.json(
        { ...project, projectId: newProjectId },
        { status: 201 }
      )
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        appId,
        name,
        payTo,
        network,
        status: 'ACTIVE',
      },
    })

    // Return project with original projectId (not the hash)
    return NextResponse.json(
      { ...project, projectId },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating project:', error)
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Project with this appId already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}


