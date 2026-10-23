# Design System

## Color System

Base colors:

- `canvas`: `#f5f7fa`
- `canvas-soft`: `#eef3f7`
- `surface`: `#ffffff`
- `surface-raised`: `#ffffff`
- `surface-tint`: `#ffffff`
- `ink`: `#10243e`
- `text-primary`: `#10243e`
- `text-secondary`: `#526477`
- `text-muted`: `#7a8998`
- `line`: `#e1e8ee`
- `brand-teal`: `#078b8b`
- `brand-blue`: `#2563eb`
- `accent-amber`: `#f3a83b`
- `accent-coral`: `#f97360`

Status colors should be restrained and readable. Use teal for positive progress, amber for attention, coral/red for destructive or blocked states, and blue for informational actions. Do not make the whole product green or gray.

## Typography

Use a confident, readable type pairing:

- Heading font: `Sora`, sans-serif.
- Body font: `Inter`, sans-serif.

Heading usage:

- Use `Sora` for landing hero titles, page titles, section headings, and high-emphasis numbers.
- Do not use giant italic serif typography as the default product voice.
- Keep headings crisp, confident, and readable on mobile.

Body usage:

- Use `Inter` for navigation, forms, labels, tables, cards, notes, and operational copy.
- Use light and regular weights for calm density.
- Use medium or semibold for labels and actions.

## Radius

Use approachable, modern geometry without making the product feel toy-like.

Use:

- Pills for chips, filters, badges, and compact CTAs.
- 12px to 20px radius for app panels and cards.
- Full circles for icon-only controls.

Avoid overly rounded nested cards in dense dashboards. Dense operational elements should still feel controlled.

## Depth And Glass

Use two variants, both deliberately opaque inside the authenticated workspace:

- `soft-panel`: default cards, forms, dashboard panels, and landing sections.
- `translucent-panel`: restricted to public navigation, auth framing, and sticky utility bars.

Required behavior:

- Neutral light surface with a subtle warm brand undertone.
- Subtle border.
- Soft shadow.
- Backdrop blur only on floating navigation or sticky utility bars.
- No heavy black glass by default.

## Component Defaults

- Primary CTA: teal or blue filled button with strong contrast and an arrow icon.
- Secondary action: outlined or soft-tinted button.
- Navigation: light, structured, and role-aware.
- Cards: white modular surfaces with clear labels, compact spacing and useful density.
- Tables/lists: readable light rows with subtle separators.
- Progress: quiet segmented, stepper, or ring indicators using teal/amber/blue accents.

## Acceptance Criteria

- Core components can be built from this token system.
- The UI remains readable on warm light backgrounds.
- Glass effects enhance hierarchy without hiding content.
- The palette encourages learning and momentum rather than heaviness.

## Implemented Components

The token system is defined in `src/app/globals.css`. Shared implementations now cover every
required primitive:

- UI: `GlassPanel`, `GlassButton` and `PillChip`;
- brand: `BrandLogo`, combining the generated symbol with the canonical Sora wordmark;
- public/auth: `AuthCard`, `LandingSection` and `LandingHero`;
- workspace: `AppShell`, `PageHeader`, `StatCard`, `EmptyState`, `ProgressIndicator`,
  `MaterialCard` and `SessionCard`.

The landing preview and mentorship lifecycle use the shared progress primitive. The content
library and upcoming-session workflow use their shared card primitives, removing their earlier
one-off implementations.

The official symbol lives at `public/brand/nossamentoria-symbol-v1.png`. It represents two learning
paths converging toward the same milestone. The shared logo is used by public navigation, auth and
the private shell; root metadata uses the same symbol for browser and Apple icons.
