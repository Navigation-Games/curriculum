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

### Content gaps

- **Companion activities without links.** Four companion activities are referenced in lesson plan cards but have no link because they live inline with their parent core activity, not as separate pages. Editors should know these exist but are intentionally not separate pages:
  - Animal Relay (Lesson 3, companion of Animal-O)
  - Geometric Readiness (Lesson 5, companion of Geometric-O)
  - Symbol-O (Lesson 5, companion of Map Walk)
  - Find the Cone (Lesson A, companion of Geometric-O)

- **Background PDFs.** No source PDFs exist yet for Score-O, Map Walk, or several companion activities. Existing PDFs cover Boundary Run, Gathering, Animal-O, Geometric-O, Napkin-O, and Pacman-O.

- **Content alignment.** Goals, vocabulary, and delivery steps should be reviewed across activities and lessons to make sure they use consistent language and that short/long goal versions say the same thing.

### Build and tooling

- **Automate content build on GitHub.** Right now, editing a content file on GitHub does not regenerate the site pages. The CI workflow runs the build, but the generated output is not committed back. Options: a GitHub Action that commits generated files on push, or moving the build into the deploy step only.

- **Content spec document.** Extract the rules content files must follow (required sections, frontmatter fields, goals format) into a standalone `CONTENT-SPEC.md`. Use it as a reference for editors and as the source of truth for test generation.

- **Test generation from spec.** Periodically verify that tests match the content spec and that the spec matches what the build script actually enforces. Keeps all three in sync.

### Site features

- **Camp curriculum.** The camp landing page exists but has no lesson plans yet.
- **Grade band expansion.** Currently only Grade 3-5 lesson plans exist. K-2 and 6-8 progressions are planned.
- **Search.** Docusaurus has built-in search (Algolia or local). Not yet configured.
- **Print styles.** The one-pager view works but could use CSS refinement for clean printing.
- **AI lesson plan advisor.** An AI agent on the site that helps teachers build a tailored lesson plan based on their situation: number of classes available, class length, indoor vs. outdoor space, and how much orienteering experience the students already have. The structured content format makes this feasible since the agent can reason over activities, prerequisites, and progressions to suggest a sequence that fits.

## Deferred

These activities are set aside and not part of the current curriculum structure:

Corridor-O, Line-O, Window-O, Scooter-O, Tabletop-O, String-O, Tarzan-O, Maze-O

## Cleanup

- `scripts_decoded.txt` is an untracked file in the repo root that may be leftover from a previous session.
