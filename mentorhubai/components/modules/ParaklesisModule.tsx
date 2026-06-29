import React, { useState, useMemo } from 'react';
import { Quote, RefreshCw, Loader2, Heart, Shield, Award, Sparkles, MessageCircleHeart, Search, X, ChevronRight, BookOpen } from 'lucide-react';
import { generateLuzReflection } from '../../services/geminiService';

interface Situation {
  id: string;
  title: string;
  references: string;
  category: 'Conforto' | 'Orientação' | 'Crescimento' | 'Oração';
}

interface ReflectionResponse {
  message: string;
  mentorship: string;
  prayer: string;
}

const SITUATIONS: Situation[] = [
  {
    id: 'ansioso',
    title: 'Ansioso e impaciente',
    references: 'Salmo 13; 37.3-5; Mateus 6.25-34; Romanos 5.3-5; Filipenses 4.6-7; Tiago 5.7-11; 1Pedro 5.6-7',
    category: 'Conforto'
  },
  {
    id: 'dinheiro',
    title: 'Preocupado com dinheiro',
    references: 'Eclesiastes 5.10; Mateus 6.19-21; 1Timóteo 6.6-10; Hebreus 13.5-6',
    category: 'Orientação'
  },
  {
    id: 'medo',
    title: 'Com medo',
    references: 'Salmo 4.8; Isaías 41.13; Lucas 8.22-25; João 14.27; 16.33; Romanos 8.1, 31-39',
    category: 'Conforto'
  },
  {
    id: 'testemunhar',
    title: 'Com medo de testemunhar sua fé em Jesus',
    references: 'Isaías 55.10-11; Jeremias 1.4-9; Mateus 5.11-12; 10.16-20; Romanos 10.8-15',
    category: 'Orientação'
  },
  {
    id: 'solitario',
    title: 'Se sentindo solitário',
    references: 'Salmo 10.12-14; 25.16-18; 68.4-6; 146; Mateus 28.20; João 14.18-19; 1Pedro 5.7',
    category: 'Conforto'
  },
  {
    id: 'angustiado',
    title: 'Angustiado e sofrendo',
    references: 'Mateus 5.4; Romanos 8.31-39; 2Coríntios 1.3-6; 4.16-18; 12.7-10; Tiago 1.2-4; Apocalipse 2.10',
    category: 'Conforto'
  },
  {
    id: 'doente',
    title: 'Doente',
    references: 'Salmo 41.1-3; 68.19-20; 103.1-5; 146; Isaías 54.10; Romanos 5.1-5; Tiago 5.14-15; 1Pedro 5.10-11',
    category: 'Conforto'
  },
  {
    id: 'doenca-terminal',
    title: 'Enfrentando uma situação de doença terminal',
    references: 'Salmo 23; Romanos 8.18-30; 2Coríntios 5.1-10',
    category: 'Conforto'
  },
  {
    id: 'morte',
    title: 'Sofrendo por causa da morte de alguém',
    references: 'João 11.25-26; 1Coríntios 15.50-58; 1Tessalonicenses 4.13-18',
    category: 'Conforto'
  },
  {
    id: 'desgraca',
    title: 'Passando por uma situação de desgraça total',
    references: 'Jó 1.13-22; Isaías 55.8-9; Romanos 8.28',
    category: 'Conforto'
  },
  {
    id: 'viagem',
    title: 'De saída para uma viagem',
    references: 'Salmo 46.1-3; 91.1-6, 14-16; 121',
    category: 'Orientação'
  },
  {
    id: 'tentacao',
    title: 'Enfrentando uma tentação',
    references: 'Romanos 12.1-2; 1Coríntios 10.12-13; Hebreus 2.17-18; 4.14-16; Tiago 1.12-15; 4.7',
    category: 'Orientação'
  },
  {
    id: 'sem-desejo-culto',
    title: 'Sem desejo de participar dos cultos',
    references: 'Salmo 26.8; 84; 133.1; Efésios 3.16-17; Hebreus 10.23-25',
    category: 'Crescimento'
  },
  {
    id: 'orientacao',
    title: 'Precisando de orientação',
    references: 'Salmo 16; 25.4-10; 32.8; 119.105; Isaías 30.21',
    category: 'Orientação'
  },
  {
    id: 'decisoes',
    title: 'Tomando decisões',
    references: 'Provérbios 3.5-6; 16.3; 1Coríntios 10.31; Gálatas 6.10; Tiago 1.5-8',
    category: 'Orientação'
  },
  {
    id: 'raiva',
    title: 'Com raiva',
    references: 'Mateus 5.44-48; Romanos 12.17-21; 1Coríntios 13; Colossenses 3.12-17; Tiago 1.19-20',
    category: 'Crescimento'
  },
  {
    id: 'inveja',
    title: 'Com inveja',
    references: 'Salmo 49.16-20; Tiago 3.13-18',
    category: 'Crescimento'
  },
  {
    id: 'culpado',
    title: 'Se sentindo culpado',
    references: 'Salmo 32; 51; 130; Isaías 1.18; Lucas 15; João 6.37; 1João 1.8-2.2',
    category: 'Conforto'
  },
  {
    id: 'abandonado',
    title: 'Pensando que Deus abandonou você',
    references: 'Salmo 22.1-11; 139.1-12; Isaías 49.14-16; Filipenses 4.10-13; Hebreus 10.19-25',
    category: 'Conforto'
  },
  {
    id: 'cansado',
    title: 'Cansado e desanimado',
    references: 'Salmo 34.15-22; Isaías 40.25-31; Mateus 11.28-30; Hebreus 12.1-3',
    category: 'Conforto'
  },
  {
    id: 'caminho-ceu',
    title: 'Procurando o caminho para o céu',
    references: 'João 3.16; 14.5-6; Romanos 6.20-23; 10.9-13; Efésios 2.8-9',
    category: 'Orientação'
  },
  {
    id: 'orar',
    title: 'Querendo saber como orar',
    references: 'Mateus 6.5-15; 7.7-11; Marcos 14.36; João 15.7; Filipenses 4.6-7; 1Tessalonicenses 5.17; 1João 5.14-15',
    category: 'Oração'
  },
  {
    id: 'agradecido',
    title: 'Agradecido pelas bênçãos de Deus',
    references: 'Salmo 98; 100; 103; 1Tessalonicenses 5.16-18',
    category: 'Oração'
  }
];

