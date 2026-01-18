import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { buildMetadata, buildFaqSchema, buildBreadcrumbSchema } from '@/lib/seo'

/**
 * Programmatic SEO Page Generator
 *
 * Generates metadata, schema, and content for:
 * - "Unblock [website]" pages
 * - "VPN for [country]" pages
 * - "[VPN1] vs [VPN2]" comparison pages
 */

// ============================================================================
// Data Sources
// ============================================================================

export const popularWebsites = [
  // Streaming
  { slug: 'youtube', name: 'YouTube', category: 'Streaming', blockedIn: ['China', 'Iran', 'Pakistan'] },
  { slug: 'netflix', name: 'Netflix', category: 'Streaming', blockedIn: ['China', 'Russia', 'Syria'] },
  { slug: 'hulu', name: 'Hulu', category: 'Streaming', blockedIn: ['Outside US'] },
  { slug: 'disney-plus', name: 'Disney+', category: 'Streaming', blockedIn: ['Some regions'] },
  { slug: 'bbc-iplayer', name: 'BBC iPlayer', category: 'Streaming', blockedIn: ['Outside UK'] },
  { slug: 'hbo-max', name: 'HBO Max', category: 'Streaming', blockedIn: ['Outside US/LATAM'] },
  { slug: 'paramount-plus', name: 'Paramount+', category: 'Streaming', blockedIn: ['Some regions'] },
  { slug: 'peacock', name: 'Peacock', category: 'Streaming', blockedIn: ['Outside US'] },
  { slug: 'amazon-prime', name: 'Prime Video', category: 'Streaming', blockedIn: ['Some regions'] },
  { slug: 'twitch', name: 'Twitch', category: 'Streaming', blockedIn: ['China', 'Russia'] },

  // Social Media
  { slug: 'twitter', name: 'Twitter/X', category: 'Social', blockedIn: ['China', 'Iran', 'Russia'] },
  { slug: 'facebook', name: 'Facebook', category: 'Social', blockedIn: ['China', 'Iran', 'Bangladesh'] },
  { slug: 'instagram', name: 'Instagram', category: 'Social', blockedIn: ['China', 'Iran', 'North Korea'] },
  { slug: 'tiktok', name: 'TikTok', category: 'Social', blockedIn: ['India', 'Some schools'] },
  { slug: 'reddit', name: 'Reddit', category: 'Social', blockedIn: ['China', 'Indonesia'] },
  { slug: 'pinterest', name: 'Pinterest', category: 'Social', blockedIn: ['Some regions'] },
  { slug: 'snapchat', name: 'Snapchat', category: 'Social', blockedIn: ['Some regions'] },
  { slug: 'linkedin', name: 'LinkedIn', category: 'Social', blockedIn: ['China', 'Russia'] },
  { slug: 'tumblr', name: 'Tumblr', category: 'Social', blockedIn: ['Some regions'] },

  // Messaging
  { slug: 'whatsapp', name: 'WhatsApp', category: 'Messaging', blockedIn: ['China', 'UAE', 'Iran'] },
  { slug: 'telegram', name: 'Telegram', category: 'Messaging', blockedIn: ['China', 'Iran'] },
  { slug: 'signal', name: 'Signal', category: 'Messaging', blockedIn: ['Some regions'] },
  { slug: 'discord', name: 'Discord', category: 'Messaging', blockedIn: ['China', 'Some schools'] },
  { slug: 'viber', name: 'Viber', category: 'Messaging', blockedIn: ['Some regions'] },
  { slug: 'wechat', name: 'WeChat', category: 'Messaging', blockedIn: ['Some regions'] },
  { slug: 'line', name: 'LINE', category: 'Messaging', blockedIn: ['Some regions'] },
  { slug: 'threema', name: 'Threema', category: 'Messaging', blockedIn: ['Some regions'] },

  // Gaming
  { slug: 'roblox', name: 'Roblox', category: 'Gaming', blockedIn: ['Some schools'] },
  { slug: 'steam', name: 'Steam', category: 'Gaming', blockedIn: ['China', 'Some schools'] },
  { slug: 'epic-games', name: 'Epic Games', category: 'Gaming', blockedIn: ['Some regions'] },
  { slug: 'origin', name: 'Origin', category: 'Gaming', blockedIn: ['Some regions'] },
  { slug: 'battle-net', name: 'Battle.net', category: 'Gaming', blockedIn: ['Some regions'] },

  // Music
  { slug: 'spotify', name: 'Spotify', category: 'Music', blockedIn: ['Some regions'] },
  { slug: 'apple-music', name: 'Apple Music', category: 'Music', blockedIn: ['Some regions'] },
  { slug: 'youtube-music', name: 'YouTube Music', category: 'Music', blockedIn: ['Some regions'] },
  { slug: 'soundcloud', name: 'SoundCloud', category: 'Music', blockedIn: ['Some regions'] },
  { slug: 'pandora', name: 'Pandora', category: 'Music', blockedIn: ['Outside US'] },
  { slug: 'deezer', name: 'Deezer', category: 'Music', blockedIn: ['Some regions'] },

  // AI/Tools
  { slug: 'chatgpt', name: 'ChatGPT', category: 'AI', blockedIn: ['China', 'Iran', 'Russia'] },
  { slug: 'claude', name: 'Claude', category: 'AI', blockedIn: ['Some regions'] },
  { slug: 'bing', name: 'Bing AI', category: 'AI', blockedIn: ['Some regions'] },

  // Education/Reference
  { slug: 'wikipedia', name: 'Wikipedia', category: 'Education', blockedIn: ['China', 'Some schools'] },
  { slug: 'google', name: 'Google', category: 'Search', blockedIn: ['China', 'Some schools'] },
  { slug: 'github', name: 'GitHub', category: 'Development', blockedIn: ['Some regions'] },
]

