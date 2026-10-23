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

## Implemented Relationship Controls

- `profiles.mentor_capacity` stores a zero-to-50 active-mentee limit.
- Capacity is enforced by a database trigger for every relationship activation.
- `list_available_mentors()` exposes only safe profile fields and mentors with open slots.
- Mentor and mentee can each initiate a request; `created_by_user_id` determines who must respond.
- Transactional tests cover both directions and roll back all temporary roles and relationships.
- `profile_availability_periods` stores weekly teaching and learning windows without paid services.
- `update_own_profile()` updates profile, topics, formations, periods and mentor capacity atomically.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder is the official NossaMentoria visual identity: warm light surfaces, learning-oriented accents, Sora headings, Inter operational text, restrained motion, landing-first public entry, and dashboard-first private usability.
