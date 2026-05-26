---
title: "6 - Maps — Lesson Plan"
sidebar_label: "6 - Maps"
sidebar_position: 6
---

import ActivityCard from '@site/src/components/ActivityCard';
import CardGrid from '@site/src/components/CardGrid';
import MaterialLink from '@site/src/components/MaterialLink';
import VocabLink from '@site/src/components/VocabLink';
import {ViewToggle, FullOnly, CompactOnly} from '@site/src/components/ViewToggle';
import OnePager from '@site/src/components/OnePager';

<ViewToggle />

<FullOnly>

# 6 - Maps — Lesson Plan

> "Today we will navigate using a real orienteering map"

| | |
|---|---|
| **Time** | 30-60 minutes (can extend across multiple sessions) |
| **Space** | Schoolyard or local park (needs real features for map symbols) |
| **Materials** | <MaterialLink name="Orienteering maps" />, <MaterialLink name="Checkpoint markers (cones or flags)" />, <MaterialLink name="Master map" />, <MaterialLink name="Scorecards and pencils" /> |
| **Setup** | Place checkpoints according to the master map |
| **Vocabulary** | <VocabLink term="Orient the map" />, <VocabLink term="Route choice" />, <VocabLink term="Start triangle" />, <VocabLink term="Finish circle" /> |

## Activities

<CardGrid columns={3}>
  <ActivityCard
    title="Score-O"
    description="Visit as many checkpoints as possible in any order."
    link="/activities/core/score-o"
    tag="core"
  />
  <ActivityCard
    title="Point-to-Point"
    description="Navigate a course visiting controls in order from start to finish."
    tag="core"
  />
  <ActivityCard
    title="Poison-O"
    description="Score-O where wrong checkpoints lose points."
    tag="extension"
  />
  <ActivityCard
    title="Poker-O"
    description="Collect poker hands at checkpoints."
    tag="extension"
  />
</CardGrid>

## Goals

### Orienteering Goals
- Understand what an orienteering map is and how it differs from a pattern map
- Make route choices based on the map
- Complete a Point-to-Point course from start to finish
- Complete courses independently

### PE Standards (SHAPE America)
- Combine movement concepts with skills (S2.E1)
- Use simple strategies and tactics (S2.E5)
- Move confidently and safely in open spaces (S2.E1, S4.E6)
- Cooperate and learn with others (S4.E4)

## Delivery

1. [**Boundary Run**](/activities/core/boundary-run): run the boundary
2. **Map review**: orient the map together using real features; briefly review symbols from Lesson 5
3. [**Score-O**](/activities/core/score-o): each student or pair gets a map with checkpoint circles; visit as many as you can in the time limit, in any order
4. **Point-to-Point**: follow a course from start to finish, visiting controls in order
5. **Partner orienteering**: plan and execute a full course together
6. **Solo orienteering**: do a course on your own

## Reflection

- How is the orienteering map different from the pattern maps we used before?
- What strategy did you use to visit the most checkpoints in Score-O?
- How is Point-to-Point different from Score-O? Which did you prefer?
- How did you determine which way to go for each checkpoint?
- What shortcuts between checkpoints did you find?

## Extensions

- **Poker-O**: each checkpoint has a playing card; collect the best poker hand
- **Poison-O**: wrong checkpoints cost points; rewards careful map reading
- **Place Your Own Checkpoints**: students place markers using the map, then others find them
- Relay race: teams take turns completing the course
- Challenge students to complete three checkpoints from memory

</FullOnly>

<CompactOnly>

<OnePager
  variant="lesson"
  title="6 - Maps — Lesson Plan"
  tagline="Navigate using a real orienteering map"
  epigraph="Today we will navigate using a real orienteering map"
  time="30-60 minutes (can extend across multiple sessions)"
  space="Schoolyard or local park (needs real features for map symbols)"
  materials={['Orienteering maps', 'Checkpoint markers (cones or flags)', 'Master map', 'Scorecards and pencils']}
  setup="Place checkpoints according to the master map"
  vocabulary={['Orient the map', 'Route choice', 'Start triangle', 'Finish circle']}
  goals={[
    'Understand what an orienteering map is and how it differs from a pattern map',
    'Make route choices based on the map',
    'Complete a Point-to-Point course from start to finish',
    'Complete courses independently',
  ]}
  delivery={
    <>
      <ol>
        <li><strong>Boundary Run</strong>: run the boundary</li>
        <li><strong>Map review</strong>: orient the map; review symbols from Lesson 5</li>
        <li><strong>Score-O</strong>: visit as many checkpoints as possible in any order</li>
        <li><strong>Point-to-Point</strong>: follow a course from start to finish</li>
        <li><strong>Partner/Solo Orienteering</strong>: complete full courses</li>
      </ol>
    </>
  }
  reflection={[
    'How is the orienteering map different from the pattern maps we used before?',
    'What strategy did you use to visit the most checkpoints in Score-O?',
    'How is Point-to-Point different from Score-O? Which did you prefer?',
    'How did you determine which way to go for each checkpoint?',
    'What shortcuts between checkpoints did you find?',
  ]}
  extensions={[
    '**Poker-O**: each checkpoint has a playing card; collect the best poker hand',
    '**Poison-O**: wrong checkpoints cost points; rewards careful map reading',
    '**Place Your Own Checkpoints**: students place markers using the map, then others find them',
    'Relay race: teams take turns completing the course',
    'Challenge students to complete three checkpoints from memory',
  ]}
/>

</CompactOnly>
