
import React, { useState } from 'react';
import { 
  Languages, 
  Cpu,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Menu,
  Sparkles,
  Search,
  HardHat,
  Calculator,
  Crown,
  Mic,
  Film,
  Globe,
  User,
  Wrench,
  Newspaper,
  Target,
  Shield,
  Github,
  Youtube,
  Twitter,
  Linkedin,
  Facebook,
  FileText,
  Instagram,
  ShoppingCart,
  Lightbulb,
  Calendar,
  Repeat,
  BookHeart,
  Hammer,
  Clapperboard,
  Hash,
  Layout,
  BrainCircuit,
  Briefcase,
  Home,
  Book,
  Users,
  HardDrive,
  Building2,
  Heart,
  Zap,
  Rocket,
  Compass,
  Library,
  ShieldCheck,
  Shapes,
  ArrowRight,
  QrCode,
  Share2,
  Activity
} from 'lucide-react';
import StatusBar from './components/StatusBar';
import LanguageModule from './components/modules/LanguageModule';
import SafetyModule from './components/modules/SafetyModule';
import LeadershipModule from './components/modules/LeadershipModule';
import PodcastModule from './components/modules/PodcastModule';
import VideosSstModule from './components/modules/VideosSstModule';
import CalculatorModule from './components/modules/CalculatorModule';
import NewsModule from './components/modules/NewsModule';
import MillionModule from './components/modules/MillionModule';
import GuideModule from './components/modules/GuideModule';
import CommunityModule from './components/modules/CommunityModule';
import { AppIcon, ModuleType, AppCategory } from './types';

