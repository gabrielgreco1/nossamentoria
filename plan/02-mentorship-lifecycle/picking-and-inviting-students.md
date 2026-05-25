# Picking And Inviting Students

Mentors need a controlled way to choose who they mentor.

## Pick Existing Mentee

When a mentee already exists in the platform, a mentor can request or pick them if the user is available for mentorship and allowed by admin rules.

Minimum behavior:

- Show available mentees.
- Allow mentor to start a relationship request.
- Prevent duplicate active relationships between the same mentor and mentee.
- Confirm before creating the relationship.

## Invite New Mentee

When the mentee is not in the platform, the mentor can create an invitation.

Minimum behavior:

- Enter email.
- Add optional message.
- Set intended role as mentee.
- Link invitation to the inviting mentor.

## After Acceptance

After the mentee accepts:

- Relationship becomes active.
- Mentor is prompted to create a mentorship plan.
- Mentee can see mentor and pending plan status.

## Acceptance Criteria

- Mentors can start mentorship without admin manually creating every relationship.
- Admin retains visibility into invitations and active relationships.
- The next suggested action after connecting is plan creation.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder is the official NossaMentoria visual identity: warm light surfaces, learning-oriented accents, Sora headings, Inter operational text, restrained motion, landing-first public entry, and dashboard-first private usability.
