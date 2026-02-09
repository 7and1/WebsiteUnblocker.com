import { siteConfig } from '@/config/site'
import { getLatestGuideUpdatedAt } from '@/lib/content/posts'

export const runtime = 'nodejs'

export async function GET() {
  const now = new Date().toISOString()
  const latestGuideUpdate = await getLatestGuideUpdatedAt()

  const sitemaps = [
    { loc: `${siteConfig.url}/api/sitemap-static.xml`, lastmod: now },
    { loc: `${siteConfig.url}/api/sitemap-unblock.xml`, lastmod: now },
    { loc: `${siteConfig.url}/api/sitemap-blocked.xml`, lastmod: now },
    {
      loc: `${siteConfig.url}/api/sitemap-blog.xml`,
      lastmod: latestGuideUpdate ? new Date(latestGuideUpdate).toISOString() : now,
    },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map((sitemap) => `<sitemap>
<loc>${sitemap.loc}</loc>
<lastmod>${sitemap.lastmod}</lastmod>
</sitemap>`)
  .join('\n')}
</sitemapindex>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
    },
  })
}
