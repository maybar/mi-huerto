/*
  # Add fixed border beds support

  - Add a `fijo` boolean to `bancales` (default false)
  - Allow 'superior' as a valid `lado`
  - Create three fixed border bancales (left/top/right) if they don't exist
  - Prevent deletion of fixed bancales via RLS policy
*/

-- Add 'fijo' column
ALTER TABLE bancales
  ADD COLUMN IF NOT EXISTS fijo boolean DEFAULT false;

-- Update CHECK constraint to include 'superior'
ALTER TABLE bancales
  DROP CONSTRAINT IF EXISTS bancales_lado_check;

ALTER TABLE bancales
  ADD CONSTRAINT bancales_lado_check CHECK (lado IN ('izquierda', 'derecha', 'borde', 'semillero', 'superior'));

-- Insert fixed border bancales if they don't exist
INSERT INTO bancales (nombre, lado, posicion, ancho, alto, notas, activo, fijo)
SELECT 'Borde Izquierdo', 'izquierda', -1, 1.0, 3.5, 'Bancal fijo en el borde izquierdo', true, true
WHERE NOT EXISTS (
  SELECT 1 FROM bancales WHERE nombre = 'Borde Izquierdo' AND lado = 'izquierda'
);

INSERT INTO bancales (nombre, lado, posicion, ancho, alto, notas, activo, fijo)
SELECT 'Borde Superior', 'superior', 0, 6.0, 1.0, 'Bancal fijo en la parte superior del huerto', true, true
WHERE NOT EXISTS (
  SELECT 1 FROM bancales WHERE nombre = 'Borde Superior' AND lado = 'superior'
);

INSERT INTO bancales (nombre, lado, posicion, ancho, alto, notas, activo, fijo)
SELECT 'Borde Derecho', 'derecha', -1, 1.0, 3.5, 'Bancal fijo en el borde derecho', true, true
WHERE NOT EXISTS (
  SELECT 1 FROM bancales WHERE nombre = 'Borde Derecho' AND lado = 'derecha'
);

-- Prevent deletion of fixed bancales via RLS
DROP POLICY IF EXISTS "Authenticated users can delete bancales" ON bancales;

CREATE POLICY "Authenticated users can delete bancales"
  ON bancales FOR DELETE
  TO authenticated
  USING (COALESCE(fijo, false) = false);
