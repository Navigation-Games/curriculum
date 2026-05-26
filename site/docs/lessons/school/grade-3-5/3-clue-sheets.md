---
title: "3 - Clue Sheets — Lesson Plan"
sidebar_label: "3 - Clue Sheets"
sidebar_position: 3
---

import ActivityCard from '@site/src/components/ActivityCard';
import CardGrid from '@site/src/components/CardGrid';
import MaterialLink from '@site/src/components/MaterialLink';
import VocabLink from '@site/src/components/VocabLink';
import {ViewToggle, FullOnly, CompactOnly} from '@site/src/components/ViewToggle';
import OnePager from '@site/src/components/OnePager';

<ViewToggle />

<FullOnly>

# 3 - Clue Sheets — Lesson Plan

> "In orienteering, you find checkpoints in order using clue sheets"

| | |
|---|---|
| **Time** | 30-60 minutes |
| **Space** | Gym, schoolyard, or local park |
| **Materials** | <MaterialLink name="Checkpoints (cones with animal pictures)" />, <MaterialLink name="Clue sheets" />, <MaterialLink name="Start/finish markers" />, <MaterialLink name="Cones (optional, for marking boundaries)" /> |
| **Setup** | Place animal checkpoints and start/finish markers around the space |
| **Vocabulary** | <VocabLink term="Clue sheet" />, <VocabLink term="Course" />, <VocabLink term="Spatial memory" /> |

## Activities

<CardGrid columns={3}>
  <ActivityCard
    title="Boundary Run"
    description="Warm up: run the boundary together."
    link="/activities/core/boundary-run"
    tag="warm-up"
  />
  <ActivityCard
    title="Animal-O"
    description="Find the animals in order using clue sheets."
    link="/activities/core/animal-o"
    tag="core"
  />
  <ActivityCard
    title="Explore & Find"
    description="Warm up: explore to find checkpoints (if not done in Lesson 2)."
    link="/activities/core/animal-o"
    tag="readiness"
  />
</CardGrid>

## Goals

### Orienteering Goals
- Use a clue sheet to complete a course in order
- Check the animal picture at each checkpoint to confirm the right one
- Build spatial memory by repeating courses
- Complete the activity faster by remembering checkpoint locations

### PE Standards (SHAPE America)
- Demonstrate locomotor skills (S1.E1, S1.E2)
- Engage actively in class (S3.E2)
- Accept corrective feedback from the teacher (S4.E3)
- Work cooperatively with others (S4.E5)

## Delivery

1. [**Boundary Run**](/activities/core/boundary-run): quick review of the boundary
2. Pair up
3. [**Animal-O**](/activities/core/animal-o): use clue sheets to find checkpoints in order. Progression:
   - Start with a short clue sheet (2-3 animals)
   - Advance to clue sheets with more animals
   - Try a different clue sheet
   - Repeat from memory
   - Repeat for a faster time

## Reflection

- What do you like most about orienteering so far?
- What helped you get faster?
- At each checkpoint, how do you check you are at the right place?
- How did you remember where the animals are?
- Were some courses easier or harder? Why?
- How did you work together?

## Extensions

- Track course completion or times on a whiteboard
- Move the checkpoints to new locations and start over
- Have students draw a map of the area showing checkpoint locations

</FullOnly>

<CompactOnly>

<OnePager
  variant="lesson"
  title="3 - Clue Sheets — Lesson Plan"
  tagline="Find them in this specific order"
  epigraph="In orienteering, you find checkpoints in order using clue sheets"
  time="30-60 minutes"
  space="Gym, schoolyard, or local park"
  materials={['Checkpoints (cones with animal pictures)', 'Clue sheets', 'Start/finish markers', 'Cones (optional, for marking boundaries)']}
  setup="Place animal checkpoints and start/finish markers around the space"
  vocabulary={['Clue sheet', 'Course', 'Spatial memory']}
  goals={[
    'Use a clue sheet to complete a course in order',
    'Check the animal picture at each checkpoint to confirm the right one',
    'Build spatial memory by repeating courses',
    'Complete the activity faster by remembering checkpoint locations',
  ]}
  delivery={
    <>
      <ol>
        <li><strong>Boundary Run</strong>: quick review</li>
        <li>Pair up</li>
        <li><strong>Animal-O</strong>: use clue sheets to find checkpoints in order</li>
      </ol>
      <p>Progression:</p>
      <ol type="a">
        <li>Short clue sheet (2-3 animals)</li>
        <li>Advance to more animals</li>
        <li>Try a different clue sheet</li>
        <li>Repeat from memory</li>
        <li>Repeat for a faster time</li>
      </ol>
    </>
  }
  reflection={[
    'What do you like most about orienteering so far?',
    'What helped you get faster?',
    'At each checkpoint, how do you check you are at the right place?',
    'How did you remember where the animals are?',
    'Were some courses easier or harder? Why?',
    'How did you work together?',
  ]}
  extensions={[
    'Track course completion or times on a whiteboard',
    'Move the checkpoints to new locations and start over',
    'Have students draw a map of the area showing checkpoint locations',
  ]}
/>

</CompactOnly>
