#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require(require.resolve('js-yaml', { paths: [path.join(__dirname, '..', 'site')] }));

const REPO_ROOT = path.join(__dirname, '..');
const DIRS = {
  activitiesContent: path.join(REPO_ROOT, 'content', 'activities'),
  activitiesOutput:  path.join(REPO_ROOT, 'site', 'docs', 'activities', 'core'),
  lessonsContent:    path.join(REPO_ROOT, 'content', 'lessons', 'school', 'grade-3-5'),
  lessonsOutput:     path.join(REPO_ROOT, 'site', 'docs', 'lessons', 'school', 'grade-3-5'),
};


// ===========================================================================
// Main
// ===========================================================================

function main() {
  const errors = [];
  const warnings = [];

  const activityMaterials = collectActivityMaterials(DIRS.activitiesContent);
  buildDir(DIRS.activitiesContent, DIRS.activitiesOutput, 'activity', errors, warnings, activityMaterials);
  buildDir(DIRS.lessonsContent, DIRS.lessonsOutput, 'lesson', errors, warnings, activityMaterials);

  if (warnings.length) {
    console.log(`\n  ${warnings.length} warning(s):`);
    for (const w of warnings) console.log(`    ${w}`);
  }

  if (errors.length) {
    console.error(`\n  ${errors.length} error(s):`);
    for (const e of errors) console.error(`    ${e}`);
    process.exit(1);
  }
}

function collectActivityMaterials(contentDir) {
  const map = {};
  if (!fs.existsSync(contentDir)) return map;

  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(contentDir, file), 'utf8');
    const titleMatch = raw.match(/^# (.+)\n/);
    const fmMatch = raw.match(/---\n([\s\S]*?)\n---/);
    if (!titleMatch || !fmMatch) continue;
    const fm = yaml.load(fmMatch[1]);
    const title = titleMatch[1].trim();
    if (fm.materials?.length) {
      map[title.toLowerCase()] = fm.materials;
    }
  }
  return map;
}

function buildDir(contentDir, outputDir, type, errors, warnings, activityMaterials) {
  if (!fs.existsSync(contentDir)) return;

  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
  if (files.length === 0) return;

  for (const file of files) {
    const slug = path.basename(file, '.md');
    const raw = fs.readFileSync(path.join(contentDir, file), 'utf8');

    try {
      const parsed = parseContentFile(raw, type);
      validate(slug, parsed, type, errors, warnings);

      const mdx = type === 'activity'
        ? generateActivityMDX(slug, parsed)
        : generateLessonMDX(slug, parsed, activityMaterials);

      const outputPath = path.join(outputDir, `${slug}.md`);
      fs.writeFileSync(outputPath, mdx, 'utf8');
      console.log(`  ${slug} -> ${path.relative(REPO_ROOT, outputPath)}`);
    } catch (err) {
      errors.push(`${file}: ${err.message}`);
    }
  }
}


// ===========================================================================
// Parsing (shared)
// ===========================================================================

