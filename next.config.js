/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/OdontPage', // Uncomment this for GitHub Pages deployment
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
