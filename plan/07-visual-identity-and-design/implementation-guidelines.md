# Implementation Guidelines

## Source Of Truth

Use this folder as the design source of truth. `prompt-design.md` remains the motion and interaction reference, but implementation decisions should follow these adapted specs.

The current adapted direction supersedes the original dark cinematic prompt for visual styling. Do not implement black/gray-dominant UI, space-travel content, or giant italic serif headings unless a later spec explicitly reintroduces them for a narrow use case.

## Stack Adaptation

The prompt mentions CDN-only React, Tailwind, Babel, and UMD scripts because it describes a standalone landing page. NossaMentoria should not use that CDN-only setup inside the production app.

For the real platform:

- Use the planned Next.js stack.
- Install fonts through the app's font strategy.
- Implement design tokens in the app's CSS/Tailwind setup.
- Use package-managed Framer Motion if motion is implemented.
- Use reusable React components for surfaces, buttons, cards, forms, auth panels, landing sections, and app shell.
- Keep user-facing copy in Portuguese.

## Required Components

Create shared components before duplicating design code:

- GlassPanel.
- GlassButton.
- AuthCard.
- LandingSection.
- LandingHero.
- PillChip.
- AppShell.
- PageHeader.
- StatCard.
- EmptyState.
- ProgressIndicator.
- MaterialCard.
- SessionCard.

## Accessibility

- Maintain readable contrast on warm light, tinted, media, and occasional dark backgrounds.
- Provide visible focus states.
- Ensure glass panels do not depend only on blur for separation.
- Respect reduced motion.
- Do not put critical text over busy video without a readable surface.

## Engineering Rules

- Do not hard-code one-off surface styles in every screen.
- Do not introduce black/gray-dominant visuals as default branding.
- Do not introduce green or multicolor gradients as default branding.
- Do not build public landing aesthetics into every dashboard surface.
- Keep operational pages fast and scannable.
- Reuse the same typography, spacing, and radius tokens across app areas.
- Implement landing and auth before treating the dashboard as the root experience.
- Preserve the motion spirit of `prompt-design.md` on public/onboarding screens without copying its colors, videos, fonts, or space theme.

## Acceptance Criteria

- New UI work references this design phase.
- Core components express the identity consistently.
- The app can evolve visually without rewriting every screen.
