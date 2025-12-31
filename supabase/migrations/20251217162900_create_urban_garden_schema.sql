/*
  # Urban Garden Management System Schema

  ## Overview
  This migration creates a comprehensive database schema for managing an urban garden with bancales (raised beds), 
  crops, and cultivation tracking.

  ## New Tables

  ### 1. bancales (raised beds)
    - `id` (uuid, primary key) - Unique identifier
    - `nombre` (text) - Name of the bancal (e.g., "Bancal A")
    - `lado` (text) - Side of the garden: 'izquierda', 'derecha', 'borde'
    - `posicion` (integer) - Position order on that side
    - `ancho` (numeric) - Width in meters
    - `alto` (numeric) - Height in meters
    - `posicion_x` (numeric) - X coordinate for visual layout
    - `posicion_y` (numeric) - Y coordinate for visual layout
    - `notas` (text) - General notes about the bancal
    - `activo` (boolean) - Whether the bancal is currently active
    - `created_at` (timestamptz) - Creation timestamp

  ### 2. tipos_cultivo (crop types catalog)
    - `id` (uuid, primary key) - Unique identifier
    - `nombre` (text) - Crop name (e.g., "Tomate", "Lechuga")
    - `nombre_cientifico` (text) - Scientific name
    - `familia` (text) - Plant family
    - `dias_germinacion` (integer) - Days to germination
    - `dias_cosecha` (integer) - Days from planting to harvest
    - `temp_germinacion_min` (numeric) - Minimum germination temperature (°C)
    - `temp_germinacion_max` (numeric) - Maximum germination temperature (°C)
    - `temp_crecimiento_min` (numeric) - Minimum growth temperature (°C)
    - `temp_crecimiento_max` (numeric) - Maximum growth temperature (°C)
    - `info_plagas` (text) - Information about pests and diseases
    - `info_suelo` (text) - Soil requirements
    - `info_riego` (text) - Watering requirements
    - `info_luz` (text) - Light requirements
    - `info_general` (text) - General information
    - `created_at` (timestamptz) - Creation timestamp

  ### 3. cultivos (planted crops)
    - `id` (uuid, primary key) - Unique identifier
    - `bancal_id` (uuid, foreign key) - Reference to bancales table
    - `tipo_cultivo_id` (uuid, foreign key) - Reference to tipos_cultivo table
    - `fecha_siembra` (date) - Planting date
    - `fecha_cosecha_estimada` (date) - Estimated harvest date
    - `fecha_cosecha_real` (date) - Actual harvest date
    - `estado` (text) - Status: 'sembrado', 'germinando', 'creciendo', 'floreciendo', 'cosechado', 'finalizado'
    - `cantidad` (text) - Quantity planted (e.g., "10 plantas", "1 fila")
    - `notas_siembra` (text) - Planting notes
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ### 4. eventos_cultivo (crop events/activities)
    - `id` (uuid, primary key) - Unique identifier
    - `cultivo_id` (uuid, foreign key) - Reference to cultivos table
    - `fecha` (date) - Event date
    - `tipo_evento` (text) - Event type: 'fertilizacion', 'riego', 'trasplante', 'poda', 'tratamiento', 'observacion'
    - `descripcion` (text) - Event description
    - `fertilizante` (text) - Fertilizer used (for fertilization events)
    - `cantidad` (text) - Quantity applied
    - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their garden data
*/

-- Create bancales table
CREATE TABLE IF NOT EXISTS bancales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  lado text NOT NULL CHECK (lado IN ('izquierda', 'derecha', 'borde')),
  posicion integer NOT NULL DEFAULT 0,
  ancho numeric DEFAULT 1.2,
  alto numeric DEFAULT 3.0,
  posicion_x numeric DEFAULT 0,
  posicion_y numeric DEFAULT 0,
  notas text DEFAULT '',
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create tipos_cultivo table
CREATE TABLE IF NOT EXISTS tipos_cultivo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  nombre_cientifico text DEFAULT '',
  familia text DEFAULT '',
  dias_germinacion integer DEFAULT 7,
  dias_cosecha integer DEFAULT 60,
  temp_germinacion_min numeric DEFAULT 15,
  temp_germinacion_max numeric DEFAULT 25,
  temp_crecimiento_min numeric DEFAULT 10,
  temp_crecimiento_max numeric DEFAULT 30,
  info_plagas text DEFAULT '',
  info_suelo text DEFAULT '',
  info_riego text DEFAULT '',
  info_luz text DEFAULT '',
  info_general text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create cultivos table
CREATE TABLE IF NOT EXISTS cultivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bancal_id uuid NOT NULL REFERENCES bancales(id) ON DELETE CASCADE,
  tipo_cultivo_id uuid NOT NULL REFERENCES tipos_cultivo(id) ON DELETE RESTRICT,
  fecha_siembra date NOT NULL,
  fecha_cosecha_estimada date,
  fecha_cosecha_real date,
  estado text DEFAULT 'sembrado' CHECK (estado IN ('sembrado', 'germinando', 'creciendo', 'floreciendo', 'cosechado', 'finalizado')),
  cantidad text DEFAULT '',
  notas_siembra text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create eventos_cultivo table
CREATE TABLE IF NOT EXISTS eventos_cultivo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cultivo_id uuid NOT NULL REFERENCES cultivos(id) ON DELETE CASCADE,
  fecha date NOT NULL,
  tipo_evento text NOT NULL CHECK (tipo_evento IN ('fertilizacion', 'riego', 'trasplante', 'poda', 'tratamiento', 'observacion')),
  descripcion text DEFAULT '',
  fertilizante text DEFAULT '',
  cantidad text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cultivos_bancal ON cultivos(bancal_id);
CREATE INDEX IF NOT EXISTS idx_cultivos_tipo ON cultivos(tipo_cultivo_id);
CREATE INDEX IF NOT EXISTS idx_cultivos_fecha_siembra ON cultivos(fecha_siembra);
CREATE INDEX IF NOT EXISTS idx_eventos_cultivo ON eventos_cultivo(cultivo_id);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos_cultivo(fecha);

-- Enable Row Level Security
ALTER TABLE bancales ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_cultivo ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_cultivo ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bancales
CREATE POLICY "Anyone can view bancales"
  ON bancales FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert bancales"
  ON bancales FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update bancales"
  ON bancales FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete bancales"
  ON bancales FOR DELETE
  TO public
  USING (true);

-- Create RLS policies for tipos_cultivo
CREATE POLICY "Anyone can view crop types"
  ON tipos_cultivo FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert crop types"
  ON tipos_cultivo FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update crop types"
  ON tipos_cultivo FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete crop types"
  ON tipos_cultivo FOR DELETE
  TO public
  USING (true);

-- Create RLS policies for cultivos
CREATE POLICY "Anyone can view cultivos"
  ON cultivos FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert cultivos"
  ON cultivos FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update cultivos"
  ON cultivos FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete cultivos"
  ON cultivos FOR DELETE
  TO public
  USING (true);

-- Create RLS policies for eventos_cultivo
CREATE POLICY "Anyone can view eventos"
  ON eventos_cultivo FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert eventos"
  ON eventos_cultivo FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update eventos"
  ON eventos_cultivo FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete eventos"
  ON eventos_cultivo FOR DELETE
  TO public
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for cultivos table
CREATE TRIGGER update_cultivos_updated_at
  BEFORE UPDATE ON cultivos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();