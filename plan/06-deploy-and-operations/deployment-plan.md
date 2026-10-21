# Deployment Plan

## Target

- Vercel for the Next.js app, conditional on plan eligibility.
- Supabase hosted project for auth, database, and storage.

Vercel Hobby is free but restricted to personal, non-commercial use. Before creating the project, confirm that NossaMentoria qualifies. If the deployment supports commercial activity, this target requires a paid Vercel plan or a separately evaluated host whose free terms permit that use.

## Release Flow

1. Run `npm ci` from the lockfile and `npm run check` on the candidate commit.
2. Confirm the Supabase schema, RLS policies, seed templates and private bucket match the release.
3. Merge only the tested commit into the production branch.
4. Create a Vercel Preview deployment with Preview-specific environment values.
5. Verify `/api/health`, public routes, auth callbacks and the QA checklist against the Preview URL.
6. Promote the same verified commit to Production.
7. Update the Supabase Site URL and redirect allow list with the final HTTPS domain.
8. Repeat the smoke tests in Production and record the URL, commit and date in the release record.

## Repository Deployment Contract

- Node.js 20.9 or newer, pinned as a minimum in `package.json`.
- Install command: `npm ci`.
- Build command: `npm run build`.
- Start command outside Vercel: `npm run start`.
- Full local release gate: `npm run check`.
- Health endpoint: `GET /api/health`; it returns `200` only when all required environment variables are present and never returns secret values.
- Global responses include anti-framing, MIME sniffing, referrer, permissions and HTTPS transport headers.

No `vercel.json` is required: Vercel detects Next.js and uses the repository's locked dependencies and scripts.

## Vercel Setup

1. Import the Git repository as a new Vercel project.
2. Keep the detected framework as Next.js and the repository root as the root directory.
3. Add the four required variables separately to Preview and Production.
4. Use the stable Preview branch URL as `NEXT_PUBLIC_APP_URL` in Preview; use the final HTTPS domain in Production.
5. Deploy the current branch to Preview and run the QA checklist before promoting.

When eligible for Hobby, the zero-cost workflow uses Vercel's built-in Preview and Production environments. It does not require a paid custom staging environment.

## Initial Launch

The first launch should include:

- Admin account.
- Seed lesson templates.
- Storage bucket configured.
- RLS enabled and tested.
- Invite-only signup confirmed.

## Rollback

1. Stop new invitations if authentication or authorization is affected.
2. Promote the last known-good Vercel deployment; do not rebuild a different commit as a rollback.
3. If a database change is involved, prefer a forward corrective migration. Restore data only from a verified private export and only after identifying the affected rows.
4. Repeat `/api/health`, auth and permission smoke tests after rollback.

## Current Deployment Status — 21 October 2026

- Repository contract, health check and security headers: implemented locally.
- Production build: passing locally.
- Supabase project: provisioned.
- Vercel project, Preview URL and Production URL: not connected yet; the CLI check on 21 October 2026 found no authenticated Vercel session.
- Vercel Hobby eligibility: confirmed for the current philanthropic, non-commercial use; reassess if the operating model changes.
- Production acceptance criteria below: pending external deployment and cross-role QA.

## Acceptance Criteria

- Production users cannot bypass invitation flow.
- Uploaded files work in production.
- Mentor and mentee accounts see only their allowed data.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder is the official NossaMentoria visual identity: warm light surfaces, learning-oriented accents, Sora headings, Inter operational text, restrained motion, landing-first public entry, and dashboard-first private usability.
