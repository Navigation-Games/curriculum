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

## Vocabulary Decisions

- "Controls" vs "checkpoints" — **decided: use "checkpoints"** throughout. Done. Glossary notes the orienteering term "control."
- "Punch" vs "beep" vs "visit" — pick one org-wide (pending)
- "OOB" — always spell out as "out of bounds"
- "Score-O" → use "Map Treasure Hunt" for camp audiences
- A person who orienteers is an **"orienteer"**, not "orienteerer"

## Site Stack

**Docusaurus + GitHub + GitHub Pages + GitHub Actions + Google Cloud Run (AI advisor)**

- MDX (Markdown + JSX) for content. Supports custom React components
- Custom `<ActivityCard>` component for lesson pages to link to activities
- `<CardGrid>` for responsive grid layouts (3 columns on desktop, 2 on tablet, 1 on phone)
- `<YouTube>` for responsive video embeds
- Tabs component for structured sections within activity/lesson pages
- Compact/one-pager view rendered from the same MDX source (URL parameter or print-friendly toggle)
- Day-to-day editing is just Markdown files in the repo; GitHub Actions rebuilds on commit
- `trailingSlash: true` is set in `docusaurus.config.ts`. This is required so that relative links in index pages (e.g., `./lesson-1` in `grade-3-5/index.md`) resolve correctly. Without it, the dev server serves `/grade-3-5` without a trailing slash, and the browser resolves `./lesson-1` relative to the parent (`/lessons/school/lesson-1` instead of `/lessons/school/grade-3-5/lesson-1`). GitHub Pages adds trailing slashes on its own, so the bug only appears locally. Do not remove `trailingSlash: true`.
- **Sibling page links need `../`** because of `trailingSlash: true`. A page at `/activities/core/gathering/` treats a bare relative link like `(boundary-run)` as a child path (`/activities/core/gathering/boundary-run/`), not a sibling. Always write `(../boundary-run)` to link between pages in the same directory. Index pages are the exception: since they represent the directory itself, their relative links correctly resolve to children. This applies everywhere: activity content files, framework pages, lesson plans.

## Repo Layout

- `content/activities/` - **source files for activities** (edit here, never in site/docs/)
- `content/lessons/` - **source files for lesson plans** (edit here, never in site/docs/)
- `background/` - source materials, reference docs, uploaded context files (site-tools-discussion.md, ng-curriculum-prep.html, etc.)
- `notes/` - curriculum decisions, open questions, author notes
- `ai-advisor/` - AI lesson plan advisor backend (Python/Flask, deployed on Google Cloud Run)
- `site/docs/activities/core/` - **AUTO-GENERATED** activity pages (do not edit; do not create files here)
- `site/docs/lessons/school/` - **AUTO-GENERATED** lesson pages (do not edit; do not create files here), plus hand-maintained index.md files
- `site/docs/lessons/camp/` - camp lesson progressions (hand-maintained)
- `site/docs/about/` - about pages: how-to-use, concepts, acknowledgments, copyright
- `site/docs/reference/` - glossary, frameworks, equipment & materials
- `site/docs/reference/equipment/` - materials index, maps, controls, kits, setup guides, electronic timing
- `site/src/components/` - reusable React components (ActivityCard, CardGrid, YouTube, AdvisorChat)
- `site/src/pages/` - standalone landing pages (home, school, camp, quick-start, plan-my-lessons)

## Key References

- **Editing guide:** `site/docs/editors/editing-guide.md` — how content files are structured, where to edit, how the build system works. Read this at the start of any content-editing session.
- **Roadmap:** `site/docs/editors/roadmap.md` — what's done, what's next. Update the roadmap when we identify work that should happen next.
- **Activities & Lessons table:** `site/src/components/ActivitiesTable/activitiesData.ts` — master list of activities with metadata. Keep this in sync when adding or changing activities.
- **AI Advisor README:** `ai-advisor/README.md` — deployment, configuration, and rebuild instructions for the lesson plan advisor backend.
- **AI Advisor plan:** `notes/ai-lesson-advisor-plan.md` — design decisions, future features, and test scenarios.
- **Advisor conversation log:** Google Sheet `13P76_hPAVDDjnwJ9aazIdW-WAtGKNW5fBVD6TX1s5aY` — all advisor conversations are logged here for curriculum improvement.

## Working Conventions

