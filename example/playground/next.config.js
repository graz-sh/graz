/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["graz"],
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
    config.ignoreWarnings = [
      { module: /node_modules\/pino/ },
      { file: /node_modules\/pino/ },
    ];

    return config;
  },
};

module.exports = nextConfig;
