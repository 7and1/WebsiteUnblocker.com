# Troubleshooting Guide

Common issues and solutions for deploying and running WebsiteUnblocker.com on Cloudflare.

---

## Table of Contents

1. [Build Issues](#build-issues)
2. [Deployment Issues](#deployment-issues)
3. [Database Issues](#database-issues)
4. [Storage Issues](#storage-issues)
5. [Runtime Errors](#runtime-errors)
6. [Performance Issues](#performance-issues)
7. [Local Development Issues](#local-development-issues)

---

## Build Issues

### Error: JavaScript heap out of memory

**Symptoms**:
```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed
```

**Solution**:

The build script already includes `--max-old-space-size=8000`. If you still encounter issues:

```bash
# Increase memory limit further
NODE_OPTIONS="--max-old-space-size=12000" pnpm run build

# Or set environment variable
export NODE_OPTIONS="--max-old-space-size=12000"
pnpm run build
```

### Error: Type 'X' is missing properties from type 'Y'

**Symptoms**:
```
TS2739: Type 'D1Database' is missing the following properties...
```

**Solution**:

```bash
# Regenerate Cloudflare types
pnpm run generate:types:cloudflare

# Regenerate Payload types
pnpm run generate:types:payload
```

### Error: Cannot find module 'X'

**Symptoms**:
```
Error: Cannot find module '@opennextjs/cloudflare'
```

**Solution**:

```bash
# Clean install dependencies
rm -rf node_modules .pnpm-store
pnpm install

# If issue persists, ensure pnpm version is correct
pnpm --version  # Should be 9.x or higher
```

---

## Deployment Issues

### Error: Authentication required

**Symptoms**:
```
Error: Authentication error - not logged in
```

**Solution**:

```bash
# Login to Wrangler
wrangler login

# Verify authentication
wrangler whoami
```

### Error: Deployment timeout

**Symptoms**:
Deployment hangs for more than 5 minutes

**Solution**:

```bash
# Check if deployment is actually stuck or just slow
wrangler pages deployment list --project-name=websiteunblocker

# Cancel stuck deployment via Cloudflare Dashboard
# Workers & Pages > websiteunblocker > Deployments > Cancel
```

### Error: Environment variable not set

**Symptoms**:
```
Error: process.env.PAYLOAD_SECRET is undefined
```

**Solution**:

```bash
# For secrets
wrangler secret put PAYLOAD_SECRET --env production

# For regular variables, edit wrangler.jsonc
# Or use wrangler secret bulk
```

### Error: D1 binding not found

**Symptoms**:
```
Error: Binding 'D1' does not exist
```

**Solution**:

```bash
# Verify D1 database exists
wrangler d1 list

# Check wrangler.jsonc configuration
cat wrangler.jsonc | grep -A 5 d1_databases

# Recreate binding if needed
wrangler d1 create websiteunblocker-db
# Update database_id in wrangler.jsonc
```

---

## Database Issues

### Error: Database is locked

**Symptoms**:
```
Error: database is locked
```

**Solution**:

This is a D1 limitation during high write concurrency:

```bash
# Wait and retry, or optimize your queries
# For migrations, run them during low-traffic periods

# Optimize database
wrangler d1 execute D1 --command "PRAGMA optimize" --env=production --remote
```

### Error: Migration fails

**Symptoms**:
```
Error: Migration 'xyz' already executed
```

**Solution**:

```bash
# Check migration status
wrangler d1 execute D1 --env=production --remote --command "SELECT * FROM payload_migrations"

# Skip migration if already applied
# Edit the migration file to check for existing state
```

### Error: No such table

**Symptoms**:
```
Error: no such table: payload_users
```

**Solution**:

```bash
# Run migrations
CLOUDFLARE_ENV=production cross-env NODE_ENV=production PAYLOAD_SECRET=ignore pnpm payload migrate

# Verify tables exist
wrangler d1 execute D1 --env=production --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
```

---

## Storage Issues

### Error: R2 bucket not found

**Symptoms**:
```
Error: No such bucket
```

**Solution**:

```bash
# Create R2 bucket
wrangler r2 bucket create websiteunblocker-media

# Verify bucket exists
wrangler r2 bucket list
```

### Error: R2 upload fails

**Symptoms**:
File uploads fail silently or return 500 error

**Solution**:

```bash
# Test R2 connectivity
wrangler r2 object put websiteunblocker-media/test.txt --file=test.txt --env=production

# Check bucket permissions in Cloudflare Dashboard
# Workers & Pages > websiteunblocker > R2 > Edit bucket
```

---

## Runtime Errors

### Error: 502 Bad Gateway

**Symptoms**:
Site returns 502 errors randomly

**Possible Causes**:

1. **CPU limit exceeded**
   - Check Workers Analytics for CPU time
   - Solution: Optimize heavy functions, add caching

2. **D1 query timeout**
   - Solution: Add query indexes, optimize queries

3. **R2 operation timeout**
   - Solution: Use smaller file chunks, implement resumable uploads

### Error: Request body too large

**Symptoms**:
```
Error: Request body too large
```

**Solution**:

This is configured in `next.config.ts`:

```ts
// Increase server action body size limit
serverActions: {
  bodySizeLimit: '5mb', // Default is 2mb
}
```

### Error: CSRF token mismatch

**Symptoms**:
Admin panel login fails with CSRF error

**Solution**:

```bash
# Verify PAYLOAD_SECRET is consistent across all environments
wrangler secret list --env production

# Clear browser cookies and try again
# If issue persists, regenerate PAYLOAD_SECRET
wrangler secret put PAYLOAD_SECRET --env production
# Then re-run migrations
```

---

## Performance Issues

### Slow page loads

**Diagnosis**:

```bash
# Check CPU time in Cloudflare Dashboard
# Workers & Pages > websiteunblocker > Analytics

# Enable timing logs
# Set DEBUG=true temporarily (not in production)
```

**Solutions**:

1. **Enable Cloudflare Cache**
   - Add Cache-Control headers
   - Use ISR (Incremental Static Regeneration)

2. **Optimize images**
   - Use WebP format
   - Implement responsive images

3. **Minimize D1 queries**
   - Add indexes
   - Use prepared statements
   - Cache results in Workers KV

### High CPU usage

**Diagnosis**:

```bash
# Check CPU time per request in Workers Analytics
# Normal: < 10ms
# Warning: 10-30ms
# Critical: > 30ms
```

**Solutions**:

1. **Move heavy computation to build time**
2. **Use edge caching for expensive operations**
3. **Implement request coalescing**

---

## Local Development Issues

### Error: Port 3000 already in use

**Solution**:

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 pnpm run dev
```

### Error: Local D1 database not found

**Solution**:

```bash
# Reset local D1 database
rm -rf .wrangler/state/v3/d1/
pnpm payload migrate
```

### Hot reload not working

**Solution**:

```bash
# Clean restart
pnpm run devsafe

# Regenerate import map
pnpm run generate:importmap
```

---

## Getting Help

If none of the solutions work:

1. **Check Cloudflare Status**: https://www.cloudflarestatus.com/
2. **Check Wrangler version**: `wrangler --version` (should be 4.x)
3. **Enable debug logging**: Set `DEBUG=*` temporarily
4. **Check real-time logs**: `wrangler tail websiteunblocker --env=production`
5. **Review build output**: Check GitHub Actions logs or local build output

### Useful Commands

```bash
# Real-time logs from production
wrangler tail websiteunblocker --env=production

# Test database connection
wrangler d1 execute D1 --env=production --remote --command "SELECT 1"

# Check deployment status
wrangler pages deployment list --project-name=websiteunblocker

# View current configuration
wrangler pages project list
```

---

## Emergency Procedures

### Immediate Rollback

```bash
# Via CLI
wrangler pages deployment rollback --project-name=websiteunblocker

# Or restore previous deployment from Dashboard
# Workers & Pages > websiteunblocker > Deployments > Rollback
```

### Restore Database from Backup

```bash
# List backups
wrangler r2 object list websiteunblocker-media/backups --env=production

# Download backup
wrangler r2 object get websiteunblocker-media/backups/backup_YYYYMMDD_HHMMSS.sql --file=restore.sql --env=production

# Restore (DESTRUCTIVE - creates new database)
# In Cloudflare Dashboard: D1 > websiteunblocker-db > Restore from backup
```
