/*
  # Add Peas (Guisantes) Crop Type

  ## Overview
  This migration adds Peas (Guisantes) to the available crop types in the garden management system.

  ## New Crop Type
  - Guisantes (Peas) - Pisum sativum

  ## Important Notes
  - Uses IF NOT EXISTS to avoid conflicts with existing crops
  - Realistic germination and harvest times for peas
  - Temperature requirements suitable for temperate climates
*/

INSERT INTO tipos_cultivo (nombre, nombre_cientifico, familia, dias_germinacion, dias_cosecha, temp_germinacion_min, temp_germinacion_max, temp_crecimiento_min, temp_crecimiento_max, info_general)
VALUES
  ('Guisantes', 'Pisum sativum', 'Fabaceae', 8, 65, 10, 20, 10, 20, 'Cultivo de clima frío. Prefiere temperaturas moderadas. Excelente para bancales y enrejados. Fija nitrógeno en el suelo. Sembrar directamente en bancal. Requiere riego regular durante la floración.')
ON CONFLICT (nombre) DO NOTHING;
