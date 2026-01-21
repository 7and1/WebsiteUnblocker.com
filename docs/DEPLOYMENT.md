# WebsiteUnblocker.com Deployment Guide

**Stack**: Next.js 15 + Payload CMS 3.0 + Cloudflare (Pages/Workers/D1/R2)

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Setup](#1-environment-setup)
3. [Local Development](#2-local-development)
4. [Deployment Process](#3-deployment-process)
5. [CI/CD Pipeline](#4-cicd-pipeline-github-actions)
6. [Database Operations](#5-database-operations)
7. [Monitoring & Alerts](#6-monitoring--alerts)
8. [Rollback Procedure](#7-rollback-procedure)
9. [Domain & DNS](#8-domain--dns)
10. [Security Checklist](#9-security-checklist)
11. [Cost Estimation](#10-cost-estimation)
12. [Troubleshooting](#11-troubleshooting)

---

## Quick Start

```bash
# Automated deployment (production)
./scripts/deploy.sh production

# Automated deployment (staging)
./scripts/deploy.sh staging

# Skip tests during deployment
SKIP_TESTS=true ./scripts/deploy.sh production

# Dry run (preview without executing)
DRY_RUN=true ./scripts/deploy.sh production
```

---

## 1. Environment Setup

### 1.1 Required Cloudflare Resources

```bash
# Install Wrangler globally
pnpm add -g wrangler

# Login to Cloudflare
wrangler login

# Create D1 Database
wrangler d1 create websiteunblocker-db
# Output: database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Create R2 Bucket
wrangler r2 bucket create websiteunblocker-media

# Verify resources
wrangler d1 list
wrangler r2 bucket list
```

Update `wrangler.jsonc` with your D1 database ID:

```jsonc
"d1_databases": [
  {
    "binding": "D1",
    "database_id": "YOUR_D1_DATABASE_ID",  // <-- Replace this
    "database_name": "websiteunblocker-db",
    "remote": true
  }
]
```

### 1.2 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PAYLOAD_SECRET` | 32-char hex string for Payload CMS encryption | Yes | `openssl rand -hex 32` |
| `CLOUDFLARE_ENV` | Environment name (staging/production) | Yes | `production` |
| `NEXT_PUBLIC_SERVER_URL` | Public site URL | Yes | `https://websiteunblocker.com` |
| `NODE_ENV` | Node environment | Yes | `production` |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | CI/CD | From dashboard |
| `CLOUDFLARE_API_TOKEN` | API token with proper permissions | CI/CD | Create in dashboard |

### 1.3 Secrets Management

```bash
# Set PAYLOAD_SECRET for production
wrangler secret put PAYLOAD_SECRET --env production
# Paste: <output of openssl rand -hex 32>

# Set PAYLOAD_SECRET for staging
wrangler secret put PAYLOAD_SECRET --env staging
# Paste: <different output of openssl rand -hex 32>

# List secrets
wrangler secret list --env production
```

**Local Development**: Create `.dev.vars` (gitignored):

```env
PAYLOAD_SECRET=your_local_dev_secret_here
```

---

## 2. Local Development

### 2.1 Install Dependencies

```bash
cd /Volumes/SSD/skills/server-ops/vps/107.174.42.198/heavy-tasks/WebsiteUnblocker.com

# Install pnpm if needed
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 2.2 Wrangler Dev Setup

Create `.dev.vars` for local secrets:

```bash
cat > .dev.vars << 'EOF'
PAYLOAD_SECRET=local_dev_secret_32_chars_minimum
EOF
```

### 2.3 Local D1 Persistence

Local D1 data persists in `.wrangler/state/v3/d1/`:

```bash
# Run migrations locally first
pnpm payload migrate

# Start dev server with local D1
pnpm run dev
```

To reset local database:

```bash
rm -rf .wrangler/state/v3/d1/
pnpm payload migrate
```

### 2.4 Hot Reload Configuration

Next.js 15 hot reload works out of the box. For Payload admin changes:

```bash
# Regenerate import map after collection changes
pnpm run generate:importmap

# Regenerate TypeScript types
pnpm run generate:types
```

### 2.5 Common Development Commands

```bash
# Clean start (removes cache)
pnpm run devsafe

# Generate Cloudflare types
pnpm run generate:types:cloudflare

# Generate Payload types
pnpm run generate:types:payload

# Preview production build locally
CLOUDFLARE_ENV=production pnpm run preview
```

---

## 3. Deployment Process

### 3.1 Complete Deployment Flow

The deployment script (`scripts/deploy.sh`) executes the following steps:

```
1. Pre-deployment Checklist
   - Verify git status (uncommitted changes warning)
   - Check current branch (production deployments should be from main)
   - Validate required files exist
   - Check disk space

2. Prerequisites Check
   - Node.js 18+ installed
   - pnpm installed
   - wrangler installed and authenticated

3. Cloudflare Resources Validation
   - D1 database exists
   - R2 bucket exists

4. Run Tests (optional, skip with SKIP_TESTS=true)
   - Unit tests

5. Create Backup (optional, skip with SKIP_BACKUP=true)
   - Backup wrangler config and .dev.vars
   - Keep last 10 backups

6. Database Migrations
   - Run Payload CMS migrations
   - Optimize D1 database

7. Build Application
   - Generate TypeScript types
   - Build with OpenNext for Cloudflare

8. Deploy to Cloudflare Pages
   - Deploy via opennextjs-cloudflare

9. Health Check
   - Verify /api/health endpoint
   - Exponential backoff retries

10. Post-deployment Verification
    - Homepage accessibility
    - Admin panel accessibility
    - API health status
    - Response time check
    - SSL certificate validation
```

### 3.2 Manual Deployment Steps

If you need to deploy manually:

```bash
# Step 1: Install dependencies
pnpm install

# Step 2: Generate types
pnpm run generate:types

# Step 3: Run migrations
CLOUDFLARE_ENV=production NODE_ENV=production PAYLOAD_SECRET=ignore pnpm payload migrate

# Step 4: Build
CLOUDFLARE_ENV=production NODE_OPTIONS="--no-deprecation --max-old-space-size=8000" opennextjs-cloudflare build

# Step 5: Deploy
CLOUDFLARE_ENV=production opennextjs-cloudflare deploy

# Step 6: Verify
./scripts/health-check.sh production
```

### 3.3 Deployment Script Options

```bash
# Standard deployment
./scripts/deploy.sh production

# Staging deployment
./scripts/deploy.sh staging

# Skip tests (faster deployment)
SKIP_TESTS=true ./scripts/deploy.sh production

# Skip backup creation
SKIP_BACKUP=true ./scripts/deploy.sh production

# Dry run (show what would happen)
DRY_RUN=true ./scripts/deploy.sh production

# Debug mode (verbose output)
DEBUG=true ./scripts/deploy.sh production

# Combined options
SKIP_TESTS=true SKIP_BACKUP=true ./scripts/deploy.sh production
```

### 3.4 Pre-deployment Checklist (Manual)

Before deploying, ensure:

- [ ] All changes committed to git
- [ ] On correct branch (main for production)
- [ ] Tests pass locally: `pnpm run test:unit`
- [ ] Build succeeds locally: `pnpm run build`
- [ ] Wrangler authenticated: `wrangler whoami`
- [ ] Environment variables set in Cloudflare
- [ ] Database migrations tested on staging first

---

## 4. CI/CD Pipeline (GitHub Actions)

### 4.1 Full Workflow YAML

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches:
      - main
      - staging
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate types
        run: pnpm run generate:types
        env:
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

      - name: Run database migrations
        run: |
          cross-env NODE_ENV=production PAYLOAD_SECRET=ignore payload migrate
          wrangler d1 execute D1 --command 'PRAGMA optimize' --env=$CLOUDFLARE_ENV --remote
        env:
          CLOUDFLARE_ENV: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

      - name: Build application
        run: opennextjs-cloudflare build --env=$CLOUDFLARE_ENV
        env:
          CLOUDFLARE_ENV: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
          NODE_OPTIONS: '--no-deprecation --max-old-space-size=8000'

      - name: Deploy to Cloudflare Pages
        run: opennextjs-cloudflare deploy --env=$CLOUDFLARE_ENV
        env:
          CLOUDFLARE_ENV: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

      - name: Post deployment URL
        run: |
          if [ "$CLOUDFLARE_ENV" = "production" ]; then
            echo "Deployed to: https://websiteunblocker.com"
          else
            echo "Deployed to: https://staging.websiteunblocker.com"
          fi
        env:
          CLOUDFLARE_ENV: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
```

### 3.2 Required GitHub Secrets

Navigate to Repository Settings > Secrets and variables > Actions:

| Secret | Description | How to get |
|--------|-------------|------------|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | Dashboard > Account Home > Account ID |
| `CLOUDFLARE_API_TOKEN` | API token with permissions | Dashboard > My Profile > API Tokens > Create Token |

**API Token Permissions**:
- Account: Cloudflare Pages - Edit
- Account: Workers Scripts - Edit
- Account: D1 - Edit
- Account: Workers R2 Storage - Edit

### 3.3 Environment Separation

Create `wrangler.jsonc` environments:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "main": ".open-next/worker.js",
  "name": "websiteunblocker",
  "compatibility_date": "2025-08-15",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],

  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },

  "env": {
    "staging": {
      "name": "websiteunblocker-staging",
      "d1_databases": [{
        "binding": "D1",
        "database_id": "STAGING_D1_DATABASE_ID",
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
    },
    "production": {
      "name": "websiteunblocker",
      "d1_databases": [{
        "binding": "D1",
        "database_id": "PRODUCTION_D1_DATABASE_ID",
        "database_name": "websiteunblocker-db"
      }],
      "r2_buckets": [{
        "binding": "R2",
        "bucket_name": "websiteunblocker-media"
      }],
      "vars": {
        "NODE_ENV": "production",
        "NEXT_PUBLIC_SERVER_URL": "https://websiteunblocker.com"
      }
    }
  }
}
```

---

## 4. Database Operations

### 4.1 D1 Migration Workflow

**Create a new migration**:

```bash
# Generate migration file
pnpm payload migrate:create migration_name

# Migrations are stored in src/migrations/
```

**Run migrations locally**:

```bash
pnpm payload migrate
```

**Run migrations remotely**:

```bash
# Staging
CLOUDFLARE_ENV=staging cross-env NODE_ENV=production PAYLOAD_SECRET=ignore payload migrate

# Production
CLOUDFLARE_ENV=production cross-env NODE_ENV=production PAYLOAD_SECRET=ignore payload migrate
```

**Check migration status**:

```bash
wrangler d1 execute D1 --env=production --remote --command "SELECT * FROM payload_migrations"
```

### 4.2 Backup Strategy (Export to R2)

**Manual backup script** (`scripts/backup-d1.sh`):

```bash
#!/bin/bash
set -e

ENV=${1:-production}
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${ENV}_${DATE}.sql"

echo "Backing up D1 database for $ENV..."

# Export D1 database
wrangler d1 export D1 --env=$ENV --remote --output=$BACKUP_FILE

# Upload to R2
wrangler r2 object put websiteunblocker-media/backups/$BACKUP_FILE --file=$BACKUP_FILE --env=$ENV

# Cleanup local file
rm $BACKUP_FILE

echo "Backup uploaded to R2: backups/$BACKUP_FILE"
```

**Automated backup (GitHub Actions)**:

```yaml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install wrangler
        run: npm install -g wrangler

      - name: Export and upload backup
        run: |
          DATE=$(date +%Y%m%d_%H%M%S)
          wrangler d1 export D1 --env=production --remote --output=backup.sql
          wrangler r2 object put websiteunblocker-media/backups/backup_$DATE.sql --file=backup.sql --env=production
        env:
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### 4.3 Schema Changes Procedure

1. **Create migration**:
   ```bash
   pnpm payload migrate:create add_new_field
   ```

2. **Edit migration file** in `src/migrations/`

3. **Test locally**:
   ```bash
   pnpm payload migrate
   pnpm run dev
   ```

4. **Test on staging**:
   ```bash
   CLOUDFLARE_ENV=staging pnpm run deploy:database
   ```

5. **Deploy to production**:
   ```bash
   CLOUDFLARE_ENV=production pnpm run deploy:database
   ```

---

## 6. Monitoring & Alerts

### 6.1 Cloudflare Analytics

Access via Cloudflare Dashboard > Workers & Pages > websiteunblocker > Analytics

**Key metrics**:
- Requests per second
- CPU time
- Duration (p50, p99)
- Error rate

### 6.2 Error Tracking Setup

**Option A: Sentry (Recommended)**

```bash
pnpm add @sentry/nextjs
```

Create `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})
```

**Option B: Cloudflare Logpush**

Enable in Dashboard > Analytics > Logpush > Create Job:
- Select "Workers Trace Events"
- Destination: R2 bucket or external service

### 6.3 Performance Monitoring

**Cloudflare Workers Analytics**:
- Dashboard > Workers & Pages > Analytics
- Monitor CPU time, memory usage, cold starts

**Custom Performance Logging**:

```typescript
// src/app/api/check/route.ts
export async function GET(request: Request) {
  const start = performance.now()

  // ... your logic

  const duration = performance.now() - start
  console.log(`[PERF] check API: ${duration.toFixed(2)}ms`)

  return Response.json({ /* ... */ })
}
```

---

## 7. Rollback Procedure

### 7.1 Using the Rollback Script

The rollback script (`scripts/rollback.sh`) provides automated rollback with verification.

```bash
# Rollback to previous successful deployment
./scripts/rollback.sh production

# List available deployments
./scripts/rollback.sh production --list

# Rollback to specific deployment
./scripts/rollback.sh production --deployment-id abc123def456

# Skip confirmation prompt
./scripts/rollback.sh production --force

# Dry run (preview without executing)
./scripts/rollback.sh production --dry-run
```

### 7.2 Rollback Flow

The rollback script performs:

1. **Validate environment** - Ensure valid environment name
2. **Check prerequisites** - Verify wrangler and jq installed
3. **Fetch deployments** - Get list of recent deployments
4. **Select target** - Auto-select previous successful or use specified ID
5. **Confirm rollback** - Prompt for confirmation (unless --force)
6. **Execute rollback** - Run wrangler pages deployment rollback
7. **Health check** - Verify site is responding after rollback
8. **Verification** - Check homepage, API, and admin panel
9. **Database instructions** - Provide manual database rollback steps

### 7.3 Manual Deployment Rollback

**Via Cloudflare Dashboard**:
1. Go to Workers & Pages > websiteunblocker > Deployments
2. Find previous successful deployment
3. Click "..." > "Rollback to this deployment"

**Via CLI**:

```bash
# List deployments
wrangler pages deployment list --project-name=websiteunblocker

# Rollback to specific deployment
wrangler pages deployment rollback --deployment-id=DEPLOYMENT_ID --project-name=websiteunblocker
```

### 7.4 Database Rollback

Database rollback requires manual intervention. Options:

**Option A: Restore from R2 Backup**

```bash
# 1. List available backups
wrangler r2 object list websiteunblocker-media/backups --env=production

# 2. Download the backup
wrangler r2 object get websiteunblocker-media/backups/backup_20250118_020000.sql \
  --file=restore.sql --env=production

# 3. Restore (CAUTION: This overwrites existing data)
wrangler d1 execute D1 --env=production --remote --file=restore.sql
```

**Option B: D1 Time Travel (Point-in-time Recovery)**

```bash
# List available recovery points
wrangler d1 time-travel info D1 --env=production

# Restore to specific timestamp
wrangler d1 time-travel restore D1 --timestamp=2025-01-17T12:00:00Z --env=production
```

**Option C: Via Cloudflare Dashboard**

1. Go to Workers & Pages > D1 > websiteunblocker-db
2. Click Settings > Restore from backup
3. Select the backup or timestamp to restore

### 7.5 Rollback Verification

After rollback, verify the deployment:

```bash
# Run health check
./scripts/health-check.sh production

# Or check manually
curl -s https://websiteunblocker.com/api/health | jq
curl -s -o /dev/null -w "%{http_code}" https://websiteunblocker.com
```

### 7.6 Emergency Rollback

For critical issues requiring immediate rollback:

```bash
# Quick rollback (skip confirmation, auto-select previous deployment)
./scripts/rollback.sh production --force

# Or via wrangler directly
wrangler pages deployment list --project-name=websiteunblocker --json | \
  jq -r '[.[] | select(.latest_stage.name == "success")][1].id' | \
  xargs -I {} wrangler pages deployment rollback --deployment-id={} --project-name=websiteunblocker
```

---

## 8. Domain & DNS

### 8.1 Cloudflare DNS Setup

1. **Add domain to Cloudflare**:
   - Dashboard > Websites > Add a Site
   - Update nameservers at registrar

2. **Configure DNS records**:

   | Type | Name | Content | Proxy |
   |------|------|---------|-------|
   | CNAME | @ | websiteunblocker.pages.dev | Proxied |
   | CNAME | www | websiteunblocker.com | Proxied |

3. **Add custom domain to Pages**:
   - Workers & Pages > websiteunblocker > Custom domains
   - Add `websiteunblocker.com`
   - Add `www.websiteunblocker.com`

### 8.2 SSL Configuration

SSL is automatic with Cloudflare Proxy enabled.

**Verify SSL settings**:
- Dashboard > SSL/TLS > Overview > Full (strict)
- Dashboard > SSL/TLS > Edge Certificates > Always Use HTTPS: ON

### 8.3 Redirect Rules (www to non-www)

**Create redirect rule**:
- Dashboard > Rules > Redirect Rules > Create Rule

**Rule configuration**:
- Name: `www to non-www`
- When: `(http.host eq "www.websiteunblocker.com")`
- Then: Dynamic Redirect
- Expression: `concat("https://websiteunblocker.com", http.request.uri.path)`
- Status code: 301

**Alternative via `_redirects` file**:

Create `public/_redirects`:

```
https://www.websiteunblocker.com/* https://websiteunblocker.com/:splat 301
```

---

## 9. Security Checklist

### 9.1 Security Headers

Create `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // HSTS (2 years)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )

  // CSP
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join('; ')
  )

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### 9.2 Rate Limiting

**Cloudflare Rate Limiting Rules**:
- Dashboard > Security > WAF > Rate limiting rules

**Create rule**:
- Name: `API Rate Limit`
- Expression: `(http.request.uri.path contains "/api/")`
- Characteristics: IP
- Period: 10 seconds
- Requests: 20
- Action: Block for 60 seconds

### 9.3 Bot Protection

**Enable Bot Fight Mode**:
- Dashboard > Security > Bots > Bot Fight Mode: ON

**Block bad bots**:
- Dashboard > Security > WAF > Custom rules

```
Rule: Block Bad Bots
Expression: (cf.client.bot) and not (cf.bot_management.verified_bot)
Action: Block
```

### 9.4 Security Checklist Summary

- [ ] PAYLOAD_SECRET is unique per environment (32+ chars)
- [ ] SSL/TLS set to Full (strict)
- [ ] Always Use HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled for /api routes
- [ ] Bot Fight Mode enabled
- [ ] WAF rules configured
- [ ] Admin panel protected (consider IP allowlist)
- [ ] R2 bucket is private (no public access)
- [ ] Backup encryption enabled

---

## 10. Cost Estimation

### 10.1 Cloudflare Free Tier Limits

| Resource | Free Tier | Overage Cost |
|----------|-----------|--------------|
| Workers Requests | 100K/day | $0.30/million |
| Workers CPU Time | 10ms/invocation | $0.02/million ms |
| D1 Reads | 5M/day | $0.001/million |
| D1 Writes | 100K/day | $1.00/million |
| D1 Storage | 5GB | $0.75/GB/month |
| R2 Storage | 10GB | $0.015/GB/month |
| R2 Class A ops | 1M/month | $4.50/million |
| R2 Class B ops | 10M/month | $0.36/million |
| Pages Builds | 500/month | N/A |
| Pages Bandwidth | Unlimited | Free |

### 10.2 Paid Tier Triggers

You will need a paid plan ($5/month Workers Paid) when:
- More than 100K requests/day
- CPU time exceeds 10ms average
- D1 writes exceed 100K/day
- R2 storage exceeds 10GB

### 10.3 Monthly Cost Projection

**Low Traffic (< 10K visits/month)**:
- Workers: Free tier
- D1: Free tier
- R2: Free tier
- **Total: $0/month**

**Medium Traffic (10K-100K visits/month)**:
- Workers Paid: $5/month
- D1: ~$0-2/month
- R2: ~$0-1/month
- **Total: $5-8/month**

**High Traffic (100K-1M visits/month)**:
- Workers Paid: $5/month
- Workers requests: ~$3/month
- D1: ~$5-15/month
- R2: ~$2-5/month
- **Total: $15-30/month**

### 10.4 Cost Optimization Tips

1. **Cache aggressively**: Use Cloudflare cache for static assets
2. **Minimize D1 writes**: Batch operations where possible
3. **Compress images**: Reduce R2 storage and bandwidth
4. **Use KV for reads**: Move read-heavy data to Workers KV
5. **Monitor usage**: Set up billing alerts in Cloudflare Dashboard

---

## 11. Troubleshooting

### 11.1 Common Deployment Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Build fails with memory error | Insufficient heap space | Increase `--max-old-space-size=8000` in NODE_OPTIONS |
| D1 connection refused | Wrong database_id in wrangler.jsonc | Verify `database_id` matches output of `wrangler d1 list` |
| R2 upload fails | Bucket doesn't exist or wrong binding | Run `wrangler r2 bucket list` and verify bucket name |
| Migrations not running | Missing PAYLOAD_SECRET | Set `PAYLOAD_SECRET=ignore` for migrate command |
| Wrangler not authenticated | Token expired | Run `wrangler login` to re-authenticate |
| Deploy timeout | Large build or slow network | Retry deployment, check network stability |

### 11.2 Health Check Failures

```bash
# Run detailed health check
./scripts/health-check.sh production

# Check specific endpoint
curl -v https://websiteunblocker.com/api/health

# Check DNS resolution
dig websiteunblocker.com

# Check SSL certificate
echo | openssl s_client -servername websiteunblocker.com -connect websiteunblocker.com:443 2>/dev/null | openssl x509 -noout -dates
```

### 11.3 Application Errors

**500 Internal Server Error**:
```bash
# Check live logs
wrangler tail websiteunblocker --env=production

# Check if admin panel works
curl -v https://websiteunblocker.com/admin
```

**Admin Panel Not Loading**:
```bash
# Regenerate import map
pnpm run generate:importmap

# Regenerate types
pnpm run generate:types

# Rebuild and redeploy
./scripts/deploy.sh production
```

**Database Errors**:
```bash
# Test database connection
wrangler d1 execute D1 --env=production --remote --command "SELECT 1"

# Check migration status
wrangler d1 execute D1 --env=production --remote --command "SELECT * FROM payload_migrations"

# Run pending migrations
CLOUDFLARE_ENV=production NODE_ENV=production PAYLOAD_SECRET=ignore pnpm payload migrate
```

### 11.4 Performance Issues

**Slow Response Times**:
```bash
# Check response time
curl -w "Time: %{time_total}s\n" -o /dev/null -s https://websiteunblocker.com

# Check Cloudflare analytics for CPU time
# Dashboard > Workers & Pages > websiteunblocker > Analytics
```

**High CPU Usage**:
- Review recent code changes
- Check for infinite loops or heavy computations
- Consider caching expensive operations

### 11.5 Rollback Failures

```bash
# If rollback script fails, use wrangler directly
wrangler pages deployment list --project-name=websiteunblocker --json | jq '.[].id'

# Rollback to specific deployment
wrangler pages deployment rollback --deployment-id=DEPLOYMENT_ID --project-name=websiteunblocker
```

### 11.6 Debug Mode

Enable debug output for detailed troubleshooting:

```bash
# Deploy with debug mode
DEBUG=true ./scripts/deploy.sh production

# Health check with verbose output
./scripts/health-check.sh production 2>&1 | tee health-check.log

# Rollback with debug
DEBUG=true ./scripts/rollback.sh production --dry-run
```

### 11.7 Getting Help

1. Check Cloudflare status: https://www.cloudflarestatus.com/
2. Review Cloudflare Workers logs in dashboard
3. Check GitHub Actions workflow logs for CI/CD issues
4. Consult [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more detailed guides

---

## Quick Reference Commands

```bash
# Development
pnpm install                              # Install dependencies
pnpm run dev                              # Start dev server
pnpm run devsafe                          # Clean start dev server
pnpm run generate:types                   # Generate types

# Deployment
./scripts/deploy.sh production            # Full deployment
./scripts/deploy.sh staging               # Staging deployment
DRY_RUN=true ./scripts/deploy.sh prod     # Preview deployment

# Health & Monitoring
./scripts/health-check.sh production      # Run health checks
./scripts/health-check.sh prod --json     # JSON output for monitoring
wrangler tail websiteunblocker --env=prod # Live logs

# Rollback
./scripts/rollback.sh production          # Rollback to previous
./scripts/rollback.sh prod --list         # List deployments
./scripts/rollback.sh prod --force        # Emergency rollback

# Database
pnpm payload migrate                      # Run migrations locally
pnpm payload migrate:create name          # Create new migration
wrangler d1 execute D1 --env=production --remote --command "SELECT 1"

# Backup
wrangler d1 export D1 --env=production --remote --output=backup.sql
```

---

## Operational Scripts Summary

| Script | Purpose | Common Usage |
|--------|---------|--------------|
| `scripts/deploy.sh` | Full deployment pipeline | `./scripts/deploy.sh production` |
| `scripts/health-check.sh` | Verify deployment health | `./scripts/health-check.sh production` |
| `scripts/rollback.sh` | Rollback to previous version | `./scripts/rollback.sh production` |

---

## Related Documentation

- [Environment Variables Reference](./ENVIRONMENT.md) - Complete environment variable guide
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Detailed issue resolution
- [Cloudflare Setup](./CLOUDFLARE-SETUP.md) - Cloudflare configuration
- [API Documentation](./API-DESIGN.md) - API endpoints and usage

---

Last updated: 2025-01-21
