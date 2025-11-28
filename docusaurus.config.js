// @ts-check

const math = require('remark-math');
const katex = require('rehype-katex');
const siteUrl = process.env.SITE_URL || 'https://dotring.chainscore.finance';
const baseUrl = process.env.BASE_URL || '/';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'DotRing',
  tagline: 'Verifiable Random Functions for Python - IETF, Pedersen & Ring VRF',
  url: siteUrl,
  baseUrl: baseUrl,
  trailingSlash: false,
  favicon: 'img/favicon.svg',
  organizationName: 'Chainscore',
  projectName: 'dot-ring-doc',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  scripts: [
    '/dot-ring-doc/js/font-switcher.js'
  ],

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
          editUrl: 'https://github.com/Chainscore/dot-ring-doc/edit/main/',
          remarkPlugins: [math.default],
          rehypePlugins: [katex.default],
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
        title: 'dotring',
        items: [
          {
            href: 'https://pypi.org/project/dot-ring/',
            label: 'PyPI',
            position: 'right',
          },
          {
            href: 'https://github.com/Chainscore/dot-ring',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            title: 'Docs',
            items: [
              { label: 'Getting Started', to: '/getting-started/installation' },
              { label: 'API Reference', to: '/api/ietf-vrf' },
              { label: 'Guides', to: '/guides/ietf-tutorial' },
            ],
          },
          {
            title: 'Community',
            items: [
              { label: 'GitHub', href: 'https://github.com/Chainscore/dot-ring' },
              { label: 'PyPI', href: 'https://pypi.org/project/dot-ring/' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Chainscore. Built with Docusaurus.`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
        additionalLanguages: ['python', 'bash', 'json'],
      },
    }),
};

module.exports = config;
