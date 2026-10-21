# NossaMentoria Release Record

## Identification

- Release date and time:
- Operator:
- Git commit:
- Preview URL:
- Production URL:
- Previous production deployment:

## Gates

- [ ] `npm ci`
- [ ] `npm run check`
- [ ] `npm run qa:smoke` against Preview
- [ ] `npm run qa:auth` against Preview
- [ ] Manual mentor/mentee scenario
- [ ] Supabase migrations and RLS confirmed
- [ ] Auth Site URL and redirect URLs confirmed
- [ ] SMTP and branded templates confirmed
- [ ] Storage upload and private download confirmed

## Promotion

- Preview deployment ID:
- Production deployment ID:
- Database change reference:
- Known limitations communicated:

## Production Verification

- [ ] `/api/health` is healthy
- [ ] Landing and login load
- [ ] Anonymous `/app` access is denied
- [ ] Invitation email arrives with NossaMentoria sender
- [ ] Admin, mentor and mentee permissions pass
- [ ] No new critical errors in provider logs

## Rollback Decision

- Result: approved / rolled back
- Reason:
- Rollback deployment or corrective change:
