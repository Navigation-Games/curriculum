---
title: "Explore & Find — Activity"
sidebar_label: Explore & Find
sidebar_position: 2
tags: [core, level-1]
time: 20 minutes
space: Any space
materials:
  - Checkpoints (cones with animal pictures)
  - Cones (optional, for marking boundaries)
setup: Place animal checkpoints around the space within the boundary
vocabulary:
  - term: Boundary
    definition: The perimeter of the play area. All checkpoints are inside the boundary.
  - term: Checkpoint
    definition: A marker you visit during an orienteering activity. In Explore & Find, checkpoints have animal pictures.
  - term: Explore
    definition: Move through the space looking for checkpoints. No set route or order.
---

{/* AUTO-GENERATED from content/activities/explore-and-find.md — do not edit directly */}

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ActivityMeta from '@site/src/components/ActivityMeta';
import {ViewToggle, FullOnly, CompactOnly} from '@site/src/components/ViewToggle';
import OnePager from '@site/src/components/OnePager';
import Description from '@site/src/components/Description';
import VocabLink from '@site/src/components/VocabLink';

export const description = `Participants explore freely within the boundary to find animal checkpoints. After each round, they return on the teacher's signal and report what they found and where. Repeated rounds build spatial memory as participants remember checkpoint locations from previous attempts.

Bridges the gap between learning the boundary (Boundary Run) and navigating a structured course (Animal-O). No map or clue sheet needed. Participants build a mental picture of the space through exploration.`;

<ViewToggle />

<FullOnly>

<div style={{float:'right', margin:'0 0 1rem 1.5rem', maxWidth:'25%'}}>
  <figure style={{margin:'0 0 0.75rem'}}>
    <img src="/curriculum/img/activities/explore-and-find.png" alt="Explore & Find setup diagram showing animal checkpoints scattered within a boundary" style={{width:'100%', borderRadius:'6px'}} />
    <figcaption style={{fontSize:'0.85rem', color:'#666', marginTop:'0.25rem'}}>Setup: animal checkpoints placed around the space</figcaption>
  </figure>
</div>

# Explore & Find — Activity

**Find checkpoints within a defined boundary**

<ActivityMeta
  time={frontMatter.time}
  space={frontMatter.space}
  materials={frontMatter.materials}
  vocabulary={frontMatter.vocabulary.map(v => typeof v === 'object' ? v.term : v)}
/>

> "In orienteering, we find checkpoints in a boundary"

<Description>{description}</Description>

<Tabs>
<TabItem value="goals" label="Learning Goals">

Students completing this activity will be able to:

- Stay within the boundary while exploring
- Explore the space and find animal checkpoints
- Remember where checkpoints are from round to round, building spatial memory
- Gather at the Finish marker quickly when the teacher gives the signal
- Describe where checkpoints are using spatial language ("near the fence," "in the far corner")
- Work cooperatively with a partner to find checkpoints

</TabItem>
<TabItem value="run" label="How to Run It" default>

### Setup

1. Set up the boundary (or use Boundary Run to establish it)
2. Place animal checkpoints around the space, some easy to spot and some harder
3. Place a Start/Finish marker at the gathering point

### Steps

1. Gather everyone at the Start marker
2. "Go explore!" Participants spread out to find animal checkpoints. On the signal, "Return home!" Everyone gathers at the Finish marker. Count the seconds until everyone is back.
3. Ask what they found and where. "The elephant was near the fence." "The giraffe was in the far corner." Build a group picture of the space.
4. Send out again. Can they find more this time? Can they remember where the ones they already found are?
5. Repeat rounds until the whole class gathers quickly on the signal
6. Test their memory with specific challenges. "Run to the Lion and back to the Finish!" "Run to the Octopus then the Dog and back!"

### Progression

Start with the basics and build:

- **Group visit**: visit each animal together as a class, moving like that animal to the next one (waddle like a penguin, stomp like an elephant). Builds familiarity with the space before free exploration.
- **Free exploration**: go find as many animals as you can
- **Report and repeat**: describe what you found, then go find more
- **Memory challenges**: teacher names specific animals to visit in sequence
- **Pair challenges**: partners give each other sequences of animals to visit and check each other

### Tips

