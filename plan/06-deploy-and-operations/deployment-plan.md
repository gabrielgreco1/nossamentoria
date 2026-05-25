# Deployment Plan

## Target

- Vercel for the Next.js app.
- Supabase hosted project for auth, database, and storage.

## Release Flow

1. Merge tested changes into the main branch.
2. Run local checks.
3. Confirm Supabase migrations are applied.
4. Deploy through Vercel.
5. Verify production auth, invitations, dashboard, uploads, and scheduling.

## Initial Launch

The first launch should include:

- Admin account.
- Seed lesson templates.
- Storage bucket configured.
- RLS enabled and tested.
- Invite-only signup confirmed.

## Acceptance Criteria

- Production users cannot bypass invitation flow.
- Uploaded files work in production.
- Mentor and mentee accounts see only their allowed data.
