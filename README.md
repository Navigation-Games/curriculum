# Navigation Games - Orienteering Curriculum

Authors' guide for editing and maintaining the curriculum site.

**Live site:** https://navigation-games.github.io/curriculum/ *(not yet deployed)*

## Why This Tech Stack

The curriculum has lived in GitBook and then Google Sites. Both worked well for writing and sharing content, but as the curriculum grew we hit a consistency problem: each activity exists in multiple forms (one-pager, full description, script, lesson plan reference, vocabulary list) and keeping them in sync across formats and across activities was manual and error-prone.

We moved to Docusaurus + GitHub so that:

- **Content is structured and reusable.** Activity metadata (goals, vocabulary, materials, reflection questions) is stored once and rendered into multiple views: full activity page, printable one-pager, lesson plan card, etc. A change to vocabulary propagates everywhere.
- **Consistency can be checked programmatically.** Scripts and AI tools can scan the structured content to flag missing sections, inconsistent terminology, or activities that have drifted out of sync.
- **Multiple views from one source.** The same activity file produces both the full interactive page and the compact one-pager. No separate documents to reconcile.
- **Version history and collaboration.** Git tracks every change, who made it, and why. Multiple editors can work in parallel without overwriting each other.

The tradeoff is that editing requires working with text files and git instead of a WYSIWYG editor. For day-to-day content editing, authors can edit Markdown files directly on GitHub.com (no local setup needed) or draft in Google Docs and sync changes back into the repo.

## Tech Stack

