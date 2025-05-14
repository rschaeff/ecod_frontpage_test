/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['example.com'], // Add domains you'll load images from
  },
  // If you need to modify webpack config
  webpack: (config, { isServer }) => {
    // Custom webpack configurations if needed
    return config;
  },
};

module.exports = nextConfig;
