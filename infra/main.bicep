targetScope = 'subscription'

@description('Azure region for all resources.')
param location string = 'japaneast'

@description('Name of the resource group created for the website.')
param resourceGroupName string = 'rg-gaku-site'

@description('Linux administrator username. Password authentication and public SSH access are disabled.')
param adminUsername string = 'azureuser'

@secure()
@description('SSH public key used for emergency administration through Azure-managed access methods.')
param sshPublicKey string

@description('Public Git repository containing the Astro project.')
param repositoryUrl string = 'https://github.com/Sugoigaku/gaku-site.git'

@description('Git branch, tag, or commit to deploy.')
param sourceRef string = 'main'

@description('Virtual machine size. Standard_B1ls is the lowest-cost default suitable for this static site.')
param vmSize string = 'Standard_B1ls'

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

module website 'modules/website.bicep' = {
  scope: resourceGroup
  params: {
    adminUsername: adminUsername
    location: location
    repositoryUrl: repositoryUrl
    sourceRef: sourceRef
    sshPublicKey: sshPublicKey
    tags: tags
    vmSize: vmSize
  }
}

output websiteUrl string = website.outputs.websiteUrl
output publicIpAddress string = website.outputs.publicIpAddress
output resourceGroupName string = resourceGroup.name