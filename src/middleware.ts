import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const allowedOrigin = 'https://websiteunblocker.com'

function applySecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  // Content-Security-Policy header
  // default-src 'self' - Only allow resources from same origin
  // script-src - Allow inline scripts for Next.js development, unsafe-eval for some third-party scripts
  // style-src - Allow inline styles for CSS-in-JS
  // img-src - Allow data URLs, HTTPS, and blob URLs for images
  // font-src - Allow data URLs for fonts
  // connect-src - Allow API connections
  // frame-ancestors 'none' - Prevent embedding in frames
  // base-uri 'self' - Restrict base tag
  // form-action 'self' - Restrict form submissions
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https: blob:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https://api.websiteunblocker.com; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'"
  )
}

function applyCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export function middleware(request: NextRequest) {
  const isApi = request.nextUrl.pathname.startsWith('/api/')

  if (isApi && request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 })
    applyCorsHeaders(response)
    applySecurityHeaders(response)
    return response
  }

  const response = NextResponse.next()
  applySecurityHeaders(response)

  if (isApi) {
    applyCorsHeaders(response)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
