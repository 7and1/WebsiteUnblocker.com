import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 3,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    // Image optimization enabled for better performance
    // Cloudflare Workers doesn't support Next.js Image Optimization
    // Keeping unoptimized for the Cloudflare deployment
    // For self-hosted deployments, remove this line to enable optimization
    unoptimized: true,
    // Configure image domains for external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for the srcset attribute
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  serverExternalPackages: ['@payloadcms/db-d1-sqlite', '@payloadcms/db-sqlite', 'jose', 'libsql', '@libsql/client'],
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.websiteunblocker.com' }],
        destination: 'https://websiteunblocker.com/:path*',
        permanent: true,
      },
      {
        source: '/articles/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      {
        source: '/vpn/compare/:slug*',
        destination: '/compare/:slug*',
        permanent: true,
      },
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ]
  },
  webpack: (webpackConfig: any) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
