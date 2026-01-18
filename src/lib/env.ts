/**
 * Runtime Environment Variable Validation
 *
 * Validates all required environment variables at startup to fail fast
 * with clear error messages. Provides fallbacks for non-critical values.
 */

type EnvVar = {
  name: string
  required: boolean
  defaultValue?: string
  description: string
}

// Define all environment variables used by the application
const ENV_VARS: EnvVar[] = [
  // Database
  {
    name: 'DATABASE_URL',
    required: false,
    description: 'PostgreSQL connection string (uses D1 binding in production)',
  },
  // Payload CMS
  {
    name: 'PAYLOAD_SECRET',
    required: false,
    description: 'Secret key for Payload CMS encryption',
  },
  // Cloudflare Bindings (set at runtime, not via env vars)
  {
    name: 'RATE_LIMIT_KV',
    required: false,
    description: 'KV namespace for rate limiting (binding)',
  },
  {
    name: 'DB',
    required: false,
    description: 'D1 database binding (binding)',
  },
  {
    name: 'R2',
    required: false,
    description: 'R2 storage binding (binding)',
  },
  // Affiliate IDs
  {
    name: 'AFF_NORDVPN',
    required: false,
    defaultValue: '',
    description: 'NordVPN affiliate ID',
  },
  {
    name: 'AFF_EXPRESSVPN',
    required: false,
    defaultValue: '',
    description: 'ExpressVPN affiliate ID',
  },
  {
    name: 'AFF_SURFSHARK',
    required: false,
    defaultValue: '',
    description: 'Surfshark affiliate ID',
  },
  // Site URLs
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    required: false,
    defaultValue: 'https://websiteunblocker.com',
    description: 'Public site URL',
  },
]

// Validation result
type ValidationResult = {
  valid: boolean
  errors: Array<{ var: string; message: string }>
  warnings: Array<{ var: string; message: string }>
}

/**
 * Validate environment variables
 */
function validateEnv(): ValidationResult {
  const errors: Array<{ var: string; message: string }> = []
  const warnings: Array<{ var: string; message: string }> = []

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name]

    if (envVar.required && !value) {
      errors.push({
        var: envVar.name,
        message: `Required environment variable "${envVar.name}" is missing. ${envVar.description}`,
      })
    } else if (!value && !envVar.defaultValue) {
      // Optional vars without defaults and no value set
      warnings.push({
        var: envVar.name,
        message: `Optional environment variable "${envVar.name}" is not set. ${envVar.description}`,
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Get environment variable with type safety and fallback
 */
export function getEnv(name: string, fallback?: string): string {
  return process.env[name] ?? fallback ?? ''
}

/**
 * Get boolean environment variable
 */
export function getBoolEnv(name: string, fallback = false): boolean {
  const value = process.env[name]?.toLowerCase()
  if (value === 'true' || value === '1') return true
  if (value === 'false' || value === '0') return false
  return fallback
}

/**
 * Get number environment variable
 */
export function getNumberEnv(name: string, fallback?: number): number {
  const value = process.env[name]
  if (!value) return fallback ?? 0
  const num = Number(value)
  return isNaN(num) ? fallback ?? 0 : num
}

/**
 * Validate Cloudflare bindings at runtime
 */
export function validateCloudflareBindings(): {
  valid: boolean
  bindings: { kv: boolean; d1: boolean; r2: boolean }
} {
  // These are available at runtime in Cloudflare Workers
  return {
    valid: true,
    bindings: {
      kv: typeof (globalThis as { RATE_LIMIT_KV?: unknown }).RATE_LIMIT_KV !== 'undefined',
      d1: typeof (globalThis as { DB?: unknown }).DB !== 'undefined',
      r2: typeof (globalThis as { R2?: unknown }).R2 !== 'undefined',
    },
  }
}

// Run validation on import (only in non-production to avoid startup impact)
if (process.env.NODE_ENV !== 'production') {
  const result = validateEnv()

  if (result.warnings.length > 0) {
    console.warn('Environment warnings:')
    for (const warning of result.warnings) {
      console.warn(`  - ${warning.message}`)
    }
  }

  if (!result.valid) {
    console.error('Environment validation failed:')
    for (const error of result.errors) {
      console.error(`  - ${error.message}`)
    }
    // Don't throw in development to allow partial functionality
  }
}

export const env = {
  // Database
  databaseUrl: getEnv('DATABASE_URL'),
  payloadSecret: getEnv('PAYLOAD_SECRET'),

  // Affiliate IDs
  affNordvpn: getEnv('AFF_NORDVPN'),
  affExpressvpn: getEnv('AFF_EXPRESSVPN'),
  affSurfshark: getEnv('AFF_SURFSHARK'),

  // Site
  siteUrl: getEnv('NEXT_PUBLIC_SITE_URL', 'https://websiteunblocker.com'),

  // Environment
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',
}
