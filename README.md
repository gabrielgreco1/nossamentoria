# NossaMentoria

Private mentorship platform built with Next.js App Router and Supabase.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill the Supabase values:

```bash
cp .env.example .env.local
```

3. Run the app:

```bash
npm run dev
```

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## Project Control

Development status is tracked in `kanban.html`. Specs live under `plan/`.
