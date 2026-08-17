export interface GlossaryEntry {
  term: string;
  definition: string;
}

const glossaryEntries: GlossaryEntry[] = [
  {
    term: 'Boundary',
    definition: 'The perimeter of the play area. All checkpoints are inside the boundary.',
  },
  {
    term: 'Checkpoint',
    definition: 'A location marked with a cone, flag, or streamer in the field. On a map, checkpoints are shown with a circle. In Animal-O, each checkpoint has an animal picture attached to the cone. In the sport of orienteering, a checkpoint is called a "control."',
  },
  {
    term: 'Clue sheet',
    definition: 'A list showing the order to visit checkpoints. In Animal-O, the clue sheet shows pictures of animals. In standard orienteering, the clue sheet uses numbers and describes the feature at each checkpoint.',
  },
  {
    term: 'Course',
    definition: 'A sequence of checkpoints from start to finish. To complete a course, start at the Start marker, visit each checkpoint in order, and finish at the Finish marker.',
  },
  {
    term: 'Explore',
    definition: 'Travel through an unfamiliar area to learn what\'s there. Students may already know the space, but they can still look for what\'s new, different, or something they haven\'t noticed before.',
  },
  {
    term: 'Feature',
    definition: 'A distinct object in the real world, such as a tree, bench, fence, or boulder. Features are used as landmarks and as checkpoint locations.',
  },
  {
    term: 'Gathering signal',
    definition: 'A signal from the leader (such as a whistle blast or raised hand) telling everyone to stop and gather at a designated spot.',
  },
  {
    term: 'Landmark',
    definition: 'A distinct, recognizable object or location in the space. Good landmarks are easy to see from a distance and hard to confuse with others.',
  },
  {
    term: 'Map',
    definition: 'A picture that represents an area. Maps use symbols to show real-world features. A map lets you plan a route before moving through the space.',
  },
  {
    term: 'Mental map',
    definition: 'A map you build in your mind by moving through and observing a space. Spatial memory is the ability to hold and use a mental map.',
  },
  {
    term: 'Obstacle',
    definition: 'A feature you cannot cross, like a wall, a river, or a fence. Built worlds use everyday equipment to stand in for real obstacles: a mat might be a wall, a rope might be a river.',
  },
  {
    term: 'Orient the map',
    definition: "Rotate the map so it aligns with the real world: features on the left of the map are to your left, features ahead on the map are ahead of you.",
  },
  {
    term: 'Orienteering',
    definition: 'A sport where participants navigate between checkpoints using a map and compass, completing a course as quickly as possible. Rules and mapping standards are set by the International Orienteering Federation (IOF).',
  },
  {
    term: 'Pattern map',
    definition: 'A map showing a set of objects arranged in a geometric pattern. Used in Geometric-O.',
  },
  {
    term: 'Picture map',
    definition: 'A picture of a space that can be used as a map to locate objects. Used before students learn standard map symbols.',
  },
  {
    term: 'Route choice',
    definition: 'The path you choose to get from one checkpoint to the next. Good route choice considers distance, terrain, and landmarks.',
  },
  {
    term: 'Spatial memory',
    definition: 'The ability to remember where things are in space. Develops through repeated exploration of the same area.',
  },
  {
    term: 'Spatial relationship words',
    definition: 'Words that describe where something is relative to the observer or to other objects: next to, beyond, between, left, right, behind, in front of.',
  },
  {
    term: 'Symbol',
    definition: 'A graphic mark on a map that represents a real-world feature. For example, a small green circle represents a tree.',
  },
];

const byTerm = new Map<string, GlossaryEntry>();
for (const entry of glossaryEntries) {
  byTerm.set(entry.term.toLowerCase(), entry);
}

export function lookupTerm(term: string): GlossaryEntry | null {
  const key = term.toLowerCase().trim();
  const exact = byTerm.get(key);
  if (exact) return exact;

  for (const [canonical, entry] of byTerm) {
    if (key.includes(canonical) || canonical.includes(key)) {
      return entry;
    }
  }

  return null;
}

export default glossaryEntries;
