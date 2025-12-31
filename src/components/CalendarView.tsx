import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, Cultivo, EventoCultivo } from '../lib/supabase';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [eventos, setEventos] = useState<EventoCultivo[]>([]);

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data: cultivosData } = await supabase
      .from('cultivos')
      .select('*, tipo_cultivo:tipos_cultivo(nombre)')
      .or(`fecha_siembra.lte.${endOfMonth.toISOString().split('T')[0]},fecha_cosecha_estimada.gte.${startOfMonth.toISOString().split('T')[0]}`);

    const { data: eventosData } = await supabase
      .from('eventos_cultivo')
      .select('*, cultivo:cultivos(tipo_cultivo:tipos_cultivo(nombre))')
      .gte('fecha', startOfMonth.toISOString().split('T')[0])
      .lte('fecha', endOfMonth.toISOString().split('T')[0]);

    if (cultivosData) setCultivos(cultivosData);
    if (eventosData) setEventos(eventosData);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getCultivosForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];

    return cultivos.filter((cultivo) => {
      const siembraDate = cultivo.fecha_siembra;
      const cosechaDate = cultivo.fecha_cosecha_estimada;

      if (siembraDate === dateStr) return true;
      if (cosechaDate === dateStr) return true;

      return false;
    });
  };

  const getEventosForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];

    return eventos.filter((evento) => evento.fecha === dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventTypeColor = (tipo: string) => {
    const colors = {
      fertilizacion: 'bg-yellow-500',
      riego: 'bg-blue-500',
      trasplante: 'bg-purple-500',
      poda: 'bg-orange-500',
      tratamiento: 'bg-red-500',
      observacion: 'bg-gray-500',
    };
    return colors[tipo as keyof typeof colors] || 'bg-gray-500';
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 capitalize">{monthName}</h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className="text-center font-semibold text-gray-700 py-2">
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="min-h-24 bg-gray-50 rounded-lg" />;
          }

          const cultivosDay = getCultivosForDay(day);
          const eventosDay = getEventosForDay(day);
          const today = new Date();
          const isToday =
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();

          const hasSiembra = cultivosDay.some((c) => c.fecha_siembra === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0]);
          const hasCosecha = cultivosDay.some((c) => c.fecha_cosecha_estimada === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0]);

          return (
            <div
              key={day}
              className={`min-h-24 border rounded-lg p-2 ${
                isToday ? 'border-2 border-green-500 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-green-700' : 'text-gray-700'}`}>
                {day}
              </div>

              <div className="space-y-1">
                {hasSiembra && (
                  <div className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                    Siembra
                  </div>
                )}

                {hasCosecha && (
                  <div className="text-xs bg-orange-100 text-orange-800 px-1 py-0.5 rounded">
                    Cosecha
                  </div>
                )}

                {eventosDay.slice(0, 2).map((evento) => (
                  <div
                    key={evento.id}
                    className={`text-xs text-white px-1 py-0.5 rounded ${getEventTypeColor(evento.tipo_evento)}`}
                    title={evento.descripcion}
                  >
                    {evento.tipo_evento.charAt(0).toUpperCase()}
                  </div>
                ))}

                {eventosDay.length > 2 && (
                  <div className="text-xs text-gray-500 px-1">
                    +{eventosDay.length - 2} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3">Leyenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
            <span className="text-sm text-gray-700">Siembra</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded" />
            <span className="text-sm text-gray-700">Cosecha</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded" />
            <span className="text-sm text-gray-700">Fertilización</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span className="text-sm text-gray-700">Riego</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded" />
            <span className="text-sm text-gray-700">Trasplante</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded" />
            <span className="text-sm text-gray-700">Poda</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-sm text-gray-700">Tratamiento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded" />
            <span className="text-sm text-gray-700">Observación</span>
          </div>
        </div>
      </div>
    </div>
  );
}
