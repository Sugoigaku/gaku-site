# Gaku Personal Website - Product Design

## 1. Product Overview

An English-only personal website that presents Gaku's professional identity in a clear, credible, and approachable way. The MVP will be a focused single-page experience rather than a collection of thin or unfinished pages.

The site should help a visitor answer three questions quickly:

- Who is Gaku?
- What does he do and care about professionally?
- How can I learn more or contact him?

## 2. Goals

- Establish a polished public professional presence.
- Communicate Gaku's background, focus, and strengths within a short visit.
- Provide direct paths to contact details and professional profiles.
- Create a lightweight foundation that can later support articles or projects.

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

- Project portfolio.
- Public wiki, investment notes, search, tags, or content management system.
- Contact form or backend service.
- User accounts, comments, public interaction, newsletter, or database.
- Language switching.
- Analytics dashboard or complex animation system.
- Automated publishing or synchronization from Obsidian.
- Any changes to the existing Obsidian vault or its directory structure.

These features should only be added when there is real content or a clear user need for them.

## 8. Future Knowledge Publishing

Technical wiki articles and investment reflections may be added in a later phase. For now, publication will remain a manual, review-first process:

1. Gaku identifies the specific wiki content he wants to publish.
2. The content is reviewed for publication risks before any website change is made.
3. If risks are found, proposed edits or redactions are presented to Gaku for confirmation.
4. Only the confirmed, public-safe version is added to the website repository.

The review should check for credentials, customer or case information, private resource identifiers, internal-only links or procedures, copyrighted material, personal financial data, and statements that could be mistaken for personalized financial advice.

The website repository will contain only approved public copies. The original Obsidian content will remain unchanged unless Gaku explicitly requests a separate workflow in the future. Publishing scripts, automatic synchronization, and comments will not be designed or implemented at this stage.

## 9. Technical Direction

- Build as a static Astro site.
- Keep profile content in simple local data or components for easy editing.
- Deploy through a static hosting provider such as GitHub Pages, Cloudflare Pages, or Vercel.
- Add automated checks for build success, formatting, and critical page behavior before deployment.

## 10. MVP Completion Criteria

The MVP is ready when:

- All four sections contain final English copy rather than placeholders.
- Contact and external profile links work correctly.
- The page is readable and visually coherent on common mobile and desktop sizes.
- Accessibility and metadata checks pass.
- The production build completes successfully and contains no credentials or private information.