import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { absoluteUrl } from '@/lib/utils'

// Default OG image paths
const DEFAULT_OG_IMAGE = '/opengraph-image'
const DEFAULT_TWITTER_IMAGE = '/twitter-image'

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

/**
 * Build comprehensive metadata with Open Graph and Twitter Card support
 */
export function buildMetadata(options: BuildMetadataOptions): Metadata {
  const {
    title,
    description,
    path,
    images,
    ogType = 'website',
    publishedTime,
    modifiedTime,
    authors,
    keywords,
    noIndex = false,
  } = options

  const url = path ? absoluteUrl(path, siteConfig.url) : siteConfig.url
  const siteDescription = description || siteConfig.description

  // Default OG images with fallback
  const defaultImages = [
    {
      url: absoluteUrl(DEFAULT_OG_IMAGE, siteConfig.url),
      width: 1200,
      height: 630,
      alt: title,
    },
  ]

  const ogImages = images && images.length > 0 ? images : defaultImages
  const twitterImages =
    images && images.length > 0
      ? ogImages.map((img) =>
          img.url.startsWith('http') ? img.url : absoluteUrl(img.url, siteConfig.url)
        )
      : [absoluteUrl(DEFAULT_TWITTER_IMAGE, siteConfig.url)]

  const metadata: Metadata = {
    title,
    description: siteDescription,
    keywords: keywords?.join(', '),
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: ogType,
      locale: 'en_US',
      url,
      siteName: siteConfig.name,
      title,
      description: siteDescription,
      images: ogImages.map((img) => ({
        url: img.url.startsWith('http') ? img.url : absoluteUrl(img.url, siteConfig.url),
        width: img.width || 1200,
        height: img.height || 630,
        alt: img.alt || title,
      })),
      ...(ogType === 'article' && {
        publishedTime,
        modifiedTime,
        authors,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: siteDescription,
      images: twitterImages,
      creator: '@websiteunblocker',
      site: '@websiteunblocker',
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  }

  return metadata
}

/**
 * Build article-specific metadata with proper Open Graph article tags
 */
export function buildArticleMetadata(options: {
  title: string
  description?: string
  slug: string
  publishedTime?: string
  modifiedTime?: string
  author?: string
  image?: string
  keywords?: string[]
}) {
  return buildMetadata({
    ...options,
    path: `/guides/${options.slug}`,
    ogType: 'article',
    authors: options.author ? [options.author] : [siteConfig.name],
    images: options.image
      ? [
          {
            url: options.image,
            width: 1200,
            height: 630,
            alt: options.title,
          },
        ]
      : undefined,
  })
}

/**
 * Build FAQ schema for structured data
 */
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

/**
 * Build organization schema for structured data
 */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/icons/icon-512x512.png', siteConfig.url),
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

/**
 * Build website schema with search action
 */
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

/**
 * Build breadcrumb schema for structured data
 */
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

/**
 * Build article schema for blog posts
 */
export function buildArticleSchema({
  title,
  description,
  slug,
  datePublished,
  dateModified,
  author,
  image,
}: {
  title: string
  description?: string
  slug: string
  datePublished?: string
  dateModified?: string
  author?: string
  image?: string
}) {
  const url = absoluteUrl(`/guides/${slug}`, siteConfig.url)
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description || siteConfig.description,
    image: image ? absoluteUrl(image, siteConfig.url) : undefined,
    author: {
      '@type': 'Organization',
      name: author || siteConfig.name,
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
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
  }
}

/**
 * Build SoftwareApplication schema for tools
 */
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
    offers: options.price
      ? {
          '@type': 'Offer',
          price: options.price,
          priceCurrency: 'USD',
        }
      : {
          '@type': 'Offer',
          price: '0',
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

// ============================================================================
// Programmatic SEO Metadata Generators
// ============================================================================

/**
 * Generate metadata for "Unblock [website]" pages
 * Creates optimized metadata with 150-160 character descriptions
 */
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

  // Truncate description to optimal length (150-160 chars)
  const truncatedDescription =
    description.length > 160 ? description.slice(0, 157) + '...' : description

  return buildMetadata({
    title,
    description: truncatedDescription,
    path: `/unblock/${website.toLowerCase().replace(/\s+/g, '-')}`,
    keywords: [
      `unblock ${website}`,
      `access ${website}`,
      `${website} VPN`,
      `bypass ${website} block`,
      `${website} blocked`,
      ...blockedIn.flatMap(c => [`${website} in ${c}`, `unblock ${website} in ${c}`]),
    ],
  })
}

/**
 * Generate metadata for VPN provider pages
 * Creates optimized metadata for VPN reviews and recommendations
 */
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

  const truncatedDescription =
    description.length > 160 ? description.slice(0, 157) + '...' : description

  return buildMetadata({
    title,
    description: truncatedDescription,
    path: `/vpn/${vpn.toLowerCase().replace(/\s+/g, '-')}`,
    keywords: [
      `${vpn} review`,
      `${vpn} VPN`,
      `best VPN`,
      `VPN comparison`,
      `${vpn} speed`,
      `${vpn} streaming`,
      `${vpn} pricing`,
    ],
  })
}

/**
 * Generate metadata for "VPN1 vs VPN2" comparison pages
 * Creates optimized metadata for head-to-head comparisons
 */
export function generateComparisonMetadata(options: {
  vpn1: string
  vpn2: string
  focus?: 'speed' | 'price' | 'streaming' | 'privacy' | 'overall'
}) {
  const { vpn1, vpn2, focus = 'overall' } = options

  const focusText = {
    speed: 'speed and performance',
    price: 'pricing and value',
    streaming: 'streaming capabilities',
    privacy: 'privacy and security',
    overall: 'features, speed, and value',
  }

  const title = `${vpn1} vs ${vpn2}: Which VPN is Better in ${new Date().getFullYear()}?`
  const description = `Compare ${vpn1} vs ${vpn2} side by side. We analyze ${focusText[focus]}, streaming, and more to help you choose the right VPN for your needs.`

  const truncatedDescription =
    description.length > 160 ? description.slice(0, 157) + '...' : description

  return buildMetadata({
    title,
    description: truncatedDescription,
    path: `/compare/${vpn1.toLowerCase().replace(/\s+/g, '-')}-vs-${vpn2.toLowerCase().replace(/\s+/g, '-')}`,
    keywords: [
      `${vpn1} vs ${vpn2}`,
      `${vpn2} vs ${vpn1}`,
      `compare ${vpn1}`,
      `compare ${vpn2}`,
      `which VPN is better`,
      `VPN comparison`,
      `VPN review`,
    ],
  })
}

/**
 * Generate metadata for "VPN for [country]" pages
 * Creates optimized metadata for country-specific VPN recommendations
 */
export function generateCountryMetadata(options: {
  country: string
  code?: string
  needsVPN?: boolean
  region?: string
}) {
  const { country, code = '', needsVPN = false, region = '' } = options

  const title = `Best VPN for ${country} - Top Picks for ${code || country}`
  const description = needsVPN
    ? `Discover the best VPNs for ${country} to bypass censorship and access blocked content. Our expert picks for privacy, speed, and reliability in ${country}.`
    : `Discover the best VPN services for ${country}. Our expert picks for privacy, speed, and reliability with servers in ${region || country}.`

  const truncatedDescription =
    description.length > 160 ? description.slice(0, 157) + '...' : description

  return buildMetadata({
    title,
    description: truncatedDescription,
    path: `/vpn/${country.toLowerCase().replace(/\s+/g, '-')}`,
    keywords: [
      `VPN ${country}`,
      `best VPN ${country}`,
      `${code} VPN`,
      `VPN in ${country}`,
      needsVPN ? `censorship ${country}` : `privacy ${country}`,
      `${country} internet`,
    ],
  })
}

/**
 * Generate metadata for "Best VPN for [use case]" pages
 * Creates optimized metadata for category-specific VPN recommendations
 */
export function generateUseCaseMetadata(options: {
  useCase: string
  focus: string
  audience?: string
}) {
  const { useCase, focus, audience = 'users' } = options

  const title = `Best VPN for ${useCase} - ${new Date().getFullYear()} Recommendations`
  const description = `Top VPN recommendations for ${useCase}. We rank providers based on ${focus}. Expert analysis for ${audience} who need reliable ${useCase.toLowerCase()} access.`

  const truncatedDescription =
    description.length > 160 ? description.slice(0, 157) + '...' : description

  const slug = useCase.toLowerCase().replace(/\s+/g, '-')

  return buildMetadata({
    title,
    description: truncatedDescription,
    path: `/vpn/${slug}`,
    keywords: [
      `VPN for ${useCase}`,
      `best VPN ${useCase}`,
      `${useCase} VPN`,
      `${useCase} streaming`,
      `${useCase} privacy`,
    ],
  })
}

/**
 * Generate Product schema for VPN reviews
 * Helps search engines display rich product information
 */
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

/**
 * Generate Review schema for VPN comparison pages
 * Helps search engines display review rich snippets
 */
export function buildReviewSchema(options: {
  itemName: string
  itemReviewed: string
  author: string
  rating: number
  reviewBody: string
  publisher?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'SoftwareApplication',
      name: options.itemReviewed,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
    },
    author: {
      '@type': 'Organization',
      name: options.author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: options.rating.toString(),
      bestRating: '10',
      worstRating: '1',
    },
    reviewBody: options.reviewBody,
    publisher: {
      '@type': 'Organization',
      name: options.publisher || siteConfig.name,
    },
  }
}

/**
 * Generate VideoObject schema for tutorial videos
 * Helps video content appear in search results
 */
export function buildVideoSchema(options: {
  name: string
  description: string
  thumbnailUrl: string
  uploadDate: string
  duration?: string
  embedUrl?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: options.name,
    description: options.description,
    thumbnailUrl: options.thumbnailUrl.startsWith('http')
      ? options.thumbnailUrl
      : absoluteUrl(options.thumbnailUrl, siteConfig.url),
    uploadDate: options.uploadDate,
    ...(options.duration && { duration: options.duration }),
    ...(options.embedUrl && { embedUrl: options.embedUrl }),
  }
}

/**
 * Generate HowTo schema for tutorial guides
 * Helps guides appear as rich how-to results
 */
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
