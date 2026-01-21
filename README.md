# WebsiteUnblocker.com

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.4-black)](https://nextjs.org/)
[![Payload CMS](https://img.shields.io/badge/Payload-3.63-red)](https://payloadcms.com/)

A full-stack website unblocker tool built with Next.js 15, Payload CMS 3.0, and deployed on Cloudflare Workers with D1 database and R2 storage.

## Features

- **Website Diagnosis Tool**: Edge-based API that instantly checks website accessibility from Cloudflare's global network
- **Content Management**: Payload CMS 3.0 for managing blog posts, pages, and media
- **SEO-Optimized**: Programmatic SEO pages, structured data, and Open Graph support
- **Performance**: Edge caching, ISR, and code splitting for optimal Core Web Vitals
- **Security**: Rate limiting, input validation, and security headers via middleware

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | Next.js | 15.4.10 |
| **UI** | React | 19.0.0 |
| **Language** | TypeScript | 5.7.3 |
| **CMS** | Payload CMS | 3.63.0 |
| **Database** | Cloudflare D1 (SQLite) | - |
| **Storage** | Cloudflare R2 | - |
| **Deployment** | Cloudflare Pages/Workers | - |
| **Adapter** | OpenNext for Cloudflare | 1.11.0 |
| **Styling** | Tailwind CSS | 3.4.10 |
| **Icons** | Lucide React | 0.460.0 |

## Architecture

```
┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│                 │     │                     │     │                 │
│   Browser/User  +────>+   Cloudflare Edge  +────>+   D1 Database   │
│                 │     │   (Workers + Pages)  │     │   (SQLite)      │
└─────────────────┘     └──────────┬──────────┘     └─────────────────┘
                                   │
                                   │
                        ┌──────────┴──────────┐
                        │                     │
                   ┌────▼────┐          ┌────▼────┐
                   │   R2    │          │  KV     │
                   │  Media  │          │ Cache   │
                   └─────────┘          └─────────┘
```

## Quick Start

### Prerequisites

- Node.js 18.20.2 or 20.9+
- pnpm 9 or 10
- Cloudflare account with Wrangler CLI

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd WebsiteUnblocker.com

# Install dependencies
pnpm install

# Generate types
pnpm run generate:types
```

### Environment Setup

Create a `.dev.vars` file for local development:

```bash
# Required for Payload CMS
PAYLOAD_SECRET=your-random-32-char-hex-string

# Optional: Affiliate tracking
AFF_NORDVPN=your-affiliate-id
AFF_EXPRESSVPN=your-affiliate-id
AFF_SURFSHARK=your-affiliate-id
```

Generate a secure secret:

```bash
openssl rand -hex 32
```

### Local Development

```bash
# Start development server
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
websiteunblocker.com/
├── src/
│   ├── app/
│   │   ├── (frontend)/           # Public-facing pages
│   │   │   ├── page.tsx          # Homepage with diagnosis tool
│   │   │   ├── blog/             # Blog listing and posts
│   │   │   ├── unblock/          # Unblock guides
│   │   │   ├── vpn/              # VPN reviews and comparisons
│   │   │   └── tools/            # Additional tools
│   │   ├── (payload)/            # Payload admin routes
│   │   │   └── admin/[[...segments]]/
│   │   ├── api/                  # API routes
│   │   │   ├── check/            # Website checker endpoint
│   │   │   ├── contact/          # Contact form
│   │   │   ├── health/           # Health check
│   │   │   ├── ip/               # IP detection
│   │   │   ├── robots/           # robots.txt
│   │   │   └── sitemap/          # Dynamic sitemap
│   │   └── layout.tsx            # Root layout
│   ├── collections/              # Payload CMS collections
│   │   ├── Posts.ts              # Blog posts
│   │   ├── Pages.ts              # Static pages
│   │   ├── Media.ts              # Media library
│   │   ├── Users.ts              # Admin users
│   │   └── ContactSubmissions.ts # Contact form submissions
│   ├── components/
│   │   ├── features/             # Feature components
│   │   │   ├── DiagnosisTool/    # Main tool
│   │   │   ├── BlogCard.tsx      # Post cards
│   │   │   ├── CTABanner.tsx     # Call-to-action
│   │   │   ├── ContactForm.tsx   # Contact form
│   │   │   ├── IpChecker.tsx     # IP checker tool
│   │   │   └── SpeedTest.tsx     # Speed test tool
│   │   ├── layout/               # Layout components
│   │   ├── seo/                  # SEO components
│   │   └── ui/                   # UI components
│   ├── config/
│   │   └── site.ts               # Site configuration
│   ├── lib/
│   │   ├── api/                  # API utilities
│   │   ├── cache/                # Caching utilities
│   │   ├── content/              # Content data
│   │   ├── logger.ts             # Logging utility
│   │   ├── seo/                  # SEO helpers
│   │   └── utils/                # General utilities
│   ├── services/                 # Business logic
│   ├── repositories/             # Data access layer
│   ├── errors/                   # Error classes
│   ├── middleware.ts             # Next.js middleware
│   └── payload.config.ts         # Payload CMS configuration
├── docs/
│   ├── INDEX.md                  # Documentation index
│   ├── ARCHITECTURE.md           # System architecture
│   ├── API.md                    # API quick reference
│   ├── API-DESIGN.md             # Detailed API documentation
│   ├── COMPONENTS.md             # Component specifications
│   ├── SEO-GUIDE.md              # SEO implementation guide
│   ├── DEPLOYMENT.md             # Deployment guide
│   ├── CLOUDFLARE-SETUP.md       # Cloudflare resources setup
│   ├── ENVIRONMENT.md            # Environment variables reference
│   ├── TROUBLESHOOTING.md        # Common issues and solutions
│   ├── SETUP.md                  # Environment setup guide
│   ├── MAINTENANCE.md            # Maintenance runbook
│   └── TESTING.md                # Testing strategy
├── scripts/                      # Operational scripts
│   ├── deploy.sh                 # Deployment script
│   ├── backup.sh                 # Database backup
│   ├── health-check.sh           # Health monitoring
│   └── rollback.sh               # Rollback script
├── public/                       # Static assets
├── wrangler.jsonc                # Cloudflare configuration
├── payload.config.ts             # Payload configuration
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

## Available Scripts

### Development

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm devsafe` | Clean build and start dev server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript type checking |

### Deployment

| Script | Description |
|--------|-------------|
| `pnpm deploy` | Deploy using automated script |
| `pnpm deploy:app` | Build and deploy application only |
| `pnpm deploy:database` | Run database migrations |
| `pnpm backup` | Backup database to R2 |
| `pnpm rollback` | Rollback to previous deployment |
| `pnpm health` | Run health checks |
| `pnpm preview` | Preview deployment locally |

### Testing & Generation

| Script | Description |
|--------|-------------|
| `pnpm test` | Run all tests |
| `pnpm test:unit` | Run unit tests only |
| `pnpm test:e2e` | Run E2E tests with Playwright |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm generate:types` | Generate all TypeScript types |
| `pnpm generate:importmap` | Generate Payload import map |

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `PAYLOAD_SECRET` | Secret for Payload CMS authentication | `openssl rand -hex 32` |
| `CLOUDFLARE_ENV` | Deployment environment | `production` or `staging` |

### Optional (Affiliate Tracking)

| Variable | Description |
|----------|-------------|
| `AFF_NORDVPN` | NordVPN affiliate ID |
| `AFF_EXPRESSVPN` | ExpressVPN affiliate ID |
| `AFF_SURFSHARK` | Surfshark affiliate ID |

### Cloudflare Bindings (Auto-injected)

| Binding | Type | Description |
|---------|------|-------------|
| `D1` | D1 Database | SQLite database binding |
| `R2` | R2 Bucket | Media storage binding |
| `ASSETS` | Assets | Static assets binding |
| `CACHE` | KV Namespace | Cache storage (optional) |

## Cloudflare Setup

### 1. Create D1 Database

```bash
npx wrangler d1 create websiteunblocker-db
```

Copy the database ID and update `wrangler.jsonc`:

```json
{
  "d1_databases": [
    {
      "binding": "D1",
      "database_id": "<your-database-id>",
      "database_name": "websiteunblocker-db",
      "remote": true
    }
  ]
}
```

### 2. Create R2 Bucket

```bash
npx wrangler r2 bucket create websiteunblocker-media
```

### 3. Set Production Secret

```bash
npx wrangler secret put PAYLOAD_SECRET --env production
```

### 4. Deploy

```bash
# Automated deployment (recommended)
./scripts/deploy.sh production

# Manual deployment steps
CLOUDFLARE_ENV=production pnpm run deploy:database
CLOUDFLARE_ENV=production pnpm run deploy:app

# Backup database
./scripts/backup.sh production
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete deployment documentation.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/check` | GET | Check website accessibility |
| `/api/contact` | POST | Submit contact form |
| `/api/health` | GET | Health check |
| `/api/ip` | GET | Get client IP address |
| `/api/robots` | GET | robots.txt |
| `/api/sitemap` | GET | XML sitemap |
| `/api/posts` | GET | Blog posts (Payload) |
| `/api/pages` | GET | Static pages (Payload) |

See [docs/API.md](docs/API.md) for full API documentation.

## Core Features

### Website Diagnosis Tool

The main feature allows users to check if websites are accessible:

- Edge execution via Cloudflare Workers
- 5-second timeout for checks
- Automatic retry with exponential backoff
- Detailed status categorization (blocked, timeout, DNS error, etc.)
- Rate limiting (100 requests/minute per IP)

### Content Management

Payload CMS provides:

- Admin panel at `/admin`
- Rich text editor with Lexical
- Media management with R2 storage
- User authentication
- REST and GraphQL APIs

### SEO Implementation

- Dynamic meta tags and Open Graph
- Structured data (JSON-LD)
- XML sitemap generation
- robots.txt
- Canonical URLs
- Programmatic SEO pages

See [docs/SEO-GUIDE.md](docs/SEO-GUIDE.md) for SEO details.

## Development Guidelines

### Code Style

- TypeScript strict mode enabled
- ESLint for linting
- Prettier for formatting (configured in `.prettierrc`)
- Conventional commits for commit messages

### Component Guidelines

- Use Server Components by default
- Add `'use client'` only when necessary
- Implement proper loading states
- Include ARIA attributes for accessibility
- Write unit tests for utilities and services

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- Documentation: [docs/INDEX.md](docs/INDEX.md) - Complete documentation index
- Deployment Guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- Environment Setup: [docs/CLOUDFLARE-SETUP.md](docs/CLOUDFLARE-SETUP.md)
- Troubleshooting: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- Issues: GitHub Issues
- Contact: support@websiteunblocker.com

## Acknowledgments

- [Payload CMS](https://payloadcms.com/) - Headless CMS framework
- [Cloudflare](https://cloudflare.com/) - Edge computing platform
- [Vercel](https://vercel.com/) - Next.js framework
- [OpenNext](https://opennext.js.org/) - Cloudflare adapter
