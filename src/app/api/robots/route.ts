import { siteConfig } from '@/config/site'

export async function GET() {
  const content = `# Robots.txt for ${siteConfig.name}
# Last updated: ${new Date().toISOString().split('T')[0]}

User-agent: *
Allow: /

# Disallow admin and private paths
Disallow: /admin/
Disallow: /private/
Disallow: /*.json$

# Limit generic API crawling
Disallow: /api/
Allow: /api/sitemap
Allow: /api/sitemap-static.xml
Allow: /api/sitemap-unblock.xml
Allow: /api/sitemap-blocked.xml
Allow: /api/sitemap-blog.xml

# Allow explicit SEO endpoints
Allow: /sitemap.xml
Allow: /robots.txt
Allow: /feed.xml
Allow: /feed.atom

# SEO tools crawl allowance
User-agent: AhrefsBot
Allow: /

User-agent: SemrushBot
Allow: /

User-agent: Screaming Frog SEO Spider
Allow: /

User-agent: MJ12bot
Allow: /

User-agent: DotBot
Allow: /

# Sitemap index and children
Sitemap: ${siteConfig.url}/sitemap.xml
Sitemap: ${siteConfig.url}/api/sitemap-static.xml
Sitemap: ${siteConfig.url}/api/sitemap-unblock.xml
Sitemap: ${siteConfig.url}/api/sitemap-blocked.xml
Sitemap: ${siteConfig.url}/api/sitemap-blog.xml
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
