import { siteConfig } from '@/config/site'
import { absoluteUrl } from '@/lib/utils'
import { tools, vpnComparisons, vpnBestFor, vpnProviders } from '@/lib/content'

export const runtime = 'edge'

interface SitemapUrlEntry {
  path: string
  priority: number
  changefreq: string
  lastmod?: string
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

function buildSitemapUrl(
  path: string,
  { priority, changefreq, lastmod }: { priority: number; changefreq: string; lastmod?: string }
) {
  const url = absoluteUrl(path, siteConfig.url)
  const parts = [
    '<url>',
    `<loc>${escapeXml(url)}</loc>`,
    `<changefreq>${changefreq}</changefreq>`,
    `<priority>${priority.toFixed(1)}</priority>`,
  ]

  if (lastmod) {
    parts.push(`<lastmod>${escapeXml(new Date(lastmod).toISOString())}</lastmod>`)
  }

  parts.push('</url>')
  return parts.join('')
}

export async function GET() {
  const now = new Date().toISOString()
  const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const staticPages: SitemapUrlEntry[] = [
    { path: '/', priority: 1.0, changefreq: 'daily', lastmod: now },
    { path: '/affiliate-disclosure', priority: 0.4, changefreq: 'yearly', lastmod: '2026-01-01' },
    { path: '/tools', priority: 0.7, changefreq: 'monthly', lastmod: lastMonth },
    { path: '/unblock', priority: 0.8, changefreq: 'weekly', lastmod: now },
    { path: '/blocked', priority: 0.7, changefreq: 'weekly', lastmod: now },
    { path: '/compare', priority: 0.6, changefreq: 'monthly', lastmod: lastMonth },
    { path: '/vpn', priority: 0.7, changefreq: 'monthly', lastmod: lastMonth },
    { path: '/about', priority: 0.5, changefreq: 'yearly', lastmod: '2026-01-01' },
    { path: '/contact', priority: 0.4, changefreq: 'yearly', lastmod: '2026-01-01' },
    { path: '/privacy', priority: 0.5, changefreq: 'yearly', lastmod: '2026-01-01' },
    { path: '/terms', priority: 0.5, changefreq: 'yearly', lastmod: '2026-01-01' },
  ]

  const toolPages = tools.map((tool) =>
    buildSitemapUrl(`/tools/${tool.slug}`, {
      priority: 0.6,
      changefreq: 'monthly',
      lastmod: lastMonth,
    })
  )

  const comparisonPages = vpnComparisons.map((comparison) =>
    buildSitemapUrl(`/compare/${comparison.slug}`, {
      priority: 0.5,
      changefreq: 'monthly',
      lastmod: lastMonth,
    })
  )

  const vpnPages = vpnProviders.map((provider) =>
    buildSitemapUrl(`/vpn/${provider.slug}-review`, {
      priority: 0.6,
      changefreq: 'monthly',
      lastmod: lastMonth,
    })
  )

  const vpnBestPages = vpnBestFor.map((item) =>
    buildSitemapUrl(`/vpn/${item.slug}`, {
      priority: 0.6,
      changefreq: 'monthly',
      lastmod: lastMonth,
    })
  )

  const urls = [
    ...staticPages.map((page) =>
      buildSitemapUrl(page.path, {
        priority: page.priority,
        changefreq: page.changefreq,
        lastmod: page.lastmod,
      })
    ),
    ...toolPages,
    ...comparisonPages,
    ...vpnPages,
    ...vpnBestPages,
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
    },
  })
}
