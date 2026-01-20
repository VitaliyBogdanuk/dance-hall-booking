# Dance Hall Booking System

**MVP PWA "Dance Studio Booking"** - A production-ready booking system for dance studios built with Next.js App Router, TypeScript, MongoDB, and NextAuth.

## Features Overview

### 🎯 Core Functionality
- **Multi-role system**: ADMIN, TRAINER, and PARENT roles with role-based access control
- **Hall management**: Create and manage dance halls with time blocking
- **Class scheduling**: Trainers can create, edit, and cancel classes with conflict detection
- **Booking system**: Parents can book classes with atomic seat reservation
- **Child profiles**: Parents manage their children's profiles
- **Payment tracking**: Admin manages payment records with status tracking

### 🎨 User Interface
- **Apple-like design**: Clean, minimal UI with consistent spacing and typography
- **Responsive design**: Mobile-friendly layouts for all screens
- **Role-based dashboards**: Customized interfaces for each user role
- **Real-time updates**: UI updates immediately after mutations
- **Loading & error states**: Comprehensive state management throughout

### 🔒 Security & Production Ready
- **Rate limiting**: Protection against API abuse (120 req/min for public, 30 req/min for bookings)
- **Security headers**: X-Content-Type-Options, X-Frame-Options, CSP, and more
- **Input sanitization**: All user inputs automatically sanitized
- **Structured logging**: JSON-formatted logs with request IDs
- **Audit logging**: Complete audit trail in MongoDB for compliance

### 📱 Progressive Web App
- **Installable**: Users can install the app on their device
- **Offline support**: Schedule data cached and available offline
- **Smart caching**: Stale-while-revalidate for schedule, cache-first for static assets
- **Install prompts**: Native install prompts with iOS support

### 📊 Observability
- **Request tracing**: Every request has a unique requestId
- **Structured logs**: Single-line JSON logs for easy parsing
- **Audit logs**: All important actions recorded in AuditLog collection
- **Error tracking**: Consistent error format with proper error codes

### ⚙️ Developer Experience
- **TypeScript**: Full type safety throughout
- **Zod validation**: Runtime validation for all API inputs
- **Clean architecture**: Separation of concerns with services layer
- **Client fetcher**: Reusable API client with consistent error handling

## Local Run Steps

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (free tier) or local MongoDB instance
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dance-hall-booking
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `env.example` to `.env.local`
   - Update the values with your MongoDB connection string and generate a secure `NEXTAUTH_SECRET`

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Environment Variables

Required environment variables (see `env.example` for template):

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `MONGODB_DBNAME` | Database name (optional) | `dance-hall-booking` |
| `NEXTAUTH_SECRET` | Secret for JWT signing (min 32 chars) | Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` (dev) or production URL |
| `NODE_ENV` | Environment | `development` or `production` |
| `CRON_SECRET` | Secret for cron job authentication (optional) | Generate with: `openssl rand -base64 32` |

**Important**: Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## How to Run Lint

### Check for linting errors:
```bash
npm run lint
```

### Auto-fix linting errors:
```bash
npm run lint:fix
```

### Format code with Prettier:
```bash
npm run format
```

### Check formatting without changes:
```bash
npm run format:check
```

### Type checking:
```bash
npm run type-check
```

### Database Setup

The application uses MongoDB with Mongoose. Models are automatically created on first use. For production, ensure you have:

- MongoDB Atlas cluster (free tier works for MVP)
- Network access configured (whitelist IPs or 0.0.0.0/0 for MVP)
- Database user with read/write permissions

### Seed Database (Development)

To populate the database with demo data including test users, run:

```bash
npm run seed
```

This will create:
- 1 admin user
- 1 trainer user with trainer profile
- 1 parent user with 1 child
- 1 hall
- 1 class session

**Development Login Credentials** (created by seed script):

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@dancestudio.com` | `admin123` |
| Trainer | `trainer@dancestudio.com` | `trainer123` |
| Parent | `parent@dancestudio.com` | `parent123` |

> **Note**: These credentials are for development only. In production, users should be created through proper registration flows or admin interfaces.

### Data Models

The application uses the following Mongoose models:

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **User** | User accounts with authentication | `email` (unique), `role` (ADMIN/TRAINER/PARENT), `passwordHash` (optional) |
| **TrainerProfile** | Trainer-specific information | `userId` (unique ref User), `bio`, `specialties`, `isActive` |
| **Child** | Child profiles linked to parents | `parentId` (ref User), `name`, `birthDate`, `notes` |
| **Hall** | Dance hall/studio rooms | `name`, `isActive` |
| **HallBlock** | Time blocks when halls are unavailable | `hallId` (ref Hall), `startAt`, `endAt`, `reason`, `createdByAdminId` |
| **ClassSession** | Scheduled dance classes | `trainerId` (ref TrainerProfile), `hallId` (ref Hall), `startAt`, `endAt`, `capacity`, `takenSeats`, `status` (SCHEDULED/CANCELED) |
| **Booking** | Parent bookings for class sessions | `classSessionId` (ref ClassSession), `childId` (ref Child), `parentId` (ref User), `status` (BOOKED/CANCELED) |
| **PaymentRecord** | Payment tracking records | `parentId` (ref User), `month` (YYYY-MM), `amount`, `status` (PENDING/PAID/OVERDUE) |
| **AuditLog** | Audit trail for important actions | `actorUserId` (ref User, optional), `actorRole`, `action`, `entityType`, `entityId`, `metadata`, `requestId`, `ip`, `userAgent`, `createdAt` |

