import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export const dynamic = 'force-dynamic'

export async function GET() {
  let database: 'ok' | 'error' = 'error'
  let storage: 'ok' | 'error' = 'error'

  try {
    const { env } = await getCloudflareContext({ async: true })

    if (env?.D1) {
      await env.D1.prepare('SELECT 1').first()
      database = 'ok'
    }

    if (env?.R2) {
      await env.R2.list({ limit: 1 })
      storage = 'ok'
    }
  } catch {
    // Ignore errors; health status derived below.
  }

  const hasAnyBinding = database === 'ok' || storage === 'ok'
  const status = hasAnyBinding
    ? database === 'ok' && storage === 'ok'
      ? 'healthy'
      : 'degraded'
    : 'ok'

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks: {
      database,
      storage,
    },
  })
}
