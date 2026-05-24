---
title: "Score-O — Activity"
sidebar_label: Score-O
sidebar_position: 6
tags: [core, level-2]
time: 15-30 minutes
space: Schoolyard or local park with an orienteering map
materials:
  - Orienteering maps with checkpoint circles marked
  - Checkpoint markers (cones or flags) with letter codes
  - Master map
  - Scorecards and pencils
setup: Place checkpoints according to the master map; spread them out across the mapped area
vocabulary:
  - term: Route choice
    definition: The path you decide to take between checkpoints. There is no single correct route.
  - term: Score-O
    definition: A format where you earn points by visiting checkpoints in any order within a time limit.
  - term: Feature
    definition: A real-world object or landmark that appears as a symbol on the map. Trees, fences, paths, and buildings are all features.
  - term: Scorecard
    definition: A card where you record the letter code at each checkpoint to prove you visited it.
---

{/* AUTO-GENERATED from content/activities/score-o.md — do not edit directly */}

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ActivityMeta from '@site/src/components/ActivityMeta';
import {ViewToggle, FullOnly, CompactOnly} from '@site/src/components/ViewToggle';
import OnePager from '@site/src/components/OnePager';
import Description from '@site/src/components/Description';

export const description = `Students receive a map showing checkpoint locations. They visit as many as they can within a time limit, in any order they choose. At each checkpoint, they record the letter code on their scorecard. This is the first activity where students have full autonomy over route choice.

Score-O is a bridge between structured courses (where checkpoints are visited in order) and real orienteering, where navigators plan their own routes through the terrain.`;

<ViewToggle />

<FullOnly>

# Score-O — Activity (Map Treasure Hunt)

**Visit as many checkpoints as possible in any order**

<ActivityMeta
  time={frontMatter.time}
  space={frontMatter.space}
  materials={frontMatter.materials}
  vocabulary={frontMatter.vocabulary.map(v => typeof v === 'object' ? v.term : v)}
/>

> "You get to choose where to go and in what order"

<Description>{description}</Description>

<Tabs>
<TabItem value="goals" label="Learning Goals">

Students completing this activity will be able to:

- Plan a route through multiple checkpoints, choosing which to visit and in what order
- Navigate independently using an orienteering map to find checkpoints
- Read an orienteering map and match symbols to real features while moving
- Develop strategies for visiting the most checkpoints in the time allowed

</TabItem>
<TabItem value="run" label="How to Run It" default>

### Setup

1. Place checkpoint markers at locations shown on the master map
2. Each checkpoint should have a visible letter code
3. Spread checkpoints across the mapped area at varying distances from the start
4. Mark a clear start/finish location
5. Print maps with checkpoint circles already marked

### Progression

- **First time**: pairs, short time limit (8 minutes), fewer checkpoints
- **Experienced**: individual, longer time limit, more checkpoints spread further apart
- **Advanced**: assign different point values to harder-to-find checkpoints (further away or harder to navigate to)
- **Competitive**: compare scores; fastest time as tiebreaker

### Tips

- Keep the first Score-O short (8 minutes). Students can always do a second round
- Remind students to orient their map before leaving the start
- Late penalties (1 point per minute late) discourage students from ignoring the time limit
- Place a few "easy" checkpoints near the start so every student finds at least one
- Watch for students who run without reading their map. Redirect them to stop and orient

</TabItem>
<TabItem value="script" label="Script">

### Introducing Score-O

"Today you get to choose your own adventure. You have a map with checkpoint circles on it. Your job is to visit as many checkpoints as you can before time runs out."

"At each checkpoint, you will find a marker with a letter on it. Write that letter on your scorecard next to the checkpoint number. This proves you were there."

### Strategy

"Before we start, look at your map. Where would you go first? Why?"

*(Let students share ideas. Highlight strategies: start close, visit clusters, don't backtrack.)*

"There is no single right answer. Part of the fun is figuring out what works best for you."

### Starting

"You have [8/10/12] minutes. When you hear the whistle, come back to the start. Ready? Go!"

</TabItem>
<TabItem value="vocabulary" label="Vocabulary">

{frontMatter.vocabulary.map(v => (
  <p key={v.term}><strong>{v.term}</strong>: {v.definition}</p>
))}

See the [Glossary](/reference/glossary) for all curriculum terms.

</TabItem>
<TabItem value="companions" label="Companions">

### Poker-O *(extension)*

**Collect the best poker hand by visiting checkpoints with playing cards.**

Each checkpoint has a playing card attached. Students visit checkpoints and record the card. After the time limit, the best poker hand wins. Adds a layer of strategy since students must decide whether to visit more checkpoints (more cards) or be selective about which ones to visit.

| | |
|---|---|
| **Time** | 15-30 minutes |
| **Materials** | Score-O setup, plus a playing card at each checkpoint |
| **How to run it** | Same as Score-O, but students record the playing card instead of a letter code. Best poker hand wins. Ties broken by number of checkpoints visited. |

### Poison-O *(extension)*

**Wrong checkpoints cost points. Rewards careful map reading.**

Set up a Score-O course, but add extra "poison" checkpoints that are not on the student's map. If a student records a poison checkpoint, they lose points. Encourages students to read their map carefully before recording a code.

| | |
|---|---|
| **Time** | 15-30 minutes |
| **Materials** | Score-O setup, plus extra "poison" checkpoints not shown on student maps |
| **How to run it** | Same as Score-O, but add 3-5 extra checkpoints. Correct checkpoints earn 1 point. Poison checkpoints cost 2 points. Students must match what they see to what is on their map. |

</TabItem>
</Tabs>

</FullOnly>

<CompactOnly>

<OnePager
  title="Score-O — Activity"
  tagline="Visit as many checkpoints as possible in any order"
  epigraph="You get to choose where to go and in what order"
  description={description}
  time={frontMatter.time}
  space={frontMatter.space}
  materials={frontMatter.materials}
  setup={frontMatter.setup}
  vocabulary={frontMatter.vocabulary.map(v => typeof v === 'object' ? v.term : v)}
  goals={[
    'Route planning',
    'Independent navigation',
    'Map reading',
    'Strategy',
  ]}
  delivery={
    <>
      <ol>
        <li>Gather students; hand out maps and scorecards</li>
        <li>Orient the map together; point out a few checkpoint locations</li>
        <li>Discuss strategy briefly</li>
        <li>Set the time limit and start</li>
        <li>Students visit checkpoints in any order, recording codes</li>
        <li>Whistle to end; students return to start</li>
        <li>Score: count correct codes</li>
      </ol>
    </>
  }
  reflection={[
    'What strategy did you use to visit the most checkpoints?',
    'Did you change your plan once you started? Why?',
    'Which checkpoints were hardest to find?',
    'How did you use the map to navigate between checkpoints?',
    'If you did it again, what would you do differently?',
  ]}
  extensions={[
    'Assign point values (further checkpoints worth more)',
    'Late penalty: lose 1 point per minute past the time limit',
    'Do a second round with the same map to see if scores improve',
    'Have students design their own Score-O course for classmates',
    'Poker-O: each checkpoint has a playing card; collect the best poker hand',
    'Poison-O: some checkpoints are "poison" and cost points; rewards careful map reading',
  ]}
/>

</CompactOnly>
