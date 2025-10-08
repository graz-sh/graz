/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // transpilePackages: ["graz"],
  // Enable static export when building for docs
  output: process.env.EXPORT_DOCS ? "export" : undefined,
  // Set base path for docs deployment
  basePath: process.env.EXPORT_DOCS ? "/examples/playground" : "",
  // Disable image optimization for static export
  images: {
    unoptimized: process.env.EXPORT_DOCS ? true : false,
  },
  webpack: (config, { isServer }) => {
    // Handle pino and other node-specific modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Ignore pino-pretty import warnings
    config.ignoreWarnings = [{ module: /node_modules\/pino/ }, { file: /node_modules\/pino/ }];

    return config;
  },
};

module.exports = nextConfig;
