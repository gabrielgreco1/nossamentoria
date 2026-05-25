# Mentor Mentee Relationship

A mentorship relationship connects one mentor and one mentee. It can exist before a detailed mentorship plan is created.

## Relationship States

- `invited`: mentor invited the mentee.
- `requested`: mentee or admin requested the relationship.
- `active`: both sides are connected.
- `paused`: mentorship is temporarily inactive.
- `ended`: mentorship is complete or closed.

## Creation Paths

- Mentor invites a new mentee by email.
- Mentor picks an existing mentee from an approved pool.
- Admin creates or approves a relationship.

## Mentor Responsibilities

After a relationship becomes active, the mentor should create a mentorship plan before regular tracking begins.

## Mentee View

The mentee should see:

- Mentor name.
- Relationship status.
- Active plan, if one exists.
- Upcoming sessions.
- Shared materials and notes.

## Acceptance Criteria

- One mentor may have many mentees.
- One mentee may eventually have multiple mentors, but the MVP interface can focus on one active mentor relationship at a time.
- Plans must belong to a specific mentor/mentee relationship.
