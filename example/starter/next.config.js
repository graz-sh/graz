/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,

  // remove this line, this is only used for deploying our documentation page ✌🏻
  // https://graz.sh/examples/starter
  basePath: process.env.EXPORT_DOCS ? "/examples/starter" : undefined,
};

module.exports = nextConfig;
