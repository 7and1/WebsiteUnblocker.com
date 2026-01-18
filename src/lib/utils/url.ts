const protocolRegex = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//

export function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const candidate = protocolRegex.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const url = new URL(candidate)
    if (!['http:', 'https:'].includes(url.protocol)) return null
    if (url.pathname === '/' && !url.search && !url.hash) {
      return url.origin
    }
    return url.toString()
  } catch {
    return null
  }
}

export function isValidUrl(raw: string): boolean {
  return normalizeUrl(raw) !== null
}

export function extractDomain(raw: string): string | null {
  const normalized = normalizeUrl(raw)
  if (!normalized) return null
  try {
    const url = new URL(normalized)
    return url.hostname.replace(/^www\./i, '')
  } catch {
    return null
  }
}

export function absoluteUrl(path: string, baseUrl: string): string {
  const trimmedBase = baseUrl.replace(/\/$/, '')
  const trimmedPath = path.startsWith('/') ? path : `/${path}`
  return `${trimmedBase}${trimmedPath}`
}
