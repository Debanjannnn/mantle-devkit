# x402 DevKit SDK Frontend - Repository Overview

## 🎯 Project Purpose
This is a Next.js frontend application for **x402 DevKit** - a complete developer toolkit for building paid APIs on the Mantle Network. It provides a dashboard for managing projects, monitoring payments, and integrating x402 payment middleware.

---

## 📁 Project Structure

### **Root Level Files**
- `package.json` - Dependencies including Next.js 15, React 19, Privy (wallet auth), Prisma, Radix UI components
- `next.config.ts/mjs` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn/ui component configuration

---

## 🗂️ Directory Structure & Components

### **`/app` - Next.js App Router**

#### **`app/page.tsx`** - Landing Page
- **Purpose**: Marketing/landing page with horizontal scroll sections
- **Features**:
  - Hero section with code example
  - Horizontal scrolling sections (Work, Services, About, Pricing, FAQ)
  - Wallet connection via Privy
  - Auto-redirects authenticated users to dashboard
  - Auto-switches wallet to Mantle Sepolia Testnet
  - Touch and wheel scroll handling
  - Section navigation

#### **`app/layout.tsx`** - Root Layout
- **Purpose**: Wraps entire app with providers
- **Features**:
  - PrivyProviderWrapper for wallet authentication
  - Vercel Analytics
  - Global CSS imports
  - Metadata configuration

#### **`app/dashboard/page.tsx`** - Main Dashboard
- **Purpose**: Central dashboard for project management
- **Key Features**:
  - Project creation, selection, and management
  - State management for projects, selected project, dialog states
  - Admin panel access (checks if wallet is treasury admin)
  - Treasury data loading (pending fees, total collected)
  - Project loading with wallet filtering
  - Tab-based navigation (Overview, Analytics, Endpoints, Logs, Docs, Settings, Admin)
- **State Management**:
  - Projects list
  - Selected project
  - Dialog states (create project, edit payout wallet)
  - Loading/saving states
  - Admin status

---

### **`/app/api` - API Routes**

#### **`app/api/projects/route.ts`** - Projects CRUD
- **GET**: 
  - Get all projects
  - Filter by `walletAddress` (createdBy)
  - Get single project by `appId`
- **POST**: 
  - Create new project
  - Generates `projectId` (proj_xxxxx) and hashes it to `appId` (SHA256)
  - Validates wallet addresses
  - Prevents duplicate project names per wallet
  - Normalizes wallet addresses to lowercase

#### **`app/api/projects/[appId]/route.ts`** - Single Project Operations
- **GET**: Get project by appId
- **PATCH**: Update project (name, payTo, network, status)
- **DELETE**: Soft delete (sets status to INACTIVE)

#### **`app/api/projects/[appId]/payTo/route.ts`** - Payout Wallet Update
- **PATCH**: Update payout wallet address for a project
- Validates wallet address format

#### **`app/api/v1/validate/route.ts`** - Platform Validation
- **Purpose**: Used by server SDK to validate project configuration
- **GET**: Validates appId exists and project is ACTIVE
- Returns project config needed by SDK

---

### **`/components` - React Components**

#### **Dashboard Components**

##### **`components/dashboard/dashboard-sidebar.tsx`**
- **Purpose**: Collapsible sidebar navigation
- **Features**:
  - Tab navigation (Overview, Analytics, Endpoints, Logs, Docs, Settings)
  - Admin tab (only visible if user is admin)
  - Back to home button
  - Responsive collapse/expand

##### **`components/dashboard/dashboard-header.tsx`**
- **Purpose**: Top header bar
- **Features**:
  - Sidebar toggle button
  - Connected wallet display (truncated address)
  - Logout button
  - Dashboard title

##### **`components/dashboard/overview-tab.tsx`**
- **Purpose**: Main dashboard overview
- **Features**:
  - Project selector dropdown
  - Create project button
  - Project ID display (with show/hide toggle)
  - Payout wallet display and editing
  - Stats grid (Total Revenue, Active Endpoints, Success Rate) - *placeholder data*
  - Recent activity list - *placeholder data*
  - Empty state when no projects
  - Loading state

