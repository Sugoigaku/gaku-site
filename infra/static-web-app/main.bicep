targetScope = 'subscription'

@description('Azure region for the Static Web App. Choose a region supported by Azure Static Web Apps.')
@allowed([
  'centralus'
  'eastasia'
  'eastus2'
  'westeurope'
  'westus2'
])
param location string = 'eastasia'

@description('Name of the resource group created for the Static Web App.')
param resourceGroupName string = 'rg-gaku-site-static'

@description('Globally unique Static Web App name. The default is derived from the deployment scope.')
param staticSiteName string = 'swa-gaku-site-${uniqueString(subscription().id, resourceGroupName)}'

@description('Resource tags applied to the deployment.')
param tags object = {
  application: 'gaku-site'
  environment: 'personal'
}

resource resourceGroup 'Microsoft.Resources/resourceGroups@2024-11-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

module staticWebsite 'static-site.bicep' = {
  scope: resourceGroup
  params: {
    location: location
    staticSiteName: staticSiteName
    tags: tags
  }
}

output staticSiteName string = staticWebsite.outputs.staticSiteName
output resourceGroupName string = resourceGroup.name
output websiteUrl string = staticWebsite.outputs.websiteUrl