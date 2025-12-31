/*
  # Add Sowing Distance Columns and New Crop Types

  ## Overview
  This migration adds sowing distance information columns to tipos_cultivo table,
  and adds two new crop types: Escarola and Canónigos.

  ## Modified Tables
  - `tipos_cultivo`
    - `separacion_lineas` (integer) - Distance between rows in cm
    - `separacion_plantas` (integer) - Distance between plants in cm

  ## New Crop Types
  - Escarola (Cichorium endivia) - Endive
  - Canónigos (Valerianella locusta) - Corn salad/Mâche

  ## Important Notes
  - Sowing distances are in centimeters
  - Both crops are cool-season leafy greens
  - Uses IF NOT EXISTS to prevent duplicate additions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tipos_cultivo' AND column_name = 'separacion_lineas'
  ) THEN
    ALTER TABLE tipos_cultivo ADD COLUMN separacion_lineas integer DEFAULT 30;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tipos_cultivo' AND column_name = 'separacion_plantas'
  ) THEN
    ALTER TABLE tipos_cultivo ADD COLUMN separacion_plantas integer DEFAULT 20;
  END IF;
END $$;

INSERT INTO tipos_cultivo (nombre, nombre_cientifico, familia, dias_germinacion, dias_cosecha, temp_germinacion_min, temp_germinacion_max, temp_crecimiento_min, temp_crecimiento_max, separacion_lineas, separacion_plantas, info_general)
VALUES
  ('Escarola', 'Cichorium endivia', 'Asteraceae', 10, 90, 12, 22, 10, 20, 30, 25, 'Verdura de hoja rizada muy resistente. Prefiere temperaturas frescas. Requiere suelo rico en materia orgánica y bien drenado. Se puede cosechar en hojas o planta completa. Buen almacenamiento.'),
  ('Canónigos', 'Valerianella locusta', 'Valerianaceae', 8, 50, 10, 20, 8, 18, 25, 15, 'Microhoja tierna y delicada. Cultivo rápido ideal para huertos urbanos. Muy resistente al frío. Se cosecha cuando las plantas tienen 5-8 cm. Ideal para ensaladas frescas.')
ON CONFLICT (nombre) DO NOTHING;
