
import React, { useState, useMemo } from 'react';
import { SITUATIONS } from './constants';
import { Situation, ReflectionResponse } from './types';
import { generateReflection } from './services/geminiService';
import SituationCard from './components/SituationCard';
import ReflectionModal from './components/ReflectionModal';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null);
  const [reflection, setReflection] = useState<ReflectionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Tudo');

  const categories = ['Tudo', 'Conforto', 'Orientação', 'Crescimento', 'Oração'];

  const filteredSituations = useMemo(() => {
    return SITUATIONS.filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.references.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'Tudo' || s.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const handleSituationClick = async (situation: Situation) => {
    setSelectedSituation(situation);
    setIsModalOpen(true);
    setIsLoading(true);
    setError(null);
    setReflection(null);

    try {
      const result = await generateReflection(situation);
      setReflection(result);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Wait for animation before clearing
    setTimeout(() => {
      setSelectedSituation(null);
      setReflection(null);
      setError(null);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight serif">
                Luz no Caminho
              </h1>
              <p className="text-slate-500 mt-1">Palavras de Orientação e Consolo para cada momento.</p>
            </div>

            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Como você se sente hoje?"
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-6 flex overflow-x-auto pb-2 scrollbar-hide gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filteredSituations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSituations.map(situation => (
              <SituationCard 
                key={situation.id} 
                situation={situation} 
                onClick={handleSituationClick} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 17.242L12.014 20.084l2.842-2.842M12 2v10m-3-3l3 3 3-3" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">Nenhum resultado encontrado</h3>
            <p className="mt-1 text-sm text-slate-500">Tente buscar por outras palavras ou mude a categoria.</p>
            <div className="mt-6">
              <button
                onClick={() => {setSearchTerm(''); setActiveCategory('Tudo');}}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Ver todas as palavras
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 text-sm">
            "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho." — Salmos 119:105
          </p>
          <p className="mt-2 text-slate-400 text-xs uppercase tracking-widest font-medium">
            Baseado em Palavras de Orientação e Consolo
          </p>
        </div>
      </footer>

      {/* Reflection Modal */}
      <ReflectionModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        situation={selectedSituation}
        reflection={reflection}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default App;
