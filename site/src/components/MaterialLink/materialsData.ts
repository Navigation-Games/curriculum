export interface MaterialInfo {
  name: string;
  description: string;
  whereToGet: string;
  alternatives: string;
  usedIn: string;
  learningConnection: string;
}

const materialEntries: MaterialInfo[] = [
  {
    name: 'Checkpoint markers',
    description: 'Cones, flags, or streamers placed in the field to mark checkpoint locations.',
    whereToGet: 'Sports equipment suppliers, dollar stores (small cones), or DIY with garden stakes and flagging tape',
    alternatives: 'Plastic cups, laminated cards on stakes, chalk marks on pavement',
    usedIn: 'Animal-O, Geometric-O, Score-O, Map Walk',
    learningConnection: 'Checkpoints are the concrete targets students navigate to. Visible, consistent markers reduce confusion and let students focus on navigation rather than searching.',
  },
  {
    name: 'Clue sheets',
    description: 'Printed sheets showing the order to visit checkpoints and the checkpoint descriptions used to confirm each one. In Animal-O, clue sheets show animal pictures.',
    whereToGet: 'Print from curriculum templates',
    alternatives: 'Hand-drawn sheets, laminated reusable sheets with dry-erase markers',
    usedIn: 'Animal-O, Geometric-O',
    learningConnection: 'Clue sheets introduce sequential navigation. Following a fixed order builds the discipline of confirming each checkpoint before moving on. The checkpoint descriptions on the clue sheet teach students to verify they are at the correct location.',
  },
  {
    name: 'Cones',
    description: 'Plastic sport cones used to mark boundaries, checkpoints, or landmarks.',
    whereToGet: 'PE equipment closet, sports suppliers',
    alternatives: 'Chalk lines, natural landmarks (trees, fence posts), tape on gym floor',
    usedIn: 'Boundary Run, Gathering, Animal-O, Geometric-O, Basketball-O',
    learningConnection: 'Cones define the physical space. Colored cones as landmarks help students orient maps by matching cone colors to map markings.',
  },
  {
    name: 'Colored landmark cones',
    description: 'Four distinctly colored cones (red, blue, green, yellow) placed at corners or edges of the play area.',
    whereToGet: 'Use colored sport cones, or wrap standard cones with colored tape',
    alternatives: 'Colored buckets, painted rocks, colored flags',
    usedIn: 'Geometric-O, Find the Cone',
    learningConnection: 'Landmark cones are the bridge between map and terrain. Students match colored dots on their map to colored cones in the field.',
  },
  {
    name: 'Geometric-O maps',
    description: 'Simple pattern maps showing checkpoint positions relative to colored landmark cones.',
    whereToGet: 'Print from curriculum templates, or draw on index cards',
    alternatives: 'Hand-drawn maps on whiteboards, then photographed and printed',
    usedIn: 'Geometric-O, Find the Cone',
    learningConnection: 'Pattern maps strip away symbol complexity and focus on spatial relationships.',
  },
  {
    name: 'Master map',
    description: 'A single reference map showing the correct locations of all checkpoints.',
    whereToGet: 'Create during setup by marking checkpoint locations on a blank map',
    alternatives: 'A photo of the setup, a sketch on a whiteboard',
    usedIn: 'Geometric-O, Score-O, Map Walk',
    learningConnection: 'The master map is the "answer key." It lets the leader verify setup accuracy and gives students a reference for self-checking.',
  },
  {
    name: 'Orienteering maps',
    description: 'Detailed maps showing terrain features using standard orienteering symbols and colors.',
    whereToGet: 'Commission from a local orienteering club mapper, or create with OpenOrienteeringMap (free online tool)',
    alternatives: 'Simplified hand-drawn maps for early lessons; aerial photo printouts with features labeled',
    usedIn: 'Map Walk, Score-O, Point-to-Point',
    learningConnection: 'Real orienteering maps are the end goal. Students progress from pattern maps (Geometric-O) to orienteering maps (Map Walk, Score-O).',
  },
  {
    name: 'Scorecards and pencils',
    description: 'Cards where students record which checkpoints they visited during Score-O.',
    whereToGet: 'Print from curriculum templates, or use index cards',
    alternatives: 'Small clipboards with blank paper, checkpoint stamp/hole punch systems',
    usedIn: 'Score-O, Poker-O, Poison-O',
    learningConnection: 'Scorecards add accountability. Students must record evidence of each visit, which reinforces careful navigation over rushed movement.',
  },
  {
    name: 'Whistle or gathering signal',
    description: 'A whistle, raised hand, flag, or other signal used to call students back.',
    whereToGet: 'PE equipment, outdoor stores',
    alternatives: 'Air horn, raised flag, countdown call, hand signals',
    usedIn: 'Gathering, all activities (for transitions)',
    learningConnection: 'The gathering signal trains divided attention. Students must stay aware of the signal while focused on their navigation task.',
  },
  {
    name: 'Whiteboard and markers',
    description: 'Used for map introduction in Geometric-O. The leader draws the checkpoint layout while students watch.',
    whereToGet: 'Classroom supplies',
    alternatives: 'Large paper pad on an easel, tablet screen-shared to a projector',
    usedIn: 'Geometric-O',
    learningConnection: 'The whiteboard introduction is where students first see a map being created.',
  },
  {
    name: 'Flags or pinnies',
    description: 'Colored cloth flags or mesh vests used for team identification.',
    whereToGet: 'PE equipment closet',
    alternatives: 'Bandanas, colored wristbands, different colored cones per team',
    usedIn: 'Capture the Flag, relay activities',
    learningConnection: 'Team identification supports territory and boundary concepts.',
  },
  {
    name: 'Animal pictures',
    description: 'Laminated pictures of animals attached to checkpoint cones.',
    whereToGet: 'Print and laminate from curriculum templates',
    alternatives: 'Stickers on cones, hand-drawn pictures, numbered cards (for older students)',
    usedIn: 'Animal-O, Explore & Find',
    learningConnection: 'Animal pictures make checkpoint confirmation concrete and fun. Checking "is this the right animal?" is the foundation of control confirmation.',
  },
  {
    name: 'Basketball court maps',
    description: 'Maps of a basketball court showing line markings, used for indoor orienteering.',
    whereToGet: 'Print from curriculum templates',
    alternatives: 'Hand-drawn maps of the gym floor',
    usedIn: 'Basketball-O, Pacman-O, Find the Cone',
    learningConnection: 'The basketball court\'s painted lines serve as built-in landmarks for indoor map reading.',
  },
  {
    name: 'Start/finish markers',
    description: 'Markers placed to indicate the start and finish of a course.',
    whereToGet: 'Use cones, flags, or tape',
    alternatives: 'Chalk marks, natural features',
    usedIn: 'Animal-O, Score-O, Point-to-Point',
    learningConnection: 'Clear start and finish points help students understand the structure of a course.',
  },
];

