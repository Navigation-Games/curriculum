---
title: Roadmap
sidebar_position: 2
---

# Roadmap

What's done, what's next, and what's deferred.

## Done

- Content build system: clean Markdown content files generate MDX site pages
- 8 core activity pages: Boundary Run, Gathering, Animal-O, Clothespin-O, Geometric-O, Map Walk, Score-O, Point-to-Point
- Symbol-O (7th core page, already existed)
- Vocabulary decision: use "checkpoints" consistently; glossary notes the orienteering term "control"
- 7 lesson plans (Grade 3-5): Boundary, Return, Explore & Find, Clue Sheets, Map Readiness, Maps, Indoor Orienteering
- Dual-view rendering: full page and printable one-pager from the same content file
- Test suite (80 tests) covering parser, validator, and MDX generation
- CI pipeline: GitHub Actions runs content build + tests before deploying
- README rewritten for human editors
- Component and build system docs in DEVELOPMENT.md

## Next

### Completing Version 1 of the curriculum

- **Incorporate Kieran's feedback.** Kieran makes notes separately (not editing in GitHub or Google Docs). Barb works with Claude to incorporate his feedback into the content files.

- **Review all scripts and circle back to Erkan and Mikayla's scripts.** Compare the current activity and lesson content against the delivery scripts written by Erkan Sezgin and Mikayla Moss to make sure nothing important was lost or contradicted.

- **Compare all activities to edited one-pagers and full versions.** Where edited one-pagers or full activity write-ups exist (especially those developed by Kieran), compare them against the current activity pages and incorporate any missing content or corrections.

- **Edit the video scripts.** The video scripts were drafted before the latest round of lesson and activity edits. They need to be updated to reflect current delivery, vocabulary, and structure.

- **Update the Activities & Lessons Table, Equipment, and other supporting pages.** These pages may be out of date after the editing rounds. Review and sync them with the current state of activities and lessons.

- **Get transcripts from the Camp Belknap videos.** Evalin and Kieran recorded videos for the camp curriculum at Camp Belknap. Get the transcripts and mine them for delivery scripts, lesson plans, activity ideas, and improvements to the program.

- **More visuals.** Activity pages and lesson plans need more photos, diagrams, and setup images throughout the curriculum.

### Curriculum design

- **Consistent role vocabulary.** The progression defines roles (Finder, Hider, Helper, Spectator) and the lesson plans use Navigator and Checker, but the terminology is not yet consistent across all activities and lessons. We need to decide on a single set of role names, grounded in what matters for orienteering, and use them everywhere.

- **Year-over-year progression within a grade band.** How do we teach kids who come back year after year? The current lessons assume a first encounter with orienteering. We need guidance on how to progress students who already did the sequence last year, so each year builds on the last rather than repeating.

- **Single-setup, multi-grade teaching.** At many schools, a teacher sets up once for the day and runs multiple grades (or even multiple lessons) through the same setup. The curriculum should address how to use one physical arrangement to serve different classes at different levels, with guidance on which activities scale across grades and which need adjustment.

### Content gaps

- **Companion activities without links.** Four companion activities are referenced in lesson plan cards but have no link because they live inline with their parent core activity, not as separate pages:
  - Animal Relay (Lesson 3, companion of Animal-O)
  - Geometric Readiness (Lesson 5, companion of Geometric-O)
  - Symbol-O (Lesson 5, companion of Map Walk)
  - Find the Cone (Lesson A, companion of Geometric-O)

- **Background PDFs.** No source PDFs exist yet for Score-O, Map Walk, or several companion activities. Existing PDFs cover Boundary Run, Gathering, Animal-O, Geometric-O, Napkin-O, and Pacman-O.

- **Content alignment.** Goals, vocabulary, and delivery steps should be reviewed across activities and lessons to make sure they use consistent language and that short/long goal versions say the same thing. In particular, each lesson's orienteering goals should be consistent with (and traceable to) the goals of the activities it references. Currently there is no programmatic check for this; consider adding a build-time validation that cross-references lesson goals against the goals of their component activities.

- **PE standards audit after editing rounds.** After each major round of curriculum editing, verify that the SHAPE America standards mapping is still valid. Check both the reference page (`site/docs/reference/frameworks/pe-standards.md`) and the PE Standards section within each individual lesson. Lesson delivery changes can invalidate a standard citation (e.g., removing pair work removes the basis for a social skills indicator).

- **Leave No Trace page.** The current draft needs a tone revision so it feels natural and confident rather than justifying orienteering's existence. The core message is simple: orienteering is low-impact, and here is what to teach when you are in wilder areas.

### Design system

- **Extract shared CSS into reusable classes.** Button styles, popover styles, and other visual patterns are currently duplicated across component CSS modules. Pull shared styles into a single stylesheet so components reuse the same classes.

### Build and tooling

- **Automate content build on GitHub.** Right now, editing a content file on GitHub does not regenerate the site pages. The CI workflow runs the build, but the generated output is not committed back.

- **Content spec document.** Extract the rules content files must follow (required sections, frontmatter fields, goals format) into a standalone document. Use it as a reference for editors and as the source of truth for test generation.

### Site features

- **Camp curriculum.** The camp landing page exists but has no lesson plans yet.
- **Grade band expansion.** Currently only Grade 3-5 lesson plans exist. K-2 and 6-8 progressions are planned.
- **Search.** Docusaurus has built-in search (Algolia or local). Not yet configured.
- **Print styles.** The one-pager view works but could use CSS refinement for clean printing.
- **AI lesson plan advisor.** An embedded AI chat on the site that helps teachers build a tailored lesson plan based on their situation. Includes an intake form, conversation logging for curriculum improvement, and a follow-up survey. See the [detailed plan](https://github.com/Navigation-Games/curriculum/blob/main/notes/ai-lesson-advisor-plan.md).

## Deferred

These activities are set aside and not part of the current curriculum structure:

Corridor-O, Line-O, Window-O, Scooter-O, Tabletop-O, String-O, Tarzan-O, Maze-O
