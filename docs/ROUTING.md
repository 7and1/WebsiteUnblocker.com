# Routing Specification

## WebsiteUnblocker.com - URL Structure & Navigation

---

## Route Architecture

```
/                           # Homepage with diagnosis tool
├── /blog                   # Blog listing
│   └── /blog/[slug]        # Individual blog post
├── /tools                  # Tools listing page
│   └── /tools/[tool]       # Individual tool pages
├── /unblock                # Programmatic SEO hub
│   └── /unblock/[website]  # e.g., /unblock/youtube
├── /compare                # VPN comparison hub
│   └── /compare/[vpn]      # e.g., /compare/nordvpn-vs-expressvpn
├── /privacy                # Privacy policy
├── /terms                  # Terms of service
├── /contact                # Contact page
├── /admin                  # Payload CMS admin
└── /api                    # API routes
    ├── /api/check          # Website checker
    ├── /api/health         # Health check
    └── /api/contact        # Contact form submission
```

---

## 1. Public Routes (Frontend)

### 1.1 Homepage `/`

**File:** `src/app/(frontend)/page.tsx`

| Property | Value |
|----------|-------|
| Method | GET |
| Auth | Public |
| Cache | ISR 1 hour |
| Priority | P0 |

**Content:**
- Hero section with DiagnosisTool
- Feature highlights (3 cards)
- Latest blog posts (6 max)
- CTA banner

**SEO:**
```typescript
export const metadata: Metadata = {
  title: 'Website Unblocker - Check & Unblock Any Website Free',
  description: 'Free tool to check if websites are blocked. Instantly diagnose and get solutions to unblock YouTube, Twitter, TikTok and more.',
  alternates: {
    canonical: 'https://websiteunblocker.com',
  },
}
```

---

### 1.2 Blog Listing `/blog`

**File:** `src/app/(frontend)/blog/page.tsx`

| Property | Value |
|----------|-------|
| Method | GET |
| Auth | Public |
| Cache | ISR 1 hour |
| Priority | P1 |

**Features:**
- Paginated post listing (12 per page)
- Tag filtering
- Search (client-side)

**Query Params:**
- `?page=2` - Pagination
- `?tag=VPN+Guide` - Filter by tag

---

### 1.3 Blog Post `/blog/[slug]`

**File:** `src/app/(frontend)/blog/[slug]/page.tsx`

| Property | Value |
|----------|-------|
| Method | GET |
| Auth | Public |
| Cache | ISR 1 hour |
| Priority | P1 |

**Dynamic Params:**
```typescript
export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({ collection: 'posts', limit: 1000 })

  return posts.docs.map((post) => ({
    slug: post.slug,
  }))
}
```

**SEO:**
- Dynamic meta from post fields
- JSON-LD Article schema
- Open Graph image

---

### 1.4 Programmatic SEO `/unblock/[website]`

**File:** `src/app/(frontend)/unblock/[website]/page.tsx`

| Property | Value |
|----------|-------|
| Method | GET |
| Auth | Public |
| Cache | ISR 24 hours |
| Priority | P2 |

**Purpose:** Rank for "how to unblock [website]" keywords

**Dynamic Generation:**
```typescript
// List of target websites
const UNBLOCK_TARGETS = [
  'youtube', 'twitter', 'facebook', 'instagram', 'tiktok',
  'netflix', 'hulu', 'bbc-iplayer', 'spotify', 'twitch',
  'reddit', 'discord', 'telegram', 'whatsapp', 'signal',
  // ... 100+ more
]

export async function generateStaticParams() {
  return UNBLOCK_TARGETS.map((website) => ({ website }))
}
```

**Template Structure:**
1. H1: How to Unblock [Website] in 2026
2. Embedded DiagnosisTool (pre-filled with website)
3. Why is [Website] blocked? (dynamic content)
4. Method 1: VPN (Recommended) + CTA
5. Method 2: Proxy
6. Method 3: Tor
7. FAQ section
8. Related unblock guides

---

### 1.5 VPN Comparison `/compare/[comparison]`

**File:** `src/app/(frontend)/compare/[comparison]/page.tsx`

| Property | Value |
|----------|-------|
| Method | GET |
| Auth | Public |
| Cache | ISR 7 days |
| Priority | P3 |

**URL Pattern:** `/compare/nordvpn-vs-expressvpn`

**Comparisons to Generate:**
- nordvpn-vs-expressvpn
- nordvpn-vs-surfshark
- expressvpn-vs-surfshark
- nordvpn-vs-protonvpn
- (all permutations)

---

### 1.6 Static Pages

| Route | File | Cache | Priority |
|-------|------|-------|----------|
| `/privacy` | `privacy/page.tsx` | Static | P2 |
| `/terms` | `terms/page.tsx` | Static | P2 |
| `/contact` | `contact/page.tsx` | No cache | P2 |
| `/about` | `about/page.tsx` | Static | P3 |

---

## 2. API Routes

### 2.1 Website Check `/api/check`

**File:** `src/app/api/check/route.ts`

```typescript
// GET /api/check?url=youtube.com

export const runtime = 'edge'

interface CheckResponse {
  status: 'accessible' | 'blocked' | 'error'
  code?: number
  latency: number
  target: string
  error?: string
}

// Rate limit: 100 requests/minute per IP
// Timeout: 5 seconds
// Cache: No cache (real-time check)
```

