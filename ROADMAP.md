# Roadmap

What's done, what's next, and what's deferred.

## Done

- Content build system: clean Markdown content files generate MDX site pages
- 6 core activity pages: Boundary Run, Gathering, Animal-O, Geometric-O, Map Walk, Score-O
- 7 lesson plans (Grade 3-5): Boundary, Return, Explore & Find, Clue Sheets, Map Readiness, Maps, Indoor Orienteering
- Dual-view rendering: full page and printable one-pager from the same content file
- Test suite (80 tests) covering parser, validator, and MDX generation
- CI pipeline: GitHub Actions runs content build + tests before deploying
- README rewritten for human editors
- Component and build system docs in DEVELOPMENT.md

## Next

### Editing workflow

- **Set up Google Docs editing for Kieran.** Figure out a workflow where Kieran edits content in Google Docs instead of directly in GitHub. Needs a process for syncing Google Docs changes back into the repo's content files. Options to explore: manual copy-paste, a script that pulls from Google Docs, or a shared folder with export conventions.

### Curriculum design

- **Year-over-year progression within a grade band.** How do we teach kids who come back year after year? The current lessons assume a first encounter with orienteering. We need guidance on how to progress students who already did the sequence last year, so each year builds on the last rather than repeating.

- **Single-setup, multi-grade teaching.** At many schools, a teacher sets up once for the day and runs multiple grades (or even multiple lessons) through the same setup. The curriculum should address how to use one physical arrangement to serve different classes at different levels, with guidance on which activities scale across grades and which need adjustment. Real example: at a junior high, some classes are on Lesson 1 and others are on Lesson 2 in the same day. Switching between lessons with different setups is a real pain point. The curriculum should help teachers plan setups that work across multiple lessons.

### Content gaps

- **Companion activities without links.** Four companion activities are referenced in lesson plan cards but have no link because they live inline with their parent core activity, not as separate pages. Editors should know these exist but are intentionally not separate pages:
  - Animal Relay (Lesson 3, companion of Animal-O)
  - Geometric Readiness (Lesson 5, companion of Geometric-O)
  - Symbol-O (Lesson 5, companion of Map Walk)
  - Find the Cone (Lesson A, companion of Geometric-O)

- **Background PDFs.** No source PDFs exist yet for Score-O, Map Walk, or several companion activities. Existing PDFs cover Boundary Run, Gathering, Animal-O, Geometric-O, Napkin-O, and Pacman-O.

- **Content alignment.** Goals, vocabulary, and delivery steps should be reviewed across activities and lessons to make sure they use consistent language and that short/long goal versions say the same thing.

- **Leave No Trace page.** The current draft (`reference/frameworks/leave-no-trace.md`) reads a bit defensive. Revisit the tone so it feels natural and confident rather than justifying orienteering's existence. The core message is simple: orienteering is low-impact, and here is what to teach when you are in wilder areas.

### Design system

- **Extract shared CSS into reusable classes.** Button styles, popover styles, and other visual patterns are currently duplicated across component CSS modules. Pull shared styles into `site/src/css/custom.css` (or a dedicated shared stylesheet) so components reuse the same classes. Goal: consistent look-and-feel with less duplicated CSS, and a single place to update when the visual language changes.

### Build and tooling

- **Automate content build on GitHub.** Right now, editing a content file on GitHub does not regenerate the site pages. The CI workflow runs the build, but the generated output is not committed back. Options: a GitHub Action that commits generated files on push, or moving the build into the deploy step only.

- **Content spec document.** Extract the rules content files must follow (required sections, frontmatter fields, goals format) into a standalone `CONTENT-SPEC.md`. Use it as a reference for editors and as the source of truth for test generation.

- **Test generation from spec.** Periodically verify that tests match the content spec and that the spec matches what the build script actually enforces. Keeps all three in sync.

### Activities index

- **Make the activities index reader-friendly.** The current `/reference/activities-index` page is a sortable editor table (image, tagline, time, space, level). For the published curriculum, replace or supplement it with a layout that works better for teachers and on mobile. The editor table can stay as an unlisted page or be gated behind a query parameter.

### Site features

- **Camp curriculum.** The camp landing page exists but has no lesson plans yet.
- **Grade band expansion.** Currently only Grade 3-5 lesson plans exist. K-2 and 6-8 progressions are planned.
- **Search.** Docusaurus has built-in search (Algolia or local). Not yet configured.
- **Print styles.** The one-pager view works but could use CSS refinement for clean printing.
- **AI lesson plan advisor.** An embedded AI chat on the site that helps teachers build a tailored lesson plan based on their situation. Includes an intake form, conversation logging for curriculum improvement, and a follow-up survey. See [notes/ai-lesson-advisor-plan.md](notes/ai-lesson-advisor-plan.md) for the detailed plan.

## Deferred

These activities are set aside and not part of the current curriculum structure:

Corridor-O, Line-O, Window-O, Scooter-O, Tabletop-O, String-O, Tarzan-O, Maze-O