function parseContentFile(raw, type) {
  const text = raw.replace(/\r\n/g, '\n');

  const titleMatch = text.match(/^# (.+)\n/);
  const titleFromHeading = titleMatch ? titleMatch[1].trim() : null;

  const fmMatch = text.match(/---\n([\s\S]*?)\n---/);
  if (!fmMatch) throw new Error('No frontmatter block found (need --- delimiters)');
  const fm = yaml.load(fmMatch[1]);

  if (titleFromHeading) fm.title = titleFromHeading;

  const bodyStart = text.indexOf(fmMatch[0]) + fmMatch[0].length;
  const body = text.slice(bodyStart).trim();

  const sections = parseSections(body);
  const goals = parseGoals(sections.goals || '', type);
  const vocabulary = type === 'activity'
    ? parseVocabulary(sections.vocabulary || '')
    : [];
  const steps = type === 'activity'
    ? parseSteps(sections.steps || '')
    : [];

  return { fm, sections, goals, vocabulary, steps };
}

function parseSections(body) {
  const sections = {};
  const parts = body.split(/^## /m);

  for (let i = 1; i < parts.length; i++) {
    const newlineIdx = parts[i].indexOf('\n');
    if (newlineIdx === -1) continue;
    const heading = parts[i].substring(0, newlineIdx).trim().toLowerCase();
    const content = parts[i].substring(newlineIdx + 1).trim();
    sections[heading] = content;
  }

  return sections;
}

function parseGoals(text, type) {
  if (!text) return { items: [], peStandards: '', notes: '' };

  // For lessons, split off PE Standards and orienteering goals subsections
  let goalsText = text;
  let peStandards = '';

  const peMatch = text.match(/### PE Standards[^\n]*\n([\s\S]*?)(?=###|$)/i);
  if (peMatch) {
    peStandards = peMatch[1].trim();
  }

  const oriMatch = text.match(/### Orienteering Goals\n([\s\S]*?)(?=###|$)/i);
  if (oriMatch) {
    goalsText = oriMatch[1].trim();
  }

  const items = [];
  const lines = goalsText.split('\n');
  const notes = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Short/Long format
    const shortMatch = line.match(/^-\s*Short:\s*(.+)$/);
    if (shortMatch) {
      const shortText = shortMatch[1].trim();
      i++;
      while (i < lines.length && lines[i].trim() === '') i++;
      const longMatch = lines[i]?.match(/^\s*Long:\s*(.+)$/);
      if (longMatch) {
        items.push({ short: shortText, long: longMatch[1].trim() });
        i++;
      } else {
        items.push({ short: shortText, long: shortText });
      }
      continue;
    }

    // Plain bullet (used in lessons)
    const plainMatch = line.match(/^-\s+(.+)$/);
    if (plainMatch && items.length === 0 || (plainMatch && !shortMatch)) {
      if (plainMatch) {
        items.push({ short: plainMatch[1].trim(), long: plainMatch[1].trim() });
        i++;
        continue;
      }
    }

    if (line.trim() === '') { i++; continue; }

    if (items.length > 0) {
      notes.push(line);
    }
    i++;
  }

  return { items, peStandards, notes: notes.join('\n').trim() };
}

function parseVocabulary(text) {
  if (!text) return [];
  const terms = [];
  const blocks = text.split(/\n\n+/).filter(b => b.trim());

  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines[0]?.startsWith('- ')) {
      const term = lines[0].slice(2).trim();
      const definition = lines.slice(1).map(l => l.trim()).join(' ');
      terms.push({ term, definition });
    }
  }

  return terms;
}

function parseSteps(text) {
  if (!text) return [];
  const items = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Numbered step with Short/Long format: "1. Short: ..."
    const shortMatch = line.match(/^\d+\.\s*Short:\s*(.+)$/);
    if (shortMatch) {
      const shortText = shortMatch[1].trim();
      i++;
      while (i < lines.length && lines[i].trim() === '') i++;
      const longMatch = lines[i]?.match(/^\s*Long:\s*(.+)$/);
      if (longMatch) {
        items.push({ short: shortText, long: longMatch[1].trim() });
        i++;
      } else {
        items.push({ short: shortText, long: shortText });
      }
      continue;
    }

    // Plain numbered step: "1. Step text"
    const plainMatch = line.match(/^\d+\.\s+(.+)$/);
    if (plainMatch) {
      items.push({ short: plainMatch[1].trim(), long: plainMatch[1].trim() });
      i++;
      continue;
    }

    i++;
  }

  return items;
}


// ===========================================================================
// Validation
// ===========================================================================

