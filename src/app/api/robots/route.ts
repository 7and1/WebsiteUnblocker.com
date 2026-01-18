import { siteConfig } from '@/config/site'

export async function GET() {
  const content = `User-agent: *\nAllow: /\n\nSitemap: ${siteConfig.url}/sitemap.xml\n`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
