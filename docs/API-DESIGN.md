# WebsiteUnblocker.com API Documentation

> **Version**: 1.0.0
> **Base URL**: `https://websiteunblocker.com`
> **Runtime**: Next.js 15 App Router on Cloudflare Workers (Edge Runtime)

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [GET /api/check](#get-apicheck)
  - [GET /api/health](#get-apihealth)
  - [POST /api/contact](#post-apicontact)
  - [Payload CMS REST API](#payload-cms-rest-api)
- [TypeScript Types](#typescript-types)
- [OpenAPI Specification](#openapi-specification)
- [Security Considerations](#security-considerations)
- [Caching Strategy](#caching-strategy)
- [CORS Configuration](#cors-configuration)

---

## Overview

WebsiteUnblocker.com provides a public API for checking website accessibility from Cloudflare's global edge network. The API runs on Cloudflare Workers with Edge Runtime for low-latency responses worldwide.

### Key Features

- Edge-native execution (sub-100ms cold starts)
- Global distribution via Cloudflare's network
- D1 SQLite database for content
- R2 object storage for media

---

## Authentication

| Endpoint Type | Authentication |
|---------------|----------------|
| Public APIs (`/api/check`, `/api/health`) | None required |
| Payload CMS Read | None (public read) |
| Payload CMS Write | Bearer token (admin only) |
| Contact Form | None (rate limited) |

---

## Rate Limiting

### Limits by Endpoint

| Endpoint | Rate Limit | Window | Scope |
|----------|------------|--------|-------|
| GET /api/check | 100 requests | 1 minute | Per IP |
| POST /api/contact | 5 requests | 1 minute | Per IP |
| Payload CMS (read) | 1000 requests | 1 minute | Per IP |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705593600
Retry-After: 60
```

### Rate Limit Response

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 60 seconds."
  }
}
```

**HTTP Status**: `429 Too Many Requests`

---

## Error Handling

### Standard Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}
```

### Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request parameters |
| 400 | `URL_REQUIRED` | Missing required URL parameter |
| 400 | `INVALID_URL` | Malformed URL format |
| 404 | `NOT_FOUND` | Resource not found |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Upstream service unavailable |

---

## Endpoints

### GET /api/check

Check if a website is accessible from Cloudflare's edge network.

#### Request

```http
GET /api/check?url=youtube.com HTTP/1.1
Host: websiteunblocker.com
Accept: application/json
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | Website URL to check (with or without protocol) |

#### Response Schema

```typescript
interface CheckResponse {
  status: 'accessible' | 'blocked' | 'error'
  code?: number      // HTTP status code (only if accessible/error)
  latency: number    // Response time in milliseconds
  target: string     // Normalized URL that was checked
  error?: string     // Error message (only if blocked/error)
}
```

#### Success Response (200 OK)

**Accessible Website:**

```json
{
  "status": "accessible",
  "code": 200,
  "latency": 145,
  "target": "https://youtube.com"
}
```

**Blocked Website:**

```json
{
  "status": "blocked",
  "latency": 5000,
  "target": "https://blocked-site.com",
  "error": "Connection Timeout or Blocked"
}
```

**Error Response:**

```json
{
  "status": "error",
  "code": 403,
  "latency": 230,
  "target": "https://restricted-site.com"
}
```

#### Error Responses

**Missing URL (400 Bad Request):**

```json
{
  "error": "URL required"
}
```

#### Example Usage

```bash
# Check YouTube accessibility
curl "https://websiteunblocker.com/api/check?url=youtube.com"

# Check with full URL
curl "https://websiteunblocker.com/api/check?url=https://twitter.com"
```

```typescript
// TypeScript/JavaScript
const response = await fetch('/api/check?url=' + encodeURIComponent('youtube.com'))
const data: CheckResponse = await response.json()

if (data.status === 'accessible') {
  console.log(`Site is accessible (${data.latency}ms)`)
} else {
  console.log(`Site is blocked or has errors: ${data.error}`)
}
```

#### Implementation Notes

- Uses `HEAD` request to minimize bandwidth
- 5-second timeout via `AbortSignal.timeout(5000)`
- Follows redirects automatically
- User-Agent spoofed as Chrome browser
- Protocol defaults to `https://` if not provided

---

### GET /api/health

Health check endpoint for monitoring and load balancers.

#### Request

```http
GET /api/health HTTP/1.1
Host: websiteunblocker.com
```

#### Response (200 OK)

```json
{
  "status": "healthy",
  "timestamp": "2025-01-18T10:30:00.000Z",
  "version": "1.0.0"
}
```

#### Response Schema

```typescript
interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string  // ISO 8601 format
  version: string
  checks?: {
    database: 'ok' | 'error'
    storage: 'ok' | 'error'
  }
}
```

---

### POST /api/contact

Submit contact form inquiries.

#### Request

```http
POST /api/contact HTTP/1.1
Host: websiteunblocker.com
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Partnership Inquiry",
  "message": "I would like to discuss a potential partnership..."
}
```

#### Request Body Schema

```typescript
import { z } from 'zod'

const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  subject: z.string().min(5).max(200),
  message: z.string().min(20).max(5000),
  honeypot: z.string().max(0).optional()  // Bot trap - must be empty
})

type ContactRequest = z.infer<typeof ContactSchema>
```

#### Validation Rules

| Field | Type | Min | Max | Required |
|-------|------|-----|-----|----------|
| name | string | 2 | 100 | Yes |
| email | string (email) | - | 255 | Yes |
| subject | string | 5 | 200 | Yes |
| message | string | 20 | 5000 | Yes |
| honeypot | string | - | 0 | No |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Your message has been sent successfully."
}
```

#### Error Responses

**Validation Error (400 Bad Request):**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "email": ["Invalid email format"],
      "message": ["Message must be at least 20 characters"]
    }
  }
}
```

**Rate Limited (429 Too Many Requests):**

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many submissions. Please try again later."
  }
}
```

---

### Payload CMS REST API

Content management endpoints powered by Payload CMS 3.x.

#### GET /api/posts

Retrieve a paginated list of blog posts.

```http
GET /api/posts?limit=10&page=1&sort=-published_date HTTP/1.1
Host: websiteunblocker.com
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 10 | Items per page (max 100) |
| page | number | 1 | Page number |
| sort | string | -createdAt | Sort field (prefix `-` for descending) |
| where | object | - | Query filter (Payload syntax) |

**Response:**

```json
{
  "docs": [
    {
      "id": "abc123",
      "title": "How to Unblock YouTube in China",
      "slug": "unblock-youtube-china",
      "content": { /* Lexical rich text */ },
      "published_date": "2025-01-15",
      "tags": ["VPN Guide", "Unblock Websites"],
      "meta_title": "Unblock YouTube in China - Complete Guide 2025",
      "meta_description": "Learn the best methods to access YouTube...",
      "createdAt": "2025-01-15T08:00:00.000Z",
      "updatedAt": "2025-01-16T10:30:00.000Z"
    }
  ],
  "totalDocs": 42,
  "limit": 10,
  "page": 1,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPrevPage": false,
  "nextPage": 2,
  "prevPage": null
}
```

#### GET /api/posts/[slug]

Retrieve a single post by slug.

```http
GET /api/posts?where[slug][equals]=unblock-youtube-china&limit=1 HTTP/1.1
Host: websiteunblocker.com
```

**Note:** Payload CMS uses query parameters for slug lookups. Use `where[slug][equals]=<slug>` syntax.

#### GET /api/pages/[slug]

Retrieve a static page by slug.

```http
GET /api/pages?where[slug][equals]=about&limit=1 HTTP/1.1
Host: websiteunblocker.com
```

**Response:**

```json
{
  "docs": [
    {
      "id": "page123",
      "title": "About WebsiteUnblocker",
      "slug": "about",
      "contentHtml": "<p>WebsiteUnblocker is a free tool...</p>",
      "metaTitle": "About Us - WebsiteUnblocker",
      "metaDescription": "Learn about WebsiteUnblocker...",
      "canonicalUrl": "https://websiteunblocker.com/about",
      "jsonLd": { "@context": "https://schema.org", ... }
    }
  ],
  "totalDocs": 1,
  "limit": 1,
  "page": 1,
  "totalPages": 1
}
```

#### Payload Collections Schema

```typescript
// Posts Collection
interface Post {
  id: string
  title: string
  slug: string
  content: LexicalRichText
  published_date: string | null
  tags: Array<
    | 'VPN Guide'
    | 'Proxy Tutorial'
    | 'Unblock Websites'
    | 'Privacy Tips'
    | 'Streaming Access'
    | 'Gaming Unblock'
    | 'Social Media Access'
    | 'Regional Restrictions'
    | 'Security Tips'
    | 'Tool Reviews'
  >
  meta_title: string | null
  meta_description: string | null
  createdAt: string
  updatedAt: string
}

// Pages Collection
interface Page {
  id: string
  title: string
  slug: string
  contentHtml: string | null
  metaTitle: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  jsonLd: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}
```

---

## TypeScript Types

Complete type definitions for API consumers:

```typescript
// ========================================
// API Check Types
// ========================================

export type CheckStatus = 'accessible' | 'blocked' | 'error'

export interface CheckRequest {
  url: string
}

export interface CheckResponse {
  status: CheckStatus
  code?: number
  latency: number
  target: string
  error?: string
}

// ========================================
// Health Check Types
// ========================================

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'

export interface HealthResponse {
  status: HealthStatus
  timestamp: string
  version: string
  checks?: {
    database: 'ok' | 'error'
    storage: 'ok' | 'error'
  }
}

// ========================================
// Contact Form Types
// ========================================

export interface ContactRequest {
  name: string
  email: string
  subject: string
  message: string
  honeypot?: string
}

export interface ContactSuccessResponse {
  success: true
  message: string
}

// ========================================
// Error Types
// ========================================

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'URL_REQUIRED'
  | 'INVALID_URL'
  | 'NOT_FOUND'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'

export interface ApiError {
  error: {
    code: ErrorCode
    message: string
    details?: Record<string, string[]>
  }
}

// ========================================
// Payload CMS Types
// ========================================

export interface PaginatedResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage: number | null
  prevPage: number | null
}

export type PostTag =
  | 'VPN Guide'
  | 'Proxy Tutorial'
  | 'Unblock Websites'
  | 'Privacy Tips'
  | 'Streaming Access'
  | 'Gaming Unblock'
  | 'Social Media Access'
  | 'Regional Restrictions'
  | 'Security Tips'
  | 'Tool Reviews'

export interface Post {
  id: string
  title: string
  slug: string
  content: unknown  // Lexical rich text format
  published_date: string | null
  tags: PostTag[]
  meta_title: string | null
  meta_description: string | null
  createdAt: string
  updatedAt: string
}

export interface Page {
  id: string
  title: string
  slug: string
  contentHtml: string | null
  metaTitle: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  jsonLd: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}
```

---

## OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: WebsiteUnblocker API
  version: 1.0.0
  description: API for checking website accessibility and content management
  contact:
    name: WebsiteUnblocker Support
    url: https://websiteunblocker.com/contact

servers:
  - url: https://websiteunblocker.com
    description: Production

paths:
  /api/check:
    get:
      summary: Check website accessibility
      operationId: checkWebsite
      tags:
        - Accessibility
      parameters:
        - name: url
          in: query
          required: true
          schema:
            type: string
          description: Website URL to check
          example: youtube.com
      responses:
        '200':
          description: Check result
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CheckResponse'
        '400':
          description: Missing or invalid URL
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SimpleError'
        '429':
          description: Rate limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'

  /api/health:
    get:
      summary: Health check
      operationId: healthCheck
      tags:
        - System
      responses:
        '200':
          description: Service health status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HealthResponse'

  /api/contact:
    post:
      summary: Submit contact form
      operationId: submitContact
      tags:
        - Contact
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ContactRequest'
      responses:
        '200':
          description: Message sent successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ContactSuccessResponse'
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
        '429':
          description: Rate limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'

  /api/posts:
    get:
      summary: List blog posts
      operationId: listPosts
      tags:
        - Content
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
            maximum: 100
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: sort
          in: query
          schema:
            type: string
            default: -createdAt
      responses:
        '200':
          description: Paginated posts list
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PostsResponse'

components:
  schemas:
    CheckResponse:
      type: object
      required:
        - status
        - latency
        - target
      properties:
        status:
          type: string
          enum: [accessible, blocked, error]
        code:
          type: integer
        latency:
          type: integer
        target:
          type: string
        error:
          type: string

    HealthResponse:
      type: object
      required:
        - status
        - timestamp
        - version
      properties:
        status:
          type: string
          enum: [healthy, degraded, unhealthy]
        timestamp:
          type: string
          format: date-time
        version:
          type: string

    ContactRequest:
      type: object
      required:
        - name
        - email
        - subject
        - message
      properties:
        name:
          type: string
          minLength: 2
          maxLength: 100
        email:
          type: string
          format: email
          maxLength: 255
        subject:
          type: string
          minLength: 5
          maxLength: 200
        message:
          type: string
          minLength: 20
          maxLength: 5000

    ContactSuccessResponse:
      type: object
      properties:
        success:
          type: boolean
        message:
          type: string

    SimpleError:
      type: object
      properties:
        error:
          type: string

    ApiError:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            details:
              type: object
              additionalProperties:
                type: array
                items:
                  type: string

    PostsResponse:
      type: object
      properties:
        docs:
          type: array
          items:
            $ref: '#/components/schemas/Post'
        totalDocs:
          type: integer
        limit:
          type: integer
        page:
          type: integer
        totalPages:
          type: integer
        hasNextPage:
          type: boolean
        hasPrevPage:
          type: boolean

    Post:
      type: object
      properties:
        id:
          type: string
        title:
          type: string
        slug:
          type: string
        content:
          type: object
        published_date:
          type: string
          format: date
        tags:
          type: array
          items:
            type: string
        meta_title:
          type: string
        meta_description:
          type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
```

---

## Security Considerations

### Input Sanitization

```typescript
// URL Validation Pattern
function sanitizeUrl(input: string): string {
  // Remove leading/trailing whitespace
  let url = input.trim()

  // Block internal/private IPs
  const blocked = [
    /^localhost/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^0\./,
    /^169\.254\./,
    /^::1$/,
    /^fc00:/i,
    /^fe80:/i,
  ]

  if (blocked.some(pattern => pattern.test(url))) {
    throw new Error('Invalid URL: private/internal addresses not allowed')
  }

  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  // Validate URL format
  try {
    new URL(url)
  } catch {
    throw new Error('Invalid URL format')
  }

  return url
}
```

### Security Headers

```typescript
// Recommended security headers for all API responses
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
}
```

### Contact Form Protection

1. **Honeypot field**: Hidden field that bots fill but humans ignore
2. **Rate limiting**: 5 requests per minute per IP
3. **Input length limits**: Prevent payload abuse
4. **Email validation**: Zod email format validation

---

## Caching Strategy

### Cache Headers by Endpoint

| Endpoint | Cache-Control | CDN TTL | Browser TTL |
|----------|---------------|---------|-------------|
| GET /api/check | `private, no-cache` | 0 | 0 |
| GET /api/health | `public, max-age=10` | 10s | 10s |
| GET /api/posts | `public, s-maxage=300, stale-while-revalidate=60` | 5m | 1m |
| GET /api/pages | `public, s-maxage=3600, stale-while-revalidate=300` | 1h | 5m |

### Implementation

```typescript
// Dynamic check endpoint - no caching
export async function GET(request: Request) {
  const response = NextResponse.json(data)
  response.headers.set('Cache-Control', 'private, no-cache, no-store')
  return response
}

// Content endpoints - aggressive caching
export async function GET(request: Request) {
  const response = NextResponse.json(data)
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=60'
  )
  return response
}
```

### Cloudflare Cache Behavior

- Edge caching respects `Cache-Control` headers
- Use `?_nocache=<timestamp>` query param to bypass cache
- Purge cache via Cloudflare API on content updates

---

## CORS Configuration

### Allowed Origins

```typescript
const ALLOWED_ORIGINS = [
  'https://websiteunblocker.com',
  'https://www.websiteunblocker.com',
]

// Development only
if (process.env.NODE_ENV === 'development') {
  ALLOWED_ORIGINS.push('http://localhost:3000')
}
```

### CORS Headers

```typescript
function corsHeaders(origin: string): Record<string, string> {
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return {}
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',  // 24 hours preflight cache
  }
}
```

### Preflight Handler

```typescript
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('Origin') || ''

  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  })
}
```

### API-Specific CORS Rules

| Endpoint | CORS Policy |
|----------|-------------|
| /api/check | Same-origin + listed origins |
| /api/health | Public (allow *) |
| /api/contact | Same-origin only |
| /api/posts | Public read (allow *) |
| /api/pages | Public read (allow *) |

---

## Changelog

### v1.0.0 (2025-01-18)

- Initial API release
- Website accessibility checker
- Payload CMS integration for content
- Contact form with spam protection
