# Gaku Personal Website

An English-only personal website demo built with Astro. It includes a single-page professional profile and a small public Knowledge section. The current profile details, experience dates, email address, LinkedIn destination, and images are sample content for reviewing the interface and user flow.

The Knowledge section currently publishes two reviewed English adaptations:

- Azure Application Gateway
- Kerberos, from Tickets to Azure NetApp Files

The original Obsidian notes remain unchanged. Public copies are maintained in `src/content/knowledge` after manual publication review.

## Commands

```sh
npm install
npm run dev
npm test
```

## Deploy to Azure with Bicep

The reusable template in `infra/main.bicep` creates a resource group, VNet, subnet, NSG, static public IP with a unique DNS label, NIC, and a small Ubuntu VM. Cloud-init installs Node.js and Nginx, builds this public repository, and serves the generated `dist/` directory. Only HTTP port 80 is open to the Internet; SSH is key-only and is not exposed by the NSG.

Prerequisites:

- Azure CLI with Bicep support
- Permission to create a resource group and resources in the selected subscription
- An SSH public key, generated locally if needed with `ssh-keygen -t ed25519`

Deploy into the currently selected Azure subscription:

```powershell
$publicKey = Get-Content "$HOME/.ssh/id_ed25519.pub" -Raw
az deployment sub create `
	--name gaku-site `
	--location japaneast `
	--template-file infra/main.bicep `
	--parameters sshPublicKey="$publicKey"
```

To use another region, resource-group name, VM size, repository, or source revision, pass the corresponding parameter. Pin `sourceRef` to a commit SHA for a reproducible deployment:

```powershell
az deployment sub create `
	--name gaku-site `
	--location eastus `
	--template-file infra/main.bicep `
	--parameters `
		location=eastus `
		resourceGroupName=rg-my-gaku-site `
		sshPublicKey="$publicKey" `
		sourceRef=<commit-sha>
```

The deployment outputs the public website URL. VM provisioning finishes before cloud-init necessarily completes; check initialization with Azure Run Command if the first request is not ready yet:

```powershell
az vm run-command invoke `
	--resource-group rg-my-gaku-site `
	--name vm-gaku-site `
	--command-id RunShellScript `
	--scripts "cloud-init status --wait && systemctl is-active nginx"
```

This baseline intentionally serves HTTP only. Add a domain and TLS termination before using it for sensitive or authenticated content.

## Before Publishing

- Replace all sample profile content with verified information.
- Replace the demo email and LinkedIn links.
- Confirm that the selected images may be used in production or replace them with owned assets.
- Run `npm test` and inspect mobile and desktop layouts.
- Scan the staged changes for credentials and private information.