---
title: "Point-to-Point — Activity"
sidebar_label: Point-to-Point
sidebar_position: 7
tags: [core, level-2]
time: 30-60 minutes
space: Schoolyard or local park
materials:
  - Orienteering maps with courses marked
  - Checkpoint markers (cones or flags) with codes
  - Master map (all controls)
setup: Place checkpoints at their corresponding locations according to the master map
vocabulary:
  - term: Orientation
    definition: Turning the map to match up with reality. The map should always match the real world around you.
  - term: Route choice
    definition: The path you decide to take to get from one checkpoint to the next. Good route choice considers distance, terrain, and landmarks.
  - term: Relocation
    definition: Figuring out where you are when you realize you are not where you expected to be. Stop, orient your map, look for landmarks, and find your position.
---

{/* AUTO-GENERATED from content/activities/point-to-point.md — do not edit directly */}

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ActivityMeta from '@site/src/components/ActivityMeta';
import {ViewToggle, FullOnly, CompactOnly} from '@site/src/components/ViewToggle';
import OnePager from '@site/src/components/OnePager';
import Description from '@site/src/components/Description';
import VocabLink from '@site/src/components/VocabLink';

export const description = `Students visit checkpoints in sequential order using a map. This is "real" orienteering. The primary challenges point-to-point orienteering introduces are route choice, relocation, and map reading. Students must orient the map, plan a route to each checkpoint, confirm they are at the correct location by checking the code, and decide what to do when they are not where they expected to be.`;

<ViewToggle />

<FullOnly>

# Point-to-Point — Activity (Orienteering Course)

**Complete a course using an orienteering map**

<ActivityMeta
  time={frontMatter.time}
  space={frontMatter.space}
  materials={frontMatter.materials}
  vocabulary={frontMatter.vocabulary.map(v => typeof v === 'object' ? v.term : v)}
/>

> "Today we will be doing a regular orienteering course using a map"

<Description>{description}</Description>

<Tabs>
<TabItem value="goals" label="Learning Goals">

Students completing this activity will be able to:

- Orient a map and understand how it represents the real course
- Use the map to plan your route to each checkpoint
- Use simple strategies and tactics in following the course
- Move confidently and safely in open spaces
- Work cooperatively with and accept feedback from others

</TabItem>
<TabItem value="run" label="How to Run It" default>

### Setup

1. Place checkpoints (streamers, cones, or flags) at their corresponding locations on the master map
2. Make an answer key for each checkpoint and its code
3. Print maps with courses marked. Have multiple courses of varying difficulty if possible

### Progression

- **Pairs first**: start with partner navigation so students can discuss map reading together
- **Individual**: once students are comfortable, try the course alone
- **Reverse order**: do the course backward for a new challenge
- **From memory**: try to reach three checkpoints in order without looking at the map
- **Harder courses**: courses that cross open areas or require more precise map reading

### Tips

- Keep the first course short (4-5 checkpoints). Students can always do a second course
- Circulate during the activity and ask: "Is your map oriented? Where are you right now? Show me on the map"
- Students who finish early can help others, but should give hints ("Turn your map" or "Follow the path"), not answers
- Emphasize accuracy over speed. Going the right way matters more than going fast

</TabItem>
<TabItem value="script" label="Script">

### Introducing Point-to-Point

"Today we are doing point-to-point orienteering. This is real orienteering. You will find the checkpoints in the order shown on the map."

"Your challenge is to visit all of the checkpoints marked on the map in order. Remember to keep your map oriented, and use landmarks to help you find your way."

### Course Rules

"You will visit the checkpoints in order. From number 1 to number 2, from number 2 to number 3. At each checkpoint, there is a code. Check the code to make sure it matches. If the code does not match, what does that mean?"

*(Students: "You are at the wrong place.")*

"So what do you do? Stop. Look at your map. Look around you. Make sure your map is oriented. Find where you are on the map. Then go to the correct checkpoint."

### Starting

"Find a partner. Look at the map together. Where is the first checkpoint? Which way will you go to get there? Before we start, make a plan. Think first. Then move."

</TabItem>
<TabItem value="vocabulary" label="Vocabulary">

{frontMatter.vocabulary.map(v => (
  <p key={v.term}><VocabLink term={v.term}><strong>{v.term}</strong></VocabLink>: {v.definition}</p>
))}

See the [Glossary](/reference/glossary) for all curriculum terms.

</TabItem>
</Tabs>

</FullOnly>

<CompactOnly>

<OnePager
  title="Point-to-Point — Activity"
  tagline="Complete a course using an orienteering map"
  epigraph="Today we will be doing a regular orienteering course using a map"
  description={description}
  time={frontMatter.time}
  space={frontMatter.space}
  materials={frontMatter.materials}
  setup={frontMatter.setup}
  vocabulary={frontMatter.vocabulary.map(v => typeof v === 'object' ? v.term : v)}
  goals={[
    'Orient the map',
    'Route planning',
    'Strategies and tactics',
    'Confidence in open spaces',
    'Cooperation and feedback',
  ]}
  delivery={
    <>
      <ol>
        <li>Hand out maps and orient the map together using landmarks</li>
        <li>Connect the map to the environment: point to features, identify checkpoint locations</li>
        <li>Explain the course rules: visit checkpoints in order, check codes</li>
        <li>Pair up; plan the route to the first checkpoint together</li>
        <li>Run the course: visit checkpoints in order, confirming codes</li>
        <li>Students who finish help others with hints</li>
      </ol>
    </>
  }
  reflection={[
    'How did you determine which way to go for each checkpoint?',
    'What shortcuts between checkpoints did you find?',
    'If you were at a wrong checkpoint, how did you figure out where you needed to go instead?',
    'How is Point-to-Point different from Score-O? Which did you prefer?',
    'What would you do differently next time?',
  ]}
  extensions={[
    'Relay race: divide into teams, each member completes a course before tagging the next',
    'Challenge students to run to three checkpoints in order without a map',
    'Do the course in reverse order',
    'Compare route choices with a partner after the course: "Where did you go? Why?"',
  ]}
/>

</CompactOnly>
