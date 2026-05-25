# Technical Stack

## Frontend

- Next.js App Router.
- TypeScript.
- Server components for data-backed pages where appropriate.
- Client components for interactive forms, Kanban-like lists, uploads, and calendar controls.

## Backend

- Supabase Auth for identity.
- Supabase Postgres for domain data.
- Supabase Storage for materials.
- Row Level Security for access boundaries.

## Styling

Use the visual identity defined in `plan/07-visual-identity-and-design/`. The app should combine warm light surfaces, learning-oriented color accents, Sora headings, Inter body text, restrained motion, and dense readable dashboard layouts.

Do not implement the CDN-only setup from `prompt-design.md` in the production app. The prompt is design inspiration; the real app should use Next.js-managed dependencies and shared design components.

## Deployment

Use Vercel for the Next.js app unless a later decision changes hosting. Supabase remains the managed backend.

## Acceptance Criteria

- Local development can run with environment variables.
- Auth and database access are not mocked in production paths.
- The stack supports file uploads and private access control.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder is the official NossaMentoria visual identity: warm light surfaces, learning-oriented accents, Sora headings, Inter operational text, restrained motion, landing-first public entry, and dashboard-first private usability.
