# Site Navigation Redesign

Design decisions from June 2026 conversation.

## Core design principle

**Home = audience/intent router.** Asks "who are you and what brought you here?" Routes by role and mode of engagement. Includes non-lesson destinations (Quick Start, AI advisor, How to Use). Register: welcoming, assumes visitor may not know orienteering. Leave a slot for a future **Clubs** audience card.

**Lessons hub = curriculum catalog.** Answers "I want a teaching program — show me the map." One level deeper than home. Its specific job: explain what's the same and what's different about school vs camp, then hand off to each program. Register: practical, structural, assumes you're here to teach.

**The rule that keeps them distinct:** home routes by audience and carries non-lesson destinations; the hub catalogs one audience's content one level deeper. If you can't tell them apart, the hub has drifted up to home's altitude and should be pushed back down.

## Navigation mechanics

The lessons hub (`site/docs/lessons/index.md`) is the first doc in `lessonsSidebar` in `sidebars.ts`. This means:
- Clicking "Lesson Plans" in the navbar lands on the hub (docSidebar links go to the first doc)
- The hub appears as the root crumb in breadcrumbs: `Lesson Plans › Teach at a School › Grades 3-5 › Lesson 2`
- The sidebar shows: Lesson Plans (hub) > Teach at a School category > Camp category

Home cards for School and Camp continue to deep-link past the hub for visitors who already know their bucket. Both paths work.

## Future: Clubs audience

A fourth home card eventually. Register: assumes orienteering knowledge, focuses on educational philosophy and how NG curriculum feeds into orienteering learning progression (OUSA alignment). Natural bridge from the "Outside resources" and "District-wide progression" roadmap items. The `background/orienteering-development-model.md` is the reference.

## Workstreams

### 1. Lessons hub (thin-ish, school vs camp rationale focus) — DONE
- `site/docs/lessons/index.md` — new hub page
- `site/sidebars.ts` — add `lessons/index` as first doc in lessonsSidebar

Hub content: what's the same (activities, progression philosophy, materials), what's different (school: 45-min periods, PE standards, mixed abilities, multi-grade days, year-over-year; camp: 70-min sessions, same group, SEL framing, independence as goal, compass and deeper skills). Cards to School and Camp.

### 2. School landing page — enrich + broaden audience
- Bring `site/docs/lessons/school/index.md` up to depth of camp landing
- Broaden from "PE teachers" to "any teacher" — PE standards alignment framed as a bonus, not the frame
- Add a summary of school realities that links to the dedicated page (#3)
- Keep existing grade-band cards

### 3. New page: teaching orienteering at school (the "challenges" page)
- Typical constraints: lesson time, space, class size, mixed abilities
- Working with different ages in the same day (same setup, multiple grades)
- Building progressions year-to-year
- Complementing with after-school and community activities
- This is the future bridge to the Clubs audience

### 4. Home, Quick Start, How to Use
- **Home:** likely no changes needed — already shaped as audience router. Confirm card links.
- **Quick Start:** add "About Orienteering" section for the "what even is this?" visitor. This content graduates to a Clubs/About page later.
- **How to Use:** add site map diagram (static SVG, labeled tree), rewrite "For PE teachers" to welcome classroom teachers, lean into breadcrumbs explanation.

### Optional
- Expand sidebar by default on index/landing pages, keep collapsed on lesson content pages. Resolves the original tension at its root. Change is in the swizzled `site/src/theme/DocRoot/Layout/` components.

## What breadcrumbs are

The small clickable trail at the top of every content page:
> Lesson Plans › Teach at a School › Grades 3-5 › Lesson 2: Match the Code

Docusaurus generates them from sidebar position. They're the one wayfinding control always visible even when the sidebar is collapsed. The hub being the sidebar root means it appears as the root breadcrumb on every lesson page.
