# Component Specifications

WebsiteUnblocker.com - React 19, Next.js 15, Tailwind CSS, Framer Motion, Lucide Icons

---

## 1. DiagnosisTool (Core Feature)

Primary interactive component for checking website accessibility.

### TypeScript Interface

```typescript
// Internal state types
type CheckStatus = 'accessible' | 'blocked' | 'error'

interface CheckResult {
  status: CheckStatus
  code?: number        // HTTP status code
  latency: number      // Response time in ms
  target: string       // Normalized URL
  error?: string       // Error message when status='error'
}

// Component has no external props - fully self-contained
export function DiagnosisTool(): JSX.Element
```

### State Management

```typescript
const [url, setUrl] = useState<string>('')           // User input
const [loading, setLoading] = useState<boolean>(false) // Loading state
const [result, setResult] = useState<CheckResult | null>(null) // API response
```

**State Flow:**
1. User enters URL -> `url` state updates
2. User clicks Check/presses Enter -> `loading=true`, `result=null`
3. API responds -> 600ms delay -> `result` populated, `loading=false`
4. Error catch -> `result` with `status='error'`

### Animation Specs (Framer Motion)

```typescript
// Results container - expand/collapse
<AnimatePresence mode="wait">
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
  />
</AnimatePresence>

// Status banner - scale entrance
<motion.div
  initial={{ scale: 0.95 }}
  animate={{ scale: 1 }}
/>
```

**Animation Tokens:**
- Results appear: 300ms ease-out
- Scale entrance: 200ms spring
- Exit: 200ms ease-in

### Accessibility (ARIA)

```tsx
// Input field
<input
  type="text"
  aria-label="Website URL to check"
  aria-describedby="url-hint"
  role="searchbox"
/>

// Button states
<button
  aria-busy={loading}
  aria-disabled={loading || !url.trim()}
/>

// Results region
<div
  role="region"
  aria-live="polite"
  aria-atomic="true"
>

// Status icons
<ShieldAlert aria-hidden="true" />
<span className="sr-only">Access Restricted</span>
```

**Keyboard Support:**
- `Enter` key triggers check
- Tab navigation through interactive elements
- Focus visible states on all controls

### Loading/Error States

```tsx
// Loading state
{loading && (
  <Loader2 className="w-5 h-5 animate-spin" />
  <span className="hidden md:inline">Checking...</span>
)}

// Error state display
{result?.status === 'error' && (
  <div className="bg-red-50 border border-red-200">
    <ShieldAlert className="text-red-500" />
    <span>Access Restricted</span>
    <span>{result.error}</span>
  </div>
)}

// Empty/initial state
{!result && !loading && (
  // Only input visible, no results section
)}
```

### Mobile Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| `< md` (768px) | "Checking..." text hidden, icon only. Button padding reduced |
| `>= md` | Full button text visible, larger padding |

```tsx
// Responsive classes
className="px-8 py-4"                    // Button base
className="hidden md:inline"             // "Checking..." text
className="p-6 md:p-8"                   // Container padding
```

### Tailwind Class Structure

```tsx
// Container
"w-full max-w-2xl mx-auto"

// Card wrapper
"bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"

// Input section
"p-6 md:p-8"

// Input field
"w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl
 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"

// Primary button
"px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold
 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"

// Status banner (blocked)
"p-5 rounded-xl bg-red-50 border border-red-200"

// Status banner (accessible)
"p-5 rounded-xl bg-green-50 border border-green-200"

// Affiliate card (recommended)
"p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500
 rounded-xl hover:shadow-lg transition-all"

// Secondary option
"p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
```

### Test Scenarios

```typescript
describe('DiagnosisTool', () => {
  it('renders input and button in initial state')
  it('disables button when input is empty')
  it('shows loading spinner during API call')
  it('displays accessible status with green banner')
  it('displays blocked status with red banner and solutions')
  it('handles API errors gracefully')
  it('triggers check on Enter key press')
  it('clears previous result on new check')
  it('shows affiliate links only when blocked')
  it('is keyboard navigable')
})
```

