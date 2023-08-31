// @ts-check
/// <reference path="./env.d.ts" />

/** @type {import("next").NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: Boolean(process.env.VERCEL),
  },
  basePath: process.env.EXPORT_DOCS ? "/examples/next" : "/",
  headers: async () => [],
  reactStrictMode: false,
  redirects: async () => [],
  rewrites: async () => [],
  swcMinify: false,
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: Boolean(process.env.VERCEL),
  },
};

module.exports = nextConfig;
