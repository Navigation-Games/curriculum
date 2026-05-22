# Navigation Games - Orienteering Curriculum

Authors' guide for editing and maintaining the curriculum site.

**Live site:** https://navigation-games.github.io/curriculum/

## How Editing Works

You edit clean Markdown files in the `content/` folder. A build script turns them into the formatted pages on the site. You never need to touch the generated files in `site/docs/`.

```
content/                   <-- you edit these
  activities/              Activity content (Animal-O, Boundary Run, etc.)
  lessons/grade-3-5/       Lesson plans (6-lesson progression + indoor alt)

scripts/build-content.js   <-- converts content -> site pages

site/docs/                 <-- generated, don't edit
  activities/core/         Generated activity pages
  lessons/grade-3-5/       Generated lesson pages
```

Each content file produces both views of the page automatically: the full interactive page and the printable one-pager. Edit once, both views stay in sync.

## Editing Content

### Activity files

Activity files live in `content/activities/`. Here is the structure:

```markdown
# Animal-O

---
subtitle: Clue Sheet Orienteering
tagline: Use a clue sheet to find checkpoints in order
epigraph: In orienteering, you find checkpoints in order using clue sheets
sidebar_position: 3
tags: [core, level-1]
time: 15-30 minutes
space: Gym, schoolyard, or local park
materials:
  - Checkpoints (pictures of animals)
  - Clue sheets
setup: Place animal checkpoints around the defined space
---

## Description

One or two sentences describing what the activity is.

## Goals

- Short: Identifying landmarks
  Long: Understand that landmarks are features in terrain that are easy to find
- Short: Following clue sheets
  Long: Use a clue sheet to visit checkpoints in the correct order

## Vocabulary

- Checkpoint
  A marked location that you navigate to

- Clue sheet
  A list showing which checkpoints to visit, in order

## Setup

Detailed setup instructions here.

## Steps

1. Do the first thing
2. Do the second thing

## Delivery

1. Run the boundary
2. Find the animals in order

## Reflection

- What was hard about this activity?
- How did you know you were at the right checkpoint?

## Extensions

- Try it without a clue sheet
- Race against the clock
```

**Key conventions for activities:**

- The `# Title` line at the top sets the page title
- Frontmatter goes between `---` markers (YAML format)
- Goals use the `Short:` / `Long:` format. The short version appears on the one-pager, the long version on the full page. Put the `Long:` line indented on the next line after `Short:`
- Vocabulary terms are a word followed by an indented definition on the next line, separated by blank lines
- Sections use `## Heading` (two hashes)

### Lesson plan files

Lesson files live in `content/lessons/grade-3-5/`. They are simpler than activities:

```markdown
# 3 - Explore & Find

---
tagline: There are things out there; go find them and come back
sidebar_position: 3
time: 30-45 minutes
space: Gym, schoolyard, or local park
materials:
  - Checkpoints (cones with animal pictures)
setup: Place animal checkpoints around the space within the boundary
vocabulary:
  - Boundary
  - Gathering signal
  - Checkpoint
activities:
  - title: Boundary Run
    description: Review the boundary (quick refresher).
    link: /activities/core/boundary-run
    tag: core
  - title: Explore & Find
    description: In pairs, explore to find animal checkpoints.
    link: /activities/core/animal-o
    tag: core
---

## Goals

### Orienteering Goals
- Explore a space and find checkpoints within the boundary
- Return on the gathering signal

### PE Standards (SHAPE America)
- Demonstrate locomotor skills (S1.E1, S1.E2)
- Engage actively in class (S3.E2)

## Delivery

1. [**Boundary Run**](/activities/core/boundary-run): quick review of the boundary
2. Pair up
3. [**Explore & Find**](/activities/core/animal-o): explore to find animal checkpoints

## Compact Delivery

1. **Boundary Run**: quick review of the boundary
2. Pair up
3. **Explore & Find**: explore to find animal checkpoints

## Reflection

- How many animals did you find?
- Where were the animals?

## Extensions

- Move the checkpoints to new locations and start over
- Have students draw a map of the area
```

