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
- `<ActivityLink>` popovers: activity links in lesson Delivery sections open an in-place summary (tagline, description, time, space) with a link on to the full activity page. The build script converts the markdown links and generates the data module (`site/src/components/ActivityLink/activitySummaries.ts`, gitignored) from `content/activities/`
- `<CardGrid>` for responsive grid layouts (3 columns on desktop, 2 on tablet, 1 on phone)
- `<YouTube>` for responsive video embeds
- Tabs component for structured sections within activity/lesson pages
- Compact/one-pager view rendered from the same MDX source (URL parameter or print-friendly toggle)
- The right-side TOC is hidden on all generated activity and lesson pages (`hide_table_of_contents` added by the build script). On activity pages the content headings live inside Tabs panels, so TOC anchors can never scroll; lesson pages have a fixed section order that needs no TOC
- The left nav sidebar is hideable and **starts collapsed** so lesson text gets the full width. Implemented by the swizzled components in `site/src/theme/DocRoot/Layout/` (the only changes from the Docusaurus originals are commented at the top of each file)
- Day-to-day editing is just Markdown files in the repo; GitHub Actions rebuilds on commit
- Visitor statistics: Cloudflare Web Analytics (cookie-free), turned on by `CLOUDFLARE_ANALYTICS_TOKEN` in `site/docusaurus.config.ts`. Setup in "Visitor statistics" in `ai-advisor/README.md`. No analytics existed before October 2026, so there are no earlier visit counts
- `trailingSlash: true` is set in `docusaurus.config.ts`. This is required so that relative links in index pages (e.g., `./lesson-1` in `grade-3-5/index.md`) resolve correctly. Without it, the dev server serves `/grade-3-5` without a trailing slash, and the browser resolves `./lesson-1` relative to the parent (`/lessons/school/lesson-1` instead of `/lessons/school/grade-3-5/lesson-1`). GitHub Pages adds trailing slashes on its own, so the bug only appears locally. Do not remove `trailingSlash: true`.
- **Sibling page links need `../`** because of `trailingSlash: true`. A page at `/activities/core/gathering/` treats a bare relative link like `(boundary-run)` as a child path (`/activities/core/gathering/boundary-run/`), not a sibling. Always write `(../boundary-run)` to link between pages in the same directory. Index pages are the exception: since they represent the directory itself, their relative links correctly resolve to children. This applies everywhere: activity content files, framework pages, lesson plans.

## Repo Layout

- `content/activities/` - **source files for activities** (edit here, never in site/docs/)
- `content/lessons/` - **source files for lesson plans** (edit here, never in site/docs/)
- `content/training/` - **source files for the teacher course** (prototype, October 2026; edit here, never in site/docs/training/). Built by `scripts/build-training.js` into unlisted pages at `/training/` and `ai-advisor/training-units.json` (committed, like site-map.md). Format is in the editing guide. Design doc: Google Doc "2026 Curriculum Training" (`1A4aOEtHewDPJgtnA_OWd4zIVPRt1bpzn310wXnGkIYM`)
- `background/` - source materials, reference docs, uploaded context files (site-tools-discussion.md, ng-curriculum-prep.html, etc.)
- `notes/` - curriculum decisions, open questions, author notes
- `ai-advisor/` - AI lesson plan advisor backend (Python/Flask, deployed on Google Cloud Run)
- `site/docs/activities/core/` - **AUTO-GENERATED** activity pages (do not edit; do not create files here)
- `site/docs/lessons/school/` - **AUTO-GENERATED** lesson pages (do not edit; do not create files here), plus hand-maintained index.md files
- `site/docs/lessons/camp/` - camp lesson progressions (hand-maintained)
- `site/docs/about/` - about pages: about-orienteering, how-to-use, impact, acknowledgments, copyright
- `site/docs/reference/` - glossary, frameworks, equipment & materials
- `site/docs/reference/equipment/` - materials index, maps, controls, kits, setup guides, electronic timing
- `site/src/components/` - reusable React components (ActivityCard, CardGrid, YouTube, AdvisorChat)
- `site/src/pages/` - standalone landing pages (home, quick-start, plan-my-lessons, review-conversations)

