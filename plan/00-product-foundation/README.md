# Product Foundation

This phase defines the reason NossaMentoria exists, who it serves, and how the MVP will be judged.

Read this folder before implementing product behavior. The goal is to keep the MVP focused: a free, invite-only mentorship platform for organizing mentors, mentees, classes, materials, plans, and progress.

## Specs

- `product-vision.md`: product purpose and boundaries.
- `user-personas.md`: primary users and their needs.
- `success-metrics.md`: early signals of useful adoption.
- `glossary.md`: shared vocabulary for all specs.

## Implementation Guidance

All future implementation should preserve these defaults:

- No billing or paid plan behavior in MVP.
- Multi-mentor support from the beginning.
- Invite-only onboarding.
- Dashboard-first product experience.
- Gabriel can be an initial admin and mentor, but the system must support other mentors.

## Acceptance Criteria

- The MVP can be explained without referencing monetization.
- Every feature maps back to a mentor or mentee workflow.
- Agents use the glossary terms consistently in code, UI, and docs.
