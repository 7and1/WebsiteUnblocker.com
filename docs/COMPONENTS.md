# Component Documentation

WebsiteUnblocker.com - React 19, Next.js 15, Tailwind CSS component library.

## Table of Contents

- [Overview](#overview)
- [Feature Components](#feature-components)
  - [DiagnosisTool](#diagnosistool)
  - [BlogCard](#blogcard)
  - [CTABanner](#ctabanner)
  - [ContactForm](#contactform)
  - [IpChecker](#ipchecker)
  - [SpeedTest](#speedtest)
- [Layout Components](#layout-components)
- [SEO Components](#seo-components)
- [UI Components](#ui-components)

---

## Overview

Components follow these conventions:
- Server Components by default (no `'use client'` directive)
- TypeScript with strict typing
- Tailwind CSS for styling
- ARIA attributes for accessibility
- Loading states for async operations

---

## Feature Components

### DiagnosisTool

The primary interactive component for checking website accessibility.

#### Location

`/src/components/features/DiagnosisTool/`

#### Files

| File | Purpose |
|------|---------|
| `DiagnosisTool.tsx` | Main container component |
| `DiagnosisInput.tsx` | URL input field |
| `DiagnosisResult.tsx` | Results display |
| `useDiagnosis.ts` | State management hook |
| `types.ts` | TypeScript types |

#### TypeScript Interface

```typescript
type CheckStatus = 'idle' | 'loading' | 'accessible' | 'blocked' | 'error'

interface CheckResult {
  status: 'accessible' | 'blocked' | 'error'
  code?: number
  latency: number
  target: string
  error?: string
  blockReason?: BlockReason
}

interface DiagnosisState {
  url: string
  status: CheckStatus
  result: CheckResult | null
}
```

#### Usage

```tsx
'use client'

import { DiagnosisTool } from '@/components/features/DiagnosisTool'

export default function Page() {
  return <DiagnosisTool defaultUrl="youtube.com" />
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultUrl` | `string` | `''` | Pre-fill input with URL |

#### Accessibility Features

- `aria-label` on input field
- `aria-describedby` for hints
- `aria-live="polite"` for results region
- Keyboard navigation (Enter to submit)
- Focus management on results

#### Loading States

```tsx
{loading && (
  <Loader2 className="w-5 h-5 animate-spin" />
  <span className="hidden md:inline">Checking...</span>
)}
```

---

### BlogCard

Reusable card component for blog post listings.

#### Location

`/src/components/features/BlogCard.tsx`

#### TypeScript Interface

```typescript
interface BlogCardProps {
  title: string
  slug: string
  tags?: string[]
  description?: string
  date?: string | Date
}
```

#### Usage

```tsx
import { BlogCard } from '@/components/features/BlogCard'

<BlogCard
  title="How to Unblock YouTube"
  slug="unblock-youtube"
  tags={['VPN Guide', 'Tutorial']}
  description="Learn the best methods..."
  date="2026-01-15"
/>
```

#### Tailwind Classes

```tsx
// Container
"group p-6 bg-white border border-slate-200 rounded-2xl
 hover:shadow-lg hover:border-blue-200 transition-all"

// Tag
"text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full"

// Title
"text-lg font-bold text-slate-900 mb-2
 group-hover:text-blue-600 transition-colors"
```

---

### CTABanner

Call-to-action component with multiple variants for affiliate links.

#### Location

`/src/components/features/CTABanner.tsx`

#### TypeScript Interface

```typescript
type CTAVariant = 'inline' | 'fullwidth' | 'modal'

interface CTABannerProps {
  variant: CTAVariant
  title: string
  description?: string
  buttonText: string
  affiliateKey: 'nordvpn' | 'expressvpn' | 'surfshark'
}
```

#### Usage

```tsx
import { CTABanner } from '@/components/features/CTABanner'

<CTABanner
  variant="fullwidth"
  title="Ready to Unblock the Internet?"
  description="Get unrestricted access with NordVPN"
  buttonText="Get NordVPN Now"
  affiliateKey="nordvpn"
/>
```

#### Variants

| Variant | Purpose | Layout |
|---------|---------|--------|
| `inline` | Embedded in content | Horizontal card |
| `fullwidth` | Section break | Centered, full-width dark background |
| `modal` | Overlay popup | Fixed position modal |

---

### ContactForm

Contact form with validation and spam protection.

#### Location

`/src/components/features/ContactForm.tsx`

#### TypeScript Interface

```typescript
interface ContactFormProps {
  onSuccess?: () => void
  className?: string
}

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}
```

#### Validation Rules

| Field | Min | Max | Type |
|-------|-----|-----|------|
| name | 2 | 100 | string |
| email | - | 255 | email |
| subject | 5 | 200 | string |
| message | 20 | 5000 | string |

#### Usage

```tsx
import { ContactForm } from '@/components/features/ContactForm'

<ContactForm onSuccess={() => alert('Message sent!')} />
```

#### Features

- Client-side validation with Zod
- Honeypot field for bot protection
- Loading state during submission
- Error message display
- Success confirmation

---

### IpChecker

Tool to display user's IP address and location.

#### Location

`/src/components/features/IpChecker.tsx`

#### Usage

```tsx
import { IpChecker } from '@/components/features/IpChecker'

<IpChecker />
```

#### Features

- Fetches IP from `/api/ip`
- Displays country and city (if available)
- Shows IP address prominently
- Copy to clipboard functionality

---

### SpeedTest

Internet speed test component.

#### Location

`/src/components/features/SpeedTest.tsx`

#### Usage

```tsx
import { SpeedTest } from '@/components/features/SpeedTest'

<SpeedTest />
```

#### Features

- Tests download speed
- Tests upload speed
- Measures ping/latency
- Visual progress indicators
- Results summary

---

## Layout Components

### Header

Sticky navigation with responsive mobile menu.

#### Location

Inline in `/src/app/(frontend)/layout.tsx`

#### Features

- Sticky positioning with backdrop blur
- Logo with home link
- Navigation links
- Affiliate CTA button
- Mobile hamburger menu (future)

#### Structure

```tsx
<header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md
                  border-b border-slate-100">
  <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
    {/* Logo */}
    {/* Nav Links */}
    {/* CTA Button */}
  </nav>
</header>
```

---

### Footer

Site-wide footer with link structure.

#### Location

Inline in `/src/app/(frontend)/layout.tsx`

#### Configuration

```typescript
// src/config/site.ts
export const siteConfig = {
  footer: {
    resources: [
      { label: 'Guides', href: '/blog' },
      { label: 'Tools', href: '/tools' },
      { label: 'Unblock YouTube', href: '/unblock/youtube' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Affiliate Disclosure', href: '/affiliate-disclosure' },
      { label: 'Contact', href: '/contact' },
    ],
  },
}
```

---

## SEO Components

### JsonLd

Component for injecting JSON-LD structured data.

#### Location

`/src/components/seo/JsonLd.tsx`

#### Usage

```tsx
import { JsonLd } from '@/components/seo/JsonLd'

<JsonLd data={{
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'WebsiteUnblocker',
}} />
```

#### Supported Schemas

- WebSite
- Organization
- Article
- FAQPage
- BreadcrumbList
- SoftwareApplication
- Product
- HowTo

---

## UI Components

### Button

Base button component with variants.

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}
```

#### Variants

| Variant | Classes |
|---------|---------|
| primary | `bg-blue-600 text-white hover:bg-blue-700` |
| secondary | `bg-slate-600 text-white hover:bg-slate-700` |
| outline | `border border-slate-300 hover:bg-slate-50` |

---

### Input

Base input component with validation states.

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}
```

---

### Card

Container component for content sections.

```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}
```

---

## Component Index

| Component | Type | Location | Status |
|-----------|------|----------|--------|
| DiagnosisTool | Feature | `/features/DiagnosisTool/` | Implemented |
| BlogCard | Feature | `/features/BlogCard.tsx` | Implemented |
| CTABanner | Feature | `/features/CTABanner.tsx` | Implemented |
| ContactForm | Feature | `/features/ContactForm.tsx` | Implemented |
| IpChecker | Feature | `/features/IpChecker.tsx` | Implemented |
| SpeedTest | Feature | `/features/SpeedTest.tsx` | Implemented |
| Header | Layout | `app/(frontend)/layout.tsx` | Implemented |
| Footer | Layout | `app/(frontend)/layout.tsx` | Implemented |
| JsonLd | SEO | `/seo/JsonLd.tsx` | Implemented |

---

## Testing Components

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('DiagnosisTool', () => {
  it('renders input and button', () => {
    render(<DiagnosisTool />)
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
  })

  it('submits on Enter key', async () => {
    const user = userEvent.setup()
    render(<DiagnosisTool />)

    const input = screen.getByRole('searchbox')
    await user.type(input, 'youtube.com{Enter}')

    // Assert loading state
    expect(screen.getByText(/checking/i)).toBeInTheDocument()
  })
})
```

---

*Last updated: January 18, 2026*