## Key References

- **Editing guide:** `site/docs/editors/editing-guide.md` — how content files are structured, where to edit, how the build system works. Read this at the start of any content-editing session.
- **Roadmap:** `site/docs/editors/roadmap.md` — what's done, what's next. Update the roadmap when we identify work that should happen next.
- **Activities & Lessons table:** `site/src/components/ActivitiesTable/activitiesData.ts` — master list of activities with metadata. Keep this in sync when adding or changing activities.
- **AI Advisor README:** `ai-advisor/README.md` — deployment, configuration, and rebuild instructions for the lesson plan advisor backend.
- **AI Advisor plan:** `notes/ai-lesson-advisor-plan.md` — design decisions, future features, and test scenarios.
- **Advisor conversation log:** Google Sheet `13P76_hPAVDDjnwJ9aazIdW-WAtGKNW5fBVD6TX1s5aY` — all advisor conversations are logged here for curriculum improvement.

## Working Conventions

- Prefer having Barb check the results of changes, when she is available, rather than spending tokens on automated verification. It is often easier and faster for her to look at the result than for Claude to verify programmatically. This includes browser/UI verification (sidebar behavior, layout, popovers): tell Barb exactly what to look at and what to expect instead of driving the preview browser. Running builds and test suites is still Claude's job.
- Write content in Markdown
- Keep filenames lowercase-kebab-case
- Avoid em-dashes in all writing. They signal AI authorship. Split into separate sentences or use other connectors.
- Companion activities live with their parent core activity, not as separate top-level items
- Companion-to-core relationships tracked in frontmatter `parents` field (supports many-to-many)
- All lesson plans must work without electronic timing. SI (electronic timing) is a separate equipment topic for teachers, not a prerequisite for any lesson
- Lesson plans for grades 3-5 and 6+ include SHAPE America 2024 (4th edition) PE standards. Indicator codes use the format `[Standard].[GradeSpanEnd].[Indicator]` (e.g., 2.8.7 = Standard 2, grades 6-8, indicator 7). Grade spans: PreK-2, 3-5, 6-8, 9-12
- Deferred activities (Corridor-O, Scooter-O, Tabletop-O, String-O, Tarzan-O, Maze-O) are set aside. Don't include in main curriculum structure
- Do not restructure the lesson table in `site/docs/lessons/school/grade-3-5/index.md` without explicit review from Barb. The 3-column format (Lesson / What it adds / Activities) is intentional
- **Lesson names describe the skill being learned, not the activity** (decided June 2026). Examples: "Match the Code" not "Clue Sheets", "Route Choice" not "Strategic Navigation". The content file H1 stays in the form `# 2 - Match the Code`; the build script renders page titles as "Lesson 2: Match the Code". When renaming a lesson, update all the places that reference it by name: the grade band index page, `site/docs/reference/activities-and-lessons.mdx`, the PE standards tables in `site/docs/reference/frameworks/pe-standards.md`, and the advisor system prompt (`ai-advisor/system-prompt.md`, requires Cloud Run redeploy)
- When writing content files from PowerShell, never use `Set-Content -Encoding utf8`: Windows PowerShell 5.1 adds a UTF-8 BOM, which silently breaks the build script's title parsing (it matches `# ` at byte 0). Use `[System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding $false))` instead
- NEVER use colons inside YAML frontmatter list items. A colon followed by a space is YAML's key-value separator, so `- Optional: foo` silently becomes `{Optional: "foo"}` instead of a string, breaking the build. Rephrase instead (e.g., `- Poster-sized map (optional)` not `- Optional: poster-sized map`)
- When adding or defining a vocabulary term, always add it to all three places: (1) the glossary page (`site/docs/reference/glossary.md`), (2) the glossary data file (`site/src/components/VocabLink/glossaryData.ts`), and (3) the activity's `## Vocabulary` section. All three must stay in sync for VocabLink hyperlinks to work.
- When adding a material, keep `site/src/components/MaterialLink/materialsData.ts` and `site/docs/reference/equipment/materials.md` in sync, and give the materials.md heading an explicit anchor equal to the slugified canonical name (e.g., `#### Start/finish markers {#start-finish-markers}`). MaterialLink popovers deep-link to that anchor; without it, the auto-generated slug would include the NG Kit badge text.
- Map symbols use the **ISSprOM** (International Specification for Sprint Orienteering Maps) symbol set, not ISOM. ISSprOM is designed for sprint/urban maps at 1:4,000 scale, which matches schoolyard and park maps. Symbol Relay cards will have an ISSprOM base set plus a schoolyard-specific subset (paths, buildings, fences, etc.) that camps would not need.

