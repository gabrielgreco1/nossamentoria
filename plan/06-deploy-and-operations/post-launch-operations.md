# Post Launch Operations

## Admin Routine

- Review invitations.
- Confirm new users have correct roles.
- Check active relationships.
- Help mentors if they attach content incorrectly.

## Mentor Routine

- Review mentee dashboard.
- Keep plans updated.
- Schedule next sessions.
- Mark completed classes.
- Add progress notes and next actions.

## Mentee Routine

- Review plan and upcoming sessions.
- Access materials.
- Follow next actions.
- Read shared notes.

## Feedback Loop

Collect feedback manually at first:

- What was hard to find?
- Which class tracking fields were missing?
- Which materials were difficult to organize?
- Did mentors actually update progress after sessions?

Record feedback without copying private mentorship notes or material contents into issue trackers. Convert repeated observations into a small, prioritized product change only after identifying the affected role and workflow.

## Operating Cadence

### Every working day

- Check failed login reports, invitation delivery and `/api/health`.
- Review pending invitations older than expected and revoke only after confirming with the inviter.
- Check Vercel runtime errors and Supabase Auth/API errors without copying tokens or private content into logs.

### Every week

- Review users and role assignments, especially mixed-role and administrator accounts.
- Review active relationships with no upcoming session or recent progress.
- Check Supabase Database, Storage and egress usage plus Vercel usage against the current free quotas.
- Export the database schema to private storage when schema or policies change.
- Triage feedback into bug, usability issue, missing workflow or future enhancement.

### Every month

- Remove obsolete invitations and clearly identified technical QA records.
- Review administrator access and rotate compromised credentials immediately.
- Test one invite, one authenticated session and one private material access path.
- Confirm the Supabase project has not been paused for inactivity and that the restoration owner is known.

## Zero-Cost Capacity Rules

- Do not enable paid Supabase or Vercel features automatically.
- Recheck hosting plan eligibility when the product's use changes; Vercel Hobby cannot be used for commercial activity.
- When a provider dashboard reaches 70% of an included quota, reduce avoidable usage and record the trend.
- At 90%, pause nonessential uploads or automated testing that creates external usage and ask for a product decision.
- Keep uploaded materials at or below the existing 50 MB application limit.
- Use platform logs for short-term diagnosis; do not add paid observability before usage demonstrates the need.
- Custom SMTP must use an explicitly selected provider and verified sender. Free-tier availability must be rechecked when configuring it.

## Incident Routine

1. Classify impact: authentication, authorization/data exposure, data loss, upload failure or availability.
2. For suspected unauthorized access, stop new invitations and disable the affected route or credential first.
3. Record UTC and local timestamps, affected deployment, commit, scope and user-visible symptoms without secrets.
4. Roll back the Vercel deployment for application regressions; use a forward SQL correction for schema or policy defects.
5. Validate health, auth and the affected cross-role path before reopening access.
6. Write the cause, correction and prevention action in `operations/incident-record-template.md`.

## Data Recovery On The Free Plan

- Keep schema exports outside the public repository and never embed credentials in them.
- Export irreplaceable business data manually before risky schema changes.
- Test imports in a disposable environment when one is available; never test recovery by overwriting the live project.
- A paused Supabase project is restored from the provider dashboard and then checked with `/api/health`, Auth and one RLS-protected query.

## Operational Records

- Copy `operations/release-record-template.md` for every Preview promotion or production release.
- Copy `operations/incident-record-template.md` for incidents that affect access, permissions, data or availability.
- Store completed records privately if they include emails, internal URLs or user identifiers.

## Current Status — 21 October 2026

- Runbook and reusable record templates: ready.
- First production release record: pending Vercel deployment.
- Real usage feedback loop: starts only after invited mentor and mentee accounts complete launch QA.

## Acceptance Criteria

- The platform can be operated manually without paid features.
- Admin can keep the private community controlled.
- Product improvements come from real mentor and mentee usage.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder is the official NossaMentoria visual identity: warm light surfaces, learning-oriented accents, Sora headings, Inter operational text, restrained motion, landing-first public entry, and dashboard-first private usability.
