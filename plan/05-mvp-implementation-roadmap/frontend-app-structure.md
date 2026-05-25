# Frontend App Structure

## Primary Screens

- Auth and invitation acceptance.
- Dashboard.
- Mentors.
- Mentees.
- Mentorship relationships.
- Mentorship plan detail.
- Plan editor.
- Content library.
- Calendar.
- Session detail.
- Admin invitations and users.

## Navigation

Use role-aware navigation:

- Admin: invitations, users, platform overview.
- Mentor: dashboard, mentees, plans, content, calendar.
- Mentee: dashboard, my plan, materials, calendar.

Mixed users should be able to switch context clearly.

## UI Defaults

- Start with the usable app, not a landing page.
- Follow `plan/07-visual-identity-and-design/` for all UI decisions.
- Prefer tables, lists, calendars, timelines, and compact dashboard panels.
- Use cinematic liquid-glass treatment more strongly on login, invitation, and onboarding screens.
- Keep authenticated product screens operational, dark, scannable, and restrained.
- Avoid decorative hero sections inside the product app.

## Acceptance Criteria

- Users can reach their main work in one or two clicks from dashboard.
- Role context is visible.
- Empty states explain the next useful action.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder adapts `prompt-design.md` into the official NossaMentoria visual identity: cinematic dark surfaces, liquid-glass components, Instrument Serif headings, Barlow operational text, restrained motion, and dashboard-first usability.
