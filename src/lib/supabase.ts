import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Bancal {
  id: string;
  nombre: string;
  lado: 'izquierda' | 'derecha' | 'borde' | 'superior' | 'semillero';
  posicion: number;
  ancho: number;
  alto: number;
  posicion_x: number;
  posicion_y: number;
  notas: string;
  activo: boolean;
  fijo?: boolean;
  created_at: string;
}

export interface TipoCultivo {
  id: string;
  nombre: string;
  nombre_cientifico: string;
  familia: string;
  dias_germinacion: number;
  dias_cosecha: number;
  temp_germinacion_min: number;
  temp_germinacion_max: number;
  temp_crecimiento_min: number;
  temp_crecimiento_max: number;
  separacion_lineas: number;
  separacion_plantas: number;
  info_plagas: string;
  info_suelo: string;
  info_riego: string;
  info_luz: string;
  info_general: string;
  created_at: string;
}

export interface Cultivo {
  id: string;
  bancal_id: string;
  tipo_cultivo_id: string;
  fecha_siembra: string;
  fecha_cosecha_estimada: string | null;
  fecha_cosecha_real: string | null;
  estado: 'sembrado' | 'germinando' | 'creciendo' | 'floreciendo' | 'cosechado' | 'finalizado';
  cantidad: string;
  notas_siembra: string;
  created_at: string;
  updated_at: string;
  tipo_cultivo?: TipoCultivo;
  bancal?: Bancal;
}

export interface EventoCultivo {
  id: string;
  cultivo_id: string;
  fecha: string;
  tipo_evento: 'fertilizacion' | 'riego' | 'trasplante' | 'poda' | 'tratamiento' | 'observacion';
  descripcion: string;
  fertilizante: string;
  cantidad: string;
  created_at: string;
}
