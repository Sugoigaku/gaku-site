# Portfolio Design Demo

Open `project-portfolio.html` directly in a browser. No build or server is needed.
The Projects preview links to a complete case study in the same file. Chapter
links support browser history and direct fragment navigation; mobile uses a
chapter selector. Operational roadmap entries expand independently.

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
npm test
npm run check
```

Browser validation should cover preview-to-case navigation, back/forward,
direct chapter links, expandable sections, keyboard focus, local asset loading,
and desktop/mobile overflow.