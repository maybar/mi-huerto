/*
  # Fix Database Security Issues

  ## Changes Made

  1. **Remove Unused Indexes**
    - Drop `idx_cultivos_tipo` - Not used in queries
    - Drop `idx_cultivos_fecha_siembra` - Not used in queries
    - Keep `idx_cultivos_bancal` as it's used in foreign key lookups
    - Keep `idx_eventos_cultivo` for relationship lookups
    - Keep `idx_eventos_fecha` for calendar queries

  2. **Fix Function Search Path**
    - Recreate `update_updated_at_column` function with immutable search_path
    - This prevents role-based search path changes from affecting the function

  3. **Security Impact**
    - Removes unnecessary index maintenance overhead
    - Prevents unauthorized search_path modifications in trigger functions
    - Maintains query performance on essential relationships
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_cultivos_tipo;
DROP INDEX IF EXISTS idx_cultivos_fecha_siembra;

-- Recreate the trigger function with immutable search_path for security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql' IMMUTABLE SECURITY DEFINER SET search_path = public;

-- Recreate the trigger to apply the updated function
DROP TRIGGER IF EXISTS update_cultivos_updated_at ON cultivos;
CREATE TRIGGER update_cultivos_updated_at
  BEFORE UPDATE ON cultivos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
