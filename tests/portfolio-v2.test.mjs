import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { Script } from 'node:vm';

const html = await readFile(new URL('../demos/project-portfolio-v2.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../demos/portfolio-v2.css', import.meta.url), 'utf8');

test('portfolio v2 exposes two views with ownership and evidence near the top', () => {
  for (const id of ['projects-view', 'case-view', 'overview', 'brief', 'decisions', 'architecture', 'evidence', 'limits']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /id="case-view" hidden/);
  assert.match(html, /href="#overview">View case study/);
  assert.ok(html.indexOf('Results and evidence limits') < html.indexOf('id="brief"'));
  assert.match(html, /<html lang="en">/);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
});

test('every internal v2 link and section selector value resolves to a unique target', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const [, target] of html.matchAll(/\bhref="#([^"]+)"/g)) {
    assert.ok(ids.includes(target), `Missing target: ${target}`);
  }
  for (const [, section] of html.matchAll(/<option value="([^"]+)"/g)) {
    assert.match(html, new RegExp(`class="chapter" id="${section}"`));
  }
});

test('three decisions include tradeoffs, reversal conditions, evidence and retrospective alternatives', () => {
  const records = [...html.matchAll(/<article class="decision-record"[\s\S]*?<\/article>/g)];
  assert.equal(records.length, 3);
  for (const [record] of records) {
    for (const label of ['Requirement', 'Consequence', 'Tradeoff', 'Reconsider if', 'Evidence', 'Retrospective']) {
      assert.ok(record.includes(label), `Missing ${label}`);
    }
    assert.match(record, /data-section="decisions"/);
    assert.match(record, /https:\/\/github\.com\/Sugoigaku\/gaku-site\/commit\//);
  }
});

test('new owner constraints and evidence limits are not presented as historical measurements', () => {
  assert.match(html, /\$0-20 \/ month; minimize spend/);
  assert.match(html, /Owner-only MVP/);
  assert.match(html, /not presented as quantified requirements recorded before the original build/);
  assert.match(html, /not an independently hand-coded implementation/);
  assert.match(html, /no head-to-head benchmark or weighted selection study/);
  assert.match(html, /not a measured total-cost result/);
  assert.match(html, /No new production measurements or recovery exercises were performed/);
  assert.match(html, /downtime tolerance and recovery objective are not yet agreed/);
  assert.doesNotMatch(html, /<strong>\$0<\/strong>/);
});

test('architecture and risks distinguish deployment, runtime, and untested recovery', () => {
  assert.match(html, /DNS does not proxy page content/);
  assert.match(html, /Separate browser requests load Google Fonts/);
  assert.match(html, /Deployment credential boundary/);
  assert.match(html, /not into public content or the visitor's browser/);
  assert.match(html, /Feature branches do not trigger this production workflow/);
  assert.match(html, /Passing source assertions is not end-to-end validation/);
  assert.match(html, /Static does not mean failure-free/);
  assert.match(html, /Git history alone is not a tested recovery mechanism/);
});

test('v2 is file-compatible, accessible in structure, and uses safe external links', () => {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  assert.doesNotThrow(() => new Script(scripts[0][1]));
  assert.doesNotMatch(html, /<script[^>]+(?:src=|type="module")/);
  assert.match(html, /<label for="section-select">Section<\/label>/);
  assert.match(html, /aria-label="Case study sections"/);
  assert.match(css, /prefers-reduced-motion/);
  for (const [anchor] of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    assert.match(anchor, /rel="noopener noreferrer"/);
  }
  assert.doesNotMatch(html, /-----BEGIN .*PRIVATE KEY-----|\/subscriptions\/[0-9a-f-]{36}/i);
});

test('v2 reuses existing local images and its stylesheet', async () => {
  const assets = new Set([...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]));
  assets.add('portfolio-v2.css');
  for (const asset of assets) {
    const content = await readFile(new URL(`../demos/${asset}`, import.meta.url));
    assert.ok(content.length > 0);
  }
});