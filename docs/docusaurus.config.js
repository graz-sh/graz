// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "graz",
  tagline: "React hooks for cosmos",
  url: "https://graz.strange.love",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "strangelove-ventures", // Usually your GitHub org/user name.
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
          editUrl: "https://github.com/strangelove-ventures/graz/tree/dev/docs/",
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
            href: "https://graz-example.vercel.app/",
            label: "Example",
            position: "left",
          },
          {
            href: "https://github.com/strangelove-ventures/graz",
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
                label: "Example",
                href: "https://graz-example.vercel.app/",
              },
              {
                label: "GitHub",
                href: "https://github.com/strangelove-ventures/graz",
              },
            ],
          },
        ],
        copyright: `MIT License, Copyright © ${new Date().getFullYear()} Strangelove Ventures`,
      },
      image: "img/social.png",
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
