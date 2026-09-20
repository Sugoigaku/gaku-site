import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const home = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const projectIndex = await readFile(new URL('../dist/projects/index.html', import.meta.url), 'utf8');
const page = await readFile(new URL('../dist/projects/gaku-site/index.html', import.meta.url), 'utf8');

test('About keeps work history but links to projects on a separate page', () => {
  assert.match(home, /href="\/projects\/"[^>]*>Project<\/a>/);
  assert.doesNotMatch(home, /id="projects"|href="#projects"|class="project-preview"/);
  assert.match(home, /id="experience"/);
  assert.match(home, /03 \/ Contact/);
  assert.equal([...projectIndex.matchAll(/<h1\b/g)].length, 1);
  assert.match(projectIndex, /<h2\b[^>]*>Gaku Personal Website<\/h2>/);
  assert.match(projectIndex, /href="\/projects\/gaku-site\/"/);
  assert.match(projectIndex, /src="\/projects\/gaku-site-desktop\.png"/);
  assert.match(projectIndex, /Gaku Personal Website/);
});

test('main navigation has the same four ordered links on every page', async () => {
  const knowledge = await readFile(new URL('../dist/knowledge/index.html', import.meta.url), 'utf8');
  for (const document of [home, knowledge, projectIndex, page]) {
    const nav = document.match(/<nav\b[^>]*aria-label="Main navigation"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
    assert.ok(nav, 'Missing main navigation');
    const links = [...nav.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g)];
    assert.deepEqual(links.map(match => match[2]), ['About', 'Knowledge', 'Project', 'Contact']);
    assert.deepEqual(links.map(match => match[1]), [
      document === home ? '#about' : '/#about',
      '/knowledge/',
      '/projects/',
      document === home ? '#contact' : '/#contact',
    ]);
  }
});

test('case study is a discoverable static route with three ordered sections', () => {
  assert.match(page, /<html lang="en"[^>]*>/);
  assert.equal([...page.matchAll(/<h1\b/g)].length, 1);
  assert.match(page, /<title>Gaku Personal Website \| Gaku Chen<\/title>/);
  assert.match(page, /rel="canonical" href="https:\/\/www\.gakuchen\.com\/projects\/gaku-site\/"/);
  assert.match(page, /property="og:image" content="https:\/\/www\.gakuchen\.com\/projects\/gaku-site-desktop\.png"/);
  assert.doesNotMatch(page, /noindex|case-view|projects-view/);
  assert.equal([...page.matchAll(/<section\b[^>]*\bdata-chapter\b/g)].length, 3);
  let previous = -1;
  for (const section of ['build', 'decisions', 'next']) {
    const position = page.indexOf(`id="${section}"`);
    assert.ok(position > previous, `Missing or out-of-order section: ${section}`);
    previous = position;
  }
  assert.match(page, /href="\/projects\/"/);
  assert.doesNotMatch(page, /href="\/#projects"/);
});

test('case-study anchors, labels and mobile options resolve to unique static targets', () => {
  const ids = [...page.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const [, id] of page.matchAll(/(?:href="#|aria-labelledby=")([^"]+)"/g)) {
    assert.ok(ids.includes(id), `Missing target ${id}`);
  }
  for (const [, id] of page.matchAll(/<option value="([^"]+)"/g)) assert.ok(ids.includes(id));
  assert.match(page, /for="section-select"/);
  assert.match(page, /<noscript>/);
});

test('case study retains concise decisions, delivery details and honest future work', () => {
  for (const topic of ['Astro', 'TypeScript', 'Markdown', 'GitHub Actions', 'Bicep', 'GitHub Secrets', 'application workflow deploys files separately']) {
    assert.ok(page.includes(topic), `Missing ${topic}`);
  }
  const decisions = [...page.matchAll(/<article class="decision-record"[\s\S]*?<\/article>/g)];
  assert.equal(decisions.length, 3);
  for (const [record] of decisions) {
    for (const label of ['My choice', 'Why', 'Tradeoff']) assert.ok(record.includes(label));
    assert.match(record, /https:\/\/github.com\/Sugoigaku\/gaku-site\/commit\//);
    assert.ok(record.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length <= 110);
  }
  assert.match(page, /GitHub Copilot: code, tests &amp; deployment/);
  assert.match(page, /\$0-20 \/ month; minimize spend/);
  assert.match(page, /Planned work, not implemented features/);
  assert.match(page, /Recovery has not been rehearsed; an uptime target is not yet set/);
  assert.doesNotMatch(page, /<details\b/);
});

test('portfolio assets are deployed and external links do not expose credentials', async () => {
  const preview = projectIndex.slice(projectIndex.indexOf('id="projects"'), projectIndex.indexOf('</main>'));
  for (const html of [preview, page]) {
    for (const [, src] of html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
      assert.ok((await readFile(new URL(`../dist${src}`, import.meta.url))).length > 0);
    }
    for (const [anchor] of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(anchor, /rel="noopener noreferrer"/);
    assert.doesNotMatch(html, /(?:api[_-]?key|password|secret|token)\s*[:=]\s*["'][^"']+|-----BEGIN .*PRIVATE KEY-----/i);
    assert.doesNotMatch(html, /demos\//);
  }
});

test('production portfolio stays within the approved combined copy budget', () => {
  const preview = projectIndex.slice(projectIndex.indexOf('id="projects"'), projectIndex.indexOf('</main>'));
  const article = page.slice(page.indexOf('<article class="portfolio">'), page.indexOf('</main>'));
  const words = (preview + article).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]*>/g, ' ').trim().split(/\s+/);
  assert.ok(words.length <= 950, `Portfolio copy exceeds the 950-word budget: ${words.length}`);
});

test('production documentation replaces demo references and distinguishes deployment', async () => {
  const product = await readFile(new URL('../PRODUCT_DESIGN.md', import.meta.url), 'utf8');
  const technical = await readFile(new URL('../TECHNICAL_DESIGN.md', import.meta.url), 'utf8');
  assert.match(product, /src\/pages\/projects\/gaku-site\.astro/);
  assert.match(product, /Production deployment is a separate step/);
  assert.match(product, /### Knowledge/);
  assert.match(product, /The first public technical wiki articles are included/);
  assert.match(product, /src\/pages\/projects\/index\.astro/);
  assert.match(product, /About, Knowledge, Project, Contact/);
  assert.match(product, /Experience remains in the profile body but has no top-level navigation entry/);
  assert.doesNotMatch(product, /Public wiki, investment notes|Technical wiki articles and investment reflections may be added|Add a Projects preview to the homepage/);
  assert.match(technical, /Project Portfolio Implementation/);
  assert.match(technical, /without JavaScript/i);
  for (const document of [product, technical]) assert.doesNotMatch(document, /demos\/project-portfolio/);
});

test('standalone demos are retired and the screenshot remains a valid production asset', async () => {
  await assert.rejects(access(new URL('../demos/', import.meta.url)), { code: 'ENOENT' });
  const screenshot = await readFile(new URL('../dist/projects/gaku-site-desktop.png', import.meta.url));
  assert.equal(screenshot.subarray(1, 4).toString(), 'PNG');
  assert.equal(screenshot.readUInt32BE(16), 1440);
  assert.equal(screenshot.readUInt32BE(20), 1000);
});