# WebsiteUnblocker.com - Environment Setup Guide

Complete guide for setting up the development environment and Cloudflare infrastructure.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Cloudflare Resources Setup](#2-cloudflare-resources-setup)
3. [Local Development Setup](#3-local-development-setup)
4. [Environment Variables](#4-environment-variables)
5. [Database Setup](#5-database-setup)
6. [SEO Verification](#6-seo-verification)

---

## 1. Prerequisites

### 1.1 Required Software

| Tool | Version | Installation |
|------|---------|--------------|
| Node.js | 18.20.2+ | `nvm install 20` or `brew install node` |
| pnpm | 9.x+ | `npm install -g pnpm` |
| Wrangler CLI | Latest | `npm install -g wrangler` |
| Git | Latest | `brew install git` |

### 1.2 Verify Installation

```bash
# Check versions
node --version   # Should be v18.20.2 or v20.x+
pnpm --version   # Should be 9.x or 10.x
wrangler --version
git --version
```

### 1.3 Cloudflare Account

- Create account at https://dash.cloudflare.com/sign-up
- Verify email address
- Note your Account ID from dashboard

---

## 2. Cloudflare Resources Setup

### 2.1 Authenticate Wrangler

```bash
wrangler login
```

This opens a browser for OAuth authentication. After successful login:

```bash
wrangler whoami
# Output: "You are logged in with an OAuth Token"
```

### 2.2 Create D1 Database

```bash
# Production database
wrangler d1 create websiteunblocker-db
# Save the output database_id for wrangler.jsonc

# Staging database (optional)
wrangler d1 create websiteunblocker-db-staging
```

Example output:
```
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2.3 Create R2 Storage Bucket

```bash
# Production bucket
wrangler r2 bucket create websiteunblocker-media

# Staging bucket (optional)
wrangler r2 bucket create websiteunblocker-media-staging
```

### 2.4 Create KV Namespace (for rate limiting)

```bash
# Production KV
wrangler kv:namespace create RATE_LIMIT_KV
# Save the output id for wrangler.jsonc

# Preview KV (for local development)
wrangler kv:namespace create RATE_LIMIT_KV --preview
```

### 2.5 Configure `wrangler.jsonc`

Update `wrangler.jsonc` with your resource IDs:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "main": ".open-next/worker.js",
  "name": "websiteunblocker",
  "compatibility_date": "2025-08-15",
  "compatibility_flags": [
    "nodejs_compat",
    "global_fetch_strictly_public"
  ],

  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },

  "d1_databases": [
    {
      "binding": "D1",
      "database_id": "YOUR_D1_DATABASE_ID",
      "database_name": "websiteunblocker-db",
      "remote": true
    }
  ],

  "r2_buckets": [
    {
      "binding": "R2",
      "bucket_name": "websiteunblocker-media"
    }
  ],

  "kv_namespaces": [
    {
      "binding": "RATE_LIMIT_KV",
      "id": "YOUR_KV_NAMESPACE_ID"
    }
  ],

  "vars": {
    "NODE_ENV": "production",
    "NEXT_PUBLIC_SERVER_URL": "https://websiteunblocker.com"
  },

  "env": {
    "staging": {
      "name": "websiteunblocker-staging",
      "d1_databases": [{
        "binding": "D1",
        "database_id": "YOUR_STAGING_D1_ID",
        "database_name": "websiteunblocker-db-staging"
      }],
      "r2_buckets": [{
        "binding": "R2",
        "bucket_name": "websiteunblocker-media-staging"
      }],
      "vars": {
        "NODE_ENV": "production",
        "NEXT_PUBLIC_SERVER_URL": "https://staging.websiteunblocker.com"
      }
    }
  }
}
```

---

## 3. Local Development Setup

### 3.1 Clone Repository

```bash
cd /path/to/your/projects
git clone <repository-url>
cd WebsiteUnblocker.com
```

### 3.2 Install Dependencies

```bash
pnpm install
```

### 3.3 Create Local Environment File

Create `.dev.vars` (already in `.gitignore`):

```bash
# Generate a secure secret
openssl rand -hex 32
```

Create `.dev.vars`:
```env
PAYLOAD_SECRET=your_local_dev_secret_minimum_32_characters
```

### 3.4 Generate Types

```bash
pnpm run generate:types
```

This generates:
- Cloudflare binding types (`cloudflare-env.d.ts`)
- Payload CMS types (`payload-types.ts`)

### 3.5 Initialize Database

```bash
# Create local database and run migrations
pnpm payload migrate
```

This creates a local SQLite database in `.wrangler/state/v3/d1/`.

### 3.6 Start Development Server

```bash
pnpm run dev
```

Visit:
- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin

### 3.7 Clean Start (if needed)

```bash
pnpm run devsafe
```

This clears cache and restarts the dev server.

---

## 4. Environment Variables

### 4.1 Production Secrets

Set these via Wrangler (never commit to git):

```bash
# PAYLOAD_SECRET - Generate secure secret
openssl rand -hex 32
wrangler secret put PAYLOAD_SECRET
# Paste the generated value

# For staging
wrangler secret put PAYLOAD_SECRET --env staging
```

### 4.2 Optional Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `AFF_NORDVPN` | NordVPN affiliate ID | (empty) |
| `AFF_EXPRESSVPN` | ExpressVPN affiliate ID | (empty) |
| `AFF_SURFSHARK` | Surfshark affiliate ID | (empty) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL | `https://websiteunblocker.com` |

### 4.3 Verify Secrets

```bash
# List secrets (values are hidden)
wrangler secret list
```

---

## 5. Database Setup

### 5.1 Initial Migration

```bash
# Local
pnpm payload migrate

# Staging
CLOUDFLARE_ENV=staging pnpm payload migrate

# Production
CLOUDFLARE_ENV=production pnpm payload migrate
```

### 5.2 Create Admin User

After migration, visit `/admin` and create the first user:

1. Go to http://localhost:3000/admin
2. Click "Create an account"
3. Enter email and password
4. First user is automatically an admin

### 5.3 Seed Content (Optional)

Create seed scripts in `scripts/seed.ts`:

```typescript
import { payload } from '@/payload'
import { Posts } from '@/collections/Posts'

async function seed() {
  await payload.create({
    collection: 'posts',
    data: {
      title: 'How to Unblock Any Website',
      slug: 'how-to-unblock-any-website',
      content: /* ... */,
      published_date: new Date().toISOString(),
    },
  })
}

seed()
```

Run with:
```bash
pnpm exec tsx scripts/seed.ts
```

---

## 6. SEO Verification

### 6.1 Google Search Console

1. Go to https://search.google.com/search-console
2. Add property: `https://websiteunblocker.com`
3. Choose "HTML file upload" verification method
4. Upload verification file to `public/googleXXXXXXXXX.html`
5. Click "Verify"

### 6.2 Add Sitemap

Sitemap is auto-generated at `/sitemap.xml`.

Submit to Google:
```
https://search.google.com/search-console/sitemap
```

### 6.3 Robots.txt

Verify `public/robots.txt` exists or is generated via API:

```
User-agent: *
Allow: /
Sitemap: https://websiteunblocker.com/sitemap.xml
```

### 6.4 Structured Data

The site includes JSON-LD structured data. Test with:
https://search.google.com/test/rich-results

### 6.5 Analytics Integration

For Google Analytics 4:

1. Create GA4 property at https://analytics.google.com
2. Get Measurement ID (G-XXXXXXXXXX)
3. Add to environment:
```bash
wrangler secret put NEXT_PUBLIC_GA_ID
# Enter: G-XXXXXXXXXX
```

---

## 7. Domain Setup

### 7.1 Add Domain to Cloudflare

1. In Cloudflare Dashboard > Websites > Add a Site
2. Enter `websiteunblocker.com`
3. Select free plan
4. Update nameservers at your registrar

### 7.2 Configure DNS Records

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | @ | `websiteunblocker.pages.dev` | Proxied (orange cloud) |
| CNAME | www | `websiteunblocker.com` | Proxied (orange cloud) |

### 7.3 Add Custom Domain to Pages

1. Workers & Pages > websiteunblocker > Custom domains
2. Add `websiteunblocker.com`
3. Add `www.websiteunblocker.com`

---

## 8. Troubleshooting

### 8.1 Common Issues

**Issue**: `wrangler login` fails
```bash
# Solution: Use API token instead
wrangler login --api-token YOUR_API_TOKEN
```

**Issue**: D1 binding not found
```bash
# Verify database exists
wrangler d1 list

# Check wrangler.jsonc database_id matches
```

**Issue**: Build fails with memory error
```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=8000"
pnpm run build
```

**Issue**: Hot reload not working
```bash
# Clear all cache
pnpm run devsafe
```

### 8.2 Reset Local Database

```bash
rm -rf .wrangler/state/v3/d1/
pnpm payload migrate
```

---

## 9. Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] pnpm installed
- [ ] Wrangler authenticated
- [ ] D1 database created
- [ ] R2 bucket created
- [ ] wrangler.jsonc configured
- [ ] Dependencies installed (`pnpm install`)
- [ ] Types generated (`pnpm run generate:types`)
- [ ] `.dev.vars` created with PAYLOAD_SECRET
- [ ] Database migrated (`pnpm payload migrate`)
- [ ] Dev server running (`pnpm run dev`)
- [ ] Admin user created
- [ ] Domain added to Cloudflare

---

Last updated: 2025-01-18
