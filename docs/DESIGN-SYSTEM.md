# Design System

WebsiteUnblocker.com - React 19, Next.js 15, Tailwind CSS

---

## Color Palette

### CSS Variables (HSL)

```css
:root {
  /* Core */
  --background: 0 0% 100%;              /* white */
  --foreground: 222.2 84% 4.9%;         /* slate-950 */

  /* Primary (Blue) */
  --primary: 221.2 83.2% 53.3%;         /* blue-600 */
  --primary-foreground: 210 40% 98%;    /* white */

  /* Secondary (Slate) */
  --secondary: 210 40% 96.1%;           /* slate-100 */
  --secondary-foreground: 222.2 47.4% 11.2%;  /* slate-900 */

  /* Muted */
  --muted: 210 40% 96.1%;               /* slate-100 */
  --muted-foreground: 215.4 16.3% 46.9%; /* slate-500 */

  /* Accent */
  --accent: 210 40% 96.1%;              /* slate-100 */
  --accent-foreground: 222.2 47.4% 11.2%; /* slate-900 */

  /* Utility */
  --border: 214.3 31.8% 91.4%;          /* slate-200 */
  --input: 214.3 31.8% 91.4%;           /* slate-200 */
  --ring: 221.2 83.2% 53.3%;            /* blue-600 */
  --radius: 0.75rem;                    /* 12px */
}
```

### Semantic Colors

| Token | Light Mode | Usage |
|-------|------------|-------|
| `primary` | `blue-600` | CTAs, links, focus rings |
| `success` | `green-500/600` | Accessible status, affiliate buttons |
| `error` | `red-500/600` | Blocked status, errors |
| `warning` | `amber-500/600` | Warnings, cautions |
| `muted` | `slate-100/500` | Backgrounds, secondary text |

### Status Colors

```typescript
const statusColors = {
  accessible: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: 'text-green-500',
  },
  blocked: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: 'text-red-500',
  },
  error: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: 'text-amber-500',
  },
  loading: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-600',
    icon: 'text-slate-400',
  },
}
```

### Brand Gradients

```css
/* Hero background */
.gradient-hero {
  @apply bg-gradient-to-b from-slate-50 to-white;
}

/* Affiliate card (recommended) */
.gradient-affiliate {
  @apply bg-gradient-to-r from-green-50 to-emerald-50;
}

/* CTA section */
.gradient-cta {
  @apply bg-slate-900;
}
```

### Dark Mode (Future)

```css
.dark {
  --background: 222.2 84% 4.9%;         /* slate-950 */
  --foreground: 210 40% 98%;            /* slate-50 */
  --primary: 217.2 91.2% 59.8%;         /* blue-500 */
  --primary-foreground: 222.2 84% 4.9%; /* slate-950 */
  --secondary: 217.2 32.6% 17.5%;       /* slate-800 */
  --secondary-foreground: 210 40% 98%;  /* slate-50 */
  --muted: 217.2 32.6% 17.5%;           /* slate-800 */
  --muted-foreground: 215 20.2% 65.1%;  /* slate-400 */
  --accent: 217.2 32.6% 17.5%;          /* slate-800 */
  --accent-foreground: 210 40% 98%;     /* slate-50 */
  --border: 217.2 32.6% 17.5%;          /* slate-800 */
  --input: 217.2 32.6% 17.5%;           /* slate-800 */
  --ring: 224.3 76.3% 48%;              /* blue-600 */
}
```

---

## Typography Scale

### Font Stack

```css
body {
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `text-xs` | 12px | 16px | 400 | Tags, metadata, captions |
| `text-sm` | 14px | 20px | 400 | Secondary text, descriptions |
| `text-base` | 16px | 24px | 400 | Body text |
| `text-lg` | 18px | 28px | 600-700 | Card titles |
| `text-xl` | 20px | 28px | 700 | Section subtitles |
| `text-2xl` | 24px | 32px | 700 | Modal headings |
| `text-3xl` | 30px | 36px | 700 | Section headings |
| `text-4xl` | 36px | 40px | 800 | Page titles (mobile) |
| `text-6xl` | 60px | 60px | 800 | Hero heading (desktop) |

### Font Weights

```typescript
const fontWeights = {
  normal: 400,    // Body text
  medium: 500,    // Links, labels
  semibold: 600,  // Buttons, card titles
  bold: 700,      // Headings
  extrabold: 800, // Hero, page titles
}
```

### Heading Styles

```tsx
// Hero H1
<h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">

// Section H2
<h2 className="text-3xl font-bold text-slate-900">

// Card H3
<h3 className="text-lg font-bold text-slate-900">