## Writing in Barb's Voice

For anything written for Barb to publish or send (web copy, docs, emails, README text). Copied from her global CLAUDE.md so it applies in this repo too. Learned from her edits to the MapMap About page, which turned a draft from an organization covering itself into a person explaining something.

- Say what's true and specific to this work. Prefer the real reason or example over a generic claim.
- Don't pre-apologize or promise ("some info may be wrong," "we read everything," "things will change"). State it once, only if it matters.
- Leave out completeness for its own sake. Include what the reader needs.
- Add the practical advice and stakes an insider would give (permissions, access, a free tool to use meanwhile). Plain emphasis is fine ("That is super important").
- Use precise domain terms (copyright owner, landowner, club map curator) instead of flattening them.
- Be warm and direct when inviting people ("We'd love to...", "Please send..."). Use plain verbs.
- Avoid: an even rhythm of short declarative sentences, "not X but Y", lists of three, institutional hedging, marketing wording.
- Let sentence length vary. Draft short, and expect Barb to edit; her edits are the best guide to the voice.

## Lesson Plan Writing Practices

These practices were established during the K-2 editing pass and should be applied across all grade bands.

### Delivery should be self-contained
A teacher should be able to read the Delivery section and know what to do without clicking through to the activity pages. The lesson tells you what to do today. Activity pages provide depth for those who want it (full scripts, photos, detailed progressions). Include a link to each activity in the delivery or extensions so teachers can click through, but don't require it.

### Activity card order
Cards render in frontmatter order. Use: warm-up, readiness, core, variation, extension. Readiness precedes core (decided June 2026) because that matches the order a teacher runs them.

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
- **Site map in prompt:** `scripts/build-content.js` generates `ai-advisor/site-map.md` (every public page with title, URL, and one-line description; excludes `editors/`). `app.py` appends it to the system prompt at startup so the advisor routes people to real URLs instead of guessing. Lesson descriptions come from the content files' taglines. The file is committed (not gitignored) and regenerates on every content build.
- **Frontend:** React chat component (`site/src/components/AdvisorChat/`) on the Docusaurus site.
- **Rate limit:** in-memory (resets on deploy). Anonymous: 20 chat messages/day per IP. Signed in with any Google account: 100/day per verified email. Staff (navigationgames.org): unlimited. See "Site sign-in" below.
- **Logging:** Every conversation is logged to a Google Sheet for curriculum improvement.
- **Cloud Run service URL:** `https://lesson-advisor-523012695945.us-central1.run.app`
- **Google Cloud project:** `navigation-games-curriculum`

### Updating the advisor

The system prompt lives at `ai-advisor/system-prompt.md`. Changes to the system prompt, the generated `site-map.md`, the course tutor's `tutor-prompt.md` or generated `training-units.json`, `app.py`, or `requirements.txt` require rebuilding the container and redeploying to Cloud Run. See `ai-advisor/README.md` for the PowerShell commands. **The live advisor does not change on `git push`.** After a round of curriculum editing, remind Barb that a Cloud Run redeploy is needed for the advisor to see the updated prompt and site map.

Frontend changes (`AdvisorChat/`, `plan-my-lessons.*`, `ReviewConversations/`, `review-conversations.*`) deploy automatically via the normal GitHub Actions workflow on `git push`.

### Conversation review (staff feedback tool)

