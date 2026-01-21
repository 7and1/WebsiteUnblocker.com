export function getClientIp(request: Request): string {
  // Prefer CF connecting IP as it's verified by Cloudflare
  const cf = request.headers.get('cf-connecting-ip')
  if (cf) {
    // Validate IP format to prevent injection (IPv4 and IPv6)
    if (/^[\d.:a-fA-F]+$/.test(cf) && cf.length <= 45) {
      return cf
    }
  }

  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0].trim()
    // Validate IP format to prevent injection
    if (/^[\d.:a-fA-F]+$/.test(firstIp) && firstIp.length <= 45) {
      return firstIp
    }
  }

  return '0.0.0.0'
}

export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || ''
}
