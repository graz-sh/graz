// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "graz",
  tagline: "React hooks for cosmos",
  url: "https://graz.sh",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "graz-sh", // Usually your GitHub org/user name.
  projectName: "graz", // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/graz-sh/graz/tree/dev/docs/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        style: "dark",
        title: "React hooks for Cosmos",
        logo: {
          alt: "graz logo",
          src: "img/logo.png",
        },
        items: [
          {
            type: "doc",
            docId: "index",
            position: "left",
            label: "Docs",
          },
          {
            href: "/docs/examples",
            label: "Examples",
            position: "left",
          },
          {
            href: "https://github.com/graz-sh/graz",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Documentation",
                to: "/docs/",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Next.js Example",
                href: "https://graz.sh/examples/next",
              },
              {
                label: "Vite Example",
                href: "https://graz.sh/examples/vite",
              },
              {
                label: "Starter Example",
                href: "https://graz.sh/examples/starter",
              },
              {
                label: "GitHub",
                href: "https://github.com/graz-sh/graz",
              },
            ],
          },
        ],
        copyright: `MIT License, Copyright © ${new Date().getFullYear()} Graz`,
      },
      image: "img/social.png",
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
  plugins: [require.resolve("@cmfcmf/docusaurus-search-local")],
};

module.exports = config;