All models include `createdAt` and `updatedAt` timestamps. Indexes are configured for optimal query performance.

### Creating Initial Admin User

You'll need to create an admin user manually. You can use MongoDB Compass, MongoDB shell, or create a seed script:

```typescript
// scripts/seed-admin.ts (create this file)
import { connectOnce } from "@/server/db/mongoose";
import { UserModel } from "@/server/db/models/user.model";
import bcrypt from "bcryptjs";

async function seedAdmin() {
  await connectOnce();
  const passwordHash = await bcrypt.hash("admin123", 10);
  const admin = new UserModel({
    email: "admin@example.com",
    passwordHash,
    name: "Admin User",
    role: "ADMIN",
  });
  await admin.save();
  console.log("Admin user created:", admin.email);
}

seedAdmin();
```

## Architecture

### Project Structure

```
src/
  app/
    (admin)/          # Admin route group
      admin/          # Admin pages (halls, trainers, payments)
    (trainer)/        # Trainer route group
      trainer/        # Trainer pages (schedule, class attendees)
    (parent)/         # Parent route group
      parent/         # Parent pages (children, bookings)
    api/              # Next.js API routes (App Router)
      auth/           # NextAuth endpoints
      halls/          # Hall management
      blocks/         # Hall block management
      classes/        # Class sessions
      bookings/       # Booking management
      children/       # Child profiles
      schedule/       # Public schedule
      admin/          # Admin-only endpoints
      cron/           # Cron job endpoints
    schedule/         # Public schedule page
    login/            # Login page
    ui-kit/           # UI component showcase
  components/
    layout/           # Layout components (AppShell, TopBar, SideNav)
    ui/               # UI primitives (Button, Card, Input, etc.)
    pwa/              # PWA components (InstallPrompt)
    providers/        # React providers (SessionProvider)
  lib/
    fetcher.ts        # Client-side API fetcher helper
  server/
    auth/             # Authentication & RBAC
    db/
      models/         # Mongoose models (including AuditLog)
    services/         # Business logic layer
    validation/       # Zod schemas
    http/             # HTTP utilities (errors, responses, rate limiting, request context)
    utils/            # Utility functions (logger, sanitize, time overlap)
```

### Key Design Decisions

1. **Feature-based organization**: API routes organized by feature (halls, classes, bookings, etc.)
2. **Clean layering**: Validation → Service → Route
3. **Thin API routes**: All business logic in services
4. **Strict typing**: TypeScript with strict mode enabled
5. **Zod validation**: Every API route validates input with Zod
6. **RBAC guards**: Role-based access control (ADMIN, TRAINER, PARENT)
7. **Atomic operations**: Booking uses atomic `takenSeats` increment to prevent overbooking

### Authentication & Authorization

- **NextAuth v5** with JWT strategy
- **Credentials provider** for email/password authentication
- **RBAC guards**:
  - `requireAdmin()`: ADMIN only
  - `requireTrainer()`: ADMIN or TRAINER
  - `requireParent()`: ADMIN or PARENT

**Route Protection:**
- `/admin/*` routes require ADMIN role
- `/trainer/*` routes require TRAINER or ADMIN role
- `/parent/*` routes require PARENT or ADMIN role
- Unauthenticated users are redirected to `/login`
- Users with wrong roles are redirected to home page

**API Route Protection:**
- Admin write routes (POST/PATCH/DELETE `/api/halls*`, `/api/blocks*`, `/api/admin/*`) require ADMIN
- Trainer routes (POST/PATCH `/api/classes*`) require TRAINER or ADMIN
- Parent routes (POST/DELETE `/api/bookings*`, `/api/children*`) require PARENT or ADMIN
- All protected API routes return consistent JSON error responses
- Rate limiting applied to public and authenticated endpoints
- All API routes enforce HTTP method restrictions (405 for unsupported methods)

**Login:**
- Users can log in at `/login` with email and password
- Session includes `userId`, `role`, `name`, and `email`
- Logout button available in TopBar for authenticated users

### API Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  // Direct data response
  { ... }
}
```

**Error Response:**
All errors return a consistent JSON shape:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }  // Optional, contains validation errors or additional context
  }
}
```

**Common Error Codes:**
- `BAD_REQUEST` (400) - Invalid request data
- `UNAUTHORIZED` (401) - Authentication required
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Resource conflict (e.g., duplicate booking, time overlap)
- `TOO_MANY_REQUESTS` (429) - Rate limit exceeded
- `VALIDATION_ERROR` (400) - Zod validation failed
- `INTERNAL_ERROR` (500) - Server error
- `UNKNOWN_ERROR` (500) - Unexpected error