export const countries = [
  { slug: 'usa', name: 'United States', code: 'US', region: 'North America' },
  { slug: 'uk', name: 'United Kingdom', code: 'GB', region: 'Europe' },
  { slug: 'canada', name: 'Canada', code: 'CA', region: 'North America' },
  { slug: 'australia', name: 'Australia', code: 'AU', region: 'Oceania' },
  { slug: 'germany', name: 'Germany', code: 'DE', region: 'Europe' },
  { slug: 'france', name: 'France', code: 'FR', region: 'Europe' },
  { slug: 'japan', name: 'Japan', code: 'JP', region: 'Asia' },
  { slug: 'india', name: 'India', code: 'IN', region: 'Asia' },
  { slug: 'brazil', name: 'Brazil', code: 'BR', region: 'South America' },
  { slug: 'italy', name: 'Italy', code: 'IT', region: 'Europe' },
  { slug: 'spain', name: 'Spain', code: 'ES', region: 'Europe' },
  { slug: 'mexico', name: 'Mexico', code: 'MX', region: 'North America' },
  { slug: 'south-korea', name: 'South Korea', code: 'KR', region: 'Asia' },
  { slug: 'netherlands', name: 'Netherlands', code: 'NL', region: 'Europe' },
  { slug: 'singapore', name: 'Singapore', code: 'SG', region: 'Asia' },
  { slug: 'china', name: 'China', code: 'CN', region: 'Asia', needsVPN: true },
  { slug: 'russia', name: 'Russia', code: 'RU', region: 'Europe/Asia', needsVPN: true },
  { slug: 'uae', name: 'UAE', code: 'AE', region: 'Middle East', needsVPN: true },
  { slug: 'turkey', name: 'Turkey', code: 'TR', region: 'Europe/Asia' },
  { slug: 'saudi-arabia', name: 'Saudi Arabia', code: 'SA', region: 'Middle East' },
  { slug: 'egypt', name: 'Egypt', code: 'EG', region: 'Africa' },
  { slug: 'south-africa', name: 'South Africa', code: 'ZA', region: 'Africa' },
  { slug: 'argentina', name: 'Argentina', code: 'AR', region: 'South America' },
  { slug: 'colombia', name: 'Colombia', code: 'CO', region: 'South America' },
  { slug: 'poland', name: 'Poland', code: 'PL', region: 'Europe' },
  { slug: 'sweden', name: 'Sweden', code: 'SE', region: 'Europe' },
  { slug: 'norway', name: 'Norway', code: 'NO', region: 'Europe' },
  { slug: 'denmark', name: 'Denmark', code: 'DK', region: 'Europe' },
  { slug: 'finland', name: 'Finland', code: 'FI', region: 'Europe' },
  { slug: 'switzerland', name: 'Switzerland', code: 'CH', region: 'Europe' },
  { slug: 'austria', name: 'Austria', code: 'AT', region: 'Europe' },
  { slug: 'belgium', name: 'Belgium', code: 'BE', region: 'Europe' },
  { slug: 'ireland', name: 'Ireland', code: 'IE', region: 'Europe' },
  { slug: 'new-zealand', name: 'New Zealand', code: 'NZ', region: 'Oceania' },
  { slug: 'thailand', name: 'Thailand', code: 'TH', region: 'Asia' },
  { slug: 'vietnam', name: 'Vietnam', code: 'VN', region: 'Asia' },
  { slug: 'philippines', name: 'Philippines', code: 'PH', region: 'Asia' },
  { slug: 'malaysia', name: 'Malaysia', code: 'MY', region: 'Asia' },
  { slug: 'indonesia', name: 'Indonesia', code: 'ID', region: 'Asia' },
  { slug: 'pakistan', name: 'Pakistan', code: 'PK', region: 'Asia', needsVPN: true },
  { slug: 'bangladesh', name: 'Bangladesh', code: 'BD', region: 'Asia' },
  { slug: 'iran', name: 'Iran', code: 'IR', region: 'Asia', needsVPN: true },
  { slug: 'israel', name: 'Israel', code: 'IL', region: 'Middle East' },
  { slug: 'greece', name: 'Greece', code: 'GR', region: 'Europe' },
  { slug: 'portugal', name: 'Portugal', code: 'PT', region: 'Europe' },
  { slug: 'czech-republic', name: 'Czech Republic', code: 'CZ', region: 'Europe' },
  { slug: 'hungary', name: 'Hungary', code: 'HU', region: 'Europe' },
  { slug: 'romania', name: 'Romania', code: 'RO', region: 'Europe' },
]

