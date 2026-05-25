# Mentorship Plan Spec

A mentorship plan is the main structure for a mentee's learning path.

## Required Fields

- Title.
- Mentor.
- Mentee.
- Relationship.
- Start date.
- Expected end date.
- Duration label.
- Main goal.
- Primary content area.
- Topics.
- Status: draft, active, completed, paused.

## Optional Fields

- Description.
- Expected outcomes.
- Prerequisites.
- Mentor private notes.
- Shared notes.

## Plan Creation Flow

1. Mentor opens an active relationship.
2. Mentor chooses create plan.
3. Mentor enters duration, main goal, content, and topics.
4. Mentor either adds lessons manually or starts from lesson templates.
5. Mentor saves as draft or activates the plan.

## Editing Rules

- Draft plans can be freely edited by the mentor.
- Active plans can be edited, but changes should preserve completed lesson history.
- Completed plans should be read-only unless reopened by mentor or admin.

## Acceptance Criteria

- A mentee can clearly see their active plan.
- A mentor can see which plans are draft, active, paused, or completed.
- A plan cannot be active without a mentor, mentee, relationship, and goal.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder is the official NossaMentoria visual identity: warm light surfaces, learning-oriented accents, Sora headings, Inter operational text, restrained motion, landing-first public entry, and dashboard-first private usability.
