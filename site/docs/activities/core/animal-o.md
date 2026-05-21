---
title: Animal-O
sidebar_position: 3
tags: [core, level-1]
time: 15-30 minutes
space: Gym, schoolyard, or local park
materials:
  - Checkpoints (pictures of animals)
  - Clue sheets
setup: Place animal checkpoints around the defined space
vocabulary:
  - term: Clue sheet
    definition: A list showing the order to visit checkpoints. In Animal-O, the clue sheet shows animal pictures.
  - term: Checkpoint
    definition: A location marked with a cone or flag. In Animal-O, each checkpoint has an animal picture attached.
  - term: Course
    definition: A sequence of checkpoints from start to finish.
  - term: Boundary
    definition: The perimeter of the play area. All checkpoints are inside the boundary.
  - term: Spatial memory
    definition: The ability to remember where things are in space.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ActivityMeta from '@site/src/components/ActivityMeta';
import {ViewToggle, FullOnly, CompactOnly} from '@site/src/components/ViewToggle';
import OnePager from '@site/src/components/OnePager';
import Description from '@site/src/components/Description';
import YouTube from '@site/src/components/YouTube';
import CardGrid from '@site/src/components/CardGrid';

export const description = `Explore within the boundary to find animal checkpoints. Use a clue sheet to find checkpoints in order. Repeat for a faster time. Repeat from memory. Then start over with a different clue sheet.

Builds spatial memory, observation, and navigation skills.`;

<ViewToggle />

<FullOnly>

# Animal-O (Clue Sheet Orienteering)

**Find animal checkpoints in order using a clue sheet.**

<ActivityMeta
  time={frontMatter.time}
  space={frontMatter.space}
  materials={frontMatter.materials.join(', ')}
  vocabulary={frontMatter.vocabulary.map(v => typeof v === 'object' ? v.term : v)}
/>

> "In orienteering, you find checkpoints in order using clue sheets"

<div style={{display:'flex', gap:'1rem', marginBottom:'1.25rem'}}>
  <figure style={{margin:0, flex:1}}>
    <img src="/curriculum/img/activities/animal-o.png" alt="Animal-O setup diagram" style={{width:'100%'}} />
    <figcaption style={{fontSize:'0.85rem', color:'#666', marginTop:'0.25rem'}}>Setup: animal checkpoints scattered within a boundary</figcaption>
  </figure>
  <figure style={{margin:0, flex:1}}>
    <img src="/curriculum/img/activities/animal-o-clue-sheet.png" alt="Clue sheets" style={{width:'100%'}} />
    <figcaption style={{fontSize:'0.85rem', color:'#666', marginTop:'0.25rem'}}>Clue sheets</figcaption>
  </figure>
</div>

<Description>{description}</Description>

<Tabs>
<TabItem value="run" label="How to Run It" default>

### Setup

1. Place animal-picture cones around the play area, spread out within the boundary
2. Set up a start/finish area with a marker or cone
3. Prepare clue sheets with different sequences of animals. Start with short sheets (2-3 animals) and have longer ones (5+) ready
4. Optional: set up a whiteboard near start/finish to track times or completions

### Steps

1. Each student or pair picks up a clue sheet at the start
2. Find the first animal on the clue sheet. Run to that checkpoint and confirm the animal matches
3. Continue to the next animal on the sheet, visiting each checkpoint in order
4. Return to the finish after the last checkpoint

### Progression

Start simple and add challenge as students succeed:

- **2-3 animals**: short clue sheet, learn the format
- **5+ animals**: longer courses covering more of the space
- **Different sheet**: a new sequence so memorized routes don't help
- **From memory**: put the clue sheet away and try to complete the course
- **For speed**: repeat the same course and beat your previous time
- **Solo**: if students started in pairs, try it individually

### Tips

- Make sure students check the animal at each checkpoint, not just run to the nearest cone
- If students are struggling, start with Explore & Find (see Companions tab)
- Moving checkpoints to new locations resets the challenge and prevents memorizing a route

</TabItem>
<TabItem value="script" label="Script">

### Boundaries

"Welcome! Today we're going to play some orienteering games."

"First, let's explore our boundaries. What does 'boundaries' mean?"
*(Students respond)*
"Right, boundaries are the limits of our playing area. We stay safe and know where we can play."

*(Point to landmarks around the space)*
"Is this inside our boundaries?"
*(Repeat with 2-3 examples)*

*(Check red zones)*
"Can I go past the fence?" *(Wait for "No!")*
"Can I go into the parking lot?" *(Wait for "No!")*