const keywordMap: Record<string, string> = {
  checkpoint: 'Checkpoint markers',
  clue: 'Clue sheets',
  cone: 'Cones',
  landmark: 'Colored landmark cones',
  colored: 'Colored landmark cones',
  pattern: 'Geometric-O maps',
  'geometric-o map': 'Geometric-O maps',
  master: 'Master map',
  orienteering: 'Orienteering maps',
  scorecard: 'Scorecards and pencils',
  whistle: 'Whistle or gathering signal',
  gathering: 'Whistle or gathering signal',
  whiteboard: 'Whiteboard and markers',
  flag: 'Flags or pinnies',
  pinnie: 'Flags or pinnies',
  animal: 'Animal pictures',
  'animal-picture checkpoint': 'Animal pictures',
  basketball: 'Basketball court maps',
  'start/finish': 'Start/finish markers',
};

const byName = new Map<string, MaterialInfo>();
for (const entry of materialEntries) {
  byName.set(entry.name.toLowerCase(), entry);
}

export function lookupMaterial(name: string): MaterialInfo | null {
  const key = name.toLowerCase().trim();

  // Exact match on canonical name
  const exact = byName.get(key);
  if (exact) return exact;

  // Keyword-based match: find the first keyword that appears in the input
  for (const [keyword, canonicalName] of Object.entries(keywordMap)) {
    if (key.includes(keyword)) {
      return byName.get(canonicalName.toLowerCase()) || null;
    }
  }

  return null;
}

export default materialEntries;
