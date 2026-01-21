import { siteConfig } from '@/config/site'

// Cloudflare Workers compatible runtime
export const runtime = 'edge'

export async function GET() {
  const now = new Date().toISOString()

  // Sitemap Index - references all child sitemaps
  const sitemaps = [
    { loc: `${siteConfig.url}/api/sitemap-static.xml`, lastmod: now },
    { loc: `${siteConfig.url}/api/sitemap-unblock.xml`, lastmod: now },
    { loc: `${siteConfig.url}/api/sitemap-blocked.xml`, lastmod: now },
    { loc: `${siteConfig.url}/api/sitemap-blog.xml`, lastmod: now },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(s => `<sitemap>
<loc>${s.loc}</loc>
<lastmod>${s.lastmod}</lastmod>
</sitemap>`).join('\n')}
</sitemapindex>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
    },
  })
}
