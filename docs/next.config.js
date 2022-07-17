// @ts-check
/// <reference path="./env.d.ts" />

const withTranspileModules = require("next-transpile-modules");
const packageJson = require("./package.json");
const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.js",
});

/** @type {import("next").NextConfig} */
let nextConfig = {
  eslint: {
    ignoreDuringBuilds: Boolean(process.env.VERCEL),
  },
  headers: async () => [],
  reactStrictMode: true,
  redirects: async () => [
    // { source: "/(.*)", destination: "https://github.com/strangelove-ventures/graz", permanent: false },
    //
  ],
  rewrites: async () => [],
  swcMinify: false,
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: Boolean(process.env.VERCEL),
  },
};

const localModules = ["graz", ...Object.keys(packageJson.dependencies).filter((dep) => dep.startsWith("@project/"))];
nextConfig = withTranspileModules(localModules)(nextConfig);

module.exports = withNextra({ ...nextConfig });
