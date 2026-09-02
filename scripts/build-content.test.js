#!/usr/bin/env node

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const {
  parseContentFile,
  parseGoals,
  parseVocabulary,
  validate,
  deliveryToJsx,
  mdToJsx,
  activityLinkify,
  generateActivityMDX,
  generateLessonMDX,
} = require('./build-content.js');

const REPO_ROOT = path.join(__dirname, '..');


// =========================================================================
// mdToJsx
// =========================================================================

describe('mdToJsx', () => {
  it('strips markdown links, keeps text', () => {
    assert.equal(
      mdToJsx('[**Boundary Run**](/activities/core/boundary-run): run the boundary'),
      '<strong>Boundary Run</strong>: run the boundary'
    );
  });

  it('converts bold to <strong>', () => {
    assert.equal(mdToJsx('**hello** world'), '<strong>hello</strong> world');
  });

  it('passes plain text through unchanged', () => {
    assert.equal(mdToJsx('just plain text'), 'just plain text');
  });
});


// =========================================================================
// deliveryToJsx
// =========================================================================

describe('deliveryToJsx', () => {
  it('converts numbered list to <ol>/<li>', () => {
    const input = '1. First step\n2. Second step';
    const jsx = deliveryToJsx(input);
    assert.ok(jsx.includes('<ol>'));
    assert.ok(jsx.includes('<li>First step</li>'));
    assert.ok(jsx.includes('<li>Second step</li>'));
    assert.ok(jsx.includes('</ol>'));
  });

  it('nests lettered sub-items inside numbered items', () => {
    const input = '1. Main step\na. Sub step A\nb. Sub step B\n2. Next step';
    const jsx = deliveryToJsx(input);
    assert.ok(jsx.includes('<ol type="a">'));
    assert.ok(jsx.includes('<li>Sub step A</li>'));
    assert.ok(jsx.includes('<li>Sub step B</li>'));
  });

  it('strips markdown links in delivery', () => {
    const input = '1. [**Boundary Run**](/activities/core/boundary-run): run it';
    const jsx = deliveryToJsx(input);
    assert.ok(jsx.includes('<strong>Boundary Run</strong>: run it'));
    assert.ok(!jsx.includes('['));
    assert.ok(!jsx.includes('](/'));
  });

  it('returns empty string for empty input', () => {
    assert.equal(deliveryToJsx(''), '');
    assert.equal(deliveryToJsx(null), '');
    assert.equal(deliveryToJsx(undefined), '');
  });
});


// =========================================================================
// parseGoals
// =========================================================================

describe('parseGoals', () => {
  it('parses Short/Long format', () => {
    const text = '- Short: Identifying landmarks\n  Long: Understand that landmarks are features in terrain';
    const result = parseGoals(text, 'activity');
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].short, 'Identifying landmarks');
    assert.equal(result.items[0].long, 'Understand that landmarks are features in terrain');
  });

  it('parses multiple Short/Long goals', () => {
    const text = [
      '- Short: Goal one short',
      '  Long: Goal one long version',
      '- Short: Goal two short',
      '  Long: Goal two long version',
    ].join('\n');
    const result = parseGoals(text, 'activity');
    assert.equal(result.items.length, 2);
    assert.equal(result.items[1].short, 'Goal two short');
  });

  it('parses plain bullets (lesson format)', () => {
    const text = '- Explore a space\n- Return on the gathering signal';
    const result = parseGoals(text, 'lesson');
    assert.equal(result.items.length, 2);
    assert.equal(result.items[0].short, 'Explore a space');
    assert.equal(result.items[0].long, 'Explore a space');
  });

  it('extracts PE Standards from lesson goals', () => {
    const text = [
      '### Orienteering Goals',
      '- Navigate the boundary',
      '',
      '### PE Standards (SHAPE America)',
      '- Demonstrate locomotor skills (S1.E1)',
    ].join('\n');
    const result = parseGoals(text, 'lesson');
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].short, 'Navigate the boundary');
    assert.ok(result.peStandards.includes('S1.E1'));
  });

  it('returns empty items for empty input', () => {
    const result = parseGoals('', 'activity');
    assert.equal(result.items.length, 0);
  });
});