"So are we staying inside or outside the boundaries?" *(Students: "Inside!")*

### Visiting Cones Together

"Now we're playing Animal-O. First we'll visit the animal cones together as a group."

*(Walk to first cone)*
"Which animal is this? How does it move?"

"When we find an animal, we move like that animal to get to the next one. Let's go."

### Clue Sheets

"Now you each get a clue sheet. What do you see on it, words or pictures?"
*(Students: "Pictures!")*

"Your goal is to find all the animals in order, top to bottom. When you find an animal, check that the picture on the cone matches your clue sheet. Then move to the next one."

*(Hold up clue sheet and point to the first animal)*

"Start here at the start cone. Look at your first animal. When you find it, check it matches, then move to the next one on your sheet."

</TabItem>
<TabItem value="vocabulary" label="Vocabulary">

{frontMatter.vocabulary.map(v => (
  <p key={v.term}><strong>{v.term}</strong>: {v.definition}</p>
))}

See the [Glossary](/reference/glossary) for all curriculum terms.

</TabItem>
<TabItem value="companions" label="Companions">

### Explore & Find *(readiness)*

**In pairs, explore to find animal checkpoints without a set order.**

A less structured version of Animal-O. Students explore freely within the boundary to find animal checkpoints and report back what they found. No clue sheet, no required order.

Use this before Animal-O if students need to get familiar with the space and the checkpoint format first.

| | |
|---|---|
| **Time** | 5-10 minutes |
| **Materials** | Same setup as Animal-O |
| **How to run it** | Pair up. Explore within the boundary to find animal checkpoints. Return on the gathering signal. Report what you found and where. |

</TabItem>
</Tabs>

:::tip Electronic timing optional
See [Using SI Equipment](/equipment/si-timing) for setup instructions.
:::

## Videos

<CardGrid columns={3}>
  <div>
    <YouTube id="rok2Ghx3fq4" title="Animal Orienteering for Instructors" />
    <p style={{fontSize:'0.85rem', marginTop:'0.5rem'}}>Overview for teachers</p>
  </div>
  <div>
    <YouTube id="HpDzuzA03X0" title="How to play Animal-O" />
    <p style={{fontSize:'0.85rem', marginTop:'0.5rem'}}>How to play, for participants</p>
  </div>
  <div>
    <YouTube id="TODO" title="Electronic timing with Animal-O" />
    <p style={{fontSize:'0.85rem', marginTop:'0.5rem'}}>Electronic timing and EasyGec with Animal-O</p>
  </div>
</CardGrid>

</FullOnly>

<CompactOnly>

<OnePager
  title="Animal-O"
  tagline="Use a clue sheet to find checkpoints in order"
  epigraph="In orienteering, you find checkpoints in order using clue sheets"
  description={description}
  image="/curriculum/img/activities/animal-o.png"
  time={frontMatter.time}
  space={frontMatter.space}
  materials={frontMatter.materials}
  setup={frontMatter.setup}
  vocabulary={frontMatter.vocabulary.map(v => typeof v === 'object' ? v.term : v)}
  goals={[
    'Use a clue sheet (animal strip) to complete an orienteering course',
    'Learn to check codes (animal pictures) at each checkpoint',
    'Develop spatial memory and navigation skills',
    'Manage rapid changes of direction',
  ]}
  delivery={
    <>
      <p>We recommend that younger students do this in pairs.</p>
      <ol>
        <li>Review the boundary and gathering signal</li>
        <li>Explore to find animal checkpoints</li>
        <li>Use the clue sheets to find checkpoints in order</li>
      </ol>
      <p>Progression:</p>
      <ol type="a">
        <li>Complete a course using a clue sheet</li>
        <li>Repeat a clue sheet to get a faster time</li>
        <li>Repeat a clue sheet from memory</li>
        <li>Try a different clue sheet</li>
        <li>Advance to clue sheets with more animals</li>
      </ol>
    </>
  }
  reflection={[
    'What do you like most about orienteering so far?',
    'What helped you get faster?',
    'What was the hardest part of this activity? Why?',
    'How did you remember where the animals are?',
    'Were some courses easier/harder? Why?',
    'How did you work together? What strategies did you use to be successful as a team?',
  ]}
  extensions={[
    'Track course completion or times on a whiteboard',
    'Move the checkpoints to new locations and start over',
    'Have students draw a map of the area and checkpoint locations',
    'Cover up animals with napkins, students must communicate to finish course',
    'Use electronic timing',
  ]}
/>

</CompactOnly>
