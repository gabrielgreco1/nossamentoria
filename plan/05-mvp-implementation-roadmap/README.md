# MVP Implementation Roadmap

This phase turns the product specs into an implementation direction.

## Specs

- `technical-stack.md`: stack and architectural defaults.
- `landing-and-auth-first.md`: first implementation target for public landing, login, and invitation acceptance before the private workspace.
- `database-and-storage-plan.md`: data and file storage plan.
- `frontend-app-structure.md`: UI structure.
- `development-phases.md`: implementation sequence.

## Default Stack

Use Next.js for the application and Supabase for authentication, database, and storage.

## Acceptance Criteria

- The MVP can be built incrementally.
- Each development phase produces usable product behavior.
- Technical decisions support invite-only, multi-mentor operation.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder is the official NossaMentoria visual identity: warm light surfaces, learning-oriented accents, Sora headings, Inter operational text, restrained motion, landing-first public entry, and dashboard-first private usability.
