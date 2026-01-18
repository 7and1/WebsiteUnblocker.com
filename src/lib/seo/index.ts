import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { absoluteUrl } from '@/lib/utils'

export function buildMetadata({
  title,
  description,
  path,
}: {
  title: string
  description?: string
  path?: string
}): Metadata {
  const url = path ? absoluteUrl(path, siteConfig.url) : siteConfig.url

  return {
    title,
    description: description || siteConfig.description,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      siteName: siteConfig.name,
      title,
      description: description || siteConfig.description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description || siteConfig.description,
    },
  }
}

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

export function buildArticleSchema({
  title,
  description,
  slug,
  datePublished,
  dateModified,
}: {
  title: string
  description?: string
  slug: string
  datePublished?: string
  dateModified?: string
}) {
  const url = absoluteUrl(`/blog/${slug}`, siteConfig.url)
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description || siteConfig.description,
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: url,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
  }
}