Built June 2026. NG staff review advisor conversations and leave feedback at `/review-conversations/` (not in the navbar). Sign-in is Google Identity Services restricted to @navigationgames.org accounts; the backend verifies the ID token's `hd` claim (never check the email domain string). Feedback lives in the "Feedback" tab of the conversation log sheet (auto-created): timestamp, conversation_id, reviewer_email, status (commented/dismissed), feedback. Default list shows only conversations the signed-in reviewer hasn't handled; "Show all" reveals everything. Backend endpoints are `/review/*` in `ai-advisor/app.py`, tested by `ai-advisor/test_review.py` (run with `pytest` from `ai-advisor/`). Periodic workflow: Barb reviews accumulated feedback with Claude and updates the system prompt. Requires `REVIEW_OAUTH_CLIENT_ID` env var on Cloud Run plus `reviewOauthClientId` in `docusaurus.config.ts`; setup steps in `ai-advisor/README.md`.

### Page feedback widget

Every docs page has a "Was this page helpful?" thumbs up/down + optional comment widget below the footer, rendered by the swizzled `site/src/theme/DocItem/Footer/index.tsx` wrapping the default footer and `site/src/components/PageFeedback/`. Submissions POST to `/page-feedback` on the advisor backend (auth optional; rate limited when anonymous; tests in `ai-advisor/test_page_feedback.py` and `test_signed_in.py`) and land in the auto-created "PageFeedback" tab of the conversation log sheet. Anonymous rows have an optional free-text identity (unverified public input); signed-in rows skip the rate limit and carry `Name <email> (verified)`.

### Site sign-in (viewer/manager roles, July 2026)

Optional Google sign-in site-wide, reusing the review-conversations OAuth client (`reviewOauthClientId` in `docusaurus.config.ts`, `REVIEW_OAUTH_CLIENT_ID` on Cloud Run). Tiers:

- **Anonymous**: everything except For Editors; 20 advisor messages/day per IP; 10 feedback submissions/day per IP.
- **Viewer** = any signed-in Google account, or anyone signed in with an emailed sign-in link (October 2026, for teachers without Google): 100 advisor messages/day per verified email; unlimited page feedback, auto-tagged with the verified identity. No registration step or user store. Email-link sessions are never staff or managers, whatever the address; staff status comes only from a Google token's `hd` claim.
- **Manager** = signed in with a navigationgames.org account (`hd` claim): viewer perks, no advisor limit, and the For Editors section (navbar link + pages).

