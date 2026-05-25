# Roles And Access

## Roles

The MVP supports these roles:

- `admin`: manages access, roles, and platform setup.
- `mentor`: creates plans, lessons, content, and session records for assigned mentees.
- `mentee`: views assigned mentorship plans, lessons, materials, calendar, and notes.

A user may hold multiple roles.

## Admin Access

Admins can:

- Create invitations.
- Assign invited role defaults.
- View users and role assignments.
- Resolve incorrect mentor/mentee relationships.
- Access operational records needed to support the platform.

Admins should not be required for every mentorship action once a mentor and mentee are connected.

## Mentor Access

Mentors can:

- View mentees connected to them.
- Invite or request mentee relationships when allowed.
- Create and edit mentorship plans for their mentees.
- Upload materials they own.
- Attach materials to lessons and plans.
- Schedule and update class sessions.
- Record progress notes.

Mentors cannot edit another mentor's private plans unless they are also assigned to that relationship.

## Mentee Access

Mentees can:

- View their own plans.
- View their own lessons, sessions, materials, progress, and mentor notes shared with them.
- Accept invitations and relationship requests.

Mentees cannot edit mentor-owned plan structure in MVP.

## Acceptance Criteria

- Role checks exist server-side.
- Mixed users see separate mentor and mentee contexts.
- Unauthorized access returns a clear blocked state, not leaked data.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder adapts `prompt-design.md` into the official NossaMentoria visual identity: cinematic dark surfaces, liquid-glass components, Instrument Serif headings, Barlow operational text, restrained motion, and dashboard-first usability.
