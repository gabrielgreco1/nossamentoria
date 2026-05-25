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

Use a dashboard-first visual system: restrained colors, dense but readable layouts, cards only for repeated items and tool surfaces.

## Deployment

Use Vercel for the Next.js app unless a later decision changes hosting. Supabase remains the managed backend.

## Acceptance Criteria

- Local development can run with environment variables.
- Auth and database access are not mocked in production paths.
- The stack supports file uploads and private access control.
