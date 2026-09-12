import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const vmEntrypoint = await readFile(new URL('../infra/azure-vm/main.bicep', import.meta.url), 'utf8');
const vmWebsiteModule = await readFile(new URL('../infra/azure-vm/modules/website.bicep', import.meta.url), 'utf8');
const vmTemplates = `${vmEntrypoint}\n${vmWebsiteModule}`;
const staticEntrypoint = await readFile(new URL('../infra/static-web-app/main.bicep', import.meta.url), 'utf8');
const staticSiteModule = await readFile(new URL('../infra/static-web-app/static-site.bicep', import.meta.url), 'utf8');
const deploymentWorkflow = await readFile(
  new URL('../.github/workflows/deploy-static-web-app.yml', import.meta.url),
  'utf8',
);

test('keeps deployment inputs reusable and free of environment identifiers', () => {
  assert.match(vmEntrypoint, /targetScope = 'subscription'/);
  assert.match(vmEntrypoint, /param resourceGroupName string/);
  assert.match(vmEntrypoint, /@secure\(\)[\s\S]*param sshPublicKey string/);
  assert.doesNotMatch(vmTemplates, /\/subscriptions\/[0-9a-f-]{36}/i);
  assert.doesNotMatch(vmTemplates, /[\w.+-]+@microsoft\.com/i);
  assert.doesNotMatch(vmTemplates, /param subscriptionId/i);
});

test('creates an isolated network with only public HTTP allowed', () => {
  assert.match(vmWebsiteModule, /Microsoft\.Network\/virtualNetworks@/);
  assert.match(vmWebsiteModule, /Microsoft\.Network\/virtualNetworks\/subnets@/);
  assert.match(vmWebsiteModule, /Microsoft\.Network\/networkSecurityGroups@/);
  assert.match(vmWebsiteModule, /destinationPortRange: '80'/);
  assert.doesNotMatch(vmWebsiteModule, /destinationPortRange: '22'/);
  assert.match(vmWebsiteModule, /publicIPAllocationMethod: 'Static'/);
});

test('uses key-only Linux access and deploys the static site through Nginx', () => {
  assert.match(vmWebsiteModule, /disablePasswordAuthentication: true/);
  assert.match(vmWebsiteModule, /ubuntu-24_04-lts/);
  assert.match(vmWebsiteModule, /npm run build/);
  assert.match(vmWebsiteModule, /systemctl restart nginx/);
  assert.match(vmWebsiteModule, /add_header X-Content-Type-Options nosniff always/);
});

test('provides a separate reusable Static Web Apps Free deployment', () => {
  assert.match(staticEntrypoint, /targetScope = 'subscription'/);
  assert.match(staticEntrypoint, /uniqueString\(subscription\(\)\.id, resourceGroupName\)/);
  assert.match(staticSiteModule, /Microsoft\.Web\/staticSites@2024-11-01/);
  assert.match(staticSiteModule, /name: 'Free'/);
  assert.match(staticSiteModule, /tier: 'Free'/);
  assert.match(staticSiteModule, /Microsoft\.Web\/staticSites\/customDomains@2024-11-01/);
  assert.match(staticSiteModule, /if \(!empty\(customDomainName\)\)/);
  assert.match(staticSiteModule, /output websiteUrl string = !empty\(customDomainName\)/);
  assert.match(staticSiteModule, /'https:\/\/\$\{customDomainName\}'/);
});

test('keeps the static hosting template free of environment identifiers', () => {
  const staticTemplates = `${staticEntrypoint}\n${staticSiteModule}`;
  assert.doesNotMatch(staticTemplates, /\/subscriptions\/[0-9a-f-]{36}/i);
  assert.doesNotMatch(staticTemplates, /[\w.+-]+@microsoft\.com/i);
  assert.doesNotMatch(staticTemplates, /param subscriptionId/i);
});

test('deploys the tested static build when main is updated', () => {
  assert.match(deploymentWorkflow, /push:\s*\n\s*branches:\s*\n\s*- main/);
  assert.match(deploymentWorkflow, /run: npm test/);
  assert.match(deploymentWorkflow, /run: npm run check/);
  assert.match(deploymentWorkflow, /SWA_CLI_DEPLOYMENT_TOKEN: \$\{\{ secrets\.AZURE_STATIC_WEB_APPS_API_TOKEN \}\}/);
  assert.match(deploymentWorkflow, /deploy \.\/dist --env production/);
  assert.doesNotMatch(deploymentWorkflow, /[0-9a-f]{8}-[0-9a-f-]{27}/i);
});