export const vpnProviders = [
  { slug: 'nordvpn', name: 'NordVPN', rating: 9.6, price: '$3.39/mo' },
  { slug: 'expressvpn', name: 'ExpressVPN', rating: 9.2, price: '$6.67/mo' },
  { slug: 'surfshark', name: 'Surfshark', rating: 9.0, price: '$2.49/mo' },
  { slug: 'protonvpn', name: 'Proton VPN', rating: 8.7, price: '$4.99/mo' },
  { slug: 'cyberghost', name: 'CyberGhost', rating: 8.5, price: '$2.19/mo' },
  { slug: 'private-internet-access', name: 'PIA', rating: 8.3, price: '$2.19/mo' },
  { slug: 'mullvad', name: 'Mullvad', rating: 8.2, price: '$5.00/mo' },
  { slug: 'ivacy', name: 'Ivacy', rating: 8.0, price: '$1.33/mo' },
]

// ============================================================================
// Unblock Website Page Generator
// ============================================================================

export interface UnblockPageData {
  website: typeof popularWebsites[number]
  metadata: Metadata
  faqSchema: ReturnType<typeof buildFaqSchema>
  breadcrumbSchema: ReturnType<typeof buildBreadcrumbSchema>
  internalLinks: Array<{ title: string; href: string }>
  content: {
    introduction: string
    methods: Array<{ title: string; description: string; steps: string[] }>
    recommendations: Array<{ name: string; reason: string }>
  }
}

