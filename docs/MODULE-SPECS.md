# Module Specifications

## WebsiteUnblocker.com - Modular Architecture Design

---

## Module Overview

```
src/
├── app/                    # Next.js App Router (Pages)
├── components/             # React Components
│   ├── ui/                 # Primitive UI components
│   ├── features/           # Feature-specific components
│   └── layout/             # Layout components
├── collections/            # Payload CMS Collections
├── lib/                    # Utility libraries
│   ├── utils/              # Pure utility functions
│   ├── hooks/              # React hooks
│   ├── api/                # API client functions
│   └── validation/         # Zod schemas
├── config/                 # Configuration files
└── types/                  # TypeScript type definitions
```

---

## 1. Components Module

### 1.1 UI Components (`src/components/ui/`)

Primitive, reusable UI components with no business logic.

#### Button

```typescript
// src/components/ui/Button.tsx

import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
        outline: 'border border-slate-200 bg-white hover:bg-slate-50',
        ghost: 'hover:bg-slate-100',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        success: 'bg-green-600 text-white hover:bg-green-700',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4',
        lg: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
```

#### Input

```typescript
// src/components/ui/Input.tsx

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-base outline-none transition-colors',
            'placeholder:text-slate-400',
            'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-12',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
```

#### Card

```typescript
// src/components/ui/Card.tsx

import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white shadow-sm',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn('p-6 border-b border-slate-100', className)} {...props} />
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn('p-6', className)} {...props} />
}

export function CardFooter({ className, ...props }: CardProps) {
  return <div className={cn('p-6 pt-0', className)} {...props} />
}
```

#### Badge

```typescript
// src/components/ui/Badge.tsx

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        error: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
```

---

### 1.2 Feature Components (`src/components/features/`)

Business-logic components specific to WebsiteUnblocker.

#### DiagnosisTool (Core)

```typescript
// src/components/features/DiagnosisTool/index.tsx

export { DiagnosisTool } from './DiagnosisTool'
export { DiagnosisInput } from './DiagnosisInput'
export { DiagnosisResult } from './DiagnosisResult'
export { DiagnosisLoading } from './DiagnosisLoading'
export type { CheckResult, DiagnosisState } from './types'
```

```typescript
// src/components/features/DiagnosisTool/types.ts

export type CheckStatus = 'accessible' | 'blocked' | 'error'

export interface CheckResult {
  status: CheckStatus
  code?: number
  latency: number
  target: string
  error?: string
}

export interface DiagnosisState {
  url: string
  loading: boolean
  result: CheckResult | null
  error: string | null
}
```

```typescript
// src/components/features/DiagnosisTool/useDiagnosis.ts

import { useState, useCallback } from 'react'
import { checkWebsite } from '@/lib/api/check'
import type { DiagnosisState, CheckResult } from './types'

export function useDiagnosis() {
  const [state, setState] = useState<DiagnosisState>({
    url: '',
    loading: false,
    result: null,
    error: null,
  })

  const setUrl = useCallback((url: string) => {
    setState((prev) => ({ ...prev, url, error: null }))
  }, [])

  const check = useCallback(async () => {
    if (!state.url.trim()) return

    setState((prev) => ({ ...prev, loading: true, result: null, error: null }))

    try {
      const result = await checkWebsite(state.url.trim())
      setState((prev) => ({ ...prev, loading: false, result }))
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Check failed',
      }))
    }
  }, [state.url])

  const reset = useCallback(() => {
    setState({ url: '', loading: false, result: null, error: null })
  }, [])

  return { state, setUrl, check, reset }
}
```

#### VPNRecommendation

