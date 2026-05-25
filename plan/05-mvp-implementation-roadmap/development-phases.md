# Development Phases

## Phase 1: Project And Auth Foundation

Create the Next.js project, Supabase setup, auth, profiles, roles, and invite-only access.

## Phase 2: Relationships

Implement mentor and mentee dashboards, invitations, and mentor/mentee relationship creation.

## Phase 3: Mentorship Plans

Implement plan creation, plan editing, statuses, topics, duration, and goals.

## Phase 4: Lessons And Content

Implement lesson templates, lesson list, content library, uploads, and material attachment.

## Phase 5: Calendar And Sessions

Implement scheduling, session detail, completion, applied content, and progress notes.

## Phase 6: Polish And Deploy

Implement QA fixes, responsive checks, RLS tests, seed data, deployment configuration, and launch checklist.

## Acceptance Criteria

- Each phase leaves the app in a runnable state.
- Later phases do not require rewriting core domain relationships.
- Deployment happens only after auth, access, and core flows are verified.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder adapts `prompt-design.md` into the official NossaMentoria visual identity: cinematic dark surfaces, liquid-glass components, Instrument Serif headings, Barlow operational text, restrained motion, and dashboard-first usability.
