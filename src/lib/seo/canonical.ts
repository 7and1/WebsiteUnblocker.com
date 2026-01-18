import { siteConfig } from '@/config/site'
import { absoluteUrl } from '@/lib/utils'

/**
 * Canonical URL Handler
 *
 * Manages canonical URL generation for SEO, ensuring proper URL structure
 * and avoiding duplicate content issues.
 */

// URL parameters to strip for canonical URLs
const STRIP_PARAMS = new Set([
  // Analytics and tracking
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'msclkid',
  'ref',
  'source',
  // Session and user identifiers
  'session_id',
  'user_id',
  // Pagination (use rel=prev/next instead)
  'page',
  // Sorting and filtering
  'sort',
  'filter',
  'order',
  // Internal tracking
  'referrer',
  'click_id',
  // Query strings
  'q',
  'search',
])

/**
 * Strip query parameters that shouldn't affect canonical URL
 */
export function stripTrackingParams(url: string): string {
  try {
    const parsed = new URL(url)
    const params = new URLSearchParams(parsed.search)

    // Remove tracking parameters
    for (const param of STRIP_PARAMS) {
      params.delete(param)
    }

    // Rebuild URL with cleaned params
    parsed.search = params.toString()
    return parsed.toString()
  } catch {
    return url
  }
}

/**
 * Get canonical URL for a given path
 * Ensures HTTPS, removes www, and strips tracking params
 */
export function getCanonicalUrl(path: string, includeHost = true): string {
  // Build absolute URL
  let url = includeHost ? absoluteUrl(path, siteConfig.url) : path

  // Strip tracking parameters
  url = stripTrackingParams(url)

  // Ensure HTTPS (should already be HTTPS from siteConfig)
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://')
  }

  // Remove www prefix for consistency
  if (url.includes('://www.')) {
    url = url.replace('://www.', '://')
  }

  // Remove trailing slash for consistency (except for homepage)
  if (url.length > 1 && url.endsWith('/')) {
    url = url.slice(0, -1)
  }

  // Remove index.html or index.php
  url = url.replace(/\/index\.(html|php)$/, '/')

  return url
}

/**
 * Normalize URL for comparison
 * Used to detect duplicate URLs with different formats
 */
export function normalizeUrl(url: string): string {
  return getCanonicalUrl(url, false).toLowerCase()
}

/**
 * Check if two URLs are functionally the same
 */
export function isSameUrl(url1: string, url2: string): boolean {
  return normalizeUrl(url1) === normalizeUrl(url2)
}

/**
 * Generate pagination URLs (prev/next)
 */
export interface PaginationUrls {
  canonical: string
  prev?: string
  next?: string
}

export function getPaginationUrls(
  path: string,
  currentPage: number,
  totalPages: number
): PaginationUrls {
  const basePath = path.replace(/\/page\/\d+$/, '')
  const canonical = currentPage === 1 ? basePath : `${basePath}/page/${currentPage}`

  const result: PaginationUrls = {
    canonical: getCanonicalUrl(canonical),
  }

  if (currentPage > 1) {
    result.prev = getCanonicalUrl(currentPage === 2 ? basePath : `${basePath}/page/${currentPage - 1}`)
  }

  if (currentPage < totalPages) {
    result.next = getCanonicalUrl(`${basePath}/page/${currentPage + 1}`)
  }

  return result
}

/**
 * Generate hreflang tags for international SEO
 */
export interface HreflangUrl {
  hreflang: string
  href: string
}

export function getHreflangTags(
  path: string,
  locales: Array<{ code: string; region?: string }> = []
): HreflangUrl[] {
  const canonical = getCanonicalUrl(path)

  // Default to English if no locales specified
  if (locales.length === 0) {
    return [
      { hreflang: 'x-default', href: canonical },
      { hreflang: 'en', href: canonical },
    ]
  }

  return [
    { hreflang: 'x-default', href: canonical },
    ...locales.map((locale) => ({
      hreflang: locale.region ? `${locale.code}-${locale.region}` : locale.code,
      href: canonical,
    })),
  ]
}

/**
 * Generate alternate URLs for syndicated content
 * Use when content is published on multiple platforms
 */
export function getSyndicationAlternatives(canonicalUrl: string): Array<{ type: string; url: string }> {
  return [
    { type: 'canonical', url: canonicalUrl },
    // Add AMP version if available
    // { type: 'amphtml', url: canonicalUrl.replace(/\/$/, '') + '/amp' },
  ]
}

/**
 * Parse and validate URL for safe use in canonical tags
 */
export function safeCanonicalUrl(url: string): string | null {
  try {
    // Must be http or https
    if (!url.match(/^https?:\/\//i)) {
      return null
    }

    const parsed = new URL(url)

    // Must be same domain
    if (parsed.hostname !== siteConfig.domain &&
        parsed.hostname !== `www.${siteConfig.domain}`) {
      return null
    }

    // Return canonical form
    return getCanonicalUrl(parsed.pathname + parsed.search)
  } catch {
    return null
  }
}

/**
 * Build Open Graph URL (always absolute)
 */
export function getOpenGraphUrl(path: string): string {
  return absoluteUrl(path, siteConfig.url)
}

/**
 * Build Twitter Card URL (always absolute, no tracking params)
 */
export function getTwitterCardUrl(path: string): string {
  return getCanonicalUrl(path)
}
