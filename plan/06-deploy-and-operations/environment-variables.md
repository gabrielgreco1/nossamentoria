# Environment Variables

## Required Variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server | HTTPS API URL shown in Supabase Project Settings. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser and server | Public anon/publishable key; authorization still depends on RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Privileged Auth and invitation operations that intentionally bypass RLS. |
| `NEXT_PUBLIC_APP_URL` | Browser and server | Exact application origin used in auth redirects and invitation links, without a trailing path. |

Copy `.env.example` to `.env.local` for normal local development. The existing local `.env` is also supported, ignored by Git and should not be copied into Vercel.

Run `npm run check:env` before builds. The check reads local environment files when present, validates required URLs and key separation, and prints only variable names — never values.

## Values By Environment

| Environment | `NEXT_PUBLIC_APP_URL` | Supabase values |
| --- | --- | --- |
| Local | `http://localhost:3000` | Current development project. |
| Vercel Preview | Stable HTTPS branch URL | Current project for the initial zero-cost workflow. RLS prevents preview data from becoming public. |
| Production | Final HTTPS production domain | Current project until a separately funded production project is approved. |

Using the same free Supabase project for Preview and Production saves cost but does not isolate data. Preview testing must therefore use clearly identified test records and remove them after the run.

Any environment variable change requires a new Vercel deployment; it does not alter deployments that already exist.

## Optional Variables

- None are consumed by the application today.
- `SUPABASE_CONNECTIONS` is not an application variable. It may be added temporarily for an authorized database maintenance task and should be removed immediately afterward.
- Custom SMTP credentials belong in Supabase Authentication settings, not in the Next.js browser environment.
- Analytics variables may be introduced only when the corresponding feature is implemented and approved.

## Security Rules

- Never expose service role keys to the browser.
- Keep production and local values separate.
- Do not commit any `.env` variant except the empty `.env.example` contract.
- Keep `.vercel/` local because it contains project linkage metadata.
- Never paste key values into logs, issues, the Kanban or release records.
- The server-only Supabase client imports `server-only` so an accidental client import fails during the build.
- Missing or invalid production configuration redirects the private workspace to the setup-safe login state; it never enables the local preview workspace.

## External Dashboard Configuration

These settings are required but are not repository environment variables:

- Supabase Site URL: the production application origin.
- Supabase Redirect URLs: local callback, stable Preview callback and Production callback.
- Custom SMTP sender and credentials: configured in Supabase Authentication.
- Branded email subjects and HTML templates: configured in Supabase Authentication.
- Before User Created hook: enable only after the first admin and invitation flow are verified.

## Current Status — 21 October 2026

- Local required variables: configured and testable without a PostgreSQL connection string.
- The temporary Session Pool connection was used to apply and verify the trigger correction; it is no longer required by the application.
- Repository secret isolation and validation command: implemented.
- Vercel Preview and Production variables: pending project connection.
- SMTP settings and production URLs: pending external configuration.

## Acceptance Criteria

- Local setup instructions name every required variable.
- Production deployment has matching configured variables.
- Missing variables produce clear setup errors.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder is the official NossaMentoria visual identity: warm light surfaces, learning-oriented accents, Sora headings, Inter operational text, restrained motion, landing-first public entry, and dashboard-first private usability.