- Prefer having Barb check the results of changes, when she is available, rather than spending tokens on automated verification. It is often easier and faster for her to look at the result than for Claude to verify programmatically.
- Write content in Markdown
- Keep filenames lowercase-kebab-case
- Avoid em-dashes in all writing. They signal AI authorship. Split into separate sentences or use other connectors.
- Companion activities live with their parent core activity, not as separate top-level items
- Companion-to-core relationships tracked in frontmatter `parents` field (supports many-to-many)
- All lesson plans must work without electronic timing. SI (electronic timing) is a separate equipment topic for teachers, not a prerequisite for any lesson
- Lesson plans for grades 3-5 and 6+ include SHAPE America 2024 (4th edition) PE standards. Indicator codes use the format `[Standard].[GradeSpanEnd].[Indicator]` (e.g., 2.8.7 = Standard 2, grades 6-8, indicator 7). Grade spans: PreK-2, 3-5, 6-8, 9-12
- Deferred activities (Corridor-O, Scooter-O, Tabletop-O, String-O, Tarzan-O, Maze-O) are set aside. Don't include in main curriculum structure
- Do not modify the Learning Progression table in `site/docs/lessons/school/grade-3-5/index.md` without explicit review from Barb. The 3-column format (Lesson / Main Activity / What it adds) is intentional
- NEVER use colons inside YAML frontmatter list items. A colon followed by a space is YAML's key-value separator, so `- Optional: foo` silently becomes `{Optional: "foo"}` instead of a string, breaking the build. Rephrase instead (e.g., `- Poster-sized map (optional)` not `- Optional: poster-sized map`)
- When adding or defining a vocabulary term, always add it to all three places: (1) the glossary page (`site/docs/reference/glossary.md`), (2) the glossary data file (`site/src/components/VocabLink/glossaryData.ts`), and (3) the activity's `## Vocabulary` section. All three must stay in sync for VocabLink hyperlinks to work.
- Map symbols use the **ISSprOM** (International Specification for Sprint Orienteering Maps) symbol set, not ISOM. ISSprOM is designed for sprint/urban maps at 1:4,000 scale, which matches schoolyard and park maps. Symbol Relay cards will have an ISSprOM base set plus a schoolyard-specific subset (paths, buildings, fences, etc.) that camps would not need.

## Lesson Plan Writing Practices

These practices were established during the K-2 editing pass and should be applied across all grade bands.

### Delivery should be self-contained
A teacher should be able to read the Delivery section and know what to do without clicking through to the activity pages. The lesson tells you what to do today. Activity pages provide depth for those who want it (full scripts, photos, detailed progressions). Include a link to each activity in the delivery or extensions so teachers can click through, but don't require it.

### Every activity card needs a link in the body
If an activity appears as a card in the Activities section, it should also have at least one link in Delivery or Extensions. The cards are a visual overview; the body text is where teachers actually read.

### Fold extensions into delivery for younger grades
For K-2, extension activities (like "Run to the Animal" or "Animal Friends") become part of the delivery steps rather than separate cards. Young children need more structure and the lesson is stretching one core activity across more time.

### Weave reflection into delivery
Don't save all reflection for the end. Embed natural reflection moments in the delivery steps where they fit ("Was it easier the second time? Why?"). Keep a small number of focused questions for end-of-activity reflection, targeting the lesson's most important orienteering goals (e.g., spatial language, spatial memory) as well as metacognition (e.g., "Are you surprised that you can remember that many animal places?").

### Compact delivery
Include a Compact Delivery section that gives the same lesson in shorthand, for teachers who already know the activities and just need a quick reference.

### Goals presentation
- Orienteering goals: collapsible, open by default
- PE standards: collapsible, collapsed by default, with an italic sentence after each standard explaining how it appears in the lesson
- This keeps the page scannable while making standards available for administrators and PE departments

### Partner roles
Use **Navigator** (the person doing the orienteering) and **Checker** (the person confirming correct location by comparing to a clue sheet). Don't force pairing into activities that don't need it. Introduce the vocabulary when it fits naturally, even if students aren't formally in those roles yet.

### Don't add what the activity doesn't call for
If the activity's core steps don't mention pairing, don't add pairing to the lesson plan. Let the activity's design speak. Add lesson-level guidance for tailoring to the age group, but don't invent new mechanics.

## AI Lesson Plan Advisor

An embedded AI chat at `/plan-my-lessons/` that helps teachers and anyone else plan orienteering lessons. Uses Claude (Sonnet) via the Anthropic API.

### Architecture

- **Backend:** Python/Flask on Google Cloud Run (`ai-advisor/`). Wraps the Claude API with curriculum knowledge baked into the system prompt.
- **Frontend:** React chat component (`site/src/components/AdvisorChat/`) on the Docusaurus site.
- **Logging:** Every conversation is logged to a Google Sheet for curriculum improvement.
- **Cloud Run service URL:** `https://lesson-advisor-523012695945.us-central1.run.app`
- **Google Cloud project:** `navigation-games-curriculum`

