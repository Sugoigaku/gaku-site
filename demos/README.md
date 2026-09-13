# Portfolio Design Demo

Open `project-portfolio-v2.html` directly in a browser for the current proposal.
No build or server is needed. Keep the adjacent CSS and assets in place.
The original `project-portfolio.html` remains unchanged for comparison.

The revised V2 follows three sections: project and delivery, key decisions,
and future risks and improvements. The opening explains the product and stack;
a compact specification covers Git, CI/CD, and infrastructure. Each of the
three decisions states the owner's choice, reason, and tradeoff with a source
link. The full preview and case study stay within a 950-word copy budget.

The Projects preview links to the case study in the same file. Section and
decision links support browser history and direct fragment navigation; mobile
uses a section selector. All case-study content is visible without expanding
accordions. Use `#overview` to open the case study directly.

## Content Provenance

- The owner confirmed responsibility for scope, selective publication, the
  initial VM request, managed-hosting approval, and repository quality rules.
- The $0-20 monthly budget and owner-only audience were clarified during the
  September 13, 2026 redesign, not recorded as original quantified requirements.
- Downtime tolerance, recovery objectives, and a maintenance-hours budget remain
  undefined. Static hosting does not make deployment, DNS, or provider failure
  impossible.
- Use existing evidence only: no fresh production measurements, rollback
  rehearsal, Azure changes, or publication are authorized by this revision.
- Local demo testing validates the proposal, not production reliability or the
  owner's independent technical competence. Public copy still needs owner review.

This is an isolated design proposal, not an Astro route. Nothing in this folder
is copied into the production site by the current build. Planned improvements
are labeled separately from implemented behavior. All case-study copy remains
subject to owner review before publication.

## Assets

- `assets/gaku-site-desktop.png`: screenshot of the public Gaku website captured
  on September 13, 2026 at 1440 x 1000. It includes the site's existing imagery.
- Arrow icons: local SVGs from `lucide-static@0.468.0`, downloaded from jsDelivr;
  each SVG retains its upstream license notice.
- Fonts: the same Google Fonts families used by the site. If unavailable, local
  fallback fonts apply. Images, navigation, and chapter interactions work offline.

## Validation

```sh
node --test tests/portfolio-demo.test.mjs
node --test tests/portfolio-v2.test.mjs
npm test
npm run check
```

Browser validation should cover preview-to-case navigation, back/forward,
direct decision links, keyboard navigation, section selection, local asset
loading, and desktop/mobile overflow. Any temporary loopback server is only for
browser-tool validation and is not required to open the HTML normally.