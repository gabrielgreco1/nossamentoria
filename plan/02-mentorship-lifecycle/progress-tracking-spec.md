# Progress Tracking Spec

Progress tracking shows what has been completed and what still needs work.

## Progress Sources

Progress is calculated from:

- Completed lessons.
- Completed class sessions.
- Mentor progress notes.
- Next actions.

## Lesson Statuses

- `not_started`
- `scheduled`
- `in_progress`
- `completed`
- `skipped`

## Progress Notes

Mentor notes should capture:

- What was applied.
- What the mentee understood.
- What needs review.
- Homework or next action.
- Confidence or progress level when useful.

## Mentee View

Mentees should see:

- Completed lessons.
- Upcoming lessons.
- Materials.
- Shared notes.
- Next actions.

## Acceptance Criteria

- Completing a session can update lesson progress.
- Progress remains understandable even without numeric grades.
- Mentors can quickly see which mentees need follow-up.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder adapts `prompt-design.md` into the official NossaMentoria visual identity: cinematic dark surfaces, liquid-glass components, Instrument Serif headings, Barlow operational text, restrained motion, and dashboard-first usability.
