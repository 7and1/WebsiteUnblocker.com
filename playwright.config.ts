import { defineConfig } from '@playwright/test'

const PORT = 3111
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    headless: true,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `env -u NO_COLOR pnpm exec next dev -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NODE_OPTIONS: '--max-old-space-size=4096',
      NODE_NO_WARNINGS: '1',
      NEXT_TELEMETRY_DISABLED: '1',
      SHOW_OPTIONAL_ENV_WARNINGS: 'false',
      ENABLE_PROXY_CHECKS: 'false',
      PAYLOAD_SECRET: 'test-secret',
      PAYLOAD_DATABASE: 'local',
      DATABASE_URL: 'postgresql://localhost:5432/test',
      RATE_LIMIT_KV: 'test-kv',
      DB: 'test-d1',
      R2: 'test-r2',
      AFF_NORDVPN: 'test-nord',
      AFF_EXPRESSVPN: 'test-express',
      AFF_SURFSHARK: 'test-surf',
      NEXT_PUBLIC_SERVER_URL: baseURL,
    },
  },
})
