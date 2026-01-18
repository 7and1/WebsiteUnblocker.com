# WebsiteUnblocker.com - System Blueprint

> Production-grade architecture documentation for the WebsiteUnblocker platform

---

## 1. System Overview

### High-Level Architecture

```
+------------------+     +----------------------+     +------------------+
|                  |     |                      |     |                  |
|   Browser/User   +---->+   Cloudflare Edge    +---->+   D1 Database    |
|                  |     |   (Workers + Pages)  |     |   (SQLite)       |
+------------------+     +----------+-----------+     +------------------+
                                    |
                                    |
                         +----------v-----------+
                         |                      |
                         |   R2 Object Storage  |
                         |   (Media/Assets)     |
                         +----------------------+
```

### Detailed Request Flow

```
                                    CLOUDFLARE EDGE NETWORK
+--------+     +----------+     +------------------+     +---------------+
|        |     |          |     |                  |     |               |
| Client +---->+ CF Edge  +---->+ OpenNext Worker  +---->+ Next.js 15    |
|        |     | (Cache)  |     | (node compat)    |     | App Router    |
+--------+     +----------+     +--------+---------+     +-------+-------+
                                         |                       |
                                         v                       v
                                +--------+---------+     +-------+-------+
                                |                  |     |               |
                                | Payload CMS 3.0  +---->+ D1 (SQLite)   |
                                | (Admin + API)    |     | R2 (Media)    |
                                +------------------+     +---------------+
```

### Component Hierarchy

```
websiteunblocker.com
|
+-- Frontend (Next.js 15 App Router)
|   +-- / (Home - DiagnosisTool)
|   +-- /blog (Post listing)
|   +-- /blog/[slug] (Post detail)
|
+-- Backend (Payload CMS 3.0)
|   +-- /admin (CMS Dashboard)
|   +-- /api (REST + GraphQL)
|
+-- Edge Functions
|   +-- /api/check (Website accessibility checker)
|
+-- Infrastructure (Cloudflare)
    +-- Workers (Compute)
    +-- D1 (Database)
    +-- R2 (Object Storage)
    +-- Pages (Static Assets)
```

---

## 2. Tech Stack Details

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.4.10 | Full-stack React framework with App Router |
| React | 19.0.0 | UI library with concurrent features |
| TypeScript | 5.7.3 | Type safety and developer experience |
| Payload CMS | 3.63.0 | Headless CMS with admin UI |

### Cloudflare Infrastructure

| Service | Purpose | Why Chosen |
|---------|---------|------------|
| Workers | Edge compute | Sub-50ms cold starts, global distribution |
| D1 | SQLite database | Zero-latency reads at edge, automatic replication |
| R2 | Object storage | S3-compatible, zero egress fees |
| Pages/Assets | Static hosting | Global CDN, automatic invalidation |

### Build & Deployment

| Tool | Version | Purpose |
|------|---------|---------|
| OpenNext | 1.11.0 | Next.js to Cloudflare adapter |
| Wrangler | 4.53.0 | Cloudflare CLI & local dev |
| pnpm | 9.x/10.x | Fast, efficient package manager |

### Styling & UI

| Library | Version | Purpose |
|---------|---------|---------|
| Tailwind CSS | 3.4.10 | Utility-first CSS |
| Framer Motion | 11.18.0 | Animation library |
| Lucide React | 0.460.0 | Icon library |
| clsx + tailwind-merge | 2.1.1 / 2.5.3 | Conditional class utilities |

### Payload Plugins

| Plugin | Purpose |
|--------|---------|
| @payloadcms/db-d1-sqlite | D1 database adapter |
| @payloadcms/storage-r2 | R2 media storage |
| @payloadcms/richtext-lexical | Rich text editor |

---

## 3. Data Flow

### Request Lifecycle