- **[Docusaurus](https://docusaurus.io/)** (v3) - static site generator built on React. Turns Markdown files into a fast, searchable website with navigation, sidebar, and versioning built in.
- **[MDX](https://mdxjs.com/)** - Markdown with support for React components inline. Activity cards, video embeds, and grid layouts are all MDX components.
- **[React](https://react.dev/)** (v19) - powers custom components like `<ActivityCard>`, `<CardGrid>`, and `<YouTube>`.
- **[GitHub Pages](https://pages.github.com/)** - free static hosting. The site deploys automatically when changes are pushed to main.
- **[GitHub](https://github.com/Navigation-Games/curriculum)** - source control and collaboration. Content is edited as Markdown files in the repo.
- **[Node.js](https://nodejs.org/)** (v20+) - runtime for the build toolchain. Required for local preview and deployment.

Day-to-day editing is just Markdown. You don't need to know React or JavaScript to write content. The React layer only matters if you're building new components.

For build tooling details, WSL troubleshooting, and config notes, see [DEVELOPMENT.md](DEVELOPMENT.md).

## Prerequisites

- [Node.js](https://nodejs.org/) version 20 or later
- [Git](https://git-scm.com/)

## Running the Local Preview

From the repo root:

```bash
cd site
npm install      # first time only, or after pulling new dependencies
npm start
```

This starts a local dev server and opens your browser to http://localhost:3000/curriculum/. Changes you make to Markdown files show up immediately without restarting.

To stop the server, press `Ctrl+C` in the terminal.

## Editing and Publishing

### Making changes

1. Edit Markdown (`.md`) or MDX (`.mdx`) files under `site/docs/` or `site/src/pages/`.
2. Preview your changes at http://localhost:3000/curriculum/ (start the local server if it isn't running).
3. When you're happy with the changes, commit and push:

```bash
git add -A
git commit -m "Describe what you changed"
git push
```

### Publishing to GitHub Pages

The site auto-publishes whenever you push to `main`. A GitHub Actions workflow builds the site and deploys it to https://navigation-games.github.io/curriculum/. This typically takes 1-2 minutes after pushing.

You can check the deploy status on the [Actions tab](https://github.com/Navigation-Games/curriculum/actions) of the repo.

> **First-time setup:** A repo admin needs to go to Settings > Pages and set the source to "GitHub Actions" (not "Deploy from a branch"). This only needs to be done once.

## Repo Structure

```
background/          Source materials, reference docs, context files
notes/               Curriculum decisions, open questions, author notes
site/                Docusaurus site
  docs/
    activities/      Activity pages (one per core activity)
      core/          Core activities with companions inline
    lessons/         Lesson plan sequences by grade band
      grade-3-5/     Five-lesson progression + indoor alternative
    equipment/       Setup guides, SI timing, kits
  src/
    components/      Reusable React components (ActivityCard, CardGrid, YouTube)
    pages/           Standalone landing pages (home, school, camp, quick-start)
```

## Content Types

**Activities** describe one thing you do. They own setup, delivery, and vocabulary. They do NOT own sequencing, timing, or reflection questions (that's the lesson plan's job).

**Lesson Plans** compose activities into sequences with transitions and reflection.

**Landing Pages** (school, camp, quick-start) route audiences to the right lesson plans. They don't own content themselves.

## Activity Frontmatter

Every activity file uses frontmatter metadata to track its type and relationships:

```yaml
---
title: Animal-O
sidebar_position: 3
tags: [core, level-1]
---
```

Companion activities use additional fields:

```yaml
---
title: Explore & Find
tags: [companion, readiness]
parents: [animal-o]
---
```

The `parents` field is a list, supporting many-to-many relationships. A companion activity can be readiness for multiple core activities.

### Tag values

- **Type:** `core`, `companion`
- **Companion flavor:** `readiness`, `variation`, `extension`
- **Level:** `level-1`, `level-2`

## Components

Use these in any `.mdx` file. Add the imports at the top of the file, below the frontmatter.

### CardGrid

Responsive grid container. Cards reflow automatically on smaller screens (2 columns on tablet, 1 on phone).

```mdx
import CardGrid from '@site/src/components/CardGrid';

<CardGrid columns={3}>
  {/* cards go here */}
</CardGrid>
```

| Prop | Values | Default | Description |
|---|---|---|---|
| `columns` | `2`, `3`, `4` | `3` | Number of columns on desktop |

### ActivityCard

Clickable card with optional image and colored tag. Use inside a `<CardGrid>`.

```mdx
import ActivityCard from '@site/src/components/ActivityCard';
import CardGrid from '@site/src/components/CardGrid';

<CardGrid columns={4}>
  <ActivityCard
    title="Animal-O"
    description="Find animal checkpoints in order using a clue sheet."
    link="/activities/core/animal-o"
    image="/img/animal-o.jpg"
    tag="core"
  />
  <ActivityCard
    title="Geometric-O"
    description="Use a simple map to find checkpoints in a pattern."
    link="/activities/core/geometric-o"
    tag="core"
  />
  <ActivityCard
    title="Explore & Find"
    description="In pairs, explore to find animal checkpoints."
    tag="readiness"
  />
  <ActivityCard
    title="Symbol Relay"
    description="Team relay to learn map symbols."
    tag="variation"
  />
</CardGrid>
```

| Prop | Required | Description |
|---|---|---|
| `title` | yes | Activity name |
| `description` | yes | One-line summary |
| `link` | no | URL to link to. Card is not clickable without this. |
| `image` | no | Path to thumbnail image |
| `tag` | no | Colored label: `core`, `readiness`, `variation`, or `extension` |

### YouTube

Responsive video embed. Maintains 16:9 aspect ratio at any width.

```mdx
import YouTube from '@site/src/components/YouTube';

<YouTube id="lD0_AKjR_Ic" title="How to teach Boundary Run" />
```

| Prop | Required | Description |
|---|---|---|
| `id` | yes | YouTube video ID (the part after `v=` in the URL) |
| `title` | no | Accessible title for the iframe. Defaults to "Video". |

## Conventions

- Filenames: lowercase-kebab-case
- No em-dashes in writing (they signal AI authorship). Split into separate sentences or use other connectors.
- Companion activities live on the same page as their parent core activity, not as separate files
- Deferred activities (Corridor-O, Line-O, Window-O, Scooter-O, Tabletop-O, String-O, Tarzan-O, Maze-O) are set aside for now

## Next Steps

- [ ] Review Animal-O activity page. Compare to Google Site version, GitBook version, narrow one-pager, and new script. Adjust the template based on what's missing or wrong.
- [ ] Add other core activities (Boundary Run, Gathering, Geometric-O, Symbol-O, Map Discussion, Map Walk, Score-O) using the same tabbed template.
- [ ] Reconcile the school landing page (`/school`) to the [Google Sites school page](https://sites.google.com/navigationgames.org/ngactivities/curricula/run-a-school-based-activity). Add links to activities and set up activity stubs for any that don't have pages yet.
- [ ] In "Teach at a School", the Grade Bands cards should explain what is different in the progression for each band (not just list activities). Add detailed per-grade lesson plan summaries like the Google Sites version has, with links into individual activities.

## Content Sources

- [GitBook published site](https://navigation-games-2.gitbook.io/orienteering-curriculum-for-schools) (good reference for layout and card style)
- [GitBook source repo](https://github.com/navgames/orienteering-lessons) (older but has good structure)
- [Current school curriculum (Google Sites)](https://sites.google.com/navigationgames.org/ngactivities/curricula/run-a-school-based-activity)
- [Current camp curriculum (Google Sites)](https://sites.google.com/navigationgames.org/ngactivities/curricula/orienteering-at-camp)
