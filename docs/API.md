# API Documentation

**Version**: 1.0.0
**Base URL**: `https://websiteunblocker.com`
**Runtime**: Next.js 15 on Cloudflare Workers (Edge Runtime)

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
- [Error Handling](#error-handling)
- [TypeScript Types](#typescript-types)
- [OpenAPI Specification](#openapi-specification)

---

## Overview

WebsiteUnblocker.com provides a public API for checking website accessibility from Cloudflare's global edge network. All API endpoints return JSON responses and follow REST conventions.

### Key Features

- Edge-native execution (sub-100ms cold starts)
- Global distribution via Cloudflare's network
- Built-in rate limiting
- Comprehensive error handling

---

## Authentication

| Endpoint Type | Authentication |
|---------------|----------------|
| Public APIs (`/api/check`, `/api/health`) | None required |
| Content APIs (`/api/posts`, `/api/pages`) | None (public read) |
| Payload Admin | Bearer token (admin only) |
| Contact Form | None (rate limited) |

### Admin Authentication

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://websiteunblocker.com/api/posts
```

---

## Rate Limiting

### Limits by Endpoint

| Endpoint | Rate Limit | Window | Scope |
|----------|------------|--------|-------|
| `GET /api/check` | 100 requests | 1 minute | Per IP |
| `POST /api/contact` | 5 requests | 1 minute | Per IP |
| `GET /api/posts` | 1000 requests | 1 minute | Per IP |

### Rate Limit Headers

All API responses include rate limit headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705593600
Retry-After: 60
```

### Rate Limit Response

When rate limited, you'll receive:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later."
  }
}
```

**HTTP Status**: `429 Too Many Requests`

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
  code?: number      // HTTP status code
  latency: number    // Response time in milliseconds
  target: string     // Normalized URL that was checked
  error?: string     // Error message (when blocked/error)
  blockReason?: string  // Reason for block (when applicable)
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
  "target": "https://restricted-site.com",
  "error": "Connection Timeout or Blocked",
  "blockReason": "FIREWALL"
}
```

#### Error Responses

**Missing URL (400 Bad Request):**

```json
{
  "error": {
    "code": "URL_REQUIRED",
    "message": "URL parameter is required"
  }
}
```

**Invalid URL (400 Bad Request):**

```json
{
  "error": {
    "code": "INVALID_URL",
    "message": "Invalid URL format or not allowed",
    "details": {
      "field": "url",
      "code": "INVALID_FORMAT"
    }
  }
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
const response = await fetch('/api/check?url=' + encodeURIComponent('youtube.com'))
const data = await response.json()

if (data.status === 'accessible') {
  console.log(`Site is accessible (${data.latency}ms)`)
} else {
  console.log(`Site is blocked: ${data.error}`)
}
```

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
  "timestamp": "2026-01-18T10:30:00.000Z",
  "version": "1.0.0"
}
```

#### Response Schema

```typescript
interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string  // ISO 8601 format
  version: string
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
interface ContactRequest {
  name: string       // 2-100 characters
  email: string      // Valid email format
  subject: string    // 5-200 characters
  message: string    // 20-5000 characters
  honeypot?: string  // Bot trap - must be empty
}
```

#### Validation Rules

| Field | Type | Min | Max | Required |
|-------|------|-----|-----|----------|
| name | string | 2 | 100 | Yes |
| email | string (email) | - | 255 | Yes |
| subject | string | 5 | 200 | Yes |
| message | string | 20 | 5000 | Yes |

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

---

### GET /api/posts

Retrieve a paginated list of blog posts.

#### Request

```http
GET /api/posts?limit=10&page=1&sort=-published_date HTTP/1.1
```

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 10 | Items per page (max 100) |
| page | number | 1 | Page number |
| sort | string | -createdAt | Sort field (prefix `-` for descending) |
| where | object | - | Query filter (Payload syntax) |

#### Response

```json
{
  "docs": [
    {
      "id": "abc123",
      "title": "How to Unblock YouTube in China",
      "slug": "unblock-youtube-china",
      "content": { /* Lexical rich text */ },
      "published_date": "2026-01-15",
      "tags": ["VPN Guide", "Unblock Websites"],
      "meta_title": "Unblock YouTube in China - Complete Guide",
      "meta_description": "Learn the best methods to access YouTube...",
      "createdAt": "2026-01-15T08:00:00.000Z",
      "updatedAt": "2026-01-16T10:30:00.000Z"
    }
  ],
  "totalDocs": 42,
  "limit": 10,
  "page": 1,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

---

### GET /api/ip

Get the client's IP address.

#### Request

```http
GET /api/ip HTTP/1.1
```

#### Response (200 OK)

```json
{
  "ip": "203.0.113.42",
  "country": "US",
  "city": "San Francisco"
}
```

---

## Error Handling

### Standard Error Response Format

```typescript
interface ApiError {
  error: {
    code: string          // Machine-readable error code
    message: string       // Human-readable message
    details?: unknown     // Additional context
    requestId?: string    // For support/debugging
  }
}
```

### Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request parameters |
| 400 | `URL_REQUIRED` | Missing required URL parameter |
| 400 | `INVALID_URL` | Malformed URL format |
| 401 | `UNAUTHORIZED` | Authentication required |
| 403 | `FORBIDDEN` | Access denied |
| 404 | `NOT_FOUND` | Resource not found |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Upstream service unavailable |

---

## TypeScript Types

```typescript
// ========================================
// API Check Types
// ========================================

export type CheckStatus = 'accessible' | 'blocked' | 'error'

export interface CheckResponse {
  status: CheckStatus
  code?: number
  latency: number
  target: string
  error?: string
  blockReason?: string
}

// ========================================
// Health Check Types
// ========================================

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'

export interface HealthResponse {
  status: HealthStatus
  timestamp: string
  version: string
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
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'

export interface ApiError {
  error: {
    code: ErrorCode
    message: string
    details?: Record<string, string[]>
    requestId?: string
  }
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
                $ref: '#/components/schemas/ApiError'
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
        blockReason:
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
        subject:
          type: string
          minLength: 5
          maxLength: 200
        message:
          type: string
          minLength: 20
          maxLength: 5000

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
```

---

*Last updated: January 18, 2026*
