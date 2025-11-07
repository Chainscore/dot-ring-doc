// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Dot Ring Docs',
  tagline: 'Documentation for the Dot Ring project',
  url: 'https://example.com', // TODO: update to your production URL
  baseUrl: '/',
  trailingSlash: false,
  favicon: 'img/logo.svg',
  organizationName: 'dot-ring', // TODO: set to your org or GitHub user
  projectName: 'dot-ring-docs', // TODO: set to your repo name

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */ ({
        docs: {
          routeBasePath: '/', // serve docs at site root
          sidebarPath: require.resolve('./sidebars.js'),
          // Provide an edit URL or omit to disable edit links
        },
        blog: false, // no blog for now
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */ ({
      navbar: {
        title: 'Dot Ring',
        logo: {
          alt: 'Dot Ring Logo',
          src: 'img/logo.svg',
        },
        items: [
          // Add links here as needed
        ],
      },
      footer: {
        style: 'dark',
        links: [],
        copyright: `Copyright © ${new Date().getFullYear()} Dot Ring.`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
      },
    }),
};

module.exports = config;
