# App Layout And Screens

## Layout Principle

The public product is landing-first and auth-first. The authenticated platform is dashboard-first after login. The design must prioritize learning confidence, clear invitation flow, and repeated mentor workflows: reviewing mentees, plans, lessons, sessions, content, and progress.

## Public And Onboarding Screens

These screens must be implemented before the private workspace becomes the default experience:

- Public landing page.
- Invitation acceptance.
- Login.
- First setup.

Allowed elements:

- Warm illustrated, photographic, or abstract learning media.
- Clear auth cards.
- Confident sans-serif hero headings.
- Motion patterns from `prompt-design.md`: blur-in hero text, staged section entrances, layered foreground cards, and full-height public sections.

Landing page must include:

- Value proposition.
- Invite-only explanation.
- Sign-in action for invited users.
- Learning workflow preview.
- Trust-building copy for mentors and mentees.

Landing page copy must be in Portuguese.

## Authenticated App Shell

Use:

- Warm light background.
- Sidebar or top navigation with clear role context.
- Role switcher for mixed users.
- Compact dashboard panels.
- Clear page title in sans-serif.
- Operational content in Inter.
- Portuguese UI labels and empty states.

Primary mentor dashboard should surface:

- Active mentees.
- Upcoming sessions.
- Plans needing updates.
- Recent progress notes.
- Content shortcuts.

Primary mentee dashboard should surface:

- Current plan.
- Next class.
- Assigned materials.
- Progress summary.
- Next actions.

## Screen Patterns

Mentorship plan detail:

- Header with mentee, mentor, status, duration, and main goal.
- Lesson timeline or ordered lesson list.
- Attached materials panel.
- Progress notes and next actions.

Content library:

- Search and filters in glass controls.
- Material cards or dense list rows.
- Clear file type labels for `.html`, PDF, links, and notes.

Calendar:

- Upcoming sessions first.
- Month/week view can be secondary.
- Session detail opens with lesson, materials, and completion actions.

## Acceptance Criteria

- `/` shows the landing page to unauthenticated visitors.
- Auth pages are reachable before any private dashboard screen.
- The app does not become a marketing page after login.
- Every major screen uses the visual identity without sacrificing scanability.
- Empty states guide the next operational action.
- User-facing UI copy is Portuguese-first.
