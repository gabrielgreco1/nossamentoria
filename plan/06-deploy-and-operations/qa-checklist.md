# QA Checklist

## Mentor Matching — 22/10/2026

- [x] Mentor consegue definir limite entre zero e 50, nunca abaixo das relações ativas.
- [x] Mentor vê perfis disponíveis e usa **Adicionar mentorado**.
- [x] Mentorado vê apenas mentores com vagas e usa **Solicitar mentoria**.
- [x] Somente o destinatário aceita ou recusa a solicitação.
- [x] Os dois sentidos de aceite criam relação ativa em teste transacional.
- [x] Rollback confirmou zero relações e zero papéis de mentor de teste persistidos.
- [x] Typecheck, design system, build de produção, verificação de segredos e smoke test passaram.

## Profile Editing — 22/10/2026

- [x] Perfil compartilhado edita nome, apresentação e links.
- [x] Mentor edita especialidades, formação, horários de ensino e limite de mentorados.
- [x] Mentorado edita interesses e horários de aprendizado.
- [x] Horários de ensino e aprendizado são persistidos separadamente.
- [x] Testes transacionais de mentor e mentorado passaram sem deixar dados persistidos.
- [x] Build de produção e rota autenticada `/app/profile` passaram contra o servidor atualizado.

Run this checklist before marking launch or major feature cards as done.

## Automated Gates

Run from a clean install with the application available at `http://localhost:3000`:

```powershell
npm ci
npm run check
npm run qa:smoke
npm run qa:auth
```

- `npm run check`: validates environment configuration, TypeScript, production build and absence of the service role in browser bundles.
- `npm run qa:smoke`: verifies the landing, login, health endpoint, anonymous redirect and security headers. Set `QA_BASE_URL` to exercise Preview or Production.
- `npm run qa:auth`: locates the first database admin (or uses an optional `QA_ADMIN_EMAIL` override), creates a technical session without sending email, checks anonymous RLS, protected routes and the create/revoke invitation flow, then removes the test invitation. Revocation mirrors the server action: it validates the admin role before using the server-only privileged client.

Never save the optional `QA_ADMIN_EMAIL` override or test credentials in the repository. Use an existing controlled admin account.

## Auth And Access

- Uninvited user cannot access the app.
- Invited user can accept invitation.
- Role is assigned correctly.
- Mentor cannot see unrelated mentee plans.
- Mentee cannot see unrelated content.

## Core Flows

- Mentor can invite a mentee.
- Mentor can create a mentorship plan.
- Mentor can add lessons.
- Mentor can upload and attach materials.
- Mentor can schedule a session.
- Mentor can mark a session completed.
- Progress updates are visible.

## UI Checks

- Dashboard works on desktop.
- Core screens work on mobile.
- Empty states are understandable.
- Forms show validation errors.

## Release Evidence — 21 October 2026

| Check | State | Evidence / reason |
| --- | --- | --- |
| Environment contract | Passed locally | Four required variables validated without printing values. |
| TypeScript and production build | Passed locally | `npm run check` completed against Node.js 22. |
| Public routes and health | Passed locally | Landing, login and `/api/health` returned the expected responses. |
| Anonymous private access | Passed locally | `/app` redirects to login; anonymous profile reads return no rows under RLS. |
| Admin authentication and route | Passed locally | A technical magic-link session opened `/app` and `/app/admin`. |
| Admin invitation creation | Passed locally | A disposable invitation was persisted and returned a one-time token. |
| Admin invitation revocation | Passed locally | QA exposed a cross-table trigger defect; the correction was applied to `private.notify_domain_event`, revocation persisted and the disposable record was removed. |
| Service key bundle isolation | Passed locally | Exact configured service role was absent from `.next/static`. |
| Invitation acceptance by a new user | Pending | Requires custom SMTP, the auth hook and a controlled invited account. |
| Mentor versus unrelated mentee RLS | Pending — launch blocker | Requires separate mentor and mentee Auth users with seeded relationships. |
| Persisted plans, lessons, materials and sessions | Pending — launch blocker | Read surfaces are real and show production empty states; creation and editing actions are still pending. |
| Upload and private download in deployed app | Pending — launch blocker | Storage helper and private bucket exist; the UI mutation is not connected. |
| Mobile and desktop visual pass | Pending | Must be repeated on the final Preview URL after core persistence is complete. |
| Production smoke test | Pending | No Vercel Production deployment exists yet. |

Passing local automated gates is necessary but does not authorize launch while a row above is marked `launch blocker`.

## Manual Cross-Role Scenario

When the persistence blockers are resolved, create controlled mentor and mentee users and run this sequence:

1. Admin invites the mentor and mentee; each accepts only their own invitation.
2. Confirm the database assigns the intended roles and rejects an uninvited signup.
3. Mentor creates the relationship, activates a plan, adds a lesson and attaches a private material.
4. Mentee sees only the shared plan, lesson and material; a second unrelated mentee sees none of them.
5. Mentor proposes a session; mentee confirms; mentor completes it with notes and next actions.
6. Both users see the permitted progress update while private mentor notes stay hidden from the mentee.
7. Admin verifies the relationship and audit-relevant timestamps without using the service role in the browser.
8. Delete or clearly archive all QA records after capturing the release evidence.

## Acceptance Criteria

- Critical flows pass with at least one mentor and one mentee account.
- Any skipped test is documented before release.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder is the official NossaMentoria visual identity: warm light surfaces, learning-oriented accents, Sora headings, Inter operational text, restrained motion, landing-first public entry, and dashboard-first private usability.
