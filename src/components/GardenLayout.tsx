import { useState, useEffect } from 'react';
import { Plus, Trash2, Home } from 'lucide-react';
import { supabase, Bancal, Cultivo } from '../lib/supabase';
import LoginModal from './LoginModal';

interface GardenLayoutProps {
  onSelectBancal: (bancal: Bancal) => void;
  selectedBancalId: string | null;
  refreshTrigger: number;
}

export default function GardenLayout({ onSelectBancal, selectedBancalId, refreshTrigger }: GardenLayoutProps) {
  const [bancales, setBancales] = useState<Bancal[]>([]);
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [isAddingBancal, setIsAddingBancal] = useState(false);
  const [newBancalSide, setNewBancalSide] = useState<'izquierda' | 'derecha'>('izquierda');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    loadBancales();
    loadCultivos();
  }, [refreshTrigger]);

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

  const loadBancales = async () => {
    const { data } = await supabase
      .from('bancales')
      .select('*')
      .eq('activo', true)
      .order('posicion');

    if (data) setBancales(data);
  };

  const loadCultivos = async () => {
    const { data } = await supabase
      .from('cultivos')
      .select('*, tipo_cultivo:tipos_cultivo(*)')
      .in('estado', ['sembrado', 'germinando', 'creciendo', 'floreciendo']);

    if (data) setCultivos(data);
  };

  const handleAddBancal = async () => {
    const existingBancales = bancales.filter(b => b.lado === newBancalSide);
    const nextPosition = existingBancales.length;
    const nextLetter = String.fromCharCode(65 + bancales.length);

    const { data, error } = await supabase
      .from('bancales')
      .insert({
        nombre: `Bancal ${nextLetter}`,
        lado: newBancalSide,
        posicion: nextPosition,
        ancho: 1.2,
        alto: 3.0,
      })
      .select()
      .single();

    if (data && !error) {
      loadBancales();
      setIsAddingBancal(false);
    }
  };

  const handleDeleteBancal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (confirm('¿Estás seguro de eliminar este bancal?')) {
      const { error } = await supabase.from('bancales').delete().eq('id', id);
      if (error) {
        alert(error.message || 'No se pudo eliminar el bancal. Es posible que sea fijo y no se permita eliminarlo.');
      }
      await loadBancales();
    }
  };

  const getCultivosForBancal = (bancalId: string) => {
    return cultivos.filter(c => c.bancal_id === bancalId);
  };

  const getEstadoColor = (estado: string) => {
    const colors = {
      sembrado: 'bg-amber-100 text-amber-800',
      germinando: 'bg-green-100 text-green-800',
      creciendo: 'bg-emerald-100 text-emerald-800',
      floreciendo: 'bg-purple-100 text-purple-800',
    };
    return colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const semillero = bancales.find(b => b.lado === 'semillero');
  const bordesSuperior = bancales.filter(b => b.lado === 'superior').sort((a, b) => a.posicion - b.posicion);

  // Lado izquierdo: separa fijos de normales para mostrarlos claramente
  const bancalesIzquierdaFijos = bancales
    .filter(b => b.lado === 'izquierda' && !!b.fijo)
    .sort((a, b) => a.posicion - b.posicion);
  const bancalesIzquierda = bancales
    .filter(b => b.lado === 'izquierda' && !b.fijo)
    .sort((a, b) => a.posicion - b.posicion);

  // Lado derecho: separa fijos de normales para mostrarlos claramente
  const bancalesDerechaFijos = bancales
    .filter(b => b.lado === 'derecha' && !!b.fijo)
    .sort((a, b) => a.posicion - b.posicion);
  const bancalesDerecha = bancales
    .filter(b => b.lado === 'derecha' && !b.fijo)
    .sort((a, b) => a.posicion - b.posicion);

  return (
    <div className="space-y-6">
      {semillero && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg shadow-lg p-6 border-2 border-amber-200">
          <div className="flex items-center gap-2">
            <Home size={24} className="text-amber-700" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Semillero</h2>
              <p className="text-sm text-gray-600">Plantas en germinación (Casa)</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div
              onClick={() => onSelectBancal(semillero)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedBancalId === semillero.id
                  ? 'border-green-600 bg-green-50 shadow-md'
                  : 'border-amber-300 bg-amber-50 hover:border-green-400 hover:shadow'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{semillero.nombre}</h3>
                <button
                  onClick={(e) => handleDeleteBancal(semillero.id, e)}
                  className="text-red-500 hover:text-red-700"
                  disabled
                  title="El semillero no se puede eliminar"
                >
                  <Trash2 size={16} className="opacity-50" />
                </button>
              </div>

              {getCultivosForBancal(semillero.id).length > 0 ? (
                <div className="space-y-1">
                  {getCultivosForBancal(semillero.id).map((cultivo) => (
                    <div key={cultivo.id} className="text-sm">
                      <span className="font-medium text-gray-700">
                        {cultivo.tipo_cultivo?.nombre}
                      </span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getEstadoColor(cultivo.estado)}`}>
                        {cultivo.estado}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Sin cultivos</p>
              )}
            </div>
          </div>
        </div>
      )}

      {bordesSuperior.length > 0 && (
        <div className="bg-gradient-to-b from-sky-50 to-sky-100 rounded-lg shadow p-4 border-2 border-sky-200 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Borde Superior</h2>
            <p className="text-sm text-gray-600">Bancal fijo en la parte superior del huerto</p>
          </div>

          <div className="bg-white rounded-lg p-3">
            {bordesSuperior.map((b) => (
              <div
                key={b.id}
                onClick={() => onSelectBancal(b)}
                className={`p-3 border rounded-lg cursor-pointer mb-2 ${
                  selectedBancalId === b.id ? 'border-green-600 bg-green-50 shadow-sm' : 'border-sky-200 bg-sky-50 hover:border-green-400'
                }`}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-800">{b.nombre}</h3>
                  <button className="text-red-500 hover:text-red-700" disabled title="Bancal fijo: no se puede eliminar">
                    <Trash2 size={14} className="opacity-50" />
                  </button>
                </div>

                {getCultivosForBancal(b.id).length > 0 ? (
                  <div className="text-sm text-gray-700">
                    {getCultivosForBancal(b.id).map(c => (
                      <div key={c.id} className="mb-1">{c.tipo_cultivo?.nombre} <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getEstadoColor(c.estado)}`}>{c.estado}</span></div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Sin cultivos</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Huerto</h2>
          {!isAddingBancal && (
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setShowLoginModal(true);
                } else {
                  setIsAddingBancal(true);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={18} />
              Añadir Bancal
            </button>
          )}
        </div>

        {isAddingBancal && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <h3 className="font-medium mb-2">Nuevo Bancal</h3>
            <div className="flex gap-4 items-center">
              <select
                value={newBancalSide}
                onChange={(e) => setNewBancalSide(e.target.value as 'izquierda' | 'derecha')}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="izquierda">Lado Izquierdo</option>
                <option value="derecha">Lado Derecho</option>
              </select>
              <button
                onClick={handleAddBancal}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Crear
              </button>
              <button
                onClick={() => setIsAddingBancal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-[1fr_80px_1fr] gap-4">
          <div className="space-y-3">
            <div className="text-center font-semibold text-gray-700 mb-2">Lado Izquierdo</div>

            {bancalesIzquierdaFijos.length > 0 && (
              <div className="mb-3">
                {bancalesIzquierdaFijos.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => onSelectBancal(b)}
                    className={`p-3 border rounded-lg cursor-pointer mb-2 bg-slate-50 border-slate-200 ${
                      selectedBancalId === b.id ? 'border-green-600 bg-green-50' : ''
                    }`}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-gray-800">{b.nombre}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">Fijo</span>
                        <button className="text-red-500 hover:text-red-700" disabled title="Bancal fijo: no se puede eliminar">
                          <Trash2 size={14} className="opacity-50" />
                        </button>
                      </div>
                    </div>
                    {getCultivosForBancal(b.id).length > 0 ? (
                      <div className="text-sm text-gray-700">
                        {getCultivosForBancal(b.id).map(c => (
                          <div key={c.id} className="mb-1">{c.tipo_cultivo?.nombre} <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getEstadoColor(c.estado)}`}>{c.estado}</span></div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Sin cultivos</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {bancalesIzquierda.map((bancal) => {
              const cultivosBancal = getCultivosForBancal(bancal.id);
              const isSelected = selectedBancalId === bancal.id;

              return (
                <div
                  key={bancal.id}
                  onClick={() => onSelectBancal(bancal)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-green-600 bg-green-50 shadow-md'
                      : 'border-gray-300 bg-white hover:border-green-400 hover:shadow'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{bancal.nombre}</h3>
                    <button
                      onClick={(e) => handleDeleteBancal(bancal.id, e)}
                      className="text-red-500 hover:text-red-700"
                      disabled={!!bancal.fijo}
                      title={bancal.fijo ? 'Bancal fijo: no se puede eliminar' : 'Eliminar bancal'}
                    >
                      <Trash2 size={16} className={bancal.fijo ? 'opacity-50' : ''} />
                    </button>
                  </div>

                  {cultivosBancal.length > 0 ? (
                    <div className="space-y-1">
                      {cultivosBancal.map((cultivo) => (
                        <div key={cultivo.id} className="text-sm">
                          <span className="font-medium text-gray-700">
                            {cultivo.tipo_cultivo?.nombre}
                          </span>
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getEstadoColor(cultivo.estado)}`}>
                            {cultivo.estado}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Sin cultivos</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-b from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
              <div className="transform -rotate-90 text-gray-600 font-semibold tracking-wider">
                PASILLO
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-center font-semibold text-gray-700 mb-2">Lado Derecho</div>

            {bancalesDerechaFijos.length > 0 && (
              <div className="mb-3">
                {bancalesDerechaFijos.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => onSelectBancal(b)}
                    className={`p-3 border rounded-lg cursor-pointer mb-2 bg-slate-50 border-slate-200 ${
                      selectedBancalId === b.id ? 'border-green-600 bg-green-50' : ''
                    }`}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-gray-800">{b.nombre}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">Fijo</span>
                        <button className="text-red-500 hover:text-red-700" disabled title="Bancal fijo: no se puede eliminar">
                          <Trash2 size={14} className="opacity-50" />
                        </button>
                      </div>
                    </div>
                    {getCultivosForBancal(b.id).length > 0 ? (
                      <div className="text-sm text-gray-700">
                        {getCultivosForBancal(b.id).map(c => (
                          <div key={c.id} className="mb-1">{c.tipo_cultivo?.nombre} <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getEstadoColor(c.estado)}`}>{c.estado}</span></div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Sin cultivos</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {bancalesDerecha.map((bancal) => {
              const cultivosBancal = getCultivosForBancal(bancal.id);
              const isSelected = selectedBancalId === bancal.id;

              return (
                <div
                  key={bancal.id}
                  onClick={() => onSelectBancal(bancal)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-green-600 bg-green-50 shadow-md'
                      : 'border-gray-300 bg-white hover:border-green-400 hover:shadow'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{bancal.nombre}</h3>
                    <button
                      onClick={(e) => handleDeleteBancal(bancal.id, e)}
                      className="text-red-500 hover:text-red-700"
                      disabled={!!bancal.fijo}
                      title={bancal.fijo ? 'Bancal fijo: no se puede eliminar' : 'Eliminar bancal'}
                    >
                      <Trash2 size={16} className={bancal.fijo ? 'opacity-50' : ''} />
                    </button>
                  </div>

                  {cultivosBancal.length > 0 ? (
                    <div className="space-y-1">
                      {cultivosBancal.map((cultivo) => (
                        <div key={cultivo.id} className="text-sm">
                          <span className="font-medium text-gray-700">
                            {cultivo.tipo_cultivo?.nombre}
                          </span>
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getEstadoColor(cultivo.estado)}`}>
                            {cultivo.estado}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Sin cultivos</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600 font-medium">
            ENTRADA
          </div>
        </div>
      </div>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={() => {
            checkAuth();
            setIsAddingBancal(true);
          }}
        />
      )}
    </div>
  );
}
