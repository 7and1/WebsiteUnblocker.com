import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ContactSchema } from '@/lib/validation/contact'
import { rateLimit, rateLimitHeaders } from '@/lib/api/rateLimit'
import { getClientIp, getUserAgent } from '@/lib/api/request'

// Use nodejs runtime for Payload CMS compatibility
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const rate = rateLimit({ request, limit: 5, windowMs: 60_000, keyPrefix: 'contact' })
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many submissions. Please try again later.',
        },
      },
      { status: 429, headers: rateLimitHeaders(rate) }
    )
  }

  const payload = await request.json().catch(() => null)
  const parsed = ContactSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 400, headers: rateLimitHeaders(rate) }
    )
  }

  const data = parsed.data

  if (data.honeypot) {
    return NextResponse.json(
      {
        success: true,
        message: 'Your message has been sent successfully.',
      },
      { headers: rateLimitHeaders(rate) }
    )
  }

  try {
    const payloadClient = await getPayload({ config: configPromise })

    await payloadClient.create({
      collection: 'contact-submissions',
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        ip: getClientIp(request),
        userAgent: getUserAgent(request),
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Your message has been sent successfully.',
      },
      { headers: rateLimitHeaders(rate) }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Unable to submit your message right now.',
        },
      },
      { status: 500, headers: rateLimitHeaders(rate) }
    )
  }
}
