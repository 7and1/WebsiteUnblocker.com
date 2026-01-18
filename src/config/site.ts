import { env } from '@/lib/env'

/**
 * Site Configuration
 *
 * Affiliate IDs are loaded from environment variables for production.
 * Set these in your environment:
 * - AFF_NORDVPN: Your NordVPN affiliate ID
 * - AFF_EXPRESSVPN: Your ExpressVPN affiliate ID
 * - AFF_SURFSHARK: Your Surfshark affiliate ID
 *
 * Without affiliate IDs set, the links will use the base URL without tracking.
 */

export const siteConfig = {
  name: 'WebsiteUnblocker',
  domain: 'websiteunblocker.com',
  url: 'https://websiteunblocker.com',
  description: 'Free tool to check if websites are blocked in your region and find solutions to unblock them.',
  keywords: [
    'website unblocker',
    'unblock websites',
    'bypass geo restrictions',
    'VPN recommendations',
    'website access checker',
    'unblock youtube',
    'unblock twitter',
    'unblock tiktok',
  ],
  nav: [
    { label: 'Guides', href: '/blog' },
    { label: 'Tools', href: '/tools' },
    { label: 'Unblock', href: '/unblock' },
    { label: 'Compare', href: '/compare' },
  ],
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
  affiliates: {
    // NordVPN affiliate link
    // Base URL: https://go.nordvpn.net/aff_c?offer_id=15
    // Set AFF_NORDVPN environment variable to add &aff_id=YOUR_ID
    nordvpn: env.affNordvpn
      ? `https://go.nordvpn.net/aff_c?offer_id=15&aff_id=${env.affNordvpn}`
      : 'https://go.nordvpn.net/aff_c?offer_id=15',

    // ExpressVPN affiliate link
    // Base URL: https://www.expressvpn.com/aff
    // Set AFF_EXPRESSVPN environment variable to add /YOUR_ID
    expressvpn: env.affExpressvpn
      ? `https://www.expressvpn.com/aff/${env.affExpressvpn}`
      : 'https://www.expressvpn.com/aff',

    // Surfshark affiliate link
    // Base URL: https://surfshark.com/aff
    // Set AFF_SURFSHARK environment variable to add /YOUR_ID
    surfshark: env.affSurfshark
      ? `https://surfshark.com/aff/${env.affSurfshark}`
      : 'https://surfshark.com/aff',
  },
  social: {
    twitter: 'https://twitter.com/websiteunblocker',
  },
  contact: {
    email: 'support@websiteunblocker.com',
  },
}
