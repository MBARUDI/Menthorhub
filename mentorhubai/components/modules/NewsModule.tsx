import React, { useState, useEffect } from 'react';
import { Newspaper, RefreshCw, ExternalLink, Briefcase, HardHat, Cpu, TrendingUp } from 'lucide-react';
import { fetchNewsWithGrounding } from '../../services/geminiService';

type Category = 'economia' | 'sst' | 'vagas' | 'ti';

const NewsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Category>('economia');
  const [newsData, setNewsData] = useState<Record<Category, { text: string; sources: any[]; lastUpdated: number }>>({
    economia: { text: '', sources: [], lastUpdated: 0 },
    sst: { text: '', sources: [], lastUpdated: 0 },
    vagas: { text: '', sources: [], lastUpdated: 0 },
    ti: { text: '', sources: [], lastUpdated: 0 },
  });
  const [isLoading, setIsLoading] = useState(false);

  const categories: { id: Category; label: string; icon: any; query: string }[] = [
    { 
      id: 'economia', 
      label: 'Economia', 
      icon: TrendingUp, 
      query: 'Principais notícias de economia do Brasil e do mundo hoje. Destaque bolsa de valores, inflação e mercado.' 
    },
    { 
      id: 'sst', 
      label: 'Segurança', 
      icon: HardHat, 
      query: 'Notícias recentes sobre Segurança do Trabalho no Brasil, mudanças em NRs, e acidentes ou prevenções relevantes na indústria.' 
    },
    { 
      id: 'vagas', 
      label: 'Vagas', 
      icon: Briefcase, 
      query: 'Vagas de emprego abertas recentemente para Engenharia Civil e Engenharia de Segurança do Trabalho no Brasil. Liste cargos e empresas.' 
    },
    { 
      id: 'ti', 
      label: 'Tech & TI', 
      icon: Cpu, 
      query: 'Notícias recentes sobre mercado de TI, informática, lançamentos de tecnologia e vagas na área de tecnologia.' 
    },
  ];

  const loadNews = async (category: Category, forceObj = false) => {
    // Cache for 1 hour unless forced
    const now = Date.now();
    if (!forceObj && newsData[category].text && (now - newsData[category].lastUpdated < 3600000)) {
      return;
    }

    setIsLoading(true);
    const catConfig = categories.find(c => c.id === category);
    if (!catConfig) return;

    const result = await fetchNewsWithGrounding(catConfig.query);
    
    setNewsData(prev => ({
      ...prev,
      [category]: {
        text: result.text,
        sources: result.sources,
        lastUpdated: now
      }
    }));
    setIsLoading(false);
  };

  useEffect(() => {
    loadNews(activeTab);
  }, [activeTab]);

  const handleRefresh = () => {
    loadNews(activeTab, true);
  };

  const currentData = newsData[activeTab];

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Newspaper className="text-blue-400" /> 
            Portal de Notícias
          </h2>
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className={`p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-all ${isLoading ? 'animate-spin opacity-50' : ''}`}
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === cat.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <cat.icon size={16} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        {isLoading && !currentData.text ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 animate-pulse">Buscando atualizações na internet...</p>
          </div>
        ) : (
          <div className="animate-slide-up">
            {/* Timestamp */}
            {currentData.lastUpdated > 0 && (
               <p className="text-xs text-gray-500 mb-4 text-right">
                 Atualizado: {new Date(currentData.lastUpdated).toLocaleTimeString()}
               </p>
            )}

            {/* Markdown Rendering (Simplified) */}
            <div className="prose prose-invert prose-blue max-w-none">
              {currentData.text.split('\n').map((line, i) => {
                // Very simple markdown parsing for the list items and headers
                if (line.startsWith('##')) return <h3 key={i} className="text-lg font-bold text-blue-300 mt-6 mb-2">{line.replace(/##/g, '')}</h3>;
                if (line.startsWith('**') || line.startsWith('* **')) return <p key={i} className="font-bold text-white mt-4 mb-1">{line.replace(/\*/g, '')}</p>;
                if (line.startsWith('*') || line.startsWith('-')) return <li key={i} className="ml-4 text-gray-300 list-disc my-1">{line.replace(/^[\*\-]\s*/, '')}</li>;
                return <p key={i} className="text-gray-300 my-2 leading-relaxed">{line}</p>;
              })}
            </div>

            {/* Sources Section */}
            {currentData.sources.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-800">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Fontes & Links</h4>
                <div className="grid gap-2">
                  {currentData.sources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-800 border border-gray-700 hover:border-blue-500/50 hover:bg-gray-750 transition-all group"
                    >
                      <span className="text-sm text-blue-400 group-hover:text-blue-300 truncate flex-1 pr-4">
                        {source.title || new URL(source.uri).hostname}
                      </span>
                      <ExternalLink size={14} className="text-gray-500 group-hover:text-white" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsModule;