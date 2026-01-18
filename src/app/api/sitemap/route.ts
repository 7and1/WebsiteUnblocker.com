import { siteConfig } from '@/config/site'
import { absoluteUrl } from '@/lib/utils'
import { unblockTargets, blockedTargets, tools, vpnComparisons, vpnBestFor, vpnProviders } from '@/lib/content'

// Use edge runtime - no Payload CMS dependency
export const runtime = 'edge'

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

function buildSitemapUrl(
  path: string,
  {
    priority,
    changefreq,
    lastmod,
  }: {
    priority: number
    changefreq: string
    lastmod?: string
  }
) {
  const url = absoluteUrl(path, siteConfig.url)
  return [
    '<url>',
    `<loc>${escapeXml(url)}</loc>`,
    `<changefreq>${changefreq}</changefreq>`,
    `<priority>${priority.toFixed(1)}</priority>`,
    lastmod ? `<lastmod>${escapeXml(new Date(lastmod).toISOString())}</lastmod>` : '',
    '</url>',
  ]
    .filter(Boolean)
    .join('')
}

export async function GET() {
  const staticPages = [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/blog', priority: 0.8, changefreq: 'daily' },
    { path: '/tools', priority: 0.6, changefreq: 'monthly' },
    { path: '/unblock', priority: 0.7, changefreq: 'weekly' },
    { path: '/blocked', priority: 0.6, changefreq: 'weekly' },
    { path: '/compare', priority: 0.5, changefreq: 'monthly' },
    { path: '/vpn', priority: 0.6, changefreq: 'monthly' },
    { path: '/about', priority: 0.3, changefreq: 'yearly' },
    { path: '/contact', priority: 0.3, changefreq: 'yearly' },
    { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
    { path: '/terms', priority: 0.3, changefreq: 'yearly' },
  ]

  const unblockPages = unblockTargets.map((target) =>
    buildSitemapUrl(`/unblock/${target.slug}`, {
      priority: 0.6,
      changefreq: 'weekly',
    })
  )

  const blockedPages = blockedTargets.map((target) =>
    buildSitemapUrl(`/blocked/${target.slug}`, {
      priority: 0.5,
      changefreq: 'monthly',
    })
  )

  const toolPages = tools.map((tool) =>
    buildSitemapUrl(`/tools/${tool.slug}`, {
      priority: 0.4,
      changefreq: 'monthly',
    })
  )

  const comparisonPages = vpnComparisons.map((comparison) =>
    buildSitemapUrl(`/compare/${comparison.slug}`, {
      priority: 0.4,
      changefreq: 'monthly',
    })
  )

  const vpnPages = vpnProviders.map((provider) =>
    buildSitemapUrl(`/vpn/${provider.slug}-review`, {
      priority: 0.4,
      changefreq: 'monthly',
    })
  )

  const vpnBestPages = vpnBestFor.map((item) =>
    buildSitemapUrl(`/vpn/${item.slug}`, {
      priority: 0.4,
      changefreq: 'monthly',
    })
  )

  const urls = [
    ...staticPages.map((page) =>
      buildSitemapUrl(page.path, {
        priority: page.priority,
        changefreq: page.changefreq,
      })
    ),
    ...unblockPages,
    ...blockedPages,
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
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
