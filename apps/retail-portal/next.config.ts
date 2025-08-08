import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  transpilePackages: [
    '@livrili/ui',
    '@livrili/api',
    '@livrili/auth',
    '@livrili/database',
    '@livrili/i18n',
    '@livrili/utils',
  ],
  experimental: {
    // Enable Turbopack for faster builds
    // turbo: {},
    // Restore previous cache behavior if needed
    // staleTimes: {
    //   dynamic: 30,
    //   static: 180,
    // },
  },
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // PWA configuration will be handled by next-pwa plugin
}

export default nextConfig