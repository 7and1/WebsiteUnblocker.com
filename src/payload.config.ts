import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
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

async function getCloudflareCtx() {
  if (isCLI || !isProduction) {
    // Local development uses wrangler's platform proxy
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

// Create a mock R2 binding for build time
function createMockR2Binding() {
  return {
    list: async () => ({ objects: [], truncated: false }),
    get: async () => null,
    put: async () => ({}),
    delete: async () => undefined,
    head: async () => null,
  }
}

async function getD1Binding() {
  if (isBuild) {
    return createMockD1Binding()
  }
  const cloudflare = await getCloudflareCtx()
  return cloudflare.env.D1
}

async function getR2Binding() {
  if (isBuild) {
    return createMockR2Binding()
  }
  const cloudflare = await getCloudflareCtx()
  return cloudflare.env.R2
}

const payloadSecret = process.env.PAYLOAD_SECRET || 'build-time-placeholder-secret-key-32chars'

const d1Binding = await getD1Binding()
const r2Binding = await getR2Binding()

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
  db: sqliteD1Adapter({ binding: d1Binding as any }),
  plugins: isBuild
    ? []
    : [
        r2Storage({
          bucket: r2Binding as any,
          collections: { media: true },
        }),
      ],
})