##### **`components/dashboard/create-project-dialog.tsx`**
- **Purpose**: Modal dialog for creating projects
- **Features**:
  - Two states: Form view and Success view
  - Form: Project name, payout wallet input, validation
  - Success: Shows created project details (name, network, payout wallet, project ID)
  - Copy project ID functionality
  - Wallet address validation
  - "Use connected wallet" button

##### **`components/dashboard/admin-tab.tsx`**
- **Purpose**: Admin panel for treasury management
- **Features**:
  - Displays pending fees (from Treasury contract)
  - Displays total collected fees
  - Collect fees button (placeholder - requires wallet interaction)
  - Treasury contract info display
  - Refresh button

##### **`components/dashboard/docs-tab.tsx`**
- **Purpose**: Documentation viewer
- **Features**:
  - Paginated list of documentation articles (10 docs)
  - Detailed view for each doc
  - Markdown rendering (headings, code blocks, lists)
  - Navigation between list and detail views
  - Topics: Getting Started, API Reference, Payment Integration, Wallet Config, Network Setup, Error Handling, Testing, Deployment, Monitoring, Security

##### **`components/dashboard/placeholder-tabs.tsx`**
- **Purpose**: Placeholder components for Analytics, Endpoints, Logs, Settings tabs
- **Status**: Not yet implemented

---

#### **UI Components**

##### **`components/ui/blur-fade.tsx`**
- **Purpose**: Animated fade-in component with blur effect
- **Features**:
  - Direction-based animations (up, down, left, right)
  - Configurable delay, duration, offset, blur
  - Intersection Observer for scroll-triggered animations

##### **`components/ui/magic-card.tsx`**
- **Purpose**: Card component with gradient hover effect
- **Features**:
  - Mouse-tracking gradient effect
  - Configurable gradient colors and size
  - Smooth animations

##### **`components/ui/scroll-progress.tsx`**
- **Purpose**: Scroll progress indicator
- **Features**:
  - Tracks horizontal scroll progress
  - Visual progress bar

##### **`components/magnetic-button.tsx`**
- **Purpose**: Button with magnetic hover effect
- **Features**:
  - Attracts cursor on hover
  - Multiple variants (primary, secondary)
  - Multiple sizes

##### **`components/custom-cursor.tsx`**
- **Purpose**: Custom cursor component
- **Status**: Likely for landing page effects

##### **`components/grain-overlay.tsx`**
- **Purpose**: Grain texture overlay
- **Status**: Visual effect for landing page

##### **`components/privy-provider.tsx`**
- **Purpose**: Privy authentication provider wrapper
- **Features**:
  - Configures Privy with Mantle networks (Testnet & Mainnet)
  - Sets default chain to Mantle Testnet
  - Configures login methods (wallet, email, SMS)
  - Embedded wallet creation

---

#### **Section Components** (Landing Page)

- **`components/sections/about-section.tsx`** - About x402 section
- **`components/sections/contact-section.tsx`** - Contact information
- **`components/sections/faq-section.tsx`** - Frequently asked questions
- **`components/sections/pricing-section.tsx`** - Pricing information
- **`components/sections/services-section.tsx`** - Services overview
- **`components/sections/work-section.tsx`** - Use cases/work examples

---

### **`/lib` - Utility Libraries**

#### **`lib/api-client.ts`**
- **Purpose**: Client-side API functions
- **Functions**:
  - `getProjects(walletAddress?)` - Fetch projects, optionally filtered by wallet
  - `getProject(appId)` - Get single project
  - `createProject(data)` - Create new project
  - `updateProject(appId, data)` - Update project
  - `updatePayoutWallet(appId, payTo)` - Update payout wallet
  - `deleteProject(appId)` - Soft delete project
- **Interfaces**: `Project`, `CreateProjectData`, `UpdateProjectData`

#### **`lib/project-utils.ts`**
- **Purpose**: Project ID generation and hashing
- **Functions**:
  - `generateProjectId()` - Generates `proj_xxxxxxxxxxxx` format ID
  - `hashProjectId(projectId)` - SHA256 hash of project ID to create `appId`

