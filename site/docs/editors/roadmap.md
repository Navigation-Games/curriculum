---
title: Roadmap
sidebar_position: 2
---

# Roadmap

What's done, what's next, and what's deferred.

## Next

### Site navigation redesign

Design decisions in `notes/site-navigation-redesign.md`. The hub is done. July 2026: school landing page enriched (constraints, standards, one-setup-many-classes, year-over-year, administrators section, broader teacher audience); How to Use This Site got a site map tree and a broadened "For teachers" section; Quick Start and Home link to About Orienteering; sidebar now actually expands on landing pages (fixed a baseUrl bug that had silently disabled the path matching). Remaining:

- **Dedicated "teaching orienteering at school" page (maybe).** The school landing page now covers constraints, multi-grade days, and year-over-year progression at summary level. Decide whether a deeper standalone page is still needed, or whether the landing page treatment is enough. Future bridge to the Clubs audience.

### Completing Version 1 of the curriculum

- **Incorporate Kieran's feedback.** Kieran makes notes separately (not editing in GitHub or Google Docs). Barb works with Claude to incorporate his feedback into the content files.

- **Review all scripts and circle back to Erkan and Mikayla's scripts.** Compare the current activity and lesson content against the delivery scripts written by Erkan Sezgin and Mikayla Moss to make sure nothing important was lost or contradicted.

- **Compare all activities to edited one-pagers and full versions.** Where edited one-pagers or full activity write-ups exist (especially those developed by Kieran), compare them against the current activity pages and incorporate any missing content or corrections.

- **Review the updated video scripts.** The scripts were restructured in July 2026 to match the current Grade 3-5 lesson sequence (including new scripts for Map Symbols and Orienteering Course). They need a human read-through before video production. Scripts for K-2, 6+, and camp lessons do not exist yet.

- **More visuals.** Activity pages and lesson plans need more photos, diagrams, and setup images throughout the curriculum.

### Curriculum design

- **Consistent role vocabulary.** The progression defines roles (Finder, Hider, Helper, Spectator) and the lesson plans use Navigator and Checker, but the terminology is not yet consistent across all activities and lessons. We need to decide on a single set of role names, grounded in what matters for orienteering, and use them everywhere.

- **Year-over-year progression within a grade band.** Summary guidance now lives on the school landing page (July 2026): repeat the same lessons with harder variations; advance bands when ready. Still to do: per-lesson "second year" notes, or a returning-students page with concrete examples.

- **Single-setup, multi-grade teaching.** Summary guidance now lives on the school landing page (July 2026). Still to do: a concrete reference table of which activities share which setups (animal checkpoints + corner cones vs. Score-O markers), possibly on the equipment setup pages.

- **Outside resources.** Done at summary level (July 2026): "Beyond school and camp" section on About Orienteering and "Get Involved in Orienteering" links on Resources (clubs, OUSA, IOF, Rogaine, adventure racing; URLs verified July 2026). Could later add guidance on when students are ready for each.

- **District-wide progression across grades.** An administrators section on the school landing page (July 2026) sketches the vision: align with district goals, champion, workshops, maps and materials, co-teaching, ongoing consultation, after-school teams, parent involvement. Could grow into a dedicated administrators page with case studies (e.g., Cambridge Public Schools partnership).

### Content gaps

- **Companion activities without links.** Companion activities referenced in lesson plan cards should link to the parent activity page where they are described (as Animal Relay in 3-5 Lesson 2 now does). Still to check:
  - Geometric Readiness (3-5 Lesson 3, companion of Geometric-O)
  - Symbol-O (3-5 Lesson 4, companion of Map Walk)
  - Find the Cone (3-5 Lesson A and K-2 Lesson 6, companion of Geometric-O)

- **Background PDFs.** No source PDFs exist yet for Score-O, Map Walk, or several companion activities. Existing PDFs cover Boundary Run, Gathering, Animal-O, Geometric-O, Napkin-O, and Pacman-O.

- **Content alignment.** Goals, vocabulary, and delivery steps should be reviewed across activities and lessons to make sure they use consistent language and that short/long goal versions say the same thing. In particular, each lesson's orienteering goals should be consistent with (and traceable to) the goals of the activities it references. Currently there is no programmatic check for this; consider adding a build-time validation that cross-references lesson goals against the goals of their component activities.

