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

## Execution Snapshot — 21 October 2026

| Phase | Current result |
| --- | --- |
| 1. Landing, Auth, invitation | Landing, login, callback, invitation validation/acceptance, first admin and real admin invitation creation/revocation are implemented. Custom SMTP and the Before User Created hook remain operational configuration. |
| 2. Private workspace shell | Shared protected layout, database-backed roles, mixed-role context switcher, real dashboard counters and role-aware navigation are implemented. |
| 3. Relationships | Domain rules, database model, RLS and the operational route exist. The rich editor is still local until invited mentor/mentee test users are available. |
| 4. Mentorship plans | Schema, RPCs, route and validated local editor exist. Persisted create/edit forms remain an incremental delivery. |
| 5. Lessons and content | Global templates, schema, private Storage bucket and operational route exist. Upload and attachment mutations remain local. |
| 6. Calendar and sessions | Schema, scheduling/session RPCs and operational route exist. Calendar mutations and notification reads remain local. |
| 7. Polish and deploy | Intentionally belongs to `plan/06-deploy-and-operations/` after real mentor and mentee accounts validate RLS and the core flows. |

The roadmap is executable without changing the core relationships: later persistence work uses the existing foreign keys, RPCs, RLS policies and route boundaries rather than replacing the domain model.

## Acceptance Criteria

- Each phase leaves the app in a runnable state.
- The first runnable user-facing phase shows landing and auth, not an internal dashboard.
- Later phases do not require rewriting core domain relationships.
- Deployment happens only after auth, access, and core flows are verified.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder is the official NossaMentoria visual identity: warm light surfaces, learning-oriented accents, Sora headings, Inter operational text, restrained motion, landing-first public entry, and dashboard-first private usability.
