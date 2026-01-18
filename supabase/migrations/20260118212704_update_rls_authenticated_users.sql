/*
  # Update RLS Policies for Authenticated Users

  ## Overview
  This migration updates Row Level Security policies to require authentication
  for creating, updating, and deleting data. READ access remains public.

  ## Changes
  - Restrict INSERT, UPDATE, DELETE to authenticated users only
  - Keep SELECT public for viewing crop information
  - Ensures data integrity while allowing public read access to crop catalog

  ## Important Notes
  - Users must be authenticated to modify their garden data
  - Public users can still view crop types and existing data (read-only)
  - Deletion and modification operations require valid authentication
*/

DROP POLICY IF EXISTS "Anyone can insert bancales" ON bancales;
DROP POLICY IF EXISTS "Anyone can update bancales" ON bancales;
DROP POLICY IF EXISTS "Anyone can delete bancales" ON bancales;

DROP POLICY IF EXISTS "Anyone can insert crop types" ON tipos_cultivo;
DROP POLICY IF EXISTS "Anyone can update crop types" ON tipos_cultivo;
DROP POLICY IF EXISTS "Anyone can delete crop types" ON tipos_cultivo;

DROP POLICY IF EXISTS "Anyone can insert cultivos" ON cultivos;
DROP POLICY IF EXISTS "Anyone can update cultivos" ON cultivos;
DROP POLICY IF EXISTS "Anyone can delete cultivos" ON cultivos;

DROP POLICY IF EXISTS "Anyone can insert eventos" ON eventos_cultivo;
DROP POLICY IF EXISTS "Anyone can update eventos" ON eventos_cultivo;
DROP POLICY IF EXISTS "Anyone can delete eventos" ON eventos_cultivo;

CREATE POLICY "Authenticated users can insert bancales"
  ON bancales FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update bancales"
  ON bancales FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete bancales"
  ON bancales FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert crop types"
  ON tipos_cultivo FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update crop types"
  ON tipos_cultivo FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete crop types"
  ON tipos_cultivo FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert cultivos"
  ON cultivos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cultivos"
  ON cultivos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete cultivos"
  ON cultivos FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert eventos"
  ON eventos_cultivo FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update eventos"
  ON eventos_cultivo FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete eventos"
  ON eventos_cultivo FOR DELETE
  TO authenticated
  USING (true);
