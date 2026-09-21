/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'kick.com',
      },
      {
        protocol: 'https',
        hostname: '*.kick.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/:lang(en|es)/shop/:path*',
        has: [{ type: 'host', value: 'shop.luisardito.com' }],
        destination: '/:lang/shop/:path*',
      },
      {
        source: '/:lang(en|es)/shop',
        has: [{ type: 'host', value: 'shop.luisardito.com' }],
        destination: '/:lang/shop',
      },
      {
        source: '/:lang(en|es)/:path*',
        has: [{ type: 'host', value: 'shop.luisardito.com' }],
        destination: '/:lang/shop/:path*',
      },
      {
        source: '/:lang(en|es)',
        has: [{ type: 'host', value: 'shop.luisardito.com' }],
        destination: '/:lang/shop',
      },
      {
        source: '/shop/:path*',
        has: [{ type: 'host', value: 'shop.luisardito.com' }],
        destination: '/shop/:path*',
      },
      {
        source: '/shop',
        has: [{ type: 'host', value: 'shop.luisardito.com' }],
        destination: '/shop',
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'shop.luisardito.com' }],
        destination: '/shop/:path*',
      },
    ]
  },
}

export default nextConfig