// =========================================================================
// parseVocabulary
// =========================================================================

describe('parseVocabulary', () => {
  it('parses term + definition', () => {
    const text = '- Checkpoint\n  A marked location\n\n- Clue sheet\n  A list of checkpoints';
    const result = parseVocabulary(text);
    assert.equal(result.length, 2);
    assert.equal(result[0].term, 'Checkpoint');
    assert.equal(result[0].definition, 'A marked location');
    assert.equal(result[1].term, 'Clue sheet');
  });

  it('returns empty array for empty input', () => {
    assert.deepEqual(parseVocabulary(''), []);
    assert.deepEqual(parseVocabulary(null), []);
  });
});


// =========================================================================
// parseContentFile
// =========================================================================

describe('parseContentFile', () => {
  const minimalActivity = [
    '# Test Activity',
    '',
    '---',
    'tagline: A test activity',
    'sidebar_position: 1',
    'time: 10 minutes',
    'space: Gym',
    'materials:',
    '  - Cones',
    'setup: Place cones',
    '---',
    '',
    '## Description',
    '',
    'A test activity description.',
    '',
    '## Goals',
    '',
    '- Short: Test goal',
    '  Long: Understand the test goal fully',
    '',
    '## Vocabulary',
    '',
    '- Cone',
    '  A marker placed on the ground',
    '',
    '## Steps',
    '',
    '1. Do the thing',
    '',
    '## Delivery',
    '',
    '1. Run the boundary',
    '2. Do the activity',
  ].join('\n');

  it('extracts title from heading', () => {
    const result = parseContentFile(minimalActivity, 'activity');
    assert.equal(result.fm.title, 'Test Activity');
  });

  it('extracts frontmatter fields', () => {
    const result = parseContentFile(minimalActivity, 'activity');
    assert.equal(result.fm.tagline, 'A test activity');
    assert.equal(result.fm.time, '10 minutes');
    assert.equal(result.fm.space, 'Gym');
  });

  it('parses all sections', () => {
    const result = parseContentFile(minimalActivity, 'activity');
    assert.ok(result.sections.description);
    assert.ok(result.sections.goals);
    assert.ok(result.sections.vocabulary);
    assert.ok(result.sections.steps);
    assert.ok(result.sections.delivery);
  });

  it('parses goals', () => {
    const result = parseContentFile(minimalActivity, 'activity');
    assert.equal(result.goals.items.length, 1);
    assert.equal(result.goals.items[0].short, 'Test goal');
  });

  it('parses vocabulary', () => {
    const result = parseContentFile(minimalActivity, 'activity');
    assert.equal(result.vocabulary.length, 1);
    assert.equal(result.vocabulary[0].term, 'Cone');
  });

  it('throws on missing frontmatter', () => {
    assert.throws(
      () => parseContentFile('# Title\n\nNo frontmatter here', 'activity'),
      /No frontmatter block found/
    );
  });
});


// =========================================================================
// validate
// =========================================================================

