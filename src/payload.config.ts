import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, type DatabaseAdapterResult } from 'payload'
import { fileURLToPath } from 'url'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import type { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'

import { Posts } from './collections/Posts'
import { Pages } from './collections/Pages'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { ContactSubmissions } from './collections/ContactSubmissions'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const isCLI = process.argv.some((value) => value.match(/^(generate|migrate):?/))
const isProduction = process.env.NODE_ENV === 'production'
const isCI = !!process.env.CI || !!process.env.GITHUB_ACTIONS
const isBuild = process.argv.some((value) => value.includes('next') && value.includes('build')) || isCI

// In production or when explicitly set to D1, use D1 adapter
const useD1 = process.env.PAYLOAD_DATABASE === 'd1' || isProduction || isBuild

async function getCloudflareCtx() {
  if (isCLI || !isProduction) {
    const wrangler = await import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`)
    return wrangler.getPlatformProxy({
      environment: process.env.CLOUDFLARE_ENV,
      persist: true,
    } satisfies GetPlatformProxyOptions)
  } else {
    return getCloudflareContext({ async: true })
  }
}

// Create a mock D1 binding for build time
function createMockD1Binding() {
  const mockStatement = {
    bind: () => mockStatement,
    first: async () => null,
    all: async () => ({ results: [] }),
    run: async () => ({ success: true }),
    raw: async () => [],
  }
  return {
    prepare: () => mockStatement,
    batch: async () => [],
    exec: async () => ({ count: 0, duration: 0 }),
    dump: async () => new ArrayBuffer(0),
  }
}

async function getDatabaseAdapter(): Promise<DatabaseAdapterResult> {
  // During CI build, use D1 adapter with mock binding
  if (isBuild) {
    return sqliteD1Adapter({ binding: createMockD1Binding() as any })
  }

  // In production or D1 mode, use real D1
  if (useD1) {
    const cloudflare = await getCloudflareCtx()
    return sqliteD1Adapter({ binding: cloudflare.env.D1 })
  }

  // Local development - dynamic import to avoid bundling libsql
  const sqliteModule = await import(/* webpackIgnore: true */ '@payloadcms/db-sqlite')
  return sqliteModule.sqliteAdapter({
    client: {
      url: `file:${path.resolve(dirname, '../payload-local.sqlite')}`,
    },
  })
}

async function getPlugins() {
  if (isBuild) return []

  if (useD1) {
    const cloudflare = await getCloudflareCtx()
    return [
      r2Storage({
        bucket: cloudflare.env.R2,
        collections: { media: true },
      }),
    ]
  }

  return []
}

const payloadSecret = process.env.PAYLOAD_SECRET || 'build-time-placeholder-secret-key-32chars'

const dbAdapter = await getDatabaseAdapter()
const plugins = await getPlugins()

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Pages, Posts, Media, Users, ContactSubmissions],
  editor: lexicalEditor(),
  secret: payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: dbAdapter,
  plugins,
})
