/*
  # Add New Crop Types

  ## Overview
  This migration adds 5 new crop types to the garden management system.

  ## New Crop Types
  - Cebolla (Onion)
  - Puerro (Leek)
  - Coliflor (Cauliflower)
  - Lombarda (Red Cabbage)
  - Perejil (Parsley)

  ## Important Notes
  - Uses IF NOT EXISTS to avoid conflicts with existing crops
  - Each crop includes realistic germination and harvest times
  - Temperature requirements for Peru's climates
*/

INSERT INTO tipos_cultivo (nombre, nombre_cientifico, familia, dias_germinacion, dias_cosecha, temp_germinacion_min, temp_germinacion_max, temp_crecimiento_min, temp_crecimiento_max, info_general)
VALUES
  ('Cebolla', 'Allium cepa', 'Amaryllidaceae', 10, 120, 15, 25, 12, 28, 'Cultivo de ciclo largo. Requiere suelo bien drenado y rico en materia orgánica. Se puede sembrar en cama o bancal.'),
  ('Puerro', 'Allium porrum', 'Amaryllidaceae', 10, 150, 15, 25, 12, 28, 'Similar a la cebolla pero de ciclo más largo. Requiere suelo profundo y bien preparado. Excelente para climas fríos de altura.'),
  ('Coliflor', 'Brassica oleracea var. botrytis', 'Brassicaceae', 7, 70, 18, 25, 15, 25, 'Requiere temperaturas moderadas. Necesita suelo rico en nitrógeno. Sensible al estrés hídrico durante la formación de inflorescencia.'),
  ('Lombarda', 'Brassica oleracea var. capitata', 'Brassicaceae', 7, 90, 18, 25, 15, 25, 'Variedad de repollo rojo. Muy resistente a plagas. Requiere suelo fértil y bien drenado. Buen almacenamiento post-cosecha.'),
  ('Perejil', 'Petroselinum crispum', 'Apiaceae', 14, 90, 15, 25, 12, 28, 'Germinación lenta. Puede sembrarse directamente en bancal. Prefiere sombra parcial en climas cálidos. Requiere humedad constante.')
ON CONFLICT (nombre) DO NOTHING;
