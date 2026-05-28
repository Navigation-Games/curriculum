# CLAUDE.md

## Project Overview

This repo contains the Navigation Games orienteering curriculum, being reorganized from Google Sites into a static site (Docusaurus + GitHub Pages). Content is structured around a sequence of **learning goals** modeled on the Level 2 structure from the original GitBook.

## Key Context

- **Organization:** Navigation Games — teaches orienteering to schools and camps
- **Stakeholder:** Kieran (priorities from May 13, 2026 meeting)
- **Source repo:** https://github.com/navgames/orienteering-lessons (GitBook content)
- **Activity → Learning Goal mapping** is in `background/` — confirm against GitBook source before treating as final

## Content Architecture

Three distinct content types — each has its own job:

### Activities
A reusable component describing *one thing you do*. Activities own: what it is, how to set it up, how to run it, vocabulary, and imagery. Activities do NOT own: sequencing, timing within a class, transitions, reflection questions — that's the lesson plan's job.

Activity types:
- **Core** — the main event (Boundary Run, Animal-O, Geometric-O, Score-O, etc.)
- **Companion** — supports a core activity. Three flavors:
  - *Readiness* — prepares for the core activity (Geometric Readiness → Geometric-O)
  - *Variation* — alternate version (Symbol Relay → Symbol-O)
  - *Extension* — builds on it (Basketball-O → Pacman-O, Poker-O → Score-O)

Companion activities live with their parent core activity, not as separate top-level items.

Activity content is structured in tagged sections (overview, setup, delivery, vocabulary, etc.) so that two views can be rendered from the same source:
- **Full view** — the complete activity page
- **Compact view (one-pager)** — filtered to essentials: title, tagline, setup diagram, numbered steps, vocabulary. Same content, not a separate document.

### Lesson Plans
Compose activities into sequences with timing, transitions, and reflection. Lesson plans reference activities by name via clickable cards (thumbnail + one-liner + link to the activity page).

### Equipment
Supporting materials and setup guides.

## Content Standards

Every core activity needs these, consistent with each other:
1. **Structured content** — tagged sections that render as both full page and compact one-pager
2. **Real-life imagery** — setup photos; drone shots for geometric activities
3. **Consistent vocabulary** — no orienteering jargon without a plain-language definition

## Vocabulary Decisions (pending)

- "Controls" vs "checkpoints" — decide and find-replace everywhere
- "Punch" vs "beep" vs "visit" — pick one org-wide
- "OOB" — always spell out as "out of bounds"
- "Score-O" → use "Map Treasure Hunt" for camp audiences

## Site Stack

**Docusaurus + GitHub + GitHub Pages + GitHub Actions**

- MDX (Markdown + JSX) for content. Supports custom React components
- Custom `<ActivityCard>` component for lesson pages to link to activities
- `<CardGrid>` for responsive grid layouts (3 columns on desktop, 2 on tablet, 1 on phone)
- `<YouTube>` for responsive video embeds
- Tabs component for structured sections within activity/lesson pages
- Compact/one-pager view rendered from the same MDX source (URL parameter or print-friendly toggle)
- Day-to-day editing is just Markdown files in the repo; GitHub Actions rebuilds on commit

## Repo Layout

- `background/` - source materials, reference docs, uploaded context files (site-tools-discussion.md, ng-curriculum-prep.html, etc.)
- `notes/` - curriculum decisions, open questions, author notes
- `site/docs/activities/core/` - core activity pages with companions inline
- `site/docs/lessons/school/` - lesson progressions by grade band (K-2, 3-5, 6+)
- `site/docs/lessons/camp/` - camp lesson progressions
- `site/docs/equipment/` - setup guides, SI timing
- `site/src/components/` - reusable React components (ActivityCard, CardGrid, YouTube)
- `site/src/pages/` - standalone landing pages (home, school, camp, quick-start)

## Key References

- **Editing guide:** `site/docs/editors/editing-guide.md` — how content files are structured, where to edit, how the build system works. Read this at the start of any content-editing session.
- **Roadmap:** `site/docs/editors/roadmap.md` — what's done, what's next. Update the roadmap when we identify work that should happen next.
- **Activities & Lessons table:** `site/src/components/ActivitiesTable/activitiesData.ts` — master list of activities with metadata. Keep this in sync when adding or changing activities.

## Working Conventions

- Prefer having Barb check the results of changes, when she is available, rather than spending tokens on automated verification. It is often easier and faster for her to look at the result than for Claude to verify programmatically.
- Write content in Markdown
- Keep filenames lowercase-kebab-case
- Avoid em-dashes in all writing. They signal AI authorship. Split into separate sentences or use other connectors.
- Companion activities live with their parent core activity, not as separate top-level items
- Companion-to-core relationships tracked in frontmatter `parents` field (supports many-to-many)
- SI (electronic timing) instructions live on their own equipment page, not repeated in every activity
- Deferred activities (Corridor-O, Line-O, Window-O, Scooter-O, Tabletop-O, String-O, Tarzan-O, Maze-O) are set aside. Don't include in main curriculum structure
- Do not modify the Learning Progression table in `site/docs/lessons/school/grade-3-5/index.md` without explicit review from Barb. The 3-column format (Lesson / Main Activity / What it adds) is intentional
