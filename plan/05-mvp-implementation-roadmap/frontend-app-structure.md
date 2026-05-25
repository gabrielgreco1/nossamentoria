# Frontend App Structure

## Primary Screens

- Public landing page.
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

- Start unauthenticated users on a real landing page. The landing page is mandatory before the private platform experience.
- Keep the authenticated product workspace dashboard-first after login.
- Follow `plan/07-visual-identity-and-design/` for all UI decisions.
- Prefer tables, lists, calendars, timelines, and compact dashboard panels inside the authenticated product.
- Use warm, learning-oriented presentation on landing, login, invitation, and onboarding screens.
- Keep authenticated product screens operational, bright enough to feel usable, scannable, and restrained.
- Avoid decorative hero sections inside the product app.

## Acceptance Criteria

- Unauthenticated users see landing/auth, not the dashboard.
- The landing page explains what NossaMentoria is before asking users to sign in.
- Users can reach their main work in one or two clicks from dashboard.
- Role context is visible.
- Empty states explain the next useful action.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder is the official NossaMentoria visual identity: warm light surfaces, learning-oriented accents, Sora headings, Inter operational text, restrained motion, landing-first public entry, and dashboard-first private usability.
