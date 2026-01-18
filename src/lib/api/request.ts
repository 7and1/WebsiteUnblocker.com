export function getClientIp(request: Request): string {
  const cf = request.headers.get('cf-connecting-ip')
  if (cf) return cf

  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()

  return '0.0.0.0'
}

export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || ''
}
