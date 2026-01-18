# WebsiteUnblocker.com - Maintenance Runbook

Operational procedures for maintaining the WebsiteUnblocker.com production environment.

---

## Table of Contents

1. [Database Operations](#1-database-operations)
2. [Cache Management](#2-cache-management)
3. [Log Monitoring](#3-log-monitoring)
4. [Performance Troubleshooting](#4-performance-troubleshooting)
5. [Security Updates](#5-security-updates)
6. [Incident Response](#6-incident-response)
7. [Scaling Procedures](#7-scaling-procedures)

---

## 1. Database Operations

### 1.1 Daily Backup

**Automated Backup (Recommended)**:

Create `.github/workflows/backup.yml`:

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

      - name: Export D1 database
        run: |
          DATE=$(date +%Y%m%d_%H%M%S)
          wrangler d1 export D1 --env=production --remote --output=backup_$DATE.sql
        env:
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

      - name: Upload to R2
        run: |
          DATE=$(date +%Y%m%d_%H%M%S)
          wrangler r2 object put websiteunblocker-media/backups/backup_$DATE.sql --file=backup_$DATE.sql
        env:
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

      - name: Clean old backups (keep 30 days)
        run: |
          # Use wrangler r2 list and delete old files
          wrangler r2 object list websiteunblocker-media/backups --env=production
```

**Manual Backup**:

```bash
# Export database
wrangler d1 export D1 --env=production --remote --output=backup_$(date +%Y%m%d).sql

# Upload to R2 for safekeeping
wrangler r2 object put websiteunblocker-media/backups/backup_$(date +%Y%m%d).sql --file=backup_$(date +%Y%m%d).sql --env=production

# List backups
wrangler r2 object list websiteunblocker-media/backups --env=production
```

### 1.2 Database Restore

```bash
# Download backup from R2
wrangler r2 object get websiteunblocker-media/backups/backup_20250118.sql --file=restore.sql --env=production

# Restore to D1
wrangler d1 execute D1 --env=production --remote --file=restore.sql
```

### 1.3 Database Optimization

Run weekly to maintain performance:

```bash
wrangler d1 execute D1 --env=production --remote --command "PRAGMA optimize"
wrangler d1 execute D1 --env=production --remote --command "VACUUM"
```

### 1.4 Schema Migrations

**Creating a Migration**:

```bash
# Generate migration file
pnpm payload migrate:create add_new_field

# Edit the migration file in src/migrations/
```

**Running Migrations**:

```bash
# Test locally first
pnpm payload migrate

# Deploy to staging
CLOUDFLARE_ENV=staging pnpm payload migrate

# Deploy to production
CLOUDFLARE_ENV=production pnpm payload migrate
```

**Migration Checklist**:
- [ ] Migration tested locally
- [ ] Backup created before migration
- [ ] Staging tested
- [ ] Production deployment scheduled during low traffic

---

## 2. Cache Management

### 2.1 Clear Cloudflare CDN Cache

**Via Dashboard**:
1. Go to Caching > Configuration
2. Click "Purge Cache"
3. Select "Custom purge"
4. Enter URL or use wildcard: `https://websiteunblocker.com/*`

**Via CLI**:

```bash
# Purge everything
wrangler cache purge --url=https://websiteunblocker.com/*

# Purge specific URLs
wrangler cache purge --url=https://websiteunblocker.com/blog/post-1
```

### 2.2 Clear KV Cache

```bash
# List all keys in KV namespace
wrangler kv:key list --namespace-id=YOUR_KV_ID

# Delete specific key
wrangler kv:key delete --namespace-id=YOUR_KV_ID --key=rate_limit::1.2.3.4

# Delete all keys (careful!)
wrangler kv:key list --namespace-id=YOUR_KV_ID | jq -r '.[].name' | \
  xargs -I {} wrangler kv:key delete --namespace-id=YOUR_KV_ID --key={}
```

### 2.3 Clear Next.js Cache

**On the server (if applicable)**:
```bash
rm -rf .next/cache
```

**For Cloudflare Pages**, cache is managed automatically. Force a new deployment:

```bash
CLOUDFLARE_ENV=production pnpm run deploy
```

---

## 3. Log Monitoring

### 3.1 Real-Time Log Streaming

```bash
# Stream production logs
wrangler tail websiteunblocker --env=production

# Format logs with timestamps
wrangler tail websiteunblocker --env=production --format pretty
```

### 3.2 View Logs from Dashboard

1. Workers & Pages > websiteunblocker > Logs
2. Filter by status, time, or request properties
3. Download logs for analysis

### 3.3 Centralized Logging (Optional)

**Setup Cloudflare Logpush**:

1. Analytics & Logs > Logpush
2. Create job:
   - Dataset: Workers Trace Events
   - Destination: R2 bucket or Datadog/New Relic
   - Fields: select all

**Example R2 destination**:
```
r2://websiteunblocker-media/logs/{DATE}?account-id=YOUR_ACCOUNT_ID
```

### 3.4 Error Tracking with Sentry

**Installation**:
```bash
pnpm add @sentry/nextjs
```

**Configuration** (`sentry.client.config.ts`):
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter sensitive data
    return event
  },
})
```

---

## 4. Performance Troubleshooting

### 4.1 Monitor Worker Analytics

Visit Dashboard > Workers & Pages > websiteunblocker > Analytics

**Key metrics**:
- Requests per second
- CPU time (target: < 10ms average)
- Duration (p50, p95, p99)
- Error rate
- Status code distribution

### 4.2 Common Performance Issues

**High CPU Time**:
```bash
# Profile the build
pnpm build --profile

# Check for large bundles
pnpm build --analyze
```

**Slow Database Queries**:
```bash
# Enable query logging in payload.config.ts
db: sqliteD1Adapter({
  binding: d1Binding,
  debug: true,  // Enable query logging
})
```

**High Memory Usage**:
```bash
# Increase Node.js heap size
export NODE_OPTIONS="--max-old-space-size=8000"
pnpm run deploy
```

### 4.3 Performance Testing

```bash
# Load test with wrk
wrk -t12 -c400 -d30s https://websiteunblocker.com/api/check?url=google.com

# API performance test
pnpm run test:performance
```

### 4.4 Optimize Images

```bash
# Install sharp for image optimization
pnpm add sharp

# Verify images are optimized
find public -name "*.png" -o -name "*.jpg" | xargs file
```

---

## 5. Security Updates

### 5.1 Dependency Updates

```bash
# Check for outdated packages
pnpm outdated

# Update dependencies
pnpm update

# Major version updates
pnpm update --latest

# Audit for vulnerabilities
pnpm audit
pnpm audit fix
```

### 5.2 Security Headers

Verify `src/middleware.ts` includes:

```typescript
response.headers.set('X-Frame-Options', 'DENY')
response.headers.set('X-Content-Type-Options', 'nosniff')
response.headers.set('Strict-Transport-Security', 'max-age=31536000')
response.headers.set('Content-Security-Policy', "...")
```

Test headers:
```bash
curl -I https://websiteunblocker.com
```

### 5.3 Security Audit

Run monthly:

```bash
# OWASP dependency check
pnpm audit --audit-level=moderate

# Check for exposed secrets
git log --all --full-history --source -- "**/.env" "**/.dev.vars"
```

### 5.4 WAF Rules

**Recommended Cloudflare WAF Rules**:

1. **Block SQL Injection**:
   - Expression: `http.request.uri contains "union select" or http.request.uri contains "or 1=1"`
   - Action: Block

2. **Block XSS Attempts**:
   - Expression: `http.request.uri contains "<script>"`
   - Action: Block

3. **Rate Limit API**:
   - Expression: `http.request.uri.path contains "/api/"`
   - Rate: 20 requests per 10 seconds
   - Action: Block

---

## 6. Incident Response

### 6.1 Site Down

**Symptom**: Site returns 500 or times out

**Steps**:
1. Check status page: https://www.cloudflarestatus.com
2. Check logs: `wrangler tail websiteunblocker --env=production`
3. Check recent deployments:
   ```bash
   wrangler pages deployment list --project-name=websiteunblocker
   ```
4. Rollback if needed:
   ```bash
   wrangler pages deployment rollback --deployment-id=PREVIOUS_DEPLOYMENT_ID
   ```

### 6.2 Database Errors

**Symptom**: Database connection failures

**Steps**:
1. Verify D1 status:
   ```bash
   wrangler d1 info websiteunblocker-db --env=production
   ```
2. Test connection:
   ```bash
   wrangler d1 execute D1 --env=production --remote --command "SELECT 1"
   ```
3. Check for locked tables:
   ```bash
   wrangler d1 execute D1 --env=production --remote --command "PRAGMA database_list"
   ```

### 6.3 High Error Rate

**Symptom**: Sudden increase in 4xx/5xx errors

**Steps**:
1. Check Cloudflare Analytics
2. Look for patterns (specific URLs, user agents)
3. Enable rate limiting if under attack
4. Block malicious IPs in WAF

### 6.4 Incident Communication

**Template**:

```
**Issue**: [Brief description]
**Status**: Investigating | Identified | Monitoring | Resolved
**Started**: [Timestamp]
**Impact**: [Affected services, user impact]
**Next Update**: [Time]

**Updates**:
- [Timestamp]: [Update details]
```

---

## 7. Scaling Procedures

### 7.1 Monitor Usage Limits

```bash
# Check current usage
wrangler limits websiteunblocker
```

**Free Tier Limits**:
- Workers: 100K requests/day
- CPU: 10ms per request
- D1: 5M reads, 100K writes/day
- R2: 10GB storage, 1M Class A ops

### 7.2 Upgrade to Paid Plan

When to upgrade:
- Consistently > 100K requests/day
- CPU time > 10ms average
- Need more than 5 concurrent D1 queries

Upgrade: Dashboard > Workers & Pages > websiteunblocker > Resources > Upgrade

### 7.3 Optimize Before Scaling

1. **Cache aggressively**:
   ```typescript
   // Add cache headers to API routes
   export const dynamic = 'force-dynamic'
   export const revalidate = 3600  // 1 hour
   ```

2. **Use Workers KV for reads**:
   ```typescript
   const cached = await RATE_LIMIT_KV.get(key)
   if (cached) return JSON.parse(cached)
   ```

3. **Batch D1 operations**:
   ```typescript
   await db.batch([
     db.prepare('INSERT INTO...'),
     db.prepare('UPDATE...'),
   ])
   ```

---

## 8. Maintenance Schedule

| Task | Frequency | Command |
|------|-----------|---------|
| Database backup | Daily (automated) | GitHub Actions |
| Cache purge | As needed | `wrangler cache purge` |
| Dependency update | Weekly | `pnpm update` |
| Security audit | Monthly | `pnpm audit` |
| Log review | Weekly | Dashboard |
| Performance review | Monthly | Analytics |
| Cost review | Monthly | Billing |

---

## 9. Emergency Contacts

| Role | Contact |
|------|---------|
| Cloudflare Support | https://support.cloudflare.com |
| Database Issues | Check D1 status page |
| Security Issues | security@websiteunblocker.com |

---

## Quick Reference Commands

```bash
# Database
wrangler d1 execute D1 --env=production --remote --command "SELECT 1"
wrangler d1 export D1 --env=production --remote --output=backup.sql

# Cache
wrangler cache purge --url=https://websiteunblocker.com/*

# Logs
wrangler tail websiteunblocker --env=production

# Deploy
CLOUDFLARE_ENV=production pnpm run deploy

# Rollback
wrangler pages deployment list --project-name=websiteunblocker
wrangler pages deployment rollback --deployment-id=ID

# Health check
curl https://websiteunblocker.com/api/health
```

---

Last updated: 2025-01-18
