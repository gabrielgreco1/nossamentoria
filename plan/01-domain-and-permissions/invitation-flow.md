# Invitation Flow

NossaMentoria starts as a private platform. Users enter through invitations.

## Invitation Types

- Admin invites a mentor.
- Admin invites a mentee.
- Mentor invites a mentee.
- Mentor invites a user who may later become a mentor, if admin approves role expansion.

## Invitation Fields

Minimum fields:

- Email.
- Intended role.
- Invited by user.
- Optional mentor relationship target.
- Expiration date.
- Status: pending, accepted, expired, revoked.

## Flow

1. Inviter creates an invitation.
2. Invitee receives or is given an invite link.
3. Invitee signs up or signs in.
4. System validates the invitation.
5. System assigns the intended role.
6. If a mentor relationship target exists, the relationship is created or marked pending acceptance.

## Constraints

- Expired invitations cannot be used.
- Revoked invitations cannot be used.
- A used invitation cannot be reused.
- Users cannot change the role embedded in an invitation.

## Acceptance Criteria

- The platform has no open public signup path for uninvited users.
- Invitations can be tracked by status.
- Mentor-created mentee invitations are connected back to that mentor.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder adapts `prompt-design.md` into the official NossaMentoria visual identity: cinematic dark surfaces, liquid-glass components, Instrument Serif headings, Barlow operational text, restrained motion, and dashboard-first usability.
