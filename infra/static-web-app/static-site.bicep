@description('Azure region for the Static Web App.')
param location string

@description('Globally unique Static Web App name.')
param staticSiteName string

@description('Resource tags applied to the deployment.')
param tags object

resource staticSite 'Microsoft.Web/staticSites@2024-11-01' = {
  name: staticSiteName
  location: location
  tags: tags
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    allowConfigFileUpdates: true
    stagingEnvironmentPolicy: 'Disabled'
  }
}

output staticSiteName string = staticSite.name
output websiteUrl string = 'https://${staticSite.properties.defaultHostname}'