const APPS_DATA: AppIcon[] = [
  // AI ASSISTANTS
  { id: '26', name: 'Lúmen', icon: Lightbulb, color: 'from-amber-400 to-orange-600', type: ModuleType.CHAT_GENERAL, category: 'ai_assistants', description: 'Assistente Inteligente', externalUrl: 'https://ai.studio/apps/drive/1bebtBDSRp-4GjCqZ6LOoze_RSRGNY2lk?fullscreenApplet=true' },
  { id: '39', name: 'Paraklesis', icon: HardDrive, color: 'from-indigo-400 to-blue-600', type: ModuleType.CHAT_GENERAL, category: 'ai_assistants', description: 'Acesso Avançado Mentorhub', externalUrl: 'https://ai.studio/apps/drive/1M_Z9OFV5-lNiRjw_HwYfJauGTr9K_Q7z' },

  // ENGENHARIA CIVIL
  { id: '40', name: 'Inspeção Predial', icon: Building2, color: 'from-slate-500 to-slate-700', type: ModuleType.CHAT_GENERAL, category: 'civil_engineering', description: 'Assistente para Engenharia Civil', externalUrl: 'https://ai.studio/apps/drive/1LYZ2wtovd1AEyeclysoQ1cW6zpW3YnQ5' },

  // LEARNING
  { id: '1', name: 'Languages', icon: Languages, color: 'from-blue-400 to-cyan-600', type: ModuleType.LANGUAGE, category: 'learning', description: 'English, Spanish, Italian & more' },
  { id: '41', name: 'Gratidão diária', icon: Heart, color: 'from-pink-400 to-rose-500', type: ModuleType.CHAT_GENERAL, category: 'learning', description: 'Prática de gratidão e bem-estar', externalUrl: 'https://ai.studio/apps/drive/1d-Ye-5LW0MmiF_yejjF3Ls7m73BRAkN5' },
  { id: '35', name: 'Management Course', icon: Briefcase, color: 'from-indigo-600 to-purple-800', type: ModuleType.CHAT_GENERAL, category: 'learning', description: 'Curso de Gestão e Liderança', externalUrl: 'https://ai.studio/apps/drive/1IBdPP2CVEjFL7mg1a__McDNxQz58vMjC?fullscreenApplet=true' },
  { id: '8', name: 'Leadership Mentor', icon: Crown, color: 'from-yellow-400 to-amber-600', type: ModuleType.LEADERSHIP, category: 'learning', description: 'Vídeos de Liderança e Gestão' },
  { id: '29', name: 'Diário Jornada', icon: BookHeart, color: 'from-rose-400 to-pink-600', type: ModuleType.CHAT_GENERAL, category: 'learning', description: 'Jornada de autoconhecimento', externalUrl: 'https://ai.studio/apps/drive/1qMvU0fAsO8yilohthDqjuLyOxF4SXDT7?fullscreenApplet=true' },
  { id: '27', name: 'Planner', icon: Calendar, color: 'from-purple-400 to-indigo-600', type: ModuleType.CHAT_GENERAL, category: 'learning', description: 'Planejamento e Organização', externalUrl: 'https://ai.studio/apps/drive/1sDB1FvusF5Jpq92tBLtWQsFqqx1hPzNM?fullscreenApplet=true' },
  { id: '28', name: 'PDCA Pessoal', icon: Repeat, color: 'from-rose-500 to-red-700', type: ModuleType.CHAT_GENERAL, category: 'learning', description: 'Ciclo de Melhoria Contínua', externalUrl: 'https://ai.studio/apps/drive/1SRAIHoe6BlFtn9mj8z5Z4PWGT289enU8?fullscreenApplet=true' },

  // SAFETY
  { id: '2', name: 'Occupational Health', icon: HardHat, color: 'from-teal-400 to-emerald-600', type: ModuleType.SAFETY, category: 'safety', description: 'NRs Chatbot & Safety Standards' },
  { id: '42', name: 'NR1', icon: ShieldCheck, color: 'from-emerald-500 to-teal-700', type: ModuleType.CHAT_GENERAL, category: 'safety', description: 'Disposições Gerais e Gerenciamento de Riscos Ocupacionais', externalUrl: 'https://ai.studio/apps/drive/1PoKIjJm-I9FR4AcUTsih0fn9xk1tszPk?fullscreenApplet=true' },
  { id: '10', name: 'Vídeos SST', icon: Film, color: 'from-orange-400 to-red-600', type: ModuleType.VIDEOS_SST, category: 'safety', description: 'Treinamentos e Vídeos de Segurança' },
  { id: '14', name: 'Máximo Brasil', icon: Wrench, color: 'from-green-500 to-emerald-700', type: ModuleType.CHAT_GENERAL, category: 'safety', description: 'Manutenção e Serviços', externalUrl: 'https://sites.google.com/view/maximobrasilmanutencao' },

  // HEALTH
  { id: '45', name: 'Fisio', icon: Activity, color: 'from-emerald-400 to-teal-600', type: ModuleType.CHAT_GENERAL, category: 'health', description: 'Fisioterapia e Exercícios de Recuperação', externalUrl: 'https://ai.studio/apps/drive/15jjos8bJN2cLHxyyDpDgpuchsu1y-o24?fullscreenApplet=true' },

  // UTILIDADES
  { id: '16', name: '1º Milhão', icon: Target, color: 'from-emerald-500 to-green-700', type: ModuleType.MILLION, category: 'utilities', description: 'Calculadora de Independência Financeira' },
  { id: '11', name: 'Calculadora', icon: Calculator, color: 'from-indigo-500 to-blue-700', type: ModuleType.CALCULATOR, category: 'utilities', description: 'Simples, Científica e Financeira' },
  { id: '7', name: 'Tabuada', icon: Calculator, color: 'from-orange-400 to-amber-600', type: ModuleType.CHAT_GENERAL, category: 'utilities', description: 'Multiplication Tables', externalUrl: 'https://tabuada-pi-plum.vercel.app/' },
  { id: '25', name: 'Supermercado', icon: ShoppingCart, color: 'from-lime-500 to-green-600', type: ModuleType.CHAT_GENERAL, category: 'utilities', description: 'Lista de Compras', externalUrl: 'https://ai.studio/apps/drive/1ps8tjChLDn6QM7XYE3aPfApAdA-wHUpf?fullscreenApplet=true' },

  // TOOLS
  { id: '37', name: 'Guia do Usuário', icon: Book, color: 'from-sky-400 to-blue-600', type: ModuleType.GUIDE, category: 'tools', description: 'Dicas e Tutoriais do App' },
  { id: '30', name: 'Forge Ideia', icon: Hammer, color: 'from-orange-600 to-amber-800', type: ModuleType.CHAT_GENERAL, category: 'tools', description: 'Laboratório de Ideias', externalUrl: 'https://ai.studio/apps/drive/1acL4JKmvageoJmvxzWPR2lLaYzaHffig?fullscreenApplet=true' },
  { id: '32', name: '#TAG', icon: Hash, color: 'from-rose-400 to-pink-600', type: ModuleType.CHAT_GENERAL, category: 'tools', description: 'Gerador de Hashtags', externalUrl: 'https://ai.studio/apps/drive/1xCKN6OjyUWOGB0s-Gq490nQxEI50usbs?fullscreenApplet=true' },
  { id: '33', name: 'BlogStruct', icon: Layout, color: 'from-indigo-400 to-purple-600', type: ModuleType.CHAT_GENERAL, category: 'tools', description: 'Estrutura de Blog', externalUrl: 'https://ai.studio/apps/drive/1SmCF7DiFA5krE-0jyRH5k-JAyO9kPkZb?fullscreenApplet=true' },
  { id: '34', name: 'EstruturadorAI', icon: BrainCircuit, color: 'from-blue-500 to-indigo-700', type: ModuleType.CHAT_GENERAL, category: 'tools', description: 'Estruturação Inteligente', externalUrl: 'https://ai.studio/apps/drive/1Su1xK3X0Zaox23Qvfonudu-OB98bi4AX?fullscreenApplet=true' },
  { id: '43', name: 'QR Code', icon: QrCode, color: 'from-violet-400 to-purple-600', type: ModuleType.CHAT_GENERAL, category: 'tools', description: 'Gerador e Leitor de QR Code Inteligente', externalUrl: 'https://ai.studio/apps/drive/1LFGtewCxYEhUq-kPnhcr2XvlVtq3lcof?fullscreenApplet=true' },

  // MEDIA
  { id: '15', name: 'Notícias', icon: Newspaper, color: 'from-blue-600 to-indigo-800', type: ModuleType.NEWS, category: 'media', description: 'Economia, Vagas, Segurança e TI' },
  { id: '9', name: 'Podcast', icon: Mic, color: 'from-purple-500 to-violet-700', type: ModuleType.PODCAST, category: 'media', description: 'Áudios e Conversas' },
  { id: '31', name: 'Insight Vídeo', icon: Clapperboard, color: 'from-violet-500 to-fuchsia-700', type: ModuleType.CHAT_GENERAL, category: 'media', description: 'Análise de Conteúdo', externalUrl: 'https://ai.studio/apps/drive/1j7hVYfhJuzfkf_SXjXT8wgzBtT0htilS?fullscreenApplet=true' },

  // SOCIAL
  { id: '38', name: 'Comunidade', icon: Users, color: 'from-indigo-500 to-blue-700', type: ModuleType.COMMUNITY, category: 'social', description: 'Fórum de Dúvidas e Discussões' },
  { id: '18', name: 'GitHub', icon: Github, color: 'from-gray-700 to-black', type: ModuleType.CHAT_GENERAL, category: 'social', description: 'Meu Portfólio', externalUrl: 'https://github.com/MBARUDI' },
  { id: '19', name: 'YouTube', icon: Youtube, color: 'from-red-500 to-red-800', type: ModuleType.CHAT_GENERAL, category: 'social', description: 'Canal Mdbarudi', externalUrl: 'https://youtube.com/@mdbarudi?si=5zOAPj9bkqn2CfsD' },
  { id: '44', name: 'SocialNexus', icon: Share2, color: 'from-pink-500 to-rose-700', type: ModuleType.CHAT_GENERAL, category: 'social', description: 'Central de Conexões Inteligentes', externalUrl: 'https://ai.studio/apps/drive/1C3m7SG8UY-zehHhVl-xm2YbNlhTsgiXA?fullscreenApplet=true' },
];