// Subsection H4
<h4 className="font-bold text-slate-900">
```

### Text Colors

```typescript
const textColors = {
  primary: 'text-slate-900',      // Headings, important text
  secondary: 'text-slate-600',    // Body text, descriptions
  muted: 'text-slate-500',        // Captions, metadata
  subtle: 'text-slate-400',       // Dates, hints
  link: 'text-blue-600',          // Links
  linkHover: 'hover:text-blue-700',
  inverse: 'text-white',          // On dark backgrounds
}
```

---

## Spacing System

### Base Unit

Base: `4px` (0.25rem)

### Scale

| Token | Size | Pixels | Usage |
|-------|------|--------|-------|
| `space-0` | 0 | 0px | - |
| `space-1` | 0.25rem | 4px | Tight spacing |
| `space-2` | 0.5rem | 8px | Icon gaps |
| `space-3` | 0.75rem | 12px | Small gaps |
| `space-4` | 1rem | 16px | Component padding, standard gaps |
| `space-5` | 1.25rem | 20px | - |
| `space-6` | 1.5rem | 24px | Section padding (mobile) |
| `space-8` | 2rem | 32px | Section padding (desktop) |
| `space-12` | 3rem | 48px | Section margins |
| `space-16` | 4rem | 64px | Large section padding |
| `space-20` | 5rem | 80px | Hero/CTA sections |
| `space-24` | 6rem | 96px | - |

### Component Spacing

```tsx
// Card padding
"p-6"                    // 24px all sides
"p-6 md:p-8"             // 24px mobile, 32px desktop

// Button padding
"px-4 py-2"              // Small button
"px-8 py-4"              // Large button

// Section padding
"py-16 px-4"             // Standard section
"py-20 px-4"             // Hero/CTA sections
"pt-16 pb-24 px-4"       // Hero with more bottom

// Gap between items
"gap-2"                  // Tags
"gap-3"                  // Icon + text
"gap-6"                  // Card grid, nav links
"gap-8"                  // Footer columns
```

### Layout Constraints

```tsx
// Max widths
"max-w-md"               // 448px - Modal
"max-w-2xl"              // 672px - DiagnosisTool
"max-w-4xl"              // 896px - CTA section
"max-w-6xl"              // 1152px - Main content

// Container
"max-w-6xl mx-auto px-4"
```

---

## Shadow System

### Elevation Scale

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-none` | none | Flat elements |
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle depth |
| `shadow` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | Default |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | Cards |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | Hover states |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | Modals, DiagnosisTool |

### Usage Patterns

```tsx
// DiagnosisTool card
"shadow-xl"

// Blog card default
"border border-slate-200"  // No shadow

// Blog card hover
"hover:shadow-lg"

// Affiliate card hover
"hover:shadow-lg"

// Header (no shadow, uses blur)
"bg-white/80 backdrop-blur-md border-b border-slate-100"
```

---

## Border Radius System

### Scale

| Token | Size | Pixels | Usage |
|-------|------|--------|-------|
| `rounded-none` | 0 | 0px | - |
| `rounded-sm` | `calc(var(--radius) - 4px)` | 8px | Small elements |
| `rounded-md` | `calc(var(--radius) - 2px)` | 10px | - |
| `rounded-lg` | `var(--radius)` | 12px | Buttons, inputs |
| `rounded-xl` | 0.75rem | 12px | Input fields, cards |
| `rounded-2xl` | 1rem | 16px | Large cards |
| `rounded-full` | 9999px | Pill | Tags, badges |

### Usage Patterns

```tsx
// Tags
"rounded-full"

// Buttons
"rounded-lg"           // Small buttons
"rounded-xl"           // Large buttons

// Input fields
"rounded-xl"

// Cards
"rounded-2xl"

// Icon containers
"rounded-lg"           // Small
"rounded-xl"           // Large
```

---

## Animation Tokens

### Transition Durations

| Token | Duration | Usage |
|-------|----------|-------|
| `duration-75` | 75ms | Very fast |
| `duration-100` | 100ms | Fast |
| `duration-150` | 150ms | Standard (colors) |
| `duration-200` | 200ms | Standard (transforms) |
| `duration-300` | 300ms | Slower animations |
| `duration-500` | 500ms | Page transitions |

### Easing Functions

```typescript
const easings = {
  default: 'ease-in-out',
  in: 'ease-in',
  out: 'ease-out',
  spring: [0.175, 0.885, 0.32, 1.275],  // Framer Motion
}
```

### Standard Transitions

```tsx
// Color transitions
"transition-colors"     // 150ms ease

// All transitions
"transition-all"        // 150ms ease

// Transform + opacity
"transition-transform"  // 150ms ease
```

### Framer Motion Presets

