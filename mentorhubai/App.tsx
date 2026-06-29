
import React, { useState, useEffect } from 'react';
import { 
  Languages, 
  Cpu,
  ChevronLeft,
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
  Map,
  Heart,
  Award,
  TrendingUp,
  Zap,
  Tags,
  Cog,
  ShoppingBasket,
  Key,
  Video,
  Library,
  Flame,
  DollarSign,
  MessageCircleHeart,
  HeartHandshake,
  Quote,
  X,
  Plus,
  BookOpen,
  ShieldCheck,
  Share2,
  Stethoscope,
  Activity,
  GraduationCap,
  Gamepad2
} from 'lucide-react';
import StatusBar from './components/StatusBar';
import LanguageModule from './components/modules/LanguageModule';
import EnglishModule from './components/modules/EnglishModule';
import SafetyModule from './components/modules/SafetyModule';
import LeadershipModule from './components/modules/LeadershipModule';
import PodcastModule from './components/modules/PodcastModule';
import VideosSstModule from './components/modules/VideosSstModule';
import CalculatorModule from './components/modules/CalculatorModule';
import NewsModule from './components/modules/NewsModule';
import MillionModule from './components/modules/MillionModule';
import TSTModule from './components/modules/TSTModule';
import GratitudeModule from './components/modules/GratitudeModule';
import LumenModule from './components/modules/LumenModule';
import ParaklesisModule from './components/modules/ParaklesisModule';
import StudiesModule from './components/modules/StudiesModule';
import ConsciousWalletModule from './components/modules/ConsciousWalletModule';
import GestaoMasterModule from './components/modules/GestaoMasterModule';
import JornadaInteriorModule from './components/modules/JornadaInteriorModule';
import PdcaMasterModule from './components/modules/pdca-master/App';
import NeonRacerModule from './components/modules/NeonRacerModule';
import ListaTarefasModule from './components/modules/ListaTarefasModule';
import SmartMarketModule from './components/modules/SmartMarketModule';
import { AppIcon, ModuleType, AppCategory } from './types';
import { generateDailyTip } from './services/geminiService';