- **PE standards audit after editing rounds.** After each major round of curriculum editing, verify that the SHAPE America standards mapping is still valid. Check both the reference page (`site/docs/reference/frameworks/pe-standards.md`) and the PE Standards section within each individual lesson. Lesson delivery changes can invalidate a standard citation (e.g., removing pair work removes the basis for a social skills indicator).

- **Camp activities still needing write-ups.** Written in July 2026: Vampire-O and Capture the Flag-O (standalone pages from the one-pager summaries), Description Relay (Symbol Relay variation), Memory-O (Point-to-Point variation), Compass Spider (Star Relay variation). Star-O confirmed as Star Relay under another name; the alias is noted on the page. Still without write-ups: Compass Segments (session 5), Friendship Relay (groups of 3 split checkpoints by ability, meet at a common point), and Poly-dot-O from Marius's June 2026 audit.

- **Symbol Relay cards.** Symbol Relay now has a standalone activity page, but still needs a complete set of symbol relay cards (only a partial set exists). Decision: use **ISSprOM** symbols, with a schoolyard-specific subset for schools (paths, buildings, fences, etc.) that camps would not need. The existing partial set (`background/symbol-relay-cards.pdf`) has 8 ISOM terrain symbols only. Plan is to export clean vector images from OCAD (SVG or PDF export from a legend), then isolate individual symbols for card printing. Waiting on Kieran for an OCAD source file.

- **Review camp lesson plans against source materials.** The 9 camp lessons are first drafts. Design Meeting #3 video transcript has been mined; remaining sources to check: Google Site content, slide deck details, and other Camp Belknap video transcripts (when available).

- **Course design reference content.** White/Yellow/Orange course difficulty levels are now described in Camp Lesson 6 delivery notes, but could become a standalone reference page or setup guide with diagrams showing checkpoint placement principles (controls must be on distinct features, progression from path junctions to off-trail locations).

- **Printable materials for Basketball-O and Geometric-O.** Teachers still need to make or find the maps/court diagrams for these. Provide downloadable PDFs (court layout for Basketball-O, pattern templates for Geometric-O) so teachers can print and go. (Basketball-O was removed from the Quick Start "easy setup" list in July 2026 for exactly this reason; it can return once printables exist.) Same need for Animal-O clue sheet PDFs, so people can print their own.

### From the June 2026 feedback round (see notes/2026-spring-summer-feedback-plan.md)

- **Print/one-pager fixes.** Done at CSS level July 2026 (print expands all tabs with print-only section headings; one-pager print styles tightened). Needs a real print test by Barb to confirm the one-pager now fits a page; further tightening if not.
- **Activity card and popover polish.** Show duration on activity cards; make popover behavior consistent everywhere; add a visual cue that a link opens a popover; consider a larger popover. Add images to MaterialLink and VocabLink popovers. (Large activity icons on cards done July 2026.)
- **K-2 vs 3-5 clue-sheet lesson differentiation.** Make the two lessons visibly different (K-2 slows Animal-O down; 3-5 moves to checking and partner roles faster).
- **Advisor frontend starter tips.** Show example prompts above the chat input ("Tell me your grade level, space, and how many sessions...").
- **Deferred by Barb, revisit later:** sidebar-collapse discoverability, Level 1/2/3 framing for the curriculum, camp "session" vs "lesson" naming.

- **Leave No Trace page.** The current draft needs a tone revision so it feels natural and confident rather than justifying orienteering's existence. The core message is simple: orienteering is low-impact, and here is what to teach when you are in wilder areas.

### Design system

- **Extract shared CSS into reusable classes.** Button styles, popover styles, and other visual patterns are currently duplicated across component CSS modules. Pull shared styles into a single stylesheet so components reuse the same classes.

### Build and tooling

- **Automate content build on GitHub.** Right now, editing a content file on GitHub does not regenerate the site pages. The CI workflow runs the build, but the generated output is not committed back.

- **Content spec document.** Extract the rules content files must follow (required sections, frontmatter fields, goals format) into a standalone document. Use it as a reference for editors and as the source of truth for test generation.

