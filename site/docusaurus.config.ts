import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// Cloudflare Web Analytics: counts visits per page, with no cookies and
// nothing personal stored, so no consent banner is needed. The token is
// public by design (it's in every page's source). Empty means no tracking.
// See "Visitor statistics" in ai-advisor/README.md.
const CLOUDFLARE_ANALYTICS_TOKEN = '264e9ca7e2f749b490e61fa7c7e3143a';

const config: Config = {
  title: 'Navigation Games',
  tagline: 'Orienteering curriculum for schools and camps',
  favicon: 'img/favicon.ico',

  url: 'https://curriculum.navigationgames.org',
  baseUrl: '/',

  organizationName: 'Navigation-Games',
  projectName: 'curriculum',

  onBrokenLinks: 'throw',
  trailingSlash: true,

  customFields: {
    advisorApiUrl: process.env.ADVISOR_API_URL || 'https://lesson-advisor-523012695945.us-central1.run.app',
    // OAuth client IDs are public by design; this is not a secret.
    // Used for all Google sign-in on the site: advisor limits, page
    // feedback, the For Editors gate, and the conversation review tool.
    reviewOauthClientId: process.env.REVIEW_OAUTH_CLIENT_ID || '523012695945-579cbdpvgl26689lnot37o9eu1imdjnu.apps.googleusercontent.com',
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  scripts: CLOUDFLARE_ANALYTICS_TOKEN
    ? [
        {
          src: 'https://static.cloudflareinsights.com/beacon.min.js',
          defer: true,
          // spa: count each page a visitor opens, not just the first one
          // (Docusaurus changes pages without a full reload)
          'data-cf-beacon': JSON.stringify({token: CLOUDFLARE_ANALYTICS_TOKEN, spa: true}),
        },
      ]
    : [],

  clientModules: [
    './src/clientModules/pageTypeClass.js',
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: undefined,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/',
        // The teacher course is an unlisted prototype; keep it out of search
        ignoreFiles: [/^training\//],
      },
    ],
  ],

  themeConfig: {
    image: 'img/social-card.jpg',
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Navigation Games',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'lessonsSidebar',
          position: 'left',
          label: 'Lesson Plans',
        },
        {
          type: 'docSidebar',
          sidebarId: 'activitiesSidebar',
          position: 'left',
          label: 'Activities',
        },
{
          type: 'docSidebar',
          sidebarId: 'aboutSidebar',
          position: 'left',
          label: 'About',
        },
        {
          type: 'docSidebar',
          sidebarId: 'referenceSidebar',
          position: 'left',
          label: 'Reference',
        },
        {
          type: 'docSidebar',
          sidebarId: 'editorsSidebar',
          position: 'left',
          label: 'For Editors',
          className: 'navbar-editors-link',
        },
        {
          href: 'https://github.com/Navigation-Games/curriculum',
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