export function generateUnblockPage(websiteSlug: string): UnblockPageData | null {
  const website = popularWebsites.find(w => w.slug === websiteSlug)
  if (!website) return null

  const title = `How to Unblock ${website.name} - Complete Guide`
  const description = `Learn how to unblock ${website.name} from anywhere. Discover the best VPNs and methods to access ${website.name} in regions where it's blocked.`

  const metadata = buildMetadata({
    title,
    description,
    path: `/unblock/${websiteSlug}`,
    keywords: [
      `unblock ${website.name}`,
      `access ${website.name}`,
      `${website.name} VPN`,
      `bypass ${website.name} block`,
      `${website.name} blocked`,
      ...website.blockedIn.flatMap(c => [`${website.name} in ${c}`, `unblock ${website.name} in ${c}`]),
    ],
  })

  const faqs = [
    {
      question: `Why is ${website.name} blocked?`,
      answer: `${website.name} may be blocked due to government censorship, network restrictions at schools or workplaces, or geo-restrictions based on your location.`,
    },
    {
      question: `Is it legal to unblock ${website.name}?`,
      answer: `In most countries, using a VPN to access blocked websites is legal. However, you should always check your local laws and terms of service.`,
    },
    {
      question: `What is the best VPN for ${website.name}?`,
      answer: `NordVPN, ExpressVPN, and Surfshark are among the best VPNs for unblocking ${website.name} due to their fast speeds and reliable bypass capabilities.`,
    },
    {
      question: `Can I use a free VPN to unblock ${website.name}?`,
      answer: `Free VPNs often have limitations and may not reliably unblock ${website.name}. Paid VPNs offer better performance, security, and unblocking success.`,
    },
  ]

  const faqSchema = buildFaqSchema(faqs)
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Unblock', path: '/unblock' },
    { name: website.name, path: `/unblock/${websiteSlug}` },
  ])

  // Generate internal links based on category
  const relatedWebsites = popularWebsites
    .filter(w => w.category === website.category && w.slug !== websiteSlug)
    .slice(0, 5)

  const internalLinks: Array<{ title: string; href: string }> = [
    ...relatedWebsites.map(w => ({
      title: `Unblock ${w.name}`,
      href: `/unblock/${w.slug}`,
    })),
    { title: 'Best VPNs for Streaming', href: '/vpn/best-for-streaming' },
    { title: 'VPN Comparison', href: '/compare' },
  ]

  const content = {
    introduction: `If you're trying to access ${website.name} but find it blocked, you're not alone. ${website.name} is restricted in several regions including ${website.blockedIn.slice(0, 3).join(', ')}. This comprehensive guide will show you the most effective methods to unblock ${website.name} and access your content from anywhere.`,
    methods: [
      {
        title: 'Use a Premium VPN',
        description: 'A VPN (Virtual Private Network) is the most reliable way to bypass restrictions.',
        steps: [
          `Choose a VPN with servers in supported regions`,
          `Download and install the VPN app`,
          `Connect to a server where ${website.name} is available`,
          `Access ${website.name} without restrictions`,
        ],
      },
      {
        title: 'Try a Smart DNS Service',
        description: 'Smart DNS can unblock content without encrypting your connection.',
        steps: [
          `Sign up for a Smart DNS service`,
          `Configure your device's DNS settings`,
          `Access ${website.name} directly`,
        ],
      },
      {
        title: 'Use a Proxy Service',
        description: 'Web proxies can provide basic unblocking capabilities.',
        steps: [
          `Find a reliable web proxy`,
          `Enter the ${website.name} URL`,
          `Browse through the proxy interface`,
        ],
      },
    ],
    recommendations: [
      { name: 'NordVPN', reason: `Excellent at unblocking ${website.name} with fast speeds` },
      { name: 'ExpressVPN', reason: `Reliable access with user-friendly apps` },
      { name: 'Surfshark', reason: `Budget-friendly with unlimited devices` },
    ],
  }

  return { website, metadata, faqSchema, breadcrumbSchema, internalLinks, content }
}

// ============================================================================
// VPN for Country Page Generator
// ============================================================================

export interface CountryPageData {
  country: typeof countries[number]
  metadata: Metadata
  faqSchema: ReturnType<typeof buildFaqSchema>
  breadcrumbSchema: ReturnType<typeof buildBreadcrumbSchema>
  internalLinks: Array<{ title: string; href: string }>
  content: {
    introduction: string
    considerations: string[]
    recommendations: Array<{ name: string; rating: number; reason: string }>
  }
}

