import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Calendar, FileText, ArrowRight } from 'lucide-react';
import { supabase, Bancal, Cultivo, TipoCultivo, EventoCultivo } from '../lib/supabase';
import LoginModal from './LoginModal';

interface CropManagerProps {
  bancal: Bancal | null;
  onSelectCrop: (crop: Cultivo | null) => void;
  onRefresh: () => void;
}

export default function CropManager({ bancal, onSelectCrop, onRefresh }: CropManagerProps) {
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [tiposCultivo, setTiposCultivo] = useState<TipoCultivo[]>([]);
  const [todasLosBancales, setTodasLosBancales] = useState<Bancal[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [eventos, setEventos] = useState<EventoCultivo[]>([]);
  const [showEventForm, setShowEventForm] = useState<string | null>(null);
  const [showTransplantForm, setShowTransplantForm] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [formData, setFormData] = useState({
    tipo_cultivo_id: '',
    fecha_siembra: new Date().toISOString().split('T')[0],
    cantidad: '',
    estado: 'sembrado' as const,
    notas_siembra: '',
  });

  const [eventFormData, setEventFormData] = useState({
    tipo_evento: 'fertilizacion' as const,
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    fertilizante: '',
    cantidad: '',
  });

  useEffect(() => {
    loadTiposCultivo();
    loadAllBancales();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (bancal) {
      loadCultivos();
    }
  }, [bancal]);

  const loadTiposCultivo = async () => {
    const { data } = await supabase
      .from('tipos_cultivo')
      .select('*')
      .order('nombre');

    if (data) setTiposCultivo(data);
  };

  const loadAllBancales = async () => {
    const { data } = await supabase
      .from('bancales')
      .select('*')
      .eq('activo', true)
      .order('posicion');

    if (data) setTodasLosBancales(data);
  };

  const loadCultivos = async () => {
    if (!bancal) return;

    const { data } = await supabase
      .from('cultivos')
      .select('*, tipo_cultivo:tipos_cultivo(*)')
      .eq('bancal_id', bancal.id)
      .order('created_at', { ascending: false });

    if (data) setCultivos(data);
  };

  const loadEventos = async (cultivoId: string) => {
    const { data } = await supabase
      .from('eventos_cultivo')
      .select('*')
      .eq('cultivo_id', cultivoId)
      .order('fecha', { ascending: false });

    if (data) setEventos(data);
  };

  const handleAddCrop = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (!bancal || !formData.tipo_cultivo_id) return;

    const tipoCultivo = tiposCultivo.find(t => t.id === formData.tipo_cultivo_id);
    const fechaSiembra = new Date(formData.fecha_siembra);
    const diasCosecha = tipoCultivo?.dias_cosecha || 60;
    const fechaCosechaEstimada = new Date(fechaSiembra);
    fechaCosechaEstimada.setDate(fechaCosechaEstimada.getDate() + diasCosecha);

    const { error } = await supabase.from('cultivos').insert({
      bancal_id: bancal.id,
      tipo_cultivo_id: formData.tipo_cultivo_id,
      fecha_siembra: formData.fecha_siembra,
      fecha_cosecha_estimada: fechaCosechaEstimada.toISOString().split('T')[0],
      cantidad: formData.cantidad,
      estado: formData.estado,
      notas_siembra: formData.notas_siembra,
    });

    if (!error) {
      loadCultivos();
      onRefresh();
      setIsAdding(false);
      setFormData({
        tipo_cultivo_id: '',
        fecha_siembra: new Date().toISOString().split('T')[0],
        cantidad: '',
        estado: 'sembrado',
        notas_siembra: '',
      });
    }
  };

  const handleUpdateCrop = async (cultivoId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    const { error } = await supabase
      .from('cultivos')
      .update({
        estado: formData.estado,
        cantidad: formData.cantidad,
        notas_siembra: formData.notas_siembra,
      })
      .eq('id', cultivoId);

    if (!error) {
      loadCultivos();
      onRefresh();
      setIsEditing(null);
    }
  };

  const handleDeleteCrop = async (id: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (confirm('¿Eliminar este cultivo?')) {
      await supabase.from('cultivos').delete().eq('id', id);
      loadCultivos();
      onRefresh();
    }
  };

  const handleTransplant = async (cultivoId: string, targetBancalId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    const targetBancal = todasLosBancales.find(b => b.id === targetBancalId);
    if (!targetBancal) return;

    const cultivo = cultivos.find(c => c.id === cultivoId);
    if (!cultivo) return;

    const { error: updateError } = await supabase
      .from('cultivos')
      .update({
        bancal_id: targetBancalId,
        estado: 'creciendo',
      })
      .eq('id', cultivoId);

    if (!updateError) {
      const { error: eventError } = await supabase.from('eventos_cultivo').insert({
        cultivo_id: cultivoId,
        fecha: new Date().toISOString().split('T')[0],
        tipo_evento: 'trasplante',
        descripcion: `Trasplantado del Semillero a ${targetBancal.nombre}`,
      });

      if (!eventError) {
        loadCultivos();
        onRefresh();
        setShowTransplantForm(null);
      }
    }
  };

  const handleAddEvent = async (cultivoId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    const { error } = await supabase.from('eventos_cultivo').insert({
      cultivo_id: cultivoId,
      ...eventFormData,
    });

    if (!error) {
      loadEventos(cultivoId);
      setShowEventForm(null);
      setEventFormData({
        tipo_evento: 'fertilizacion',
        fecha: new Date().toISOString().split('T')[0],
        descripcion: '',
        fertilizante: '',
        cantidad: '',
      });
    }
  };

  const startEditing = (cultivo: Cultivo) => {
    setIsEditing(cultivo.id);
    setFormData({
      tipo_cultivo_id: cultivo.tipo_cultivo_id,
      fecha_siembra: cultivo.fecha_siembra,
      cantidad: cultivo.cantidad,
      estado: cultivo.estado,
      notas_siembra: cultivo.notas_siembra,
    });
  };

  const getEstadoColor = (estado: string) => {
    const colors = {
      sembrado: 'bg-amber-500',
      germinando: 'bg-green-500',
      creciendo: 'bg-emerald-500',
      floreciendo: 'bg-pink-500',
      cosechado: 'bg-blue-500',
      finalizado: 'bg-gray-500',
    };
    return colors[estado as keyof typeof colors] || 'bg-gray-500';
  };

  const getDaysUntilHarvest = (cultivo: Cultivo) => {
    if (!cultivo.fecha_cosecha_estimada) return null;
    const today = new Date();
    const harvestDate = new Date(cultivo.fecha_cosecha_estimada);
    const diffTime = harvestDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!bancal) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-500 text-center">Selecciona un bancal para gestionar sus cultivos</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Cultivos en {bancal.nombre}
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={18} />
          Añadir Cultivo
        </button>
      </div>

      {isAdding && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium mb-3">Nuevo Cultivo</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Cultivo
              </label>
              <select
                value={formData.tipo_cultivo_id}
                onChange={(e) => setFormData({ ...formData, tipo_cultivo_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Seleccionar...</option>
                {tiposCultivo.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Siembra
                </label>
                <input
                  type="date"
                  value={formData.fecha_siembra}
                  onChange={(e) => setFormData({ ...formData, fecha_siembra: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="text"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                  placeholder="ej. 10 plantas"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={formData.notas_siembra}
                onChange={(e) => setFormData({ ...formData, notas_siembra: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddCrop}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {cultivos.map((cultivo) => {
          const daysUntilHarvest = getDaysUntilHarvest(cultivo);
          const isEditingThis = isEditing === cultivo.id;
          const showingEvents = showEventForm === cultivo.id;

          return (
            <div key={cultivo.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {cultivo.tipo_cultivo?.nombre}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getEstadoColor(cultivo.estado)}`}>
                      {cultivo.estado}
                    </span>
                  </div>

                  {!isEditingThis ? (
                    <>
                      <p className="text-sm text-gray-600">
                        Siembra: {new Date(cultivo.fecha_siembra).toLocaleDateString('es-ES')}
                      </p>
                      {cultivo.cantidad && (
                        <p className="text-sm text-gray-600">Cantidad: {cultivo.cantidad}</p>
                      )}
                      {daysUntilHarvest !== null && (
                        <p className="text-sm text-gray-600">
                          {daysUntilHarvest > 0
                            ? `Cosecha en ${daysUntilHarvest} días`
                            : daysUntilHarvest === 0
                            ? 'Cosecha hoy'
                            : `Cosecha hace ${Math.abs(daysUntilHarvest)} días`}
                        </p>
                      )}
                      {cultivo.notas_siembra && (
                        <p className="text-sm text-gray-600 mt-1 italic">{cultivo.notas_siembra}</p>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2 mt-2">
                      <select
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="sembrado">Sembrado</option>
                        <option value="germinando">Germinando</option>
                        <option value="creciendo">Creciendo</option>
                        <option value="floreciendo">Floreciendo</option>
                        <option value="cosechado">Cosechado</option>
                        <option value="finalizado">Finalizado</option>
                      </select>
                      <input
                        type="text"
                        value={formData.cantidad}
                        onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                        placeholder="Cantidad"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <textarea
                        value={formData.notas_siembra}
                        onChange={(e) => setFormData({ ...formData, notas_siembra: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateCrop(cultivo.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setIsEditing(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap justify-end">
                  {bancal.lado === 'semillero' && !showTransplantForm && (
                    <button
                      onClick={() => setShowTransplantForm(cultivo.id)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded"
                      title="Trasplantar"
                    >
                      <ArrowRight size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => onSelectCrop(cultivo)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Ver información"
                  >
                    <FileText size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setShowEventForm(showingEvents ? null : cultivo.id);
                      if (!showingEvents) loadEventos(cultivo.id);
                    }}
                    className="p-2 text-green-600 hover:bg-green-50 rounded"
                    title="Eventos"
                  >
                    <Calendar size={18} />
                  </button>
                  <button
                    onClick={() => startEditing(cultivo)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteCrop(cultivo.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {showingEvents && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h4 className="font-medium text-sm mb-2">Eventos del Cultivo</h4>

                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <select
                        value={eventFormData.tipo_evento}
                        onChange={(e) => setEventFormData({ ...eventFormData, tipo_evento: e.target.value as any })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="fertilizacion">Fertilización</option>
                        <option value="riego">Riego</option>
                        <option value="trasplante">Trasplante</option>
                        <option value="poda">Poda</option>
                        <option value="tratamiento">Tratamiento</option>
                        <option value="observacion">Observación</option>
                      </select>
                      <input
                        type="date"
                        value={eventFormData.fecha}
                        onChange={(e) => setEventFormData({ ...eventFormData, fecha: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>

                    {eventFormData.tipo_evento === 'fertilizacion' && (
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="text"
                          value={eventFormData.fertilizante}
                          onChange={(e) => setEventFormData({ ...eventFormData, fertilizante: e.target.value })}
                          placeholder="Fertilizante usado"
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="text"
                          value={eventFormData.cantidad}
                          onChange={(e) => setEventFormData({ ...eventFormData, cantidad: e.target.value })}
                          placeholder="Cantidad"
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    )}

                    <textarea
                      value={eventFormData.descripcion}
                      onChange={(e) => setEventFormData({ ...eventFormData, descripcion: e.target.value })}
                      placeholder="Descripción"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                      rows={2}
                    />

                    <button
                      onClick={() => handleAddEvent(cultivo.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Añadir Evento
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {eventos.map((evento) => (
                      <div key={evento.id} className="text-sm p-2 bg-white border border-gray-200 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-gray-800">{evento.tipo_evento}</span>
                            <span className="text-gray-500 ml-2">
                              {new Date(evento.fecha).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        </div>
                        {evento.fertilizante && (
                          <p className="text-gray-600 mt-1">
                            Fertilizante: {evento.fertilizante}
                            {evento.cantidad && ` - ${evento.cantidad}`}
                          </p>
                        )}
                        {evento.descripcion && (
                          <p className="text-gray-600 mt-1">{evento.descripcion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showTransplantForm === cultivo.id && bancal.lado === 'semillero' && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h4 className="font-medium text-sm mb-2">Trasplantar a Bancal</h4>
                  <div className="space-y-2">
                    {todasLosBancales
                      .filter(b => b.lado !== 'semillero' && b.activo)
                      .map((targetBancal) => (
                        <button
                          key={targetBancal.id}
                          onClick={() => handleTransplant(cultivo.id, targetBancal.id)}
                          className="w-full text-left px-3 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-300 rounded text-sm text-gray-800 transition-colors"
                        >
                          {targetBancal.nombre}
                        </button>
                      ))}
                    <button
                      onClick={() => setShowTransplantForm(null)}
                      className="w-full px-3 py-2 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {cultivos.length === 0 && !isAdding && (
        <p className="text-gray-500 text-center py-8">
          No hay cultivos en este bancal. ¡Añade el primero!
        </p>
      )}

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={() => {
            checkAuth();
            setShowLoginModal(false);
            setIsAdding(true);
          }}
        />
      )}
    </div>
  );
}
