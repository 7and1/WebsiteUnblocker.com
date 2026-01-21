# Environment Variables Reference

Complete reference for all environment variables used in WebsiteUnblocker.com.

---

## Required Variables

### Cloudflare Account Settings

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `CLOUDFLARE_ACCOUNT_ID` | string | Your Cloudflare account identifier | `abc123def456` |
| `CLOUDFLARE_API_TOKEN` | string | API token with Workers/Pages/D1/R2 permissions | `yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `CLOUDFLARE_ENV` | string | Deployment environment | `production` or `staging` |

### Application Settings

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `NODE_ENV` | string | Node runtime environment | `production` |
| `PAYLOAD_SECRET` | string | Encryption secret for Payload CMS (32+ chars) | `a1b2c3d4e5f6...` |
| `NEXT_PUBLIC_SERVER_URL` | string | Public URL of the application | `https://websiteunblocker.com` |

### Database & Storage

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `D1_DATABASE_ID` | string | D1 database UUID | `05c32934-e1de-4a93-8fad-ab65f69b1a39` |
| `R2_BUCKET_NAME` | string | R2 bucket for media storage | `websiteunblocker-media` |

---

## Optional Variables

### Analytics

| Variable | Type | Description | Default |
|----------|------|-------------|---------|
| `NEXT_PUBLIC_GA_ID` | string | Google Analytics 4 Measurement ID | - |
| `NEXT_PUBLIC_SENTRY_DSN` | string | Sentry error tracking DSN | - |

### Proxy API

| Variable | Type | Description | Default |
|----------|------|-------------|---------|
| `PROXY_RATE_LIMIT_PER_MINUTE` | number | Requests per minute per IP | `30` |
| `PROXY_RATE_LIMIT_BURST` | number | Burst size for rate limiting | `10` |

### Development

| Variable | Type | Description | Default |
|----------|------|-------------|---------|
| `DEBUG` | boolean | Enable verbose logging | `false` |
| `PORT` | number | Development server port | `3000` |

---

## Environment-Specific Values

### Production

```bash
NODE_ENV=production
CLOUDFLARE_ENV=production
NEXT_PUBLIC_SERVER_URL=https://websiteunblocker.com
```

### Staging

```bash
NODE_ENV=production
CLOUDFLARE_ENV=staging
NEXT_PUBLIC_SERVER_URL=https://staging.websiteunblocker.com
```

### Local Development

```bash
NODE_ENV=development
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

---

## Setting Secrets

### Via Wrangler CLI

```bash
# Set PAYLOAD_SECRET for production
wrangler secret put PAYLOAD_SECRET --env production
# Paste: <output of openssl rand -hex 32>

# Set PAYLOAD_SECRET for staging
wrangler secret put PAYLOAD_SECRET --env staging
# Paste: <different output of openssl rand -hex 32>

# List all secrets
wrangler secret list --env production

# Bulk upload secrets from file
wrangler secret bulk .dev.vars --env production
```

### Via Cloudflare Dashboard

1. Navigate to Workers & Pages
2. Select your project (websiteunblocker)
3. Go to Settings > Variables and Secrets
4. Add environment variables and secrets

### Local Development (`.dev.vars`)

Create `.dev.vars` in project root (gitignored):

```bash
# Generate a secret for local development
PAYLOAD_SECRET=local_dev_secret_min_32_chars_xxxxxx

# Cloudflare credentials (optional, for local wrangler commands)
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
```

---

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as a template
2. **Use different secrets per environment** - Staging and production should have unique `PAYLOAD_SECRET` values
3. **Rotate secrets regularly** - Update `PAYLOAD_SECRET` every 90 days
4. **Limit API token permissions** - Only grant necessary permissions
5. **Use strong random secrets** - Always use `openssl rand -hex 32` or similar

---

## Generating Secrets

```bash
# Generate PAYLOAD_SECRET (32 bytes = 64 hex chars)
openssl rand -hex 32

# Alternative with Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Alternative with Python
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Troubleshooting

### PAYLOAD_SECRET errors

**Error**: `Invalid CSRF token`

**Solution**: Ensure `PAYLOAD_SECRET` is:
- Exactly 32+ bytes (64+ hex characters)
- The same value used during migration
- Set correctly in all environments

### Environment variable not found

**Error**: `process.env.XXX is undefined`

**Solution**:
1. Check `wrangler.jsonc` has the variable in `vars` section
2. For secrets, use `wrangler secret put` instead
3. Restart deployment after adding variables

### D1 connection errors

**Error**: `D1 binding not found`

**Solution**:
1. Verify `D1_DATABASE_ID` is correct
2. Check `wrangler.jsonc` `d1_databases` binding configuration
3. Ensure database exists: `wrangler d1 list`
