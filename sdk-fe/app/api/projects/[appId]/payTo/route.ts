import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/projects/[appId]/payTo - Update payout wallet address
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const { appId } = await params
    const body = await request.json()
    const { payTo } = body

    if (!payTo) {
      return NextResponse.json(
        { error: 'payTo is required' },
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

    const project = await prisma.project.update({
      where: { appId },
      data: { payTo },
    })

    return NextResponse.json(project)
  } catch (error: any) {
    console.error('Error updating payout wallet:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to update payout wallet' },
      { status: 500 }
    )
  }
}


