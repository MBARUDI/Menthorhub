import React, { useState, useEffect } from 'react';
import { COURSE_LESSONS } from './gestaomaster/constants';
import { Lesson, UserProfile } from './gestaomaster/types';
import VideoPlayer from './gestaomaster/components/VideoPlayer';
import ContentPanel from './gestaomaster/components/ContentPanel';
import RightPanel from './gestaomaster/components/RightPanel';
import CertificateModal from './gestaomaster/components/CertificateModal';
import OnboardingModal from './gestaomaster/components/OnboardingModal';
import RankingModal from './gestaomaster/components/RankingModal';
import { getOrCreateUser, updateUserProgress } from './gestaomaster/services/userService';
import { GraduationCap, Trophy, Award, LogOut } from 'lucide-react';

const GestaoMasterModule: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [currentLesson, setCurrentLesson] = useState<Lesson>(COURSE_LESSONS[0]);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  
  useEffect(() => {
    const initUser = async () => {
      setIsLoadingUser(true);
      const storedUserId = localStorage.getItem('gestaoMasterUserId');
      const storedUserName = localStorage.getItem('gestaoMasterUserName');

      if (storedUserId && storedUserName) {
        const profile = await getOrCreateUser(storedUserId, storedUserName);
        if (profile) {
          setUserProfile(profile);
          const savedLesson = COURSE_LESSONS.find(l => l.id === profile.current_lesson_id);
          if (savedLesson) setCurrentLesson(savedLesson);
        } else {
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
    
    const idToUse = existingId || (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36));
    
    localStorage.setItem('gestaoMasterUserId', idToUse);
    localStorage.setItem('gestaoMasterUserName', name);

    const profile = await getOrCreateUser(idToUse, name);
    
    if (profile) {
      setUserProfile(profile);
      const savedLesson = COURSE_LESSONS.find(l => l.id === profile.current_lesson_id);
      if (savedLesson) setCurrentLesson(savedLesson);
      setShowOnboarding(false);
    } else {
      const offlineProfile: UserProfile = {
          id: idToUse,
          name: name,
          xp: 0,
          current_lesson_id: '1',
          completed_quizzes: []
      };
      setUserProfile(offlineProfile);
      setShowOnboarding(false);
    }
    setIsLoadingUser(false);
  };

  const handleQuizComplete = async (scoreToAdd: number) => {
    if (!userProfile) return;

    if (userProfile.completed_quizzes.includes(currentLesson.id)) {
      return;
    }

    const newXp = userProfile.xp + scoreToAdd;
    const newCompleted = [...userProfile.completed_quizzes, currentLesson.id];

    await updateUserProgress(userProfile.id, {
      xp: newXp,
      completed_quizzes: newCompleted
    });

    setUserProfile(prev => prev ? ({
      ...prev,
      xp: newXp,
      completed_quizzes: newCompleted
    }) : null);
  };

  const handleLessonChange = async (lesson: Lesson) => {
    setCurrentLesson(lesson);
    if (userProfile) {
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
          localStorage.removeItem('gestaoMasterUserId');
          localStorage.removeItem('gestaoMasterUserName');
          window.location.reload();
      }
  };

  const currentLessonIndex = COURSE_LESSONS.findIndex(l => l.id === currentLesson.id);
  const hasNext = currentLessonIndex < COURSE_LESSONS.length - 1;
  const hasPrev = currentLessonIndex > 0;

  if (isLoadingUser && !userProfile && !showOnboarding) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 min-h-[400px]">
          <div className="animate-spin text-blue-600 font-bold text-sm">Carregando perfil...</div>
        </div>
      );
  }

  return (
    <div className="w-full h-full bg-slate-100 text-slate-900 flex flex-col font-sans overflow-y-auto custom-scrollbar">
      
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} isLoading={isLoadingUser} />}

      {/* Local Module Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm shrink-0">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
             
             {userProfile && (
                 <button 
                    onClick={() => setIsRankingOpen(true)}
                    className="flex items-center gap-3 pl-3 pr-1 py-1 rounded-full border border-slate-200 bg-white hover:border-blue-300 transition-all group mr-0 md:mr-2 shadow-sm active:scale-95 text-slate-700"
                    title="Ver Ranking Global"
                 >
                     <div className="flex-col items-end hidden sm:flex">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider group-hover:text-blue-500 transition-colors">Ranking</span>
                          <span className="text-xs font-bold text-slate-700 max-w-[100px] truncate">{userProfile.name}</span>
                     </div>
                     <div className="bg-blue-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm group-hover:bg-blue-700 transition-colors">
                        <Trophy size={14} className="text-yellow-300 animate-pulse" />
                        <span className="text-sm font-black tracking-wide">{userProfile.xp} XP</span>
                     </div>
                 </button>
             )}
             
             <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
             
             <button 
               onClick={() => setIsCertificateOpen(true)}
               className="bg-slate-900 text-white pl-4 pr-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-all shadow-md hover:shadow-lg hidden md:flex items-center gap-2 active:scale-95"
             >
               <Award size={16} className="text-yellow-400" />
               <span>Emitir Certificado</span>
             </button>
             
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

      {/* Main Experience Body */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[750px]">
          
          {/* Left Column: Video & AI Content */}
          <div className="lg:col-span-8 flex flex-col gap-6 h-full">
            <div className="flex-shrink-0 shadow-2xl rounded-xl overflow-hidden bg-black">
               <VideoPlayer 
                  youtubeId={currentLesson.youtubeId} 
                  title={currentLesson.title} 
               />
            </div>
            
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

          {/* Right Column: Playlist/Leaderboard */}
          <div className="lg:col-span-4 h-full min-h-[500px]">
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
      </div>

      <CertificateModal 
        isOpen={isCertificateOpen} 
        onClose={() => setIsCertificateOpen(false)} 
        lessons={COURSE_LESSONS}
      />

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

export default GestaoMasterModule;
