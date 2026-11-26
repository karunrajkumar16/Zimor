/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  devIndicators: false,
  allowedDevOrigins: ['192.168.0.103', '192.168.0.104', 'localhost:3000'],
  async rewrites() {
    const isProduction = process.env.NODE_ENV === 'production';
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

    if (isProduction && !backendUrl) {
      console.warn('[ZIMOR NEXT CONFIG] Production notice: BACKEND_URL is not set. API rewrites disabled to prevent localhost leak.');
      return [];
    }

    const resolvedBackendUrl = (backendUrl || 'http://localhost:5001').replace(/\/+$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${resolvedBackendUrl}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/profession',
        destination: '/shop?section=profession#profession',
        permanent: true,
      },
    ];
  },
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000, // 30 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif|mp4|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
