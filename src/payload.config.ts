import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { getCloudflareContext } from '@opennextjs/cloudflare'
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

// Lazy binding holder that proxies calls to actual bindings
function createLazyD1Binding() {
  let realBinding: any = null

  const getBinding = async () => {
    if (realBinding) return realBinding
    const cloudflare = await getCloudflareContext({ async: true })
    realBinding = cloudflare.env.D1
    return realBinding
  }

  return {
    prepare: (query: string) => ({
      bind: (...args: any[]) => ({
        first: async () => (await getBinding()).prepare(query).bind(...args).first(),
        all: async () => (await getBinding()).prepare(query).bind(...args).all(),
        run: async () => (await getBinding()).prepare(query).bind(...args).run(),
        raw: async () => (await getBinding()).prepare(query).bind(...args).raw(),
      }),
      first: async () => (await getBinding()).prepare(query).first(),
      all: async () => (await getBinding()).prepare(query).all(),
      run: async () => (await getBinding()).prepare(query).run(),
      raw: async () => (await getBinding()).prepare(query).raw(),
    }),
    batch: async (statements: any[]) => (await getBinding()).batch(statements),
    exec: async (query: string) => (await getBinding()).exec(query),
    dump: async () => (await getBinding()).dump(),
  }
}

function createLazyR2Binding() {
  let realBinding: any = null

  const getBinding = async () => {
    if (realBinding) return realBinding
    const cloudflare = await getCloudflareContext({ async: true })
    realBinding = cloudflare.env.R2
    return realBinding
  }

  return {
    list: async (options?: any) => (await getBinding()).list(options),
    get: async (key: string, options?: any) => (await getBinding()).get(key, options),
    put: async (key: string, value: any, options?: any) => (await getBinding()).put(key, value, options),
    delete: async (key: string) => (await getBinding()).delete(key),
    head: async (key: string) => (await getBinding()).head(key),
  }
}

function getD1Binding() {
  if (isBuild || isCLI) {
    return createMockD1Binding()
  }
  if (!isProduction) {
    // Local development - need to use wrangler proxy synchronously
    // This path shouldn't be hit in Cloudflare Workers
    return createMockD1Binding()
  }
  // Production runtime - use lazy binding
  return createLazyD1Binding()
}

function getR2Binding() {
  if (isBuild || isCLI) {
    return createMockR2Binding()
  }
  if (!isProduction) {
    return createMockR2Binding()
  }
  // Production runtime - use lazy binding
  return createLazyR2Binding()
}

const payloadSecret = process.env.PAYLOAD_SECRET || 'build-time-placeholder-secret-key-32chars'

const d1Binding = getD1Binding()
const r2Binding = getR2Binding()

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
