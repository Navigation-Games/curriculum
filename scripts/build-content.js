#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require(require.resolve('js-yaml', { paths: [path.join(__dirname, '..', 'site')] }));

const REPO_ROOT = path.join(__dirname, '..');
const CONTENT_DIR = path.join(REPO_ROOT, 'content', 'activities');
const OUTPUT_DIR = path.join(REPO_ROOT, 'site', 'docs', 'activities', 'core');

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`Content directory not found: ${CONTENT_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    console.log('No content files found.');
    return;
  }

  for (const file of files) {
    const slug = path.basename(file, '.md');
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');

    try {
      const parsed = parseContentFile(raw);
      const mdx = generateMDX(slug, parsed);
      const outputPath = path.join(OUTPUT_DIR, `${slug}.md`);
      fs.writeFileSync(outputPath, mdx, 'utf8');
      console.log(`  ${slug} -> ${path.relative(REPO_ROOT, outputPath)}`);
    } catch (err) {
      console.error(`  ERROR in ${file}: ${err.message}`);
    }
  }
}


// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

function parseContentFile(raw) {
  const text = raw.replace(/\r\n/g, '\n');

  // Extract title from leading # heading
  const titleMatch = text.match(/^# (.+)\n/);
  const titleFromHeading = titleMatch ? titleMatch[1].trim() : null;

  // Extract frontmatter
  const fmMatch = text.match(/---\n([\s\S]*?)\n---/);
  if (!fmMatch) throw new Error('No frontmatter found');
  const fm = yaml.load(fmMatch[1]);

  if (titleFromHeading) fm.title = titleFromHeading;

  // Body is everything after the closing ---
  const bodyStart = text.indexOf(fmMatch[0]) + fmMatch[0].length;
  const body = text.slice(bodyStart).trim();

  const sections = parseSections(body);
  const goals = parseGoals(sections.goals || '');
  const vocabulary = parseVocabulary(sections.vocabulary || '');

  return { fm, sections, goals, vocabulary };
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

function parseGoals(text) {
  if (!text) return { items: [], notes: '' };

  const items = [];
  const lines = text.split('\n');
  let notes = [];
  let inGoal = false;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const shortMatch = line.match(/^-\s*Short:\s*(.+)$/);
    if (shortMatch) {
      inGoal = true;
      const shortText = shortMatch[1].trim();
      i++;
      // Look for Long: on the next non-empty line
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

    if (line.trim() === '') {
      i++;
      continue;
    }

    // Non-goal line after we've seen goals = notes
    if (items.length > 0) {
      notes.push(line);
    }
    i++;
  }

  return { items, notes: notes.join('\n').trim() };
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


// ---------------------------------------------------------------------------
// Delivery markdown -> JSX conversion
// ---------------------------------------------------------------------------

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

    // Numbered list (1. 2. 3.) with possible lettered sub-items
    if (/^\d+\.\s/.test(line)) {
      chunks.push('<ol>');
      while (i < lines.length) {
        // Skip blanks between items
        if (lines[i] && lines[i].trim() === '') { i++; continue; }
        if (!/^\d+\.\s/.test(lines[i])) break;

        const itemText = lines[i].replace(/^\d+\.\s*/, '');
        i++;

        // Check if lettered sub-items follow
        const next = peekNextNonBlank();
        if (next && /^[a-z]\.\s/.test(next)) {
          chunks.push(`  <li>${itemText}`);
          // Skip blanks to reach the lettered items
          while (i < lines.length && lines[i].trim() === '') i++;
          chunks.push('    <ol type="a">');
          while (i < lines.length && /^[a-z]\.\s/.test(lines[i])) {
            chunks.push(`      <li>${lines[i].replace(/^[a-z]\.\s*/, '')}</li>`);
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

    // Standalone lettered list (not preceded by a numbered item)
    if (/^[a-z]\.\s/.test(line)) {
      chunks.push('<ol type="a">');
      while (i < lines.length && /^[a-z]\.\s/.test(lines[i])) {
        chunks.push(`  <li>${lines[i].replace(/^[a-z]\.\s*/, '')}</li>`);
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
    chunks.push(`<p>${paraLines.join(' ')}</p>`);
  }

  return chunks.join('\n');
}


// ---------------------------------------------------------------------------
// MDX generation
// ---------------------------------------------------------------------------

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function escSingleQuote(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function generateMDX(slug, { fm, sections, goals, vocabulary }) {
  const L = [];

  // ---- Docusaurus frontmatter ----
  L.push('---');
  L.push(`title: ${fm.title}`);
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

  // ---- Auto-generated notice ----
  L.push(`{/* AUTO-GENERATED from content/activities/${slug}.md — do not edit directly */}`);
  L.push('');

  // ---- Imports ----
  L.push("import Tabs from '@theme/Tabs';");
  L.push("import TabItem from '@theme/TabItem';");
  L.push("import ActivityMeta from '@site/src/components/ActivityMeta';");
  L.push("import {ViewToggle, FullOnly, CompactOnly} from '@site/src/components/ViewToggle';");
  L.push("import OnePager from '@site/src/components/OnePager';");
  L.push("import Description from '@site/src/components/Description';");
  const hasVideos = fm.videos?.length > 0;
  if (hasVideos) {
    L.push("import YouTube from '@site/src/components/YouTube';");
    L.push("import CardGrid from '@site/src/components/CardGrid';");
  }
  L.push('');

  // ---- Description export ----
  const desc = sections.description || '';
  L.push(`export const description = \`${esc(desc)}\`;`);
  L.push('');

  // ---- ViewToggle ----
  L.push('<ViewToggle />');
  L.push('');

  // ---- FullOnly ----
  L.push('<FullOnly>');
  L.push('');

  // Floated images
  if (fm.images?.length) {
    L.push("<div style={{float:'right', margin:'0 0 1rem 1.5rem', maxWidth:'25%'}}>");
    for (const img of fm.images) {
      L.push("  <figure style={{margin:'0 0 0.75rem'}}>");
      L.push(`    <img src="${img.src}" alt="${img.alt}" style={{width:'100%', borderRadius:'6px'}} />`);
      if (img.caption) {
        L.push(`    <figcaption style={{fontSize:'0.85rem', color:'#666', marginTop:'0.25rem'}}>${img.caption}</figcaption>`);
      }
      L.push('  </figure>');
    }
    L.push('</div>');
    L.push('');
  }

  // Title
  const subtitle = fm.subtitle ? ` (${fm.subtitle})` : '';
  L.push(`# ${fm.title}${subtitle}`);
  L.push('');
  L.push(`**${fm.tagline}**`);
  L.push('');

  // ActivityMeta
  L.push('<ActivityMeta');
  L.push('  time={frontMatter.time}');
  L.push('  space={frontMatter.space}');
  L.push("  materials={frontMatter.materials.join(', ')}");
  L.push("  vocabulary={frontMatter.vocabulary.map(v => typeof v === 'object' ? v.term : v)}");
  L.push('/>');
  L.push('');

  // Epigraph
  if (fm.epigraph) {
    L.push(`> "${fm.epigraph}"`);
    L.push('');
  }

  // Description
  L.push('<Description>{description}</Description>');
  L.push('');

  // ---- Tabs ----
  L.push('<Tabs>');

  // Goals tab
  L.push('<TabItem value="goals" label="Learning Goals">');
  L.push('');
  L.push('Students completing this activity will be able to:');
  L.push('');
  for (const g of goals.items) {
    L.push(`- ${g.long}`);
  }
  if (goals.notes) {
    L.push('');
    L.push(goals.notes);
  }
  L.push('');
  L.push('</TabItem>');

  // How to Run It tab
  L.push('<TabItem value="run" label="How to Run It" default>');
  L.push('');
  if (sections.setup) {
    L.push('### Setup');
    L.push('');
    L.push(sections.setup);
    L.push('');
  }
  if (sections.steps) {
    L.push('### Steps');
    L.push('');
    L.push(sections.steps);
    L.push('');
  }
  if (sections.progression) {
    L.push('### Progression');
    L.push('');
    L.push(sections.progression);
    L.push('');
  }
  if (sections.tips) {
    L.push('### Tips');
    L.push('');
    L.push(sections.tips);
    L.push('');
  }
  L.push('</TabItem>');

  // Script tab
  if (sections.script) {
    L.push('<TabItem value="script" label="Script">');
    L.push('');
    L.push(sections.script);
    L.push('');
    L.push('</TabItem>');
  }

  // Vocabulary tab
  L.push('<TabItem value="vocabulary" label="Vocabulary">');
  L.push('');
  L.push('{frontMatter.vocabulary.map(v => (');
  L.push('  <p key={v.term}><strong>{v.term}</strong>: {v.definition}</p>');
  L.push('))}');
  L.push('');
  L.push('See the [Glossary](/reference/glossary) for all curriculum terms.');
  L.push('');
  L.push('</TabItem>');

  // Companions tab
  if (sections.companions) {
    L.push('<TabItem value="companions" label="Companions">');
    L.push('');
    L.push(sections.companions);
    L.push('');
    L.push('</TabItem>');
  }

  L.push('</Tabs>');
  L.push('');

  // SI timing tip
  if (fm.si_timing) {
    L.push(':::tip Electronic timing optional');
    L.push('See [Using SI Equipment](/equipment/si-timing) for setup instructions.');
    L.push(':::');
    L.push('');
  }

  // Videos
  if (hasVideos) {
    L.push('## Videos');
    L.push('');
    if (fm.videos.length === 1) {
      const v = fm.videos[0];
      L.push(`<YouTube id="${v.id}" title="${v.title}" />`);
    } else {
      L.push('<CardGrid columns={3}>');
      for (const v of fm.videos) {
        L.push('  <div>');
        L.push(`    <YouTube id="${v.id}" title="${v.title}" />`);
        if (v.caption) {
          L.push(`    <p style={{fontSize:'0.85rem', marginTop:'0.5rem'}}>${v.caption}</p>`);
        }
        L.push('  </div>');
      }
      L.push('</CardGrid>');
    }
    L.push('');
  }

  L.push('</FullOnly>');
  L.push('');

  // ---- CompactOnly ----
  L.push('<CompactOnly>');
  L.push('');

  // OnePager component
  const onepagerImage = fm.images?.find(img => img.onepager);
  L.push('<OnePager');
  L.push(`  title="${fm.title}"`);
  L.push(`  tagline="${fm.tagline}"`);
  if (fm.epigraph) L.push(`  epigraph="${fm.epigraph}"`);
  L.push('  description={description}');
  if (onepagerImage) L.push(`  image="${onepagerImage.src}"`);
  L.push('  time={frontMatter.time}');
  L.push('  space={frontMatter.space}');
  L.push('  materials={frontMatter.materials}');
  L.push('  setup={frontMatter.setup}');
  L.push("  vocabulary={frontMatter.vocabulary.map(v => typeof v === 'object' ? v.term : v)}");

  // Goals (short versions)
  L.push('  goals={[');
  for (const g of goals.items) {
    L.push(`    '${escSingleQuote(g.short)}',`);
  }
  L.push('  ]}');

  // Delivery
  if (sections.delivery) {
    const jsx = deliveryToJsx(sections.delivery);
    L.push('  delivery={');
    L.push('    <>');
    for (const line of jsx.split('\n')) {
      L.push('      ' + line);
    }
    L.push('    </>');
    L.push('  }');
  }

  // Reflection
  if (sections.reflection) {
    const items = sections.reflection.split('\n')
      .filter(l => l.startsWith('- '))
      .map(l => l.slice(2).trim());
    if (items.length) {
      L.push('  reflection={[');
      for (const r of items) L.push(`    '${escSingleQuote(r)}',`);
      L.push('  ]}');
    }
  }

  // Extensions
  if (sections.extensions) {
    const items = sections.extensions.split('\n')
      .filter(l => l.startsWith('- '))
      .map(l => l.slice(2).trim());
    if (items.length) {
      L.push('  extensions={[');
      for (const e of items) L.push(`    '${escSingleQuote(e)}',`);
      L.push('  ]}');
    }
  }

  L.push('/>');
  L.push('');
  L.push('</CompactOnly>');

  return L.join('\n') + '\n';
}


main();