```
1. USER REQUEST
   |
   v
2. CLOUDFLARE EDGE (Nearest PoP)
   +-- Cache HIT? --> Return cached response (< 10ms)
   +-- Cache MISS --> Continue
   |
   v
3. WORKERS RUNTIME
   +-- Static asset? --> Serve from R2/Assets
   +-- API route? --> Execute edge function
   +-- Page request? --> SSR via Next.js
   |
   v
4. NEXT.JS APP ROUTER
   +-- Server Component --> Fetch data server-side
   +-- Client Component --> Hydrate on client
   |
   v
5. PAYLOAD CMS (if content needed)
   +-- Query D1 database
   +-- Fetch media URLs from R2
   |
   v
6. RESPONSE
   +-- Set cache headers
   +-- Return to user
```

### API Check Flow (/api/check)

```
Client Request
     |
     v
Edge Function (runtime: 'edge')
     |
     +-- Validate URL parameter
     |
     +-- fetch(target, { method: 'HEAD' })
     |        |
     |        +-- 5s timeout via AbortSignal
     |
     +-- Return JSON response
           {
             status: 'accessible' | 'blocked' | 'error',
             code: number,
             latency: number,
             target: string
           }
```

### Content Publishing Flow

```
Admin User
    |
    v
Payload Admin (/admin)
    |
    +-- Create/Edit Post
    |
    +-- Upload Media --> R2 Bucket
    |
    +-- Save --> D1 Database
    |
    v
Frontend Auto-Updates (ISR/SSR)
```

---

## 4. Database Schema

### D1 Tables (SQLite)

#### users

