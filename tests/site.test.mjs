import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const knowledgeHtml = await readFile(new URL('../dist/knowledge/index.html', import.meta.url), 'utf8');
const applicationGatewayHtml = await readFile(new URL('../dist/knowledge/application-gateway/index.html', import.meta.url), 'utf8');
const kerberosHtml = await readFile(new URL('../dist/knowledge/kerberos/index.html', import.meta.url), 'utf8');
const staticWebAppConfig = JSON.parse(
  await readFile(new URL('../dist/staticwebapp.config.json', import.meta.url), 'utf8'),
);

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
  assert.match(html, /href="mailto:hakbean0728@gmail\.com"/);
  assert.match(html, /data-copy-email/);
});

test('profile content reflects the documented work history and interests', () => {
  assert.match(html, /Jun 2025\s*—\s*Present/);
  assert.match(html, /Salesforce Japan/);
  assert.match(html, /NTT DATA/);
  assert.match(html, /Azure NetApp Files/);
  assert.match(html, /MuleSoft/);
  assert.match(html, /U\.S\. stock market/);
  assert.match(html, /AI-assisted programming/);
  assert.match(html, /AI Engineer, Solution Architect, or Solution Engineer/);
  assert.doesNotMatch(html, /Demo image|Boomi Product Researcher/);
});

test('built page contains no common credential patterns', () => {
  for (const page of [html, knowledgeHtml, applicationGatewayHtml, kerberosHtml]) {
    assert.doesNotMatch(page, /(?:api[_-]?key|password|secret|token)\s*[:=]\s*["'][^"']+/i);
    assert.doesNotMatch(page, /-----BEGIN .*PRIVATE KEY-----/);
  }
});

test('publishes the approved English knowledge pages', () => {
  assert.match(html, /<a href="\/knowledge\/"[^>]*>Knowledge<\/a>/);
  assert.match(knowledgeHtml, /Azure Application Gateway/);
  assert.match(knowledgeHtml, /Kerberos, from Tickets to Azure NetApp Files/);
  assert.match(applicationGatewayHtml, /Application Gateway requires a dedicated subnet/);
  assert.match(kerberosHtml, /Kerberos is a ticket-based network authentication protocol/);
});

test('knowledge articles expose review context and official references', () => {
  for (const page of [applicationGatewayHtml, kerberosHtml]) {
    assert.match(page, /Reviewed September 12, 2026/);
    assert.match(page, /Official References/);
    assert.match(page, /https:\/\/learn\.microsoft\.com\//);
    assert.doesNotMatch(page, /\[\[[^\]]+\]\]/);
  }
});

test('publishes security headers for Azure Static Web Apps', () => {
  assert.equal(staticWebAppConfig.globalHeaders['X-Content-Type-Options'], 'nosniff');
  assert.equal(staticWebAppConfig.globalHeaders['Referrer-Policy'], 'strict-origin-when-cross-origin');
});