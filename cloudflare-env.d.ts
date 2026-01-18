interface CloudflareEnv {
  D1: D1Database
  R2: R2Bucket
  PAYLOAD_SECRET: string
  NEXT_PUBLIC_SERVER_URL: string
  NODE_ENV: string
  ASSETS: Fetcher
}

declare global {
  interface CloudflareEnv extends CloudflareEnv {}
}
