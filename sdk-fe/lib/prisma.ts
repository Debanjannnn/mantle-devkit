// @ts-ignore - Prisma client is generated
import { PrismaClient } from '../prisma/generated/prisma/client'
import { Pool } from '@/node_modules/@types/pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Get DATABASE_URL from environment
// It should be set in .env.local in the root directory
const connectionString = process.env.DATABASE_URL || ''

if (!connectionString) {
  console.warn('DATABASE_URL is not set. Please add it to your .env.local file')
}

// Create PostgreSQL connection pool and adapter for Prisma 7
let prismaConfig: any = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
}

if (connectionString) {
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  prismaConfig.adapter = adapter
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(prismaConfig)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

