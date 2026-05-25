# NossaMentoria Agent Instructions

This file is the mandatory operating manual for any development agent working on NossaMentoria.

## First Actions

1. Read this file completely before changing code.
2. Open `kanban.html` in the project root.
3. Treat the Kanban board as the source of truth for feature status.
4. Pick one card from `To Do`, unless the user explicitly names another card.
5. Move the selected card to `In Development` by editing `kanban.html`.
6. Open the Markdown spec linked by the card.
7. Implement only the behavior described in that spec.
8. Move the card to `In Tests` while validating.
9. Run the relevant checks for the touched area.
10. Move the card to `Done` only after implementation and verification are complete.

## Status Rules

- `To Do`: ready to be implemented.
- `In Development`: actively being implemented by the current agent.
- `In Tests`: implementation is complete and validation is running or pending.
- `Done`: implementation was completed, checked, and no known required work remains.

Never mark a card as `Done` without either running relevant tests or writing a clear note explaining why tests could not be run.

## Scope Rules

- The MVP is free and has no billing, subscriptions, checkout, or paid plan behavior.
- The platform is invite-only.
- The MVP supports multiple mentors from the beginning.
- Gabriel is an initial admin and mentor, but the product must not be hard-coded as a single-user tool.
- Use the specs under `plan/` to decide what to build.
- Do not add unrelated features because they seem useful.
- If a spec conflicts with newer user instructions, follow the user and update the spec or Kanban note.

## Expected Build Direction

The planned stack is:

- Next.js for the web application.
- Supabase for authentication, database, and file storage.
- A responsive dashboard-first interface, not a marketing landing page.

Core product areas:

- Invite-only onboarding.
- Mentor, mentee, admin, and mixed mentor/mentee roles.
- Mentor picking or invitation of mentees.
- Mentorship plan creation.
- Lesson templates and lesson sequences.
- Content library with uploaded materials, including slides and `.html` files.
- Calendar scheduling.
- Session completion tracking.
- Progress notes and next actions.

## Kanban Editing Protocol

`kanban.html` is a static file. Update it directly.

When moving a card:

1. Find the card by its `data-file` path.
2. Cut the whole `<article class="card"...>` block.
3. Paste it inside the target column's `<div class="cards">`.
4. Update the card note if useful.
5. Do not delete the spec path.

If blocked:

- Keep the card in `In Development` unless implementation has not started.
- Add a short note inside the card describing the blocker.
- Ask the user only after trying to resolve discoverable facts from the repo.

## Completion Checklist

Before finishing a task, report:

- The card/spec implemented.
- Files changed.
- Tests or checks run.
- Any remaining risk or follow-up.