**Response Codes:**
| HTTP Status | Meaning |
|-------------|---------|
| 200 | Check completed (see body for result) |
| 400 | Missing or invalid URL param |
| 429 | Rate limited |
| 500 | Server error |

---

### 2.2 Health Check `/api/health`

**File:** `src/app/api/health/route.ts`

```typescript
// GET /api/health

export const runtime = 'edge'

interface HealthResponse {
  status: 'ok' | 'degraded' | 'down'
  timestamp: string
  version: string
  checks: {
    database: boolean
    storage: boolean
  }
}
```

---

### 2.3 Contact Form `/api/contact`

**File:** `src/app/api/contact/route.ts`

```typescript
// POST /api/contact

export const runtime = 'edge'

interface ContactRequest {
  name: string      // 2-100 chars
  email: string     // Valid email
  subject: string   // 5-200 chars
  message: string   // 10-5000 chars
}

interface ContactResponse {
  success: boolean
  message: string
}

// Rate limit: 5 requests/hour per IP
// Honeypot field for spam
```

---

## 3. Admin Routes (Payload)

### 3.1 Admin Panel `/admin`

**File:** `src/app/(payload)/admin/[[...segments]]/page.tsx`

| Property | Value |
|----------|-------|
| Auth | Required |
| Layout | Payload RootLayout |

**Sub-routes (handled by Payload):**
- `/admin` - Dashboard
- `/admin/collections/posts` - Posts list
- `/admin/collections/posts/create` - Create post
- `/admin/collections/posts/[id]` - Edit post
- `/admin/collections/pages` - Pages list
- `/admin/collections/media` - Media library
- `/admin/collections/users` - Users list
- `/admin/account` - Current user settings

---

## 4. Middleware

**File:** `src/middleware.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

---

## 5. Redirects & Rewrites

### 5.1 Next.js Config

```typescript
// next.config.ts

const nextConfig = {
  async redirects() {
    return [
      // WWW to non-WWW
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.websiteunblocker.com' }],
        destination: 'https://websiteunblocker.com/:path*',
        permanent: true,
      },
      // Old blog path
      {
        source: '/articles/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      // Trailing slash removal
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      // Sitemap
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      // Robots
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ]
  },
}
```

---

## 6. Dynamic Sitemap

**File:** `src/app/api/sitemap/route.ts`

```typescript
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({ collection: 'posts', limit: 1000 })

  const staticPages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/blog', priority: 0.8, changefreq: 'daily' },
    { url: '/privacy', priority: 0.3, changefreq: 'yearly' },
    { url: '/terms', priority: 0.3, changefreq: 'yearly' },
  ]

  const blogPages = posts.docs.map((post) => ({
    url: `/blog/${post.slug}`,
    priority: 0.7,
    changefreq: 'weekly',
    lastmod: post.updatedAt,
  }))

  const xml = generateSitemapXml([...staticPages, ...blogPages])

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
```

---

## 7. 404 & Error Pages

### 7.1 Not Found

**File:** `src/app/not-found.tsx`

```typescript
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-900">404</h1>
        <p className="text-xl text-slate-600 mt-4">Page not found</p>
        <a href="/" className="mt-8 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg">
          Go Home
        </a>
      </div>
    </div>
  )
}
```

### 7.2 Error Boundary

**File:** `src/app/error.tsx`

```typescript
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">Something went wrong</h1>
        <p className="text-slate-600 mt-4">{error.message}</p>
        <button
          onClick={reset}
          className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
```

---

## 8. Route Groups

```
src/app/
├── (frontend)/          # Public pages with header/footer
│   ├── layout.tsx       # Header + Footer wrapper
│   ├── page.tsx         # /
│   ├── blog/
│   ├── unblock/
│   └── ...
├── (payload)/           # Admin panel
│   ├── layout.tsx       # Payload RootLayout
│   └── admin/
├── api/                 # API routes (no layout)
│   ├── check/
│   ├── health/
│   └── contact/
├── layout.tsx           # Root layout (html, body)
├── not-found.tsx
└── error.tsx
```

---

## 9. Navigation Structure

### 9.1 Header Navigation

```typescript
const headerNav = [
  { label: 'Home', href: '/' },
  { label: 'Guides', href: '/blog' },
  { label: 'Tools', href: '/tools' },
  { label: 'Get VPN', href: 'https://nordvpn.com/aff', external: true, highlight: true },
]
```

### 9.2 Footer Navigation

```typescript
const footerNav = {
  resources: [
    { label: 'Blog', href: '/blog' },
    { label: 'Tools', href: '/tools' },
    { label: 'Unblock YouTube', href: '/unblock/youtube' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Affiliate Disclosure', href: '/affiliate-disclosure' },
  ],
  social: [
    { label: 'Twitter', href: 'https://twitter.com/websiteunblocker' },
  ],
}
```

---

## 10. URL Conventions

| Convention | Example | Note |
|------------|---------|------|
| Lowercase | `/blog/my-post` | Always lowercase |
| Hyphens | `/unblock/bbc-iplayer` | No underscores |
| No trailing slash | `/blog` not `/blog/` | Redirect if present |
| No .html | `/privacy` not `/privacy.html` | Clean URLs |
| Semantic | `/unblock/youtube` | Keyword-rich |
