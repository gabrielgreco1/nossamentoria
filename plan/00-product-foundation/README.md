# Product Foundation

This phase defines the reason NossaMentoria exists, who it serves, and how the MVP will be judged.

Read this folder before implementing product behavior. The goal is to keep the MVP focused: a free mentorship platform with public mentor and mentee registration, invitation-based relationships, and invitation-only administrative access.

## Specs

- `product-vision.md`: product purpose and boundaries.
- `user-personas.md`: primary users and their needs.
- `success-metrics.md`: early signals of useful adoption.
- `glossary.md`: shared vocabulary for all specs.
- `profile-management.md`: editable identity, matching information, weekly availability and mentor capacity.

## Implementation Guidance

All future implementation should preserve these defaults:

- No billing or paid plan behavior in MVP.
- Multi-mentor support from the beginning.
- Complete public onboarding for mentors and mentees; invitation-only onboarding for administrators.
- Dashboard-first product experience.
- Gabriel can be an initial admin and mentor, but the system must support other mentors.

## Acceptance Criteria

- The MVP can be explained without referencing monetization.
- Every feature maps back to a mentor or mentee workflow.
- Agents use the glossary terms consistently in code, UI, and docs.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder is the official NossaMentoria visual identity: warm light surfaces, learning-oriented accents, Sora headings, Inter operational text, restrained motion, landing-first public entry, and dashboard-first private usability.