export function generateCountryPage(countrySlug: string): CountryPageData | null {
  const country = countries.find(c => c.slug === countrySlug)
  if (!country) return null

  const title = `Best VPN for ${country.name} - Top Picks for ${country.code}`
  const description = `Discover the best VPN services for ${country.name}. Our expert picks for privacy, speed, and reliability in ${country.name}.`

  const metadata = buildMetadata({
    title,
    description,
    path: `/vpn/${countrySlug}`,
    keywords: [
      `VPN ${country.name}`,
      `best VPN ${country.name}`,
      `${country.code} VPN`,
      `VPN in ${country.name}`,
      country.needsVPN ? `internet censorship ${country.name}` : `privacy ${country.name}`,
    ],
  })

  const faqs = [
    {
      question: `Do I need a VPN in ${country.name}?`,
      answer: country.needsVPN
        ? `Yes, ${country.name} has significant internet restrictions. A VPN is essential for accessing blocked content and maintaining privacy.`
        : `While ${country.name} has relatively open internet, a VPN provides privacy protection and access to geo-restricted content.`,
    },
    {
      question: `Is using a VPN legal in ${country.name}?`,
      answer: `VPN usage is legal in ${country.name} for legitimate purposes. Always check current local laws.`,
    },
    {
      question: `What should I look for in a VPN for ${country.name}?`,
      answer: `Look for servers in or near ${country.name}, fast speeds, strong encryption, and reliable customer support.`,
    },
  ]

  const faqSchema = buildFaqSchema(faqs)
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'VPN', path: '/vpn' },
    { name: country.name, path: `/vpn/${countrySlug}` },
  ])

  const nearbyCountries = countries
    .filter(c => c.region === country.region && c.slug !== countrySlug)
    .slice(0, 3)

  const internalLinks: Array<{ title: string; href: string }> = [
    ...nearbyCountries.map(c => ({
      title: `VPN for ${c.name}`,
      href: `/vpn/${c.slug}`,
    })),
    { title: 'VPN Comparison', href: '/compare' },
    { title: 'Best VPNs for Privacy', href: '/vpn/best-for-privacy' },
  ]

  const content = {
    introduction: `Finding the right VPN for ${country.name} requires considering local internet conditions, server availability, and your specific needs. Our recommendations prioritize privacy, speed, and reliability for users in ${country.name}.`,
    considerations: [
      `Server locations in or near ${country.name}`,
      `Speed and latency for ${country.region} connections`,
      `Privacy laws and jurisdiction`,
      `Customer support availability in your time zone`,
      `Payment methods available in ${country.name}`,
    ],
    recommendations: [
      { name: 'NordVPN', rating: 9.6, reason: `Extensive server network with good coverage in ${country.region}` },
      { name: 'ExpressVPN', rating: 9.2, reason: `Reliable performance with local servers` },
      { name: 'Surfshark', rating: 9.0, reason: `Great value with strong privacy features` },
    ],
  }

  return { country, metadata, faqSchema, breadcrumbSchema, internalLinks, content }
}

// ============================================================================
// VPN Comparison Page Generator
// ============================================================================

export interface ComparisonPageData {
  vpn1: typeof vpnProviders[number]
  vpn2: typeof vpnProviders[number]
  metadata: Metadata
  faqSchema: ReturnType<typeof buildFaqSchema>
  breadcrumbSchema: ReturnType<typeof buildBreadcrumbSchema>
  comparison: {
    winner: string
    winnerReason: string
    categories: Array<{
      name: string
      vpn1Score: number
      vpn2Score: number
      winner: 'vpn1' | 'vpn2' | 'tie'
      description: string
    }>
  }
}

