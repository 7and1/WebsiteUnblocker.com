# WebsiteUnblocker.com

Full-stack website unblocker tool built with Next.js 15, Payload CMS 3.0, and Cloudflare D1.

## Stack

- **Frontend**: Next.js 15 (App Router)
- **CMS**: Payload CMS 3.0
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Deployment**: Cloudflare Pages via OpenNext

## Setup

### 1. Create D1 Database

```bash
npx wrangler d1 create websiteunblocker-db
```

Update `wrangler.jsonc` with the database ID.

### 2. Create R2 Bucket

```bash
npx wrangler r2 bucket create websiteunblocker-media
```

### 3. Set Secrets

```bash
npx wrangler secret put PAYLOAD_SECRET
# Enter a random 32-char hex string: openssl rand -hex 32
```

### 4. Install Dependencies

```bash
pnpm install
```

### 5. Generate Types

```bash
pnpm run generate:types
```

### 6. Local Development

```bash
pnpm run dev
```

### 7. Deploy

```bash
CLOUDFLARE_ENV=production pnpm run deploy
```

## Project Structure

```
src/
├── app/
│   ├── (frontend)/      # Public pages
│   │   ├── page.tsx     # Homepage with diagnosis tool
│   │   └── blog/        # Blog posts
│   ├── (payload)/       # Payload admin
│   └── api/
│       └── check/       # Website check API
├── collections/         # Payload collections
├── components/          # React components
│   └── DiagnosisTool.tsx
└── config/
    └── site.ts          # Site configuration
```

## Core Features

1. **Website Diagnosis Tool**: Edge-based API that checks website accessibility
2. **Blog/SEO Content**: Payload CMS managed posts for SEO
3. **Affiliate Integration**: VPN recommendation CTAs

## Affiliate Links

Update `src/config/site.ts` with your affiliate IDs:

```typescript
affiliates: {
  nordvpn: 'https://go.nordvpn.net/aff_c?offer_id=15&aff_id=YOUR_AFF_ID',
}
```
