# Profile Management

## Goal

Give every authenticated user one place to maintain the information used for matching and collaboration.

## Shared Information

- Full name and presentation.
- LinkedIn and GitHub links.
- Optional availability notes.
- Confirmed login email is visible but cannot be changed from this screen.

## Role Context

- Mentors edit specialties, academic formations, weekly teaching periods and mentee capacity.
- Mentees edit learning interests and weekly learning periods.
- Mixed users keep separate topic selections and schedules for each active role.
- Admin-only users edit shared identity and links without receiving mentor or mentee fields.

## Data And Safety

- Weekly periods are normalized by role, weekday, start time and end time.
- Profile changes are validated twice: in the Server Action and in one atomic Supabase RPC.
- Mentor links, formation requirements and active-mentee capacity remain enforced by the database.
- Discovery catalogs use the structured weekly schedule when no custom availability note exists.

## Acceptance Criteria

- The **Perfil** item appears for every authenticated role.
- Changes persist and immediately affect discovery and matching screens.
- A mentor cannot reduce capacity below the current active relationship count.
- Teaching and learning availability remain independent for users with both roles.
