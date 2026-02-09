import nextEslintConfig from 'eslint-config-next'

const eslintConfig = [
  {
    ignores: [
      '**/.next/**',
      '**/.open-next/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/*.config.{js,ts,mjs,cjs}',
      '**/playwright.config.ts',
      '**/vitest.config.ts',
      '**/payload.config.ts',
      '**/.payload/**',
      '**/cloudflare-env.d.ts',
      '**/payload-types.ts',
    ],
  },
  ...nextEslintConfig,
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]

export default eslintConfig
