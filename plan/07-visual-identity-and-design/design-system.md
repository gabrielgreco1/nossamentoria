# Design System

## Color System

Base colors:

- `canvas`: `#f7f3ea`
- `canvas-soft`: `#eef6f1`
- `surface`: `#fffdf7`
- `surface-raised`: `#ffffff`
- `surface-tint`: `rgba(255,255,255,0.72)`
- `ink`: `#13231f`
- `text-primary`: `#13231f`
- `text-secondary`: `#43534e`
- `text-muted`: `#6f7f78`
- `line`: `#d9e4dd`
- `brand-teal`: `#0f766e`
- `brand-blue`: `#2563eb`
- `accent-amber`: `#f5b84b`
- `accent-coral`: `#e56b5f`

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

Use two variants:

- `soft-panel`: default cards, forms, dashboard panels, and landing sections.
- `translucent-panel`: landing overlays, auth cards, highlighted dashboard panels, and modal surfaces.

Required behavior:

- Warm light surface.
- Subtle border.
- Soft shadow.
- Optional backdrop blur only when it helps separate foreground from media.
- No heavy black glass by default.

## Component Defaults

- Primary CTA: teal or blue filled button with strong contrast and an arrow icon.
- Secondary action: outlined or soft-tinted button.
- Navigation: light, structured, and role-aware.
- Cards: warm surfaces with clear labels and useful density.
- Tables/lists: readable light rows with subtle separators.
- Progress: quiet segmented, stepper, or ring indicators using teal/amber/blue accents.

## Acceptance Criteria

- Core components can be built from this token system.
- The UI remains readable on warm light backgrounds.
- Glass effects enhance hierarchy without hiding content.
- The palette encourages learning and momentum rather than heaviness.