describe('validate', () => {
  function runValidation(fm, sections, goals, vocabulary, type) {
    const errors = [];
    const warnings = [];
    validate('test', { fm, sections, goals, vocabulary }, type, errors, warnings);
    return { errors, warnings };
  }

  it('reports error for missing title', () => {
    const { errors } = runValidation(
      { tagline: 'x' },
      { description: 'x', goals: 'x', steps: 'x', delivery: 'x' },
      { items: [{ short: 'a', long: 'b' }], peStandards: '', notes: '' },
      [{ term: 'a', definition: 'b' }],
      'activity'
    );
    assert.ok(errors.some(e => e.includes('title')));
  });

  it('reports error for missing tagline', () => {
    const { errors } = runValidation(
      { title: 'x' },
      { description: 'x', goals: 'x', steps: 'x', delivery: 'x' },
      { items: [{ short: 'a', long: 'b' }], peStandards: '', notes: '' },
      [{ term: 'a', definition: 'b' }],
      'activity'
    );
    assert.ok(errors.some(e => e.includes('tagline')));
  });

  it('reports error for missing Description in activity', () => {
    const { errors } = runValidation(
      { title: 'x', tagline: 'y' },
      { goals: 'x' },
      { items: [{ short: 'a', long: 'b' }], peStandards: '', notes: '' },
      [{ term: 'a', definition: 'b' }],
      'activity'
    );
    assert.ok(errors.some(e => e.includes('Description')));
  });

  it('reports error for missing Delivery in lesson', () => {
    const { errors } = runValidation(
      { title: 'x', tagline: 'y' },
      { goals: 'x' },
      { items: [{ short: 'a', long: 'b' }], peStandards: '', notes: '' },
      [],
      'lesson'
    );
    assert.ok(errors.some(e => e.includes('Delivery')));
  });

  it('reports error for empty goals', () => {
    const { errors } = runValidation(
      { title: 'x', tagline: 'y' },
      { description: 'x', goals: 'x', delivery: 'x' },
      { items: [], peStandards: '', notes: '' },
      [],
      'activity'
    );
    assert.ok(errors.some(e => e.includes('No goals')));
  });

  it('warns for missing time', () => {
    const { warnings } = runValidation(
      { title: 'x', tagline: 'y' },
      { description: 'x', goals: 'x', steps: 'x', delivery: 'x' },
      { items: [{ short: 'a', long: 'b' }], peStandards: '', notes: '' },
      [{ term: 'a', definition: 'b' }],
      'activity'
    );
    assert.ok(warnings.some(w => w.includes('time')));
  });

  it('passes with all required fields', () => {
    const { errors } = runValidation(
      { title: 'x', tagline: 'y', time: '10 min', space: 'Gym', sidebar_position: 1 },
      { description: 'x', goals: 'x', steps: 'x', delivery: 'x' },
      { items: [{ short: 'a', long: 'b' }], peStandards: '', notes: '' },
      [{ term: 'a', definition: 'b' }],
      'activity'
    );
    assert.equal(errors.length, 0);
  });
});


// =========================================================================
// generateActivityMDX
// =========================================================================

describe('generateActivityMDX', () => {
  const parsed = {
    fm: {
      title: 'Test Activity',
      tagline: 'A test',
      sidebar_position: 1,
      time: '10 min',
      space: 'Gym',
      materials: ['Cones'],
      setup: 'Place cones',
    },
    sections: {
      description: 'A fun activity.',
      steps: '1. Run\n2. Jump',
      delivery: '1. Go\n2. Stop',
      reflection: '- Did you like it?\n- What was hard?',
      extensions: '- Try blindfolded',
    },
    goals: {
      items: [{ short: 'Run fast', long: 'Demonstrate running at high speed' }],
      peStandards: '',
      notes: '',
    },
    vocabulary: [{ term: 'Sprint', definition: 'Running at top speed' }],
    steps: [{ short: 'Run', long: 'Run' }, { short: 'Jump', long: 'Jump' }],
  };

  it('includes auto-generated comment', () => {
    const mdx = generateActivityMDX('test-activity', parsed);
    assert.ok(mdx.includes('AUTO-GENERATED'));
  });

  it('includes FullOnly and CompactOnly blocks', () => {
    const mdx = generateActivityMDX('test-activity', parsed);
    assert.ok(mdx.includes('<FullOnly>'));
    assert.ok(mdx.includes('</FullOnly>'));
    assert.ok(mdx.includes('<CompactOnly>'));
    assert.ok(mdx.includes('</CompactOnly>'));
  });

  it('includes ViewToggle', () => {
    const mdx = generateActivityMDX('test-activity', parsed);
    assert.ok(mdx.includes('<ViewToggle'));
  });

  it('includes OnePager with short goals', () => {
    const mdx = generateActivityMDX('test-activity', parsed);
    assert.ok(mdx.includes("'Run fast'"));
  });

  it('includes long goals in full view', () => {
    const mdx = generateActivityMDX('test-activity', parsed);
    assert.ok(mdx.includes('Demonstrate running at high speed'));
  });

  it('includes required imports', () => {
    const mdx = generateActivityMDX('test-activity', parsed);
    assert.ok(mdx.includes("import Tabs from '@theme/Tabs'"));
    assert.ok(mdx.includes("import OnePager from"));
    assert.ok(mdx.includes("import {ViewToggle"));
  });

  it('includes vocabulary in frontmatter', () => {
    const mdx = generateActivityMDX('test-activity', parsed);
    assert.ok(mdx.includes('vocabulary:'));
    assert.ok(mdx.includes('term: Sprint'));
  });
});