**Key conventions for lessons:**

- The `activities:` list in frontmatter generates clickable cards on the lesson page
- Goals are plain bullets (no Short:/Long: needed since lessons show the same text in both views)
- `## Delivery` is the full version. It can include markdown links like `[**Boundary Run**](/activities/core/boundary-run)`. These links appear on the full page but are stripped in the one-pager.
- `## Compact Delivery` is optional. If present, it replaces the delivery section on the one-pager. Use it when the full delivery has extra detail that doesn't belong on a one-pager. If omitted, the full delivery is used for both views.
- Vocabulary in lessons is a simple list of terms (no definitions needed; those live on the activity pages)

## Building the Site

### Prerequisites

- [Node.js](https://nodejs.org/) version 20 or later
- [Git](https://git-scm.com/)

### Build and preview

```bash
# Generate site pages from content files
node scripts/build-content.js

# Start local preview (from the site/ directory)
cd site
npm install    # first time only
npm start
```

The preview runs at http://localhost:3000/curriculum/. Changes to content files require re-running the build script, then the dev server will pick up the changes automatically.

### What the build script checks

The build script validates your content files and reports problems:

- **Errors** (build fails): missing title, missing tagline, missing required sections (Description, Goals for activities; Goals, Delivery for lessons), goals section with no goals
- **Warnings** (build succeeds but check these): missing time, space, vocabulary, sidebar_position

Error messages include the filename and what's wrong, for example:
```
  1 error(s):
    animal-o.md: Missing required section: ## Description
```

### Editing on GitHub

You can edit content files directly on GitHub.com without any local setup:

1. Navigate to the file in the `content/` folder
2. Click the pencil icon to edit
3. Make your changes and commit

The site auto-publishes when you push to `main`. A GitHub Actions workflow builds and deploys to GitHub Pages (takes 1-2 minutes).

Note: editing on GitHub skips the content build step. For the generated site pages to update, someone needs to run `node scripts/build-content.js` and commit the result. (We plan to automate this with a GitHub Action.)

## Repo Structure

```
content/                 Editable content (activities, lessons)
scripts/                 Build script
site/                    Docusaurus site
  docs/                  Generated pages (don't edit directly)
    activities/core/     Activity pages
    lessons/grade-3-5/   Lesson plans
    equipment/           Setup guides, SI timing
  src/
    components/          React components (ActivityCard, CardGrid, etc.)
    pages/               Landing pages (home, school, camp, quick-start)
background/              Source materials, reference docs
notes/                   Curriculum decisions, open questions
```

## Content Types

**Activities** describe one thing you do. They own setup, delivery, vocabulary, and goals. They do NOT own sequencing or reflection (that's the lesson plan's job).

**Lesson Plans** compose activities into sequences with transitions and reflection.

**Landing Pages** (school, camp, quick-start) route audiences to the right lesson plans.

## Conventions

- Filenames: lowercase-kebab-case
- No em-dashes in writing. Split into separate sentences or use other connectors.
- Generated files in `site/docs/` have a comment at the top saying they are auto-generated. Do not edit them.

## Content Sources

- [GitBook published site](https://navigation-games-2.gitbook.io/orienteering-curriculum-for-schools)
- [GitBook source repo](https://github.com/navgames/orienteering-lessons)
- [Current school curriculum (Google Sites)](https://sites.google.com/navigationgames.org/ngactivities/curricula/run-a-school-based-activity)
- [Current camp curriculum (Google Sites)](https://sites.google.com/navigationgames.org/ngactivities/curricula/orienteering-at-camp)

For build tooling details, component documentation, and WSL troubleshooting, see [DEVELOPMENT.md](DEVELOPMENT.md).