function validate(slug, { fm, sections, goals, vocabulary }, type, errors, warnings) {
  const file = `${slug}.md`;

  function err(msg) { errors.push(`${file}: ${msg}`); }
  function warn(msg) { warnings.push(`${file}: ${msg}`); }

  // Required frontmatter
  if (!fm.title) err("Missing 'title' (add a # heading at the top of the file)");
  if (!fm.tagline) err("Missing 'tagline' in frontmatter");
  if (fm.sidebar_position == null) warn("No 'sidebar_position' in frontmatter");

  if (type === 'activity') {
    if (!fm.time) warn("No 'time' in frontmatter");
    if (!fm.space) warn("No 'space' in frontmatter");
    if (!sections.description) err("Missing required section: ## Description");
    if (!sections.goals) err("Missing required section: ## Goals");
    if (!sections.steps) warn("No '## Steps' section");
    if (!sections.delivery) warn("No '## Delivery' section (needed for one-pager)");
    if (goals.items.length === 0) err("No goals found in ## Goals section");
    if (vocabulary.length === 0) warn("No vocabulary terms found in ## Vocabulary");
  }

  if (type === 'lesson') {
    if (!fm.time) warn("No 'time' in frontmatter");
    if (!sections.goals) err("Missing required section: ## Goals");
    if (!sections.delivery) err("Missing required section: ## Delivery");
    if (goals.items.length === 0) err("No goals found in ## Goals section");
  }

  // Check goals format
  for (let i = 0; i < goals.items.length; i++) {
    const g = goals.items[i];
    if (!g.short || !g.long) {
      err(`Goal ${i + 1} is missing Short: or Long: text`);
    }
  }
}


// ===========================================================================
// Delivery markdown -> JSX conversion
// ===========================================================================

function mdToJsx(text) {
  // Strip markdown links, keep text: [text](url) -> text
  let result = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Convert bold: **text** -> <strong>text</strong>
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return result;
}

function deliveryToJsx(text) {
  if (!text) return '';

  const lines = text.split('\n');
  const chunks = [];
  let i = 0;

  function peekNextNonBlank() {
    let j = i;
    while (j < lines.length && lines[j].trim() === '') j++;
    return j < lines.length ? lines[j] : null;
  }

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') { i++; continue; }

    // Numbered list with possible lettered sub-items
    if (/^\d+\.\s/.test(line)) {
      chunks.push('<ol>');
      while (i < lines.length) {
        if (lines[i] && lines[i].trim() === '') { i++; continue; }
        if (!/^\d+\.\s/.test(lines[i])) break;

        const itemText = mdToJsx(lines[i].replace(/^\d+\.\s*/, ''));
        i++;

        const next = peekNextNonBlank();
        if (next && /^[a-z]\.\s/.test(next)) {
          chunks.push(`  <li>${itemText}`);
          while (i < lines.length && lines[i].trim() === '') i++;
          chunks.push('    <ol type="a">');
          while (i < lines.length && /^[a-z]\.\s/.test(lines[i])) {
            chunks.push(`      <li>${mdToJsx(lines[i].replace(/^[a-z]\.\s*/, ''))}</li>`);
            i++;
          }
          chunks.push('    </ol>');
          chunks.push('  </li>');
        } else {
          chunks.push(`  <li>${itemText}</li>`);
        }
      }
      chunks.push('</ol>');
      continue;
    }

    // Standalone lettered list
    if (/^[a-z]\.\s/.test(line)) {
      chunks.push('<ol type="a">');
      while (i < lines.length && /^[a-z]\.\s/.test(lines[i])) {
        chunks.push(`  <li>${mdToJsx(lines[i].replace(/^[a-z]\.\s*/, ''))}</li>`);
        i++;
      }
      chunks.push('</ol>');
      continue;
    }

    // Paragraph
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^[a-z]\.\s/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    chunks.push(`<p>${mdToJsx(paraLines.join(' '))}</p>`);
  }

  return chunks.join('\n');
}


