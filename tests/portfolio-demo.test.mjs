import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { Script } from 'node:vm';

const html = await readFile(new URL('../demos/project-portfolio.html', import.meta.url), 'utf8');

test('standalone portfolio demo contains the two views and five lifecycle chapters', () => {
  for (const id of ['projects-view', 'case-study-view', 'overview', 'discover', 'decide', 'build', 'deliver', 'operate']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /id="case-study-view" hidden/);
  assert.match(html, /href="#overview">View case study/);
  assert.match(html, /<html lang="en">/);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
});

test('every internal demo link resolves to a unique local target', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const [, target] of html.matchAll(/\bhref="#([^"]+)"/g)) {
    assert.ok(ids.includes(target), `Missing target: ${target}`);
  }
});

test('demo uses a file-compatible inline script and safe external links', () => {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  assert.doesNotThrow(() => new Script(scripts[0][1]));
  assert.doesNotMatch(html, /<script[^>]+(?:src=|type="module")/);
  for (const [anchor] of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    assert.match(anchor, /rel="noopener noreferrer"/);
  }
  assert.doesNotMatch(html, /-----BEGIN .*PRIVATE KEY-----|\/subscriptions\/[0-9a-f-]{36}/i);
});

test('case study differentiates production behavior from planned hardening', () => {
  assert.match(html, /Planned hardening/);
  assert.match(html, /Feature branches do not trigger this production workflow/);
  assert.match(html, /Domain renewal is separate/);
  assert.match(html, /not a guarantee or a replacement for a dedicated secret scanner/);
  assert.match(html, /AI-assisted, human-directed/);
  assert.match(html, /prefers-reduced-motion/);
  assert.match(html, /aria-label="Case study chapters"/);
  assert.match(html, /<label for="chapter-select">Chapter<\/label>/);
});

test('all demo images are available locally and the screenshot has the expected dimensions', async () => {
  const sources = new Set([...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]));
  for (const source of sources) {
    assert.ok(source.startsWith('assets/'));
    const image = await readFile(new URL(`../demos/${source}`, import.meta.url));
    assert.ok(image.length > 0);
    if (source.endsWith('.png')) {
      assert.equal(image.subarray(1, 4).toString(), 'PNG');
      assert.equal(image.readUInt32BE(16), 1440);
      assert.equal(image.readUInt32BE(20), 1000);
    }
  }
});