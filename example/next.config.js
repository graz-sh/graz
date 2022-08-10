// @ts-check
/// <reference path="./env.d.ts" />

const withTranspileModules = require("next-transpile-modules");
const packageJson = require("./package.json");

/** @type {import("next").NextConfig} */
let nextConfig = {
  eslint: {
    ignoreDuringBuilds: Boolean(process.env.VERCEL),
  },
  headers: async () => [],
  reactStrictMode: true,
  redirects: async () => [],
  rewrites: async () => [],
  swcMinify: false,
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: Boolean(process.env.VERCEL),
  },
};

const localModules = Object.keys(packageJson.dependencies).filter((dep) => dep.startsWith("@project/"));
nextConfig = withTranspileModules(localModules)(nextConfig);

module.exports = nextConfig;
