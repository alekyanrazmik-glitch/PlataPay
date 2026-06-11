/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const repoBase = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd ? repoBase : '',
  assetPrefix: isProd ? repoBase : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: repoBase,
  },
};

module.exports = nextConfig;
