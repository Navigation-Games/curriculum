---
title: "Map Walk — Activity"
sidebar_label: Map Walk
sidebar_position: 5
tags: [core, level-2]
time: 15-20 minutes
space: Schoolyard or local park with an orienteering map
materials:
  - Orienteering maps (one per student or pair)
  - A planned route through varied features
setup: Plan a walking route that passes several distinct features shown on the map
vocabulary:
  - term: Symbol
    definition: A shape, color, or pattern on the map that represents a type of real feature (a green area means thick vegetation, a brown line means a path).
  - term: Feature
    definition: A real-world object that appears on the map. Buildings, paths, fences, trees, and open fields are all features.
  - term: Orient the map
    definition: Turn the map until it matches the real world. On an orienteering map, you orient using visible features rather than colored cones.
---

{/* AUTO-GENERATED from content/activities/map-walk.md — do not edit directly */}

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ActivityMeta from '@site/src/components/ActivityMeta';
import {ViewToggle, FullOnly, CompactOnly} from '@site/src/components/ViewToggle';
import OnePager from '@site/src/components/OnePager';
import Description from '@site/src/components/Description';

export const description = `The teacher leads students along a planned route. At each stop, students find their location on the map, identify the feature they are standing at, and match it to the map symbol. This is the first time students use a real orienteering map (as opposed to pattern maps in earlier lessons).

Map Walk bridges the gap between simple pattern maps and independent navigation. Students learn to trust the map by repeatedly confirming that what they see matches what the map shows.`;

<ViewToggle />

<FullOnly>

# Map Walk — Activity

**Walk a route together, matching map symbols to real features**

<ActivityMeta
  time={frontMatter.time}
  space={frontMatter.space}
  materials={frontMatter.materials}
  vocabulary={frontMatter.vocabulary.map(v => typeof v === 'object' ? v.term : v)}
/>

> "Every symbol on the map is something you can see and touch"

<Description>{description}</Description>

<Tabs>
<TabItem value="goals" label="Learning Goals">

Students completing this activity will be able to:

- Learn orienteering map symbols and match them to real features
- Read an orienteering map and follow a route on it
- Orient the map using visible features (not just colored cones)
- Build confidence that the map accurately represents the space

</TabItem>
<TabItem value="run" label="How to Run It" default>

### Setup

1. Study the orienteering map and plan a walking route that passes through a variety of features (paths, buildings, fences, vegetation boundaries, open areas)
2. Choose 5-8 stops where a clear feature is visible and identifiable on the map
3. At each stop, know which symbol corresponds to the feature so you can point it out

### Progression

- **First Map Walk**: teacher leads, frequent stops, basic symbols only (paths, buildings, open areas)
- **Second Map Walk**: students take turns leading the group to the next stop
- **Small groups**: groups of 3-4 follow a route independently, stopping to identify features
- **Individual**: students walk a route on their own and list the features they passed

### Tips

- Choose a route that includes at least one surprise. Something students would not expect to see on a map (a ditch, a small boulder, vegetation boundaries)
- Ask "point to where we are on the map" at every stop. If students cannot do this, the route is too complex for their level
- The thumb technique is essential. Students who anchor their thumb on their location stay oriented; those who do not get lost fast
- Keep the walk short. 15-20 minutes is plenty. Students will be eager to navigate on their own

</TabItem>
<TabItem value="script" label="Script">

### Starting the Map Walk

"Today we are going to walk together and learn how to read this orienteering map. This is a real map, not like the simple pattern maps we used before. It shows everything around us with special symbols."

### At the First Stop

*(Stop at a clear feature, like a fence or path junction.)*

"Look around. What do you see right here?" *(Fence, path, building...)* "Now find where we are on the map. Put your thumb there."

"On the map, this fence looks like this:" *(Point to the symbol.)* "Every time you see this symbol on the map, it means there is a fence there in real life."

### Continuing the Walk

"As we walk, keep your thumb on the map where you are. Slide it along as we move. When I say 'Stop,' look around and tell me what feature we are at."

### Returning

"Now it is your turn to lead us back. Who can read the map and take us back to where we started?"

</TabItem>
<TabItem value="vocabulary" label="Vocabulary">

{frontMatter.vocabulary.map(v => (
  <p key={v.term}><strong>{v.term}</strong>: {v.definition}</p>
))}

See the [Glossary](/reference/glossary) for all curriculum terms.

</TabItem>
</Tabs>

</FullOnly>

<CompactOnly>

<OnePager
  title="Map Walk — Activity"
  tagline="Walk a route together, matching map symbols to real features"
  epigraph="Every symbol on the map is something you can see and touch"
  description={description}
  time={frontMatter.time}
  space={frontMatter.space}
  materials={frontMatter.materials}
  setup={frontMatter.setup}
  vocabulary={frontMatter.vocabulary.map(v => typeof v === 'object' ? v.term : v)}
  goals={[
    'Map symbols',
    'Reading a real map',
    'Orienting with features',
    'Map confidence',
  ]}
  delivery={
    <>
      <ol>
        <li>Hand out maps; orient together at the start</li>
        <li>Walk to the first stop; identify the feature and its symbol</li>
        <li>Continue to 4-7 more stops, identifying features and symbols</li>
        <li>Students lead the return route</li>
      </ol>
    </>
  }
  reflection={[
    'Which symbols were easiest to remember? Which were hardest?',
    'How is this map different from the simple maps we used before?',
    'What surprised you about what the map shows?',
    'How did you keep track of where you were on the map?',
  ]}
  extensions={[
    'Symbol-O: find checkpoints by reading map symbols, not by looking for cones (see Companions)',
    'Have students list all the features they can identify on the map',
    'Give students a map with 3 checkpoint circles and ask them to find all three on their own',
    'Photo Map Walk: take photos of features and match them to map symbols back in the classroom',
  ]}
/>

</CompactOnly>
