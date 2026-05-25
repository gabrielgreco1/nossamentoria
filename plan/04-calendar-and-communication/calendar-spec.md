# Calendar Spec

The calendar shows mentorship sessions and helps users understand upcoming work.

## Views

MVP views:

- Mentor dashboard upcoming sessions.
- Mentee dashboard upcoming sessions.
- Plan detail session list.
- Simple monthly or weekly calendar view if practical.

## Calendar Item Fields

- Title.
- Mentor.
- Mentee.
- Plan.
- Optional lesson.
- Start time.
- End time.
- Status.

## Behavior

- Mentors see sessions for their mentees.
- Mentees see their own sessions.
- Admin can inspect sessions if needed for support.

## Acceptance Criteria

- Upcoming sessions are visible without searching.
- Past sessions remain accessible as history.
- Calendar items link back to plan and session records.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder adapts `prompt-design.md` into the official NossaMentoria visual identity: cinematic dark surfaces, liquid-glass components, Instrument Serif headings, Barlow operational text, restrained motion, and dashboard-first usability.