```typescript
// src/components/features/VPNRecommendation/index.tsx

import { Shield, ExternalLink } from 'lucide-react'
import { siteConfig } from '@/config/site'

interface VPNRecommendationProps {
  variant?: 'featured' | 'compact'
}

export function VPNRecommendation({ variant = 'featured' }: VPNRecommendationProps) {
  if (variant === 'compact') {
    return (
      <a
        href={siteConfig.affiliates.nordvpn}
        target="_blank"
        rel="noopener"
        className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
      >
        <Shield className="w-4 h-4" />
        Get NordVPN
        <ExternalLink className="w-3 h-3" />
      </a>
    )
  }

  return (
    <a
      href={siteConfig.affiliates.nordvpn}
      target="_blank"
      rel="noopener"
      className="group flex items-center justify-between p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl hover:shadow-lg transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-green-500 rounded-lg text-white">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <div className="font-bold text-slate-800 flex items-center gap-2">
            NordVPN
            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
              Recommended
            </span>
          </div>
          <div className="text-sm text-slate-600">
            Fastest VPN for streaming & gaming
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg font-bold group-hover:bg-green-700 transition-colors">
          Unblock Now
        </span>
        <ExternalLink className="w-4 h-4 text-green-600" />
      </div>
    </a>
  )
}
```

#### BlogCard

```typescript
// src/components/features/BlogCard/index.tsx

import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'

interface BlogCardProps {
  title: string
  slug: string
  description?: string
  tags?: string[]
  publishedDate?: string
}

export function BlogCard({ title, slug, description, tags, publishedDate }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group p-6 bg-white border border-slate-200 rounded-2xl hover:shadow-lg hover:border-blue-200 transition-all block"
    >
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="default">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
        {title}
      </h3>

      {description && (
        <p className="text-slate-500 text-sm line-clamp-2">{description}</p>
      )}

      {publishedDate && (
        <p className="text-xs text-slate-400 mt-4">
          {new Date(publishedDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      )}
    </Link>
  )
}
```

---

### 1.3 Layout Components (`src/components/layout/`)

```typescript
// src/components/layout/Header.tsx

import Link from 'next/link'
import { Shield, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { siteConfig } from '@/config/site'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
          <Shield className="w-6 h-6 text-blue-600" />
          {siteConfig.name}
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink href="/blog">Guides</NavLink>
          <NavLink href="/tools">Tools</NavLink>
          <Button asChild size="sm" variant="default">
            <a href={siteConfig.affiliates.nordvpn} target="_blank" rel="noopener">
              Get VPN
            </a>
          </Button>
        </nav>

        <MobileMenu />
      </div>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-slate-600 hover:text-slate-900 transition-colors">
      {children}
    </Link>
  )
}
```

---

## 2. Library Module (`src/lib/`)

### 2.1 Utilities (`src/lib/utils/`)

```typescript
// src/lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```typescript
// src/lib/utils/url.ts

export function normalizeUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `https://${url}`
}

export function extractDomain(url: string): string {
  try {
    const parsed = new URL(normalizeUrl(url))
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function isValidUrl(url: string): boolean {
  if (!url || url.length < 3) return false
  if (url.includes(' ')) return false
  if (url.startsWith('javascript:')) return false

  // Basic domain pattern
  const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*(\.[a-zA-Z]{2,})+$/
  const domain = extractDomain(url)

  return domainPattern.test(domain)
}
```

```typescript
// src/lib/utils/format.ts

export function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
```

---

### 2.2 API Client (`src/lib/api/`)

```typescript
// src/lib/api/check.ts

import type { CheckResult } from '@/components/features/DiagnosisTool/types'

export async function checkWebsite(url: string): Promise<CheckResult> {
  const response = await fetch(`/api/check?url=${encodeURIComponent(url)}`)

  if (!response.ok) {
    throw new Error(`Check failed: ${response.status}`)
  }

  return response.json()
}
```

```typescript
// src/lib/api/posts.ts

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getPosts(options?: { limit?: number; page?: number }) {
  const payload = await getPayload({ config: configPromise })

  return payload.find({
    collection: 'posts',
    limit: options?.limit ?? 10,
    page: options?.page ?? 1,
    sort: '-published_date',
  })
}

export async function getPostBySlug(slug: string) {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  return posts.docs[0] ?? null
}
```

---

### 2.3 Validation (`src/lib/validation/`)

```typescript
// src/lib/validation/contact.ts

import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  honeypot: z.string().max(0, 'Bot detected'), // Should be empty
})

export type ContactFormData = z.infer<typeof contactSchema>
```

```typescript
// src/lib/validation/check.ts

import { z } from 'zod'

