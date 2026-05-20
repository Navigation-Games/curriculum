import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Navigation Games',
  tagline: 'Orienteering curriculum for schools and camps',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://navgames.github.io',
  baseUrl: '/curriculum/',

  organizationName: 'navgames',
  projectName: 'curriculum',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: 'https://github.com/navgames/curriculum/tree/main/site/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Navigation Games',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'activitiesSidebar',
          position: 'left',
          label: 'Activities',
        },
        {
          type: 'docSidebar',
          sidebarId: 'lessonsSidebar',
          position: 'left',
          label: 'Lesson Plans',
        },
        {
          type: 'docSidebar',
          sidebarId: 'equipmentSidebar',
          position: 'left',
          label: 'Equipment',
        },
        {
          href: 'https://github.com/navgames/curriculum',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} Navigation Games. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
