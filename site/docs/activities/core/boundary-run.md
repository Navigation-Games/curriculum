---
title: Boundary Run
sidebar_position: 1
tags: [core, level-1]
time: 15 minutes
space: Gym, schoolyard, or local park
materials:
  - Cones (optional, for marking boundaries)
setup: If using artificial boundaries, place cones ahead of time
vocabulary:
  - term: Boundary
    definition: The edge of the space to stay inside. Sometimes there are places you cannot go within a larger boundary (for example, a garden inside a larger park).
  - term: Inside/outside
    definition: Whether something is within or beyond the boundary.
  - term: Safety
    definition: By staying within the boundary, you are safe from dangers outside (like cars), and the teacher will know where you are.
  - term: Communication
    definition: Giving and receiving clear directions about where to go.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ActivityMeta from '@site/src/components/ActivityMeta';
import {ViewToggle, FullOnly, CompactOnly} from '@site/src/components/ViewToggle';
import OnePager from '@site/src/components/OnePager';
import Description from '@site/src/components/Description';
import YouTube from '@site/src/components/YouTube';

export const description = `The leader runs around the boundary of the play area while participants follow. Then participants show what they learned by identifying which spots are inside or outside the boundary, including tricky areas they should not enter.

Builds listening skills, safety awareness, and familiarity with the play space.`;

<ViewToggle />

<FullOnly>

<figure style={{float:'right', margin:'0 0 1rem 1.5rem', maxWidth:'25%'}}>
  <img src="/curriculum/img/activities/boundary-run.png" alt="Boundary Run setup diagram showing a play area with red arrows tracing the boundary" style={{width:'100%', borderRadius:'6px'}} />
  <figcaption style={{fontSize:'0.85rem', color:'#666', marginTop:'0.25rem'}}>Setup: leader traces the boundary</figcaption>
</figure>

# Boundary Run

**Travel the boundary of the play area.**

<ActivityMeta
  time={frontMatter.time}
  space={frontMatter.space}
  materials={frontMatter.materials.join(', ')}
  vocabulary={frontMatter.vocabulary.map(v => typeof v === 'object' ? v.term : v)}
/>

> "In orienteering we stay inside a boundary"

<Description>{description}</Description>

<Tabs>
<TabItem value="goals" label="Learning Goals">

Students completing this activity will be able to:

- Identify the boundary of the play area after following the leader around it
- Tell whether landmarks and locations are inside or outside the boundary
- Recognize areas within the boundary that are still off limits (gardens, parking lots, etc.)
- Explain why boundaries matter for safety and respect

</TabItem>
<TabItem value="run" label="How to Run It" default>

### Setup

1. Walk the space and identify the boundary you want to use
2. If any edges are unclear, place cones to mark them
3. Note any areas inside the boundary that should still be off limits (gardens, equipment, etc.)

### Steps

1. Gather participants together at a starting point
2. Explain that you will all run around the boundary together, and they need to pay attention to where you go
3. Everyone must stay behind the leader at all times, even if they can run faster. This ensures everyone sees the full boundary
4. Run around the boundary. Make sure participants do not cross outside the play area
5. After the run, quiz participants on the boundaries: point to landmarks and ask whether they are inside or outside
6. If there are gardens or other off-limits areas within the boundary, ask whether participants should go there even though it is technically "inside"

### Progression

Start with the basics and build:

- **Follow the leader**: run the boundary together at the leader's pace
- **For speed**: repeat the boundary at a faster pace
- **Different movements**: skip, gallop, or hop along the boundary instead of running
- **Inside/outside quiz**: point to spots and have students call out "inside" or "outside"
- **Why it matters**: discuss why boundaries are important (safety, respect)

### Tips

- Adjust your pace for the group. Be aware of varying physical abilities
- Establish a firm expectation from the start: participants must remain inside the boundary at all times during class
- If participants cannot run, use walking or wheelchair movement and adjust the boundary size accordingly

</TabItem>
<TabItem value="script" label="Script">

### The Boundary Run

"Our challenge now is to follow me around the boundary of our space today. Everything we do will be inside the boundary, and I'm going to quiz you afterward about where we go, so be sure to pay attention!"

