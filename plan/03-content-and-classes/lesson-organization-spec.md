# Lesson Organization Spec

Lessons organize the sequence of learning inside a mentorship plan.

## Lesson Fields

- Title.
- Description.
- Order.
- Objective.
- Topics.
- Expected duration.
- Attached materials.
- Status.

## Organization Rules

- Lessons belong to one plan.
- Lessons can be reordered by the mentor.
- Lessons can be created manually or copied from templates.
- Completed lessons keep their completion history even if the plan is edited later.

## Mentor View

The mentor should see a plan as an ordered lesson list with status, materials, and next session information.

## Mentee View

The mentee should see upcoming and completed lessons, shared materials, and next actions.

## Acceptance Criteria

- Mentors can build a useful plan without leaving the plan editor.
- Lesson order is explicit.
- A lesson can exist before a calendar session is scheduled.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder adapts `prompt-design.md` into the official NossaMentoria visual identity: cinematic dark surfaces, liquid-glass components, Instrument Serif headings, Barlow operational text, restrained motion, and dashboard-first usability.
