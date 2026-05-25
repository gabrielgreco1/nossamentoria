# Landing And Auth First

## Decision

The first user-facing implementation must be the public landing page plus authentication and invitation entry. The product should not open directly into the private dashboard for unauthenticated visitors.

## Rationale

NossaMentoria is a mentorship product. Before showing operational tools, it needs to explain:

- What the platform is.
- Who it is for.
- What kind of learning outcome it supports.
- Why access is invite-only.
- How an invited user signs in or accepts an invite.

The dashboard is still central to the product, but it belongs behind authentication.

## First Public Surface

The root route `/` should be a landing page when the visitor is not authenticated.

It must include:

- Clear value proposition for structured technology mentorship.
- Visual language that feels optimistic, educational, and focused.
- Primary action for invited users to sign in.
- Secondary explanation for invite-only access.
- A section showing the learning workflow: invite, plan, lessons, materials, sessions, progress.
- No public signup path that bypasses invitations.

## Auth Surfaces

Required MVP auth screens:

- Login.
- Invitation acceptance by token or invite link.
- Account creation only when a valid invitation is present.
- Post-auth redirect into the correct role-aware dashboard.
- Setup error states for expired, revoked, reused, or invalid invitations.

## Private Workspace Entry

Authenticated users should reach:

- Mentor dashboard for mentors.
- Mentee dashboard for mentees.
- Admin dashboard for admins.
- A clear context switcher for mixed-role users.

The private workspace should not be used as the first public impression.

## Design Direction

Use the updated design system in `plan/07-visual-identity-and-design/`.

Avoid:

- Black/gray-dominant pages.
- Giant italic serif headlines as the default product voice.
- Depressive or overly cinematic command-center aesthetics.
- Generic SaaS blue gradients.

Prefer:

- Warm light backgrounds.
- Calm educational color accents.
- High readability.
- Human mentorship imagery or learning-oriented abstract visuals.
- Confident sans-serif typography.
- Motion that creates momentum without becoming decorative.

## Acceptance Criteria

- Visiting `/` unauthenticated shows the landing page, not the dashboard.
- Login and invitation acceptance are reachable from the landing page.
- Account creation requires a valid invitation.
- Authenticated users are redirected away from the landing page into their workspace.
- The visual design feels learning-oriented, optimistic, and readable.
- The implementation does not add billing, subscriptions, or public marketplace behavior.
