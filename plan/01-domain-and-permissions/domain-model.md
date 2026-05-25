# Domain Model

This model defines the minimum entities needed for the MVP.

## Core Entities

- User: authenticated identity.
- Profile: display name, bio, role flags, stack, availability notes.
- Invitation: invite-only access record.
- MentorMenteeRelationship: connection between a mentor and a mentee.
- MentorshipPlan: structured learning plan for a relationship.
- LessonTemplate: reusable mock or predefined lesson.
- Lesson: planned item inside a mentorship plan.
- ContentMaterial: uploaded or linked learning material.
- ClassSession: scheduled or completed class instance.
- ProgressNote: mentor note, mentee progress, or next action.
- Notification: simple system event for invitations, schedules, and updates.

## Relationship Rules

- A User has one Profile.
- A User may have many roles.
- A MentorMenteeRelationship references one mentor user and one mentee user.
- A MentorshipPlan belongs to one relationship.
- A Lesson belongs to one plan.
- A ClassSession may reference one lesson.
- A ContentMaterial is owned by a user and may be attached to plans or lessons.
- A ProgressNote belongs to a plan, lesson, session, or relationship.

## Implementation Note

Keep identifiers stable and use explicit foreign keys. Do not encode important relationships only in JSON blobs.

## Acceptance Criteria

- Each domain object has clear ownership.
- Query scoping can be implemented with these relationships.
- Uploaded content can be traced to owner and usage context.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder adapts `prompt-design.md` into the official NossaMentoria visual identity: cinematic dark surfaces, liquid-glass components, Instrument Serif headings, Barlow operational text, restrained motion, and dashboard-first usability.
