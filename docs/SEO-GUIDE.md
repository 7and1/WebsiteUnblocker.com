# SEO Implementation Guide

WebsiteUnblocker.com - Comprehensive SEO documentation and implementation guide.

## Table of Contents

- [Overview](#overview)
- [Meta Tags Strategy](#meta-tags-strategy)
- [Structured Data](#structured-data)
- [Sitemap Generation](#sitemap-generation)
- [Robots.txt Configuration](#robotstxt-configuration)
- [Open Graph Implementation](#open-graph-implementation)
- [Canonical URLs](#canonical-urls)
- [Programmatic SEO](#programmatic-seo)

---

## Overview

This guide covers the complete SEO implementation for WebsiteUnblocker.com, including meta tags, structured data, sitemaps, and programmatic SEO pages.

---

## Meta Tags Strategy

### Homepage Metadata

```typescript
// src/app/(frontend)/page.tsx
export const metadata = buildMetadata({
  title: 'Website Unblocker - Check & Unblock Any Website Free',
  description: 'Free tool to check if websites are blocked. Instantly diagnose and get solutions to unblock YouTube, Twitter, TikTok and more.',
  path: '/',
})
```

### Title Tag Formula

**Template:** `[Primary Keyword]: [Benefit/Hook] | WebsiteUnblocker`

| Page Type | Template | Character Limit |
|-----------|----------|-----------------|
| Homepage | `[Keyword] - [Value Prop] | Brand` | 50-60 |
| Unblock Guide | `How to Unblock [Site] in 2026 [Methods] | Brand` | 50-60 |
| Blocked Check | `Is [Site] Blocked in [Country]? [Status] | Brand` | 50-60 |
| VPN Review | `[VPN] Review 2026: [Key Benefit] | Brand` | 50-60 |
| Comparison | `[VPN A] vs [VPN B]: [Differentiator] | Brand` | 50-60 |

### Meta Description Formula

**Template:** `[Action verb] [topic]. [Specific value]: [item 1], [item 2], [item 3]. [CTA].`

| Page Type | Template | Character Limit |
|-----------|----------|-----------------|
| Homepage | `Discover if websites are blocked. Free tool checks: YouTube, Netflix, Twitter. Get solutions instantly.` | 150-160 |
| Unblock Guide | `Learn how to unblock [Site] with proven methods. Covers: VPN setup, proxy sites, DNS changes. Works worldwide.` | 150-160 |
| Blocked Check | `Check if [Site] is blocked in [Country]. Current status, why it's blocked, and ways to access it safely.` | 150-160 |

### Implementation

```typescript
// src/lib/seo/index.ts

export interface BuildMetadataOptions {
  title: string
  description?: string
  path?: string
  images?: Array<{ url: string; width?: number; height?: number; alt?: string }>
  ogType?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  keywords?: string[]
  noIndex?: boolean
}

export function buildMetadata(options: BuildMetadataOptions): Metadata {
  const { title, description, path, ogType = 'website', noIndex = false } = options

  return {
    title,
    description,
    keywords: options.keywords?.join(', '),
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: path ? absoluteUrl(path, siteConfig.url) : siteConfig.url,
    },
    openGraph: {
      type: ogType,
      url: path ? absoluteUrl(path, siteConfig.url) : siteConfig.url,
      siteName: siteConfig.name,
      title,
      description,
      images: options.images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@websiteunblocker',
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  }
}
```

---

## Structured Data

### WebSite Schema

```typescript
// src/lib/seo/index.ts

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': {
        '@type': 'PropertyValueSpecification',
        valueRequired: true,
        valueName: 'search_term_string',
      },
    },
  }
}
```

### Organization Schema

```typescript
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/logo.png', siteConfig.url),
      width: 512,
      height: 512,
    },
    description: siteConfig.description,
    sameAs: [siteConfig.social.twitter],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: siteConfig.contact.email,
    },
  }
}
```

### FAQPage Schema

```typescript
export function buildFaqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}
```

### SoftwareApplication Schema

```typescript
export function buildSoftwareApplicationSchema(options: {
  name: string
  description: string
  category?: string
  price?: string
  rating?: number
  ratingCount?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: options.name,
    applicationCategory: options.category || 'UtilitiesApplication',
    operatingSystem: 'Web',
    description: options.description,
    offers: {
      '@type': 'Offer',
      price: options.price || '0',
      priceCurrency: 'USD',
    },
    ...(options.rating &&
      options.ratingCount && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: options.rating.toString(),
          ratingCount: options.ratingCount.toString(),
          bestRating: '5',
          worstRating: '1',
        },
      }),
  }
}
```

### Article Schema

```typescript
export function buildArticleSchema(options: {
  title: string
  description?: string
  slug: string
  datePublished?: string
  dateModified?: string
  author?: string
  image?: string
}) {
  const url = absoluteUrl(`/blog/${options.slug}`, siteConfig.url)
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: options.title,
    description: options.description || siteConfig.description,
    image: options.image ? absoluteUrl(options.image, siteConfig.url) : undefined,
    author: {
      '@type': 'Organization',
      name: options.author || siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logo.png', siteConfig.url),
      },
    },
    mainEntityOfPage: url,
    datePublished: options.datePublished,
    dateModified: options.dateModified || options.datePublished,
  }
}
```

### Breadcrumb Schema

```typescript
export function buildBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, siteConfig.url),
    })),
  }
}
```

### HowTo Schema

```typescript
export function buildHowToSchema(options: {
  name: string
  description: string
  steps: Array<{ name: string; text: string; image?: string }>
  tool?: string[]
  supply?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: options.name,
    description: options.description,
    ...(options.tool && { tool: options.tool }),
    ...(options.supply && { supply: options.supply }),
    step: options.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: absoluteUrl(step.image, siteConfig.url) }),
    })),
  }
}
```

### Product Schema (VPN Reviews)

```typescript
export function buildProductSchema(options: {
  name: string
  description: string
  image?: string
  price: string
  priceCurrency?: string
  rating?: number
  reviewCount?: number
  brand?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: options.name,
    description: options.description,
    image: options.image ? absoluteUrl(options.image, siteConfig.url) : undefined,
    brand: {
      '@type': 'Brand',
      name: options.brand || options.name,
    },
    offers: {
      '@type': 'Offer',
      price: options.price.replace(/[^\d.]/g, ''),
      priceCurrency: options.priceCurrency || 'USD',
      availability: 'https://schema.org/InStock',
    },
    ...(options.rating &&
      options.reviewCount && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: options.rating.toString(),
          reviewCount: options.reviewCount.toString(),
          bestRating: '10',
          worstRating: '1',
        },
      }),
  }
}
```

---

## Sitemap Generation

### Dynamic Sitemap

```typescript
// src/app/api/sitemap/route.ts

import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { siteConfig } from '@/config/site'

export const runtime = 'edge'

export async function GET() {
  const payload = await getPayload({ config: configPromise })

  // Get all posts
  const posts = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 1000,
  })

  // Get all pages
  const pages = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1000,
  })

  const baseUrl = siteConfig.url

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/unblock`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vpn`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ]

  const postUrls = posts.docs.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const pageUrls = pages.docs.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: new Date(page.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const allUrls = [...staticPages, ...postUrls, ...pageUrls]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls
    .map(
      (url) => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastModified.toISOString()}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join('\n')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  })
}
```

---

## Robots.txt Configuration

```typescript
// src/app/api/robots/route.ts

import { NextResponse } from 'next/server'
import { siteConfig } from '@/config/site'

export const runtime = 'edge'

export function GET() {
  const robotsTxt = `
User-agent: *
Allow: /

# Block admin and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /_next/

# Sitemap location
Sitemap: ${siteConfig.url}/sitemap.xml
`.trim()

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
```

---

## Open Graph Implementation

### Basic OG Tags

```typescript
openGraph: {
  type: 'website',
  locale: 'en_US',
  url: 'https://websiteunblocker.com',
  siteName: 'WebsiteUnblocker',
  title: 'Website Unblocker - Check & Unblock Any Website Free',
  description: 'Free tool to check if websites are blocked...',
  images: [
    {
      url: 'https://websiteunblocker.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'WebsiteUnblocker',
    },
  ],
}
```

### Article OG Tags

```typescript
openGraph: {
  type: 'article',
  publishedTime: '2026-01-15T08:00:00Z',
  modifiedTime: '2026-01-18T10:30:00Z',
  authors: ['WebsiteUnblocker'],
  tags: ['VPN Guide', 'Unblock Websites'],
}
```

### Twitter Card Tags

```typescript
twitter: {
  card: 'summary_large_image',
  title: 'Website Unblocker - Check & Unblock Any Website Free',
  description: 'Free tool to check if websites are blocked...',
  images: ['https://websiteunblocker.com/twitter-image.png'],
  creator: '@websiteunblocker',
  site: '@websiteunblocker',
}
```

---

## Canonical URLs

### Canonical Helper

```typescript
// src/lib/seo/canonical.ts

import { siteConfig } from '@/config/site'

export function getCanonicalUrl(path: string): string {
  const cleanPath = path.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
  return `${siteConfig.url}${cleanPath}`
}

// Usage in page
export async function generateMetadata({ params }) {
  return {
    alternates: {
      canonical: getCanonicalUrl(`/blog/${params.slug}`),
    },
  }
}
```

### Redirect Rules

```typescript
// src/middleware.ts

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()

  // Remove trailing slash
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1)
    return NextResponse.redirect(url, 301)
  }

  // Force lowercase
  if (url.pathname !== url.pathname.toLowerCase()) {
    url.pathname = url.pathname.toLowerCase()
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
}
```

---

## Programmatic SEO

### Unblock Pages

```typescript
// src/lib/seo/programmatic.ts

export function generateUnblockMetadata(options: {
  website: string
  category?: string
  blockedIn?: string[]
}) {
  const { website, category = 'website', blockedIn = [] } = options

  const title = `How to Unblock ${website} - Complete Guide`
  const description = blockedIn.length > 0
    ? `Learn how to unblock ${website} from anywhere. Discover the best VPNs and methods to access ${website} in ${blockedIn.slice(0, 2).join(', ')} and other regions where it's blocked.`
    : `Learn how to unblock ${website} from anywhere. Discover the best VPNs and methods to access ${website} when it's blocked at school, work, or in your region.`

  return buildMetadata({
    title,
    description: description.slice(0, 160),
    path: `/unblock/${website.toLowerCase().replace(/\s+/g, '-')}`,
    keywords: [
      `unblock ${website}`,
      `access ${website}`,
      `${website} VPN`,
      `bypass ${website} block`,
      `${website} blocked`,
    ],
  })
}
```

### VPN Review Pages

```typescript
export function generateVpnMetadata(options: {
  vpn: string
  rating?: number
  price?: string
  highlight?: string
}) {
  const { vpn, rating, price, highlight } = options

  const title = `${vpn} Review ${rating ? `(${rating}/10)` : ''} - Features, Pricing & Performance`
  const description = highlight
    ? `Comprehensive ${vpn} review covering speed, security, and streaming. ${highlight}. Is ${vpn} worth ${price || 'it'}? Read our expert analysis.`
    : `Comprehensive ${vpn} review covering speed, security, streaming, and pricing. Is ${vpn} worth it? Read our expert analysis and comparison.`

  return buildMetadata({
    title,
    description: description.slice(0, 160),
    path: `/vpn/${vpn.toLowerCase().replace(/\s+/g, '-')}`,
    keywords: [
      `${vpn} review`,
      `${vpn} VPN`,
      `best VPN`,
      `VPN comparison`,
      `${vpn} speed`,
      `${vpn} streaming`,
    ],
  })
}
```

### Comparison Pages

```typescript
export function generateComparisonMetadata(options: {
  vpn1: string
  vpn2: string
  focus?: 'speed' | 'price' | 'streaming' | 'privacy' | 'overall'
}) {
  const { vpn1, vpn2, focus = 'overall' } = options

  const title = `${vpn1} vs ${vpn2}: Which VPN is Better in 2026?`
  const description = `Compare ${vpn1} vs ${vpn2} side by side. We analyze features, speed, and value to help you choose the right VPN for your needs.`

  return buildMetadata({
    title,
    description: description.slice(0, 160),
    path: `/compare/${vpn1.toLowerCase().replace(/\s+/g, '-')}-vs-${vpn2.toLowerCase().replace(/\s+/g, '-')}`,
    keywords: [
      `${vpn1} vs ${vpn2}`,
      `${vpn2} vs ${vpn1}`,
      `compare ${vpn1}`,
      `compare ${vpn2}`,
      `which VPN is better`,
      `VPN comparison`,
    ],
  })
}
```

### Country-Specific Pages

```typescript
export function generateCountryMetadata(options: {
  country: string
  code?: string
  needsVPN?: boolean
  region?: string
}) {
  const { country, code = '', needsVPN = false, region = '' } = options

  const title = `Best VPN for ${country} - Top Picks for ${code || country}`
  const description = needsVPN
    ? `Discover the best VPNs for ${country} to bypass censorship and access blocked content. Our expert picks for privacy, speed, and reliability.`
    : `Discover the best VPN services for ${country}. Our expert picks for privacy, speed, and reliability with servers in ${region || country}.`

  return buildMetadata({
    title,
    description: description.slice(0, 160),
    path: `/vpn/${country.toLowerCase().replace(/\s+/g, '-')}`,
    keywords: [
      `VPN ${country}`,
      `best VPN ${country}`,
      `${code} VPN`,
      `VPN in ${country}`,
      needsVPN ? `censorship ${country}` : `privacy ${country}`,
    ],
  })
}
```

---

## Best Practices

### Title Tag Checklist

- 50-60 characters maximum
- Primary keyword in first half
- Include year for freshness
- Add brackets for CTR boost ([Working], [2026])
- End with brand name

### Meta Description Checklist

- 150-160 characters maximum
- Start with action verb
- Include primary keyword naturally
- List 3 specific items
- End with implied CTA

### Heading Hierarchy

```
H1: One per page, contains primary keyword
  |
  +-- H2: Main sections, question format when possible
       |
       +-- H3: Subsections under H2
            |
            +-- H4: Rarely used, for deep nesting only
```

### Image Optimization

```tsx
import Image from 'next/image'

<Image
  src="/og-image.png"
  alt="Website Unblocker Tool"
  width={1200}
  height={630}
  priority
/>
```

---

*Last updated: January 18, 2026*
