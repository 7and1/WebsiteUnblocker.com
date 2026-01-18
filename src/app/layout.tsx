import type { Metadata } from 'next'
import './globals.css'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'Website Unblocker - Check & Unblock Any Website Free',
    template: '%s | WebsiteUnblocker',
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
  },
}

// Performance: DNS prefetch for external domains
const PRECONNECT_DOMAINS = [
  'https://websiteunblocker.com',
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Performance: Preconnect to external domains */}
        {PRECONNECT_DOMAINS.map((domain) => (
          <link key={domain} rel="preconnect" href={domain} />
        ))}
        {/* Performance: DNS prefetch for potential future requests */}
        {PRECONNECT_DOMAINS.map((domain) => (
          <link key={`dns-${domain}`} rel="dns-prefetch" href={domain} />
        ))}
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
