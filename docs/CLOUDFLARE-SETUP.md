# Cloudflare Workers Setup Guide

Complete guide for setting up Cloudflare resources (D1, R2, KV) for WebsiteUnblocker.com.

---

## Prerequisites

- Cloudflare account (free tier works)
- Domain managed by Cloudflare
- Wrangler CLI installed: `pnpm add -g wrangler` or `npm install -g wrangler`

---

## 1. Initial Setup

### 1.1 Install Wrangler

```bash
# Using pnpm (recommended)
pnpm add -g wrangler

# Or using npm
npm install -g wrangler

# Verify installation
wrangler --version
```

### 1.2 Authenticate

```bash
# Interactive login (opens browser)
wrangler login

# Verify authentication
wrangler whoami
```

---

## 2. D1 Database Setup

### 2.1 Create D1 Database

```bash
# Create production database
wrangler d1 create websiteunblocker-db

# Expected output:
# Database created! Here are your credentials:
# database_id = "05c32934-e1de-4a93-8fad-ab65f69b1a39"
```

### 2.2 Create Staging Database (Optional)

```bash
# Create staging database
wrangler d1 create websiteunblocker-db-staging

# Save the database_id for staging configuration
```

### 2.3 Configure Database in wrangler.jsonc

Edit `/Volumes/SSD/skills/server-ops/vps/107.174.42.198/heavy-tasks/WebsiteUnblocker.com/wrangler.jsonc`:

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

  "d1_databases": [
    {
      "binding": "D1",
      "database_id": "YOUR_DATABASE_ID_HERE",  // Replace with actual ID
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

  "vars": {
    "NODE_ENV": "production",
    "NEXT_PUBLIC_SERVER_URL": "https://websiteunblocker.com"
  },

  "env": {
    "staging": {
      "name": "websiteunblocker-staging",
      "d1_databases": [{
        "binding": "D1",
        "database_id": "STAGING_DATABASE_ID",  // Replace with staging ID
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

### 2.4 Run Initial Migrations

```bash
# Local development (uses .wrangler/state/v3/d1/)
pnpm payload migrate

# Production deployment
CLOUDFLARE_ENV=production \
  cross-env NODE_ENV=production PAYLOAD_SECRET=ignore \
  pnpm payload migrate

# Optimize database after migration
wrangler d1 execute D1 \
  --command "PRAGMA optimize" \
  --env=production \
  --remote
```

---

## 3. R2 Storage Setup

### 3.1 Create R2 Bucket

```bash
# Create production bucket
wrangler r2 bucket create websiteunblocker-media

# Create staging bucket (optional)
wrangler r2 bucket create websiteunblocker-media-staging

# Verify bucket creation
wrangler r2 bucket list
```

### 3.2 Create Backup Directory

```bash
# Create backups folder in the bucket
wrangler r2 object put websiteunblocker-media/backups/.keep --file=/dev/null
```

### 3.3 Test R2 Access

```bash
# Upload a test file
echo "test" > test.txt
wrangler r2 object put websiteunblocker-media/test.txt --file=test.txt

# List objects
wrangler r2 object list websiteunblocker-media

# Delete test file
wrangler r2 object delete websiteunblocker-media/test.txt
```

---

## 4. KV Namespace Setup (Optional)

KV is useful for caching frequently accessed data.

### 4.1 Create KV Namespace

```bash
# Create production KV namespace
wrangler kv namespace create WEBSITEUNBLOCKER_CACHE

# Expected output:
# Binding = WEBSITEUNBLOCKER_CACHE
# id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Create staging namespace
wrangler kv namespace create WEBSITEUNBLOCKER_CACHE --preview
```

### 4.2 Add KV Binding to wrangler.jsonc

```jsonc
{
  "kv_namespaces": [
    {
      "binding": "CACHE",
      "id": "YOUR_KV_NAMESPACE_ID",
      "preview_id": "YOUR_PREVIEW_KV_ID"
    }
  ]
}
```

---

## 5. Environment Variables and Secrets

### 5.1 Set Secrets

```bash
# Generate PAYLOAD_SECRET
openssl rand -hex 32

# Set PAYLOAD_SECRET for production
wrangler secret put PAYLOAD_SECRET --env production
# Paste the generated hex string

# Set PAYLOAD_SECRET for staging
wrangler secret put PAYLOAD_SECRET --env staging
# Paste a DIFFERENT hex string

# List all secrets
wrangler secret list --env production
```

### 5.2 Set Environment Variables

Via `wrangler.jsonc` (already configured):

```jsonc
"vars": {
  "NODE_ENV": "production",
  "NEXT_PUBLIC_SERVER_URL": "https://websiteunblocker.com"
}
```

Or via CLI:

```bash
wrangler put --env production NODE_ENV=production
```

---

## 6. Domain Configuration

### 6.1 Add Custom Domain

```bash
# Add domain to Workers/Pages project
wrangler pages project add-domain websiteunblocker.com

# Add www subdomain
wrangler pages project add-domain websiteunblocker.com --domain www.websiteunblocker.com
```

### 6.2 DNS Configuration

In Cloudflare Dashboard > DNS > Records:

| Type | Name | Content | Proxy | TTL |
|------|------|---------|-------|-----|
| CNAME | @ | websiteunblocker.pages.dev | Proxied | Auto |
| CNAME | www | websiteunblocker.com | Proxied | Auto |

### 6.3 SSL/TLS Configuration

In Cloudflare Dashboard > SSL/TLS:

1. Overview: Set to **Full (strict)**
2. Edge Certificates: Enable **Always Use HTTPS**

---

## 7. Verification

### 7.1 Verify D1 Connection

```bash
# Test query
wrangler d1 execute D1 \
  --env=production \
  --remote \
  --command "SELECT name FROM sqlite_master WHERE type='table'"
```

### 7.2 Verify R2 Connection

```bash
# List objects
wrangler r2 object list websiteunblocker-media
```

### 7.3 Verify Deployment

```bash
# Deploy application
CLOUDFLARE_ENV=production pnpm run deploy

# Check health endpoint
curl https://websiteunblocker.com/api/health
```

---

## 8. Production Checklist

- [ ] D1 database created and ID added to wrangler.jsonc
- [ ] D1 migrations run successfully
- [ ] R2 bucket created for media storage
- [ ] PAYLOAD_SECRET set (unique per environment)
- [ ] Custom domain added and DNS configured
- [ ] SSL/TLS set to Full (strict)
- [ ] Environment variables configured
- [ ] Health endpoint returns 200
- [ ] Admin panel accessible at /admin
- [ ] Automated backups configured

---

## 9. Useful Commands

```bash
# D1 Database Commands
wrangler d1 list                              # List all databases
wrangler d1 info D1                           # Get database info
wrangler d1 execute D1 --command "SQL"        # Execute SQL
wrangler d1 execute D1 --file=query.sql       # Execute SQL file
wrangler d1 export D1 --output=backup.sql     # Export database

# R2 Storage Commands
wrangler r2 bucket list                       # List all buckets
wrangler r2 object list BUCKET                # List bucket objects
wrangler r2 object put BUCKET/key --file=file # Upload file
wrangler r2 object get BUCKET/key --file=file # Download file
wrangler r2 object delete BUCKET/key          # Delete file

# KV Commands
wrangler kv namespace list                    # List namespaces
wrangler kv key list --binding=CACHE          # List keys
wrangler kv key get "KEY" --binding=CACHE     # Get value
wrangler kv key put "KEY" "VALUE" --binding=CACHE # Put value

# Deployment Commands
wrangler pages deploy .open-next/assets       # Manual deploy
wrangler pages deployment list                # List deployments
wrangler tail websiteunblocker --env=prod     # Live logs

# Secret Management
wrangler secret list                          # List secrets
wrangler secret put SECRET_NAME               # Set secret
wrangler secret bulk .dev.vars                # Bulk upload from file
```

---

## 10. Troubleshooting

### Database locked error

D1 has concurrent write limits. If you see this error:

```bash
# Optimize database
wrangler d1 execute D1 --command "PRAGMA optimize" --remote

# Wait and retry the operation
```

### R2 upload failed

```bash
# Verify bucket exists
wrangler r2 bucket list

# Check bucket permissions in Cloudflare Dashboard
```

### Secret not found

```bash
# Verify secret is set
wrangler secret list --env production

# Reset if missing
wrangler secret put PAYLOAD_SECRET --env production
```

---

## Related Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Environment Variables](./ENVIRONMENT.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
