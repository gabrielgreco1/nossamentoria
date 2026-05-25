# QA Checklist

Run this checklist before marking launch or major feature cards as done.

## Auth And Access

- Uninvited user cannot access the app.
- Invited user can accept invitation.
- Role is assigned correctly.
- Mentor cannot see unrelated mentee plans.
- Mentee cannot see unrelated content.

## Core Flows

- Mentor can invite a mentee.
- Mentor can create a mentorship plan.
- Mentor can add lessons.
- Mentor can upload and attach materials.
- Mentor can schedule a session.
- Mentor can mark a session completed.
- Progress updates are visible.

## UI Checks

- Dashboard works on desktop.
- Core screens work on mobile.
- Empty states are understandable.
- Forms show validation errors.

## Acceptance Criteria

- Critical flows pass with at least one mentor and one mentee account.
- Any skipped test is documented before release.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder adapts `prompt-design.md` into the official NossaMentoria visual identity: cinematic dark surfaces, liquid-glass components, Instrument Serif headings, Barlow operational text, restrained motion, and dashboard-first usability.