export default function ParaklesisModule() {
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
      const result = await generateLuzReflection(situation);
      setReflection(result);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao buscar reflexão.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedSituation(null);
      setReflection(null);
      setError(null);
    }, 300);
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'Conforto': return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
      case 'Orientação': return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'Crescimento': return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      case 'Oração': return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      default: return 'bg-white/5 text-gray-400 border-white/5';
    }
  };

  return (
    <div className="flex flex-col h-full bg-android-bg text-white overflow-hidden animate-fade-in font-sans relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Sub-Header & Controls */}
      <div className="px-8 py-6 border-b border-white/5 shrink-0 bg-android-surface/20 backdrop-blur-3xl relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              <div className="bg-rose-500/10 p-2.5 rounded-xl text-rose-400 border border-rose-500/20 shadow-md">
                <MessageCircleHeart size={22} />
              </div>
              Paraklesis
            </h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1.5 ml-1">Luz no Caminho &bull; Palavras de Orientação e Consolo</p>
          </div>

          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Como você se sente hoje?"
              className="block w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-sm placeholder-gray-600 focus:outline-none focus:border-rose-500/40 font-bold transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="mt-6 flex overflow-x-auto pb-1 gap-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all duration-300 active:scale-95 ${
                activeCategory === cat 
                  ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-950/20' 
                  : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {filteredSituations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto pb-24">
            {filteredSituations.map(situation => (
              <button
                key={situation.id}
                onClick={() => handleSituationClick(situation)}
                className="group relative flex flex-col p-6 bg-android-surface/30 border border-white/5 rounded-[2rem] shadow-[0_16px_32px_-8px_rgba(0,0,0,0.3)] hover:bg-android-surface/60 hover:border-rose-500/20 hover:-translate-y-2 transition-all duration-300 text-left w-full h-full"
              >
                <div className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border mb-4 ${getCategoryBadgeClass(situation.category)}`}>
                  {situation.category}
                </div>
                <h3 className="text-lg font-black text-white mb-2 group-hover:text-rose-300 transition-colors leading-tight">
                  {situation.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 italic font-medium leading-relaxed">
                  {situation.references}
                </p>
                <div className="mt-auto pt-5 flex items-center text-xs font-black uppercase tracking-wider text-rose-400">
                  Ler reflexão
                  <ChevronRight size={14} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-android-surface/20 border border-dashed border-white/5 rounded-[2.5rem] max-w-3xl mx-auto flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <BookOpen size={24} className="text-gray-600" />
            </div>
            <h3 className="text-base font-black text-white mb-1">Nenhum consolo encontrado</h3>
            <p className="text-xs text-gray-500 font-bold max-w-xs leading-relaxed">Tente buscar por termos alternativos ou altere a categoria ativa.</p>
            <button
              onClick={() => { setSearchTerm(''); setActiveCategory('Tudo'); }}
              className="mt-6 px-6 py-3.5 bg-rose-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-rose-950/20 active:scale-95 transition-all"
            >
              Ver todas as palavras
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-android-surface/20 border-t border-white/5 py-8 shrink-0 select-none text-center relative z-10">
        <p className="text-xs text-rose-300 italic font-cinzel tracking-wider px-6">
          "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho." &mdash; Salmos 119:105
        </p>
        <p className="mt-2 text-[9px] text-gray-500 uppercase tracking-widest font-black">
          Baseado em Palavras de Orientação e Consolo
        </p>
      </div>

      {/* Reflection Premium Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div 
            className="fixed inset-0 cursor-default" 
            onClick={closeModal}
          />
          
          <div className="relative bg-android-surface border border-white/10 rounded-[2.5rem] text-left overflow-hidden shadow-2xl transform transition-all max-w-2xl w-full z-10 animate-slide-up">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-90"
            >
              <X size={18} />
            </button>

            <div className="p-8 md:p-10">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Loader2 className="w-12 h-12 text-rose-400 animate-spin" />
                  <p className="text-xs text-gray-500 font-sans tracking-widest uppercase font-black animate-pulse">Buscando sabedoria nas Escrituras...</p>
                </div>
              ) : error ? (
                <div className="text-center py-10 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-red-950/20 border border-red-500/30 text-red-400 flex items-center justify-center mb-6">
                    <X size={24} />
                  </div>
                  <h3 className="text-base font-black text-white mb-2">{error}</h3>
                  <button
                    onClick={closeModal}
                    className="mt-6 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-white/10 transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              ) : reflection && selectedSituation ? (
                <div className="space-y-6">
                  <header className="border-b border-white/5 pb-5">
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Reflexão para quem está</span>
                    <h2 className="text-2xl font-black text-white mt-1 leading-tight tracking-tight">{selectedSituation.title}</h2>
                    <p className="mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      Passagens: <span className="italic font-mono normal-case tracking-normal">{selectedSituation.references}</span>
                    </p>
                  </header>

                  <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar space-y-6">
                    <section>
                      <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2.5">Mensagem de Consolo</h3>
                      <p className="text-base md:text-lg text-white font-cinzel leading-relaxed italic drop-shadow-md">
                        "{reflection.message}"
                      </p>
                    </section>

                    <section className="bg-white/5 p-6 rounded-2xl border border-white/5">
                      <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2.5">Mentoria Espiritual</h3>
                      <div className="text-sm text-gray-300 leading-relaxed font-medium whitespace-pre-wrap">
                        {reflection.mentorship}
                      </div>
                    </section>

                    <section className="bg-rose-500/10 p-6 rounded-2xl border border-rose-500/20">
                      <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2.5">Uma Oração para você</h3>
                      <p className="text-sm text-rose-300 leading-relaxed font-cinzel italic">
                        {reflection.prayer}
                      </p>
                    </section>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <button
                      onClick={closeModal}
                      className="w-full py-4 bg-rose-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-rose-600 shadow-lg shadow-rose-950/20 transition-all active:scale-[0.98]"
                    >
                      Amém
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