const APPS = APPS_DATA.sort((a, b) => a.name.localeCompare(b.name));

const SECTIONS_RAW: { id: AppCategory; title: string; description: string }[] = [
  { id: 'media', title: '📺 Conteúdo e Mídia', description: 'Notícias, podcasts e mídia.' },
  { id: 'learning', title: '🎓 Educação', description: 'Cursos e aprimoramento pessoal.' },
  { id: 'civil_engineering', title: '🏗️ Engenharia Civil', description: 'Recursos e normas técnicas.' },
  { id: 'tools', title: '🛠️ Ferramentas', description: 'Utilitários de produtividade.' },
  { id: 'stories', title: '📚 Histórias', description: 'Contos e narrativas interativas.' },
  { id: 'ai_assistants', title: '✨ Orientação', description: 'IA e suporte inteligente.' },
  { id: 'safety', title: '👷 Segurança', description: 'Treinamento e NRs.' },
  { id: 'health', title: '🏥 Saúde', description: 'Bem-estar e recuperação física.' },
  { id: 'social', title: '🌐 Social', description: 'Comunidade e redes.' },
  { id: 'utilities', title: '🧮 Utilidades', description: 'Essenciais do dia a dia.' },
];

const SECTIONS = SECTIONS_RAW.sort((a, b) => a.title.substring(2).localeCompare(b.title.substring(2)));

