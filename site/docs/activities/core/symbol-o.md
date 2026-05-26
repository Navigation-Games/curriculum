---
title: "Symbol-O — Activity"
sidebar_label: Symbol-O
sidebar_position: 5
tags: [core, level-2]
time: 30-60 minutes
space: Gym, schoolyard, or local park
materials:
  - Checkpoints (with animal pictures)
  - Large-scale orienteering map or picture map
  - Map key (legend) poster or handout
  - Master map or list of symbols corresponding to the animals
  - Symbol-O clue sheets
setup: Place checkpoints on features that match the symbols in the answer key
vocabulary:
  - term: Symbol
    definition: A figure on the map that represents an object in real life. For example, a green circle means a tree, and the color blue means water.
  - term: Feature
    definition: A real-life object that can be shown as a symbol on a map. Fences, buildings, paths, and trees are all features.
  - term: Legend
    definition: A key that shows what each symbol on the map means. Also called a map key.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ActivityMeta from '@site/src/components/ActivityMeta';
import {ViewToggle, FullOnly, CompactOnly} from '@site/src/components/ViewToggle';
import OnePager from '@site/src/components/OnePager';
import Description from '@site/src/components/Description';
import VocabLink from '@site/src/components/VocabLink';
import CardGrid from '@site/src/components/CardGrid';

export const description = `Learn map symbols and the features they represent in the terrain. Use a clue sheet to visit different features within a boundary. Repeat using different clue sheets to learn all the symbols.

Builds map reading, symbol recognition, and the connection between map and terrain.`;

<ViewToggle />

<FullOnly>

# Symbol-O — Activity

**Understand map symbols and the features they represent**

<ActivityMeta
  time={frontMatter.time}
  space={frontMatter.space}
  materials={frontMatter.materials}
  vocabulary={frontMatter.vocabulary.map(v => typeof v === 'object' ? v.term : v)}
/>

> "Today we will learn about orienteering maps and symbols"

<Description>{description}</Description>

<Tabs>
<TabItem value="goals" label="Learning Goals">

Students completing this activity will be able to:

- Recognize common orienteering map symbols and name the features they represent
- Match symbols on the map to features on the ground
- Use a symbol clue sheet to find checkpoints in order (similar to Animal-O, but with symbols instead of animal pictures)
- Self-check using the animal pictures at each checkpoint
- Plan the order of features before starting

This activity works best after students have completed [Geometric-O](geometric-o) and are ready to transition from simple pattern maps to orienteering maps with real symbols.
See the [Grade 3-5 curriculum](/lessons/school/grade-3-5/) for how this activity fits into the lesson sequence.

</TabItem>
<TabItem value="run" label="How to Run It" default>

### Setup

1. Place checkpoints (with animal pictures) at features that match the symbols in the answer key. For example, place one checkpoint on a fence, one by a tree, one near a bench
2. Prepare a map key poster showing the symbols used at your site
3. Prepare Symbol-O clue sheets: strips of symbols (no text) that students must match to features in order, similar to Animal-O clue sheets but with map symbols instead of animal pictures
4. Have a master map or answer key listing which animal is at which feature

### Steps

1. **Boundary Run**: run the boundary, discuss inside/outside
2. **Explore**: students explore to find checkpoints, remembering where a few of them are. Gather on the signal
3. **Orienteering map introduction**: compare the orienteering map to any picture maps or pattern maps students have used before. Have students tell you how to orient it. Point out features and have volunteers run to them and back
4. **Symbol introduction**: show the map key. If possible, hide the text labels and have students guess what each symbol represents before revealing it. Quiz students on matching symbols to features and features to symbols
5. **Symbol-O**: point to a symbol on the key and challenge all students to find the checkpoint at that type of feature. Then pass out symbol clue sheets. Students work individually or in pairs, visiting features in the order the symbols appear on the sheet. They check their answer using the animal picture at each checkpoint
6. **Check and repeat**: when students finish, verify they visited all features in the correct order. If they made mistakes, explain where the error was and let them try again. Students may repeat courses as they please

### Tips

