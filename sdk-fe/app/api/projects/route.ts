import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateProjectId, hashProjectId } from '@/lib/project-utils'

// GET /api/projects - Get all projects or a specific project by appId
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const appId = searchParams.get('appId')
    const walletAddress = searchParams.get('walletAddress')

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

    // Get projects filtered by wallet address (createdBy) if provided
    if (walletAddress) {
      // Normalize wallet address to lowercase for consistent comparison
      const normalizedWallet = walletAddress.toLowerCase().trim()
      
      console.log('[API] Filtering projects by createdBy:', normalizedWallet)
      
      // Use raw SQL query since Prisma types may not be updated yet
      // Compare directly since both are normalized to lowercase
      const projects = await prisma.$queryRaw<Array<{
        id: string
        appId: string
        name: string
        payTo: string
        createdBy: string
        network: string
        status: string
        createdAt: Date
        updatedAt: Date
      }>>`
        SELECT * FROM projects
        WHERE "createdBy" = ${normalizedWallet} AND status = 'ACTIVE'
        ORDER BY "createdAt" DESC
      `

      console.log(`[API] Found ${projects.length} projects for wallet ${normalizedWallet}`)
      if (projects.length > 0) {
        console.log('[API] Project names:', projects.map(p => p.name))
        console.log('[API] First project createdBy:', projects[0].createdBy)
      } else {
        // Debug: Check what's actually in the database
        const allProjects = await prisma.$queryRaw<Array<{ createdBy: string; name: string }>>`
          SELECT "createdBy", name FROM projects LIMIT 5
        `
        console.log('[API] Sample projects in DB:', allProjects)
      }
      
      // Convert Date objects to ISO strings for JSON serialization
      const serializedProjects = projects.map(p => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }))
      
      return NextResponse.json(serializedProjects)
    }

    // Get all projects (if no wallet filter) - exclude deleted projects
    const projects = await prisma.project.findMany({
      where: { status: 'ACTIVE' },
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
    const { name, payTo, createdBy, network = 'mantle' } = body

    // Validate required fields
    if (!name || !payTo || !createdBy) {
      return NextResponse.json(
        { error: 'Name, payTo, and createdBy are required' },
        { status: 400 }
      )
    }

    // Validate wallet address format
    const walletRegex = /^0x[a-fA-F0-9]{40}$/
    if (!walletRegex.test(payTo) || !walletRegex.test(createdBy)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      )
    }

    // Normalize wallet addresses to lowercase for consistent storage
    const normalizedCreatedBy = createdBy.toLowerCase()
    const normalizedPayTo = payTo.toLowerCase()
    const normalizedName = name.trim()

    console.log('Creating project with createdBy:', normalizedCreatedBy)

    // Check if a project with the same name already exists for this wallet
    const existingProject = await prisma.project.findFirst({
      where: {
        createdBy: normalizedCreatedBy,
        name: normalizedName,
        status: 'ACTIVE',
      },
    })

    if (existingProject) {
      return NextResponse.json(
        { error: 'A project with this name already exists' },
        { status: 409 }
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
      
      // Use Prisma create with type assertion to include createdBy
      const project = await (prisma.project as any).create({
        data: {
          appId: newAppId,
          name: normalizedName,
          payTo: normalizedPayTo,
          createdBy: normalizedCreatedBy,
          network,
          status: 'ACTIVE',
        },
      })

      return NextResponse.json(
        { ...project, projectId: newProjectId },
        { status: 201 }
      )
    }

    // Create project using Prisma with type assertion to include createdBy
    const project = await (prisma.project as any).create({
      data: {
        appId,
        name: normalizedName,
        payTo: normalizedPayTo,
        createdBy: normalizedCreatedBy,
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


