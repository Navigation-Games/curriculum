---
title: "2 - Explore & Find — Lesson Plan"
sidebar_label: "2 - Explore & Find"
sidebar_position: 2
---

import ActivityCard from '@site/src/components/ActivityCard';
import CardGrid from '@site/src/components/CardGrid';
import MaterialLink from '@site/src/components/MaterialLink';
import VocabLink from '@site/src/components/VocabLink';
import {ViewToggle, FullOnly, CompactOnly} from '@site/src/components/ViewToggle';
import OnePager from '@site/src/components/OnePager';

<ViewToggle />

<FullOnly>

# 2 - Explore & Find — Lesson Plan

| | |
|---|---|
| **Time** | 30-45 minutes |
| **Space** | Gym, schoolyard, or local park |
| **Materials** | <MaterialLink name="Checkpoints (cones with animal pictures)" />, <MaterialLink name="Cones (optional, for marking boundaries)" /> |
| **Setup** | Place animal checkpoints around the space within the boundary |
| **Vocabulary** | <VocabLink term="Boundary" />, <VocabLink term="Gathering signal" />, <VocabLink term="Checkpoint" /> |

## Activities

<CardGrid columns={3}>
  <ActivityCard
    title="Boundary Run"
    description="Review the boundary (quick refresher)."
    link="/activities/core/boundary-run"
    tag="core"
  />
  <ActivityCard
    title="Explore & Find"
    description="In pairs, explore to find animal checkpoints."
    link="/activities/core/animal-o"
    tag="core"
  />
  <ActivityCard
    title="Animal Relay"
    description="Take turns running to animal checkpoints."
    tag="variation"
  />
</CardGrid>

## Goals

### Orienteering Goals
- Explore a space and find checkpoints within the boundary
- Return on the gathering signal
- Describe what you found and where it was, using spatial language
- Begin building spatial memory of checkpoint locations
- Work with a partner

### PE Standards (SHAPE America)
- Demonstrate locomotor skills (S1.E1, S1.E2)
- Engage actively in class (S3.E2)
- Work cooperatively with others (S4.E5)

## Delivery

1. [**Boundary Run**](/activities/core/boundary-run): quick review of the boundary
2. Pair up
3. [**Explore & Find**](/activities/core/animal-o): explore within the boundary to find animal checkpoints; return on the gathering signal
4. Report back: which animals did you find? Where were they? ("The elephant was near the fence." "The giraffe was in the far corner.") Build a group picture of the space.
5. Send out again. Can you find more this time? Can you remember where the ones you've already seen are?
6. **Animal Relay**: take turns running to checkpoints

## Reflection

- How many animals did you find? Which was the hardest to find?
- Where were the animals? Can you describe where each one was?
- Did it help to know where they were from the first round?
- Were some animals easier or harder to find? Why?
- How did you work with your partner?

## Extensions

- Move the checkpoints to new locations and start over
- Have students draw a map of the area and checkpoint locations
- Visit every animal and move like that animal to the next one

</FullOnly>

<CompactOnly>

<OnePager
  variant="lesson"
  title="2 - Explore & Find — Lesson Plan"
  tagline="There are things out there; go find them and come back"
  time="30-45 minutes"
  space="Gym, schoolyard, or local park"
  materials={['Checkpoints (cones with animal pictures)', 'Cones (optional, for marking boundaries)']}
  setup="Place animal checkpoints around the space within the boundary"
  vocabulary={['Boundary', 'Gathering signal', 'Checkpoint']}
  goals={[
    'Explore a space and find checkpoints within the boundary',
    'Return on the gathering signal',
    'Describe what you found and where it was, using spatial language',
    'Begin building spatial memory of checkpoint locations',
    'Work with a partner',
  ]}
  delivery={
    <>
      <ol>
        <li><strong>Boundary Run</strong>: quick review of the boundary</li>
        <li>Pair up</li>
        <li><strong>Explore & Find</strong>: explore to find animal checkpoints; return on the signal</li>
        <li>Report back: describe what you found and where it was</li>
        <li>Send out again. Can you find more? Can you remember where you've been?</li>
        <li><strong>Animal Relay</strong>: take turns running to checkpoints</li>
      </ol>
    </>
  }
  reflection={[
    'How many animals did you find? Which was the hardest to find?',
    'Where were the animals? Can you describe where each one was?',
    'Did it help to know where they were from the first round?',
    'Were some animals easier or harder to find? Why?',
    'How did you work with your partner?',
  ]}
  extensions={[
    'Move the checkpoints to new locations and start over',
    'Have students draw a map of the area and checkpoint locations',
    'Visit every animal and move like that animal to the next one',
  ]}
/>

</CompactOnly>
