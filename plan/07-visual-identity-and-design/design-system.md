# Design System

## Color System

Base colors:

- `black`: `#000000`
- `surface`: `#050505`
- `surface-soft`: `#0b0d10`
- `surface-glass`: `rgba(255,255,255,0.01)`
- `text-primary`: `#ffffff`
- `text-secondary`: `rgba(255,255,255,0.82)`
- `text-muted`: `rgba(255,255,255,0.58)`
- `line-glass`: translucent white gradient borders

Status colors should be restrained. Use muted amber, muted red, and white/gray states before introducing saturated colors. Do not use bright green as the default success color.

## Typography

Use the prompt's font pairing:

- Heading font: `Instrument Serif`, serif.
- Body font: `Barlow`, sans-serif.

Heading usage:

- Use `Instrument Serif` in italic style for hero titles, major page titles, section titles, and high-emphasis numbers.
- Do not use the serif font for dense form labels, table cells, or long paragraphs.

Body usage:

- Use `Barlow` for navigation, forms, labels, tables, cards, notes, and operational copy.
- Use light and regular weights for calm density.
- Use medium or semibold for labels and actions.

## Radius

The source prompt uses pill-like controls and rounded liquid surfaces.

Use:

- Pills for chips, filters, badges, and compact CTAs.
- 12px to 20px radius for app panels and cards.
- Full circles for icon-only controls.

Avoid overly rounded nested cards in dense dashboards. Dense operational elements should still feel controlled.

## Liquid Glass

Use two variants:

- `liquid-glass`: subtle panels, nav, chips, cards, compact controls.
- `liquid-glass-strong`: primary actions, modal surfaces, highlighted dashboard panels.

Required behavior:

- Very low-opacity translucent background.
- Backdrop blur.
- Inner light.
- Gradient border through pseudo-element or equivalent.
- No heavy solid borders.

## Component Defaults

- Primary CTA: strong glass pill with white text and an arrow icon.
- Secondary action: text or subtle glass button.
- Navigation: floating or fixed glass surface.
- Cards: dark glass panels with clear labels and strong spacing.
- Tables/lists: dark rows with subtle separators, not white admin tables.
- Progress: quiet segmented or ring indicators, not colorful gamification.

## Acceptance Criteria

- Core components can be built from this token system.
- The UI remains readable on dark backgrounds.
- Glass effects enhance hierarchy without hiding content.
