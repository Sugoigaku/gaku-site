# Gaku Personal Website - Product Design

## 1. Product Overview

An English-only personal website that presents Gaku's professional identity in a clear, credible, and approachable way. The original MVP is a focused single-page profile. The approved next phase adds a project portfolio that demonstrates how Gaku defines, builds, and delivers a solution.

The original MVP scope below remains the baseline. Section 11 records the approved portfolio design; its integration into the live site is not yet implemented.

The site should help a visitor answer three questions quickly:

- Who is Gaku?
- What does he do and care about professionally?
- How can I learn more or contact him?

## 2. Goals

- Establish a polished public professional presence.
- Communicate Gaku's background, focus, and strengths within a short visit.
- Provide direct paths to contact details and professional profiles.
- Create a lightweight foundation that can later support articles or projects.
- Demonstrate Solution Architect and Developer capabilities through real projects: explain the product, delivery approach, important decisions, and future improvements.

## 3. Target Audience

- Professional peers and people in the cloud and infrastructure community.
- Recruiters and potential employers.
- People who encounter Gaku through GitHub, LinkedIn, or technical discussions.

## 4. MVP Experience

The website will use one continuous page with simple navigation to four sections.

### Introduction

- Name and professional role or identity.
- A short statement describing Gaku's focus and value.
- A professional portrait or other authentic personal image.
- One primary action, such as viewing LinkedIn or sending an email.

### About

- A concise professional biography.
- Main technical interests and areas of expertise.
- Current learning goals or professional direction.

### Experience and Skills

- A short timeline of relevant professional experience.
- A curated list of meaningful technical and interpersonal skills.
- Clear descriptions without skill ratings or percentage bars.

### Contact

- Email link.
- GitHub profile.
- LinkedIn profile.
- Optional downloadable resume if one is available and current.

### Knowledge

- A small public index of reviewed technical articles.
- Individual English article pages with topics, review dates, and official references.
- Content is added manually only after publication-risk review and approval.

## 5. Design Direction

- Professional, calm, and personal rather than corporate or promotional.
- Strong typography and generous spacing to make a small amount of content feel intentional.
- A restrained color palette with one recognizable accent color.
- Subtle motion only where it improves orientation or feedback.
- Responsive behavior designed for both mobile and desktop from the start.
- The first viewport should clearly show Gaku's name, identity, and primary action.

## 6. Product Requirements

- English-only content.
- Single-page navigation with clear section landmarks.
- Semantic HTML, keyboard support, visible focus states, and sufficient color contrast.
- Fast loading with minimal client-side JavaScript.
- Page title, meta description, favicon, and social sharing metadata.
- No API keys, credentials, private customer information, or unnecessary personal data in the source or deployed site.

## 7. Out of Scope for MVP

- Project portfolio was outside the original MVP; it is now approved as the next phase described in Section 11.
- Investment notes, search, filtering, or content management system.
- Contact form or backend service.
- User accounts, comments, public interaction, newsletter, or database.
- Language switching.
- Analytics dashboard or complex animation system.
- Automated publishing or synchronization from Obsidian.
- Any changes to the existing Obsidian vault or its directory structure.

These features should only be added when there is real content or a clear user need for them.

## 8. Future Knowledge Publishing

The first public technical wiki articles are included as a small extension to the MVP. Additional technical articles and future investment reflections will use the same manual, review-first process:

1. Gaku identifies the specific wiki content he wants to publish.
2. The content is reviewed for publication risks before any website change is made.
3. If risks are found, proposed edits or redactions are presented to Gaku for confirmation.
4. Only the confirmed, public-safe version is added to the website repository.

The review should check for credentials, customer or case information, private resource identifiers, internal-only links or procedures, copyrighted material, personal financial data, and statements that could be mistaken for personalized financial advice.

The website repository will contain only approved public copies. The original Obsidian content will remain unchanged unless Gaku explicitly requests a separate workflow in the future. Publishing scripts, automatic synchronization, and comments will not be designed or implemented at this stage.

## 9. Technical Direction

- Build as a static Astro site with TypeScript, CSS, and Markdown content collections.
- Keep profile content in simple local data or components for easy editing.
- Use Git and GitHub for version control with focused commits. The portfolio work is isolated on a feature branch.
- Host on Azure Static Web Apps Free with a custom HTTPS domain. Retain the initial Linux VM and Nginx deployment as a separate infrastructure reference.
- Use Bicep for resource provisioning, separate from application deployment.
- GitHub Actions runs installation, build, tests, and Astro/TypeScript checks before uploading the static output on main updates or manual dispatch. Deployment credentials stay in GitHub Secrets.
- Keep pull-request gates, post-deployment checks, and recovery rehearsal as planned improvements, not claims about existing capabilities.

