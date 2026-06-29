import React, { useState, useEffect } from 'react';
import { COURSE_LESSONS } from './constants';
import { Lesson, UserProfile } from './types';
import VideoPlayer from './components/VideoPlayer';
import ContentPanel from './components/ContentPanel';
import RightPanel from './components/RightPanel';
import CertificateModal from './components/CertificateModal';
import OnboardingModal from './components/OnboardingModal';
import RankingModal from './components/RankingModal';
import { getOrCreateUser, updateUserProgress } from './services/userService';
import { GraduationCap, Trophy, Award, LogOut, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  // Estado do Usuário
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Estados da Aplicação
  const [currentLesson, setCurrentLesson] = useState<Lesson>(COURSE_LESSONS[0]);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  
  // Inicialização: Verifica se já tem ID no localStorage
  useEffect(() => {
    const initUser = async () => {
      setIsLoadingUser(true);
      const storedUserId = localStorage.getItem('gestaoMasterUserId');
      const storedUserName = localStorage.getItem('gestaoMasterUserName');

      if (storedUserId && storedUserName) {
        // Tenta carregar do banco
        const profile = await getOrCreateUser(storedUserId, storedUserName);
        if (profile) {
          setUserProfile(profile);
          
          // Restaura a aula onde parou
          const savedLesson = COURSE_LESSONS.find(l => l.id === profile.current_lesson_id);
          if (savedLesson) setCurrentLesson(savedLesson);
        } else {
          // Fallback se falhar banco (ex: offline), usa local mas pede login prox vez se limpar cache
          setShowOnboarding(true); 
        }
      } else {
        setShowOnboarding(true);
      }
      setIsLoadingUser(false);
    };

    initUser();
  }, []);

  const handleOnboardingComplete = async (name: string, existingId?: string) => {
    setIsLoadingUser(true);
    
    // Se veio um ID existente (selecionado da lista), usa ele. Se não, gera um novo.
    const idToUse = existingId || (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36));
    
    // Salva Local
    localStorage.setItem('gestaoMasterUserId', idToUse);
    localStorage.setItem('gestaoMasterUserName', name);

    // Cria no Banco ou Busca Existente
    const profile = await getOrCreateUser(idToUse, name);
    
    if (profile) {
      setUserProfile(profile);
      // Restaura aula se for usuário existente
      const savedLesson = COURSE_LESSONS.find(l => l.id === profile.current_lesson_id);
      if (savedLesson) setCurrentLesson(savedLesson);
      
      setShowOnboarding(false);
    } else {
      // Fallback Offline
      const offlineProfile: UserProfile = {
          id: idToUse,
          name: name,
          xp: 0,
          current_lesson_id: '1',
          completed_quizzes: []
      }
      setUserProfile(offlineProfile);
      setShowOnboarding(false);
    }
    setIsLoadingUser(false);
  };

  const handleQuizComplete = async (scoreToAdd: number) => {
    if (!userProfile) return;

    // Verifica se já fez este quiz para não duplicar (usando o array do banco ou local)
    if (userProfile.completed_quizzes.includes(currentLesson.id)) {
      return;
    }

    const newXp = userProfile.xp + scoreToAdd;
    const newCompleted = [...userProfile.completed_quizzes, currentLesson.id];

    // 1. Atualiza Banco Primeiro (Await)
    await updateUserProgress(userProfile.id, {
      xp: newXp,
      completed_quizzes: newCompleted
    });

    // 2. Atualiza Estado Local depois de confirmar
    setUserProfile(prev => prev ? ({
      ...prev,
      xp: newXp,
      completed_quizzes: newCompleted
    }) : null);
  };

  const handleLessonChange = async (lesson: Lesson) => {
    setCurrentLesson(lesson);
    if (userProfile) {
      // Salva onde o usuário parou
      await updateUserProgress(userProfile.id, {
        current_lesson_id: lesson.id
      });
      setUserProfile(prev => prev ? ({ ...prev, current_lesson_id: lesson.id }) : null);
    }
  };
  
  const goToNextLesson = () => {
    const currentIndex = COURSE_LESSONS.findIndex(l => l.id === currentLesson.id);
    if (currentIndex < COURSE_LESSONS.length - 1) {
        handleLessonChange(COURSE_LESSONS[currentIndex + 1]);
    }
  };

  const goToPrevLesson = () => {
    const currentIndex = COURSE_LESSONS.findIndex(l => l.id === currentLesson.id);
    if (currentIndex > 0) {
        handleLessonChange(COURSE_LESSONS[currentIndex - 1]);
    }
  };
  
  const handleLogout = () => {
      if(confirm("Deseja sair? Seu progresso está salvo no ranking.")) {
          // Limpa credenciais locais
          localStorage.removeItem('gestaoMasterUserId');
          localStorage.removeItem('gestaoMasterUserName');
          
          // Recarrega a página para garantir um estado limpo (Login/Nome)
          window.location.reload();
      }
  }

  // Verifica indices para habilitar botões
  const currentLessonIndex = COURSE_LESSONS.findIndex(l => l.id === currentLesson.id);
  const hasNext = currentLessonIndex < COURSE_LESSONS.length - 1;
  const hasPrev = currentLessonIndex > 0;

  // Se estiver carregando usuário inicial, mostra spinner simples ou tela de load
  if (isLoadingUser && !userProfile && !showOnboarding) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-100"><div className="animate-spin text-blue-600">Carregando...</div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans print:bg-white">
      
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} isLoading={isLoadingUser} />}

      {/* Header - Hidden on Print */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm print:hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-lg text-white shadow-lg">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none hidden sm:block">GestãoMaster AI</h1>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none sm:hidden">GestãoMaster</h1>
              <div className="flex items-center gap-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-1 hidden sm:block">MBA Executivo Digital</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
             
             {/* Botão de Ranking com Perfil e XP */}
             {userProfile && (
                 <button 
                    onClick={() => setIsRankingOpen(true)}
                    className="flex items-center gap-3 pl-3 pr-1 py-1 rounded-full border border-slate-200 bg-white hover:border-blue-300 transition-all group mr-0 md:mr-2 shadow-sm active:scale-95"
                    title="Ver Ranking Global"
                 >
                     <div className="flex-col items-end hidden sm:flex">
                         <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider group-hover:text-blue-500 transition-colors">Ranking</span>
                         <span className="text-xs font-bold text-slate-700 max-w-[100px] truncate">{userProfile.name}</span>
                     </div>
                     <div className="bg-blue-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm group-hover:bg-blue-700 transition-colors">
                        <Trophy size={14} className="text-yellow-300" />
                        <span className="text-sm font-black tracking-wide">{userProfile.xp} XP</span>
                     </div>
                 </button>
             )}
             
             <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
             
             {/* Botão de Certificado */}
             <button 
               onClick={() => setIsCertificateOpen(true)}
               className="bg-slate-900 text-white pl-4 pr-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-all shadow-md hover:shadow-lg hidden md:flex items-center gap-2 active:scale-95"
             >
               <Award size={16} className="text-yellow-400" />
               <span>Emitir Certificado</span>
             </button>
             
             {/* Botão de Certificado Mobile (Icon Only) */}
             <button 
               onClick={() => setIsCertificateOpen(true)}
               className="bg-slate-900 text-white p-2.5 rounded-full hover:bg-slate-800 md:hidden flex items-center justify-center shadow-md active:scale-95"
               title="Emitir Certificado"
             >
               <Award size={18} className="text-yellow-400" />
             </button>

             <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors ml-2" title="Sair">
                 <LogOut size={20} />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content - Hidden on Print */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 print:hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-7rem)] min-h-[800px]">
          
          {/* Left Column: Video & AI Content (Takes up 8/12 on large screens) */}
          <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-y-auto pb-10 lg:pb-0 scroll-smooth pr-1">
            {/* Video Player Section */}
            <div className="flex-shrink-0 shadow-2xl rounded-xl overflow-hidden bg-black">
               <VideoPlayer 
                  youtubeId={currentLesson.youtubeId} 
                  title={currentLesson.title} 
               />
            </div>
            
            {/* AI Interaction Panel */}
            <div className="flex-1 min-h-[400px]">
              <ContentPanel 
                currentLesson={currentLesson} 
                onQuizComplete={handleQuizComplete}
                hasCompletedQuiz={userProfile ? userProfile.completed_quizzes.includes(currentLesson.id) : false}
                onNextLesson={goToNextLesson}
                onPrevLesson={goToPrevLesson}
                hasPrev={hasPrev}
                hasNext={hasNext}
              />
            </div>
          </div>

          {/* Right Column: Playlist/Leaderboard (Takes up 4/12 on large screens) */}
          <div className="lg:col-span-4 h-full overflow-hidden">
             <RightPanel 
                lessons={COURSE_LESSONS} 
                currentLesson={currentLesson} 
                onSelectLesson={handleLessonChange}
                userScore={userProfile?.xp || 0}
                userId={userProfile?.id || ''}
                completedLessonIds={userProfile?.completed_quizzes || []}
             />
          </div>

        </div>
      </main>

      {/* Certificate Modal */}
      <CertificateModal 
        isOpen={isCertificateOpen} 
        onClose={() => setIsCertificateOpen(false)} 
        lessons={COURSE_LESSONS}
      />

      {/* Ranking Modal */}
      {userProfile && (
        <RankingModal 
          isOpen={isRankingOpen}
          onClose={() => setIsRankingOpen(false)}
          userId={userProfile.id}
        />
      )}
    </div>
  );
};

export default App;