// ===========================================================================
// String helpers
// ===========================================================================

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function escSingleQuote(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function escAttr(s) {
  return s.replace(/"/g, '&quot;');
}


// ===========================================================================
// Activity MDX generation
// ===========================================================================

function generateActivityMDX(slug, { fm, sections, goals, vocabulary, steps }) {
  const L = [];

  // Frontmatter
  const activityTitle = `${fm.title} — Activity`;
  L.push('---');
  L.push(`title: "${escAttr(activityTitle)}"`);
  L.push(`sidebar_label: ${fm.title}`);
  if (fm.sidebar_position != null) L.push(`sidebar_position: ${fm.sidebar_position}`);
  if (fm.tags) L.push(`tags: [${fm.tags.join(', ')}]`);
  if (fm.time) L.push(`time: ${fm.time}`);
  if (fm.space) L.push(`space: ${fm.space}`);
  if (fm.materials?.length) {
    L.push('materials:');
    for (const m of fm.materials) L.push(`  - ${m}`);
  }
  if (fm.setup) L.push(`setup: ${fm.setup}`);
  if (vocabulary.length) {
    L.push('vocabulary:');
    for (const v of vocabulary) {
      L.push(`  - term: ${v.term}`);
      L.push(`    definition: ${v.definition}`);
    }
  }
  L.push('---');
  L.push('');

  L.push(`{/* AUTO-GENERATED from content/activities/${slug}.md — do not edit directly */}`);
  L.push('');

  // Imports
  L.push("import Tabs from '@theme/Tabs';");
  L.push("import TabItem from '@theme/TabItem';");
  L.push("import ActivityMeta from '@site/src/components/ActivityMeta';");
  L.push("import {ViewToggle, FullOnly, CompactOnly} from '@site/src/components/ViewToggle';");
  L.push("import OnePager from '@site/src/components/OnePager';");
  L.push("import Description from '@site/src/components/Description';");
  L.push("import VocabLink from '@site/src/components/VocabLink';");
  const hasVideos = fm.videos?.length > 0;
  if (hasVideos) {
    L.push("import YouTube from '@site/src/components/YouTube';");
    L.push("import CardGrid from '@site/src/components/CardGrid';");
  }
  L.push('');

  const desc = sections.description || '';
  L.push(`export const description = \`${esc(desc)}\`;`);
  L.push('');
  L.push('<ViewToggle />');
  L.push('');
  L.push('<FullOnly>');
  L.push('');

  // Floated images
  if (fm.images?.length) {
    L.push("<div style={{float:'right', margin:'0 0 1rem 1.5rem', maxWidth:'25%'}}>");
    for (const img of fm.images) {
      L.push("  <figure style={{margin:'0 0 0.75rem'}}>");
      L.push(`    <img src="${img.src}" alt="${escAttr(img.alt)}" style={{width:'100%', borderRadius:'6px'}} />`);
      if (img.caption) {
        L.push(`    <figcaption style={{fontSize:'0.85rem', color:'#666', marginTop:'0.25rem'}}>${img.caption}</figcaption>`);
      }
      L.push('  </figure>');
    }
    L.push('</div>');
    L.push('');
  }

  const subtitle = fm.subtitle ? ` (${fm.subtitle})` : '';
  L.push(`# ${activityTitle}${subtitle}`);
  L.push('');
  L.push(`**${fm.tagline}**`);
  L.push('');

  L.push('<ActivityMeta');
  L.push('  time={frontMatter.time}');
  L.push('  space={frontMatter.space}');
  L.push("  materials={frontMatter.materials}");
  L.push("  vocabulary={frontMatter.vocabulary.map(v => typeof v === 'object' ? v.term : v)}");
  L.push('/>');
  L.push('');

  if (fm.epigraph) {
    L.push(`> "${escAttr(fm.epigraph)}"`);
    L.push('');
  }

  L.push('<Description>{description}</Description>');
  L.push('');

  // Tabs
  L.push('<Tabs>');

  L.push('<TabItem value="goals" label="Learning Goals">');
  L.push('');
  L.push('Students completing this activity will be able to:');
  L.push('');
  for (const g of goals.items) L.push(`- ${g.long}`);
  if (goals.notes) { L.push(''); L.push(goals.notes); }
  L.push('');
  L.push('</TabItem>');

  L.push('<TabItem value="run" label="How to Run It" default>');
  L.push('');
  if (sections.setup) { L.push('### Setup'); L.push(''); L.push(sections.setup); L.push(''); }
  if (steps.length > 0) {
    L.push('### Steps'); L.push('');
    steps.forEach((s, i) => L.push(`${i + 1}. ${s.long}`));
    L.push('');
  }
  if (sections.progression) { L.push('### Progression'); L.push(''); L.push(sections.progression); L.push(''); }
  if (sections.tips) { L.push('### Tips'); L.push(''); L.push(sections.tips); L.push(''); }
  L.push('</TabItem>');

  if (sections.script) {
    L.push('<TabItem value="script" label="Script">');
    L.push('');
    L.push(sections.script);
    L.push('');
    L.push('</TabItem>');
  }

  L.push('<TabItem value="vocabulary" label="Vocabulary">');
  L.push('');
  L.push('{frontMatter.vocabulary.map(v => (');
  L.push('  <p key={v.term}><VocabLink term={v.term}><strong>{v.term}</strong></VocabLink>: {v.definition}</p>');
  L.push('))}');
  L.push('');
  L.push('See the [Glossary](/reference/glossary) for all curriculum terms.');
  L.push('');
  L.push('</TabItem>');

  if (sections.companions) {
    L.push('<TabItem value="companions" label="Companions">');
    L.push('');
    L.push(sections.companions);
    L.push('');
    L.push('</TabItem>');
  }

  L.push('</Tabs>');
  L.push('');

  if (fm.si_timing) {
    L.push(':::tip Electronic timing optional');
    L.push('See [Using SI Equipment](/equipment/si-timing) for setup instructions.');
    L.push(':::');
    L.push('');
  }

  if (hasVideos) {
    L.push('## Videos');
    L.push('');
    if (fm.videos.length === 1) {
      L.push(`<YouTube id="${fm.videos[0].id}" title="${escAttr(fm.videos[0].title)}" />`);
    } else {
      L.push('<CardGrid columns={3}>');
      for (const v of fm.videos) {
        L.push('  <div>');
        L.push(`    <YouTube id="${v.id}" title="${escAttr(v.title)}" />`);
        if (v.caption) L.push(`    <p style={{fontSize:'0.85rem', marginTop:'0.5rem'}}>${v.caption}</p>`);
        L.push('  </div>');
      }
      L.push('</CardGrid>');
    }
    L.push('');
  }

  L.push('</FullOnly>');
  L.push('');

  // Compact view
  L.push('<CompactOnly>');
  L.push('');

  const onepagerImage = fm.images?.find(img => img.onepager);
  L.push('<OnePager');
  L.push(`  title="${escAttr(activityTitle)}"`);
  L.push(`  tagline="${escAttr(fm.tagline)}"`);
  if (fm.epigraph) L.push(`  epigraph="${escAttr(fm.epigraph)}"`);
  L.push('  description={description}');
  if (onepagerImage) L.push(`  image="${onepagerImage.src}"`);
  L.push('  time={frontMatter.time}');
  L.push('  space={frontMatter.space}');
  L.push('  materials={frontMatter.materials}');
  L.push('  setup={frontMatter.setup}');
  L.push("  vocabulary={frontMatter.vocabulary.map(v => typeof v === 'object' ? v.term : v)}");

  L.push('  goals={[');
  for (const g of goals.items) L.push(`    '${escSingleQuote(g.short)}',`);
  L.push('  ]}');

  if (steps.length > 0) {
    L.push('  steps={[');
    for (const s of steps) L.push(`    '${escSingleQuote(s.short)}',`);
    L.push('  ]}');
  }

  if (sections.delivery) {
    const jsx = deliveryToJsx(sections.delivery);
    L.push('  delivery={');
    L.push('    <>');
    for (const line of jsx.split('\n')) L.push('      ' + line);
    L.push('    </>');
    L.push('  }');
  }

  emitStringArray(L, 'reflection', sections.reflection);
  emitStringArray(L, 'extensions', sections.extensions);

  L.push('/>');
  L.push('');
  L.push('</CompactOnly>');

  return L.join('\n') + '\n';
}


// ===========================================================================
// Lesson MDX generation
// ===========================================================================

function generateLessonMDX(slug, { fm, sections, goals }, activityMaterials = {}) {
  // Merge materials from referenced activities into the lesson's materials list.
  // Deduplicate by canonical material type so "4 colored landmark cones" and
  // "4 colored cones (red, blue, green, yellow)" aren't both listed.
  const lessonMaterials = fm.materials ? [...fm.materials] : [];
  if (fm.activities?.length) {
    const existingKeys = new Set(lessonMaterials.map(m => materialKey(m)));
    for (const a of fm.activities) {
      const actMats = activityMaterials[a.title.toLowerCase()];
      if (actMats) {
        for (const m of actMats) {
          const key = materialKey(m);
          if (!existingKeys.has(key)) {
            existingKeys.add(key);
            lessonMaterials.push(m);
          }
        }
      }
    }
  }
  fm.materials = lessonMaterials;

  const L = [];

  // Frontmatter
  const lessonTitle = `${fm.title} — Lesson Plan`;
  L.push('---');
  L.push(`title: "${escAttr(lessonTitle)}"`);
  L.push(`sidebar_label: "${escAttr(fm.title)}"`);
  if (fm.sidebar_position != null) L.push(`sidebar_position: ${fm.sidebar_position}`);
  L.push('---');
  L.push('');

  const contentPath = `content/lessons/school/grade-3-5/${slug}.md`;
  L.push(`{/* AUTO-GENERATED from ${contentPath} — do not edit directly */}`);
  L.push('');

  // Imports
  L.push("import ActivityCard from '@site/src/components/ActivityCard';");
  L.push("import CardGrid from '@site/src/components/CardGrid';");
  L.push("import MaterialLink from '@site/src/components/MaterialLink';");
  L.push("import VocabLink from '@site/src/components/VocabLink';");
  L.push("import {ViewToggle, FullOnly, CompactOnly} from '@site/src/components/ViewToggle';");
  L.push("import OnePager from '@site/src/components/OnePager';");
  L.push('');

  L.push('<ViewToggle />');
  L.push('');

  // ---- Full view ----
  L.push('<FullOnly>');
  L.push('');
  L.push(`# ${lessonTitle}`);
  L.push('');

  if (fm.epigraph) {
    L.push(`> "${escAttr(fm.epigraph)}"`);
    L.push('');
  }

  // Meta table
  L.push('| | |');
  L.push('|---|---|');
  if (fm.time) L.push(`| **Time** | ${fm.time} |`);
  if (fm.space) L.push(`| **Space** | ${fm.space} |`);
  if (fm.materials?.length) {
    const materialLinks = fm.materials.map(m => `<MaterialLink name="${escAttr(m)}" />`).join(', ');
    L.push(`| **Materials** | ${materialLinks} |`);
  }
  if (fm.setup) L.push(`| **Setup** | ${fm.setup} |`);
  if (fm.vocabulary?.length) {
    const vocabLinks = fm.vocabulary.map(v => `<VocabLink term="${escAttr(v)}" />`).join(', ');
    L.push(`| **Vocabulary** | ${vocabLinks} |`);
  }
  L.push('');

  // Activities
  if (fm.activities?.length) {
    L.push('## Activities');
    L.push('');
    const cols = fm.activities.length >= 3 ? 3 : 2;
    L.push(`<CardGrid columns={${cols}}>`);
    for (const a of fm.activities) {
      const parts = [`    title="${escAttr(a.title)}"`, `    description="${escAttr(a.description)}"`];
      if (a.link) parts.push(`    link="${a.link}"`);
      if (a.tag) parts.push(`    tag="${a.tag}"`);
      L.push('  <ActivityCard');
      for (const p of parts) L.push(p);
      L.push('  />');
    }
    L.push('</CardGrid>');
    L.push('');
  }

  // Extra content (appears between activities and goals in some lessons)
  if (sections['activities note']) {
    L.push(sections['activities note']);
    L.push('');
  }

  // Goals
  L.push('## Goals');
  L.push('');
  L.push('### Orienteering Goals');
  for (const g of goals.items) L.push(`- ${g.long}`);
  L.push('');
  if (goals.peStandards) {
    L.push('### PE Standards (SHAPE America)');
    L.push(goals.peStandards);
    L.push('');
  }

  // Delivery (markdown, passed through directly)
  if (sections.delivery) {
    L.push('## Delivery');
    L.push('');
    L.push(sections.delivery);
    L.push('');
  }

  // Reflection
  if (sections.reflection) {
    L.push('## Reflection');
    L.push('');
    L.push(sections.reflection);
    L.push('');
  }

  // Extensions
  if (sections.extensions) {
    L.push('## Extensions');
    L.push('');
    L.push(sections.extensions);
    L.push('');
  }

  L.push('</FullOnly>');
  L.push('');

  // ---- Compact view ----
  L.push('<CompactOnly>');
  L.push('');
  L.push('<OnePager');
  L.push('  variant="lesson"');
  L.push(`  title="${escAttr(lessonTitle)}"`);
  L.push(`  tagline="${escAttr(fm.tagline)}"`);
  if (fm.epigraph) L.push(`  epigraph="${escAttr(fm.epigraph)}"`);
  if (fm.time) L.push(`  time="${fm.time}"`);
  if (fm.space) L.push(`  space="${fm.space}"`);
  if (fm.materials?.length) {
    L.push(`  materials={[${fm.materials.map(m => `'${escSingleQuote(m)}'`).join(', ')}]}`);
  }
  if (fm.setup) L.push(`  setup="${escAttr(fm.setup)}"`);
  if (fm.vocabulary?.length) {
    L.push(`  vocabulary={[${fm.vocabulary.map(v => `'${escSingleQuote(v)}'`).join(', ')}]}`);
  }

  L.push('  goals={[');
  for (const g of goals.items) L.push(`    '${escSingleQuote(g.short)}',`);
  L.push('  ]}');

  // Compact delivery
  const compactDeliverySource = sections['compact delivery'] || sections.delivery;
  if (compactDeliverySource) {
    const jsx = deliveryToJsx(compactDeliverySource);
    L.push('  delivery={');
    L.push('    <>');
    for (const line of jsx.split('\n')) L.push('      ' + line);
    L.push('    </>');
    L.push('  }');
  }

  emitStringArray(L, 'reflection', sections.reflection);
  emitStringArray(L, 'extensions', sections.extensions);

  L.push('/>');
  L.push('');
  L.push('</CompactOnly>');

  return L.join('\n') + '\n';
}


// ===========================================================================
// Shared helpers
// ===========================================================================

const materialKeywords = [
  [/animal.*picture|animal.*checkpoint/i, 'animal-pictures'],
  [/checkpoint/i, 'checkpoint'],
  [/clue/i, 'clue-sheet'],
  [/landmark|colored.*cone/i, 'landmark-cones'],
  [/cone/i, 'cones'],
  [/geometric.*map|pattern.*map/i, 'geometric-maps'],
  [/master/i, 'master-map'],
  [/orienteering.*map/i, 'orienteering-maps'],
  [/scorecard/i, 'scorecards'],
  [/whistle|gathering.*signal|flag.*signal/i, 'whistle'],
  [/results.*whiteboard/i, 'results-whiteboard'],
  [/small.*whiteboard|whiteboard.*marker/i, 'small-whiteboard'],
  [/whiteboard/i, 'small-whiteboard'],
  [/pinnie|flag.*pinnie/i, 'pinnies'],
  [/basketball.*map|court.*map/i, 'basketball-maps'],
  [/start.*finish/i, 'start-finish'],
  [/route/i, 'route'],
];

function materialKey(name) {
  const lower = name.toLowerCase();
  for (const [pattern, key] of materialKeywords) {
    if (pattern.test(lower)) return key;
  }
  return lower;
}

function emitStringArray(L, prop, sectionText) {
  if (!sectionText) return;
  const items = sectionText.split('\n')
    .filter(l => l.startsWith('- '))
    .map(l => l.slice(2).trim());
  if (items.length) {
    L.push(`  ${prop}={[`);
    for (const item of items) L.push(`    '${escSingleQuote(item)}',`);
    L.push('  ]}');
  }
}


if (require.main === module) {
  main();
}

module.exports = {
  parseContentFile,
  parseSections,
  parseGoals,
  parseVocabulary,
  validate,
  deliveryToJsx,
  mdToJsx,
  generateActivityMDX,
  generateLessonMDX,
};