**Example Error Response:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "path": ["email"],
        "message": "Invalid email"
      }
    ]
  }
}
```

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Halls (Admin only)
- `GET /api/halls` - List all halls
- `POST /api/halls` - Create hall
- `GET /api/halls/[id]` - Get hall by ID
- `PATCH /api/halls/[id]` - Update hall
- `DELETE /api/halls/[id]` - Delete hall
- `POST /api/halls/[id]/blocks` - Create hall block
- `GET /api/halls/[id]/blocks` - List hall blocks

### Classes (Trainer)
- `POST /api/classes` - Create class session
- `GET /api/classes/[id]` - Get class by ID
- `PATCH /api/classes/[id]` - Update class
- `GET /api/classes/mine` - Get trainer's classes
- `GET /api/classes/[id]/bookings` - Get class bookings

### Schedule (Public)
- `GET /api/schedule` - Get schedule with filters (date, trainer, hall)

### Bookings (Parent)
- `POST /api/bookings` - Create booking (requires authenticated PARENT session)
- `DELETE /api/bookings/[id]` - Cancel booking (requires authenticated PARENT session)
- `GET /api/bookings/mine` - Get parent's bookings (requires authenticated PARENT session)

### Children (Parent)
- `GET /api/children` - List parent's children
- `POST /api/children` - Create child profile
- `GET /api/children/[id]` - Get child by ID
- `PATCH /api/children/[id]` - Update child
- `DELETE /api/children/[id]` - Delete child

### Admin
- `POST /api/admin/trainers` - Create trainer
- `GET /api/admin/trainers` - List trainers
- `GET /api/admin/classes` - List all classes (with filters)
- `POST /api/admin/payments` - Create payment record
- `GET /api/admin/payments` - List payment records
- `GET /api/admin/payments/[id]` - Get payment record by ID
- `PATCH /api/admin/payments/[id]` - Update payment record
- `GET /api/admin/parents` - List all parent users

### Blocks
- `GET /api/blocks/[id]` - Get block by ID
- `DELETE /api/blocks/[id]` - Delete hall block (requires authenticated ADMIN session)

### Cron Jobs
- `GET /api/cron/daily` - Daily maintenance tasks (protected by `x-cron-secret` header)

## Business Rules

### Class Creation
- Cannot create class in the past
- Cannot overlap with existing hall blocks
- Cannot overlap with other scheduled classes in the same hall
- Trainer must have active TrainerProfile

### Booking
- Atomic seat reservation using `takenSeats` increment
- Cannot book canceled classes
- Cannot book past classes
- Cannot double-book same child for same class
- Child must belong to the parent making the booking

### Hall Blocks
- Admin-only operation
- Prevents class creation in blocked time slots
- Cannot overlap with existing classes

## Development

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Running Utility Tests

The project includes a simple self-test for time overlap utilities:

```bash
# Using tsx (recommended)
npx tsx src/server/utils/timeOverlap.spec.ts

# Or using ts-node
npx ts-node src/server/utils/timeOverlap.spec.ts
```

This will run basic assertions to verify the `overlaps()` and `buildOverlapQuery()` functions work correctly.

### Building for Production
```bash
npm run build
npm start
```

## Vercel Deploy Notes (Free Tier)

### Prerequisites

1. GitHub account with repository pushed
2. Vercel account (free tier)
3. MongoDB Atlas cluster (free tier)

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   In Vercel project settings → Environment Variables, add:
   - `MONGODB_URL` - Your MongoDB Atlas connection string
   - `MONGODB_DBNAME` - Database name (optional)
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Will be auto-set to your Vercel URL (e.g., `https://your-app.vercel.app`)
   - `NODE_ENV` - Set to `production`

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - First deploy may take 2-3 minutes

### Free Tier Limits

- **Build time**: 45 minutes/month
- **Bandwidth**: 100GB/month
- **Serverless function execution**: 100GB-hours/month
- **Edge Middleware invocations**: 1M/month

For MVP, these limits are typically sufficient.

### MongoDB Atlas Free Tier Setup

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster (512MB storage)
3. Create database user (username/password)
4. Configure network access:
   - For MVP: Add IP `0.0.0.0/0` (allows all IPs)
   - For production: Add specific IPs or Vercel IP ranges
5. Get connection string from "Connect" → "Connect your application"
6. Replace `<password>` with your database user password

### Post-Deployment

- Your app will be available at `https://your-app.vercel.app`
- All future pushes to `main` branch will trigger automatic deployments
- Preview deployments are created for pull requests

## Observability

The application includes comprehensive observability and audit logging to track all important actions and provide request tracing.

### Request ID

Every API request is assigned a unique `requestId` that is:
- Extracted from the `x-request-id` header if present (for distributed tracing)
- Otherwise generated using `crypto.randomUUID()`
- Logged in all structured log entries
- Included in audit log records

The requestId allows you to trace a request through the entire system by searching logs and audit records.

### Structured Logging

All server-side logs are formatted as single-line JSON for easy parsing and aggregation:

