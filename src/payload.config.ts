import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
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
const useD1 = !isBuild && (process.env.PAYLOAD_DATABASE === 'd1' || isProduction)

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

const cloudflare = useD1 ? await getCloudflareCtx() : null

const payloadSecret = process.env.PAYLOAD_SECRET || 'build-time-placeholder-secret-key-32chars'

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
  db: useD1 && cloudflare
    ? sqliteD1Adapter({ binding: cloudflare.env.D1 })
    : sqliteAdapter({
        client: {
          url: `file:${path.resolve(dirname, '../payload-local.sqlite')}`,
        },
      }),
  plugins: useD1 && cloudflare
    ? [
        r2Storage({
          bucket: cloudflare.env.R2,
          collections: { media: true },
        }),
      ]
    : [],
})
