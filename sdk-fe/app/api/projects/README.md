# Projects API Routes

API routes for managing projects in the database.

## Endpoints

### 1. Create Project
**POST** `/api/projects`

Create a new project.

**Request Body:**
```json
{
  "name": "My API Project",
  "payTo": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "network": "mantle" // optional, defaults to "mantle"
}
```

**Response (201):**
```json
{
  "id": "clx...",
  "appId": "hashed_app_id",
  "name": "My API Project",
  "payTo": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "network": "mantle",
  "status": "ACTIVE",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "projectId": "proj_abc123" // Original project ID (not hashed)
}
```

---

### 2. Get All Projects
**GET** `/api/projects`

Get all projects.

**Response (200):**
```json
[
  {
    "id": "clx...",
    "appId": "hashed_app_id",
    "name": "My API Project",
    "payTo": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "network": "mantle",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 3. Get Project by appId
**GET** `/api/projects?appId=hashed_app_id`

or

**GET** `/api/projects/[appId]`

Get a specific project by its hashed appId.

**Response (200):**
```json
{
  "id": "clx...",
  "appId": "hashed_app_id",
  "name": "My API Project",
  "payTo": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "network": "mantle",
  "status": "ACTIVE",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Response (404):**
```json
{
  "error": "Project not found"
}
```

---

### 4. Update Project
**PATCH** `/api/projects/[appId]`

Update a project. All fields are optional.

**Request Body:**
```json
{
  "name": "Updated Project Name", // optional
  "payTo": "0xNewWalletAddress", // optional
  "network": "mantle", // optional
  "status": "ACTIVE" // optional
}
```

**Response (200):**
```json
{
  "id": "clx...",
  "appId": "hashed_app_id",
  "name": "Updated Project Name",
  "payTo": "0xNewWalletAddress",
  "network": "mantle",
  "status": "ACTIVE",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 5. Update Payout Wallet
**PATCH** `/api/projects/[appId]/payTo`

Update only the payout wallet address.

**Request Body:**
```json
{
  "payTo": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response (200):**
```json
{
  "id": "clx...",
  "appId": "hashed_app_id",
  "name": "My API Project",
  "payTo": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "network": "mantle",
  "status": "ACTIVE",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 6. Delete Project (Soft Delete)
**DELETE** `/api/projects/[appId]`

Soft delete a project by setting status to "INACTIVE".

**Response (200):**
```json
{
  "message": "Project deleted",
  "project": {
    "id": "clx...",
    "appId": "hashed_app_id",
    "name": "My API Project",
    "payTo": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "network": "mantle",
    "status": "INACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Error Responses

All endpoints may return:

**400 Bad Request:**
```json
{
  "error": "Validation error message"
}
```

**404 Not Found:**
```json
{
  "error": "Project not found"
}
```

**409 Conflict:**
```json
{
  "error": "Project with this appId already exists"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to [operation] project"
}
```

---

## Usage Example

```typescript
// Create a project
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My API Project',
    payTo: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    network: 'mantle'
  })
})

const project = await response.json()
console.log(project.projectId) // Original project ID
console.log(project.appId) // Hashed appId stored in DB
```