### Site features

- **Grade band expansion.** K-2 and 6+ lesson plans exist but need further editing passes. Camp Intro and Skill Development curricula have first-draft lesson plans.
- **Search.** Docusaurus has built-in search (Algolia or local). Not yet configured.
- **Print styles.** The one-pager view works but could use CSS refinement for clean printing.
- **AI lesson plan advisor enhancements.** The advisor is live at `/plan-my-lessons/`. Remaining work: follow-up survey link at end of conversations, curriculum Q&A mode (answer specific questions like "give me the script for Animal-O"). Done July 2026: generated site map (`ai-advisor/site-map.md`, rebuilt by the content build script) is appended to the system prompt so the advisor can route people to real pages; requires a Cloud Run redeploy to take effect. See the [detailed plan](https://github.com/Navigation-Games/curriculum/blob/main/notes/ai-lesson-advisor-plan.md).
- **Conversation review.** Live. Staff review advisor conversations and leave feedback at `/review-conversations/` (linked from For Editors). Periodically: review the accumulated feedback with Claude and update the advisor system prompt. Setup details in "Conversation review setup" in `ai-advisor/README.md`.
- **Page feedback.** Live. Every docs page has a "Was this page helpful?" widget (thumbs + optional comment) below the footer. Results go to the PageFeedback tab of the advisor log sheet. Future: curate the best comments into "From teachers" sections (see the advisor plan notes).

- **Site sign-in.** Done July 2026 (see CLAUDE.md "Site sign-in"): any Google account = viewer (100 advisor messages/day, unlimited verified feedback); navigationgames.org = manager (no advisor limit, For Editors visible). Remaining: verify the OAuth consent screen is External and published (required for non-staff sign-in), and redeploy the advisor backend.

- **Mine the Cambridge Grade 3 V6 lesson plans** (`background/cambridge-grade-3-lesson-plans-v6.md`, 2019). Do NOT use its SHAPE standards (outdated) or substitute its lesson content for current material. Worth mining from "About these lessons": the Observation and Mindfulness essay and "Maps tell you how to find things" (start with non-map ways of communicating location) could join the Progression concept notes or About > Concepts. Its isometric map introduction (Where's Waldo-style pictorial maps as a bridge before real maps) is not in the current curriculum and could become a readiness note on Geometric-O or Map Walk. Roles content is already captured in Progression concept #26.

- **Camp Belknap case study.** The one remaining item from the April 2026 ACA podcast prep (the safety checklist, ways-to-use list, budget guidance, three first steps, and Adapting for All Learners page were all written in July 2026). A short "how one camp built a program" story: YMP map, design meetings, tailored curriculum, staff training, multi-year progression. Could live on the camp landing page or as its own page.

## Deferred

These activities are set aside and not part of the current curriculum structure:

Corridor-O, Scooter-O, Tabletop-O, String-O, Tarzan-O, Maze-O

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
- 7 camp activity pages: Map Discussion, Checkpoint Copy Relay, Poison-O, Compass Basics, Line-O, Star Relay, Window-O
- Camp Intro curriculum (3 sessions): Animal-O, Find Your Way Home, Map Treasure Hunt
- Camp Skill Development curriculum (6 sessions): Getting Started through Courses and Relays
- Build system extended to process camp lessons from content/lessons/camp/
- trailingSlash fix for local dev server (relative links in index pages)
- Poison-O reconciled: standalone page is canonical; score-o.md companion trimmed to cross-reference
- Symbol Relay standalone activity page (was inline in symbol-o.md)
- Find Your Way Home standalone activity page
- Activities & Lessons table updated with all camp activities
- SEL PQA framework page: mapping curriculum to the Forum for Youth Investment's SEL PQA observation rubric
- Broken sibling links fixed; sibling link rule (`../` required) documented in CLAUDE.md
- Equipment merged into Reference: Materials Index, Maps, Controls and Punches, Navigation Games Kits, Geometric-O Setup, Electronic Timing pages created from Google Site content
- Equipment navbar tab removed; all equipment content now lives under Reference > Equipment & Materials
- Materials Index reorganized by category (Maps and Navigation Sheets, Checkpoint Supplies, Recording Tools, General Equipment) with right-side table of contents
- Vocabulary rename: "master map" replaced with "all-checkpoints map" across the entire curriculum
- ISSprOM chosen as the map symbol standard for the curriculum (sprint/urban maps match schoolyard and park settings)
- Activities & Lessons reference page updated with all 20 activities and all lesson plans (K-2, 3-5, 6+, Camp Intro, Camp Skill Development)
- Camp Belknap Design Meeting #3 video transcript mined for curriculum improvements
- Camp Belknap Design Meeting #4 video transcript mined: leader training section added to camp index, delivery tips added to camp lessons 1/2/4/6, answer key concept added to checkpoints-and-punches reference
- "control" replaced with "checkpoint" throughout curriculum content; page renamed to "Checkpoints"
- Camp landing page expanded with philosophy, growth mindset, and being-lost sections
- Growth Mindset and Being Lost added to About > Concepts
- Local search (docusaurus-search-local) added to site
- Home page camp link fixed to point to /lessons/camp/; duplicate camp.mdx removed
- Star Relay: added Compass Spider variation (whited-out map forces compass use), clothing-item precision variation, and teamwork/communication themes
- Compass Basics: added safety bearing concept and tip about compass role in orienteering
- Poison-O: added multi-variant progression (A/B/C/D maps then full Score-O), tip about forcing independence
- Camp Skill Development lessons: safety talks now have specific topics per session (boundaries, time management, safety bearing, relocation strategies, "it's OK to get lost")
- Camp Skill Development index: added setup strategy section (two-week checkpoint rotation, mixed-level group guidance, safety progression)
- Camp Lesson 2: added symbol recap step and note about keeping first Score-O checkpoints close
- Camp Lesson 6: added White/Yellow/Orange course difficulty level guidance
- Camp Belknap Design Meeting #2 video transcript mined: OUSA alignment noted, Memory-O descriptions captured, recognition system discussion (two levels preferred), relay variation (three simultaneous similar courses)
- All available Camp Belknap design meeting transcripts mined (Meetings #2, #3, #4; Meeting #1 recording not available)
- AI lesson plan advisor: live at `/plan-my-lessons/` with Claude Sonnet backend on Google Cloud Run, Google Sheets conversation logging, multi-language support, and community resource links (NEOC, OUSA, Navigation Games events)
- Skill-based lesson names across all three grade bands (June 2026): names describe the skill being learned, not the activity (e.g., Match the Code, Route Choice, Say Where). Page titles render as "Lesson 2: Match the Code"
- Grade 3-5 index page reframed around "ready to teach"; Activities Referenced section removed
- Activity summary popovers (ActivityLink) on lesson Delivery links: click shows tagline, description, time, and space without leaving the lesson; data auto-generated from activity sources
- Material popups deep-link to the matching section of the Materials Index (stable explicit heading anchors)
- Right-side TOC removed from generated activity and lesson pages; left sidebar hideable and collapsed by default
- Readiness activity cards now precede core cards in lessons (warm-up, readiness, core, variation, extension)
- Advisor chat markdown rendering fixed for nested bold/links and `*` bullets
- Lessons hub page (`site/docs/lessons/index.md`): explains school vs camp distinction, what's the same and different, cards to each program. Navbar "Lesson Plans" now lands here; hub is root breadcrumb on all lesson pages.
- Site sign-in (July 2026): Google sign-in for viewer/manager tiers; advisor limits per verified email, unlimited verified page feedback, For Editors soft gate with hidden navbar link
- Feedback widget fixes (July 2026): new submission allowed right after submitting; advisor intro discloses that conversations are recorded and reviewed
- Bottom prev/next navigation fixed (July 2026): grade and camp index pages set pagination_next to Lesson 1 instead of pointing at themselves
- Activity icons (July 2026): large icons on activity cards and in the Activities Table, looked up from activitiesData by title
- Print improvements (July 2026): all tabs print with print-only section headings; one-pager print styles tightened
- Advisor site map descriptions: multi-line JSX tags no longer leak attribute text (Resources page had "allowFullScreen" as its description); Resources got a real intro paragraph
