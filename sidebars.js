/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/installation',
        'getting-started/concepts',
        'getting-started/quickstart',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/ietf-vrf',
        'api/pedersen-vrf',
        'api/ring-vrf',
        'api/curves',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/ietf-tutorial',
        'guides/pedersen-tutorial',
        'guides/ring-tutorial',
        'guides/serialization',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/vrf-theory',
        'concepts/pedersen-commitments',
        'concepts/ring-proofs',
        'concepts/specifications',
      ],
    },
  ],
};

module.exports = sidebars;
