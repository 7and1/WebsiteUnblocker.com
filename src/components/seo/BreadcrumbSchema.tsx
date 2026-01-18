import { JsonLd } from './JsonLd'
import { siteConfig } from '@/config/site'
import { absoluteUrl } from '@/lib/utils'

export interface BreadcrumbItem {
  name: string
  path: string
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[]
}

/**
 * BreadcrumbList Schema component for Google Rich Results
 * @see https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
 */
export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, siteConfig.url),
    })),
  }

  return <JsonLd data={schema} />
}

/**
 * Helper function to build breadcrumb schema data for custom rendering
 */
export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
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
