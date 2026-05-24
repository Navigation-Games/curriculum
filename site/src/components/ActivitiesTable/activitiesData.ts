export interface ActivitySummary {
  name: string;
  tagline: string;
  time: string;
  space: string;
  level: string;
  image: string;
  link: string;
  description: string;
  steps: string[];
}

const activities: ActivitySummary[] = [
  {
    name: 'Boundary Run',
    tagline: 'Travel the boundary of the play area',
    time: 'Walk the boundary + 5 min discussion',
    space: 'Gym, schoolyard, or local park',
    level: 'Level 1',
    image: '/curriculum/img/activities/boundary-run.png',
    link: '/curriculum/activities/core/boundary-run',
    description: 'The leader runs around the boundary of the play area while participants follow. Then participants show what they learned by identifying which spots are inside or outside the boundary.',
    steps: [
      'Gather at a starting point',
      'Explain the boundary run',
      'Run together, stay behind the leader',
      'Run the boundary',
      'Quiz inside vs. outside',
      'Discuss off-limits areas',
    ],
  },
  {
    name: 'Gathering',
    tagline: 'Return to the teacher on a signal',
    time: '30-45 minutes',
    space: 'Gym, schoolyard, or local park',
    level: 'Level 1',
    image: '/curriculum/img/activities/gathering.png',
    link: '/curriculum/activities/core/gathering',
    description: 'Students spread out within the boundary, then return to the leader when they hear the gathering signal. Builds the habit of listening for and responding to a recall signal while moving.',
    steps: [
      'Establish a gathering signal',
      'Spread out within the boundary',
      'Signal to gather',
      'Repeat with increasing distance',
    ],
  },
  {
    name: 'Animal-O',
    tagline: 'Use a clue sheet to find checkpoints in order',
    time: '15-30 minutes',
    space: 'Gym, schoolyard, or local park',
    level: 'Level 1',
    image: '/curriculum/img/activities/animal-o.png',
    link: '/curriculum/activities/core/animal-o',
    description: 'Explore within the boundary to find animal checkpoints. Use a clue sheet to find checkpoints in order. Repeat for a faster time. Repeat from memory.',
    steps: [
      'Pick up a clue sheet at the start',
      'Find and confirm each animal in order',
      'Return to the finish after the last checkpoint',
    ],
  },
  {
    name: 'Geometric-O',
    tagline: 'Use a simple map to do progressively harder courses',
    time: '30-60 minutes',
    space: 'Any space (gym, schoolyard, or local park)',
    level: 'Level 1',
    image: '',
    link: '/curriculum/activities/core/geometric-o',
    description: 'Students orient a simple pattern map using colored landmarks, then visit checkpoints in order. The bridge between clue sheets and orienteering maps.',
    steps: [
      'Whiteboard introduction: orient the map',
      'Pair up and receive maps',
      'Visit checkpoints in order, starting with triangle',
      'Progress to harder courses',
    ],
  },
  {
    name: 'Map Walk',
    tagline: 'Walk a route together, matching map symbols to real features',
    time: '15-20 minutes',
    space: 'Schoolyard or local park with an orienteering map',
    level: 'Level 2',
    image: '',
    link: '/curriculum/activities/core/map-walk',
    description: 'The leader walks a route while students follow along on their own maps, matching symbols on the map to features in the real world.',
    steps: [
      'Distribute maps and orient them',
      'Walk the route together',
      'Stop at features and match to map symbols',
      'Students take turns leading',
    ],
  },
  {
    name: 'Score-O',
    tagline: 'Visit as many checkpoints as possible in any order',
    time: '15-30 minutes',
    space: 'Schoolyard or local park with an orienteering map',
    level: 'Level 2',
    image: '',
    link: '/curriculum/activities/core/score-o',
    description: 'Students use an orienteering map to find as many checkpoints as possible within a time limit, visiting them in any order they choose.',
    steps: [
      'Orient the map at the start',
      'Choose which checkpoint to visit first',
      'Navigate to checkpoints in any order',
      'Return before time runs out',
    ],
  },
];

export default activities;
