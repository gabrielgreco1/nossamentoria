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
- Prefer tables, lists, calendars, and compact dashboard panels.
- Avoid decorative hero sections for the product app.

## Acceptance Criteria

- Users can reach their main work in one or two clicks from dashboard.
- Role context is visible.
- Empty states explain the next useful action.