```json
{"level":"info","event":"API_REQUEST","ts":"2024-01-15T10:30:00.000Z","requestId":"abc-123","method":"POST","path":"/api/halls"}
{"level":"info","event":"API_RESPONSE","ts":"2024-01-15T10:30:01.000Z","requestId":"abc-123","status":201,"path":"/api/halls"}
{"level":"error","event":"API_ERROR","ts":"2024-01-15T10:30:02.000Z","requestId":"abc-123","path":"/api/halls","error":"Validation failed"}
```

**Log Levels:**
- `info`: Normal operations (API requests, responses, audit records)
- `warn`: Warning conditions (non-critical issues)
- `error`: Error conditions (exceptions, failures)
- `debug`: Debug information (only in development mode)

**Logger API:**
```typescript
import { logger } from "@/server/utils/logger";

logger.logInfo("EVENT_NAME", { requestId, ...payload });
logger.logWarn("EVENT_NAME", { requestId, ...payload });
logger.logError("EVENT_NAME", { requestId, ...payload }, error);
```

### Audit Log Collection

Important actions are automatically recorded in the `AuditLog` MongoDB collection for compliance and debugging.

**Audit Log Fields:**
- `actorUserId`: User ID who performed the action (optional for unauthenticated)
- `actorRole`: Role of the actor (`ADMIN`, `TRAINER`, `PARENT`, `ANON`)
- `action`: Action code (e.g., `HALL_CREATED`, `CLASS_CREATED`, `BOOKING_CANCELED`)
- `entityType`: Type of entity affected (`Hall`, `ClassSession`, `Booking`, `PaymentRecord`, etc.)
- `entityId`: ID of the affected entity
- `metadata`: Small, sanitized metadata object (no sensitive data)
- `requestId`: Request ID for tracing
- `ip`: Client IP address (if available)
- `userAgent`: Client user agent (if available)
- `createdAt`: Timestamp of the action

**Indexes:**
- `createdAt` (descending) - for time-based queries
- `actorUserId + createdAt` - for user activity queries
- `action + createdAt` - for action-based queries

**Recorded Actions:**
- `HALL_CREATED`, `HALL_UPDATED`
- `BLOCK_CREATED`, `BLOCK_DELETED`
- `CLASS_CREATED`, `CLASS_UPDATED`, `CLASS_CANCELED`
- `BOOKING_CREATED`, `BOOKING_CANCELED`
- `PAYMENT_CREATED`, `PAYMENT_UPDATED`

**Security:**
- Sensitive data (passwords, tokens, secrets) is automatically filtered from metadata
- Only minimal, non-sensitive information is stored
- Audit logs are append-only and should not be modified

**Querying Audit Logs:**
```javascript
// Find all actions by a user
db.auditlogs.find({ actorUserId: ObjectId("...") }).sort({ createdAt: -1 })

// Find all class creations in the last 24 hours
db.auditlogs.find({ 
  action: "CLASS_CREATED", 
  createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) }
}).sort({ createdAt: -1 })

// Trace a specific request
db.auditlogs.find({ requestId: "abc-123" }).sort({ createdAt: 1 })
```

## PWA (Progressive Web App)

The application is a fully installable Progressive Web App with offline support and optimized caching strategies.

### Features

- **Installable**: Users can install the app on their device home screen
- **Offline Support**: Schedule data is cached and available offline
- **Optimized Caching**: Smart caching strategies for different content types
- **iOS Support**: Special instructions for iOS Safari users

### Caching Strategy

The service worker implements different caching strategies based on content type:

- **Cache First**: Static assets (JS, CSS, images, fonts) - served from cache immediately
- **Stale-While-Revalidate**: Schedule API (`GET /api/schedule`) - shows cached data immediately, updates in background
- **Network First**: All other API routes and HTML pages - tries network first, falls back to cache
- **No Cache**: POST, DELETE, PATCH requests are never cached

### Testing PWA Locally

1. **Build and start the production server:**
   ```bash
   npm run build
   npm start
   ```

2. **Open in Chrome/Edge:**
   - Navigate to `http://localhost:3000`
   - Open DevTools (F12) → Application tab
   - Check "Service Workers" section - should show registered worker
   - Check "Cache Storage" - should show cached assets after first load

3. **Test Offline Mode:**
   - Open DevTools → Network tab
   - Check "Offline" checkbox
   - Navigate to `/schedule` - should show cached data
   - You should see an offline banner if cached data exists

4. **Test Install Prompt:**
   - In Chrome/Edge, look for install icon in address bar
   - Or check Application tab → Manifest → "Add to homescreen"
   - The "Install App" button in TopBar should appear on supported browsers

### Testing Offline Caching in DevTools

1. **View Cache Contents:**
   - DevTools → Application → Cache Storage
   - Expand `dance-studio-v1-static` and `dance-studio-v1-api`
   - Verify schedule API responses are cached with query parameters

2. **Test Cache Updates:**
   - Load `/schedule` online (cache is populated)
   - Go offline
   - Reload page - should show cached schedule
   - Go online - next request will update cache in background

