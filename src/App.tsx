import { useState, useEffect } from 'react';
import { Sprout, Calendar as CalendarIcon, Leaf } from 'lucide-react';
import GardenLayout from './components/GardenLayout';
import CropManager from './components/CropManager';
import CropInfo from './components/CropInfo';
import CalendarView from './components/CalendarView';
import { Bancal, Cultivo } from './lib/supabase';
import { seedInitialData } from './utils/seedData';

type View = 'garden' | 'calendar' | 'info';

function App() {
  const [currentView, setCurrentView] = useState<View>('garden');
  const [selectedBancal, setSelectedBancal] = useState<Bancal | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<Cultivo | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await seedInitialData();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSelectCrop = (crop: Cultivo | null) => {
    setSelectedCrop(crop);
    if (crop) {
      setCurrentView('info');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <Sprout className="w-16 h-16 text-green-600 animate-pulse mx-auto mb-4" />
          <p className="text-xl text-gray-700">Cargando huerto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-3 rounded-xl">
                <Sprout className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mi Huerto Urbano</h1>
                <p className="text-gray-600">Gestiona tus cultivos y bancales</p>
              </div>
            </div>

            <nav className="flex gap-2">
              <button
                onClick={() => setCurrentView('garden')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'garden'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Leaf size={20} />
                Huerto
              </button>
              <button
                onClick={() => setCurrentView('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'calendar'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CalendarIcon size={20} />
                Calendario
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'garden' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <GardenLayout
                onSelectBancal={setSelectedBancal}
                selectedBancalId={selectedBancal?.id || null}
                refreshTrigger={refreshTrigger}
              />
            </div>
            <div>
              <CropManager
                bancal={selectedBancal}
                onSelectCrop={handleSelectCrop}
                onRefresh={handleRefresh}
              />
            </div>
          </div>
        )}

        {currentView === 'calendar' && (
          <div className="max-w-6xl mx-auto">
            <CalendarView />
          </div>
        )}

        {currentView === 'info' && (
          <div className="max-w-4xl mx-auto">
            <CropInfo
              crop={selectedCrop}
              onClose={() => {
                setCurrentView('garden');
                setSelectedCrop(null);
              }}
            />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600">
            Sistema de Gestión de Huerto Urbano - Cultivando con pasión
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