Pieces:
- `site/src/lib/googleAuth.ts` — shared auth store (token in localStorage until expiry, about an hour; `useGoogleUser()` hook; `renderSignInButton`). `site/src/components/GoogleSignInButton/` renders the button.
- Sign-in surfaces: advisor intro screen and chat header, page feedback form ("Give feedback often?" link), and the For Editors gate.
- **For Editors soft gate**: the swizzled `site/src/theme/DocRoot/Layout/index.js` swaps `/editors/` page content for `site/src/components/EditorsGate/` unless manager; `site/src/clientModules/managerClass.js` toggles an `ng-manager` class on `<html>` that unhides the navbar link (CSS rule in `custom.css`). Client-side only: the static content is still deployed and indexed by local search. Never publish anything genuinely sensitive under `/editors/`.
- Backend: `get_optional_user()` in `ai-advisor/app.py`. A present-but-invalid token returns 401 so the frontend re-prompts sign-in; with no client ID configured everyone is anonymous. Tests: `ai-advisor/test_signed_in.py`.
- **Email sign-in links**: `/auth/email-link` emails a 15-minute link (sent through the NG Workspace as `EMAIL_LINK_SENDER`), `/sign-in/` (`site/src/pages/sign-in.tsx`) exchanges it at `/auth/email-link/verify` for a 30-day session token (prefix `ngs.`, signed with `SIGN_IN_SECRET`), stored in the same auth store as Google sign-in. Setup: "Email sign-in links setup" in `ai-advisor/README.md`. Tests: `ai-advisor/test_email_signin.py`.
- **Teacher course**: the course tutor (`/tutor`) requires sign-in, and `/tutor/progress` rebuilds a teacher's conversations and profile from the log sheet so they can pick up on any device.
- **Course submissions** (October 2026): "Send to Navigation Games" under a saved box posts to `/tutor/submit`, which emails `COURSE_REVIEWER_EMAIL` (Reply-To the teacher) and the teacher a copy, and logs a "Submissions" tab in the log sheet. The Unit 4 plan is passed to the tutor in later units (`plan`), and a `schedule` box downloads a class calendar file (`TrainingTutor/calendar.ts`). How the course runs for staff (feedback points, dates, cohorts, the weekly `course-checkin.gs` email) is in "Teacher course: how it runs" in `ai-advisor/README.md`. Tests: `ai-advisor/test_tutor_submit.py`.
- **Tutor voice** (October 2026): `/tutor/speak` reads tutor replies aloud through ElevenLabs (setup: "Tutor voice setup" in `ai-advisor/README.md`). It only speaks text signed with a `speech_token` from `/tutor` or `/tutor/progress`, or a unit opening, so the voice (possibly a staff member's clone) can't be made to say arbitrary text. Keep it labeled as an AI voice. Tests: `ai-advisor/test_tutor_voice.py`.
- **Consent screen**: public viewer sign-in requires the OAuth consent screen (Google Cloud project `navigation-games-curriculum`) to be External and published. If it is Internal, only staff accounts can sign in anywhere.
- Backend changes require a Cloud Run redeploy; frontend changes deploy on `git push` as usual.

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

Generated files in `site/docs/` are gitignored and rebuilt by GitHub Actions on every push. They should not be committed. The same applies to `site/src/components/ActivityLink/activitySummaries.ts`, a generated data module (the component's `index.tsx` and `styles.module.css` in that directory ARE tracked).

The only hand-maintained files inside generated directories are `index.md` landing pages. If you ever add a new hand-maintained file to a directory that also contains generated files (`site/docs/activities/core/`, `site/docs/lessons/school/grade-3-5/`, `site/docs/lessons/school/grade-k-2/`, `site/docs/lessons/school/grade-6-plus/`), you MUST add a negation rule (`!` pattern) to `.gitignore` so git tracks it. Check `.gitignore` for the existing patterns and comments.

The "Edit this page" links use a custom `editUrl` function in `site/docusaurus.config.ts` that maps auto-generated pages back to their `content/` sources. When adding a new category of auto-generated files (e.g., camp lessons), update the `editUrl` function so the new pattern also points to `content/`.

## Kickstart Orienteering (program, lives outside this repo)

**Kickstart Orienteering: "Put your School on the Map"** is a free Navigation Games program (launched at the SHAPE Colorado conference, October 2026) that helps teachers and school leaders teach this curriculum. It is a program for *delivering* the curriculum, not part of the curriculum, so its working files live in Google Drive, not here. Keep it that way for now.

Participating schools get a Beginning Orienteering Instruction Kit, an orienteering map made through OUSA's Youth Map Program (YMP), online training, two consultations with NG, and curriculum access. They commit to the training, a planning survey, teaching at least one activity, and a post-unit survey. The kit ships after the training and planning survey are done (lesson from the 2026 MOOR grant program, where kits went first and surveys never came back).

**Where things are** (Drive folder `18aymaUA_7GEcTcQitVeHdVpqxaqBpeuN`, https://drive.google.com/drive/u/0/folders/18aymaUA_7GEcTcQitVeHdVpqxaqBpeuN):
- **2026 Updated Kickstart Orienteering Program Description** (Google Doc). Public-facing draft text, the internal participant flow (11 steps), school verification via NCES, MOOR lessons, resources needed, budget, open decisions, and draft survey questions. Collaborators (Dave Yee) comment here.
- **Kickstart Orienteering Tracker** (Google Sheet). Tabs: Tracker (one row per applicant, stage and flag columns calculate from the date columns), Contact log (one row per email, call or consultation; feeds the Tracker's Last contact and Minutes spent columns, so never type in those two; also used for partners), Applicant view, To do, Local partners (people who may help NG locally, IDs `LP-001`; columns mirror Monday.com so they can be imported if NG moves contacts there; staying in Sheets for the first cohort, with moving partners to Monday.com listed in the roadmap as a later decision), Summary (dashboard and checks), Applications (read-only form responses, ID formula in column Z), Planning survey (read-only responses), Settings (staff rate, due-soon and overdue days, cohort cap, column maps). Applicant IDs look like `KO-2026-001`. The Settings tab explains how the Tracker works; read it before changing formulas.
- Three Google Forms: Application, Activity Planning Survey, Post Activity Reflection Survey. The post-unit survey does not yet feed a tracker tab.

**In this repo:** only the conference QR forwarding pages in `site/static/go/` (`signin`, `website`, `conference`, `curriculum`). `go/signin` is the sign-in form; it carried a "SHAPE CO" tag during the conference and was repointed to the untagged link afterwards (see the file's comment for tagging a future conference).

**Applicant folders:** each applicant has a Drive folder named `KO-2026-NNN <state> <last name>` inside the "Applicants" folder (https://drive.google.com/drive/folders/1DEfmgj67t8ahrAIkNLaELHaFZ0yfIq6R), with a summary Google Doc (application answers, notes, open questions, a "Map research" section to fill in, and links to Google Maps and the county GIS and assessor viewers for getting a school map made). The Tracker's "Applicant folder" column (AE) links to each folder. The Tracker stays the source of truth; the docs are a snapshot. Folders also hold parcel/outline files (KML for Google Earth or My Maps, GeoJSON for QGIS) pulled from public county ArcGIS parcel layers (Chaffee, San Miguel), Denver's open data parcels, or OpenStreetMap. These are tax-parcel or mapped outlines, not survey-quality. The pull method: query the county's ArcGIS FeatureServer with `f=geojson&outSR=4326` and a `where` on address or owner. Douglas County's server and Pueblo County's site did not respond to automated requests in October 2026. The first email to applicants (with a spot for the boundary image) is the Google Doc "01 Email to applicants after application".

**Applicant IDs are fragile:** the `KO-YYYY-NNN` ID in the Applications tab is the rank of the response's timestamp among all responses. Deleting any response renumbers every later applicant. The October 2026 test response was removed before any IDs went out, and the typed IDs in the Tracker and Contact log were renumbered by hand. After IDs have been shared with applicants, never delete a response row; mark it closed in the Tracker instead.

**Other tabs:** Applicant view (pick an applicant ID to see status, latest Contact log entries, progress, school details and their application answers), To do (current action list for the program, including deferred decisions on pricing, cohort size and funding).

**Status (October 18, 2026):** 6 applicants from the SHAPE CO conference (IDs KO-2026-001 to 006), all in Colorado, all needing a map. The current action list is the To do tab. YMP is open to schools and youth-serving organizations throughout the US, Colorado included (confirmed October 25, 2026). The online training is live at /training/ (Units 0 to 4 tested, 5 to 7 drafted).

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
- Star Relay ✓ (`content/activities/star-relay.md`; also called Star-O, confirmed July 2026 from the Star-O one-pager, which matched the existing page)
- Window-O ✓ (`content/activities/window-o.md`)
- Vampire-O ✓ (`content/activities/vampire-o.md`, from the Vampire-O one-pager July 2026; night version noted as camp differentiation)
- Capture the Flag-O ✓ (`content/activities/capture-the-flag-o.md`, from the Capture the Flag-O one-pager July 2026; plain Capture the Flag remains a Boundary Run companion with a cross-link)

Activities that still need pages or decisions:
- Description Relay - same format as Symbol Relay but with IOF control description pictograms instead of map symbols. No write-up yet. Could be a Symbol Relay variation rather than standalone.
- Compass Segments - navigating segments using compass bearings with only partial map sections. No write-up yet.
- Compass Spider - ✓ now documented as a Star Relay companion/variation in `content/activities/star-relay.md`. Same as Star Relay but with whited-out map sections forcing compass use.
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
