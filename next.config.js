/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'cdn.prod.website-files.com',
      'play.google.com',
      'apps.apple.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
      },
      {
        protocol: 'https',
        hostname: 'play.google.com',
      },
      {
        protocol: 'https',
        hostname: 'apps.apple.com',
      },
    ],
  },
};

module.exports = nextConfig; 