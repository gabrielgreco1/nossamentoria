# Deploy And Operations

This phase defines how the MVP reaches real users and how it is operated after launch.

## Specs

- `deployment-plan.md`: hosting and release flow.
- `environment-variables.md`: required configuration.
- `qa-checklist.md`: validation before launch.
- `post-launch-operations.md`: running the private community.

## MVP Operations Goal

Launch a private, reliable enough tool for Gabriel and invited mentors/mentees.

## Current Readiness — 21 October 2026

| Area | State | Evidence or remaining work |
| --- | --- | --- |
| Application | Ready locally | TypeScript and production builds pass; public, auth and protected routes exist. |
| Supabase | Provisioned | Auth, schema, RLS, RPCs, seed templates and the private `materials` bucket exist. |
| Administration | Partially operational | The first admin can access the protected area and create or revoke invitations. |
| Core editor persistence | Launch blocker | Read surfaces use real Supabase data; creation and editing for plans, materials, lessons, sessions and notes still need persistent actions. |
| Email delivery | Launch blocker | Supabase's default sender is suitable only for testing; custom SMTP and branded templates are required for invited real users. |
| Registration enforcement | Partially operational | The Before User Created hook validates complete mentor/mentee profiles and restricts administrators to valid admin invitations; end-to-end email confirmation still depends on SMTP. |
| Hosting | Not connected | The repository is prepared for Vercel, but no preview or production project is linked yet. |
| Hosting eligibility | Confirmed for current use | NossaMentoria is currently philanthropic and non-commercial, so Vercel Hobby is eligible; reassess before any commercial use. |
| Cross-role QA | Not run | Real mentor and mentee test accounts are still required for end-to-end RLS validation. |

`Ready locally` never means `validated in production`. A production item is closed only when its URL, environment configuration and test evidence are recorded without including secrets.

## Zero-Cost Guardrails

- Keep one Supabase project for the MVP unless a separate environment fits the current free quotas.
- Use Vercel Hobby only if NossaMentoria is personal and non-commercial under the provider's current terms; otherwise choose an eligible host or accept a paid hosting plan before deployment.
- Use Vercel Preview deployments instead of creating a paid custom staging environment.
- Keep uploads private, limited to 50 MB per file, and review Storage and egress usage regularly.
- Do not enable paid database add-ons, custom domains, analytics or observability products without an explicit decision.
- Keep an external private schema export because downloadable backups are not included in the Supabase Free Plan.
- Expect inactive free Supabase projects to be paused and document restoration as an operational action.

## Delivery Order

1. Validate and document environment configuration.
2. Run repository checks and the local QA matrix.
3. Persist the remaining core editor flows and test RLS with mentor and mentee accounts.
4. Configure custom SMTP, branded auth templates and verify registration/admin-invitation enforcement.
5. Create a Vercel Preview deployment and repeat QA against it.
6. Promote the verified commit to Production and start the post-launch routine.

## Card Status

- Overview: complete.
- Deployment plan: repository preparation and current Hobby eligibility passed; awaiting Preview/Production evidence.
- Environment variables: local validation and fail-closed behavior passed; awaiting Vercel environment configuration.
- QA checklist: automated local checks, invitation revocation and cleanup pass; cross-role, persisted core flows and deployed tests remain pending.
- Post-launch operations: complete as a runbook with reusable release and incident templates.

## Acceptance Criteria

- Deployment steps are documented.
- Environment variables are known.
- QA covers auth, permissions, uploads, plans, sessions, and progress.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder is the official NossaMentoria visual identity: warm light surfaces, learning-oriented accents, Sora headings, Inter operational text, restrained motion, landing-first public entry, and dashboard-first private usability.
