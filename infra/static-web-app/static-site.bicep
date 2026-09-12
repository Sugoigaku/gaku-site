@description('Azure region for the Static Web App.')
param location string

@description('Globally unique Static Web App name.')
param staticSiteName string

@description('Optional custom domain. Leave empty to omit the custom-domain resource.')
param customDomainName string

@description('Custom-domain validation method.')
param customDomainValidationMethod string

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

resource customDomain 'Microsoft.Web/staticSites/customDomains@2024-11-01' = if (!empty(customDomainName)) {
  parent: staticSite
  name: customDomainName
  properties: {
    validationMethod: customDomainValidationMethod
  }
}

output staticSiteName string = staticSite.name
output websiteUrl string = !empty(customDomainName) ? 'https://${customDomainName}' : 'https://${staticSite.properties.defaultHostname}'