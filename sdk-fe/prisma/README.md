# Prisma Setup

This directory contains the Prisma schema and configuration for the x402 DevKit project.

## Setup

1. **Install dependencies:**
   ```bash
   cd prisma
   bun install
   ```

2. **Environment Variables:**
   The `.env` file contains the DATABASE_URL for Neon PostgreSQL database.

3. **Generate Prisma Client:**
   ```bash
   bunx prisma generate
   ```

4. **Run Migrations:**
   ```bash
   bunx prisma migrate dev --name init
   ```

5. **Push Schema (Alternative to migrations):**
   ```bash
   bunx prisma db push
   ```

## Project Model

The `Project` model stores:
- `id`: Unique CUID identifier
- `appId`: Hashed project ID (unique)
- `name`: Project name
- `payTo`: Payout wallet address
- `network`: Network name (default: "mantle")
- `status`: Project status (default: "ACTIVE")
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Usage

Import the Prisma client from the main project:
```typescript
import { prisma } from '@/lib/prisma'
```
