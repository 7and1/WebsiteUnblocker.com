import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    clearMocks: true,
    exclude: [
      '**/node_modules/**',
      '**/.next/**',
      '**/.open-next/**',
      '**/.pnpm-store/**',
      '**/dist/**',
      '**/build/**',
      '**/e2e/**',
    ],
  },
})