### Updating the advisor

The system prompt lives at `ai-advisor/system-prompt.md`. Changes to the system prompt, `app.py`, or `requirements.txt` require rebuilding the container and redeploying to Cloud Run. See `ai-advisor/README.md` for the PowerShell commands.

Frontend changes (`AdvisorChat/`, `plan-my-lessons.*`) deploy automatically via the normal GitHub Actions workflow on `git push`.

### Key lessons from testing

- The advisor must not hallucinate facts about orienteering clubs, events, college programs, or map ownership. The system prompt explicitly forbids this and instructs the AI to provide URLs instead of guessing.
- A person who does orienteering is an "orienteer," not an "orienteerer."
- The advisor welcomes anyone (not just teachers): birthday parties, scout troops, community events.
- For one-off events, point to Quick Start. For multi-session progressions, recommend existing curricula.
- For grades 3-5+, prioritize getting students on a real map by the end of their time, even if it means skipping intermediate steps.
- The advisor responds in whatever language the person writes in.

## Generated vs Hand-Maintained Files (CRITICAL)

**NEVER create or edit activity or lesson files directly in `site/docs/`.** Those files are auto-generated by `scripts/build-content.js` from sources in `content/`. Edits to generated files will be silently overwritten.

- **To edit an activity:** edit `content/activities/<name>.md`
- **To edit a lesson plan:** edit `content/lessons/school/<grade-band>/<lesson>.md`
- **To create a new activity or lesson:** create the file in `content/`, never in `site/docs/`
- **To preview changes locally:** run `node scripts/build-content.js` to regenerate, then preview with `cd site && npm start`

Generated files in `site/docs/` are gitignored and rebuilt by GitHub Actions on every push. They should not be committed.

The only hand-maintained files inside generated directories are `index.md` landing pages. If you ever add a new hand-maintained file to a directory that also contains generated files (`site/docs/activities/core/`, `site/docs/lessons/school/grade-3-5/`, `site/docs/lessons/school/grade-k-2/`, `site/docs/lessons/school/grade-6-plus/`), you MUST add a negation rule (`!` pattern) to `.gitignore` so git tracks it. Check `.gitignore` for the existing patterns and comments.

The "Edit this page" links use a custom `editUrl` function in `site/docusaurus.config.ts` that maps auto-generated pages back to their `content/` sources. When adding a new category of auto-generated files (e.g., camp lessons), update the `editUrl` function so the new pattern also points to `content/`.

## Camp Curriculum Sources (TEMPORARY - remove when camp curricula are built)

Tracking sources of information for building the two camp curricula.

### Structure (from Google Site)

**Introductory Curriculum** - Three activities for camps just getting started with orienteering:
1. Animal-O (Clue Sheet Orienteering)
2. Find Your Way Home
3. Map Treasure Hunt

**Skill Development Curriculum** - Fundamentals of orienteering map navigation in six 70-minute sessions over two weeks:

Week 1 (Introduction):
1. Safety; Animal-O; Symbol Relay; Description Relay; Map Discussion
2. Safety; Map Walk; Score-O
3. Safety; Compass Basics; Courses

Week 2 (Development):
4. Safety; Symbol Relay; Line-O; Star Relay
5. Safety; Compass Segments; Poison-O
6. Safety; Courses / Relays

Culminating Activity: All-Camp Team Treasure Hunt (Score-O)

Details: Camp Belknap - https://sites.google.com/navigationgames.org/orienteeringlessons/site-specific-materials/camp-belknap

