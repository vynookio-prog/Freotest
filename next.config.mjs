/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.insforge.app',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.phototourl.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/menu',
        destination: '/products',
        permanent: true,
      },
      {
        source: '/menu-dan-gizi',
        destination: '/products',
        permanent: true,
      },
      {
        source: '/menu-gizi',
        destination: '/products',
        permanent: true,
      },
      {
        source: '/gizi',
        destination: '/products',
        permanent: true,
      },
      {
        source: '/detail-gizi',
        destination: '/products',
        permanent: true,
      },
      {
        source: '/product',
        destination: '/products',
        permanent: true,
      },
      {
        source: '/produk',
        destination: '/products',
        permanent: true,
      },
      {
        source: '/products/:id',
        destination: '/product/:id',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
