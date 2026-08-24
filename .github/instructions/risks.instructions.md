---
description: 'Risks & gotchas'
applyTo: '**/*.*'
---

<!-- Tip: Use /create-instructions in chat to generate content with agent assistance -->

## Risks & gotchas 🔍
- Semillero is treated specially in the UI and controlled by a migration. If you create/alter `bancales.lado` values, ensure migrations and UI remain in sync.
- The client app uses the anon key with permissive RLS; do not assume server-side auth checks exist — if you harden RLS, update startup scripts and any local seeding/test flows.
- There are no unit tests in the repo; rely on `npm run typecheck` and manual QA flows until tests are added.