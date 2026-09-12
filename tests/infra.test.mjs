import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const entrypoint = await readFile(new URL('../infra/main.bicep', import.meta.url), 'utf8');
const websiteModule = await readFile(new URL('../infra/modules/website.bicep', import.meta.url), 'utf8');
const templates = `${entrypoint}\n${websiteModule}`;

test('keeps deployment inputs reusable and free of environment identifiers', () => {
  assert.match(entrypoint, /targetScope = 'subscription'/);
  assert.match(entrypoint, /param resourceGroupName string/);
  assert.match(entrypoint, /@secure\(\)[\s\S]*param sshPublicKey string/);
  assert.doesNotMatch(templates, /\/subscriptions\/[0-9a-f-]{36}/i);
  assert.doesNotMatch(templates, /[\w.+-]+@microsoft\.com/i);
  assert.doesNotMatch(templates, /param subscriptionId/i);
});

test('creates an isolated network with only public HTTP allowed', () => {
  assert.match(websiteModule, /Microsoft\.Network\/virtualNetworks@/);
  assert.match(websiteModule, /Microsoft\.Network\/virtualNetworks\/subnets@/);
  assert.match(websiteModule, /Microsoft\.Network\/networkSecurityGroups@/);
  assert.match(websiteModule, /destinationPortRange: '80'/);
  assert.doesNotMatch(websiteModule, /destinationPortRange: '22'/);
  assert.match(websiteModule, /publicIPAllocationMethod: 'Static'/);
});

test('uses key-only Linux access and deploys the static site through Nginx', () => {
  assert.match(websiteModule, /disablePasswordAuthentication: true/);
  assert.match(websiteModule, /ubuntu-24_04-lts/);
  assert.match(websiteModule, /npm run build/);
  assert.match(websiteModule, /systemctl restart nginx/);
  assert.match(websiteModule, /add_header X-Content-Type-Options nosniff always/);
});