import { z } from 'zod'

/**
 * IP address validation regex
 */
const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/

/**
 * Check API response schema
 */
export const CheckResponseSchema = z.object({
  status: z.enum(['accessible', 'blocked', 'error']),
  code: z.number().optional(),
  latency: z.number(),
  target: z.string().url(),
  blockReason: z.string().optional(),
  error: z.string().optional(),
  retryCount: z.number().optional(),
})

export type CheckResponse = z.infer<typeof CheckResponseSchema>

/**
 * Multi-region check response schema
 */
export const RegionResultSchema = z.object({
  region: z.string(),
  label: z.string(),
  status: z.enum(['accessible', 'blocked', 'error', 'unknown']),
  latency: z.number().nullable().optional(),
  code: z.number().optional(),
  source: z.enum(['edge', 'globalping', 'dns']),
  details: z.string().optional(),
})

export const MultiRegionResponseSchema = z.object({
  status: z.enum(['accessible', 'blocked', 'error']),
  code: z.number().optional(),
  latency: z.number(),
  target: z.string().url(),
  blockReason: z.string().optional(),
  error: z.string().optional(),
  regions: z.array(RegionResultSchema),
  summary: z.object({
    accessible: z.number(),
    blocked: z.number(),
    error: z.number(),
    unknown: z.number(),
  }),
})

export type MultiRegionResponse = z.infer<typeof MultiRegionResponseSchema>

/**
 * IP API response schema
 */
export const IpResponseSchema = z.object({
  ip: z.string().regex(ipRegex, 'Invalid IP address'),
  country: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
})

export type IpResponse = z.infer<typeof IpResponseSchema>

/**
 * Proxy API response schema
 */
export const ProxyRouteSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  region: z.string(),
  status: z.enum(['online', 'degraded', 'offline', 'unknown']),
  latency: z.number().nullable(),
  code: z.number().optional(),
  checked: z.boolean(),
  notes: z.string().optional(),
})

export const ProxyResponseSchema = z.object({
  checkedAt: z.string().datetime(),
  ttl: z.number(),
  routes: z.array(ProxyRouteSchema),
})

export type ProxyResponse = z.infer<typeof ProxyResponseSchema>

/**
 * Error response schema
 */
export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
    requestId: z.string().optional(),
  }),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

/**
 * Type guard for API errors
 */
export function isErrorResponse(value: unknown): value is ErrorResponse {
  const result = ErrorResponseSchema.safeParse(value)
  return result.success
}

/**
 * Validate and parse check response
 */
export function parseCheckResponse(value: unknown): CheckResponse {
  return CheckResponseSchema.parse(value)
}

/**
 * Validate and parse IP response
 */
export function parseIpResponse(value: unknown): IpResponse {
  return IpResponseSchema.parse(value)
}

/**
 * Validate and parse proxy response
 */
export function parseProxyResponse(value: unknown): ProxyResponse {
  return ProxyResponseSchema.parse(value)
}