#### **`lib/chains.ts`**
- **Purpose**: Viem chain configurations
- **Exports**:
  - `MantleTestnet` - Chain ID 5003
  - `MantleMainnet` - Chain ID 5000

#### **`lib/prisma.ts`**
- **Purpose**: Prisma client initialization
- **Features**:
  - PostgreSQL connection pool
  - PrismaPg adapter for Prisma 7
  - Global instance for development
  - Connection string from `DATABASE_URL` env var

#### **`lib/utils.ts`**
- **Purpose**: Utility functions (likely `cn()` for className merging)

---

### **`/prisma` - Database**

#### **`prisma/prisma/schema.prisma`**
- **Model**: `Project`
  - `id` - CUID primary key
  - `appId` - Unique hashed project ID (SHA256 of projectId)
  - `name` - Project name
  - `payTo` - Payout wallet address
  - `createdBy` - Creator wallet address
  - `network` - Network name (default: "mantle")
  - `status` - Project status (default: "ACTIVE")
  - `createdAt`, `updatedAt` - Timestamps
  - **Indexes**: appId, payTo, createdBy

---

### **`/hooks` - React Hooks**

#### **`hooks/use-reveal.ts`**
- **Purpose**: Likely for scroll reveal animations
- **Status**: Used in landing page sections

---

## 🔄 Data Flow

### **Project Creation Flow**
1. User clicks "Create New Project" → Opens dialog
2. User fills form (name, payout wallet) → Validates wallet address
3. Submits → `createProject()` API call
4. API generates `projectId` → Hashes to `appId` → Saves to DB
5. Returns project with both `projectId` and `appId`
6. Dialog shows success view with project details
7. Projects list reloads

### **Project Selection Flow**
1. User selects project from dropdown
2. Updates selected project state
3. Loads project details (name, payout wallet, IDs)
4. Overview tab displays project info

### **Payout Wallet Update Flow**
1. User clicks edit on payout wallet
2. Enters new wallet address → Validates
3. Saves → `updatePayoutWallet()` API call
4. Updates project in DB
5. UI updates with new wallet

---

## 🔐 Authentication & Authorization

- **Provider**: Privy (wallet, email, SMS login)
- **Network**: Mantle Sepolia Testnet (default)
- **Admin Check**: Compares connected wallet to `TREASURY_ADMIN` address
- **Project Filtering**: Projects filtered by `createdBy` (wallet address)

---

## 🎨 Styling

- **Framework**: Tailwind CSS v4
- **Theme**: Custom with `foreground` and `background` variables
- **Components**: Radix UI primitives + shadcn/ui
- **Animations**: Motion (Framer Motion) for animations
- **Design**: Modern, minimalist with glassmorphism effects

---

## 📊 Key Features

1. **Project Management**
   - Create, read, update, delete projects
   - Project ID generation and hashing
   - Wallet-based project ownership

2. **Dashboard**
   - Overview with stats (placeholder)
   - Project selection
   - Payout wallet management
   - Admin panel for treasury

3. **Documentation**
   - In-app documentation viewer
   - 10 comprehensive guides
   - Markdown rendering

4. **Authentication**
   - Wallet connection via Privy
   - Auto network switching
   - Embedded wallet creation

5. **API Integration**
   - RESTful API for projects
   - Platform validation endpoint for SDK
   - Wallet address normalization

---

## 🚀 Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_PRIVY_APP_ID` - Privy application ID

---

## 📝 Notes

- **Placeholder Data**: Stats and activity in Overview tab are hardcoded
- **Admin Features**: Fee collection requires wallet interaction (not fully implemented)
- **Network**: Currently configured for Mantle Sepolia Testnet
- **Project IDs**: Original `projectId` is only returned on creation, stored as hashed `appId` in DB
- **Soft Deletes**: Projects are soft-deleted (status set to INACTIVE)

---

## 🔗 Integration Points

- **Server SDK**: Uses `/api/v1/validate` endpoint to validate projects
- **Database**: PostgreSQL via Prisma
- **Wallet**: Privy for authentication and wallet management
- **Blockchain**: Mantle Network for payments

---

This repository provides a complete frontend for managing x402 payment projects, with a modern UI, comprehensive project management, and integration with the Mantle blockchain network.

