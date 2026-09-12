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

## Before Publishing

- Replace all sample profile content with verified information.
- Replace the demo email and LinkedIn links.
- Confirm that the selected images may be used in production or replace them with owned assets.
- Run `npm test` and inspect mobile and desktop layouts.
- Scan the staged changes for credentials and private information.