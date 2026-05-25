# Notifications Spec

Notifications keep users aware of mentorship events without requiring complex messaging infrastructure.

## MVP Notification Events

- Invitation created.
- Invitation accepted.
- Mentorship relationship activated.
- Plan created or activated.
- Session scheduled.
- Session rescheduled.
- Session completed.
- New shared note or next action.

## Delivery

MVP can start with in-app notifications. Email can be added if the stack is ready and configuration is available.

## Notification Fields

- Recipient.
- Type.
- Title.
- Body.
- Related entity.
- Read status.
- Created date.

## Acceptance Criteria

- Users can see unread notifications.
- Notifications link to the relevant plan, session, or invitation.
- Lack of email setup does not block the MVP.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder adapts `prompt-design.md` into the official NossaMentoria visual identity: cinematic dark surfaces, liquid-glass components, Instrument Serif headings, Barlow operational text, restrained motion, and dashboard-first usability.
