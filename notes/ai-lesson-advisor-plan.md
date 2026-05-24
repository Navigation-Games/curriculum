# AI Lesson Plan Advisor - Plan

## Context

Teachers come to the curriculum site with different situations: number of class periods, class length, indoor vs. outdoor space, grade level, equipment on hand, and students' prior orienteering experience. Right now they browse the lesson plans and figure it out themselves. An AI advisor would ask a few questions and recommend a tailored sequence.

The curriculum data is well-structured for this. Each activity has: time, space, materials, level/tags, goals, and vocabulary. Each lesson composes activities with PE standards alignment. The build script already extracts and validates all of this. The full curriculum (6 activities, 7 lessons, 21 materials, 17 vocab terms) is small enough to fit entirely in a single AI prompt (~8,000 tokens).

## Recommended approach: Tier 3 (Embedded AI chat)

After discussing trade-offs, Tier 3 is the recommended approach. The API costs are negligible (see below), and the ability to capture teacher interactions for curriculum improvement makes it significantly more valuable than Tier 1. Starting directly with Tier 3 avoids building a throwaway prototype.

### Why not Tier 1 (Claude Project)?

A Claude Project would be quick to set up but has a critical limitation: you can't see teacher conversations. Since learning from teacher interactions is a priority for curriculum development, Tier 1 doesn't deliver the most important benefit. Teachers also need their own Claude accounts, which adds friction.

### Why not Tier 2 (Guided questionnaire)?

Tier 2 is still worth building later, informed by data from Tier 3. Once you see patterns in what teachers ask ("80% want Grade 3-5, outdoor, 4 sessions"), you can build a questionnaire that handles common cases. Tier 2 and Tier 3 can coexist.

## Cost

The curriculum context is ~8,000 tokens. A typical conversation is about 5 exchanges.

| Model | Per conversation | 100 conversations/month | 1,000/month |
|---|---|---|---|
| Haiku | ~$0.006 | $0.60 | $6 |
| Sonnet | ~$0.08 | $8 | $80 |

**Recommended model: Sonnet.** The cost difference is a few dollars/month at realistic volumes. Sonnet is better at reasoning through unusual teacher situations, explaining *why* it recommends certain activities, and picking up on implicit needs. If usage grows to thousands of conversations, switching to Haiku is a one-line code change.

With prompt caching (system prompt cached after first message), costs drop further.

A paywall is not recommended. At these costs, payment infrastructure and friction would outweigh savings. Free access better serves the nonprofit mission of spreading orienteering curriculum.

## Who uses it

The advisor serves two audiences:

- **Teachers and camp directors.** The primary audience. They use it to plan lessons tailored to their situation.
- **Navigation Games staff.** Staff use the advisor for their own program planning (school visits, camp sessions, educator trainings). This gives the team early, hands-on experience with the tool before teachers see it. Staff conversations are the first source of feedback for refining prompts and identifying gaps in the AI's recommendations. Combined with structured testing, this internal use builds confidence that the advisor gives sound guidance before it goes public.

## Feedback loop

### Intake form (required, before the conversation)

A short form on the site collects:
- Name and email
- School or organization
- Grade level
- Number of sessions available, session length
- Space type (indoor/outdoor/both)
- Equipment on hand (do you have an NG Kit?)
- "What are you hoping to get help with?" (open text)

On submit, the form logs answers to a data store (Google Sheet for simplicity, or a lightweight database), then opens the chat with the teacher's situation pre-filled as context.

### Conversation logging (automatic)

Since you control the backend, every conversation is logged:
- Teacher's intake answers (linked by email)
- All messages in both directions
- Timestamps and conversation length

This data is valuable for:
- **Spotting patterns.** Common scenarios inform what to build next.
- **Finding gaps.** Questions the AI can't answer well reveal missing curriculum content.
- **Improving the AI.** Weak answers inform system prompt refinements.
- **Building Tier 2.** After a few months, you know the exact questions for a questionnaire.
- **Grant reporting.** "47 teachers across 12 states used our advisor to plan 130 lesson sequences."
- **Building a teacher contact list.** Notify teachers of new content, ask for field-testing feedback, build case studies.

### Follow-up survey (optional, after the conversation)

The AI's system prompt instructs it to end conversations with a feedback link. The survey asks:
- Did the advisor help you plan your lessons? (yes/no/somewhat)
- What would have made it more useful? (open text)
- Can we follow up with you? (checkbox)

### Privacy

Intake form includes a disclosure: "Conversations with the lesson plan advisor are logged so we can improve the curriculum. Your name and email are kept confidential." Standard for a nonprofit tool.

## What the AI needs to know

The system prompt / knowledge base should include:
- All 6 activities with their time, space, materials, level, goals, and progression relationships
- All 7 lesson plans with their activity sequences and PE standards
- The progression logic (Boundary Run -> Gathering -> Animal-O -> Geometric-O -> Map Walk -> Score-O)
- Space constraints (which activities work indoors, outdoors, in a gym)
- Materials requirements and what's in the NG Kit
- Common teacher scenarios (single class period, multi-week unit, rainy day backup)
- Links to curriculum pages so the AI can direct teachers to the right content

## Implementation

### Prerequisites

- Anthropic API key (create at console.anthropic.com)
- Hosting account for serverless backend (Vercel, Cloudflare Workers, or AWS Lambda)
- Data store for logging (Google Sheets for simplicity, or a lightweight database)

### Backend (serverless function)

1. Set up a serverless backend (Cloudflare Worker, Vercel Edge Function, or AWS Lambda) that wraps the Claude API
2. Bake the curriculum data into the system prompt
3. Accept conversation messages from the frontend, forward to Claude, return responses
4. Log all interactions to a data store
5. Implement rate limiting (e.g., 10 conversations/day per IP) and error handling
6. Configure API key as an environment secret

### Frontend

1. Create an intake form page at `site/src/pages/plan-my-lessons.tsx`
2. Build a React chat component that appears after form submission
3. Add navigation links from the landing page, lesson overview pages, and the "How to use this site" page
4. Style to match the site's look and feel

### Feedback

1. Create a follow-up survey (Google Form or similar)
2. Configure the system prompt to include the survey link at conversation end
3. Set up a Google Sheet or simple database to receive intake form + conversation logs

**Time: 2-3 days of dev work + ongoing hosting/API costs (~$10-20/month including hosting)**

## Verification

- Test with 5 realistic teacher scenarios:
  1. New PE teacher, Grade 3-5, 4 class periods, outdoor, has NG Kit
  2. Camp director, full week, outdoor, no prior orienteering experience
  3. Teacher with only a gym, 2 sessions, no equipment
  4. Teacher whose students did the sequence last year, wants to progress them
  5. Teacher running multiple grades through the same setup in one day
- Verify conversation logging captures all messages
- Verify intake form data links to conversations
- Verify rate limiting works
- Verify the feedback survey link appears at end of conversations
- Check that curriculum page links in AI responses work correctly