## 10. MVP Completion Criteria

The MVP is ready when:

- All four sections contain final English copy rather than placeholders.
- Contact and external profile links work correctly.
- The page is readable and visually coherent on common mobile and desktop sizes.
- Accessibility and metadata checks pass.
- The production build completes successfully and contains no credentials or private information.

## 11. Approved Project Portfolio

### Status and Reference

Approved on September 13, 2026. Use the simplified [portfolio demo](demos/project-portfolio-v2.html) as the design reference. This approval selects the design; the demo remains separate from the production routes until integration is implemented and validated.

### Visitor Experience

- Add a Projects preview to the homepage before Contact, with a navigation link to the section.
- Start with Gaku Personal Website as the first project. Use its real screenshot, a plain-language purpose, key technologies, and links to the case study and source.
- Open a dedicated case-study page with the project name, what it does, its current functionality, the technology stack, and live-site/source links visible near the top.
- State Gaku's role in scope, architecture decisions, and review separately from GitHub Copilot's implementation assistance.
- Use three sections in this order, with desktop section navigation and a mobile section selector. Support direct section links, browser history, and a clear return to Projects.

### 1. Project & Delivery

Explain what was built before discussing decisions. For the first project:

- **Purpose:** an English professional profile and selected public technical articles, with responsive pages and HTTPS. No application backend or database.
- **Application and content:** Astro, TypeScript, CSS, and reviewed Markdown copies; the private Obsidian vault is not a build input.
- **Version control:** Git and GitHub, focused commits, initial work on main, and the portfolio revision on a feature branch.
- **CI/CD:** GitHub Actions validates the build, tests, and types before uploading dist. Show the short main -> build and validate -> deploy flow.
- **Infrastructure:** Azure Static Web Apps Free, custom-domain HTTPS, and reusable Bicep; distinguish provisioning from application deployment and mention the retained VM reference.

Use a compact technical specification and one delivery diagram. Link to the workflow and infrastructure source rather than reproducing implementation details.

### 2. Key Decisions

Present three short decisions, each with **My choice / Why / Tradeoff** and a relevant source link:

1. **Keep the MVP small and static:** publish a useful English profile and selected articles without adding accounts or a database. Content changes require a rebuild.
2. **Publish reviewed copies, not the vault:** protect private and internal material, accepting manual duplication and possible content drift at the current scale.
3. **Move from a VM to managed hosting:** Gaku initially requested a Linux VM, then approved Copilot's Static Web Apps proposal after asking about HTTPS and cost. Reduce server maintenance while accepting less control and platform limits.

The current budget is $0-20 per month with a preference to minimize spending. This was clarified during the portfolio review, not recorded as an original quantified requirement. Free hosting does not mean a measured zero total bill; domain renewal is separate.

### 3. What's Next

Pair each future problem with an improvement, clearly labeled as planned:

- **Bad releases:** add pull-request and post-deployment route checks; rehearse restoring a known-good revision.
- **DNS, TLS, or hosting failure:** add lightweight availability checks and agree recovery targets before others depend on the site.
- **More articles:** introduce selective publishing assistance when copying becomes a burden, retaining human privacy review.
- **More traffic or features:** review actual cost and service limits before upgrading; add an API or database only for a demonstrated private-state requirement.

The first priority is release validation and a tested recovery path. Recovery has not been rehearsed and an uptime target is not yet set.

### Content and Acceptance Criteria

- Lead with the project, not an essay about architectural judgment. Retain the existing visual language and real project imagery.
- Keep the first project's preview and case study within the approved demo's 950-word budget, with each decision no longer than 110 words.
- Keep core content visible without accordions. Omit a separate evidence chapter, repeated caveats, and lengthy alternative comparisons.
- Distinguish implemented behavior, personal decisions, AI assistance, and planned work. Do not invent performance, savings, uptime, or recovery results.
- Preserve the existing profile, knowledge pages, and publication-review boundary during integration.
- Before release, verify project and source links, keyboard navigation, direct links, browser history, mobile section selection, asset loading, and desktop/mobile layouts without overflow.
- Build, relevant automated tests, and Astro/TypeScript diagnostics must pass before deployment. Design approval alone does not satisfy these release criteria.