---

## 2. Header/Navigation

Sticky navigation with responsive mobile menu.

### TypeScript Interface

```typescript
// Currently inline in layout.tsx - extract to:
interface HeaderProps {
  transparent?: boolean  // For hero overlay (future)
}

interface NavLink {
  href: string
  label: string
  external?: boolean
}

const navLinks: NavLink[] = [
  { href: '/blog', label: 'Guides' },
  { href: '/tools', label: 'Tools' },
]
```

### Mobile Menu Behavior

```typescript
// State for mobile menu
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

// Toggle behavior
<button
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
  aria-expanded={mobileMenuOpen}
  aria-controls="mobile-menu"
>
  {mobileMenuOpen ? <X /> : <Menu />}
</button>

// Animation
<AnimatePresence>
  {mobileMenuOpen && (
    <motion.nav
      id="mobile-menu"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    />
  )}
</AnimatePresence>
```

**Current:** Desktop nav only (`hidden md:flex`)
**TODO:** Implement hamburger menu for mobile

### Sticky Behavior

```tsx
<header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
```

**Properties:**
- `sticky top-0`: Fixed at viewport top
- `z-50`: Above all content
- `bg-white/80`: 80% white opacity
- `backdrop-blur-md`: Blur content behind
- Height: `h-16` (64px)

### CTA Button Placement

```tsx
// Desktop: Right-aligned in nav
<nav className="hidden md:flex items-center gap-6">
  {/* Nav links */}
  <a
    href={siteConfig.affiliates.nordvpn}
    target="_blank"
    rel="noopener"
    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
  >
    Get VPN
  </a>
</nav>

// Mobile: Full-width in expanded menu (TODO)
```

### Tailwind Class Structure

```tsx
// Header container
"sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100"

// Inner wrapper
"max-w-6xl mx-auto px-4 h-16 flex items-center justify-between"

// Logo
"flex items-center gap-2 font-bold text-xl text-slate-900"

// Nav links
"text-slate-600 hover:text-slate-900 transition-colors"

// CTA button
"px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
```

### Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| `< md` | Logo only, hamburger menu (TODO) |
| `>= md` | Full nav visible with CTA |

### Test Scenarios

```typescript
describe('Header', () => {
  it('renders logo with link to home')
  it('shows navigation links on desktop')
  it('hides navigation on mobile')
  it('CTA opens affiliate link in new tab')
  it('has correct rel attributes for external links')
  it('maintains sticky position on scroll')
  it('mobile menu toggles correctly (future)')
})
```

---

## 3. Footer

Site-wide footer with link structure and branding.

### TypeScript Interface

```typescript
interface FooterSection {
  title: string
  links: FooterLink[]
}

interface FooterLink {
  href: string
  label: string
  external?: boolean
}

const footerSections: FooterSection[] = [
  {
    title: 'Resources',
    links: [
      { href: '/blog', label: 'Guides' },
      { href: '/tools', label: 'Tools' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
    ],
  },
]
```

### Link Structure

```
Footer Grid (md:grid-cols-4)
|-- Brand (md:col-span-2)
|   |-- Logo + Site Name
|   |-- Description text
|-- Resources
|   |-- Guides
|   |-- Tools
|-- Legal
|   |-- Privacy Policy
|   |-- Terms of Service
|-- Copyright bar (full width)
```

### Newsletter Signup (Future)

```typescript
interface NewsletterFormProps {
  onSubmit: (email: string) => Promise<void>
}

// Planned component
function NewsletterSignup({ onSubmit }: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Enter your email"
        required
      />
      <button type="submit">Subscribe</button>
    </form>
  )
}
```

### Tailwind Class Structure

