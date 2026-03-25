/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@marktype/markdown',
    '@marktype/templates',
    '@marktype/document-styles',
  ],
};

module.exports = nextConfig;
