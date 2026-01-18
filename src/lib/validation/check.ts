import { z } from 'zod'

/**
 * Custom URL validation regex that blocks:
 * - Internal IP addresses (127.0.0.1, 10.x.x.x, 172.16-31.x.x, 192.168.x.x)
 * - Localhost variants
 * - URLs with user:pass (credential injection)
 * - File protocol
 */
const safeUrlPattern = /^(?:(?:https?):\/\/)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?::\d{1,5})?(?:\/[^\s]*)?$/

const isNotInternalUrl = (url: string): boolean => {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`
    const urlObj = new URL(normalized)
    const hostname = urlObj.hostname.toLowerCase()

    // Block internal/private IPs
    const internalPatterns = [
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^localhost$/,
      /^::1$/,
      /^fe80:/,
    ]

    if (internalPatterns.some(p => p.test(hostname))) {
      return false
    }

    // Block URLs with credentials
    if (urlObj.username || urlObj.password) {
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Enhanced URL validator for the /api/check endpoint
 */
export const CheckQuerySchema = z.object({
  url: z.string()
    .min(1, 'URL_REQUIRED')
    .max(2048, 'URL_TOO_LONG')
    .refine(isNotInternalUrl, 'INTERNAL_ADDRESS_NOT_ALLOWED')
    .transform(val => val.trim()),
})

export type CheckQuery = z.infer<typeof CheckQuerySchema>
