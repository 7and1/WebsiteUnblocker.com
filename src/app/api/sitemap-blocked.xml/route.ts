import { siteConfig } from '@/config/site'
import { absoluteUrl } from '@/lib/utils'
import { blockedTargets } from '@/lib/content'

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
  const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const blockedPages = blockedTargets.map((target) =>
    buildSitemapUrl(`/blocked/${target.slug}`, {
      priority: 0.6,
      changefreq: 'monthly',
      lastmod: lastMonth,
    })
  )

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blockedPages.join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
    },
  })
}