// =========================================================================
// generateLessonMDX
// =========================================================================

describe('generateLessonMDX', () => {
  const parsed = {
    fm: {
      title: '1 - Boundary',
      tagline: 'Here is where you can go',
      epigraph: 'In orienteering we stay inside a boundary',
      sidebar_position: 1,
      time: '15-30 minutes',
      space: 'Gym',
      materials: ['Cones'],
      setup: 'Walk the boundary',
      vocabulary: ['Boundary', 'Checkpoint'],
      activities: [
        { title: 'Boundary Run', description: 'Run the boundary.', link: '/activities/core/boundary-run', tag: 'core' },
      ],
    },
    sections: {
      goals: '### Orienteering Goals\n- Identify the boundary\n\n### PE Standards (SHAPE America)\n- Follow rules (S4.E1)',
      delivery: '1. [**Boundary Run**](/activities/core/boundary-run): run the boundary\n2. Quiz: inside or outside?',
      'compact delivery': '1. **Boundary Run**: run it\n2. Quiz',
      reflection: '- What does boundary mean?\n- How can crossing be dangerous?',
      extensions: '- Repeat at a faster pace\n- Travel with different movements',
    },
    goals: {
      items: [{ short: 'Identify the boundary', long: 'Identify the boundary' }],
      peStandards: '- Follow rules (S4.E1)',
      notes: '',
    },
    vocabulary: [],
  };

  it('includes auto-generated comment', () => {
    const mdx = generateLessonMDX('1-boundary', parsed);
    assert.ok(mdx.includes('AUTO-GENERATED'));
  });

  it('includes ActivityCard for referenced activities', () => {
    const mdx = generateLessonMDX('1-boundary', parsed);
    assert.ok(mdx.includes('<ActivityCard'));
    assert.ok(mdx.includes('Boundary Run'));
  });

  it('includes PE Standards in full view', () => {
    const mdx = generateLessonMDX('1-boundary', parsed);
    assert.ok(mdx.includes('PE Standards'));
    assert.ok(mdx.includes('S4.E1'));
  });

  it('uses compact delivery for OnePager when available', () => {
    const mdx = generateLessonMDX('1-boundary', parsed);
    const compactSection = mdx.split('<CompactOnly>')[1];
    assert.ok(compactSection.includes('run it'));
  });

  it('converts delivery activity links to ActivityLink popovers in full view', () => {
    const mdx = generateLessonMDX('1-boundary', parsed);
    const fullSection = mdx.split('<FullOnly>')[1].split('</FullOnly>')[0];
    assert.ok(fullSection.includes('<ActivityLink slug="boundary-run" name="Boundary Run"><strong>Boundary Run</strong></ActivityLink>'));
    assert.ok(mdx.includes("import ActivityLink from '@site/src/components/ActivityLink';"));
  });

  it('keeps compact (OnePager) delivery as plain markdown', () => {
    const mdx = generateLessonMDX('1-boundary', parsed);
    const compactSection = mdx.split('<CompactOnly>')[1];
    assert.ok(!compactSection.includes('<ActivityLink'));
  });

  it('includes meta table', () => {
    const mdx = generateLessonMDX('1-boundary', parsed);
    assert.ok(mdx.includes('| **Time** |'));
    assert.ok(mdx.includes('| **Space** |'));
  });

  it('includes OnePager with lesson variant', () => {
    const mdx = generateLessonMDX('1-boundary', parsed);
    assert.ok(mdx.includes('variant="lesson"'));
  });
});