3. **Clear Cache:**
   - DevTools → Application → Clear storage
   - Or: Application → Service Workers → Unregister
   - Reload to re-register and rebuild cache

### iOS Install Instructions

On iOS Safari, the install prompt works differently:

1. Tap the Share button (square with arrow)
2. Scroll down and tap "Add to Home Screen"
3. The app will appear on your home screen

The app automatically detects iOS and shows a helpful tooltip when users click "Install App" button.

### Icons and Manifest

The app requires the following icons (place in `/public` directory):

- `icon-192.png` - 192x192 PNG for Android/Chrome
- `icon-512.png` - 512x512 PNG for Android/Chrome
- `apple-touch-icon.png` - 180x180 PNG for iOS

**Note**: Placeholder files are included. Replace them with actual icons before production deployment.

You can generate icons using:
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
- Or create manually with design tools

### Manifest Configuration

The `manifest.json` includes:
- App name and short name
- Start URL (`/`)
- Display mode (`standalone` - app-like experience)
- Theme colors
- Icons configuration

All fields are configured for optimal PWA experience across platforms.

## Security & Rate Limiting

The application includes production-ready security measures and rate limiting to protect against abuse.

### Rate Limiting

Rate limiting is implemented to prevent API abuse and ensure fair usage:

- **Public GET endpoints** (e.g., `/api/schedule`): 120 requests per minute per IP
- **Auth endpoints** (`/api/auth/*`): 10 requests per minute per IP
- **Booking endpoints** (`/api/bookings*`): 30 requests per minute per userId

**Rate limit keys:**
- Authenticated requests: Uses `userId` as the key
- Unauthenticated requests: Uses IP address as the key

**Storage:**
- MVP uses in-memory Map with automatic TTL cleanup
- **Limitation**: Rate limits are reset on server restart and don't work across multiple instances
- For production with multiple instances, consider using Redis or MongoDB-based rate limiting

**Error response:**
When rate limit is exceeded, the API returns HTTP 429 (Too Many Requests) with:
```json
{
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Rate limit exceeded. Try again in X seconds.",
    "retryAfter": 60
  }
}
```

### Security Headers

All responses include security headers:

- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Permissions-Policy: geolocation=(), microphone=(), camera=()` - Disables unnecessary features
- `Content-Security-Policy` - Restricts resource loading (relaxed for Next.js compatibility)

**CSP Note:** The CSP policy includes `'unsafe-inline'` and `'unsafe-eval'` for Next.js compatibility. For stricter security, consider using nonces or hashes in production.

### Input Sanitization

All user inputs are automatically sanitized:

- **String fields**: Trimmed and control characters removed
- **Deep sanitization**: Applied recursively to nested objects
- **Non-mutating**: Original objects are not modified, sanitized copies are returned

Sanitization is applied in:
- Hall creation/updates
- Class creation/updates
- Child creation/updates
- Payment record creation/updates

### API Surface Protection

- **Method restrictions**: All API routes only accept intended HTTP methods
- **405 responses**: Unsupported methods return HTTP 405 (Method Not Allowed)
- **Error hiding**: Stack traces and internal details are hidden in production
- **Structured errors**: All errors follow consistent JSON format

## Production Caveats (MVP)

### Rate Limiting

- **In-memory storage**: Rate limits are lost on server restart
- **Single instance**: Doesn't work across multiple server instances
- **Solution for scaling**: Migrate to Redis or MongoDB-based rate limiting

### Security Headers

- **CSP relaxed**: Includes `'unsafe-inline'` for Next.js compatibility
- **Future improvement**: Implement nonce-based CSP for stricter security

### Error Handling

- **Production mode**: Stack traces are hidden, only generic error messages shown
- **Development mode**: Full error details for debugging

### Input Validation

- **Zod validation**: All inputs validated with Zod schemas
- **Sanitization**: Applied after validation
- **Type safety**: Full TypeScript coverage

## Cron Jobs

The application includes a daily cron job endpoint for scheduled maintenance tasks.

### Endpoint

`GET /api/cron/daily`

### Protection

Protected by `x-cron-secret` header. Set `CRON_SECRET` environment variable:

```bash
CRON_SECRET=your-secret-here
```

### Current Tasks

- **Rate limit cleanup**: Automatic cleanup of expired entries (handled by interval)
- **Future tasks**: Can be extended to mark past classes as completed, send reminders, etc.

### Setup Options

#### Option 1: Vercel Cron Jobs

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/daily",
    "schedule": "0 2 * * *"
  }]
}
```

Configure in Vercel dashboard:
1. Go to Project Settings → Cron Jobs
2. Add cron job with:
   - Path: `/api/cron/daily`
   - Schedule: `0 2 * * *` (2 AM daily)
   - Headers: `x-cron-secret: your-secret-value`

#### Option 2: External Scheduler

