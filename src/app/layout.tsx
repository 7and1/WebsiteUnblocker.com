import type { Metadata, Viewport } from 'next'
import { Manrope, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { siteConfig } from '@/config/site'

// Font optimization: Self-hosted with display swap for better CLS
const bodyFont = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  preload: true,
})

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  preload: true,
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'Website Unblocker - Check & Unblock Any Website Free',
    template: '%s | WebsiteUnblocker',
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords.join(', '),
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  manifest: '/site.webmanifest',
  icons: {
    // Google SERP: 192x192 PNG first (Google's preference)
    icon: [
      { url: '/icons/icon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/icon-96x96.png', type: 'image/png', sizes: '96x96' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'manifest', url: '/site.webmanifest' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: 'Website Unblocker - Check & Unblock Any Website Free',
    description: siteConfig.description,
    // Images are auto-generated from opengraph-image.tsx
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Unblocker - Check & Unblock Any Website Free',
    description: siteConfig.description,
    // Images are auto-generated from twitter-image.tsx
    creator: '@websiteunblocker',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || '',
    // bing: process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
  },
  alternates: {
    canonical: siteConfig.url,
    languages: {
      'en': siteConfig.url,
      'x-default': siteConfig.url,
    },
    types: {
      'application/rss+xml': '/feed.xml',
      'application/atom+xml': '/feed.atom',
    },
  },
  category: 'technology',
}

// Performance: DNS prefetch for external domains
const PRECONNECT_DOMAINS = [
  'https://websiteunblocker.com',
]

// Critical resources to preload for faster LCP
const PRELOAD_RESOURCES: readonly { href: string; as: string; type: string }[] = []

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <head>
        {/* Performance: Preconnect to external domains */}
        {PRECONNECT_DOMAINS.map((domain) => (
          <link key={domain} rel="preconnect" href={domain} />
        ))}
        {/* Performance: DNS prefetch for potential future requests */}
        {PRECONNECT_DOMAINS.map((domain) => (
          <link key={`dns-${domain}`} rel="dns-prefetch" href={domain} />
        ))}
        {/* Performance: Preload critical resources */}
        {PRELOAD_RESOURCES.map((resource) => (
          <link
            key={resource.href}
            rel="preload"
            href={resource.href}
            as={resource.as}
            type={resource.type}
          />
        ))}
      </head>
      <body className={`${bodyFont.className} antialiased`}>{children}</body>
    </html>
  )
}