```tsx
// Footer container
"bg-slate-50 border-t border-slate-100 py-12 px-4"

// Inner wrapper
"max-w-6xl mx-auto"

// Grid
"grid md:grid-cols-4 gap-8"

// Brand section
"md:col-span-2"

// Section title
"font-bold text-slate-900 mb-4"

// Link list
"space-y-2 text-sm"

// Link
"text-slate-600 hover:text-blue-600"

// Copyright bar
"border-t border-slate-200 mt-8 pt-8 text-center text-sm text-slate-500"
```

### Test Scenarios

```typescript
describe('Footer', () => {
  it('renders logo and description')
  it('displays all navigation sections')
  it('links have correct hrefs')
  it('shows current year in copyright')
  it('is responsive on mobile')
})
```

---

## 4. BlogCard

Reusable card component for blog post listings.

### TypeScript Interface

```typescript
interface BlogCardProps {
  title: string
  slug: string
  tags?: string[]
  description?: string
  date?: string | Date
  image?: {
    url: string
    alt: string
  }
}
```

### Component Implementation

```tsx
export function BlogCard({ title, slug, tags, description, date, image }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group p-6 bg-white border border-slate-200 rounded-2xl
                 hover:shadow-lg hover:border-blue-200 transition-all"
    >
      {image && (
        <div className="relative aspect-video mb-4 rounded-xl overflow-hidden">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {tags?.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2
                     group-hover:text-blue-600 transition-colors">
        {title}
      </h3>

      <p className="text-slate-500 text-sm line-clamp-2">
        {description || 'Read our comprehensive guide...'}
      </p>

      {date && (
        <p className="text-xs text-slate-400 mt-4">
          {new Date(date).toLocaleDateString('en-US', {
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

### Hover Effects

```css
/* Card hover */
.group:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  border-color: rgb(191 219 254); /* blue-200 */
}

/* Title color transition */
.group-hover\:text-blue-600 {
  transition: color 150ms;
}

/* Image zoom (if present) */
.group-hover\:scale-105 {
  transform: scale(1.05);
  transition: transform 300ms;
}
```

### Image Optimization

```tsx
import Image from 'next/image'

<Image
  src={image.url}
  alt={image.alt}
  fill                    // Fill container
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
  loading="lazy"          // Lazy load below fold
  placeholder="blur"      // Blur placeholder (if blurDataURL provided)
/>
```

### Tailwind Class Structure

```tsx
// Card container
"group p-6 bg-white border border-slate-200 rounded-2xl
 hover:shadow-lg hover:border-blue-200 transition-all"

// Image container
"relative aspect-video mb-4 rounded-xl overflow-hidden"

// Tag
"text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full"

// Title
"text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors"

// Description
"text-slate-500 text-sm line-clamp-2"

// Date
"text-xs text-slate-400 mt-4"
```

### Responsive Breakpoints

| Context | Grid Columns |
|---------|--------------|
| Mobile | 1 column |
| Tablet (`md`) | 2 columns |
| Desktop (`lg`) | 3 columns |

```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {posts.map(post => <BlogCard {...post} />)}
</div>
```

### Test Scenarios

```typescript
describe('BlogCard', () => {
  it('renders title and links to correct slug')
  it('displays max 2 tags')
  it('truncates long descriptions')
  it('formats date correctly')
  it('shows placeholder text when no description')
  it('handles missing optional props')
  it('image has correct loading optimization')
  it('hover effects apply correctly')
})
```

---

## 5. CTABanner

Call-to-action component with multiple variants.

### TypeScript Interface

```typescript
type CTAVariant = 'inline' | 'fullwidth' | 'modal'

interface CTABannerProps {
  variant: CTAVariant
  title: string
  description?: string
  buttonText: string
  affiliateKey: keyof typeof siteConfig.affiliates
  onClose?: () => void  // For modal variant
}
```

### Variant Implementations

#### Inline Variant
```tsx
// Embedded within content
<div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50
                border border-blue-200 rounded-xl my-8">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
    <a href={affiliateUrl} className="btn-primary">{buttonText}</a>
  </div>