"There are only two rules for this game: you must follow me, and you can't go in front of me at any time. It's like follow-the-leader!"

*(Run the boundary. Point out key landmarks as you go.)*

### Inside/Outside Quiz

*(Point to a landmark)*
"Is this inside or outside our boundary?"
*(Repeat with 2-3 examples)*

*(Point to an off-limits area like a garden or parking lot)*
"This is inside the boundary. Should we go there?" *(Wait for "No!")*
"Why not?"

"So why do we have boundaries?"
*(Guide toward: safety and respect)*

</TabItem>
<TabItem value="vocabulary" label="Vocabulary">

{frontMatter.vocabulary.map(v => (
  <p key={v.term}><strong>{v.term}</strong>: {v.definition}</p>
))}

See the [Glossary](/reference/glossary) for all curriculum terms.

</TabItem>
<TabItem value="companions" label="Companions">

### Hot or Cold *(extension)*

**Use "hot or cold" clues to direct a partner to a secret cone.**

One partner secretly picks a cone. The other partner searches while the first gives temperature clues: "warmer" as they get closer, "colder" as they move away. Swap roles when the cone is found. Increase difficulty by choosing two or three secret cones.

Reinforces communication, listening, and spatial awareness within the boundary.

| | |
|---|---|
| **Time** | 10-15 minutes |
| **Materials** | Cones placed in a regular pattern (rectangular or triangular grid) |
| **How to run it** | Pair up. One partner secretly picks a cone. The other searches using "hot or cold" clues. Swap when found. Increase to 2-3 secret cones for more challenge. |

### Shrinking Boundary Tag *(extension)*

**Play tag while the boundary gets smaller.**

Set up cones in concentric circles or use landmarks to define progressively smaller play areas. Play any tag variant (freeze tag, zombie tag, blob tag). Every few minutes, shrink the boundary. Participants who end up outside the new boundary face the tag consequence (frozen, become a zombie, etc.).

Reinforces boundary awareness while adding physical challenge and fun.

| | |
|---|---|
| **Time** | 10-15 minutes |
| **Materials** | Cones arranged in concentric circles or progressively smaller areas |
| **How to run it** | Play tag within the boundary. Every few minutes, announce the boundary is shrinking and give a 10-second countdown. Anyone outside the new boundary gets the tag consequence. Continue until playing within the smallest area. |

</TabItem>
</Tabs>

## Videos

<YouTube id="lD0_AKjR_Ic" title="Boundary Run" />

</FullOnly>

<CompactOnly>

<OnePager
  title="Boundary Run"
  tagline="Travel the boundary of the play area"
  epigraph="In orienteering we stay inside a boundary"
  description={description}
  image="/curriculum/img/activities/boundary-run.png"
  time={frontMatter.time}
  space={frontMatter.space}
  materials={frontMatter.materials}
  setup={frontMatter.setup}
  vocabulary={frontMatter.vocabulary.map(v => typeof v === 'object' ? v.term : v)}
  goals={[
    'Listening to instructions',
    'Safety',
    'Boundaries',
    'Respectfulness',
    'Speed and agility',
  ]}
  delivery={
    <>
      <ol>
        <li>Gather the participants together</li>
        <li>Explain that you will run around the boundary and they must pay attention to where you go</li>
        <li>Run around the boundary together. Everyone stays behind the leader</li>
        <li>Quiz participants on the boundaries of the space:
          <ol type="a">
            <li>Name places and ask if they are inside or outside the boundary</li>
            <li>If there are off-limits areas within the boundary, ask if they should go there</li>
          </ol>
        </li>
      </ol>
    </>
  }
  reflection={[
    'What does boundary mean?',
    'How can crossing the boundary be dangerous?',
    'What are some things we see every day that mark boundaries? (Fences, curbs, signs, etc.)',
    'What are some examples of non-physical boundaries? (Personal, emotional)',
  ]}
  extensions={[
    'Repeat the boundary for speed',
    'Travel the boundary with different locomotor movements (skipping, galloping, etc.)',
    'Play Hot or Cold or Shrinking Boundary Tag (see Companions tab)',
  ]}
/>

</CompactOnly>
