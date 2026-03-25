/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@doccraft/markdown',
    '@doccraft/templates',
    '@doccraft/document-styles',
  ],
};

module.exports = nextConfig;