```typescript
// Fade in/out
const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

// Scale entrance
const scaleVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
}

// Slide down
const slideDownVariants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

// Expand height
const expandVariants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 },
}
```

### Loading Animations

```tsx
// Spinner
"animate-spin"          // 1s linear infinite

// Pulse
"animate-pulse"         // 2s ease-in-out infinite
```

---

## Breakpoints

### Tailwind Defaults

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets, main breakpoint |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Common Patterns

```tsx
// Mobile-first text sizing
"text-4xl md:text-6xl"

// Mobile-first padding
"p-6 md:p-8"

// Grid columns
"grid md:grid-cols-2 lg:grid-cols-3"
"grid md:grid-cols-4"

// Show/hide
"hidden md:flex"       // Hide on mobile
"md:hidden"            // Show only on mobile

// Footer grid
"grid md:grid-cols-4 gap-8"
"md:col-span-2"
```

---

## Component Tokens

### Buttons

```typescript
const buttonVariants = {
  primary: {
    base: 'bg-blue-600 text-white',
    hover: 'hover:bg-blue-700',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
    size: {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-lg',
      lg: 'px-8 py-4 text-lg rounded-xl',
    },
  },
  success: {
    base: 'bg-green-500 text-white',
    hover: 'hover:bg-green-600',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
    size: {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-lg',
      lg: 'px-8 py-4 text-lg rounded-xl',
    },
  },
  ghost: {
    base: 'bg-transparent text-slate-600',
    hover: 'hover:bg-slate-100 hover:text-slate-900',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
    size: {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-base rounded-lg',
      lg: 'px-6 py-3 text-lg rounded-xl',
    },
  },
}
```

### Inputs

```typescript
const inputStyles = {
  base: 'w-full border border-slate-200 outline-none',
  focus: 'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  size: {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-3 text-base rounded-xl',
    lg: 'pl-12 pr-4 py-4 text-lg rounded-xl',  // With icon
  },
}
```

### Cards

```typescript
const cardStyles = {
  default: 'bg-white border border-slate-200 rounded-2xl',
  interactive: 'hover:shadow-lg hover:border-blue-200 transition-all',
  featured: 'shadow-xl border border-slate-200 rounded-2xl',
}
```

### Tags

```typescript
const tagStyles = {
  default: 'text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full',
  featured: 'text-xs px-2 py-0.5 bg-green-500 text-white rounded-full',
  status: {
    accessible: 'bg-green-100 text-green-700',
    blocked: 'bg-red-100 text-red-700',
  },
}
```

---

## Icon System

### Library

Using Lucide React icons.

### Size Scale

| Token | Size | Usage |
|-------|------|-------|
| `w-4 h-4` | 16px | Inline with text, small buttons |
| `w-5 h-5` | 20px | Standard buttons, nav |
| `w-6 h-6` | 24px | Card headers, feature icons |
| `w-10 h-10` | 40px | Status badges in results |

### Common Icons

```typescript
import {
  Shield,         // Brand, security
  ShieldCheck,    // Accessible status
  ShieldAlert,    // Blocked status
  Search,         // Search input
  Loader2,        // Loading spinner
  ExternalLink,   // External links
  Globe,          // Global access feature
  Zap,            // Speed/instant feature
  Lock,           // Privacy feature
  ArrowRight,     // Navigation, CTAs
  Menu,           // Mobile menu (future)
  X,              // Close (future)
} from 'lucide-react'
```

---

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `z-0` | 0 | Base layer |
| `z-10` | 10 | Elevated content |
| `z-20` | 20 | Dropdowns |
| `z-30` | 30 | Tooltips |
| `z-40` | 40 | Overlays |
| `z-50` | 50 | Header, navigation |
| `z-[100]` | 100 | Modals |

---

## Accessibility

### Focus States

```tsx
// Input focus
"focus:ring-2 focus:ring-blue-500 focus:border-transparent"

// Button focus (use focus-visible for keyboard only)
"focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"

// Link focus
"focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
```

### Screen Reader

```tsx
// Visually hidden but accessible
"sr-only"

// Skip link
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### Color Contrast

All text/background combinations meet WCAG AA standards:
- `text-slate-900` on `bg-white`: 15.3:1
- `text-slate-600` on `bg-white`: 6.0:1
- `text-white` on `bg-blue-600`: 4.9:1
- `text-white` on `bg-green-500`: 4.1:1

---

## File Structure

```
src/
├── app/
│   ├── globals.css          # CSS variables, base styles
│   └── ...
├── components/
│   ├── ui/                  # Primitive components (future)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── badge.tsx
│   └── ...
├── lib/
│   └── utils.ts             # cn() helper, shared utilities
└── config/
    └── site.ts              # Site config, affiliate links
```

### Utility Function

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
