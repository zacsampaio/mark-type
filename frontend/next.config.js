/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["html-to-docx"],
  transpilePackages: [
    '@doccraft/markdown',
    '@doccraft/templates',
    '@doccraft/document-styles',
  ],
};

module.exports = nextConfig;