export const checkParamsSchema = z.object({
  url: z.string().min(1, 'URL is required').refine(
    (val) => !val.startsWith('javascript:'),
    'Invalid URL'
  ),
})
```

---

### 2.4 Hooks (`src/lib/hooks/`)

```typescript
// src/lib/hooks/useLocalStorage.ts

import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
    }
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}
```

```typescript
// src/lib/hooks/useDebounce.ts

import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

---

## 3. Collections Module (`src/collections/`)

Each collection is a self-contained module with:
- Collection config
- Access control
- Hooks (if needed)

```typescript
// src/collections/Posts.ts

import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'published_date', 'tags'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate slug from title if not provided
        if (data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    // ... rest of fields
  ],
}
```

---

## 4. Configuration Module (`src/config/`)

```typescript
// src/config/site.ts

export const siteConfig = {
  name: 'WebsiteUnblocker',
  domain: 'websiteunblocker.com',
  url: 'https://websiteunblocker.com',
  description: 'Free tool to check if websites are blocked...',
  keywords: ['website unblocker', 'unblock websites', ...],
  affiliates: {
    nordvpn: 'https://go.nordvpn.net/aff_c?offer_id=15&aff_id=YOUR_AFF_ID',
    expressvpn: 'https://www.expressvpn.com/aff/YOUR_AFF_ID',
    surfshark: 'https://surfshark.com/aff/YOUR_AFF_ID',
  },
  social: {
    twitter: 'https://twitter.com/websiteunblocker',
  },
} as const

export type SiteConfig = typeof siteConfig
```

```typescript
// src/config/navigation.ts

export const headerNav = [
  { label: 'Home', href: '/' },
  { label: 'Guides', href: '/blog' },
  { label: 'Tools', href: '/tools' },
] as const

export const footerNav = {
  resources: [
    { label: 'Blog', href: '/blog' },
    { label: 'Tools', href: '/tools' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
} as const
```

---

## 5. Types Module (`src/types/`)

```typescript
// src/types/payload.ts
// Auto-generated by Payload - DO NOT EDIT
export interface Post {
  id: string
  title: string
  slug: string
  content?: any // Lexical content
  published_date?: string
  tags?: string[]
  meta_title?: string
  meta_description?: string
  createdAt: string
  updatedAt: string
}

export interface Page {
  id: string
  title: string
  slug: string
  contentHtml?: string
  metaTitle?: string
  metaDescription?: string
  canonicalUrl?: string
  jsonLd?: any
}
```

```typescript
// src/types/api.ts

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export interface PaginatedResponse<T> {
  docs: T[]
  totalDocs: number
  totalPages: number
  page: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}
```

---

## Module Dependencies

```
┌─────────────────────────────────────────────────────────┐
│                        app/                              │
│  (Pages - imports from all modules)                     │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────┐
│   components/   │ │    lib/     │ │  config/    │
│                 │ │             │ │             │
│ ui/ (no deps)   │ │ utils/      │ │ site.ts     │
│ features/       │◄│ hooks/      │ │ navigation  │
│ layout/         │ │ api/        │ │             │
└─────────────────┘ │ validation/ │ └─────────────┘
                    └─────────────┘
                          │
                          ▼
              ┌─────────────────────┐
              │      types/         │
              │  (shared types)     │
              └─────────────────────┘
                          │
                          ▼
              ┌─────────────────────┐
              │    collections/     │
              │  (Payload CMS)      │
              └─────────────────────┘
```

---

## Import Conventions

```typescript
// Prefer absolute imports with @/ alias
import { Button } from '@/components/ui/Button'
import { DiagnosisTool } from '@/components/features/DiagnosisTool'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/config/site'
import type { Post } from '@/types/payload'

// Barrel exports for cleaner imports
import { Button, Input, Card, Badge } from '@/components/ui'
import { checkWebsite, getPosts } from '@/lib/api'
```

---

## Testing Strategy Per Module

| Module | Test Type | Coverage Target |
|--------|-----------|-----------------|
| `components/ui` | Unit + Visual | 80% |
| `components/features` | Unit + Integration | 100% |
| `lib/utils` | Unit | 100% |
| `lib/api` | Integration | 90% |
| `lib/validation` | Unit | 100% |
| `collections` | Integration | 80% |