const APPS_DATA: AppIcon[] = [
  // INSPIRATION / ESPIRITUALIDADE
  { id: 'daily-msg', name: 'Paraklesis', icon: MessageCircleHeart, color: 'bg-rose-400', type: ModuleType.PARAKLESIS, category: 'stories', description: 'Luz no Caminho - Palavras de orientação e consolo para cada momento da vida.' },
  { id: 'lumen', name: 'Lumen', icon: Flame, color: 'bg-amber-500', type: ModuleType.LUMEN, category: 'stories', description: 'Fé e desenvolvimento pessoal com mentoria de propósito e negócios.' },
  { id: 'gratitude', name: 'Gratitude Strategist', icon: Heart, color: 'bg-rose-500', type: ModuleType.GRATITUDE, category: 'stories', description: 'Diário de gratidão estratégico com mentoria de bem-estar.' },

  // LEARNING / EDUCAÇÃO
  { id: 'en-course', name: 'Give Me', icon: Languages, color: 'bg-blue-500', type: ModuleType.ENGLISH, category: 'learning', description: 'Curso interativo de inglês.' },
  { id: 'conscious-wallet', name: 'ConsciousWallet', icon: DollarSign, color: 'bg-green-600', type: ModuleType.CONSCIOUS_WALLET, category: 'learning', description: 'Consumo consciente e economia.' },
  { id: 'gestao-master', name: 'GestãoMaster AI Class', icon: Briefcase, color: 'bg-indigo-700', type: ModuleType.GESTAO_MASTER, category: 'learning', description: 'Gestão empresarial e profissional.' },
  { id: 'pdca-master', name: 'PDCA Master', icon: Repeat, color: 'bg-cyan-600', type: ModuleType.PDCA_MASTER, category: 'learning', description: 'Gestão pessoal via PDCA.' },
  { id: 'diario-jornada-interior', name: 'Diário Jornada Interior', icon: BookHeart, color: 'bg-pink-500', type: ModuleType.JORNADA_INTERIOR, category: 'learning', description: 'Autoconhecimento e coaching.' },
  { id: 'lead-vids', name: 'Liderança Vídeos', icon: Crown, color: 'bg-yellow-500', type: ModuleType.LEADERSHIP, category: 'learning', description: 'Biblioteca de liderança.' },

  // SAFETY / SEGURANÇA
  { id: 'sistema-sst', name: 'Gestão SST Profissional', icon: ShieldCheck, color: 'bg-indigo-600', type: ModuleType.TST, category: 'tst', description: 'Gestão Completa de Saúde e Segurança do Trabalho, PGR, PCMSO e checklist.' },
  { id: 'nr1', name: 'NR1', icon: ShieldCheck, color: 'bg-teal-600', type: ModuleType.CHAT_GENERAL, category: 'safety', description: 'Norma Regulamentadora 1.', externalUrl: 'https://ai.studio/apps/drive/1PoKIjJm-I9FR4AcUTsih0fn9xk1tszPk?fullscreenApplet=true' },
  { id: 'inspecao-predial', name: 'Inspeção Predial', icon: Home, color: 'bg-emerald-600', type: ModuleType.CHAT_GENERAL, category: 'safety', description: 'Inspeção e manutenção predial.', externalUrl: 'https://ai.studio/apps/drive/1LYZ2wtovd1AEyeclysoQ1cW6zpW3YnQ5?fullscreenApplet=true' },
  { id: 'saude-ocup', name: 'Saúde Ocupacional', icon: HardHat, color: 'bg-teal-500', type: ModuleType.SAFETY, category: 'safety', description: 'Chat NR e Simulados Técnicos.' },
  { id: 'vids-sst', name: 'Vídeos SST', icon: Film, color: 'bg-orange-600', type: ModuleType.VIDEOS_SST, category: 'safety', description: 'Treinamentos Técnicos SST.' },

  // FINANCE / FINANÇAS
  { id: 'planner', name: 'Planner', icon: Map, color: 'bg-emerald-700', type: ModuleType.CHAT_GENERAL, category: 'finance', description: 'Planejamento estratégico.', externalUrl: 'https://ai.studio/apps/drive/1r39IE9tYxKuyNP33puVOxIQIkyMqCjNC?fullscreenApplet=true' },
  { id: 'calc-pro', name: 'Calculadora Pro', icon: Calculator, color: 'bg-indigo-600', type: ModuleType.CALCULATOR, category: 'finance', description: 'Financeira e Científica.' },
  { id: 'calc-milhao', name: 'Calculadora Milhão', icon: Target, color: 'bg-emerald-600', type: ModuleType.MILLION, category: 'finance', description: 'Independência Financeira.' },

  // MEDIA / MÍDIA
  { id: 'portal-news', name: 'Portal Notícias', icon: Newspaper, color: 'bg-blue-700', type: ModuleType.NEWS, category: 'media', description: 'Grounding em tempo real.' },
  { id: 'podcast-ai', name: 'Podcast AI', icon: Mic, color: 'bg-purple-600', type: ModuleType.PODCAST, category: 'media', description: 'Conversas e Insights.' },
  { id: 'blogstruct-ai', name: 'BlogStruct AI', icon: Layout, color: 'bg-amber-600', type: ModuleType.NEWS, category: 'media', description: 'Posts estruturados com IA.', externalUrl: 'https://ai.studio/apps/drive/1SmCF7DiFA5krE-0jyRH5k-JAyO9kPkZb?fullscreenApplet=true' },
  { id: 'tubetags', name: 'TubeTags AI', icon: Hash, color: 'bg-red-700', type: ModuleType.CHAT_GENERAL, category: 'media', description: 'Tags para YouTube.', externalUrl: 'https://ai.studio/apps/drive/1xCKN6OjyUWOGB0s-Gq490nQxEI50usbs?fullscreenApplet=true' },

  // TOOLS / PRODUTIVIDADE
  { id: 'lista-tarefas', name: 'Lista de Tarefas', icon: Calendar, color: 'bg-cyan-600', type: ModuleType.LISTA_TAREFAS, category: 'tools', description: 'Gerenciador de tarefas inteligente.' },
  { id: 'tag-eng', name: 'QRCODE', icon: Tags, color: 'bg-red-500', type: ModuleType.SAFETY, category: 'tools', description: 'Engenharia de Segurança.', externalUrl: 'https://ai.studio/apps/drive/1LFGtewCxYEhUq-kPnhcr2XvlVtq3lcof?fullscreenApplet=true' },
  { id: 'pdf-supabase', name: 'Doc Inteligente', icon: FileText, color: 'bg-red-600', type: ModuleType.CHAT_GENERAL, category: 'tools', description: 'PDFs com IA e Supabase.', externalUrl: 'https://ai.studio/apps/drive/1MH-VIjz_M4nMZQNgGaCctwdfQmt0-VcX' },
  { id: 'estruturador', name: 'Estruturador AI', icon: BrainCircuit, color: 'bg-blue-600', type: ModuleType.CHAT_GENERAL, category: 'tools', description: 'Estruturação de textos.', externalUrl: 'https://ai.studio/apps/drive/1Su1xK3X0Zaox23Qvfonudu-OB98bi4AX' },
  { id: 'smartmarket', name: 'Mercado', icon: ShoppingBasket, color: 'bg-lime-600', type: ModuleType.SMART_MARKET, category: 'tools', description: 'Lista de compras inteligente.' },

  // SOCIAL / CONEXÕES
  { id: 'social-nexus', name: 'Social Nexus', icon: Share2, color: 'bg-indigo-600', type: ModuleType.CHAT_GENERAL, category: 'social', description: 'Plataforma de conexões inteligentes.', externalUrl: 'https://ai.studio/apps/drive/1TBQ5soHy66LSACdpGaFBW54kmnwaKZiP?fullscreenApplet=true' },
  { id: 'giuseppe', name: 'Giuseppe', icon: Globe, color: 'bg-slate-500', type: ModuleType.CHAT_GENERAL, category: 'social', description: 'Website pessoal Giuseppe Barudi.', externalUrl: 'https://sites.google.com/view/giuseppebarudi/' },
  { id: 'revista-digital', name: 'Revista Digital', icon: BookOpen, color: 'bg-indigo-500', type: ModuleType.CHAT_GENERAL, category: 'social', description: 'Magazine MD Barudi.', externalUrl: 'https://sites.google.com/view/magazinemdbarudi/revista' },
  { id: 'maximo-br', name: 'Máximo Brasil', icon: Cog, color: 'bg-slate-700', type: ModuleType.CHAT_GENERAL, category: 'social', description: 'Manutenção Industrial.', externalUrl: 'https://maximobrasil.com.br', imageUrl: '/maximo-brasil-logo.png' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700', type: ModuleType.CHAT_GENERAL, category: 'social', description: 'Rede Profissional.', externalUrl: 'https://www.linkedin.com/in/marcelo-barudi' },
  { id: 'github', name: 'GitHub', icon: Github, color: 'bg-gray-800', type: ModuleType.CHAT_GENERAL, category: 'social', description: 'Código Fonte.', externalUrl: 'https://github.com/MBARUDI' },
  { id: 'youtube-ext', name: 'YouTube', icon: Youtube, color: 'bg-red-600', type: ModuleType.CHAT_GENERAL, category: 'social', description: 'Canal de Conteúdo.', externalUrl: 'https://youtube.com' },
  { id: 'facebook-ext', name: 'Facebook', icon: Facebook, color: 'bg-blue-600', type: ModuleType.CHAT_GENERAL, category: 'social', description: 'Comunidade.', externalUrl: 'https://facebook.com' },
  { id: 'instagram-ext', name: 'Instagram', icon: Instagram, color: 'bg-pink-600', type: ModuleType.CHAT_GENERAL, category: 'social', description: 'Rede Social.', externalUrl: 'https://instagram.com' },

  { id: 'fisio-ai', name: 'Fisio', icon: Activity, color: 'bg-cyan-500', type: ModuleType.CHAT_GENERAL, category: 'health', description: 'Acompanhamento e exercícios de fisioterapia.', externalUrl: 'https://ai.studio/apps/drive/15jjos8bJN2cLHxyyDpDgpuchsu1y-o24?fullscreenApplet=true' },

  // STUDIES / ESTUDOS
  { id: 'vestibular-studies', name: 'Estudos Vestibulares', icon: GraduationCap, color: 'bg-indigo-600', type: ModuleType.STUDIES, category: 'studies', description: 'Plataforma Interativa de Estudos para Vestibulares e Simulador de Questões.' },
  { id: 'vestibular-pro', name: 'Vestibular Pro', icon: Target, color: 'bg-red-500', type: ModuleType.CHAT_GENERAL, category: 'studies', description: 'Plataforma completa de preparação para FUVEST, ENEM, FGV e INSPER com Tutora IA e Simulados Adaptativos.', externalUrl: 'http://localhost:5173/' },

  // GAMES / JOGOS
  { id: 'neon-racer', name: 'Neon Racer', icon: Gamepad2, color: 'bg-purple-500', type: ModuleType.NEON_RACER, category: 'games', description: 'Corrida retro-futurista.' },
];

const SECTIONS: { id: AppCategory | 'all'; title: string; icon: any }[] = [
  { id: 'all', title: 'Home', icon: Home },
  { id: 'stories', title: 'Espiritualidade', icon: HeartHandshake },
  { id: 'learning', title: 'Educação', icon: Award },
  { id: 'safety', title: 'Segurança', icon: Shield },
  { id: 'tst', title: 'TST', icon: ShieldCheck },
  { id: 'health', title: 'Saúde', icon: Stethoscope },
  { id: 'finance', title: 'Finanças', icon: TrendingUp },
  { id: 'media', title: 'Mídia', icon: Globe },
  { id: 'studies', title: 'Estudos', icon: GraduationCap },
  { id: 'tools', title: 'Produtividade', icon: Wrench },
  { id: 'social', title: 'Conexões', icon: User },
  { id: 'games', title: 'Jogos', icon: Gamepad2 },
];

const App: React.FC = () => {
  const [activeApp, setActiveApp] = useState<AppIcon | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | 'all'>('all');
  const [dailyInsight, setDailyInsight] = useState('Buscando sabedoria do dia...');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchInsight = async () => {
    setLoadingInsight(true);
    const tip = await generateDailyTip('leadership');
    setDailyInsight(tip);
    setLoadingInsight(false);
  };

  useEffect(() => {
    fetchInsight();
  }, []);

  const filteredApps = APPS_DATA.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const renderModule = () => {
    switch (activeApp?.type) {
      case ModuleType.ENGLISH: return <EnglishModule />;
      case ModuleType.LANGUAGE: return <LanguageModule />;
      case ModuleType.SAFETY: return <SafetyModule />;
      case ModuleType.LEADERSHIP: return <LeadershipModule />;
      case ModuleType.PODCAST: return <PodcastModule />;
      case ModuleType.VIDEOS_SST: return <VideosSstModule />;
      case ModuleType.CALCULATOR: return <CalculatorModule />;
      case ModuleType.NEWS: return <NewsModule />;
      case ModuleType.MILLION: return <MillionModule />;
      case ModuleType.TST: return <TSTModule />;
      case ModuleType.GRATITUDE: return <GratitudeModule />;
      case ModuleType.LUMEN: return <LumenModule />;
      case ModuleType.PARAKLESIS: return <ParaklesisModule />;
      case ModuleType.STUDIES: return <StudiesModule />;
      case ModuleType.CONSCIOUS_WALLET: return <ConsciousWalletModule />;
      case ModuleType.GESTAO_MASTER: return <GestaoMasterModule />;
      case ModuleType.JORNADA_INTERIOR: return <JornadaInteriorModule />;
      case ModuleType.PDCA_MASTER: return <PdcaMasterModule />;
      case ModuleType.NEON_RACER: return <NeonRacerModule />;
      case ModuleType.LISTA_TAREFAS: return <ListaTarefasModule />;
      case ModuleType.SMART_MARKET: return <SmartMarketModule />;
      default: return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-10 text-center animate-fade-in bg-android-bg">
          <div className="w-24 h-24 rounded-[2rem] bg-android-accent/10 flex items-center justify-center mb-8 animate-pulse">
            <Cpu size={48} className="text-android-accent opacity-40" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white tracking-tight">{activeApp?.name}</h2>
          <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">Este módulo de IA de alta performance está sendo sincronizado com o seu ambiente de trabalho.</p>
        </div>
      );
    }
  };

  return (
    <div className="h-screen w-screen bg-android-bg text-white overflow-hidden flex font-sans">
      {/* Dynamic Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[100] w-72 bg-android-surface/90 backdrop-blur-3xl border-r border-white/5 transform transition-transform duration-500 ease-in-out
        lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <img src="/maximo-brasil-logo.png" alt="Máximo Brasil" className="h-16 w-auto object-contain bg-white rounded-xl p-2 shadow-lg shadow-white/10" />
                <div>
                  <h1 className="text-2xl font-black tracking-tighter leading-none">Mentorhub<span className="text-android-accent">AI</span></h1>
                  <p className="text-[9px] text-android-accent/60 uppercase tracking-[0.4em] font-bold mt-1">Intelligent Hub</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 font-medium tracking-wide">Mentorhub é da Máximo Brasil</p>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-6 ml-4">Ecossistema</p>
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => { setSelectedCategory(section.id); setActiveApp(null); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${selectedCategory === section.id ? 'bg-android-accent/10 text-android-accent shadow-lg shadow-android-accent/5' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
              >
                <div className={`p-2 rounded-xl transition-all duration-300 ${selectedCategory === section.id ? 'bg-android-accent text-android-bg scale-110' : 'bg-white/5 group-hover:bg-white/10'}`}>
                   <section.icon size={18} />
                </div>
                <span className="text-sm font-bold tracking-tight">{section.title}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-white/5">
             <div className="flex items-center gap-4 p-4 bg-white/5 rounded-[1.5rem] border border-white/5 group hover:border-android-accent/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-android-accent to-purple-600 flex items-center justify-center text-white shadow-lg shadow-android-accent/10 group-hover:scale-110 transition-transform">
                   <User size={24} />
                </div>
                <div className="flex-1 overflow-hidden">
                   <p className="text-sm font-black text-white truncate">Marcelo Barudi</p>
                   <p className="text-[10px] text-gray-500 font-mono tracking-tighter">PRO ACCESS</p>
                </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Experience Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <StatusBar />
        
        {/* Mobile Navbar */}
        <header className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-white/5 shrink-0 bg-android-bg/80 backdrop-blur-xl z-40">
           <button onClick={() => setIsSidebarOpen(true)} className="p-3 -ml-3 text-gray-400 active:scale-90 transition-transform">
              <Menu size={24} />
           </button>
           <h1 className="text-xl font-black tracking-tighter">Mentorhub<span className="text-android-accent">AI</span></h1>
           <div className="w-10 h-10 rounded-2xl bg-android-accent/10 flex items-center justify-center border border-android-accent/20">
              <Sparkles size={18} className="text-android-accent" />
           </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {activeApp ? (
            <div className="absolute inset-0 bg-android-bg z-50 animate-slide-up flex flex-col">
               <div className="h-20 bg-android-surface/50 backdrop-blur-2xl border-b border-white/5 flex items-center px-8 shrink-0 shadow-xl">
                  <button 
                    onClick={() => setActiveApp(null)} 
                    className="p-3 -ml-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all group active:scale-90"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div className="ml-5">
                    <span className="block text-base font-black text-white tracking-tight leading-none mb-1">{activeApp.name}</span>
                    <span className="block text-[10px] text-android-accent uppercase tracking-widest font-black">AI Active Module</span>
                  </div>
                  <div className={`ml-auto w-12 h-12 ${activeApp.color} rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 scale-90 overflow-hidden`}>
                     {activeApp.imageUrl ? (
                       <img src={activeApp.imageUrl} alt={activeApp.name} className="w-8 h-8 object-contain bg-white rounded-md p-1" />
                     ) : (
                       <activeApp.icon size={24} className="text-white" />
                     )}
                  </div>
               </div>
               <div className="flex-1 overflow-hidden">{renderModule()}</div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto p-6 lg:p-12 pb-32 w-full space-y-12">
              
              {/* Widgets Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Search & Statistics */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <div className="bg-android-surface/50 border border-white/10 p-3 rounded-[2.5rem] flex items-center focus-within:ring-4 focus-within:ring-android-accent/10 transition-all shadow-2xl backdrop-blur-2xl">
                    <div className="w-14 h-14 rounded-full bg-android-accent flex items-center justify-center text-android-bg shadow-lg shadow-android-accent/20">
                      <Search size={22} />
                    </div>
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Pesquisar ecossistema..."
                      className="bg-transparent text-white placeholder-gray-500 text-lg w-full focus:outline-none font-bold px-6"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 flex-1">
                     <div className="bg-android-surface/30 border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between group hover:bg-android-accent/5 transition-colors">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">IA Latency</p>
                        <div className="flex items-end justify-between mt-4">
                           <span className="text-2xl font-black text-white">24ms</span>
                           <TrendingUp size={16} className="text-android-success" />
                        </div>
                     </div>
                     <div className="bg-android-surface/30 border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between group hover:bg-android-accent/5 transition-colors">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active nodes</p>
                        <div className="flex items-end justify-between mt-4">
                           <span className="text-2xl font-black text-white">128</span>
                           <Cpu size={16} className="text-android-accent" />
                        </div>
                     </div>
                  </div>
                </div>

                {/* Main IA Insight Banner */}
                <div className="lg:col-span-7 bg-gradient-to-br from-indigo-950/80 via-android-surface/50 to-purple-950/20 border border-white/10 rounded-[3rem] p-10 relative overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] group">
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                     <div className="absolute -top-24 -left-24 w-96 h-96 bg-android-accent rounded-full blur-[120px] animate-pulse" />
                  </div>
                  
                  <div className="relative flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[1.25rem] bg-android-accent/20 flex items-center justify-center border border-android-accent/30 shadow-inner">
                            <Sparkles size={24} className="text-android-accent" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-android-accent uppercase tracking-[0.4em]">Daily Insight</p>
                            <p className="text-xs text-gray-500 font-bold">Personalized Mentor Advice</p>
                          </div>
                       </div>
                       <button 
                         onClick={fetchInsight} 
                         disabled={loadingInsight} 
                         className={`p-4 bg-white/5 rounded-2xl border border-white/10 text-android-accent hover:bg-android-accent/10 transition-all active:scale-90 ${loadingInsight ? 'animate-spin' : ''}`}
                       >
                         <Repeat size={20} />
                       </button>
                    </div>

                    <p className="text-xl lg:text-2xl text-white font-medium leading-relaxed italic line-clamp-4">
                      "{dailyInsight}"
                    </p>

                    <div className="mt-auto pt-10 flex items-center gap-6">
                       <div className="flex -space-x-3">
                          {[1,2,3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-android-bg bg-android-surface flex items-center justify-center text-[10px] font-bold text-gray-500">
                               {i}
                            </div>
                          ))}
                       </div>
                       <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Optimized for your career</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Filter Desktop */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-6 border-t border-white/5">
                <div>
                  <h3 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
                    {SECTIONS.find(s => s.id === selectedCategory)?.title}
                    <div className="px-4 py-1.5 bg-android-accent/10 rounded-full text-xs font-black text-android-accent border border-android-accent/20 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-android-accent animate-pulse" />
                      {filteredApps.length} APPS
                    </div>
                  </h3>
                </div>
                
                <div className="hidden md:flex gap-2 p-1.5 bg-android-surface/40 border border-white/5 rounded-[1.5rem] backdrop-blur-xl">
                   {['all', 'learning', 'safety', 'tst', 'health', 'finance', 'studies', 'tools', 'social'].map((cat) => {
                     const section = SECTIONS.find(s => s.id === cat);
                     const label = cat === 'all' ? 'Ver Tudo' : (section ? section.title : cat);
                     return (
                       <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat as any)}
                          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${selectedCategory === cat ? 'bg-android-accent text-android-bg shadow-xl' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                       >
                         {label}
                       </button>
                     );
                   })}
                </div>
              </div>

              {/* Dynamic App Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
                {filteredApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => app.externalUrl ? window.open(app.externalUrl, '_blank') : setActiveApp(app)}
                    className="flex flex-col text-left group animate-fade-in relative h-full"
                  >
                    <div className="relative w-full min-h-[240px] sm:min-h-[260px] h-full bg-android-surface/30 border border-white/5 rounded-[2.5rem] sm:rounded-[3rem] p-5 sm:p-8 flex flex-col shadow-[0_16px_32px_-8px_rgba(0,0,0,0.3)] transition-all duration-500 group-hover:bg-android-surface/60 group-hover:border-android-accent/30 group-hover:-translate-y-4 group-hover:shadow-android-accent/10 active:scale-95 group-active:duration-75">

                      
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 ${app.color} rounded-[1.75rem] sm:rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl border border-white/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 overflow-hidden`}>
                        {app.imageUrl ? (
                           <img src={app.imageUrl} alt={app.name} className="w-10 h-10 sm:w-12 sm:h-12 object-contain bg-white rounded-xl p-1 drop-shadow-md" />
                        ) : (
                           <app.icon className="w-8 h-8 sm:w-9 sm:h-9 text-white drop-shadow-2xl" />
                        )}
                      </div>

                      <div className="mt-auto">
                        <h4 className="text-lg sm:text-xl font-black text-white group-hover:text-android-accent transition-colors leading-tight line-clamp-2">
                          {app.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 font-bold line-clamp-2 mt-2 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                          {app.description}
                        </p>
                      </div>
                      
                      {app.externalUrl && (
                        <div className="absolute top-8 right-8 p-3 bg-white/5 rounded-2xl text-gray-700 group-hover:text-android-accent transition-all duration-500 group-hover:rotate-12">
                           <Globe size={16} />
                        </div>
                      )}

                      <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                         <div className="w-10 h-10 rounded-full bg-android-accent flex items-center justify-center text-android-bg">
                            <Plus size={20} />
                         </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Empty Search State */}
              {filteredApps.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-gray-600 animate-fade-in">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                    <Search size={32} className="opacity-20" />
                  </div>
                  <p className="text-xl font-black tracking-tight text-white mb-2">Nenhum resultado</p>
                  <p className="text-sm font-bold mb-8 opacity-50">Tente ajustar sua pesquisa ou categoria.</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                    className="px-8 py-4 bg-android-accent/10 border border-android-accent/20 rounded-2xl text-android-accent text-xs font-black uppercase tracking-widest hover:bg-android-accent hover:text-android-bg transition-all"
                  >
                    Resetar Filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* System Navigation Bar */}
        <footer className="h-16 bg-black flex justify-around items-center shrink-0 z-[60] border-t border-white/5 backdrop-blur-3xl shadow-[0_-16px_32px_rgba(0,0,0,0.5)]">
          <button className="p-4 group flex flex-col items-center gap-1" onClick={() => setActiveApp(null)}>
             <Menu size={18} className="text-gray-500 group-active:scale-75 group-hover:text-white transition-all rotate-90" />
          </button>
          <button className="p-4 group flex flex-col items-center gap-1" onClick={() => setActiveApp(null)}>
             <div className="w-4 h-4 border-2 border-gray-500 rounded-lg group-active:scale-75 group-hover:border-android-accent transition-all" />
          </button>
          <button className="p-4 group flex flex-col items-center gap-1" onClick={() => setActiveApp(null)}>
             <ChevronLeft size={22} className="text-gray-500 group-active:-translate-x-2 group-hover:text-white transition-all" />
          </button>
        </footer>
      </main>
    </div>
  );
};

export default App;
