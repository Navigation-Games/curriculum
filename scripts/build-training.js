#!/usr/bin/env node

// Builds the teacher course from content/training/ into:
//
//   site/docs/training/*.md          the pages teachers read (generated, gitignored)
//   ai-advisor/training-units.json   what the course tutor needs for each unit
//                                    (committed, like site-map.md, because the
//                                    advisor's container is built from the repo)
//
// A unit file looks like this (see content/training/unit-0.md):
//
//   # 0 - Unit Title
//   ---
//   phase: 1
//   minutes: 25
//   deliverable: One line saying what the teacher makes
//   ---
//   ## Page               shown to teachers
//   ## What you'll make   shown to teachers
//   ## What we look for   shown to teachers (the rubric, in plain words)
//   ## Opening            the tutor's first message
//   ## Tutor              instructions for the AI tutor (not shown on the page)
//   ## Reviewer notes     for Navigation Games reviewers (not shown on the page)
//
// content/training/index.md is the course home. It has the same title and
// frontmatter format; its sections are all shown, followed by the unit list.
//
// Any of these files can add a short recording near the top of its page:
//
//   audio: training/unit-0-welcome.mp3          a file in site/static/audio/
//   audio_caption: A welcome from Barb (1 min)  shown above the player
//
// The pages are "unlisted" while the course is a prototype: they work by URL
// but stay out of the sidebar, site search and the advisor's site map.

const fs = require('fs');
const path = require('path');
const yaml = require(require.resolve('js-yaml', { paths: [path.join(__dirname, '..', 'site')] }));

const REPO_ROOT = path.join(__dirname, '..');
const CONTENT_DIR = path.join(REPO_ROOT, 'content', 'training');
const PAGES_DIR = path.join(REPO_ROOT, 'site', 'docs', 'training');
const TUTOR_DATA_PATH = path.join(REPO_ROOT, 'ai-advisor', 'training-units.json');

const REQUIRED_UNIT_SECTIONS = ['Page', "What you'll make", 'What we look for', 'Opening', 'Tutor'];
const AUDIO_DIR = path.join(REPO_ROOT, 'site', 'static', 'audio');

// The player for a page's recording, or [] if it has none
function audioPlayer(meta) {
  if (!meta.audio) return [];
  return [
    `<figure className="ng-page-audio">`,
    `  <figcaption>${meta.audio_caption || 'Listen'}</figcaption>`,
    `  <audio controls preload="metadata" src="/audio/${meta.audio}"></audio>`,
    `</figure>`,
    '',
  ];
}

function buildTraining() {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const errors = [];
  const units = fs.readdirSync(CONTENT_DIR)
    .filter(name => /^unit-\d+\.md$/.test(name))
    .map(name => parseFile(path.join(CONTENT_DIR, name)))
    .sort((a, b) => a.number - b.number);

  for (const unit of units) {
    for (const section of REQUIRED_UNIT_SECTIONS) {
      if (!unit.sections[section]) errors.push(`training/${unit.slug}.md: missing "## ${section}" section`);
    }
  }
  const home = parseFile(path.join(CONTENT_DIR, 'index.md'));
  for (const file of [home, ...units]) {
    if (file.meta.audio && !fs.existsSync(path.join(AUDIO_DIR, file.meta.audio))) {
      errors.push(`training/${file.slug || 'index'}.md: audio file site/static/audio/${file.meta.audio} not found`);
    }
  }
  if (errors.length) return errors;

  fs.rmSync(PAGES_DIR, { recursive: true, force: true });
  fs.mkdirSync(PAGES_DIR, { recursive: true });
  fs.writeFileSync(path.join(PAGES_DIR, 'index.md'), renderHome(home, units), 'utf8');
  units.forEach((unit, i) => {
    const page = renderUnit(unit, units[i - 1], units[i + 1]);
    fs.writeFileSync(path.join(PAGES_DIR, `${unit.slug}.md`), page, 'utf8');
  });

  fs.writeFileSync(TUTOR_DATA_PATH, JSON.stringify(tutorData(units), null, 2) + '\n', 'utf8');

  console.log(`  training course (${units.length} units) -> site/docs/training/, ai-advisor/training-units.json`);
  return [];
}


// ---------------------------------------------------------------------------
// Reading content files
// ---------------------------------------------------------------------------

function parseFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  const slug = path.basename(filePath, '.md');

  const heading = raw.match(/^# (.+)\n/);
  if (!heading) throw new Error(`${filePath}: the first line must be "# Title"`);
  const titleParts = heading[1].match(/^(\d+) - (.+)$/);

  const frontmatter = raw.match(/\n---\n([\s\S]*?)\n---\n/);
  const meta = frontmatter ? yaml.load(frontmatter[1]) || {} : {};
  const body = frontmatter ? raw.slice(frontmatter.index + frontmatter[0].length) : raw.slice(heading[0].length);

  return {
    slug,
    number: titleParts ? Number(titleParts[1]) : null,
    title: titleParts ? titleParts[2].trim() : heading[1].trim(),
    meta,
    sections: parseSections(body),
  };
}

