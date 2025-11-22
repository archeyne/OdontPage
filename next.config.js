/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/OdontPage',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
