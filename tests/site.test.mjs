import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

test('renders the required MVP sections', () => {
  for (const section of ['top', 'about', 'experience', 'contact']) {
    assert.match(html, new RegExp(`id="${section}"`));
  }
  assert.equal((html.match(/<h1/g) ?? []).length, 1);
});

test('includes essential metadata and accessible navigation', () => {
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<meta name="description"/);
  assert.match(html, /<meta property="og:title"/);
  assert.match(html, /aria-label="Main navigation"/);
  assert.match(html, /href="#main-content"/);
});

test('external links are safe and contact actions are available', () => {
  assert.match(html, /href="https:\/\/github\.com\/Sugoigaku" target="_blank" rel="noreferrer"/);
  assert.match(html, /href="mailto:hello\.gaku@example\.com"/);
  assert.match(html, /data-copy-email/);
});

test('built page contains no common credential patterns', () => {
  assert.doesNotMatch(html, /(?:api[_-]?key|password|secret|token)\s*[:=]\s*["'][^"']+/i);
  assert.doesNotMatch(html, /-----BEGIN .*PRIVATE KEY-----/);
});