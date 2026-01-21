# Documentation Index

Complete reference for all WebsiteUnblocker.com documentation.

---

## Quick Start

- **New to the project?** Start with [SETUP.md](./SETUP.md)
- **Deploying to production?** See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Setting up Cloudflare?** See [CLOUDFLARE-SETUP.md](./CLOUDFLARE-SETUP.md)

---

## Core Documentation

### Getting Started

| Document | Description |
|----------|-------------|
| [SETUP.md](./SETUP.md) | Initial project setup and local development |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture and technical decisions |
| [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) | UI/UX patterns and component library |

### Development

| Document | Description |
|----------|-------------|
| [COMPONENTS.md](./COMPONENTS.md) | Component catalog and usage examples |
| [ROUTING.md](./ROUTING.md) | Route structure and page organization |
| [TESTING.md](./TESTING.md) | Testing strategies and procedures |

### Deployment & Operations

| Document | Description |
|----------|-------------|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Complete deployment guide for Cloudflare |
| [CLOUDFLARE-SETUP.md](./CLOUDFLARE-SETUP.md) | Cloudflare resources setup (D1, R2, KV) |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | Environment variables reference |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues and solutions |
| [MAINTENANCE.md](./MAINTENANCE.md) | Ongoing maintenance procedures |

### API Documentation

| Document | Description |
|----------|-------------|
| [API.md](./API.md) | Quick API reference |
| [API-DESIGN.md](./API-DESIGN.md) | Detailed API documentation with examples |

### Content & SEO

| Document | Description |
|----------|-------------|
| [CONTENT-PLAN.md](./CONTENT-PLAN.md) | Content strategy and editorial calendar |
| [SEO-GUIDE.md](./SEO-GUIDE.md) | SEO best practices for the site |
| [SEO-STRATEGY.md](./SEO-STRATEGY.md) | Overall SEO strategy and keyword planning |

### Planning

| Document | Description |
|----------|-------------|
| [BLUEPRINT.md](./BLUEPRINT.md) | Project blueprint and requirements |
| [MODULE-SPECS.md](./MODULE-SPECS.md) | Feature module specifications |
| [ROADMAP.md](./ROADMAP.md) | Development roadmap and milestones |

---

## Operational Scripts

| Script | Location | Purpose |
|--------|----------|---------|
| Deploy | `./scripts/deploy.sh` | Full deployment with validation and health checks |
| Backup | `./scripts/backup.sh` | Database backup to R2 storage |
| Health Check | `./scripts/health-check.sh` | Comprehensive system health monitoring |
| Rollback | `./scripts/rollback.sh` | Rollback to previous deployment |

### Script Usage

```bash
# Deployment
./scripts/deploy.sh production
./scripts/deploy.sh staging

# Health Check
./scripts/health-check.sh production

# Backup
./scripts/backup.sh production

# Rollback
./scripts/rollback.sh production
```

---

## NPM Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server |
| `pnpm run devsafe` | Clean start development server |
| `pnpm run build` | Build for production |
| `pnpm run start` | Start production server |
| `pnpm run deploy` | Deploy to Cloudflare |
| `pnpm run health` | Run health checks |
| `pnpm run rollback` | Rollback deployment |
| `pnpm run backup` | Create database backup |
| `pnpm run test` | Run unit tests |
| `pnpm run test:e2e` | Run E2E tests with Playwright |
| `pnpm run lint` | Run ESLint |
| `pnpm run typecheck` | Run TypeScript type checking |

---

## Environment Quick Reference

### Required Variables

```bash
PAYLOAD_SECRET=              # Generate: openssl rand -hex 32
CLOUDFLARE_ACCOUNT_ID=       # From Cloudflare Dashboard
CLOUDFLARE_API_TOKEN=        # From Cloudflare API Tokens page
D1_DATABASE_ID=              # From wrangler d1 list
```

### Application Variables

```bash
NODE_ENV=production
NEXT_PUBLIC_SERVER_URL=https://websiteunblocker.com
```

### Environment Selection

```bash
CLOUDFLARE_ENV=production    # or 'staging'
```

---

## Cloudflare Resources

| Resource | Binding | Purpose |
|----------|---------|---------|
| D1 Database | `D1` | SQLite database for content |
| R2 Bucket | `R2` | Media storage |
| Workers KV | `CACHE` | Optional caching layer |

---

## Common Workflows

### Deploy a New Feature

1. Create feature branch
2. Make changes and test locally
3. Run `pnpm run test:all`
4. Commit and push
5. Merge to main (triggers CI/CD)

### Update Environment Variables

1. Add to `.env.example` first
2. For secrets: `wrangler secret put VAR_NAME --env production`
3. For vars: Edit `wrangler.jsonc` or use dashboard

### Create a Migration

```bash
pnpm payload migrate:create migration_name
# Edit migration file
CLOUDFLARE_ENV=production pnpm run deploy:database
```

### Emergency Rollback

```bash
./scripts/rollback.sh production
```

---

## Support & Resources

- **GitHub Issues**: Report bugs and feature requests
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **Next.js Docs**: https://nextjs.org/docs
- **Payload CMS Docs**: https://payloadcms.com/docs

---

## Document Conventions

- Code blocks use shell syntax for commands
- File paths are relative to project root
- HTTP examples use `curl` for compatibility
- TypeScript types use explicit interfaces
- All scripts include error handling

---

Last updated: 2025-01-19
