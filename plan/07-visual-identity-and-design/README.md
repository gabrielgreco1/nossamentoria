# Visual Identity And Design

This phase defines the official visual direction for NossaMentoria.

The earlier raw prompt described a cinematic black liquid-glass interface. Its dark palette, space-travel content, serif typography, and heavy black/gray mood are no longer the product target. Its motion and interaction system remains useful: full-height public sections, blur-in text, Framer Motion entrances, layered cards, and carefully managed video fades.

NossaMentoria should feel like a place that encourages learning: warm, bright, focused, clear, and human, with enough polish to feel premium.

## Specs

- `visual-identity.md`: brand mood, personality, and visual principles.
- `design-system.md`: colors, typography, radius, glass surfaces, and component rules.
- `app-layout-and-screens.md`: how the design applies to product screens.
- `motion-and-media.md`: animation and video behavior.
- `implementation-guidelines.md`: engineering rules for building the design consistently.

## Design Position

NossaMentoria should feel optimistic, educational, precise, and calm. It should not feel like a generic SaaS dashboard, a dark command center, a school portal, or a colorful gamified LMS.

Use warmth, spaciousness, readable typography, learning-oriented visual metaphors, and restrained depth. The platform is about mentorship, plans, classes, materials, and progress.

All user-facing UI copy should be Portuguese by default. English may appear only in code identifiers, technical integration names, or imported third-party labels that should not be translated.

## Acceptance Criteria

- Public/onboarding surfaces must communicate learning and trust before asking for authentication.
- Public/onboarding surfaces can use the `prompt-design.md` motion model without inheriting its dark colors or space aesthetic.
- Core app screens remain usable, dense, and dashboard-first.
- Typography and glass surfaces follow this folder's specs.
- No UI-facing implementation should ignore this phase.