- Before sending participants to explore, do a quick boundary check: point to specific objects and ask "Inside or outside the boundary?" Include obvious ones (a nearby tree) and tricky ones (a parking lot, a fence). This reinforces the boundary and catches misunderstandings early.
- Place some checkpoints in obvious spots and some that require looking carefully. The mix keeps all ability levels engaged.
- Count seconds aloud when gathering. Groups enjoy trying to beat their time.
- If the space is large, start with fewer checkpoints spread across a smaller area and expand in later rounds.
- Encourage spatial language during report-back ("next to," "between," "near the") rather than just naming animals.

</TabItem>
<TabItem value="script" label="Script">

### Explore Round

"Your challenge is to explore inside the boundary and find the animal checkpoints. When I say 'Return home!', come back to the Finish marker as fast as you can. Ready? Go explore!"

*(After 2-3 minutes, give the signal)*

"Return home!"

*(Count seconds aloud until everyone is back)*

"That was 15 seconds. Let's try to beat that next time."

### Report Back

"What animals did you find? Where were they?"

*(Encourage spatial descriptions: "near the fence," "between the two trees," "in the far corner")*

"Can you find more this time? Do you remember where the ones you already found are?"

### Memory Challenge

"Now I'm going to give you a challenge. Run to the Lion and back to the Finish!"

"This time: run to the Octopus, then the Dog, then back!"

</TabItem>
<TabItem value="vocabulary" label="Vocabulary">

{frontMatter.vocabulary.map(v => (
  <p key={v.term}><VocabLink term={v.term}><strong>{v.term}</strong></VocabLink>: {v.definition}</p>
))}

See the [Glossary](/reference/glossary) for all curriculum terms.

</TabItem>
<TabItem value="context" label="Context">

### Before This Activity

- [Boundary Run](/activities/core/boundary-run): participants should know the boundary before exploring

### Leads To

- [Animal-O](/activities/core/animal-o): adds clue sheets and a specific order to visit checkpoints

</TabItem>
</Tabs>

</FullOnly>

<CompactOnly>

<OnePager
  title="Explore & Find — Activity"
  tagline="Find checkpoints within a defined boundary"
  epigraph="In orienteering, we find checkpoints in a boundary"
  description={description}
  image="/curriculum/img/activities/explore-and-find.png"
  time={frontMatter.time}
  space={frontMatter.space}
  materials={frontMatter.materials}
  setup={frontMatter.setup}
  vocabulary={frontMatter.vocabulary.map(v => typeof v === 'object' ? v.term : v)}
  goals={[
    'Stay within the boundary',
    'Find checkpoints',
    'Remember checkpoint locations',
    'Return on the signal',
    'Describe locations using spatial language',
    'Work with a partner',
  ]}
  steps={[
    'Gather at Start',
    'Explore round 1',
    'Report back',
    'Explore again',
    'Repeat until gathering is quick',
    'Test memory',
  ]}
  delivery={
    <>
      <ol>
        <li>Gather at the Start marker</li>
      </ol>
      <p>   a. "Go explore!" - look for checkpoints    b. "Return home!" - gather at the Finish marker    c. Count the seconds until everyone is back    d. Repeat until the whole class gathers quickly</p>
      <ol>
        <li>Test their memory:</li>
      </ol>
      <p>   a. "Run to the Lion and back to the Finish!"    b. "Run to the Octopus then the Dog and back!"</p>
    </>
  }
  reflection={[
    'What is a boundary? Is [object/place/person] inside or outside the boundary?',
    'How did you remember where the boundary was when you were exploring?',
    'Which animals did you find?',
    'How did you remember where the animals were?',
    'How did other students help you?',
    'Give examples of other boundaries.',
  ]}
  extensions={[
    '**Animal Parade**: visit every animal as a group and move like that animal to the next one (waddle like a penguin, stomp like an elephant, stretch like a giraffe). Good as a warm-up before free exploration or as a cool-down.',
    'Encourage participants to come up with strategies to get the whole class to gather more quickly',
    'Use a different signal, such as raising your hand, to indicate it is time to gather',
    'Have pairs give each other sequences of animals to visit, and check each other',
    'Have participants draw a map of the area and checkpoint locations',
  ]}
/>

</CompactOnly>
