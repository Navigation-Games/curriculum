# Plan: 2026 Spring-Summer Feedback Updates

Drafted 2026-07-02 from three sources:

1. "2026 Curriculum Notes: Spring-Summer" (Google Doc export, Barb/Kieran/Marius/team, June 2026)
2. Conversation log spreadsheet, Feedback + PageFeedback tabs (Kieran's advisor review 6/25; Barb & Ethan page feedback 6/23)
3. Barb's bullet comments (7/2)

Items verified against the repo on 7/2. Several items from the notes doc are already done (marked below). Nothing in this plan has been implemented yet.

---

## A. Quick wins (small text edits, do first)

1. **Impact page** (`site/docs/about/impact.md`)
   - Delete "This is the firmest thing we know: a count of programs delivered and people served." (line 18). General rule: no empty summarizing sentences.
   - Name Navigation Games explicitly up front. The opening paragraph says "our own programs" without saying who "we" are; NG is first named in paragraph 3.
   - More Impact edits to come later (memory saved to remind Barb).

2. **"Easiest to Set Up" category on Quick Start** (`site/src/pages/quick-start.mdx` line 33)
   - Rename the category. Candidates: "Low Prep", "Grab and Go", "Minimal Setup". Note roadmap already flags that Basketball-O/Geometric-O need printable PDFs before any "easy setup" claim is honest.

3. **Quick Start: say what orienteering is** (`site/src/pages/quick-start.mdx`)
   - Add 1-2 sentences at the top defining orienteering in plain language before "Pick one of these activities."
   - Related PageFeedback (6/23): the school landing page also needs a quick "what is orienteering / why it's valuable" blurb, possibly a 30-second video later.

4. **"Activities own the what and the how"** (`site/docs/activities/core/index.md` line 8)
   - Keep it pithy, drop the jargon. E.g., "Each activity page tells you what the game is and how to run it. Lesson plans put activities in order and fit them to a class period."

5. **Activities & Lesson Plans page: lesson plans first** (`site/docs/reference/activities-and-lessons.mdx`)
   - Reorder sections: School Lesson Plans, Camp Lesson Plans, then Activities. Update any intro text that assumes the old order.

6. **K-2 Lesson 5 row names a nonexistent activity** (`site/docs/lessons/school/grade-k-2/index.md` line 18)
   - Row says "Obstacle course mapping, draw where animals are." Lesson 5 actually uses Boundary Run + Draw the Space (which exists: `content/activities/draw-the-space.md`). Fix the row to use `<ActivityLink slug="draw-the-space">Draw the Space</ActivityLink>`.
   - Same fix in the advisor system prompt (`ai-advisor/system-prompt.md` line 77 mirrors the old wording) — requires Cloud Run redeploy; batch with other advisor changes (section E).
   - Same class of problem in the Lesson 6 row: "Map Maker" has no page. Either drop the mention, or leave unlinked until Map-Maker is written (see D).

## B. Levels framing and high-level docs

7. **Introduce Level 1 / 2 / 3 framing** (Kieran's comment)
   - The progression is by level, not strictly by grade: each level has *suggested* grade ranges, students can stay at one level multiple years, and a teacher picks the level matching experience rather than age.
   - Where: a short section in `site/docs/about/how-to-use-this-site.md` and/or the Teach at a School landing page; grade-band index pages get one sentence pointing to it ("Grades 3-5 is a suggestion; see How to Use This Site").
   - Decision needed from Barb: is this framing-only (keep grade-band page names) or a rename of the bands themselves? Recommend framing-only for now; renaming URLs/nav is disruptive.
   - This also answers Marius's standing question: "what's different between grades, and how do I teach the next year" — the same section should explain how levels differ even with a similar progression, and what a returning class does next year. (June 17 feedback: "Let's have info about how the different levels differ ... in the landing page for Teach at a School, maybe link out to keep text low.")

## C. Concepts page merge + Progression visibility

8. **Merge Concepts page into the frameworks progression** (Barb's comment)
   - `site/docs/about/concepts.md` (Checking, Growth Mindset, Being Lost) should be incorporated into the Navigation Games progression doc in Frameworks (`site/docs/reference/frameworks/skill-concept-sequence.md`).
   - Plan: move the three concept essays into (or alongside) the skill-concept-sequence page, add redirects/links from where Concepts was linked, remove the About > Concepts page. Check `sidebar_position` and any inbound links (grep for `/about/concepts`).
   - Note: the Checking section overlaps with the planned "checking without electronics" page (item 14). Decide whether Checking lives in the progression doc or in the new checking page with a cross-link. Recommend: teacher-facing "how to verify" page under Reference; conceptual essay stays with the progression.

9. **Surface the NG progression from more places**
   - It's linked from grade-band index pages already; add links from: Teach at a School landing, How to Use This Site, camp landing, and the About index. Barb says buried-but-linked is acceptable; make sure the links exist.

## D. Activity pages (Marius's June 22-26 audit + team session)

Already done (verified 7/2, no action): Steps sections exist on Geometric-O, Score-O, Point-to-Point, Map Walk; Animal-O clue sheet image updated; pages exist for Poison-O, Symbol Relay, Map Discussion, Compass Basics, Line-O, Window-O, Find Your Way Home, Star Relay.

10. **Remaining per-activity fixes**
    - **Score-O**: (a) "Setup ladder" term unclear — rename ("Prep levels"? "How much to prepare ahead"?) and make sure "Start at step 4" refers to a numbered list the reader can see; (b) script stops at "Starting" — add a wrap-up/finish beat; (c) decide on the "(Map Treasure Hunt)" subtitle — Marius thinks it reads as younger-kids-only. Current decision (CLAUDE.md) is Map Treasure Hunt *for camp audiences*; consider showing the subtitle only in camp contexts. Decision for Barb.
    - **Point-to-Point**: script stops at "Starting" — add finish/debrief; mention electronic timing as an option (consistent with "no lesson requires SI" rule).
    - **Map Walk**: script has "Returning" but no learning wrap-up ("what did you learn today?") — add one.
    - **Geometric-O**: verify the clue-sheet image is current (Animal-O's was fixed; Marius flagged Geometric-O's too).
    - **Animal-O / all activities**: "Checkpoints in a boundary" image title doesn't match what's shown; explain 5- vs 10-checkpoint clue sheet options; cones marked optional.
    - **Differentiation** tab name confused the team (they read it as Variations). Add one italic line under the heading: "Ways to adapt the activity to meet the needs of your students."

11. **Missing activity pages** (Marius's "not added yet" list, minus those now done)
    Still missing: Map-Maker, Reverse Score-O, Relay Race, Star-O (confirm whether this is Star Relay under another name), Memory-O, Capture-the-Flag-O, Poly-dot-O, Description Relay. Basketball-O exists only as a Geometric-O companion.
    - Priority order (drives lesson-plan links, section G): **Reverse Score-O** (6+ Lesson 4 depends on it and its index calls it "may still need formal development"), **Relay Race** (6+ Lesson 6), **Map-Maker** (K-2 Lesson 6 mentions it), then Memory-O and Description Relay (camp), then the rest.
    - Decision from Barb per activity: full page vs. companion section vs. fold delivery steps into the lesson (the camp open question).

12. **Photos for activities**
    - Ongoing gap (many pages still image-light). Create a drop point for the team: a shared folder (or `background/photos-inbox/`) where staff put photos with a note about which page they belong on. Add a note in the editing guide. Then work through activity pages as photos arrive. Mine the old Google Site for existing photos (e.g., Score-O photos at the Level 2 Score-O page).

13. **Materials and vocabulary popups**
    - Add "animal-picture checkpoint" to the materials data (`site/src/components/MaterialLink/materialsData.ts` + `materials.md`, with image in the popover). Team also asked for images in materials popovers generally and in vocabulary popovers — treat as an enhancement pass on MaterialLink/VocabLink data.

## E. Hyperlinks everywhere (site + advisor)

14. **Link every activity mention**
    - Confirmed missing in `site/docs/lessons/school/grade-6-plus/index.md`: Poison-O (page exists — link it now), Symbol Relay (page exists — link it), Reverse Score-O and Relay Race (no pages yet — link when written, see item 11).
    - "Animal Relay" in the 3-5 Clue Sheets/Match the Code lesson lacks a hyperlink (flagged twice). Check what Animal Relay is — if it has no page, that's another item-11 decision.
    - Do a systematic pass: grep lesson/index pages for known activity names not wrapped in `<ActivityLink>` or a markdown link. Camp lesson 1 is missing its Symbol Relay link, and camp Extensions sections are missing links.
    - Advisor already has an "Always include links" rule (`system-prompt.md` line 184) and the frontend rendering was fixed. Verify in a live conversation; tighten the prompt if it still skips links.

## F. Print / one-pager fixes (functional bugs)

15. **Print view only shows the "How to run it" tab** (PageFeedback 6/23, Explore & Find). The print/one-pager render must pull the intended sections regardless of which tab is active. This is a theme/build issue, not content.
16. **One-pager prints at ~1.5 pages** — tune print CSS so the compact view fits one page.
17. **One-pager/print button findability** — team was asked to check on their own machines; collect that and adjust placement if needed.

## G. Lesson plans

18. **K-2 vs 3-5 clue-sheet lessons differentiation** (notes 6/11 + memory). Both use Animal-O clue sheets and look too similar. Make the difference explicit in each lesson's intro line and differing delivery (K-2 slows Animal-O down; 3-5 moves to checking/partner roles faster). Suggestions already sketched in memory `project_k2-vs-35-differentiation`.
19. **Clue sheet printable PDFs** — add downloadable clue-sheet PDFs to the Animal-O materials and the clue-sheet lessons.
20. **3-5 index page wording** — "build" appears too many times in the header/motivator paragraph; reword. Also answer Kieran's open question: does "Indoor orienteering" (a-lesson) really cover lessons 3-6?
21. **Lesson duration flexibility** (Ethan): "30-45 minutes — what if I have an hour?" Add a sentence to grade-band Notes on stretching/compressing, and mention the Advisor tailors to schedule.
22. **Delivery step nesting** (Ethan): indent the steps belonging to one activity under that activity's name in Delivery sections, so the structure is scannable.
23. **Activity cards**: show duration on cards; make card popover behavior consistent (some cards popup, some navigate); add a visual cue (down arrow) that a popover is coming; consider a larger popover.
24. **"Companions" naming** (flagged twice, "not yet addressed ****"): team prefers something more direct like "Extensions". But Companion is the umbrella for readiness/variation/extension flavors. Options: (a) rename the umbrella to "Related activities", (b) label each companion by its flavor only (Readiness/Variation/Extension) and drop the umbrella word. Decision for Barb + Kieran.

## H. Camp curriculum consistency pass

From the June 17 team walkthrough (some may already be fixed; verify each):
25. "Session" vs "lesson" naming: overview page says Session 1, the page itself says Lesson 1. Pick one (recommend "Session" for camps) and apply consistently, including the safety progression ("4 sessions" there vs 3- and 6-session plans confused readers — rename to "safety steps" or similar).
26. Verify the "no session 2" report (likely a since-fixed build/nav issue; all 6 lessons exist in `content/lessons/camp/full/`).
27. Camp lesson 1: order of activities in the text vs the activity card list is inconsistent; align (readiness before core, matching school conventions).
28. Spell out IOF on first use in extensions ("International Orienteering Federation control-description symbols").
29. Camp landing page: structure it like the school grade-band landing pages; reduce up-front "why" text for returning users (quick-start-like path at top).
30. "Grade band" term: not obviously meaningful to non-US educators; consider "grade level" or "age group" in visible text.

## I. Advisor (batch into one system-prompt update + redeploy)

From Kieran's Feedback-tab review (6/25) and the June 17 advisor test:
31. Mention the NG kit when discussing equipment.
32. Ask fewer questions; never re-ask what's answered; prioritize space, time available, and orienteering experience over group size/age.
33. Anti-hallucination additions: never invent contact emails (info@navigationgames.com was made up — give admin@navigationgames.org or the site's contact page only); don't invent activity content (claimed Animal-O includes sketching the space from memory).
34. Fix the K-2 Lesson 5 "Obstacle course mapping" line in the prompt (item 6).
35. Richer activity summaries (Geometric-O description was too thin to understand; "Session 5" description suspiciously short — check whether responses are getting truncated by max_tokens).
36. Frontend: add starter tips / example prompts above the chat input ("Tell me your grade level, space, and how many sessions...").
37. Verify hyperlink behavior end to end (item 14).
38. Open questions to track, not necessarily prompt changes: does the advisor vary its recommendations; API cost over time; system-prompt/site sync process (consider a checklist in the editing guide: "renamed a lesson? update system-prompt.md").
39. MapMap: give the system prompt access to the list of available maps (6/11 to-do). Needs design: where the map list lives and how it stays current. Park as a follow-up project.

## J. Site-wide / structural (bigger, needs discussion)

40. **Sidebar collapse discoverability**: collapsing the left nav hides that camp lesson plans exist. Proposed: landing/hub pages for Lesson Plans and Activities (partially done — hub pages were added per recent commit "Fix Reference navigation and expand sidebar on hub pages"; verify this fully answers it).
41. **Feedback widget**: after submitting, allow another submission immediately; add a visible note that advisor conversations are logged (also on the advisor page itself — users must know).
42. **Bottom prev/next navigation** (Ethan): from the 3-5 index, "next" goes to the top of the page instead of Lesson 1; review pagination order on index pages.
43. **Non-PE-teacher framing**: "Teach at a School" assumes PE; add a line welcoming classroom teachers, after-school programs, etc.
44. **Ethan's bigger ideas, park for later**: site tour/onboarding flow; user accounts with favorites; videos throughout.

## Suggested sequencing

- **Batch 1 (one sitting, low risk):** A1-A6, E14 (the link-what-exists part), G20 wording, H28.
- **Batch 2 (content writing):** B7, C8-9, D10, G18-19, G21-22, H25-27, H29-30.
- **Batch 3 (advisor):** all of I in one system-prompt edit + single Cloud Run redeploy.
- **Batch 4 (components/theme):** F15-17, G23, J41-42.
- **Batch 5 (new content, as decided):** D11 new activity pages, D12 photos, J44.

## Decisions needed from Barb (and Kieran/Marius)

- Levels 1/2/3: framing-only or actual restructure? (B7)
- "Companions" rename: what word? (G24)
- Score-O "(Map Treasure Hunt)" subtitle: keep everywhere, camp-only, or drop? (D10)
- Which missing activities get full pages vs. folded into lessons? (D11)
- Where does "Checking" content live after the Concepts merge? (C8, ties to the planned checking-methods page)
- New category name for "Easiest to Set Up" (A2)
