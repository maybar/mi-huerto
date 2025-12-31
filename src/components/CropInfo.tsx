import { useEffect, useState } from 'react';
import { Thermometer, Droplets, Sun, Bug, Sprout, X, Ruler } from 'lucide-react';
import { Cultivo, TipoCultivo, supabase } from '../lib/supabase';

interface CropInfoProps {
  crop: Cultivo | null;
  onClose: () => void;
}

export default function CropInfo({ crop, onClose }: CropInfoProps) {
  const [tipoCultivo, setTipoCultivo] = useState<TipoCultivo | null>(null);

  useEffect(() => {
    if (crop?.tipo_cultivo_id) {
      loadTipoCultivo(crop.tipo_cultivo_id);
    }
  }, [crop]);

  const loadTipoCultivo = async (id: string) => {
    const { data } = await supabase
      .from('tipos_cultivo')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (data) setTipoCultivo(data);
  };

  if (!crop || !tipoCultivo) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-500 text-center">
          Selecciona un cultivo para ver su información técnica
        </p>
      </div>
    );
  }

  const InfoSection = ({ icon: Icon, title, content }: { icon: any; title: string; content: string }) => {
    if (!content) return null;

    return (
      <div className="border-l-4 border-green-500 pl-4 py-2">
        <div className="flex items-center gap-2 mb-2">
          <Icon size={20} className="text-green-600" />
          <h4 className="font-semibold text-gray-800">{title}</h4>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">{content}</p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-1">{tipoCultivo.nombre}</h2>
            {tipoCultivo.nombre_cientifico && (
              <p className="text-green-100 italic">{tipoCultivo.nombre_cientifico}</p>
            )}
            {tipoCultivo.familia && (
              <p className="text-green-100 text-sm mt-1">Familia: {tipoCultivo.familia}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sprout size={18} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Germinación</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{tipoCultivo.dias_germinacion} días</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sprout size={18} className="text-green-600" />
              <span className="text-sm font-medium text-gray-700">Cosecha</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{tipoCultivo.dias_cosecha} días</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Thermometer size={20} className="text-red-600" />
            <h4 className="font-semibold text-gray-800">Temperatura de Germinación</h4>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mínima</p>
              <p className="text-xl font-bold text-gray-900">{tipoCultivo.temp_germinacion_min}°C</p>
            </div>
            <div className="text-2xl text-gray-400">-</div>
            <div>
              <p className="text-sm text-gray-600">Máxima</p>
              <p className="text-xl font-bold text-gray-900">{tipoCultivo.temp_germinacion_max}°C</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Thermometer size={20} className="text-orange-600" />
            <h4 className="font-semibold text-gray-800">Temperatura de Crecimiento</h4>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mínima</p>
              <p className="text-xl font-bold text-gray-900">{tipoCultivo.temp_crecimiento_min}°C</p>
            </div>
            <div className="text-2xl text-gray-400">-</div>
            <div>
              <p className="text-sm text-gray-600">Máxima</p>
              <p className="text-xl font-bold text-gray-900">{tipoCultivo.temp_crecimiento_max}°C</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Ruler size={20} className="text-blue-600" />
            <h4 className="font-semibold text-gray-800">Distancias de Siembra</h4>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Entre líneas</p>
              <p className="text-xl font-bold text-gray-900">{tipoCultivo.separacion_lineas} cm</p>
            </div>
            <div className="text-2xl text-gray-400">•</div>
            <div>
              <p className="text-sm text-gray-600">Entre plantas</p>
              <p className="text-xl font-bold text-gray-900">{tipoCultivo.separacion_plantas} cm</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <InfoSection
            icon={Bug}
            title="Plagas y Enfermedades"
            content={tipoCultivo.info_plagas}
          />

          <InfoSection
            icon={Droplets}
            title="Riego"
            content={tipoCultivo.info_riego}
          />

          <InfoSection
            icon={Sun}
            title="Luz"
            content={tipoCultivo.info_luz}
          />

          <InfoSection
            icon={Sprout}
            title="Suelo"
            content={tipoCultivo.info_suelo}
          />

          {tipoCultivo.info_general && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Información General</h4>
              <p className="text-gray-700 text-sm leading-relaxed">{tipoCultivo.info_general}</p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2">Estado Actual del Cultivo</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-gray-600">Fecha de Siembra</p>
              <p className="font-medium">
                {new Date(crop.fecha_siembra).toLocaleDateString('es-ES')}
              </p>
            </div>
            {crop.fecha_cosecha_estimada && (
              <div>
                <p className="text-sm text-gray-600">Cosecha Estimada</p>
                <p className="font-medium">
                  {new Date(crop.fecha_cosecha_estimada).toLocaleDateString('es-ES')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