// Splits a body on "## " headings, ignoring any inside ``` code fences.
function parseSections(body) {
  const sections = {};
  let current = null;
  let inFence = false;
  for (const line of body.split('\n')) {
    if (line.startsWith('```')) inFence = !inFence;
    const heading = !inFence && line.match(/^## (.+)$/);
    if (heading) {
      current = heading[1].trim();
      sections[current] = [];
    } else if (current) {
      sections[current].push(line);
    }
  }
  for (const name of Object.keys(sections)) sections[name] = sections[name].join('\n').trim();
  return sections;
}


// ---------------------------------------------------------------------------
// Writing pages
// ---------------------------------------------------------------------------

function unitHeading(unit) {
  return `Unit ${unit.number}: ${unit.title}`;
}

function lowerFirst(text) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function frontmatter(fields) {
  return '---\n' + yaml.dump(fields, { lineWidth: -1 }) + '---\n';
}

const GENERATED_NOTE = (source) =>
  `{/* AUTO-GENERATED from content/training/${source} by scripts/build-training.js. Do not edit directly. */}\n`;

function renderHome(home, units) {
  const lines = [
    frontmatter({ title: home.title, unlisted: true, hide_table_of_contents: true }),
    GENERATED_NOTE('index.md'),
    "import Link from '@docusaurus/Link';",
    '',
    `# ${home.title}`,
    '',
  ];
  if (home.meta.tagline) lines.push(`*${home.meta.tagline}*`, '');
  lines.push(...audioPlayer(home.meta));
  // A clear first step, repeated after the welcome text
  const startButton = units.length
    ? `<Link className="button button--primary button--lg" to="/training/${units[0].slug}/">Start with Unit ${units[0].number} →</Link>`
    : '';
  if (startButton) lines.push(startButton, '');
  for (const [name, text] of Object.entries(home.sections)) {
    lines.push(`## ${name}`, '', text, '');
  }
  lines.push('## Units', '');
  for (const unit of units) {
    // Relative links from an index page resolve to its children (see CLAUDE.md)
    lines.push(`- [${unitHeading(unit)}](./${unit.slug}) (about ${unit.meta.minutes} minutes). ${unit.meta.deliverable}.`);
  }
  if (startButton) lines.push('', startButton);
  return lines.join('\n') + '\n';
}

function renderUnit(unit, previous, next) {
  const s = unit.sections;
  const nav = [
    previous ? `[← ${unitHeading(previous)}](../${previous.slug})` : '[← Course home](../)',
    next ? `[${unitHeading(next)} →](../${next.slug})` : '[Course home →](../)',
  ].join(' · ');

  return [
    frontmatter({ title: unitHeading(unit), unlisted: true, hide_table_of_contents: true }),
    GENERATED_NOTE(`${unit.slug}.md`),
    "import TrainingTutor from '@site/src/components/TrainingTutor';",
    "import YouTube from '@site/src/components/YouTube';",
    '',
    `# ${unitHeading(unit)}`,
    '',
    `**About ${unit.meta.minutes} minutes.** You'll make: ${lowerFirst(unit.meta.deliverable)}.`,
    '',
    ...audioPlayer(unit.meta),
    s['Page'],
    '',
    "## What you'll make",
    '',
    s["What you'll make"],
    '',
    '## What we look for',
    '',
    s['What we look for'],
    '',
    '## Talk it through with the tutor',
    '',
    `<TrainingTutor unit=${JSON.stringify(unit.slug)} opening={${JSON.stringify(s['Opening'])}} />`,
    '',
    '---',
    '',
    nav,
    '',
  ].join('\n');
}


// ---------------------------------------------------------------------------
// Tutor data for the advisor backend
// ---------------------------------------------------------------------------

// Everything the tutor should know about a unit. Reviewer notes stay out:
// they are for Navigation Games staff, not the AI.
function tutorData(units) {
  const data = {};
  for (const unit of units) {
    data[unit.slug] = {
      title: unitHeading(unit),
      minutes: unit.meta.minutes,
      deliverable: unit.meta.deliverable,
      page: unit.sections['Page'],
      make: unit.sections["What you'll make"],
      look_for: unit.sections['What we look for'],
      opening: unit.sections['Opening'],
      instructions: unit.sections['Tutor'],
    };
  }
  return data;
}


if (require.main === module) {
  const errors = buildTraining();
  if (errors.length) {
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }
}

module.exports = { buildTraining, parseFile, parseSections, renderUnit, renderHome, tutorData };
