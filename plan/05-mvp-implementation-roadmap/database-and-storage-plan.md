# Database And Storage Plan

## Initial Tables

- profiles
- user_roles
- invitations
- mentor_mentee_relationships
- mentorship_plans
- lesson_templates
- lessons
- content_materials
- lesson_materials
- class_sessions
- progress_notes
- notifications

## Storage Buckets

- `materials`: mentor-uploaded learning materials.

## Access Control Direction

Use RLS policies so:

- Admins can manage platform records.
- Mentors can access records connected to their mentees.
- Mentees can access records connected to themselves.
- Material access follows explicit sharing through plans, lessons, or sessions.

## Acceptance Criteria

- Tables support the MVP workflows without storing core relationships only as JSON.
- Files are connected to database records.
- Access policies can be tested with mentor and mentee accounts.
