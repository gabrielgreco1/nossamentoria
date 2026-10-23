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

## Current Delivery State

- `technical-stack.md`: complete; the Next.js application, Supabase clients, environment validation and private Storage helper are in place.
- `landing-and-auth-first.md`: complete; landing, login, invitation entry, callback and protected workspace exist. The first administrator is provisioned.
- `database-and-storage-plan.md`: complete; the production project contains the MVP schema, RLS policies, RPCs, views, lesson templates and the private `materials` bucket.
- `frontend-app-structure.md`: complete; the private workspace has a shared protected layout, database-backed roles, mixed-role context switching, real counters and role-aware operational routes.
- `development-phases.md`: complete; the current result of every phase is recorded, the first administrative write flow is persisted, and remaining editor and deployment work has explicit boundaries.

## Implementation Boundaries

- Browser and SSR clients use the public Supabase key; privileged operations use the service role only on the server.
- The application runtime does not require a PostgreSQL connection string.
- Authorization is enforced by database roles and RLS, not only by hidden interface elements.
- Demo state may remain only where its replacement belongs to a later incremental delivery, and it must be visibly identified.
- Auth email branding, custom SMTP, the Before User Created hook and production deployment remain explicit operational follow-ups until their external configuration is available.

## Acceptance Criteria

- The MVP can be built incrementally.
- Each development phase produces usable product behavior.
- Technical decisions support public mentor/mentee registration, invitation-only administrators, and multi-mentor operation.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder is the official NossaMentoria visual identity: warm light surfaces, learning-oriented accents, Sora headings, Inter operational text, restrained motion, landing-first public entry, and dashboard-first private usability.
