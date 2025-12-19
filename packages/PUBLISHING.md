# Publishing @x402-devkit/sdk to npm

## What Is This Package?

`@x402-devkit/sdk` is an **npm package (library)** that developers install to:
- Protect API routes with payment gates (server)
- Handle HTTP 402 payments automatically (client)
- Show payment modals in React apps (client/react)

**It needs to be published to npm, not deployed.**

---

## Quick Publish

```bash
cd packages/x402-devkit

# Login to npm (first time only)
npm login

# Build
bun run build

# Publish
npm publish --access public
```

---

## Prerequisites

1. **npm account** - Sign up at [npmjs.com](https://www.npmjs.com)

2. **Create npm organization** (recommended):
   - Go to [npmjs.com](https://www.npmjs.com)
   - Create organization: `x402-devkit`
   - This allows scoped packages like `@x402-devkit/sdk`

3. **Login locally:**
   ```bash
   npm login
   npm whoami  # Verify you're logged in
   ```

---

## Publishing Steps

### 1. Build the Package

```bash
cd packages/x402-devkit
bun run build
```

### 2. Verify Build

```bash
# Check what will be published
npm pack --dry-run
```

### 3. Publish

```bash
npm publish --access public
```

---

## After Publishing

Developers can install:

```bash
npm install @x402-devkit/sdk
```

Then use:

```typescript
// Server
import { x402 } from '@x402-devkit/sdk/server'

// Client
import { x402Fetch } from '@x402-devkit/sdk/client'

// React
import { PaymentModal } from '@x402-devkit/sdk/client/react'
```

---

## Updating the Package

### 1. Update Version

In `package.json`:
```json
{
  "version": "0.1.1"  // patch
  "version": "0.2.0"  // minor
  "version": "1.0.0"  // major
}
```

### 2. Build & Publish

```bash
bun run build
npm publish
```

---

## Versioning

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (0.1.0 → 0.1.1): Bug fixes
- **Minor** (0.1.0 → 0.2.0): New features, backward compatible
- **Major** (0.1.0 → 1.0.0): Breaking changes

---

## Package Structure

```
@x402-devkit/sdk
├── /server        # Server middleware (Hono)
├── /client        # Client SDK (fetch, wallet)
└── /client/react  # React components
```

---

## Troubleshooting

### "Package name already exists"
- Use a different scope: `@yourusername/x402-sdk`

### "Access denied"
- Run `npm login`
- Ensure `"publishConfig": { "access": "public" }` is set

### "Cannot find module"
- Run `bun run build` first
- Check that `dist/` folder exists
