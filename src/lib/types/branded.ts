/**
 * Branded Types for Type Safety
 *
 * Provides nominal typing for primitives that should not be mixed.
 */

export type Url = string & { readonly __brand: unique symbol }
export type UrlPath = string & { readonly __brand: 'UrlPath' }
export type PostSlug = string & { readonly __brand: 'PostSlug' }
export type ProxyId = string & { readonly __brand: 'ProxyId' }
export type RequestId = string & { readonly __brand: 'RequestId' }
export type RegionCode = string & { readonly __brand: 'RegionCode' }

export function asUrl(value: string): Url {
  if (!isValidUrlString(value)) {
    throw new TypeError(`Invalid URL: ${value}`)
  }
  return value as Url
}

export function asUrlPath(value: string): UrlPath {
  if (!value.startsWith('/') || value.includes('..')) {
    throw new TypeError(`Invalid URL path: ${value}`)
  }
  return value as UrlPath
}

export function asPostSlug(value: string): PostSlug {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new TypeError(`Invalid post slug: ${value}`)
  }
  return value as PostSlug
}

export function asProxyId(value: string): ProxyId {
  if (value.length === 0 || value.length > 50) {
    throw new TypeError(`Invalid proxy ID: ${value}`)
  }
  return value as ProxyId
}

export function asRequestId(value: string): RequestId {
  if (!value.startsWith('req_')) {
    throw new TypeError(`Invalid request ID: ${value}`)
  }
  return value as RequestId
}

export function asRegionCode(value: string): RegionCode {
  const validCodes = ['us', 'eu', 'asia', 'cn', 'school', 'edge']
  if (!validCodes.includes(value)) {
    throw new TypeError(`Invalid region code: ${value}`)
  }
  return value as RegionCode
}

function isValidUrlString(value: string): boolean {
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

export function isUrl(value: unknown): value is Url {
  return typeof value === 'string' && isValidUrlString(value)
}

export function isPostSlug(value: unknown): value is PostSlug {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

export function isRequestId(value: unknown): value is RequestId {
  return typeof value === 'string' && value.startsWith('req_')
}
