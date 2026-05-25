# Class Session Records

A class session records a real or planned meeting connected to a lesson.

## Session Fields

- Mentor.
- Mentee.
- Plan.
- Optional lesson.
- Scheduled start.
- Scheduled end.
- Actual completion date.
- Status: scheduled, completed, canceled, missed.
- Applied content.
- Mentor notes.
- Shared notes.
- Next actions.

## Completion Flow

1. Mentor opens scheduled session.
2. Mentor marks it completed.
3. Mentor records what was applied.
4. Mentor adds notes and next actions.
5. System updates lesson progress if applicable.

## Acceptance Criteria

- Completed sessions create useful history.
- A mentor can explain what happened in each class later.
- Session completion can contribute to plan progress.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder is the official NossaMentoria visual identity: warm light surfaces, learning-oriented accents, Sora headings, Inter operational text, restrained motion, landing-first public entry, and dashboard-first private usability.
