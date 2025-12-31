/*
  # Add Seedling Tray Support

  ## Overview
  This migration adds support for a special "Semillero" (seedling tray) that exists in the home,
  not in the garden. Users can manage seedlings and transplant them to garden beds when ready.

  ## Changes

  1. Allow 'semillero' as a valid side value in bancales table
  2. Create initial seedling tray record
  3. Add index for querying seedling trays

  ## Important Notes
  - The semillero is a special bancal with lado='semillero'
  - It displays separately in the UI above the main garden layout
  - Crops can be transplanted from semillero to other bancales
*/

-- Update CHECK constraint to include 'semillero' as a valid side
ALTER TABLE bancales
DROP CONSTRAINT bancales_lado_check;

ALTER TABLE bancales
ADD CONSTRAINT bancales_lado_check CHECK (lado IN ('izquierda', 'derecha', 'borde', 'semillero'));

-- Create the seedling tray if it doesn't exist
INSERT INTO bancales (nombre, lado, posicion, ancho, alto, notas, activo)
SELECT 'Semillero', 'semillero', 0, 1.5, 0.5, 'Bandejas de semillas en casa', true
WHERE NOT EXISTS (
  SELECT 1 FROM bancales WHERE nombre = 'Semillero' AND lado = 'semillero'
);

-- Add index for seedling tray lookups
CREATE INDEX IF NOT EXISTS idx_bancales_lado ON bancales(lado);