### Decision: use the Google Site 6-session plan as the camp structure
The slide deck (Camp Belknap Design Meeting #3) has a more detailed 10-session plan, but we chose the Google Site's 6-session plan as the framework. The slide deck is still a source to mine for activity details, course design principles, and progressions.

### Camp activity inventory

Activities with pages (tagged `[camp]`):
- Animal-O ✓ (core school activity, also used in camp)
- Map Walk ✓ (core school activity, also used in camp; updated time to 15-40 min)
- Score-O / Map Treasure Hunt ✓ (core school activity, also used in camp)
- Symbol Relay ✓ (standalone page `content/activities/symbol-relay.md`; companion in symbol-o.md trimmed to cross-reference)
- Poison-O ✓ (standalone page `content/activities/poison-o.md`; companion in score-o.md trimmed to cross-reference)
- Find Your Way Home ✓ (`content/activities/find-your-way-home.md`)
- Map Discussion ✓ (`content/activities/map-discussion.md`)
- Checkpoint Copy Relay ✓ (`content/activities/checkpoint-copy-relay.md`)
- Compass Basics ✓ (`content/activities/compass-basics.md`)
- Line-O ✓ (`content/activities/line-o.md`)
- Star Relay ✓ (`content/activities/star-relay.md`)
- Window-O ✓ (`content/activities/window-o.md`)

Activities that still need pages or decisions:
- Description Relay - same format as Symbol Relay but with IOF control description pictograms instead of map symbols. No write-up yet. Could be a Symbol Relay variation rather than standalone.
- Compass Segments - navigating segments using compass bearings with only partial map sections. No write-up yet.
- Compass Spider - ✓ now documented as a Star Relay companion/variation in `content/activities/star-relay.md`. Same as Star Relay but with whited-out map sections forcing compass use.
- Vampire-O - Score-O at night with tag mechanics, red flashlights, reflective tape checkpoints, punch card trading. No write-up yet. Details from Design Meeting #3 transcript.
- Friendship Relay - groups of 3 split checkpoints by ability; all meet at a common point. From Design Meeting #3 transcript. No write-up yet.
- Memory-O - navigate by memory using short courses or sequential map snippets. Two formats: (1) memorize a 3-checkpoint course at the start, run it, verify with codes at each checkpoint; (2) find one checkpoint at a time, where each checkpoint has a map snippet showing the next one. Format 1 works well with multiple short courses; format 2 works best with a single course. From Design Meeting #2 transcript. No write-up yet.
- Courses - "put it all together and orienteer" (delivery format, not a single activity?)
- Courses / Relays - orienteer in teams (delivery format?)

Open question: activities that are not standalone enough for their own page could have their delivery steps included directly in the camp lesson plan instead.

### Sources to mine

| Source | Status | Notes |
|---|---|---|
| Google Site camp pages | Started | Structure above; more content to extract |
| Camp Belknap video #3 transcript (Evalin & Kieran) | Mined | Design Meeting #3. Key finds: 10-session plan detail, safety progression, two-week checkpoint rotation, Compass Spider, Friendship Relay, Vampire-O detail, White/Yellow/Orange course levels, checkpoint placement principles. Applied to star-relay.md, poison-o.md, compass-basics.md, all 6 camp skill development lessons, and camp full index. |
| Camp Belknap video #4 transcript (Evalin & Kieran) | Mined | Design Meeting #4 (final meeting). `background/camp-belknap-design-meeting-4.txt`. Key finds: leader training strategy (abridged run-throughs, practice facilitating), Animal-O trust framing (no recording needed at camp), Symbol Relay progression (local symbols first, expand in development week), accuracy-over-speed emphasis for first Score-O, answer key concept for pin punches, recognition/sticker system concept (multi-level, designed for multi-year return). Applied to camp full index (leader training section), camp lessons 1/2/4/6, checkpoints page. |
| Camp Belknap video #2 transcript (Evalin & Kieran) | Mined | Design Meeting #2. `background/camp-belknap-design-meeting-2.txt`. Overview session presenting the three-level structure and running through all activities. Key finds: OUSA Skills Recognition alignment (intro + compass = Level 1; all skill activities = 80-90% of Level 2), recognition system discussion (camp prefers two levels over three, superseded by Meeting #4 details), Memory-O two-format description, relay variation (three similar courses at once so no one waits), equipment discussion (camp has compasses and old punch cards), permanent courses deferred for first year. Most activity descriptions were less detailed than later meetings. |
| Camp Belknap other videos (Evalin & Kieran) | Not started | Need transcript for video 1 |
| OUSA Orienteering Development Model | Available locally | `background/orienteering-development-model.md` |
| Google Site activity descriptions | Captured | Listed in camp activity inventory above |
| Google Site supporting info (equipment, maps, camp proposals) | Captured | Mostly marketing/sales; not curriculum content |
| Map Discussion one-pager (PDF + MD in Downloads) | Have it | Keep exact words; no full lesson plan exists yet |
| Maprunner school map symbols reference | Noted | https://www.maprunner.co.uk/resources/Maprunner-schools-map-symbols.jpg |
| Map Discussion videos | Noted | youtube.com/watch?v=vug5kiA67N8 and H3TLmTNOb5E; general map symbol videos, belong in reference section not activity page |
| Camp Belknap Design Meeting #3 slide deck | Mined | `background/camp-belknap-design-meeting-3.pdf`; 10-session plan (not using as structure), new activities (Compass Segments, Compass Spider, Vampire-O), course design principles (White/Yellow/Orange), tools (Purple Pen, OCAD Sketch) |
| Camp Belknap other slide decks and videos | Not started | Referenced on Google Site camp page |
| Existing site camp landing page | Not checked | `site/docs/lessons/camp/` |
| Skill-concept-sequence forest/camp section | Available | Concepts 37-48 in the Nav Games Progression |
