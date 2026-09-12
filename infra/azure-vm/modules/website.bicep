@description('Azure region for all resources.')
param location string

@description('Linux administrator username.')
param adminUsername string

@secure()
@description('SSH public key used for emergency administration through Azure-managed access methods.')
param sshPublicKey string

@description('Public Git repository containing the Astro project.')
param repositoryUrl string

@description('Git branch, tag, or commit to deploy.')
param sourceRef string

@description('Virtual machine size.')
param vmSize string

@description('Resource tags applied to the deployment.')
param tags object

var nameToken = uniqueString(resourceGroup().id)
var virtualNetworkName = 'vnet-gaku-site'
var subnetName = 'snet-web'
var networkSecurityGroupName = 'nsg-gaku-site-web'
var publicIpName = 'pip-gaku-site'
var networkInterfaceName = 'nic-gaku-site'
var virtualMachineName = 'vm-gaku-site'
var dnsLabel = 'gaku-site-${nameToken}'
var repositoryUrlBase64 = base64(repositoryUrl)
var sourceRefBase64 = base64(sourceRef)
var cloudInitTemplate = '''
#!/bin/bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
export ASTRO_TELEMETRY_DISABLED=1
REPOSITORY_URL="$(printf '%s' '__REPOSITORY_URL_BASE64__' | base64 --decode)"
SOURCE_REF="$(printf '%s' '__SOURCE_REF_BASE64__' | base64 --decode)"

if [ ! -f /swapfile ]; then
  fallocate -l 1G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

apt-get update
apt-get install -y ca-certificates curl git nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

rm -rf /tmp/gaku-site
git clone "$REPOSITORY_URL" /tmp/gaku-site
cd /tmp/gaku-site
git checkout "$SOURCE_REF"
npm ci
npm run build

rm -rf /var/www/html/*
cp -a dist/. /var/www/html/

cat > /etc/nginx/sites-available/default <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ $uri/index.html =404;
    }

    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
}
NGINX

nginx -t
systemctl enable nginx
systemctl restart nginx
'''
var cloudInit = replace(replace(cloudInitTemplate, '__REPOSITORY_URL_BASE64__', repositoryUrlBase64), '__SOURCE_REF_BASE64__', sourceRefBase64)

resource networkSecurityGroup 'Microsoft.Network/networkSecurityGroups@2024-05-01' = {
  name: networkSecurityGroupName
  location: location
  tags: tags
  properties: {
    securityRules: [
      {
        name: 'Allow-HTTP-Inbound'
        properties: {
          access: 'Allow'
          description: 'Allow public HTTP access to the website.'
          destinationAddressPrefix: '*'
          destinationPortRange: '80'
          direction: 'Inbound'
          priority: 100
          protocol: 'Tcp'
          sourceAddressPrefix: 'Internet'
          sourcePortRange: '*'
        }
      }
    ]
  }
}

resource virtualNetwork 'Microsoft.Network/virtualNetworks@2024-05-01' = {
  name: virtualNetworkName
  location: location
  tags: tags
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.20.0.0/16'
      ]
    }
  }
}

resource subnet 'Microsoft.Network/virtualNetworks/subnets@2024-05-01' = {
  parent: virtualNetwork
  name: subnetName
  properties: {
    addressPrefix: '10.20.1.0/24'
    defaultOutboundAccess: false
    networkSecurityGroup: {
      id: networkSecurityGroup.id
    }
  }
}

resource publicIpAddress 'Microsoft.Network/publicIPAddresses@2024-05-01' = {
  name: publicIpName
  location: location
  tags: tags
  sku: {
    name: 'Standard'
  }
  properties: {
    dnsSettings: {
      domainNameLabel: dnsLabel
    }
    publicIPAddressVersion: 'IPv4'
    publicIPAllocationMethod: 'Static'
  }
}

resource networkInterface 'Microsoft.Network/networkInterfaces@2024-05-01' = {
  name: networkInterfaceName
  location: location
  tags: tags
  properties: {
    enableAcceleratedNetworking: false
    ipConfigurations: [
      {
        name: 'ipconfig1'
        properties: {
          privateIPAllocationMethod: 'Dynamic'
          publicIPAddress: {
            id: publicIpAddress.id
          }
          subnet: {
            id: subnet.id
          }
        }
      }
    ]
  }
}

resource virtualMachine 'Microsoft.Compute/virtualMachines@2024-11-01' = {
  name: virtualMachineName
  location: location
  tags: tags
  properties: {
    hardwareProfile: {
      vmSize: vmSize
    }
    networkProfile: {
      networkInterfaces: [
        {
          id: networkInterface.id
          properties: {
            primary: true
          }
        }
      ]
    }
    osProfile: {
      adminUsername: adminUsername
      computerName: virtualMachineName
      customData: base64(cloudInit)
      linuxConfiguration: {
        disablePasswordAuthentication: true
        provisionVMAgent: true
        ssh: {
          publicKeys: [
            {
              keyData: sshPublicKey
              path: '/home/${adminUsername}/.ssh/authorized_keys'
            }
          ]
        }
      }
    }
    securityProfile: {
      securityType: 'Standard'
    }
    storageProfile: {
      imageReference: {
        offer: 'ubuntu-24_04-lts'
        publisher: 'Canonical'
        sku: 'server'
        version: 'latest'
      }
      osDisk: {
        createOption: 'FromImage'
        diskSizeGB: 30
        managedDisk: {
          storageAccountType: 'Standard_LRS'
        }
      }
    }
  }
}

output websiteUrl string = 'http://${publicIpAddress.properties.dnsSettings.fqdn}'
output publicIpAddress string = publicIpAddress.properties.ipAddress
output virtualMachineName string = virtualMachine.name