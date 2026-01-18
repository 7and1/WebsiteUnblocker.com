# WebsiteUnblocker.com Deployment Guide

**Stack**: Next.js 15 + Payload CMS 3.0 + Cloudflare (Pages/Workers/D1/R2)

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

## 3. CI/CD Pipeline (GitHub Actions)

### 3.1 Full Workflow YAML

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

## 5. Monitoring & Alerts

### 5.1 Cloudflare Analytics

Access via Cloudflare Dashboard > Workers & Pages > websiteunblocker > Analytics

**Key metrics**:
- Requests per second
- CPU time
- Duration (p50, p99)
- Error rate

### 5.2 Error Tracking Setup

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

### 5.3 Performance Monitoring

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

## 6. Rollback Procedure

### 6.1 Deployment Rollback

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

### 6.2 Database Rollback

**Restore from backup**:

```bash
# Download backup from R2
wrangler r2 object get websiteunblocker-media/backups/backup_20250118_020000.sql --file=restore.sql --env=production

# Drop and recreate tables (DANGEROUS - backup first!)
wrangler d1 execute D1 --env=production --remote --file=restore.sql
```

**Point-in-time recovery** (D1 Time Travel):

```bash
# List available bookmarks
wrangler d1 time-travel info D1 --env=production

# Restore to specific timestamp
wrangler d1 time-travel restore D1 --timestamp=2025-01-17T12:00:00Z --env=production
```

---

## 7. Domain & DNS

### 7.1 Cloudflare DNS Setup

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

### 7.2 SSL Configuration

SSL is automatic with Cloudflare Proxy enabled.

**Verify SSL settings**:
- Dashboard > SSL/TLS > Overview > Full (strict)
- Dashboard > SSL/TLS > Edge Certificates > Always Use HTTPS: ON

### 7.3 Redirect Rules (www to non-www)

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

## 8. Security Checklist

### 8.1 Security Headers

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

### 8.2 Rate Limiting

**Cloudflare Rate Limiting Rules**:
- Dashboard > Security > WAF > Rate limiting rules

**Create rule**:
- Name: `API Rate Limit`
- Expression: `(http.request.uri.path contains "/api/")`
- Characteristics: IP
- Period: 10 seconds
- Requests: 20
- Action: Block for 60 seconds

### 8.3 Bot Protection

**Enable Bot Fight Mode**:
- Dashboard > Security > Bots > Bot Fight Mode: ON

**Block bad bots**:
- Dashboard > Security > WAF > Custom rules

```
Rule: Block Bad Bots
Expression: (cf.client.bot) and not (cf.bot_management.verified_bot)
Action: Block
```

### 8.4 Security Checklist Summary

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

## 9. Cost Estimation

### 9.1 Cloudflare Free Tier Limits

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

### 9.2 Paid Tier Triggers

You will need a paid plan ($5/month Workers Paid) when:
- More than 100K requests/day
- CPU time exceeds 10ms average
- D1 writes exceed 100K/day
- R2 storage exceeds 10GB

### 9.3 Monthly Cost Projection

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

### 9.4 Cost Optimization Tips

1. **Cache aggressively**: Use Cloudflare cache for static assets
2. **Minimize D1 writes**: Batch operations where possible
3. **Compress images**: Reduce R2 storage and bandwidth
4. **Use KV for reads**: Move read-heavy data to Workers KV
5. **Monitor usage**: Set up billing alerts in Cloudflare Dashboard

---

## Quick Reference Commands

```bash
# Development
pnpm install                              # Install dependencies
pnpm run dev                              # Start dev server
pnpm run devsafe                          # Clean start dev server
pnpm run generate:types                   # Generate types

# Deployment
CLOUDFLARE_ENV=staging pnpm run deploy    # Deploy to staging
CLOUDFLARE_ENV=production pnpm run deploy # Deploy to production

# Database
pnpm payload migrate                      # Run migrations locally
pnpm payload migrate:create name          # Create new migration

# Debugging
wrangler tail websiteunblocker --env=production  # Live logs
wrangler d1 execute D1 --env=production --remote --command "SELECT 1"

# Backup
wrangler d1 export D1 --env=production --remote --output=backup.sql
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails with memory error | Increase `--max-old-space-size=8000` |
| D1 connection refused | Check `wrangler.jsonc` database_id matches |
| R2 upload fails | Verify bucket exists and binding name matches |
| Migrations not running | Ensure `PAYLOAD_SECRET` is set (can be `ignore` for migrate) |
| Hot reload not working | Run `pnpm run devsafe` to clear cache |
| Admin panel 500 error | Check `pnpm run generate:importmap` |

---

Last updated: 2025-01-18
