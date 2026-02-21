# Copilot / Agent Quick Guide for mi-huerto ✅

## Big picture
- Stack: **Vite + React + TypeScript** (client-only SPA) + **Supabase** (Postgres) as the backend. See `package.json` scripts for dev/build/lint/typecheck.
- UI is Spanish-first; date formatting uses `toLocaleDateString('es-ES')` and text is in Spanish across components.
- The app is small and client-driven: components query Supabase directly using the anon key (public client). Key files:
  - `src/lib/supabase.ts` — Supabase client and TypeScript interfaces (Bancal, TipoCultivo, Cultivo, EventoCultivo).
  - `src/utils/seedData.ts` — idempotent seeding logic invoked at startup.
  - `src/components/*` — main features: `GardenLayout`, `CropManager`, `CropInfo`, `CalendarView`.
  - `supabase/migrations/*` — SQL migrations (source of truth for DB schema).

## Developer workflows & commands 🔧
- Run locally: `npm run dev` (starts Vite dev server).
- Build: `npm run build` and preview with `npm run preview`.
- Static checks: `npm run lint` (ESLint) and `npm run typecheck` (tsc -p tsconfig.app.json).
- DB migrations: migrations are in `supabase/migrations/`. Use the **Supabase CLI** (e.g. `supabase db push` / `supabase migration apply`) to apply them to a project DB.
- Required env vars (Vite): **VITE_SUPABASE_URL** and **VITE_SUPABASE_ANON_KEY** — set these for local dev (client uses them at runtime).

## Important conventions & patterns 💡
- Database table and column names are Spanish and use snake_case: `bancales`, `tipos_cultivo`, `cultivos`, `eventos_cultivo`.
- Enumerated values are enforced in DB and expected by app code. Examples:
  - Cultivo `estado`: `sembrado`, `germinando`, `creciendo`, `floreciendo`, `cosechado`, `finalizado`.
  - Evento `tipo_evento`: `fertilizacion`, `riego`, `trasplante`, `poda`, `tratamiento`, `observacion`.
- Supabase query aliasing pattern is used to fetch relations inline. Example: 
  - `supabase.from('cultivos').select('*, tipo_cultivo:tipos_cultivo(*)')`
- UI refresh pattern: components accept a `refreshTrigger` or `onRefresh()` handler and call internal loaders (e.g., `loadCultivos()`) — follow this pattern when adding cross-component updates.
- Seed script is **idempotent**: `seedInitialData()` checks for existing records before inserting. It's called once on app startup in `src/App.tsx`.

## Schema / DB-specific notes ⚠️
- The initial migration (`20251217162900_create_urban_garden_schema.sql`) creates the tables, constraints, RLS policies and an `update_updated_at` trigger for `cultivos`.
- A later migration (`20251218103541_add_seedling_tray.sql`) adds a special `Semillero` (seed tray) by allowing `lado='semillero'`. Code expects a bancal with `lado === 'semillero'` and displays it separately (see `GardenLayout.tsx`).
- RLS policies in migrations are very permissive (policy names start with "Anyone...") — be cautious if you harden RLS policies; tests / seed operations assume public access.

## Typical tasks & checklist for code changes 🎯
- When changing table structure:
  1. Add a new SQL migration under `supabase/migrations/` (follow existing filename timestamps).
  2. Update TypeScript interfaces in `src/lib/supabase.ts` (fields and types must match DB).
  3. If data seeds are needed, update `src/utils/seedData.ts` and ensure idempotency.
  4. Update any components that `select()` data from Supabase to include new columns or join aliases.
- When adding new enum-like values (e.g., extra `estado`): update DB CHECK constraint via migration, then update UI select lists and any logic that depends on the values.

## Quick examples (copy-paste friendly) 🧾
- Fetch cultivos for a bancal: 
  - `supabase.from('cultivos').select('*, tipo_cultivo:tipos_cultivo(*)').eq('bancal_id', bancalId)`
- Add a transplant event after updating a cultivo: see `CropManager.tsx#handleTransplant()` for the pattern (update cultivo then insert into `eventos_cultivo`).

## Risks & gotchas 🔍
- Semillero is treated specially in the UI and controlled by a migration. If you create/alter `bancales.lado` values, ensure migrations and UI remain in sync.
- The client app uses the anon key with permissive RLS; do not assume server-side auth checks exist — if you harden RLS, update startup scripts and any local seeding/test flows.
- There are no unit tests in the repo; rely on `npm run typecheck` and manual QA flows until tests are added.

---
If anything above is unclear or you want the file to include more examples (e.g., sample Supabase CLI commands, recommended local .env setup, or a checklist for PR reviews), tell me which section to expand and I'll update it. ✅