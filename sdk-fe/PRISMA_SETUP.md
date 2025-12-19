# Prisma Database Setup

## ✅ Completed Setup

1. **Prisma Schema** (`prisma/prisma/schema.prisma`)
   - Added `Project` model with all required fields
   - Configured PostgreSQL datasource
   - Added indexes for `appId` and `payTo`

2. **Database Connection** (`prisma/.env`)
   - Configured Neon PostgreSQL connection string
   - Connection string is set and ready to use

3. **Utilities Created**
   - `lib/prisma.ts` - Prisma client singleton
   - `lib/project-utils.ts` - Helper functions for project ID hashing

## 📋 Next Steps

### 1. Generate Prisma Client

```bash
cd prisma
bunx prisma generate
```

This will generate the Prisma client in `prisma/generated/prisma/`

### 2. Push Schema to Database

```bash
cd prisma
bunx prisma db push
```

Or create a migration:
```bash
bunx prisma migrate dev --name init
```

### 3. Install Prisma Client in Main Project (if needed)

The Prisma client is generated in the `prisma` folder. If you need to import it from the main Next.js app, you may need to adjust the import path or install `@prisma/client` in the main project.

## 📊 Project Model Structure

```prisma
model Project {
  id        String   @id @default(cuid())
  appId     String   @unique // Hashed project ID (SHA256)
  name      String   // Project name
  payTo     String   // Payout wallet address
  network   String   @default("mantle")
  status    String   @default("ACTIVE")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🔧 Usage Example

```typescript
import { prisma } from '@/lib/prisma'
import { generateProjectId, hashProjectId } from '@/lib/project-utils'

// Create a project
const projectId = generateProjectId() // e.g., "proj_abc123"
const appId = hashProjectId(projectId) // SHA256 hash

const project = await prisma.project.create({
  data: {
    appId,
    name: "My API Project",
    payTo: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    network: "mantle",
    status: "ACTIVE"
  }
})
```

## 🔐 Security Note

The `appId` is stored as a SHA256 hash of the original project ID for security. The original project ID format is `proj_xxxxxxxxxxxx` and is hashed before storing in the database.