```sql
CREATE TABLE users (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  email            TEXT NOT NULL UNIQUE,
  name             TEXT,
  password         TEXT NOT NULL,  -- bcrypt hashed
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

#### posts

```sql
CREATE TABLE posts (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  content          JSON,  -- Lexical rich text structure
  published_date   DATE,
  tags             JSON,  -- Array of tag strings
  meta_title       TEXT,
  meta_description TEXT,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published_date ON posts(published_date DESC);
```

#### pages

```sql
CREATE TABLE pages (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  content_html     TEXT,
  meta_title       TEXT,
  meta_description TEXT,
  canonical_url    TEXT,
  json_ld          JSON,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_pages_slug ON pages(slug);
```

#### media

```sql
CREATE TABLE media (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  filename         TEXT NOT NULL,
  mime_type        TEXT,
  file_size        INTEGER,
  url              TEXT NOT NULL,  -- R2 URL
  width            INTEGER,
  height           INTEGER,
  alt              TEXT,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_filename ON media(filename);
```

### R2 Bucket Structure

```
websiteunblocker-media/
|
+-- media/
|   +-- {uuid}/
|       +-- original.{ext}
|       +-- thumbnail.{ext}
|
+-- uploads/
    +-- {year}/
        +-- {month}/
            +-- {filename}
```

---

## 5. Security Model

### Authentication

```
+-------------------+     +------------------+     +----------------+
|                   |     |                  |     |                |
| Login Request     +---->+ Payload Auth     +---->+ JWT Token      |
| (email/password)  |     | (bcrypt verify)  |     | (httpOnly)     |
|                   |     |                  |     |                |
+-------------------+     +------------------+     +----------------+
```

**Implementation:**
- Payload CMS built-in auth with bcrypt password hashing
- JWT tokens stored in httpOnly cookies
- PAYLOAD_SECRET for token signing (256-bit random via `openssl rand -hex 32`)

### Access Control Matrix

| Collection | Public Read | Auth Create | Auth Update | Auth Delete |
|------------|-------------|-------------|-------------|-------------|
| Posts      | Yes         | Yes         | Yes         | Yes         |
| Pages      | Yes         | No*         | No*         | No*         |
| Media      | Yes         | Yes         | Yes         | Yes         |
| Users      | No          | Admin only  | Admin only  | Admin only  |

*Pages use default Payload access (admin only for mutations)

### CORS Policy

```typescript
// Cloudflare Workers handles CORS at edge
// Same-origin by default, explicit allowlist for API

headers: {
  'Access-Control-Allow-Origin': 'https://websiteunblocker.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
```

### Rate Limiting Strategy

```
Tier 1: Cloudflare WAF (Enterprise)
+-- 1000 req/min per IP for /api/*
+-- Block known bad actors

Tier 2: Workers Rate Limiting
+-- /api/check: 30 req/min per IP
+-- /api/graphql: 100 req/min per IP

Tier 3: Payload Built-in
+-- Login attempts: 5 per 15 minutes
+-- Password reset: 3 per hour
```

### Input Validation

```typescript
// API Check Route Validation
const url = searchParams.get('url')

// 1. Presence check
if (!url) return 400

// 2. Protocol normalization
const target = url.startsWith('http') ? url : `https://${url}`

// 3. Timeout protection
signal: AbortSignal.timeout(5000)

// 4. Response sanitization
return NextResponse.json({ /* safe data only */ })
```

### Security Headers (via Cloudflare)

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 6. Performance Targets

### Core Web Vitals Goals

| Metric | Target | Strategy |
|--------|--------|----------|
| LCP (Largest Contentful Paint) | < 2.5s | Edge caching, optimized images |
| FID (First Input Delay) | < 100ms | Code splitting, minimal JS |
| CLS (Cumulative Layout Shift) | < 0.1 | Reserved space, font preloading |
| TTFB (Time to First Byte) | < 200ms | Edge compute, D1 at edge |
| INP (Interaction to Next Paint) | < 200ms | React 19 concurrent features |

### Page Load Budget

```
Total Budget: 300KB (compressed)

+-- HTML:      20KB
+-- CSS:       40KB (Tailwind purged)
+-- JS:       180KB (split chunks)
+-- Fonts:     60KB (woff2, subset)
```

### Edge Caching Strategy

```
Static Assets (.js, .css, images)
+-- Cache-Control: public, max-age=31536000, immutable
+-- Served from R2/Assets binding

HTML Pages (SSR)
+-- Cache-Control: public, s-maxage=60, stale-while-revalidate=600
+-- CDN caches for 60s, serves stale for 10min while revalidating

API Responses
+-- /api/check: no-store (real-time)
+-- /api/posts: s-maxage=300, stale-while-revalidate=600

Admin Routes
+-- Cache-Control: no-store, private
```

### Database Performance

```
D1 Optimization:
+-- PRAGMA optimize on deploy
+-- Indexed columns: slug (unique), published_date
+-- Query patterns optimized for single-row lookups

Expected Latencies:
+-- Read (single row): < 5ms
+-- Read (list, limit 20): < 15ms
+-- Write: < 50ms
```

---

## 7. Scalability Plan

### Traffic Tiers

```
Tier 1: 0-10k daily users (Current)
+-- Single D1 database
+-- Standard R2 bucket
+-- No additional scaling needed

Tier 2: 10k-100k daily users
+-- Enable D1 read replicas
+-- R2 with Cloudflare CDN
+-- Consider Cloudflare Images for optimization

Tier 3: 100k+ daily users
+-- D1 with global read replicas
+-- R2 multi-region
+-- Implement edge caching aggressively
+-- Add Cloudflare Queues for async processing
```

### Horizontal Scaling Architecture

```
                        CLOUDFLARE GLOBAL NETWORK

+--------+  +--------+  +--------+  +--------+  +--------+
|  NA    |  |  EU    |  |  APAC  |  |  SA    |  |  AF    |
| Edge   |  | Edge   |  | Edge   |  | Edge   |  | Edge   |
+---+----+  +---+----+  +---+----+  +---+----+  +---+----+
    |           |           |           |           |
    +-----------+-----------+-----------+-----------+
                            |
                    +-------v-------+
                    |               |
                    | D1 Primary    |
                    | (Auto-replicated)
                    |               |
                    +---------------+
```

### Database Sharding Strategy (Future)

```
When to shard:
+-- > 10GB D1 database size
+-- > 1000 writes/second

Sharding approach:
+-- Shard by content type (posts_db, media_db)
+-- Keep users in primary for auth consistency
```

### CDN Strategy

```
Layer 1: Cloudflare Edge Cache
+-- All static assets
+-- SSR HTML with stale-while-revalidate

Layer 2: R2 with Cache API
+-- Media files
+-- Generated images

Layer 3: Browser Cache
+-- Service Worker for offline support
+-- LocalStorage for user preferences
```

---

## 8. Error Handling Strategy

### Global Error Boundary

```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Log to monitoring service
  console.error('Global error:', error.digest)

  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Error Categories & Handling

| Category | Status | User Message | Logging |
|----------|--------|--------------|---------|
| Validation | 400 | "Invalid input" | Debug level |
| Auth | 401/403 | "Access denied" | Info level |
| Not Found | 404 | "Page not found" | None |
| Rate Limit | 429 | "Too many requests" | Warn level |
| Server | 500 | "Something went wrong" | Error level |
| DB Error | 503 | "Service unavailable" | Critical |

### API Error Response Format

```typescript
// Consistent error response structure
interface ApiError {
  error: {
    code: string          // e.g., 'VALIDATION_ERROR'
    message: string       // Human-readable message
    details?: unknown     // Additional context
    requestId?: string    // For support/debugging
  }
}

// Example
{
  "error": {
    "code": "URL_REQUIRED",
    "message": "URL parameter is required",
    "requestId": "cf-ray-xxxxx"
  }
}
```

### Retry Strategy

```typescript
// Edge function retry logic
const MAX_RETRIES = 2
const RETRY_DELAY = 1000

async function fetchWithRetry(url: string, retries = MAX_RETRIES) {
  try {
    return await fetch(url, { signal: AbortSignal.timeout(5000) })
  } catch (error) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, RETRY_DELAY))
      return fetchWithRetry(url, retries - 1)
    }
    throw error
  }
}
```

### Graceful Degradation

```
Primary Path Failed?
|
+-- Database unavailable
|   +-- Serve cached content
|   +-- Show "content may be outdated" banner
|
+-- API check timeout
|   +-- Return "blocked" status with disclaimer
|   +-- Suggest manual verification
|
+-- Media unavailable
|   +-- Show placeholder image
|   +-- Log for investigation
```

---

## 9. Monitoring & Observability

### Cloudflare Analytics

```
Built-in Metrics:
+-- Request volume & latency (p50, p95, p99)
+-- Error rates by status code
+-- Cache hit ratio
+-- Geographic distribution
+-- Bot traffic analysis
```

### Custom Metrics (Workers Analytics Engine)

```typescript
// Track custom events
interface CustomMetric {
  event: 'check_website' | 'page_view' | 'error'
  properties: {
    target?: string
    status?: string
    latency?: number
    path?: string
    error_code?: string
  }
}

// Implementation via Analytics Engine binding
env.ANALYTICS.writeDataPoint({
  blobs: ['check_website', targetDomain],
  doubles: [latencyMs],
  indexes: [result.status],
})
```

### Key Performance Indicators

| KPI | Target | Alert Threshold |
|-----|--------|-----------------|
| Uptime | 99.9% | < 99.5% |
| p95 Latency | < 500ms | > 1000ms |
| Error Rate | < 0.1% | > 1% |
| Cache Hit Ratio | > 80% | < 60% |
| D1 Query Time | < 20ms | > 100ms |

### Logging Strategy

```
Log Levels:
+-- DEBUG: Development only, verbose
+-- INFO: Request metadata, business events
+-- WARN: Rate limits, retries, degradation
+-- ERROR: Failures requiring attention
+-- CRITICAL: System failures, security events

Log Format (JSON):
{
  "timestamp": "2026-01-18T10:30:00Z",
  "level": "INFO",
  "message": "Website check completed",
  "requestId": "cf-ray-xxxxx",
  "data": {
    "target": "youtube.com",
    "status": "blocked",
    "latency": 5001
  }
}
```

### Alerting Rules

```yaml
alerts:
  - name: high_error_rate
    condition: error_rate > 1% for 5 minutes
    severity: critical
    notify: [email, slack]

  - name: slow_response
    condition: p95_latency > 1000ms for 10 minutes
    severity: warning
    notify: [slack]

  - name: database_errors
    condition: d1_error_count > 10 in 1 minute
    severity: critical
    notify: [email, slack, pagerduty]
```

---

## 10. Disaster Recovery

### Backup Strategy

#### D1 Database

```
Automatic Backups (Cloudflare):
+-- Point-in-time recovery available
+-- 30-day retention

Manual Backups:
+-- Weekly: wrangler d1 export websiteunblocker-db
+-- Store in separate R2 bucket
+-- Encrypt with age/gpg before upload

Recovery:
+-- wrangler d1 execute D1 --file=backup.sql --remote
```

#### R2 Object Storage

```
Versioning:
+-- Enable object versioning on bucket
+-- 90-day retention for deleted objects

Cross-region Backup:
+-- Weekly sync to secondary R2 bucket
+-- Different Cloudflare account for isolation

Recovery:
+-- Restore from versioned objects
+-- Or sync from backup bucket
```

### Recovery Time Objectives

| Scenario | RTO | RPO | Strategy |
|----------|-----|-----|----------|
| Worker failure | 0 min | 0 | Auto-failover (Cloudflare) |
| D1 corruption | 1 hour | 24 hours | Restore from backup |
| R2 data loss | 30 min | 0 | Restore versioned objects |
| Full outage | 2 hours | 24 hours | Redeploy from Git |
| Security breach | 4 hours | Varies | Incident response plan |

### Incident Response Plan

```
1. DETECT
   +-- Automated alerts trigger
   +-- User reports via support

2. ASSESS
   +-- Determine scope and impact
   +-- Classify severity (P1-P4)

3. CONTAIN
   +-- Isolate affected components
   +-- Enable maintenance mode if needed

4. RECOVER
   +-- Execute relevant recovery procedure
   +-- Verify system health

5. POST-MORTEM
   +-- Document timeline and actions
   +-- Identify root cause
   +-- Implement preventive measures
```

### Deployment Rollback

```bash
# Immediate rollback to previous deployment
wrangler rollback --env=production

# Or redeploy specific version
git checkout <previous-commit>
pnpm deploy
```

### Data Integrity Checks

```sql
-- Run weekly integrity checks
PRAGMA integrity_check;
PRAGMA foreign_key_check;

-- Verify row counts
SELECT 'posts' as table_name, COUNT(*) as count FROM posts
UNION ALL
SELECT 'pages', COUNT(*) FROM pages
UNION ALL
SELECT 'media', COUNT(*) FROM media
UNION ALL
SELECT 'users', COUNT(*) FROM users;
```

---

## Appendix A: Environment Variables

```bash
# Required
PAYLOAD_SECRET=<256-bit-hex>           # openssl rand -hex 32
CLOUDFLARE_ENV=production              # production | staging

# Auto-injected by Cloudflare
D1=<database-binding>
R2=<bucket-binding>
ASSETS=<assets-binding>

# Build-time
NODE_ENV=production
NEXT_PUBLIC_SERVER_URL=https://websiteunblocker.com
```

---

## Appendix B: Deployment Checklist

```
Pre-deployment:
[ ] All tests passing
[ ] TypeScript compiles without errors
[ ] ESLint passes
[ ] Database migrations tested locally
[ ] Environment variables verified

Deployment:
[ ] Run database migrations
[ ] Deploy application
[ ] Verify deployment health
[ ] Check error rates

Post-deployment:
[ ] Monitor for 30 minutes
[ ] Verify key user flows
[ ] Check analytics for anomalies
```

---

## Appendix C: Quick Reference Commands

```bash
# Development
pnpm dev                    # Start local dev server

# Database
pnpm payload migrate        # Run migrations locally
pnpm deploy:database        # Deploy migrations to D1

# Build & Deploy
pnpm build                  # Build Next.js
pnpm preview                # Preview on local Cloudflare
pnpm deploy                 # Full production deploy

# Types
pnpm generate:types         # Generate all types
pnpm generate:importmap     # Regenerate Payload importmap
```

---

*Last updated: 2026-01-18*
*Version: 1.0.0*
