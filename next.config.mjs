/** @type {import('next').NextConfig} */
const nextConfig = {
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
        source: '/:path*',
        has: [{ type: 'host', value: 'shop.luisardito.com' }],
        destination: '/shop/:path*',
      },
    ]
  },
}

export default nextConfig
