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

1. Visitor reaches the public landing page.
2. Invited user opens a login or invitation link.
3. System validates the invitation token before account creation.
4. Invitee signs up or signs in only through a valid invitation path.
5. System assigns the intended role.
6. If a mentor relationship target exists, the relationship is created or marked pending acceptance.
7. User is redirected into the correct private workspace.

## Constraints

- Expired invitations cannot be used.
- Revoked invitations cannot be used.
- A used invitation cannot be reused.
- Users cannot change the role embedded in an invitation.

## Acceptance Criteria

- The platform has no open public signup path for uninvited users.
- The public landing page can explain the product, but cannot bypass invitation validation.
- Invitations can be tracked by status.
- Mentor-created mentee invitations are connected back to that mentor.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder is the official NossaMentoria visual identity: warm light surfaces, learning-oriented accents, Sora headings, Inter operational text, restrained motion, landing-first public entry, and dashboard-first private usability.