</div>
```

#### Fullwidth Variant
```tsx
// Section-level CTA (as seen in homepage)
<section className="py-20 px-4 bg-slate-900">
  <div className="max-w-4xl mx-auto text-center">
    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{title}</h2>
    <p className="text-slate-400 text-lg mb-8">{description}</p>
    <a
      href={affiliateUrl}
      className="inline-flex items-center gap-2 px-8 py-4
                 bg-green-500 text-white rounded-xl font-bold text-lg
                 hover:bg-green-600 transition-colors"
    >
      <Shield className="w-5 h-5" />
      {buttonText}
    </a>
  </div>
</section>
```

#### Modal Variant
```tsx
// Overlay modal CTA
<AnimatePresence>
  {isOpen && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-2xl p-8 max-w-md w-full"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <button onClick={onClose} className="absolute top-4 right-4">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
        <p className="text-slate-600 mb-6">{description}</p>
        <a href={affiliateUrl} className="btn-primary w-full">{buttonText}</a>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

### Affiliate Link Handling

```typescript
import { siteConfig } from '@/config/site'

function getAffiliateUrl(key: keyof typeof siteConfig.affiliates): string {
  return siteConfig.affiliates[key]
}

// Always include:
<a
  href={affiliateUrl}
  target="_blank"
  rel="noopener"  // Security: prevents window.opener access
  // Do NOT use nofollow for affiliate links (passes link equity)
>
```

### Tailwind Class Structure

```tsx
// Inline variant
"p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl"

// Fullwidth variant
"py-20 px-4 bg-slate-900"
"max-w-4xl mx-auto text-center"

// Modal overlay
"fixed inset-0 z-50 flex items-center justify-center p-4"
"absolute inset-0 bg-black/50"  // Backdrop
"relative bg-white rounded-2xl p-8 max-w-md w-full"  // Modal content

// CTA button
"inline-flex items-center gap-2 px-8 py-4 bg-green-500 text-white
 rounded-xl font-bold text-lg hover:bg-green-600 transition-colors"
```

### Test Scenarios

```typescript
describe('CTABanner', () => {
  it('renders inline variant correctly')
  it('renders fullwidth variant correctly')
  it('renders modal variant with overlay')
  it('modal closes on backdrop click')
  it('modal closes on X button click')
  it('affiliate links have correct attributes')
  it('uses correct URL from siteConfig')
  it('tracks click events (analytics)')
})
```

---

## 6. StatusBadge

Visual indicator for website accessibility status.

### TypeScript Interface

```typescript
type StatusVariant = 'accessible' | 'blocked' | 'error' | 'loading'

interface StatusBadgeProps {
  status: StatusVariant
  label?: string
  size?: 'sm' | 'md' | 'lg'
}
```

### Variant Styles

```typescript
const statusStyles: Record<StatusVariant, { bg: string; text: string; icon: LucideIcon }> = {
  accessible: {
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-700',
    icon: ShieldCheck,
  },
  blocked: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    icon: ShieldAlert,
  },
  error: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    icon: AlertTriangle,
  },
  loading: {
    bg: 'bg-slate-50 border-slate-200',
    text: 'text-slate-600',
    icon: Loader2,
  },
}
```

### Component Implementation

```tsx
export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const styles = statusStyles[status]
  const Icon = styles.icon

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const defaultLabels: Record<StatusVariant, string> = {
    accessible: 'Accessible',
    blocked: 'Blocked',
    error: 'Error',
    loading: 'Checking...',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        sizeClasses[size],
        styles.bg,
        styles.text
      )}
      role="status"
      aria-live="polite"
    >
      <Icon
        className={cn(
          iconSizes[size],
          status === 'loading' && 'animate-spin'
        )}
        aria-hidden="true"
      />
      {label || defaultLabels[status]}
    </span>
  )
}
```

### Tailwind Class Structure

```tsx
// Base
"inline-flex items-center gap-1.5 rounded-full border font-medium"

// Accessible
"bg-green-50 border-green-200 text-green-700"

// Blocked
"bg-red-50 border-red-200 text-red-700"

// Error
"bg-amber-50 border-amber-200 text-amber-700"

// Loading
"bg-slate-50 border-slate-200 text-slate-600"
// Icon: "animate-spin"
```

### Test Scenarios

```typescript
describe('StatusBadge', () => {
  it('renders correct icon for each status')
  it('applies correct colors for each status')
  it('uses default label when none provided')
  it('shows custom label when provided')
  it('spinner animates for loading status')
  it('has correct ARIA attributes')
  it('respects size prop')
})
```

---

## 7. SEOHead

Meta tags and structured data management.

### TypeScript Interface

```typescript
interface SEOHeadProps {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  article?: {
    publishedTime: string
    modifiedTime?: string
    author?: string
    tags?: string[]
  }
  noIndex?: boolean
}

interface JsonLdData {
  '@context': 'https://schema.org'
  '@type': string
  [key: string]: unknown
}
```

### Meta Tags Management

```tsx
// In layout.tsx or page.tsx using Next.js Metadata API
import type { Metadata } from 'next'

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  // Fetch post data...

  return {
    title: post.meta_title || post.title,
    description: post.meta_description,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.meta_description,
      url: `https://websiteunblocker.com/blog/${post.slug}`,
      images: post.image ? [{ url: post.image.url }] : undefined,
      publishedTime: post.published_date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.meta_description,
    },
    alternates: {
      canonical: `https://websiteunblocker.com/blog/${post.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}
```

### JSON-LD Generation

```tsx
// WebSite schema (homepage)
function WebsiteJsonLd() {
  const jsonLd: JsonLdData = {
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
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// Article schema (blog posts)
function ArticleJsonLd({ post }: { post: Post }) {
  const jsonLd: JsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description,
    datePublished: post.published_date,
    dateModified: post.updated_at,
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.url}/blog/${post.slug}`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// HowTo schema (guide posts)
function HowToJsonLd({ post, steps }: { post: Post; steps: string[] }) {
  const jsonLd: JsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: post.title,
    description: post.meta_description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: step,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// SoftwareApplication schema (tool page)
function ToolJsonLd() {
  const jsonLd: JsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Website Access Checker',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

### Test Scenarios

```typescript
describe('SEOHead', () => {
  it('generates correct meta title')
  it('generates correct meta description')
  it('includes canonical URL')
  it('includes OpenGraph tags')
  it('includes Twitter card tags')
  it('generates valid JSON-LD for WebSite')
  it('generates valid JSON-LD for Article')
  it('generates valid JSON-LD for HowTo')
  it('respects noIndex flag')
})
```

---

## Dark Mode Support (Future)

All components should support dark mode via CSS variables and Tailwind's `dark:` prefix.

### Implementation Plan

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 0 0% 100%;
  /* ... */
}
```

```tsx
// Component example with dark mode
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
```

### Theme Toggle Component (Future)

```typescript
interface ThemeToggleProps {
  className?: string
}

function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

  // Implementation with next-themes or similar
}
```

---

## Component Index

| Component | Status | Location |
|-----------|--------|----------|
| DiagnosisTool | Implemented | `/src/components/DiagnosisTool.tsx` |
| Header | Inline in layout | `/src/app/(frontend)/layout.tsx` |
| Footer | Inline in layout | `/src/app/(frontend)/layout.tsx` |
| BlogCard | Inline pattern | `/src/app/(frontend)/page.tsx`, `/blog/page.tsx` |
| CTABanner | Inline pattern | `/src/app/(frontend)/page.tsx` |
| StatusBadge | TODO | - |
| SEOHead | Via Next.js Metadata | Layout/Page exports |