export function generateComparisonPage(vpn1Slug: string, vpn2Slug: string): ComparisonPageData | null {
  const vpn1 = vpnProviders.find(v => v.slug === vpn1Slug)
  const vpn2 = vpnProviders.find(v => v.slug === vpn2Slug)

  if (!vpn1 || !vpn2) return null

  const title = `${vpn1.name} vs ${vpn2.name} - Complete Comparison`
  const description = `Compare ${vpn1.name} vs ${vpn2.name} side by side. See which VPN wins on speed, price, streaming, and privacy.`

  const metadata = buildMetadata({
    title,
    description,
    path: `/compare/${vpn1Slug}-vs-${vpn2Slug}`,
    keywords: [
      `${vpn1.name} vs ${vpn2.name}`,
      `${vpn2.name} vs ${vpn1.name}`,
      `compare ${vpn1.name}`,
      `compare ${vpn2.name}`,
      `which VPN is better`,
    ],
  })

  const faqs = [
    {
      question: `Which is better: ${vpn1.name} or ${vpn2.name}?`,
      answer: `${vpn1.rating > vpn2.rating ? vpn1.name : vpn2.name} edges out with a higher rating, but the best choice depends on your specific needs and budget.`,
    },
    {
      question: `Is ${vpn1.name} worth the extra cost over ${vpn2.name}?`,
      answer: `${vpn1.name} offers premium features that justify the cost for power users. Budget-conscious users may prefer ${vpn2.name}.`,
    },
    {
      question: `Do both VPNs unblock streaming services?`,
      answer: `Both ${vpn1.name} and ${vpn2.name} reliably unblock major streaming platforms, though performance may vary by region.`,
    },
  ]

  const faqSchema = buildFaqSchema(faqs)
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Compare', path: '/compare' },
    { name: `${vpn1.name} vs ${vpn2.name}`, path: `/compare/${vpn1Slug}-vs-${vpn2Slug}` },
  ])

  const winner = vpn1.rating > vpn2.rating ? vpn1.name : vpn2.name
  const winnerReason = winner === vpn1.name
    ? `${vpn1.name} wins with superior performance and features.`
    : `${vpn2.name} offers better value and performance.`

  const comparison = {
    winner,
    winnerReason,
    categories: [
      {
        name: 'Pricing',
        vpn1Score: parseFloat(vpn1.price.replace(/[^\d.]/g, '')) < parseFloat(vpn2.price.replace(/[^\d.]/g, '')) ? 9 : 7,
        vpn2Score: parseFloat(vpn2.price.replace(/[^\d.]/g, '')) < parseFloat(vpn1.price.replace(/[^\d.]/g, '')) ? 9 : 7,
        winner: (parseFloat(vpn1.price.replace(/[^\d.]/g, '')) < parseFloat(vpn2.price.replace(/[^\d.]/g, '')) ? 'vpn1' : 'vpn2') as 'vpn1' | 'vpn2' | 'tie',
        description: `${vpn1.price} vs ${vpn2.price} - ${
          parseFloat(vpn1.price.replace(/[^\d.]/g, '')) < parseFloat(vpn2.price.replace(/[^\d.]/g, '')) ? vpn1.name : vpn2.name
        } is more affordable.`,
      },
      {
        name: 'Speed',
        vpn1Score: vpn1.rating > vpn2.rating ? 9 : 8,
        vpn2Score: vpn2.rating > vpn1.rating ? 9 : 8,
        winner: (vpn1.rating > vpn2.rating ? 'vpn1' : 'vpn2') as 'vpn1' | 'vpn2' | 'tie',
        description: `Based on performance tests, ${vpn1.rating > vpn2.rating ? vpn1.name : vpn2.name} has faster connections.`,
      },
      {
        name: 'Streaming',
        vpn1Score: 9,
        vpn2Score: 9,
        winner: 'tie' as const,
        description: 'Both VPNs reliably unblock Netflix, Hulu, and other major streaming services.',
      },
      {
        name: 'Privacy',
        vpn1Score: 9,
        vpn2Score: 9,
        winner: 'tie' as const,
        description: 'Both providers maintain strict no-logs policies and use strong encryption.',
      },
      {
        name: 'Ease of Use',
        vpn1Score: 9,
        vpn2Score: 9,
        winner: 'tie' as const,
        description: 'Both offer user-friendly apps for all major platforms.',
      },
    ],
  }

  return { vpn1, vpn2, metadata, faqSchema, breadcrumbSchema, comparison }
}

// ============================================================================
// Sitemap Generation Helpers
// ============================================================================

export function getAllUnblockPaths(): string[] {
  return popularWebsites.map(w => `/unblock/${w.slug}`)
}

export function getAllCountryPaths(): string[] {
  return countries.map(c => `/vpn/${c.slug}`)
}

export function getAllComparisonPaths(): string[] {
  const paths: string[] = []
  for (let i = 0; i < vpnProviders.length; i++) {
    for (let j = i + 1; j < vpnProviders.length; j++) {
      paths.push(`/compare/${vpnProviders[i].slug}-vs-${vpnProviders[j].slug}`)
    }
  }
  return paths
}

// ============================================================================
// Export all data for static generation
// ============================================================================

export const programmaticSeoData = {
  popularWebsites,
  countries,
  vpnProviders,
  allPaths: {
    unblock: getAllUnblockPaths(),
    countries: getAllCountryPaths(),
    comparisons: getAllComparisonPaths(),
  },
}
