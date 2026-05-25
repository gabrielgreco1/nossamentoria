# Development Phases

## Phase 1: Landing, Auth, And Invitation Foundation

Create the Next.js project, public landing page, Supabase setup, login, invitation acceptance, profiles, roles, and invite-only access.

This phase must land before private dashboard work becomes the main focus. The app's unauthenticated root route should introduce NossaMentoria and guide invited users into authentication.

## Phase 2: Private Workspace Shell

Implement the authenticated app shell, role-aware routing, dashboard redirects, and empty role-specific dashboards.

## Phase 3: Relationships

Implement mentor and mentee dashboards, invitations, and mentor/mentee relationship creation.

## Phase 4: Mentorship Plans

Implement plan creation, plan editing, statuses, topics, duration, and goals.

## Phase 5: Lessons And Content

Implement lesson templates, lesson list, content library, uploads, and material attachment.

## Phase 6: Calendar And Sessions

Implement scheduling, session detail, completion, applied content, and progress notes.

## Phase 7: Polish And Deploy

Implement QA fixes, responsive checks, RLS tests, seed data, deployment configuration, and launch checklist.

## Acceptance Criteria

- Each phase leaves the app in a runnable state.
- The first runnable user-facing phase shows landing and auth, not an internal dashboard.
- Later phases do not require rewriting core domain relationships.
- Deployment happens only after auth, access, and core flows are verified.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder is the official NossaMentoria visual identity: warm light surfaces, learning-oriented accents, Sora headings, Inter operational text, restrained motion, landing-first public entry, and dashboard-first private usability.
