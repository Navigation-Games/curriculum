#!/usr/bin/env node

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { parseFile, parseSections, renderUnit, tutorData } = require('./build-training.js');

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'training');
const unitFiles = fs.readdirSync(CONTENT_DIR).filter(name => /^unit-\d+\.md$/.test(name));
const units = unitFiles.map(name => parseFile(path.join(CONTENT_DIR, name)));


describe('parseSections', () => {
  it('splits on ## headings', () => {
    const sections = parseSections('## Page\nHello\n\n## Tutor\nBe kind');
    assert.deepEqual(sections, { Page: 'Hello', Tutor: 'Be kind' });
  });

  it('ignores ## lines inside code fences', () => {
    const sections = parseSections('## Tutor\n```\n## not a heading\n```\nAfter');
    assert.deepEqual(Object.keys(sections), ['Tutor']);
    assert.match(sections.Tutor, /## not a heading/);
  });
});


describe('training content files', () => {
  it('there is at least one unit', () => {
    assert.ok(units.length > 0);
  });

  for (const unit of units) {
    describe(unit.slug, () => {
      it('has a numbered title like "# 0 - Title"', () => {
        assert.equal(typeof unit.number, 'number');
        assert.ok(unit.title.length > 0);
      });

      it('has minutes and a deliverable in its frontmatter', () => {
        assert.equal(typeof unit.meta.minutes, 'number');
        assert.ok(unit.meta.deliverable);
      });

      for (const section of ['Page', "What you'll make", 'What we look for', 'Opening', 'Tutor', 'Reviewer notes']) {
        it(`has a "## ${section}" section`, () => {
          assert.ok(unit.sections[section], `missing ## ${section}`);
        });
      }

      it('uses no em-dashes', () => {
        const raw = fs.readFileSync(path.join(CONTENT_DIR, `${unit.slug}.md`), 'utf8');
        assert.ok(!raw.includes('—'), 'replace em-dashes with other punctuation');
      });
    });
  }
});


describe('renderUnit', () => {
  const unit = units[0];
  const page = renderUnit(unit, undefined, units[1]);

  it('is unlisted while the course is a prototype', () => {
    assert.match(page, /^---\n[\s\S]*unlisted: true/);
  });

  it('includes the tutor with its opening message', () => {
    assert.match(page, new RegExp(`<TrainingTutor unit="${unit.slug}" opening=\\{`));
  });

  it('leaves the tutor instructions and reviewer notes off the page', () => {
    assert.ok(!page.includes('## Tutor'));
    assert.ok(!page.includes('## Reviewer notes'));
    assert.ok(!page.includes(unit.sections['Reviewer notes']));
  });

  it('adds a player when the unit has a recording', () => {
    const withAudio = { ...unit, meta: { ...unit.meta, audio: 'training/test.mp3', audio_caption: 'A welcome from Barb' } };
    const audioPage = renderUnit(withAudio, undefined, units[1]);
    assert.match(audioPage, /<figcaption>A welcome from Barb<\/figcaption>/);
    assert.match(audioPage, /<audio controls preload="metadata" src="\/audio\/training\/test.mp3"><\/audio>/);
    assert.ok(!page.includes('<audio'));
  });
});


describe('tutorData', () => {
  it('gives the tutor its instructions but not the reviewer notes', () => {
    const data = tutorData(units);
    for (const unit of units) {
      assert.equal(data[unit.slug].instructions, unit.sections['Tutor']);
      assert.ok(!JSON.stringify(data[unit.slug]).includes(unit.sections['Reviewer notes']));
    }
  });
});