// =========================================================================
// activityLinkify
// =========================================================================

describe('activityLinkify', () => {
  it('converts a plain activity link', () => {
    assert.equal(
      activityLinkify('[Gathering](/activities/core/gathering)'),
      '<ActivityLink slug="gathering" name="Gathering">Gathering</ActivityLink>'
    );
  });

  it('converts a bold activity link, emitting <strong>', () => {
    assert.equal(
      activityLinkify('[**Score-O**](/activities/core/score-o/)'),
      '<ActivityLink slug="score-o" name="Score-O"><strong>Score-O</strong></ActivityLink>'
    );
  });

  it('leaves links with anchors untouched', () => {
    const md = '[Hot or Cold](/activities/core/boundary-run#hot-or-cold)';
    assert.equal(activityLinkify(md), md);
  });

  it('leaves non-activity links untouched', () => {
    const md = '[Electronic Timing](/reference/equipment/electronic-timing)';
    assert.equal(activityLinkify(md), md);
  });
});


// =========================================================================
// Real content files: parse and generate without errors
// =========================================================================

describe('real content files', () => {
  const contentDirs = [
    { dir: path.join(REPO_ROOT, 'content', 'activities'), type: 'activity' },
    { dir: path.join(REPO_ROOT, 'content', 'lessons', 'grade-3-5'), type: 'lesson' },
  ];

  for (const { dir, type } of contentDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const slug = path.basename(file, '.md');

      it(`${type}: ${slug} parses without error`, () => {
        const raw = fs.readFileSync(path.join(dir, file), 'utf8');
        const parsed = parseContentFile(raw, type);
        assert.ok(parsed.fm.title, 'should have a title');
        assert.ok(parsed.goals.items.length > 0, 'should have at least one goal');
      });

      it(`${type}: ${slug} passes validation`, () => {
        const raw = fs.readFileSync(path.join(dir, file), 'utf8');
        const parsed = parseContentFile(raw, type);
        const errors = [];
        const warnings = [];
        validate(slug, parsed, type, errors, warnings);
        assert.equal(errors.length, 0, `Validation errors: ${errors.join('; ')}`);
      });

      it(`${type}: ${slug} generates valid MDX structure`, () => {
        const raw = fs.readFileSync(path.join(dir, file), 'utf8');
        const parsed = parseContentFile(raw, type);
        const mdx = type === 'activity'
          ? generateActivityMDX(slug, parsed)
          : generateLessonMDX(slug, parsed);

        assert.ok(mdx.includes('AUTO-GENERATED'), 'should have auto-generated comment');
        assert.ok(mdx.includes('<FullOnly>'), 'should have FullOnly block');
        assert.ok(mdx.includes('<CompactOnly>'), 'should have CompactOnly block');
        assert.ok(mdx.includes('<ViewToggle'), 'should have ViewToggle');

        const openFull = (mdx.match(/<FullOnly>/g) || []).length;
        const closeFull = (mdx.match(/<\/FullOnly>/g) || []).length;
        assert.equal(openFull, closeFull, 'FullOnly tags should be balanced');

        const openCompact = (mdx.match(/<CompactOnly>/g) || []).length;
        const closeCompact = (mdx.match(/<\/CompactOnly>/g) || []).length;
        assert.equal(openCompact, closeCompact, 'CompactOnly tags should be balanced');
      });
    }
  }
});
