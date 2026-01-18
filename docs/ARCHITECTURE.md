# Architecture Documentation

WebsiteUnblocker.com - System architecture and design patterns.

## Table of Contents

- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Database Schema](#database-schema)
- [Caching Strategy](#caching-strategy)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Error Handling](#error-handling)
- [Performance Optimization](#performance-optimization)

---

## System Overview

WebsiteUnblocker.com is a serverless web application deployed on Cloudflare's global edge network. The architecture prioritizes low-latency responses, global availability, and cost efficiency.

### High-Level Diagram

```
                    INTERNET USERS
                        |
                        v
              +-------------------+
              |  Cloudflare CDN   |
              |   (Global PoPs)    |
              +---------+---------+
                        |
        +---------------+---------------+
        |                               |
+-------v-------+               +-------v-------+
|  Edge Runtime |               |  Static Assets|
|  (Workers)    |               |  (R2/Assets)  |
+-------+-------+               +---------------+
        |
        v
+-------------------+
|  Next.js 15 App    |
|  (via OpenNext)   |
+---------+---------+
          |
    +-----+-----+-----+-----+
    |     |     |     |     |
    v     v     v     v     v
   D1    R2    KV   Payload  External
  (DB) (Media)(Cache)(CMS)   APIs
```

---

## Technology Stack

### Frontend Layer

| Technology | Purpose | Key Features Used |
|------------|---------|------------------|
| Next.js 15 | Full-stack framework | App Router, Server Components, ISR |
| React 19 | UI library | Concurrent features, Server Actions |
| Tailwind CSS | Styling | Utility classes, responsive design |
| Lucide React | Icons | Lightweight icon set |
| Framer Motion | Animations | Smooth transitions, micro-interactions |

### Backend Layer

| Technology | Purpose | Key Features Used |
|------------|---------|------------------|
| Payload CMS 3.0 | Headless CMS | Admin panel, Rich Text, Collections |
| Cloudflare Workers | Edge runtime | Sub-50ms cold starts, global distribution |
| D1 | Database | SQLite at edge, automatic replication |
| R2 | Storage | S3-compatible, zero egress fees |
| KV | Caching | Low-latency key-value store |

### Build & Deploy

| Technology | Purpose |
|------------|---------|
| OpenNext for Cloudflare | Next.js adapter for Cloudflare |
| Wrangler | Cloudflare CLI |
| TypeScript | Type safety |
| Vitest | Unit testing |
| Playwright | E2E testing |

---

## Component Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (frontend)/         # Public routes
│   ├── (payload)/          # Admin routes
│   └── api/                # API routes
├── collections/            # Payload CMS schemas
├── components/             # React components
│   ├── features/           # Feature components
│   ├── layout/             # Layout components
│   ├── seo/                # SEO components
│   └── ui/                 # UI components
├── config/                 # Configuration files
├── lib/                    # Utility libraries
│   ├── api/                # API utilities
│   ├── cache/              # Caching layer
│   ├── content/            # Content constants
│   ├── seo/                # SEO helpers
│   └── utils/              # General utilities
├── services/               # Business logic layer
├── repositories/           # Data access layer
├── errors/                 # Error classes
├── middleware.ts           # Next.js middleware
└── payload.config.ts       # Payload configuration
```

### Layer Responsibilities

```
┌─────────────────────────────────────────────────────┐
│                  Presentation Layer                  │
│  (app/, components/)                                │
│  - Route handlers                                    │
│  - React components                                  │
│  - UI state management                               │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────┐
│                  Business Logic Layer                │
│  (services/)                                         │
│  - WebsiteCheckService                              │
│  - ContactService                                   │
│  - PostService                                      │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────┐
│                  Data Access Layer                   │
│  (repositories/)                                    │
│  - BaseRepository                                   │
│  - PostRepository                                   │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────┐
│                  Infrastructure Layer                 │
│  - D1 Database (via Payload)                        │
│  - R2 Storage (via Payload)                         │
│  - KV Cache (direct access)                         │
└─────────────────────────────────────────────────────┘
```

---

## Data Flow

### Website Check Flow

```
1. USER REQUEST
   |
   v
2. MIDDLEWARE
   +-- Security headers
   +-- CORS headers
   |
   v
3. API ROUTE (/api/check)
   +-- Rate limit check (KV)
   +-- URL validation
   |
   v
4. WEBSITE CHECK SERVICE
   +-- Fetch target URL
   +-- Categorize response
   +-- Retry logic (if needed)
   |
   v
5. RESPONSE
   +-- JSON result
   +-- Rate limit headers
```

### Content Rendering Flow

```
1. PAGE REQUEST
   |
   v
2. EDGE CACHE CHECK
   +-- HIT? Return cached HTML
   +-- MISS? Continue
   |
   v
3. SERVER COMPONENT
   +-- Check KV cache
   +-- HIT? Return cached data
   +-- MISS? Query D1
   |
   v
4. PAYLOAD CMS
   +-- Fetch from D1
   +-- Transform data
   |
   v
5. HTML GENERATION
   +-- Render with data
   +-- Set cache headers
   |
   v
6. RESPONSE
   +-- Return HTML
   +-- CDN caches response
```

---

## Database Schema

### D1 Tables

#### posts

```sql
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content JSON,              -- Lexical rich text
  published_date DATE,
  tags JSON,                 -- Array of tag strings
  meta_title TEXT,
  meta_description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published_date ON posts(published_date DESC);
```

#### pages

```sql
CREATE TABLE pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content_html TEXT,
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  json_ld JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_pages_slug ON pages(slug);
```

#### media

```sql
CREATE TABLE media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  mime_type TEXT,
  file_size INTEGER,
  url TEXT NOT NULL,          -- R2 URL
  width INTEGER,
  height INTEGER,
  alt TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_filename ON media(filename);
```

#### users

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password TEXT NOT NULL,     -- bcrypt hashed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

#### contact_submissions

```sql
CREATE TABLE contact_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Caching Strategy

### Cache Hierarchy

```
┌─────────────────────────────────────────────┐
│          Level 1: Cloudflare CDN            │
│  - Static assets (.js, .css, images)        │
│  - HTML with s-maxage                       │
│  - TTL: 1 hour (assets), 1 minute (HTML)    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────┴───────────────────────────┐
│          Level 2: KV Namespace              │
│  - API responses                            │
│  - Expensive queries                        │
│  - TTL: 5 minutes with SWR                  │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────┴───────────────────────────┐
│          Level 3: D1 Database               │
│  - Content data                             │
│  - User sessions                            │
│  - Persistent storage                       │
└─────────────────────────────────────────────┘
```

### KV Cache Implementation

```typescript
// Cache with stale-while-revalidate
const data = await kvCache({
  key: 'homepage:latest-posts',
  ttl: 300,        // 5 minutes
  swrTtl: 600,     // Serve stale for 10 minutes
  fetchFn: () => payload.find({ collection: 'posts' })
})
```

### Cache Headers by Route

| Route | Cache-Control | Purpose |
|-------|---------------|---------|
| `/` | `s-maxage=60, stale-while-revalidate=300` | Homepage with ISR |
| `/blog/[slug]` | `s-maxage=300, stale-while-revalidate=600` | Blog posts |
| `/api/check` | `no-store` | Real-time tool |
| `/api/posts` | `s-maxage=300, stale-while-revalidate=300` | Posts API |
| `/admin/*` | `no-store, private` | Admin routes |

---

## Security Architecture

### Middleware Security Headers

```typescript
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Authentication Flow

```
┌─────────┐     ┌─────────────┐     ┌──────────┐
│  User   |────>| Login Form  |────>| Payload  │
└─────────┘     └─────────────┘     └─────┬────┘
                                            |
                                            v
                                      ┌──────────┐
                                      | Verify   │
                                      | Password │
                                      └─────┬────┘
                                            |
                      +---------------------+---------------------+
                      |                     |                     |
                      v                     v                     v
                ┌──────────┐         ┌──────────┐         ┌──────────┐
                |  Valid   |         | Invalid  |         |  Error   |
                └─────┬────┘         └──────────┘         └──────────┘
                      |
                      v
                ┌──────────┐
                | Set HTTP |
                | Cookie   |
                | (JWT)     |
                └──────────┘
```

### Rate Limiting

| Endpoint | Limit | Window | Storage |
|----------|-------|--------|---------|
| `/api/check` | 100 | 1 minute | KV |
| `/api/contact` | 5 | 1 minute | KV |
| `/api/graphql` | 100 | 1 minute | KV |

### Input Validation

```typescript
// URL validation for check API
const validation = validateUrl(input, {
  allowedProtocols: ['http:', 'https:'],
  allowUserPass: false,
  maxLength: 2048,
  blockInternalIPs: true
})

// Contact form validation
const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(5).max(200),
  message: z.string().min(20).max(5000),
  honeypot: z.string().max(0).optional()  // Bot trap
})
```

---

## Deployment Architecture

### Cloudflare Services

```
                    Cloudflare Account
                            |
        +-------------------+-------------------+
        |                   |                   |
    +---+---+           +---+---+           +---+---+
    |  D1   |           |   R2   |           |   KV   |
    |  DB   |           | Media  |           | Cache  |
    +-------+           +--------+           +-------+
        |                   |                   |
        +-------------------+-------------------+
                            |
                    +-------+-------+
                    |  Workers/Pages |
                    |  Application   |
                    +---------------+
                            |
                    +-------+-------+
                    |   Global CDN   |
                    +---------------+
```

### Deployment Pipeline

```bash
1. Development
   git push origin main

2. CI/CD (GitHub Actions - Future)
   - Run tests
   - Build application
   - Run database migrations

3. Deploy to Cloudflare
   pnpm deploy

4. Cloudflare Build
   - OpenNext transforms Next.js
   - Wrangler deploys to Workers
   - Assets uploaded to R2
```

### Environment Configuration

| Environment | Purpose | Branch |
|-------------|---------|--------|
| `production` | Live site | `main` |
| `staging` | Pre-production | `develop` |

---

## Error Handling

### Error Class Hierarchy

```
Error (Native)
    |
    v
AppError (Base)
    |
    +-- BadRequestError (400)
    +-- ValidationError (400)
    +-- UnauthorizedError (401)
    +-- ForbiddenError (403)
    +-- NotFoundError (404)
    +-- RateLimitError (429)
    +-- ApiError (500)
```

### Error Response Format

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 45
    },
    "requestId": "cf-abc123"
  }
}
```

---

## Performance Optimization

### Code Splitting

```typescript
// Dynamic imports for non-critical components
const DiagnosisTool = dynamic(
  () => import('@/components/features/DiagnosisTool'),
  { loading: () => <Skeleton /> }
)
```

### Image Optimization

```tsx
import Image from 'next/image'

<Image
  src={src}
  alt={alt}
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### Core Web Vitals Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| LCP | < 2.5s | Image optimization, edge caching |
| INP | < 200ms | Code splitting, minimal JS |
| CLS | < 0.1 | Reserved space, font preloading |

---

## Monitoring

### Key Metrics

- **Uptime**: 99.9% target
- **Response Time**: p95 < 500ms
- **Error Rate**: < 0.1%
- **Cache Hit Ratio**: > 80%

### Logging

```typescript
logger.info('Event message', {
  requestId,
  userId,
  metadata
})

logger.error('Error message', error, {
  requestId,
  context
})
```

---

*Last updated: January 18, 2026*
