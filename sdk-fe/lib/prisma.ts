// @ts-ignore - Prisma client is generated
import { PrismaClient } from '../prisma/generated/prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Get DATABASE_URL from environment
// It should be set in .env.local in the root directory
const connectionString = process.env.DATABASE_URL || ''

// Create PostgreSQL connection pool and adapter for Prisma 7
// Prisma 7 requires an adapter, so we create one even during build
// Use a placeholder connection string if DATABASE_URL is not set (for build time)
const pool = new Pool({ 
  connectionString: connectionString || 'postgresql://user:password@localhost:5432/db?schema=public',
  // Prevent actual connections during build if no DATABASE_URL
  ...(connectionString ? {} : { 
    max: 0,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 0
  })
})

const adapter = new PrismaPg(pool)

const prismaConfig: any = {
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
}

if (!connectionString) {
  // Only warn in development, not during build
  if (process.env.NODE_ENV === 'development') {
    console.warn('DATABASE_URL is not set. Please add it to your .env.local file')
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(prismaConfig)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

