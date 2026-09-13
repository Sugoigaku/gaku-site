import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { Script } from 'node:vm';

const html = await readFile(new URL('../demos/project-portfolio-v2.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../demos/portfolio-v2.css', import.meta.url), 'utf8');

test('portfolio explains the project and delivery before decisions and next steps', () => {
  for (const id of ['projects-view', 'case-view', 'overview', 'build', 'decisions', 'next']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /id="case-view" hidden/);
  assert.match(html, /href="#overview">View case study/);
  assert.equal([...html.matchAll(/class="chapter"/g)].length, 3);
  assert.ok(html.indexOf('id="build"') < html.indexOf('id="decisions"'));
  assert.ok(html.indexOf('id="decisions"') < html.indexOf('id="next"'));
  const build = html.split('id="build"')[1].split('id="decisions"')[0];
  for (const topic of ['Astro', 'TypeScript', 'Markdown', 'Git', 'GitHub Actions', 'Bicep', 'Static Web Apps']) {
    assert.ok(build.includes(topic), `Missing project technology: ${topic}`);
  }
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

test('three concise decisions explain the owner choice, reason and tradeoff', () => {
  const records = [...html.matchAll(/<article class="decision-record"[\s\S]*?<\/article>/g)];
  assert.equal(records.length, 3);
  for (const [record] of records) {
    for (const label of ['My choice', 'Why', 'Tradeoff']) {
      assert.ok(record.includes(label), `Missing ${label}`);
    }
    assert.match(record, /data-section="decisions"/);
    assert.match(record, /https:\/\/github\.com\/Sugoigaku\/gaku-site\/commit\//);
    assert.ok(record.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length <= 110);
  }
});

test('project copy stays concise without hiding content in accordions', () => {
  const body = html.split('<body>')[1].split('<script>')[0];
  const words = body.replace(/<[^>]*>/g, ' ').trim().split(/\s+/);
  assert.ok(words.length <= 950, `Copy exceeds the 950-word budget: ${words.length}`);
  assert.doesNotMatch(body, /<details\b/);
  assert.match(html, /A professional profile and a public library of technical articles/);
  assert.match(html, /aria-label="Technology stack"/);
});

test('owner contribution and budget remain accurate after shortening', () => {
  assert.match(html, /\$0-20 \/ month; minimize spend/);
  assert.match(html, /Current budget/);
  assert.match(html, /Scope, architecture decisions &amp; review/);
  assert.match(html, /GitHub Copilot: code, tests &amp; deployment/);
  assert.match(html, /Copilot proposed Astro/);
  assert.match(html, /Domain renewal is separate; Free hosting is not a measured total bill/);
  assert.doesNotMatch(html, /<strong>\$0<\/strong>/);
});

test('delivery and future work distinguish current behavior from planned improvements', () => {
  assert.match(html, /Initial work used main; this portfolio is isolated on a feature branch/);
  assert.match(html, /Updates to main, or manual dispatch/);
  assert.match(html, /deployment token stays in GitHub Secrets/);
  assert.match(html, /application workflow deploys files separately/);
  assert.match(html, /CI runs on releases, not on page requests/);
  const next = html.split('id="next"')[1];
  for (const topic of ['Planned work, not implemented', 'pull-request checks', 'DNS, TLS or hosting failure', 'selective publishing', 'costs and service limits', 'private state']) {
    assert.ok(next.includes(topic), `Missing future concern: ${topic}`);
  }
  assert.match(next, /Recovery has not been rehearsed; an uptime target is not yet set/);
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

test('product design records the approved portfolio without claiming production integration', async () => {
  const design = await readFile(new URL('../PRODUCT_DESIGN.md', import.meta.url), 'utf8');
  assert.match(design, /\[portfolio demo\]\(demos\/project-portfolio-v2\.html\)/);
  assert.match(design, /integration into the live site is not yet implemented/);
  const headings = ['### 1. Project & Delivery', '### 2. Key Decisions', "### 3. What's Next"];
  let previousPosition = -1;
  for (const heading of headings) {
    const position = design.indexOf(heading);
    assert.ok(position > previousPosition, `Missing or out-of-order section: ${heading}`);
    previousPosition = position;
  }
  assert.match(design, /My choice \/ Why \/ Tradeoff/);
  assert.match(design, /950-word budget/);
  assert.match(design, /clearly labeled as planned/);
  assert.match(design, /GitHub Copilot's implementation assistance/);
});