
import React, { useState } from 'react';
import { Book, Search, ChevronDown, ChevronUp, Lightbulb, Shield, Zap, HelpCircle, Layers, Cpu, Grid, MessageCircle } from 'lucide-react';
import { AppIcon } from '../../types';

interface GuideTopic {
  id: string;
  title: string;
  content: string;
  icon: React.ElementType;
}

const TOPICS: GuideTopic[] = [
  {
    id: '1',
    title: 'O que é o MentorhubAI?',
    content: 'O MentorhubAI é seu hub de conhecimento inteligente. Ele centraliza ferramentas de aprendizado, segurança do trabalho, finanças e desenvolvimento pessoal em uma interface única, potencializada por Inteligência Artificial para personalizar sua experiência.',
    icon: Zap
  },
  {
    id: '2',
    title: 'Como utilizar o Chatbot NR?',
    content: 'No módulo de Segurança (ícone de capacete), você pode conversar com uma IA especialista em Normas Regulamentadoras. Você pode pedir resumos de NRs específicas (ex: "Resuma a NR-10") ou tirar dúvidas sobre procedimentos de segurança.',
    icon: Shield
  },
  {
    id: '3',
    title: 'A Calculadora do Milhão é precisa?',
    content: 'A Calculadora do Milhão utiliza fórmulas financeiras padrão de juros compostos. Ela fornece uma estimativa matemática baseada nos dados que você insere (aporte e taxa). Lembre-se que rendimentos passados ou teóricos não garantem rentabilidade futura e a inflação não é descontada automaticamente.',
    icon: Layers
  },
  {
    id: '4',
    title: 'Como funcionam os Cursos de Idiomas?',
    content: 'O módulo de Idiomas oferece materiais de estudo (ícones de bandeiras) e um Tutor IA. Você pode praticar conversação em tempo real com o tutor. Basta selecionar o idioma desejado no menu superior e começar a digitar.',
    icon: Cpu
  },
  {
    id: '5',
    title: 'Posso usar offline?',
    content: 'O MentorhubAI requer conexão com a internet para funcionar plenamente, especialmente para os recursos de IA (Gemini), vídeos do YouTube e atualizações de notícias.',
    icon: HelpCircle
  },
  {
    id: '6',
    title: 'Dicas de Produtividade',
    content: 'Utilize o módulo "Planner" para organizar sua semana e o "PDCA Pessoal" para melhoria contínua. A combinação dessas ferramentas com o aprendizado constante no Hub acelera seu desenvolvimento profissional.',
    icon: Lightbulb
  }
];

interface GuideModuleProps {
  apps: AppIcon[];
}

const GuideModule: React.FC<GuideModuleProps> = ({ apps }) => {
  const [activeTab, setActiveTab] = useState<'faq' | 'apps'>('faq');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredTopics = TOPICS.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.content.toLowerCase().includes(search.toLowerCase())
  );

  const filteredApps = apps.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-purple-900/20 to-transparent border-b border-white/5 shrink-0">
        <h2 className="text-2xl font-black flex items-center gap-3 mb-2">
          <Book className="text-purple-400" />
          Guia do Usuário
        </h2>
        <p className="text-gray-500 text-sm font-medium">Central de Ajuda e Documentação.</p>
        
        <div className="mt-6 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === 'faq' ? "Pesquisar dúvidas..." : "Pesquisar aplicativos..."}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-600"
          />
        </div>

        {/* Tabs */}
        <div className="flex mt-6 bg-white/5 p-1 rounded-2xl border border-white/5">
           <button 
             onClick={() => setActiveTab('faq')}
             className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all ${activeTab === 'faq' ? 'bg-purple-600 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
           >
             <MessageCircle size={14} /> FAQ
           </button>
           <button 
             onClick={() => setActiveTab('apps')}
             className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all ${activeTab === 'apps' ? 'bg-purple-600 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
           >
             <Grid size={14} /> Catálogo
           </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {activeTab === 'faq' ? (
          <>
            {filteredTopics.length === 0 ? (
              <div className="text-center text-gray-500 py-16 glass-morphism rounded-3xl">
                Nenhum tópico encontrado.
              </div>
            ) : (
              filteredTopics.map((topic) => (
                <div 
                  key={topic.id}
                  className="glass-morphism rounded-2xl overflow-hidden transition-all duration-300 hover:border-purple-500/30"
                >
                  <button
                    onClick={() => toggleExpand(topic.id)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-colors ${expandedId === topic.id ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 text-gray-400'}`}>
                        <topic.icon size={20} />
                      </div>
                      <span className={`font-bold transition-colors ${expandedId === topic.id ? 'text-purple-300' : 'text-white'}`}>
                        {topic.title}
                      </span>
                    </div>
                    {expandedId === topic.id ? <ChevronUp size={20} className="text-purple-400" /> : <ChevronDown size={20} className="text-gray-600" />}
                  </button>
                  
                  {expandedId === topic.id && (
                    <div className="px-6 pb-6 pl-[5rem] animate-fade-in">
                      <p className="text-gray-400 text-sm leading-relaxed font-medium border-t border-white/5 pt-4">
                        {topic.content}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        ) : (
          <div className="space-y-4 animate-slide-up pb-10">
             {filteredApps.length === 0 ? (
                <div className="text-center text-gray-500 py-16 glass-morphism rounded-3xl">
                  Nenhum aplicativo encontrado.
                </div>
             ) : (
               filteredApps.map(app => (
                 <div key={app.id} className="glass-morphism rounded-2xl p-6 flex gap-6 hover:bg-white/5 transition-all border border-white/5 hover:border-purple-500/20">
                    <div className={`w-16 h-16 bg-gradient-to-br ${app.color} rounded-2xl flex items-center justify-center shrink-0 shadow-2xl`}>
                      <app.icon size={28} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                         <h3 className="font-bold text-white">{app.name}</h3>
                         <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md">{app.category}</span>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">{app.description}</p>
                      {app.externalUrl && (
                        <div className="mt-3 text-[10px] font-black uppercase tracking-tighter text-blue-400">
                          Link Externo
                        </div>
                      )}
                    </div>
                 </div>
               ))
             )}
          </div>
        )}
        
        <div className="mt-6 p-8 glass-morphism rounded-3xl text-center border-dashed border-purple-500/30">
          <h3 className="font-bold text-purple-300 mb-3">Ainda com dúvidas?</h3>
          <p className="text-sm text-gray-500 mb-6 font-medium">Acesse a nossa Comunidade para interagir com outros usuários e especialistas.</p>
          <button className="text-xs font-black uppercase tracking-[0.2em] text-white bg-purple-600 px-6 py-3 rounded-xl shadow-lg shadow-purple-500/20">Acessar Fórum</button>
        </div>
      </div>
    </div>
  );
};

export default GuideModule;