- A checkpoint at one feature can sometimes be interpreted as another (e.g., a checkpoint at a trail intersection near some trees could be read as "trail intersection" or "vegetation"). Be aware of alternative correct answers
- Have students say the order of features out loud before starting. This confirms they understand the clue sheet
- Start with 3-4 easy symbols (path, building, fence) before adding harder ones (vegetation boundaries, contours)

</TabItem>
<TabItem value="script" label="Script">

### Introducing the Symbols

"The challenge in this activity is to learn the map symbols, and use those to find the checkpoints. Start by looking at this map key."

*(Hold up the map key.)*

"You will receive a sheet of symbols that looks like this, although it won't have the words, and they might be in a different order. You must find checkpoints hidden at features matching these symbols in order from top to bottom."

"Can anyone remind me what a feature is?"

*(A real-life object that can be shown on a map.)*

### Trying It Together

"For example, if you were using the map key here, which checkpoint would you have to find first? This is the symbol for a bench, so you go to the checkpoint at the bench first! Everyone try to find the checkpoint on the bench right now."

*(Students run to the bench checkpoint and back.)*

"What animal was at the bench? Check your clue sheet. Good. Now look at your second symbol..."

</TabItem>
<TabItem value="vocabulary" label="Vocabulary">

{frontMatter.vocabulary.map(v => (
  <p key={v.term}><VocabLink term={v.term}><strong>{v.term}</strong></VocabLink>: {v.definition}</p>
))}

See the [Glossary](/reference/glossary) for all curriculum terms.

</TabItem>
<TabItem value="companions" label="Companions">

### Symbol Relay *(variation)*

**Team relay to learn map symbols competitively.**

Teams race to match symbols to features. One team member runs at a time, finds the checkpoint at the feature matching their symbol, and returns before the next team member goes. Adds energy and competition while reinforcing symbol recognition.

| | |
|---|---|
| **Time** | 15-20 minutes |
| **Materials** | Same Symbol-O setup, plus relay markers at the start |
| **How to run it** | Divide into teams of 3-4. Each team member gets one symbol. On "go," the first runner finds the feature matching their symbol, confirms with the animal picture, and runs back. Next runner goes. First team to finish wins. |

</TabItem>
</Tabs>

</FullOnly>

<CompactOnly>

<OnePager
  title="Symbol-O — Activity"
  tagline="Understand map symbols and the features they represent"
  epigraph="Today we will learn about orienteering maps and symbols"
  description={description}
  time={frontMatter.time}
  space={frontMatter.space}
  materials={frontMatter.materials}
  setup={frontMatter.setup}
  vocabulary={frontMatter.vocabulary.map(v => typeof v === 'object' ? v.term : v)}
  goals={[
    'Map symbols and what they represent',
    'Matching symbols to real features',
    'Self-checking with animal pictures',
    'Planning before starting',
  ]}
  steps={[
    'Run the boundary',
    'Explore within the boundary to find checkpoints, or do Animal-O',
    'Learn about the orienteering map from the teacher. Compare it to the picture map. Orient it. Point out features',
    'Learn the map symbols using the map key',
    'Pair up. Each pair gets a Symbol-O clue sheet and the corresponding animal clue sheet',
    'Visit checkpoints matching the symbols, in order. Check with the animal clue sheet',
    'Discuss with your partner what you each did well and what you could improve',
    'Repeat with the other courses',
  ]}
  delivery={
    <>
      <ol>
        <li>Run the boundary</li>
        <li>Explore to find checkpoints or do Animal-O</li>
        <li>Learn about the orienteering map. Compare to picture map. Orient it</li>
        <li>Learn the map symbols</li>
        <li>Pair up. Each pair gets a Symbol-O clue sheet and the corresponding animal clue sheet</li>
        <li>Visit checkpoints matching the symbols. Check with the animal clue sheet</li>
        <li>Discuss with your partner what went well and what you could improve</li>
        <li>Repeat with the other courses</li>
      </ol>
    </>
  }
  reflection={[
    'How are the two maps different?',
    'Which symbols were easier or harder to remember? Why?',
    'How did you work together?',
  ]}
  extensions={[
    'Have students do the course from memory',
    'Have students do the courses by themselves',
  ]}
/>

</CompactOnly>
