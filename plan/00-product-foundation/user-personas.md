# User Personas

## Admin

The admin manages access to the private platform.

Primary needs:

- Invite mentors and mentees.
- See who is active.
- Help fix incorrect role assignments.
- Keep the community controlled while the product is private.

MVP assumption: Gabriel is an initial admin.

## Mentor

A mentor is a user who guides mentees through learning plans and classes.

Primary needs:

- Pick or invite mentees.
- Create mentorship plans.
- Upload and organize content.
- Schedule lessons.
- Mark lessons as completed.
- Record what was applied during each class.
- Track mentee progress.

## Mentee

A mentee is a user receiving guidance from a mentor.

Primary needs:

- Accept invitations.
- See their active mentorship plan.
- Access materials and lesson content.
- Know upcoming classes.
- Understand progress and next actions.

## Mixed User

A mixed user can be both mentor and mentee.

Primary needs:

- Switch context between mentoring and being mentored.
- Keep relationships and dashboards separated.
- Avoid confusing notes, lessons, or materials across roles.

## Design Implication

The product should always make the current context visible: admin, mentor, mentee, or mixed role. Dashboard cards should be role-aware.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder adapts `prompt-design.md` into the official NossaMentoria visual identity: cinematic dark surfaces, liquid-glass components, Instrument Serif headings, Barlow operational text, restrained motion, and dashboard-first usability.
