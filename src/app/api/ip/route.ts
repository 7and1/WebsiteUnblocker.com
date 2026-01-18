import { NextResponse } from 'next/server'
import { getClientIp } from '@/lib/api/request'

// Edge runtime for optimal Cloudflare Workers performance
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const ip = getClientIp(request)
  const cf = (request as Request & { cf?: Record<string, unknown> }).cf || {}

  return NextResponse.json({
    ip,
    country: cf.country ?? null,
    city: cf.city ?? null,
    region: cf.region ?? null,
    timezone: cf.timezone ?? null,
  })
}
