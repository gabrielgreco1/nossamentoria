# Scheduling Flow

Scheduling controls how classes are planned.

## MVP Flow

1. Mentor chooses a mentee or plan.
2. Mentor creates a session with date, time, duration, and optional lesson.
3. Mentee can see the session.
4. Mentor can reschedule, cancel, or mark completed.

## Optional Confirmation

The MVP can allow sessions to be mentor-created without requiring a formal acceptance step. If confirmation is implemented, status should support `proposed` and `confirmed`.

## Rescheduling

When rescheduled:

- Preserve the original creation date.
- Update the scheduled time.
- Keep notes and lesson link.

## Acceptance Criteria

- Mentor can schedule the next class quickly.
- Mentee can understand when the next class happens.
- Canceled or missed sessions do not count as completed progress.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder adapts `prompt-design.md` into the official NossaMentoria visual identity: cinematic dark surfaces, liquid-glass components, Instrument Serif headings, Barlow operational text, restrained motion, and dashboard-first usability.