const App: React.FC = () => {
  const [activeApp, setActiveApp] = useState<AppIcon | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const filteredApps = APPS.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderModule = () => {
    switch (activeApp?.type) {
      case ModuleType.LANGUAGE: return <LanguageModule />;
      case ModuleType.SAFETY: return <SafetyModule />;
      case ModuleType.LEADERSHIP: return <LeadershipModule />;
      case ModuleType.PODCAST: return <PodcastModule />;
      case ModuleType.VIDEOS_SST: return <VideosSstModule />;
      case ModuleType.CALCULATOR: return <CalculatorModule />;
      case ModuleType.NEWS: return <NewsModule />;
      case ModuleType.MILLION: return <MillionModule />;
      case ModuleType.GUIDE: return <GuideModule apps={APPS} />;
      case ModuleType.COMMUNITY: return <CommunityModule />;
      default: return <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center glass-morphism rounded-3xl mx-6 my-10"><Cpu size={48} className="mb-4 opacity-30" /><h2 className="text-xl font-bold mb-2">Módulo em Desenvolvimento</h2><p>Em breve novidades!</p></div>;
    }
  };

  return (
    <div className="h-screen w-screen bg-android-bg text-white overflow-hidden relative flex flex-col font-sans">
      <StatusBar />

      <div className="flex-1 relative overflow-hidden">
        {activeApp ? (
          <div className="absolute inset-0 bg-android-bg z-10 animate-slide-up flex flex-col">
             <div className="h-16 glass-morphism flex items-center px-4 shrink-0 justify-between z-20">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveApp(null)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft size={24} className="text-gray-300" />
                  </button>
                  <span className="font-bold text-lg text-gradient">{activeApp.name}</span>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeApp.color} flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.4)]`}>
                  <activeApp.icon size={20} className="text-white" />
                </div>
             </div>
             <div className="flex-1 overflow-hidden bg-[#0a0a0f]">
                {renderModule()}
             </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto px-6 pt-8 pb-32 animate-fade-in custom-scrollbar scroll-smooth">
            {/* Logo Area */}
            <div className="mb-10 text-center relative">
              <div className="inline-flex p-4 rounded-3xl glass-morphism mb-6 animate-float">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.4)]">
                   <Sparkles className="text-white" size={32} />
                </div>
              </div>
              <h1 className="text-5xl font-black tracking-tight text-white mb-2 leading-none">
                Mentorhub<span className="text-android-accent">AI</span>
              </h1>
              <div className="flex items-center justify-center gap-2">
                 <span className="h-[1px] w-4 bg-purple-500/50"></span>
                 <p className="text-[10px] text-purple-400 font-bold uppercase tracking-[0.4em]">Intelligence Suite</p>
                 <span className="h-[1px] w-4 bg-purple-500/50"></span>
              </div>
            </div>

            {/* Premium Search */}
            <div className="glass-morphism rounded-2xl p-0.5 mb-12 sticky top-0 z-30 group shadow-2xl">
              <div className="flex items-center bg-[#0d0d12] rounded-[14px] px-5 py-4 transition-all group-focus-within:bg-[#12121a]">
                <Search className="text-gray-500 mr-4 group-focus-within:text-purple-400 transition-colors" size={22} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquise seu próximo conhecimento..."
                  className="bg-transparent text-white placeholder-gray-600 text-base w-full focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* App Grid Sections */}
            <div className="space-y-16">
              {filteredApps.length === 0 && (
                <div className="text-center text-gray-500 py-16 glass-morphism rounded-[2.5rem]">
                  <Shapes className="mx-auto mb-4 opacity-10" size={64} />
                  <p className="font-medium text-lg">Nenhum aplicativo encontrado.</p>
                  <p className="text-sm opacity-50">Tente uma busca diferente.</p>
                </div>
              )}

              {SECTIONS.map((section) => {
                const sectionApps = filteredApps.filter(app => app.category === section.id);
                if (sectionApps.length === 0) return null;

                return (
                  <div key={section.id} className="animate-slide-up">
                    <div className="mb-8 px-2">
                       <h3 className="text-xs font-black text-purple-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-3">
                          <span className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,1)]"></span>
                          {section.title}
                       </h3>
                       <p className="text-sm text-gray-500 font-medium">{section.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-y-10 gap-x-6">
                      {sectionApps.map((app) => (
                        <button
                          key={app.id}
                          onClick={() => {
                            if (app.externalUrl) {
                              window.open(app.externalUrl, '_blank');
                            } else {
                              setActiveApp(app);
                            }
                          }}
                          className="flex flex-col items-center group relative"
                        >
                          {/* Inner Glow Background */}
                          <div className={`absolute -inset-2 rounded-[2rem] bg-gradient-to-br ${app.color} opacity-0 group-hover:opacity-10 blur-xl transition-all duration-500`}></div>
                          
                          {/* Icon Container */}
                          <div className={`w-20 h-20 bg-gradient-to-br ${app.color} rounded-[1.8rem] flex items-center justify-center mb-4 shadow-2xl group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 border border-white/20 relative z-10 overflow-hidden`}>
                             <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                             <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-black/20 rounded-full blur-md"></div>
                            <app.icon size={34} className="text-white drop-shadow-lg z-10" strokeWidth={1.5} />
                          </div>
                          
                          {/* Name */}
                          <span className="text-[11px] font-bold text-gray-400 text-center w-full truncate px-1 group-hover:text-white transition-colors tracking-wide">
                            {app.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Premium Informational Section */}
            <div className="mt-32 space-y-16 animate-slide-up">
              <div className="glass-morphism p-10 rounded-[3rem] relative overflow-hidden border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.1)]">
                 <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-600/10 rounded-full blur-[80px]"></div>
                 
                 <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                       <Zap className="text-purple-400" size={24} />
                       <span className="text-xs font-black text-purple-400 uppercase tracking-widest">Next-Gen Learning</span>
                    </div>
                    
                    <h2 className="text-4xl font-black text-white mb-6 leading-tight text-gradient">
                       Transforme seu potencial com o seu <span className="underline decoration-purple-500/30">hub de conhecimento inteligente</span>.
                    </h2>
                    <p className="text-gray-400 text-lg leading-relaxed mb-12 font-medium">
                       O MentorhubAI é a plataforma definitiva que reúne tudo que você precisa para aprender e se desenvolver em um só lugar. Esqueça vários apps: aqui você acessa Cursos de Idiomas, Treinamento em Segurança, Desenvolvimento Pessoal e muito mais.
                    </p>

                    <div className="grid gap-6 sm:grid-cols-3">
                       <div className="glass-morphism p-8 rounded-[2rem] hover:border-purple-500/40 transition-all group">
                          <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                             <Sparkles className="text-purple-400" size={28} />
                          </div>
                          <h4 className="text-lg font-bold text-white mb-3">Personalização</h4>
                          <p className="text-sm text-gray-500 leading-relaxed font-medium">A IA adapta cada conteúdo ao seu ritmo de progresso.</p>
                       </div>

                       <div className="glass-morphism p-8 rounded-[2rem] hover:border-blue-500/40 transition-all group">
                          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                             <Compass className="text-blue-400" size={28} />
                          </div>
                          <h4 className="text-lg font-bold text-white mb-3">Imediatismo</h4>
                          <p className="text-sm text-gray-500 leading-relaxed font-medium">Localize qualquer ferramenta ou curso em segundos.</p>
                       </div>

                       <div className="glass-morphism p-8 rounded-[2rem] hover:border-emerald-500/40 transition-all group">
                          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                             <Library className="text-emerald-400" size={28} />
                          </div>
                          <h4 className="text-lg font-bold text-white mb-3">Evolução</h4>
                          <p className="text-sm text-gray-500 leading-relaxed font-medium">Catálogo em expansão constante com novas trilhas.</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Guide Accordion */}
              {searchQuery === '' && (
                <div className="mt-8 mb-20 px-2">
                    <button 
                      onClick={() => setIsGuideOpen(!isGuideOpen)}
                      className="w-full flex items-center justify-between py-6 group border-b border-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl glass-morphism flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                          <Book size={20} className="text-purple-400" />
                        </div>
                        <span className="text-xl font-bold text-white">Guia de Aplicativos</span>
                      </div>
                      {isGuideOpen ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
                    </button>
                    
                    {isGuideOpen && (
                      <div className="pt-8 space-y-4 animate-fade-in origin-top">
                        {APPS.map(app => (
                          <div key={app.id} className="p-6 flex gap-6 glass-morphism rounded-[2rem] items-center hover:bg-white/5 transition-colors group">
                            <div className={`w-14 h-14 bg-gradient-to-br ${app.color} rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-6 transition-transform`}>
                              <app.icon size={28} className="text-white" />
                            </div>
                            <div className="flex-1">
                               <div className="flex items-center gap-3 mb-1">
                                 <h4 className="font-bold text-white">{app.name}</h4>
                                 {app.externalUrl && <span className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">External</span>}
                               </div>
                               <p className="text-sm text-gray-500 leading-relaxed font-medium">{app.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>
            
            {/* Footer Signature */}
            <div className="py-20 text-center opacity-20">
               <p className="text-xs font-bold tracking-[0.5em] uppercase">MentorhubAI © 2025</p>
            </div>
          </div>
        )}
      </div>

      {/* Modern Bottom Navigation */}
      <div className="h-20 bg-[#050505]/80 backdrop-blur-2xl flex justify-around items-center shrink-0 z-50 border-t border-white/5 pb-4 px-6">
        <button className="p-4 group relative" onClick={() => setActiveApp(null)}>
           <Menu size={24} className="text-gray-600 group-hover:text-purple-400 transition-colors rotate-90" />
           <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
        <button className="p-4 group relative" onClick={() => setActiveApp(null)}>
           <div className="w-6 h-6 border-2 border-gray-600 group-hover:border-purple-400 transition-colors rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-600 group-hover:bg-purple-400 rounded-sm"></div>
           </div>
           <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
        <button className="p-4 group relative" onClick={() => { if(activeApp) setActiveApp(null); }}>
           <ChevronLeft size={30} className="text-gray-600 group-hover:text-purple-400 transition-colors" />
           <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </div>
    </div>
  );
};

export default App;