Use services like:
- [cron-job.org](https://cron-job.org/)
- [EasyCron](https://www.easycron.com/)
- [Cronitor](https://cronitor.io/)

Configure:
- URL: `https://your-app.vercel.app/api/cron/daily`
- Method: GET
- Headers: `x-cron-secret: your-secret-value`
- Schedule: Daily at preferred time

### Testing

Test locally with curl:

```bash
curl -H "x-cron-secret: your-secret" http://localhost:3000/api/cron/daily
```

## User Interface Pages

### Public Pages
- **`/schedule`** - Public schedule page with filters (date, trainer, hall)
  - Shows available classes with time, trainer, hall, seats left
  - "Book" button for logged-in parents
  - "Log in to book" for guests
  - Offline support with cached data
  - Booking modal with child selection

### Admin Pages (`/admin/*`)
- **`/admin/halls`** - Hall management
  - List all halls in card layout
  - Create new hall (modal)
  - Edit hall name and active status (modal)
  - View blocks button for each hall
- **`/admin/halls/[id]/blocks`** - Hall block management
  - Shows hall summary and blocks grouped by date
  - Create block with start/end time and reason (modal)
  - Delete block with confirmation
- **`/admin/trainers`** - Trainer management
  - List all trainers in card layout
  - Create trainer with name, email, password, bio, specialties (modal)
- **`/admin/payments`** - Payment management
  - Table view of all payment records
  - Client-side filters (status, month, parent email)
  - Create payment record (modal)
  - Edit payment amount, status, notes (modal)

### Trainer Pages (`/trainer/*`)
- **`/trainer/schedule`** - Trainer's class schedule
  - List classes grouped by day
  - Shows time, hall, capacity, seats left, status
  - Create class (modal) with hall, start/end time, capacity, price
  - Edit class (modal) - update time, hall, capacity, price
  - Cancel class with confirmation
  - "Attendees" button to view bookings
  - Conflict error handling (409) with toast notifications
- **`/trainer/classes/[id]/attendees`** - Class attendees view
  - Shows class summary (date, time, hall, attendance)
  - List of all bookings with child name and parent info
  - Empty state when no bookings

### Parent Pages (`/parent/*`)
- **`/parent/children`** - Child profile management
  - List all children in card layout
  - Create child (modal) with name, birth date, notes
  - Edit child (modal)
  - Delete child with confirmation
- **`/parent/bookings`** - My bookings
  - List bookings grouped by "Upcoming" and "Past"
  - Shows class details (date, time, trainer, hall, child)
  - Cancel booking for upcoming classes only
  - Status badges for canceled bookings

## Client-Side Data Fetching

The application uses a custom fetcher helper (`src/lib/fetcher.ts`) for consistent API interaction:

**Functions:**
- `apiGet<T>(url)` - GET request with JSON parsing
- `apiPost<T>(url, body)` - POST request with JSON body
- `apiPatch<T>(url, body)` - PATCH request with JSON body
- `apiDelete<T>(url)` - DELETE request
- `datetimeLocalToISO(value)` - Convert datetime-local input to ISO string
- `isoToDatetimeLocal(iso)` - Convert ISO string to datetime-local format

**Error Handling:**
- All functions throw `FetchError` with `{code, message, details}` structure
- Automatic JSON parsing
- Consistent error shape for UI handling

**Usage Example:**
```typescript
import { apiGet, apiPost, FetchError } from "@/lib/fetcher";

try {
  const halls = await apiGet<Hall[]>("/api/halls");
  const newHall = await apiPost<Hall>("/api/halls", { name: "Studio A" });
} catch (err) {
  const error = err as FetchError;
  console.error(error.code, error.message);
}
```

## MVP Scope

### Included
- ✅ User authentication (ADMIN, TRAINER, PARENT roles) with NextAuth
- ✅ Hall management (CRUD) with admin UI
- ✅ Hall time blocking with admin UI
- ✅ Class session creation and management with trainer UI
- ✅ Booking system with atomic seat reservation and parent UI
- ✅ Child profile management with parent UI
- ✅ Payment record tracking (manual status updates) with admin UI
- ✅ RBAC guards on all endpoints and routes
- ✅ Input validation with Zod
- ✅ Input sanitization for all user inputs
- ✅ Error handling and structured logging
- ✅ Rate limiting for API protection
- ✅ Security headers on all responses
- ✅ Observability with request IDs and audit logging
- ✅ PWA with offline support and install prompts
- ✅ Apple-like UI design system

### Not Included (Future)
- Online payment integration (Stripe/LiqPay)
- Complex subscription packages
- Push notifications
- Email notifications
- Advanced reporting
- Recurring classes
- Waitlist functionality

## Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens for session management
- RBAC enforced on all protected routes
- Input validation on all endpoints
- MongoDB injection protection via Mongoose
- Environment variables for sensitive data

## Contributing

This is an MVP implementation. For production use, consider:
- ✅ Rate limiting (implemented - can be enhanced with Redis for multi-instance)
- ✅ Request logging/monitoring (implemented with structured logging and audit logs)
- Adding comprehensive test coverage
- Setting up CI/CD pipeline
- Adding API documentation (OpenAPI/Swagger)
- Migrating rate limiting to Redis/MongoDB for multi-instance support
- Implementing nonce-based CSP for stricter security
- Adding email notifications
- Adding push notifications

---

**MVP PWA "Dance Studio Booking"**, з фокусом на **швидку розробку через Cursor AI**, **деплой на Vercel з GitHub (free tier)**, **Apple-style UI**, і **архітектуру, яку легко масштабувати**.

---

## 1) MVP-цілі та межі (щоб швидко запуститись)

### 1.1 Ролі та ключові сценарії

**Адмін**

* Створює/редагує **зали** (Hall).
* Створює **тренерів** (Trainer) та їх доступи.
* **Блокує слоти часу** в залах (наприклад, “групові заняття”, “оренда”, “ремонт”).
* Бачить облік занять тренерів: хто провів, скільки записів, відвідування (MVP можна без фактичного “чекина”).
* Контролює **оплати** (MVP: ручне підтвердження / статус платежу).

**Тренер**

* Створює **заняття** у вибраних залах.
* Вказує **максимальну кількість дітей** на заняття.
* Переглядає список записаних дітей, керує статусом (MVP: “записаний/скасований”).

**Дитина/Батьки (Клієнт)**

* Дивиться розклад тренерів/залів.
* Записується на заняття, якщо є вільні місця.
* Скасовує запис (за правилами).

### 1.2 MVP що не робимо одразу

* Складні абонементи/пакети/заморозки.
* Онлайн-оплата (можна додати потім Stripe/LiqPay).
* Складні ролі “менеджер”, “старший тренер”, тощо.
* Нотифікації (push/email/sms) — можна як наступний етап.

---

## 2) Техстек під Cursor + Vercel (free) і масштабування

### 2.1 Frontend (PWA)

* **Next.js (App Router) + TypeScript**
* **TailwindCSS** (швидко робити “Apple-подібний” мінімалізм)
* **next-pwa** або нативний service worker (на старті — next-pwa)
* UI-компоненти: легкі власні компоненти або shadcn/ui (можна стилізувати “Apple-like”)

### 2.2 Backend

Варіант для Vercel:

* **Next.js API Routes / Server Actions** як BFF (backend-for-frontend)
* **MongoDB Atlas** (free tier) + **Prisma** (MongoDB provider) або Mongoose

  * Для “best practices” і контролю схем — зручно Prisma.
* Auth: **NextAuth.js (Auth.js)** з ролями.

### 2.3 Чому так

* Один репозиторій → Cursor легко генерує модулі.
* Vercel безболісно деплоїть і фронт, і API.
* MongoDB Atlas free → MVP без витрат.
* Архітектура готова до виділення в окремі сервіси пізніше.

---

## 3) Архітектура: модулі, шари, патерни

### 3.1 Вертикальні модулі (feature-based)

Рекомендується структура:

* `features/auth`
* `features/halls`
* `features/blocks` (блокування часу)
* `features/classes` (заняття)
* `features/bookings` (записи)
* `features/payments` (MVP: статуси/рахунок)
* `features/admin-dashboard`

### 3.2 Шари (Clean-ish, але без фанатизму для MVP)

* **UI layer**: компоненти, сторінки, форми.
* **Application layer**: use-cases (сервіси типу `CreateClass`, `BookSpot`, `BlockHallTime`).
* **Domain layer**: типи, правила (валідація, бізнес-інваріанти).
* **Infrastructure layer**: репозиторії, Prisma/Mongo, зовнішні інтеграції.

### 3.3 Патерни

* Repository pattern (Mongo сховано за інтерфейсами)
* DTO + validation (Zod)
* RBAC (role-based access control)
* Optimistic concurrency / atomic operations для записів (щоб не було “перезапису місць”)

---

## 4) Дані та моделі (MongoDB)

### 4.1 Основні колекції

* **User**: `id, role (ADMIN|TRAINER|PARENT), name, phone, email`
* **Child**: `id, parentId, name, birthDate, notes`
* **Hall**: `id, name, capacity?, location?, isActive`
* **TrainerProfile**: `id, userId, bio, specialties`
* **ClassSession** (заняття):
  `id, trainerId, hallId, startAt, endAt, capacity, status (SCHEDULED|CANCELED), price?`
* **Booking** (запис):
  `id, classSessionId, childId, parentId, status (BOOKED|CANCELED), createdAt`
* **HallBlock** (блок часу залу):
  `id, hallId, startAt, endAt, reason, createdByAdminId`
* **PaymentRecord** (MVP простий облік):
  `id, parentId, month, amount, status (PENDING|PAID|OVERDUE), notes`

### 4.2 Критичні інваріанти

* Заняття **не можна створити**, якщо:

  * у залі є **HallBlock** на цей час
  * у залі вже є інше **ClassSession** (перетин)
* Запис **не можна зробити**, якщо:

  * заняття скасоване/в минулому
  * вже немає місць (`bookingsCount < capacity`)
  * дитина вже записана на цей слот

### 4.3 Як гарантувати “не більше N записів” (важливо)

Для MVP на Mongo є 2 надійні підходи:

1. **Транзакція** (MongoDB replica set у Atlas є)

   * перевірити кількість активних бронювань → вставити booking → підтвердити
2. **Атомарний ліміт через поле `takenSeats`**

   * оновлення `ClassSession` типу: `takenSeats += 1` тільки якщо `takenSeats < capacity`
   * якщо апдейт не пройшов — місць нема.
     Це краще для масштабування і простіше для Cursor-генерації.

---

## 5) API / Use-cases (мінімальний контракт)

### 5.1 Адмін

* `POST /api/halls` створити зал
* `POST /api/halls/{id}/blocks` заблокувати час
* `POST /api/trainers` створити тренера
* `GET /api/admin/classes` список занять + фільтри
* `GET /api/admin/payments` платежі
* `PATCH /api/admin/payments/{id}` статус платежу

### 5.2 Тренер

* `POST /api/classes` створити заняття
* `PATCH /api/classes/{id}` редагування/скасування
* `GET /api/classes/mine` мої заняття
* `GET /api/classes/{id}/bookings` список записів

### 5.3 Клієнт

* `GET /api/schedule` розклад (фільтри: дата, тренер, зал)
* `POST /api/bookings` запис на заняття
* `DELETE /api/bookings/{id}` скасувати

---

## 6) Авторизація та безпека

* NextAuth/Auth.js: email+password (credentials) або magic-link (простішe для батьків).
* RBAC middleware:

  * ADMIN: все
  * TRAINER: тільки свої заняття + читання своїх записів
  * PARENT: тільки свої діти/свої записи
* Валідація Zod на вході кожного endpoint/use-case.
* Логи (мінімум): request id + action + user id.

---

## 7) Apple-style UI (best practices)

### 7.1 Принципи

* Мінімалізм, “air”, чітка ієрархія.
* Великі заголовки, акуратні картки, м’які тіні, округлення.
* Максимум 1 primary action на екран.
* Продумані стани: loading/empty/error.

### 7.2 Екрани MVP

**Клієнт**

* ✅ Home / Schedule: календар + список занять (cards) - `/schedule`
* ✅ Class details: тренер, зал, місця, кнопка "Записатись" - integrated in schedule cards
* ✅ My bookings: список майбутніх записів - `/parent/bookings`
* ✅ My children: управління профілями дітей - `/parent/children`

**Тренер**

* ✅ My schedule: тиждень/день, кнопка "+ Заняття" - `/trainer/schedule`
* ✅ Create class form: зал, дата/час, capacity - modal in schedule page
* ✅ Class attendees: список дітей - `/trainer/classes/[id]/attendees`

**Адмін**

* ✅ Halls: список + "Створити зал" - `/admin/halls`
* ✅ Hall blocks: календар залу + "Заблокувати" - `/admin/halls/[id]/blocks`
* ✅ Payments: таблиця статусів + фільтр - `/admin/payments`
* ✅ Trainers: список + створення тренерів - `/admin/trainers`

---

## 8) PWA-функціонал (MVP)

* ✅ Installable (manifest, icons, theme color)
* ✅ Offline мінімум:

  * кеш shell/статичних ресурсів
  * розклад можна кешувати read-only (stale-while-revalidate)
  * offline banner на сторінці розкладу
* ✅ Install prompt UI з підтримкою iOS
* Push-нотифікації — не в MVP.

---

## 9) Розгортання на Vercel (free) + GitHub

* Один GitHub repo.
* Vercel імпорт репозиторію, авто-деплой на `main`.
* ENV в Vercel:

  * `MONGODB_URL`
  * `MONGODB_DBNAME` (optional)
  * `NEXTAUTH_SECRET`
  * `NEXTAUTH_URL`
  * `NODE_ENV=production`
  * `CRON_SECRET` (optional, для cron jobs)
* MongoDB Atlas: whitelist 0.0.0.0/0 (для MVP) + користувач з мінімальними правами.

---

## 10) План розробки (короткі ітерації)

### Ітерація 1 (скелет + дизайн система)

* Next.js + TS + Tailwind
* Layout, Typography, Card, Button, Form components
* PWA manifest + базовий SW

### Ітерація 2 (Auth + ролі)

* NextAuth
* Admin/Trainer/Parent routing guards
* Seed admin user

### Ітерація 3 (Halls + Blocks)

* CRUD halls (admin)
* Create HallBlock (admin)
* Візуалізація блоків у календарі залу

### Ітерація 4 (Classes)

* Trainer create/edit/cancel class
* Перевірка конфліктів (перетин в залі + блоки)

### Ітерація 5 (Bookings)

* Parent: schedule + book/cancel
* Атомарне резервування місць (takenSeats)

### Ітерація 6 (Admin облік + Payments MVP)

* ✅ Admin dashboard: заняття по тренерах, фільтри
* ✅ Payments: ручні записи/статуси

### Ітерація 7 (Observability + Production Hardening)

* ✅ Request ID tracking
* ✅ Structured logging (JSON format)
* ✅ Audit log collection
* ✅ Rate limiting
* ✅ Security headers
* ✅ Input sanitization
* ✅ Cron job endpoint
* ✅ PWA improvements (offline support, install prompts)
