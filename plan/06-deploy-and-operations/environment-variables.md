# Environment Variables

## Required Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## Optional Variables

- Email provider configuration if email invitations are enabled.
- Analytics configuration if product metrics are added.

## Security Rules

- Never expose service role keys to the browser.
- Keep production and local values separate.
- Do not commit `.env.local`.

## Acceptance Criteria

- Local setup instructions name every required variable.
- Production deployment has matching configured variables.
- Missing variables produce clear setup errors.
