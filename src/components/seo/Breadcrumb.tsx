'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { JsonLd } from './JsonLd'

export interface BreadcrumbItem {
  name: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  schema?: boolean
  variant?: 'default' | 'minimal' | 'centered'
}

/**
 * Breadcrumb component with:
 * - Schema markup for SEO
 * - Proper navigation structure
 * - Mobile-friendly display
 * - Home > Category > Page hierarchy
 */
export function Breadcrumb({
  items,
  className,
  schema = true,
  variant = 'default',
}: BreadcrumbProps) {
  // Add Home as first item if not present
  const breadcrumbItems: BreadcrumbItem[] = items[0]?.name === 'Home'
    ? items
    : [{ name: 'Home', href: '/' }, ...items]

  // Generate schema.org markup
  const generateSchema = () => {
    if (!schema) return null

    const itemList = breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.href && !item.current && {
        item: typeof window !== 'undefined'
          ? new URL(item.href, window.location.origin).href
          : item.href,
      }),
    }))

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: itemList,
    }
  }

  const breadcrumbSchema = generateSchema()

  return (
    <>
      {breadcrumbSchema && <JsonLd data={breadcrumbSchema} />}
      <nav
        className={cn(
          'flex items-center',
          variant === 'centered' && 'justify-center',
          variant === 'minimal' && 'text-sm',
          className
        )}
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center flex-wrap gap-1 md:gap-2">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1

            return (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-slate-400 mx-1 flex-shrink-0" />
                )}

                {item.href && !item.current ? (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1 hover:text-emerald-600 transition-colors',
                      variant === 'minimal' ? 'text-slate-600' : 'text-slate-500',
                      index === 0 && 'text-slate-400 hover:text-slate-600'
                    )}
                  >
                    {index === 0 && <Home className="w-4 h-4" />}
                    <span className="line-clamp-1">{item.name}</span>
                  </Link>
                ) : (
                  <span
                    className={cn(
                      'flex items-center gap-1 line-clamp-1',
                      variant === 'minimal' ? 'text-slate-900 font-medium' : 'text-slate-900 font-semibold',
                      index === 0 && 'text-slate-400'
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {index === 0 && <Home className="w-4 h-4" />}
                    {item.name}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}

/**
 * Simplified breadcrumb from path string
 * Automatically generates breadcrumbs from URL path
 */
interface BreadcrumbFromPathProps {
  path: string
  excludePaths?: string[]
  className?: string
}

export function BreadcrumbFromPath({
  path,
  excludePaths = [],
  className,
}: BreadcrumbFromPathProps) {
  // Remove trailing slash and split
  const segments = path.replace(/^\/|\/$/g, '').split('/').filter(Boolean)

  // Build breadcrumb items
  const items: BreadcrumbItem[] = segments
    .filter(segment => !excludePaths.includes(segment))
    .map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/')
      const name = formatBreadcrumbName(segment)

      return {
        name,
        href,
        current: index === segments.length - 1,
      }
    })

  return <Breadcrumb items={items} className={className} />
}

/**
 * Format URL segment into readable breadcrumb name
 */
function formatBreadcrumbName(segment: string): string {
  // Handle common slugs
  const formatted: Record<string, string> = {
    'blog': 'Blog',
    'guides': 'Guides',
    'unblock': 'Unblock',
    'compare': 'Compare',
    'tools': 'Tools',
    'vpn': 'VPN',
    'contact': 'Contact',
    'about': 'About',
    'privacy': 'Privacy Policy',
    'terms': 'Terms of Service',
  }

  if (formatted[segment]) {
    return formatted[segment]
  }

  // Capitalize and replace hyphens with spaces
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Compact breadcrumb for mobile
 * Shows only the last two items with ellipsis
 */
export function CompactBreadcrumb({
  items,
  className,
}: {
  items: BreadcrumbItem[]
  className?: string
}) {
  if (items.length <= 2) {
    return <Breadcrumb items={items} className={className} />
  }

  const firstItem = items[0]
  const lastItems = items.slice(-2)

  const compactItems: BreadcrumbItem[] = [
    firstItem,
    { name: '...' },
    ...lastItems,
  ]

  return <Breadcrumb items={compactItems} className={className} />
}
