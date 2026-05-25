# Domain And Permissions

This phase defines who can access what and how the core mentorship domain should behave.

The MVP is invite-only and multi-mentor. Permission boundaries matter because mentors will manage private information about mentees, classes, and progress.

## Specs

- `roles-and-access.md`: user roles and permissions.
- `invitation-flow.md`: how users enter the platform.
- `mentor-mentee-relationship.md`: how mentorship relationships are formed.
- `domain-model.md`: core entities for implementation.

## Implementation Guidance

Use Supabase authentication for identity and database policies for access control. Do not rely only on frontend hiding. Any user-facing query must be scoped by role and relationship.

## Acceptance Criteria

- Users cannot self-assign elevated roles.
- Mentees only see their own plans and shared materials.
- Mentors only see mentees connected to them.
- Admin can manage invitations and roles.
