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

Use the visual identity defined in `plan/07-visual-identity-and-design/`. The app should combine cinematic dark surfaces, liquid-glass components, Instrument Serif headings, Barlow body text, and restrained motion with dense, readable dashboard layouts.

Do not implement the CDN-only setup from `prompt-design.md` in the production app. The prompt is design inspiration; the real app should use Next.js-managed dependencies and shared design components.

## Deployment

Use Vercel for the Next.js app unless a later decision changes hosting. Supabase remains the managed backend.

## Acceptance Criteria

- Local development can run with environment variables.
- Auth and database access are not mocked in production paths.
- The stack supports file uploads and private access control.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder adapts `prompt-design.md` into the official NossaMentoria visual identity: cinematic dark surfaces, liquid-glass components, Instrument Serif headings, Barlow operational text, restrained motion, and dashboard-first usability.
