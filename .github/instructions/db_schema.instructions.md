---
description: 'Database schema and DB specific notes'
applyTo: '**/*.sql'
---


## Schema / DB-specific notes ⚠️
- The initial migration (`20251217162900_create_urban_garden_schema.sql`) creates the tables, constraints, RLS policies and an `update_updated_at` trigger for `cultivos`.
- A later migration (`20251218103541_add_seedling_tray.sql`) adds a special `Semillero` (seed tray) by allowing `lado='semillero'`. Code expects a bancal with `lado === 'semillero'` and displays it separately (see `GardenLayout.tsx`).
- RLS policies in migrations are very permissive (policy names start with "Anyone...") — be cautious if you harden RLS policies; tests / seed operations assume public access.