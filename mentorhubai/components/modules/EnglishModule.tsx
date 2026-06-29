import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Level, TargetLanguage, Lesson, UserProgress, LevelTest, LessonProgress, ActivityLog, LessonHistory, FullBackup } from './english/types';
import { generateLesson, generateLevelTest, translateBidirectional, generateToeflSimulation } from './english/services/geminiService';
import { storageService } from './english/services/storageService';
import { LEVELS, LESSONS_PER_LEVEL } from './english/constants';
import AuthScreen from './english/components/AuthScreen';
import ProgressDashboard from './english/components/ProgressDashboard';
import Leaderboard from './english/components/Leaderboard';
import ExerciseComponent from './english/components/ExerciseComponent';
import LevelTestComponent from './english/components/LevelTestComponent';
import WritingPracticeComponent from './english/components/WritingPracticeComponent';
import ConversationComponent from './english/components/ConversationComponent';
import Flashcard from './english/components/Flashcard';
import PlacementFlow from './english/components/PlacementFlow';
import { jsPDF } from 'jspdf';
import { 
  BookOpenIcon, BeakerIcon, CheckCircleIcon, ChatBubbleLeftRightIcon, 
  ChevronLeftIcon, ChevronRightIcon, SpeakerWaveIcon, TagIcon, 
  LightBulbIcon, ChartBarIcon, TrophyIcon, LockClosedIcon, 
  StarIcon, FireIcon, LanguageIcon, UserCircleIcon, SoundWaveAnimation, MicrophoneIcon, ClipboardDocumentCheckIcon, ArrowRightOnRectangleIcon, PencilSquareIcon, TextSizeIcon
} from './english/components/icons';

interface SpeechRecognitionEvent extends Event { readonly results: any; }
interface SpeechRecognitionErrorEvent extends Event { readonly error: string; }

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

const EnglishModule: React.FC = () => {
  // Auth & User State
  const [user, setUser] = useState<User | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [showPlacementModal, setShowPlacementModal] = useState<boolean>(false);
  const [userProgress, setUserProgress] = useState<UserProgress>({ totalScore: 0 });
  
  // Settings State
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>('English');
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');
  
  // Navigation State
  const [level, setLevel] = useState<Level>(Level.Beginner);
  const [lessonNumber, setLessonNumber] = useState<number>(1);
  
  // Content State
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Test State
  const [testMode, setTestMode] = useState<boolean>(false);
  const [isToeflMode, setIsToeflMode] = useState<boolean>(false);
  const [testData, setTestData] = useState<LevelTest | null>(null);
  const [testResults, setTestResults] = useState<Record<number, { userAnswer: string, correctAnswer: string, isCorrect: boolean }> | null>(null);
  const [testScore, setTestScore] = useState<{score: number, total: number} | null>(null);
  
  // UI State
  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'read' | 'vocabulary' | 'grammar' | 'practice' | 'writing' | 'chat'>('read');
  
  // Session Log for current Lesson
  const sessionLog = useRef<ActivityLog[]>([]);
  const sessionPoints = useRef<number>(0);

  // TTS State
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Translator State
  const [transInput, setTransInput] = useState('');
  const [transOutput, setTransOutput] = useState('');
  const [transLoading, setTransLoading] = useState(false);
  const [transDirection, setTransDirection] = useState<'targetToPt' | 'ptToTarget'>('targetToPt');

  // Reading Microphone State (Per Sentence)
  const [readingRecIndex, setReadingRecIndex] = useState<number | null>(null);
  const [readingTranscripts, setReadingTranscripts] = useState<Record<number, string>>({});
  const readingRecognitionRef = useRef<ISpeechRecognition | null>(null);

  // Grammar Mic State - Per Index
  const [grammarRecIndex, setGrammarRecIndex] = useState<number | null>(null);
  const [grammarTranscripts, setGrammarTranscripts] = useState<Record<number, string>>({});
  const grammarRecognitionRef = useRef<ISpeechRecognition | null>(null);

  // Dialogue Mic State - Per Index
  const [dialogRecIndex, setDialogRecIndex] = useState<number | null>(null);
  const [dialogTranscripts, setDialogTranscripts] = useState<Record<number, string>>({});
  const dialogRecognitionRef = useRef<ISpeechRecognition | null>(null);

  // --- Initialization ---

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    if (user) {
      const progress = storageService.loadProgress(user.email);
      setUserProgress(progress);
      storageService.updateBotScores();
      
      // RESTORE STATE: Continue where left off if data exists
      if (progress.lastLevel) {
          setLevel(progress.lastLevel);
          setHasCompletedOnboarding(true);
      } else {
          setHasCompletedOnboarding(false);
      }
      if (progress.lastLesson) {
          setLessonNumber(progress.lastLesson);
      }
      if (progress.lastLanguage) {
          setTargetLanguage(progress.lastLanguage);
      }
    }
  }, [user]);

  useEffect(() => {
      if (user && hasCompletedOnboarding && !testMode && level !== Level.Conversation) {
          loadLesson();
          setActiveTab('read');
      }
  }, [user, hasCompletedOnboarding, level, lessonNumber, targetLanguage]);

  // --- Helpers ---

  const cleanTextForSpeech = (text: string) => {
    if (!text) return '';
    return text.replace(/[*_#`]/g, '').replace(/\[.*?\]/g, '').trim();
  };

  const getSentences = (text: string): string[] => {
    return text.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) || [text];
  };

  const getLangCode = (lang: TargetLanguage) => {
    switch (lang) {
      case 'English': return 'en-US';
      case 'Italian': return 'it-IT';
      case 'Spanish': return 'es-ES';
      default: return 'en-US';
    }
  };

  const executeSpeech = (text: string) => {
    try {
      const cleanText = cleanTextForSpeech(text);
      
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
        utteranceRef.current = null;
      }

      if (speakingText === text) {
          setSpeakingText(null);
          return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const langCode = getLangCode(targetLanguage);
      utterance.lang = langCode;
      utterance.rate = 0.9;

      // Pegar as vozes diretamente na hora do clique para evitar erro de carregamento assíncrono
      const currentVoices = window.speechSynthesis.getVoices();
      const langPrefix = langCode.split('-')[0];
      const matchVoices = currentVoices.filter(v => v.lang.startsWith(langPrefix));
      
      if (matchVoices.length > 0) {
          // Tenta usar uma voz local primeiro, senão usa a primeira que encontrar
          const local = matchVoices.find(v => v.localService);
          utterance.voice = local || matchVoices[0];
      }

      utterance.onend = () => {
        if (utteranceRef.current === utterance) {
            setSpeakingText(null);
            utteranceRef.current = null;
        }
      };
      
      utterance.onerror = (event) => {
        alert("Erro na fala: " + (event.error || "Desconhecido"));
        if (utteranceRef.current === utterance) {
            setSpeakingText(null);
            utteranceRef.current = null;
        }
      };

      utteranceRef.current = utterance;
      setSpeakingText(text);
      
      // Pequeno atraso para garantir que o Chrome não trave
      setTimeout(() => {
          window.speechSynthesis.speak(utterance);
          window.speechSynthesis.resume();
      }, 50);

    } catch(err: any) {
        alert("Erro fatal ao tentar falar: " + err.message);
    }
  };

  const toggleVoiceGender = () => {
      setVoiceGender(prev => prev === 'male' ? 'female' : 'male');
  };

  const handleSpeak = (text: string) => {
      executeSpeech(text);
  };

  const toggleTextSize = () => {
      setTextSize(prev => prev === 'normal' ? 'large' : 'normal');
  };

  const toggleSpeechRec = (
    ref: React.MutableRefObject<ISpeechRecognition | null>,
    updateState: (isRec: boolean) => void,
    updateTranscript: (text: string) => void,
    currentIndex?: number | null,
    targetIndex?: number
  ) => {
      if (currentIndex !== undefined && targetIndex !== undefined) {
         if (currentIndex === targetIndex) {
             ref.current?.stop();
             return;
         }
         if (currentIndex !== null) {
             ref.current?.stop();
         }
      } else {
          if (ref.current) {
              ref.current.stop();
              return;
          }
      }

      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
          alert("Seu navegador não suporta reconhecimento de voz.");
          return;
      }

      const recognition = new SpeechRecognitionAPI() as ISpeechRecognition;
      recognition.continuous = true; 
      recognition.lang = getLangCode(targetLanguage);
      recognition.interimResults = true;

      recognition.onresult = (event) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
              fullTranscript += event.results[i][0].transcript;
          }
          updateTranscript(fullTranscript);
      };

      recognition.onend = () => {
          if (ref.current === recognition) {
              updateState(false);
              ref.current = null;
          }
      };

      recognition.onerror = (event) => {
          console.error("Speech Recognition Error:", event.error);
          alert(`Erro no microfone: ${event.error}. Verifique as permissões do seu navegador.`);
          if (ref.current === recognition) {
              updateState(false);
              ref.current = null;
          }
      };

      updateState(true); 
      updateTranscript('');
      recognition.start();
      ref.current = recognition;
  };

  const handleTranslator = async () => {
      if (!transInput.trim()) return;
      setTransLoading(true);
      try {
          const fromLang = transDirection === 'targetToPt' ? targetLanguage : 'Portuguese';
          const toLang = transDirection === 'targetToPt' ? 'Portuguese' : targetLanguage;
          const result = await translateBidirectional(transInput, fromLang, toLang);
          setTransOutput(result);
      } catch(e) {
          setTransOutput("Erro ao traduzir.");
      } finally {
          setTransLoading(false);
      }
  };

  const getLevelProgress = (lvl: Level) => {
      const lvlData = userProgress[lvl];
      if (!lvlData) return 0;
      let completed = 0;
      Object.values(lvlData.lessons).forEach((l: LessonProgress) => {
          if (l.isCompleted) completed++;
      });
      return Math.round((completed / LESSONS_PER_LEVEL) * 100);
  };

  const getLevelCompletedCount = (lvl: Level) => {
    const lvlData = userProgress[lvl];
    if (!lvlData) return 0;
    let completed = 0;
    Object.values(lvlData.lessons).forEach((l: LessonProgress) => {
        if (l.isCompleted) completed++;
    });
    return completed;
  };

  // --- Content Loading ---

  const loadLesson = async () => {
      setLoading(true);
      setError(null);
      setLesson(null);
      setReadingRecIndex(null);
      setReadingTranscripts({});
      setDialogTranscripts({});
      setGrammarTranscripts({});
      setTestResults(null);
      setTestScore(null);
      sessionLog.current = [];
      sessionPoints.current = 0;
      try {
          const newLesson = await generateLesson(level, lessonNumber, user!.name, targetLanguage);
          setLesson(newLesson);
      } catch (err) {
          setError("Não foi possível carregar a lição. Verifique sua conexão ou tente novamente.");
      } finally {
          setLoading(false);
      }
  };

  const startLevelTest = async () => {
      setTestMode(true);
      setIsToeflMode(false);
      setLoading(true);
      setError(null);
      setTestResults(null);
      setTestScore(null);
      try {
          const test = await generateLevelTest(level, targetLanguage);
          setTestData(test);
      } catch (err) {
          setError("Erro ao gerar o teste de nível.");
          setTestMode(false);
      } finally {
          setLoading(false);
      }
  };

  const startToeflTest = async () => {
      setTestMode(true);
      setIsToeflMode(true);
      setLoading(true);
      setError(null);
      setTestResults(null);
      setTestScore(null);
      setShowCompletionModal(false);
      try {
          const test = await generateToeflSimulation(targetLanguage, level);
          setTestData(test);
      } catch (err) {
          setError("Erro ao gerar o simulado.");
          setTestMode(false);
      } finally {
          setLoading(false);
      }
  };

  // --- Progress Handling & Logging ---

  const updateProgressState = (currentProgress: UserProgress) => {
      currentProgress.lastLevel = level;
      currentProgress.lastLesson = lessonNumber;
      currentProgress.lastLanguage = targetLanguage;
      return currentProgress;
  };

  const handleExerciseResult = (isCorrect: boolean) => {
      if (!user || !userProgress) return;
      
      let newProgress = { ...userProgress };
      const levelData = newProgress[level] || { lessons: {} };
      const lessonData = levelData.lessons[lessonNumber] || { 
          totalExercises: 0, 
          correctExercises: 0, 
          isCompleted: false, 
          lastPlayed: new Date().toISOString() 
      };

      lessonData.totalExercises += 1;
      if (isCorrect) {
          lessonData.correctExercises += 1;
          newProgress.totalScore += 10;
          sessionPoints.current += 10;
      }
      lessonData.lastPlayed = new Date().toISOString();
      
      levelData.lessons[lessonNumber] = lessonData;
      newProgress[level] = levelData;
      
      newProgress = updateProgressState(newProgress);

      setUserProgress(newProgress);
      storageService.saveProgress(user.email, newProgress);

      sessionLog.current.push({
          type: 'exercise',
          description: `Exercício ${lessonData.totalExercises} na Lição ${lessonNumber}`,
          result: isCorrect ? 'Correto (+10 XP)' : 'Incorreto',
          timestamp: new Date().toISOString()
      });
  };

  const handleWritingComplete = (score: number) => {
      if (!user) return;
      let newProgress = { ...userProgress };
      
      let points = 20;
      if (score > 80) points += 10;
      if (score > 95) points += 10;
      
      newProgress.totalScore += points;
      sessionPoints.current += points;
      
      newProgress = updateProgressState(newProgress);
      setUserProgress(newProgress);
      storageService.saveProgress(user.email, newProgress);
      
      sessionLog.current.push({
          type: 'writing',
          description: `Exercício de Escrita na Lição ${lessonNumber}`,
          result: `Nota: ${score}/100 - Ganhou ${points} XP`,
          timestamp: new Date().toISOString()
      });
  };

  const handleSectionComplete = (sectionName: string, nextTab: typeof activeTab | null) => {
    if (!user) return;
    let newProgress = { ...userProgress };
    
    let points = 15;
    if (sectionName === 'Leitura') points = 45;
    else if (sectionName === 'Diálogo' || sectionName === 'Exercícios' || sectionName === 'Escrita') points = 20;

    newProgress.totalScore += points;
    sessionPoints.current += points;
    
    sessionLog.current.push({
        type: 'section_complete',
        description: `Seção '${sectionName}' concluída`,
        result: `Ganhou ${points} XP`,
        timestamp: new Date().toISOString()
    });

    if (sectionName === 'Exercícios') {
        const levelData = newProgress[level] || { lessons: {} };
        const lessonData = levelData.lessons[lessonNumber] || { 
          totalExercises: 0, 
          correctExercises: 0, 
          isCompleted: false, 
          lastPlayed: new Date().toISOString() 
        };
        lessonData.isCompleted = true;
        levelData.lessons[lessonNumber] = lessonData;
        newProgress[level] = levelData;
        newProgress.totalScore += 50; 
        sessionPoints.current += 50;

        sessionLog.current.push({
            type: 'section_complete',
            description: `Lição ${lessonNumber} Completa`,
            result: `Bônus de 50 XP`,
            timestamp: new Date().toISOString()
        });
    }

    newProgress = updateProgressState(newProgress);
    setUserProgress(newProgress);
    storageService.saveProgress(user.email, newProgress);
    
    if (nextTab) {
        setActiveTab(nextTab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        if (sectionName === 'Diálogo') {
           handleLessonFinish();
        }
    }
  };

  const handleLessonFinish = () => {
      if (!user) return;
      
      const historyLog: LessonHistory = {
          id: Date.now().toString(),
          userName: user.name,
          level: level,
          lessonNumber: lessonNumber,
          targetLanguage: targetLanguage,
          date: new Date().toLocaleString(),
          totalScoreEarned: sessionPoints.current,
          activities: [...sessionLog.current]
      };
      
      storageService.saveHistory(user.email, historyLog);
      setShowCompletionModal(true);
  };

  // PDF Generation
  const generatePDF = () => {
      if (!user) return;
      
      const doc = new jsPDF();
      const margin = 20;
      let y = 20;

      // Header
      doc.setFontSize(22);
      doc.setTextColor(0, 0, 255);
      doc.text("Relatório de Desempenho - GIVE ME", margin, y);
      y += 10;

      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Data: ${new Date().toLocaleString()}`, margin, y);
      y += 15;

      // User Info Box
      doc.setDrawColor(200);
      doc.setFillColor(245, 247, 250);
      doc.rect(margin, y, 170, 35, 'FD');
      
      y += 10;
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(`Aluno: ${user.name}`, margin + 5, y);
      y += 8;
      doc.text(`Curso: ${targetLanguage} - Nível ${level}`, margin + 5, y);
      y += 8;
      doc.text(`Lição: ${lessonNumber}`, margin + 5, y);
      y += 15;

      // Score Summary
      doc.setFontSize(16);
      doc.setTextColor(0, 150, 0);
      doc.text(`Pontos ganhos nesta sessão: ${sessionPoints.current} XP`, margin, y);
      y += 15;

      // Detailed Activity Log
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Detalhes das Atividades:", margin, y);
      y += 10;

      doc.setFontSize(11);
      
      sessionLog.current.forEach((log) => {
          if (y > 270) {
              doc.addPage();
              y = 20;
          }
          
          const time = new Date(log.timestamp).toLocaleTimeString();
          doc.setTextColor(80);
          doc.text(`[${time}]`, margin, y);
          
          doc.setTextColor(0);
          doc.text(log.description, margin + 25, y);
          
          doc.setTextColor(0, 100, 200);
          doc.text(log.result, margin + 120, y);
          
          y += 8;
          
          doc.setDrawColor(240);
          doc.line(margin, y - 5, 190, y - 5);
      });

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text("Gerado automaticamente por GIVE ME AI Tutor", 105, 290, { align: "center" });

      doc.save(`GiveMe_Lesson${lessonNumber}_${user.name}.pdf`);
  };

  // JSON Generation (Full Backup)
  const downloadJSON = () => {
    if (!user) return;
    
    const history = storageService.getHistory(user.email);
    const backup: FullBackup = {
        user: user,
        progress: userProgress,
        history: history,
        timestamp: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `GiveMe_Backup_${user.name}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleTestFinish = (answers: Record<number, string>) => {
      if (!testData) return;
      
      let totalPointsPossible = 0;
      let userPoints = 0;
      const results: Record<number, { userAnswer: string, correctAnswer: string, isCorrect: boolean }> = {};
      
      const allQuestions = [...testData.reading.questions, ...testData.listening.questions, ...testData.grammar.questions];
      
      allQuestions.forEach(q => {
          let points = 10;
          if (q.difficulty === 'medium') points = 15;
          if (q.difficulty === 'hard') points = 20;

          totalPointsPossible += points;

          const isCorrect = answers[q.id] === q.correctAnswer;
          if (isCorrect) {
              userPoints += points;
          }

          results[q.id] = {
              userAnswer: answers[q.id],
              correctAnswer: q.correctAnswer,
              isCorrect: isCorrect
          };
      });

      const percentage = Math.round((userPoints / totalPointsPossible) * 100);
      const passed = percentage >= 75;

      let newProgress = { ...userProgress };
      newProgress.totalScore += userPoints; 
      if (passed) {
          newProgress.totalScore += 100;
      }
      newProgress = updateProgressState(newProgress);
      setUserProgress(newProgress);
      storageService.saveProgress(user!.email, newProgress);

      setTestResults(results);
      setTestScore({ score: userPoints, total: totalPointsPossible });
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUserTurn = () => {
      if (!user) return;
      const newProgress = { ...userProgress, totalScore: userProgress.totalScore + 5 };
      setUserProgress(newProgress);
      storageService.saveProgress(user.email, newProgress);
  };

  const getTotalLessonPoints = () => {
      return 45 + 15 + 15 + 20 + 20 + 20 + 50; 
  };

  const handleRetakeTest = () => {
      if (isToeflMode) {
          startToeflTest();
      } else {
          startLevelTest();
      }
  };

  const handleNextLesson = () => {
      if (lessonNumber < LESSONS_PER_LEVEL) {
          setLessonNumber(prev => prev + 1);
          setActiveTab('read');
      } else {
          startLevelTest();
      }
  };

  const handleOnboardingComplete = (selectedLanguage: TargetLanguage, selectedLevel: Level, placementScore: number) => {
    setTargetLanguage(selectedLanguage);
    setLevel(selectedLevel);
    setLessonNumber(1);
    
    const xpEarned = placementScore * 10;
    const newProgress = { ...userProgress };
    newProgress.totalScore += xpEarned;
    
    newProgress.lastLevel = selectedLevel;
    newProgress.lastLesson = 1;
    newProgress.lastLanguage = selectedLanguage;

    setUserProgress(newProgress);
    if(user) storageService.saveProgress(user.email, newProgress);
    
    setHasCompletedOnboarding(true);
  };

  // --- Render ---

  if (!user) {
      return <AuthScreen onAuthenticated={setUser} />;
  }

  if (!hasCompletedOnboarding) {
      return (
          <PlacementFlow 
              onComplete={handleOnboardingComplete}
              userName={user.name}
          />
      );
  }

  return (
    <div className={`h-full overflow-y-auto custom-scrollbar bg-slate-100 font-sans text-slate-900 pb-36 ${textSize === 'large' ? 'text-lg leading-loose' : ''}`}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="bg-blue-600 text-white p-2 rounded-lg">
                 <BookOpenIcon className="w-6 h-6" />
             </div>
             <span className="text-xl font-black text-blue-600 tracking-tight hidden sm:block uppercase">GIVE ME YOUR {targetLanguage}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
             {/* Font Size Toggle */}
             <button 
                onClick={toggleTextSize}
                className={`p-2 rounded-full transition-all border shadow-sm ${
                    textSize === 'large' 
                        ? 'bg-blue-100 border-blue-300 text-blue-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title="Tamanho da letra"
             >
                 <TextSizeIcon className="w-5 h-5" />
             </button>

             {/* Combined Voice Gender Toggle */}
             <button 
                onClick={toggleVoiceGender}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm ${
                    voiceGender === 'male' 
                        ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200' 
                        : 'bg-pink-100 border-pink-300 text-pink-700 hover:bg-pink-200'
                }`}
             >
                <UserCircleIcon className="w-4 h-4" /> 
                {voiceGender === 'male' ? 'Masc' : 'Fem'}
             </button>

             <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                 <LanguageIcon className="w-4 h-4 text-slate-500" />
                 <select 
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value as TargetLanguage)}
                    className="bg-transparent border-none text-sm font-semibold text-slate-700 focus:ring-0 cursor-pointer"
                 >
                     <option value="English">Inglês</option>
                     <option value="Spanish">Espanhol</option>
                     <option value="Italian">Italiano</option>
                 </select>
             </div>

             <button 
                onClick={() => setShowLeaderboard(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-200 hover:bg-yellow-100 transition-colors"
             >
                 <TrophyIcon className="w-4 h-4" />
                 <span className="text-sm font-bold hidden sm:inline">Rank</span>
             </button>

             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full border border-orange-200">
                 <FireIcon className="w-4 h-4" />
                 <span className="text-sm font-bold">{userProgress.totalScore} XP</span>
             </div>

             <button 
                onClick={() => setShowDashboard(true)}
                className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors overflow-hidden"
             >
                   <img 
                     src={`https://api.dicebear.com/9.x/initials/svg?seed=${user.name}`} 
                     alt="Avatar" 
                     className="w-full h-full object-cover"
                   />
              </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
         
         {/* Navigation / Breadcrumbs with Progress */}
         <div className="mb-8 grid grid-cols-2 sm:grid-cols-5 gap-3">
             {LEVELS.map((l) => {
                 const progress = getLevelProgress(l);
                 const count = getLevelCompletedCount(l);
                 const isActive = level === l;
                 
                 if (l === Level.Conversation) {
                    return (
                        <button
                           key={l}
                           onClick={() => { setLevel(l); setTestMode(false); setLessonNumber(1); }}
                           className={`relative p-3 rounded-xl text-sm font-bold transition-all overflow-hidden border-2 ${isActive ? 'bg-purple-100 border-purple-500 text-purple-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            Conversação Livre
                        </button>
                    )
                 }

                 return (
                     <button
                        key={l}
                        onClick={() => {
                            setLevel(l);
                            setTestMode(false);
                            setLessonNumber(1);
                        }}
                        className={`relative p-3 rounded-xl text-left transition-all overflow-hidden border-2 ${
                            isActive 
                                ? 'bg-blue-50 border-blue-500 shadow-md' 
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                     >
                          <div className="flex justify-between items-center mb-1 relative z-10">
                              <span className={`font-bold ${isActive ? 'text-blue-800' : 'text-slate-700'}`}>{l}</span>
                              <span className="text-xs font-medium text-slate-500">{count}/{LESSONS_PER_LEVEL}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative z-10">
                              <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                          </div>
                     </button>
                 )
             })}
             
             {/* Teste de Nível Button next to Conversação Livre */}
             <button
                onClick={() => setShowPlacementModal(true)}
                className="relative p-3 rounded-xl text-sm font-bold transition-all border-2 bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 hover:border-amber-400 flex items-center justify-center gap-1.5 shadow-sm hover:shadow"
             >
                 ⚡ Teste de Nível (EN/ES/IT)
             </button>
         </div>

         {/* Content Area */}
         {level === Level.Conversation ? (
             <ConversationComponent 
                userName={user.name} 
                onSpeak={handleSpeak} 
                speakingText={speakingText}
                targetLanguage={targetLanguage}
                onUserTurn={handleUserTurn}
             />
         ) : testMode ? (
             testData ? (
                <>
                <div className="bg-slate-800 text-white p-4 rounded-lg mb-6 text-center font-bold text-xl shadow-lg">
                    {isToeflMode ? "SIMULADO" : "PROVA DE NÍVEL"}
                </div>
                {testResults && testScore ? (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6 text-center">
                        <h2 className="text-2xl font-bold mb-2">Resultados</h2>
                        <div className="text-4xl font-black text-blue-600 mb-4">
                            {testScore.score} / {testScore.total} pontos
                        </div>
                        <p className="text-lg mb-6">
                            {Math.round((testScore.score / testScore.total) * 100) >= 75 
                            ? "Parabéns! Você pode avançar de nível." 
                            : "Continue praticando neste nível para melhorar."}
                        </p>
                        <div className="flex gap-4 justify-center">
                             <button 
                                onClick={handleRetakeTest}
                                className="px-6 py-2 bg-slate-200 text-slate-800 font-bold rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                Refazer a prova
                            </button>
                            <button 
                                onClick={() => { setTestMode(false); setTestResults(null); }}
                                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Voltar para Lições
                            </button>
                        </div>
                    </div>
                ) : null}
                <LevelTestComponent 
                    testData={testData} 
                    onFinishTest={handleTestFinish}
                    speakingText={speakingText}
                    onSpeak={handleSpeak}
                    results={testResults}
                />
                </>
             ) : (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-slate-500">Gerando prova...</p>
                </div>
             )
         ) : (
              // Lesson View
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Content */}
                  <div className="lg:col-span-2 space-y-6">
                      {loading ? (
                          <div className="bg-white rounded-xl p-12 flex flex-col items-center justify-center shadow-sm border border-slate-200 min-h-[400px]">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                              <p className="text-slate-500 font-medium animate-pulse">Criando uma lição personalizada para você...</p>
                              <p className="text-xs text-slate-400 mt-2">Isso usa IA e pode levar alguns segundos.</p>
                          </div>
                      ) : error ? (
                          <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 text-center">
                              <p className="font-bold mb-2">Ops!</p>
                              <p>{error}</p>
                              <button onClick={loadLesson} className="mt-4 px-4 py-2 bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50">Tentar Novamente</button>
                          </div>
                      ) : lesson && (
                          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                              {/* Lesson Image */}
                              {lesson.imageUrl && (
                                  <div className="h-48 w-full bg-slate-100 overflow-hidden relative">
                                      <img src={lesson.imageUrl} alt="Lesson topic" className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                                          <div className="p-6 w-full">
                                             <div className="flex justify-between items-end">
                                                 <h2 className="text-white text-2xl font-bold">{lesson.title}</h2>
                                                 <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs backdrop-blur-md border border-white/30">Lição {lessonNumber}</span>
                                             </div>
                                          </div>
                                      </div>
                                  </div>
                              )}
                              {!lesson.imageUrl && (
                                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                     <h2 className="text-2xl font-bold text-slate-800">{lesson.title}</h2>
                                     <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs">Lição {lessonNumber}</span>
                                  </div>
                              )}

                              {/* Redesigned Tab Navigation */}
                              <div className="bg-slate-50 border-b border-slate-200 p-2">
                                 <div className="flex sm:grid sm:grid-cols-6 gap-2 overflow-x-auto">
                                  {[
                                      { id: 'read', label: 'Leitura', icon: BookOpenIcon },
                                      { id: 'vocabulary', label: 'Vocabulário', icon: TagIcon },
                                      { id: 'grammar', label: 'Gramática', icon: BeakerIcon },
                                      { id: 'practice', label: 'Exercícios', icon: CheckCircleIcon },
                                      { id: 'writing', label: 'Escrita', icon: PencilSquareIcon },
                                      { id: 'chat', label: 'Prática', icon: ChatBubbleLeftRightIcon },
                                  ].map((tab) => (
                                      <button
                                         key={tab.id}
                                         onClick={() => setActiveTab(tab.id as any)}
                                         className={`items-center justify-center gap-1 sm:gap-2 px-4 py-3 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex-1 sm:flex-none ${
                                             activeTab === tab.id 
                                                 ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200 flex' 
                                                 : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 hidden sm:flex'
                                         }`}
                                      >
                                          <tab.icon className="w-5 h-5 sm:w-4 sm:h-4" />
                                          <span>{tab.label}</span>
                                      </button>
                                  ))}
                                  <div className="sm:hidden flex-1 text-center text-xs text-slate-400 self-center">
                                  </div>
                                 </div>
                              </div>

                              <div className="p-6">
                                  {activeTab === 'read' && (
                                      <div className="animate-in fade-in">
                                          <div className="mb-6">
                                              <p className="text-sm text-slate-500 mb-4">Ouça cada frase, repita em voz alta e grave para comparar sua pronúncia.</p>
                                              <div className="space-y-3">
                                                 {getSentences(lesson.text).map((sentence, idx) => (
                                                     <div key={idx} className="bg-slate-55 rounded-lg p-4 border border-slate-200 hover:border-blue-300 transition-colors">
                                                         <p className="text-lg leading-relaxed text-slate-700 mb-3 font-medium">{sentence.trim()}</p>
                                                         <div className="flex items-center gap-3">
                                                             <button 
                                                                 onClick={() => handleSpeak(sentence)} 
                                                                 className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold hover:bg-blue-200 transition-colors"
                                                             >
                                                                 {speakingText === sentence ? <SoundWaveAnimation className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
                                                                 Ouvir
                                                             </button>

                                                             <button
                                                                 onClick={() => toggleSpeechRec(
                                                                     readingRecognitionRef,
                                                                     (isRec) => setReadingRecIndex(isRec ? idx : null),
                                                                     (text) => setReadingTranscripts(prev => ({...prev, [idx]: text})),
                                                                     readingRecIndex,
                                                                     idx
                                                                 )}
                                                                 className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                                                                     readingRecIndex === idx 
                                                                         ? 'bg-red-500 text-white animate-pulse' 
                                                                         : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                                                                 }`}
                                                             >
                                                                 <MicrophoneIcon className="w-3 h-3"/>
                                                                 {readingRecIndex === idx ? 'Parar Gravação' : 'Ler em Voz Alta'}
                                                             </button>
                                                         </div>
                                                         {readingTranscripts[idx] && (
                                                             <div className="mt-3 pt-2 border-t border-slate-200">
                                                                 <p className="text-xs font-bold text-slate-400 uppercase mb-1">Você falou:</p>
                                                                 <p className="text-sm text-slate-600 italic">"{readingTranscripts[idx]}"</p>
                                                             </div>
                                                         )}
                                                     </div>
                                                 ))}
                                              </div>
                                              <div className="mt-4 text-xs text-slate-400 font-semibold uppercase tracking-wide text-right">
                                                 Voz Atual: {voiceGender === 'male' ? 'Masculina' : 'Feminina'}
                                              </div>
                                          </div>
                                          
                                          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mt-8 mb-4">
                                             <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                 <LanguageIcon className="w-5 h-5 text-blue-500"/> Tradutor da Lição
                                             </h3>
                                             
                                             <div className="flex flex-col sm:flex-row gap-2 mb-3">
                                                 <button 
                                                     onClick={() => setTransDirection('targetToPt')}
                                                     className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-colors border shadow-sm ${transDirection === 'targetToPt' ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}`}
                                                 >
                                                     {targetLanguage} &rarr; Português
                                                 </button>
                                                 <button 
                                                     onClick={() => setTransDirection('ptToTarget')}
                                                     className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-colors border shadow-sm ${transDirection === 'ptToTarget' ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}`}
                                                 >
                                                     Português &rarr; {targetLanguage}
                                                 </button>
                                             </div>

                                             <div className="space-y-2">
                                                 <textarea 
                                                     className="w-full p-3 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none placeholder-slate-500"
                                                     rows={2}
                                                     placeholder={transDirection === 'targetToPt' ? `Digite a palavra ou frase em ${targetLanguage}...` : "Digite em Português..."}
                                                     value={transInput}
                                                     onChange={e => setTransInput(e.target.value)}
                                                     onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTranslator(); }}}
                                                 />
                                                 <button 
                                                     onClick={handleTranslator} 
                                                     disabled={transLoading || !transInput.trim()}
                                                     className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                                                 >
                                                     {transLoading ? 'Traduzindo...' : 'Traduzir'}
                                                 </button>
                                             </div>
                                             {transOutput && (
                                                 <div className="mt-3 p-3 bg-white border-l-4 border-blue-500 rounded-r-lg shadow-sm">
                                                     <p className="font-semibold text-slate-500 text-xs mb-1 uppercase">Tradução:</p>
                                                     <p className="text-slate-900 font-bold text-lg">{transOutput}</p>
                                                 </div>
                                             )}
                                          </div>

                                          <div className="mt-8 text-center">
                                             <button 
                                                 onClick={() => handleSectionComplete('Leitura', 'vocabulary')}
                                                 className="w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                                             >
                                                 <CheckCircleIcon className="w-5 h-5" /> Concluir Leitura (+45 XP)
                                             </button>
                                          </div>
                                      </div>
                                  )}

                                  {activeTab === 'vocabulary' && (
                                      <div className="animate-in fade-in">
                                         {lesson.textAnalysis && (
                                              <div className="space-y-8 mb-8">
                                                  
                                                  <div>
                                                      <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-lg">
                                                          <TagIcon className="w-6 h-6 text-blue-500" /> Palavras-chave
                                                      </h3>
                                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                          {lesson.textAnalysis.vocabularyFromText.map((item, idx) => {
                                                              const word = item.word || (item as any).term || (item as any).vocabulary || "Palavra";
                                                              const meaning = item.meaning || (item as any).definition || (item as any).translation || "Significado";
                                                              return (
                                                              <div 
                                                                 key={idx} 
                                                                 onClick={() => handleSpeak(word)}
                                                                 className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                                                              >
                                                                  <div className="flex justify-between items-start">
                                                                      <div>
                                                                          <p className="font-bold text-xl text-slate-800 group-hover:text-blue-600">{word}</p>
                                                                          <p className="text-slate-500 italic mt-1">{meaning}</p>
                                                                      </div>
                                                                      <button className="p-2 bg-slate-50 rounded-full group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-500">
                                                                         <SpeakerWaveIcon className="w-5 h-5" />
                                                                      </button>
                                                                  </div>
                                                              </div>
                                                          )})}
                                                      </div>
                                                  </div>

                                                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                                                      <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-lg">
                                                          <LightBulbIcon className="w-5 h-5 text-yellow-500" /> Verbos do Texto
                                                      </h3>
                                                      <div className="overflow-x-auto">
                                                          <table className="w-full text-sm text-left">
                                                              <thead className="hidden sm:table-header-group">
                                                                  <tr className="border-b border-slate-200 text-slate-400">
                                                                      <th className="pb-2 font-semibold">Tradução</th>
                                                                      <th className="pb-2 font-semibold">Base</th>
                                                                      <th className="pb-2 font-semibold">Passado</th>
                                                                      <th className="pb-2 font-semibold">Particípio</th>
                                                                  </tr>
                                                              </thead>
                                                              <tbody className="block sm:table-row-group">
                                                                 {lesson.textAnalysis.verbsFromText.map((v, i) => (
                                                                     <tr 
                                                                         key={i} 
                                                                         className="block sm:table-row border-b border-slate-100 last:border-0 hover:bg-blue-50 transition-colors group mb-4 sm:mb-0 pb-4 sm:pb-0"
                                                                     >
                                                                         <td className="block sm:table-cell py-1 sm:py-3 text-slate-500 italic font-medium">
                                                                             <span className="sm:hidden font-bold text-slate-400 text-xs uppercase mr-2">Significado:</span>{v.meaning}
                                                                         </td>
                                                                         <td 
                                                                             className="block sm:table-cell py-1 sm:py-3 font-bold text-blue-700 cursor-pointer hover:underline" 
                                                                             onClick={() => handleSpeak(v.base)}
                                                                         >
                                                                             <span className="sm:hidden font-bold text-slate-400 text-xs uppercase mr-2">Base:</span>{v.base}
                                                                         </td>
                                                                         <td 
                                                                             className="block sm:table-cell py-1 sm:py-3 text-slate-700 cursor-pointer hover:underline hover:text-blue-600"
                                                                             onClick={() => handleSpeak(v.past)}
                                                                         >
                                                                             <span className="sm:hidden font-bold text-slate-400 text-xs uppercase mr-2">Passado:</span>{v.past}
                                                                         </td>
                                                                         <td 
                                                                             className="block sm:table-cell py-1 sm:py-3 text-slate-700 cursor-pointer hover:underline hover:text-blue-600"
                                                                             onClick={() => handleSpeak(v.participle)}
                                                                         >
                                                                              <span className="sm:hidden font-bold text-slate-400 text-xs uppercase mr-2">Particípio:</span>{v.participle}
                                                                         </td>
                                                                     </tr>
                                                                 ))}
                                                              </tbody>
                                                          </table>
                                                      </div>
                                                  </div>

                                                  {lesson.phrasalVerbs && lesson.phrasalVerbs.length > 0 && (
                                                      <div>
                                                          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-lg">
                                                              <BeakerIcon className="w-6 h-6 text-purple-500" /> Phrasal Verbs
                                                          </h3>
                                                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                              {lesson.phrasalVerbs.map((item, idx) => (
                                                                  <div key={idx} className="bg-white rounded-xl border-l-4 border-purple-500 shadow-sm p-4 hover:shadow-md transition-all">
                                                                      <div className="flex justify-between items-start mb-2">
                                                                          <span 
                                                                             className="font-bold text-lg text-purple-700 cursor-pointer hover:underline"
                                                                             onClick={() => handleSpeak(item.verb)}
                                                                          >
                                                                              {item.verb}
                                                                          </span>
                                                                          <button onClick={() => handleSpeak(item.verb)} className="text-purple-400 hover:text-purple-600">
                                                                             <SpeakerWaveIcon className="w-4 h-4"/>
                                                                          </button>
                                                                      </div>
                                                                      <p className="text-sm font-medium text-slate-600 mb-2">{item.meaning}</p>
                                                                      <div className="bg-purple-50 p-2 rounded text-xs italic text-slate-600 border border-purple-100">
                                                                          "{item.example}"
                                                                      </div>
                                                                  </div>
                                                              ))}
                                                          </div>
                                                      </div>
                                                  )}
                                              </div>
                                         )}

                                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                             <div className="space-y-4">
                                                 <h4 className="font-bold text-slate-600 border-b pb-2 uppercase text-sm tracking-wide">Flashcards: Vocabulário</h4>
                                                 {lesson.vocabulary.map((item, idx) => (
                                                     <Flashcard 
                                                         key={idx} 
                                                         word={item.word} 
                                                         meaning={item.meaning} 
                                                         onSpeak={handleSpeak} 
                                                         speakingText={speakingText} 
                                                     />
                                                 ))}
                                             </div>

                                             <div className="space-y-4">
                                                 <h4 className="font-bold text-slate-600 border-b pb-2 uppercase text-sm tracking-wide">Flashcards: Expressões</h4>
                                                 {lesson.idiomaticExpressions.map((item, idx) => (
                                                     <Flashcard 
                                                         key={`idiom-${idx}`} 
                                                         word={item.expression} 
                                                         meaning={item.meaning} 
                                                         onSpeak={handleSpeak} 
                                                         speakingText={speakingText} 
                                                     />
                                                 ))}
                                             </div>
                                         </div>
                                         <div className="text-center">
                                             <button 
                                                 onClick={() => handleSectionComplete('Vocabulário', 'grammar')}
                                                 className="w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                                             >
                                                 <CheckCircleIcon className="w-5 h-5" /> Concluir Vocabulário (+15 XP)
                                             </button>
                                          </div>
                                      </div>
                                  )}

                                  {activeTab === 'grammar' && (
                                      <div className="animate-in fade-in space-y-6">
                                          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
                                              <h3 className="text-lg font-bold text-yellow-800 mb-3 flex items-center gap-2">
                                                  <LightBulbIcon className="w-5 h-5" /> Explicação
                                              </h3>
                                              <p className="text-yellow-900 leading-relaxed">{lesson.grammar.explanation}</p>
                                          </div>
                                          
                                          <div className="space-y-6">
                                              <h3 className="font-bold text-slate-700">Exemplos</h3>
                                              
                                              {lesson.grammar.examples.map((ex, idx) => (
                                                  <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                                                      <div className="flex items-center justify-between group mb-2">
                                                          <div>
                                                              <p className="font-medium text-slate-800 text-lg">{ex.target}</p>
                                                              <p className="text-slate-500">{ex.portuguese}</p>
                                                          </div>
                                                          <button 
                                                             onClick={() => handleSpeak(ex.target)}
                                                             className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-blue-600 transition-all"
                                                          >
                                                              <SpeakerWaveIcon className="w-5 h-5" />
                                                          </button>
                                                      </div>
                                                      
                                                      <div className="flex items-center gap-3 mt-2 border-t border-slate-100 pt-2">
                                                          <button
                                                             onClick={() => toggleSpeechRec(
                                                                 grammarRecognitionRef,
                                                                 (isRec) => setGrammarRecIndex(isRec ? idx : null),
                                                                 (text) => setGrammarTranscripts(prev => ({...prev, [idx]: text})),
                                                                 grammarRecIndex,
                                                                 idx
                                                             )}
                                                             className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-colors ${grammarRecIndex === idx ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                                          >
                                                              <MicrophoneIcon className="w-3 h-3"/> {grammarRecIndex === idx ? 'Parar' : 'Falar'}
                                                          </button>
                                                          {grammarTranscripts[idx] && (
                                                              <span className="text-xs text-blue-600 italic truncate max-w-[200px]">"{grammarTranscripts[idx]}"</span>
                                                          )}
                                                      </div>
                                                  </div>
                                              ))}
                                          </div>
                                          
                                          <div className="text-center pt-4">
                                             <button 
                                                 onClick={() => handleSectionComplete('Gramática', 'practice')}
                                                 className="w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                                             >
                                                 <CheckCircleIcon className="w-5 h-5" /> Concluir Gramática (+15 XP)
                                             </button>
                                          </div>
                                      </div>
                                  )}

                                  {activeTab === 'practice' && (
                                      <div className="animate-in fade-in space-y-8">
                                          <div>
                                              <h3 className="text-lg font-bold text-slate-800 mb-4">Exercícios de Fixação <span className="text-sm font-normal text-slate-500">(10 pontos cada)</span></h3>
                                              {lesson.exercises.map((ex, idx) => (
                                                  <ExerciseComponent 
                                                     key={idx} 
                                                     exercise={ex} 
                                                     exerciseNumber={idx + 1} 
                                                     level={level}
                                                     onResult={handleExerciseResult}
                                                     targetLanguage={targetLanguage}
                                                  />
                                              ))}
                                          </div>
                                          
                                          <div className="text-center pt-4">
                                             <button 
                                                 onClick={() => handleSectionComplete('Exercícios', 'writing')}
                                                 className="w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                                             >
                                                 <CheckCircleIcon className="w-5 h-5" /> Concluir Exercícios (+20 XP)
                                             </button>
                                          </div>
                                      </div>
                                  )}

                                  {activeTab === 'writing' && (
                                     <div className="animate-in fade-in">
                                         <WritingPracticeComponent 
                                             lesson={lesson} 
                                             targetLanguage={targetLanguage} 
                                             onComplete={handleWritingComplete}
                                             totalLessonPoints={getTotalLessonPoints()}
                                             onNextLesson={handleNextLesson}
                                             onStartSimulator={startToeflTest}
                                             onChangeLevel={() => { window.scrollTo({top:document.body.scrollHeight, behavior: 'smooth'}); }}
                                             onChangeLanguage={() => { window.scrollTo({top:0, behavior: 'smooth'}); }}
                                             onGoToPractice={() => handleSectionComplete('Escrita', 'chat')}
                                         />
                                     </div>
                                  )}

                                  {activeTab === 'chat' && (
                                     <div className="animate-in fade-in">
                                         <h3 className="text-lg font-bold text-slate-800 mb-4">Diálogo Prático</h3>
                                         
                                         <div className="space-y-4 mb-6">
                                             {lesson.conversationPractice.map((line, idx) => (
                                                 <div key={idx} className={`flex items-start gap-3 ${line.speaker === '[USER]' ? 'flex-row-reverse' : ''}`}>
                                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${line.speaker === '[USER]' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'}`}>
                                                         {line.speaker === '[USER]' ? 'EU' : line.speaker[0]}
                                                     </div>
                                                     <div className={`p-3 rounded-2xl max-w-[80%] flex flex-col ${
                                                         line.speaker === '[USER]' 
                                                             ? 'bg-blue-600 text-white rounded-tr-none' 
                                                             : 'bg-slate-100 text-slate-800 rounded-tl-none'
                                                     }`}>
                                                         <div className="flex items-center gap-2 justify-between">
                                                             <p>{line.line}</p>
                                                             <button onClick={() => handleSpeak(line.line)} className={`p-1 rounded-full flex-shrink-0 ${line.speaker === '[USER]' ? 'hover:bg-blue-500' : 'hover:bg-slate-200'}`}>
                                                                 <SpeakerWaveIcon className="w-4 h-4 opacity-70" />
                                                             </button>
                                                         </div>
                                                         
                                                         <div className={`mt-2 pt-2 border-t flex items-center gap-2 ${line.speaker === '[USER]' ? 'border-blue-500' : 'border-slate-200'}`}>
                                                            <button
                                                                onClick={() => toggleSpeechRec(
                                                                    dialogRecognitionRef,
                                                                    (isRec) => setDialogRecIndex(isRec ? idx : null),
                                                                    (text) => setDialogTranscripts(prev => ({...prev, [idx]: text})),
                                                                    dialogRecIndex,
                                                                    idx
                                                                )}
                                                                className={`p-1.5 rounded-full transition-colors ${
                                                                    dialogRecIndex === idx 
                                                                        ? 'bg-red-500 text-white animate-pulse' 
                                                                        : (line.speaker === '[USER]' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-slate-200 hover:bg-slate-300')
                                                                }`}
                                                            >
                                                                <MicrophoneIcon className="w-3 h-3" />
                                                            </button>
                                                            <span className={`text-xs italic ${line.speaker === '[USER]' ? 'text-blue-100' : 'text-slate-500'}`}>
                                                                {dialogTranscripts[idx] || (dialogRecIndex === idx ? "Ouvindo..." : "Clique para falar")}
                                                            </span>
                                                         </div>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>

                                         <div className="text-center pt-4 mb-8">
                                            <button 
                                                onClick={() => handleSectionComplete('Diálogo', null)}
                                                className="w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                                            >
                                                <CheckCircleIcon className="w-5 h-5" /> Concluir Diálogo (+20 XP)
                                            </button>
                                         </div>
                                         
                                         <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 text-center">
                                             <p className="text-slate-600 text-sm mb-2">Quer praticar conversação livre com a IA?</p>
                                             <button 
                                                onClick={() => setLevel(Level.Conversation)}
                                                className="px-4 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-colors"
                                             >
                                                 Ir para Modo Conversação
                                             </button>
                                         </div>
                                     </div>
                                 )}
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Right Column: Sidebar */}
                  <div className="space-y-6">
                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                         <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                             <ChartBarIcon className="w-5 h-5 text-green-500"/> Estatísticas da Lição
                         </h3>
                         <div className="flex justify-between items-center mb-2">
                             <span className="text-sm text-slate-600">Exercícios</span>
                             <span className="font-bold text-slate-800">
                                 {userProgress[level]?.lessons[lessonNumber]?.correctExercises || 0}/{userProgress[level]?.lessons[lessonNumber]?.totalExercises || 0}
                             </span>
                         </div>
                         <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div 
                                 className="bg-green-500 h-full transition-all" 
                                 style={{ width: `${userProgress[level]?.lessons[lessonNumber]?.totalExercises ? ((userProgress[level]?.lessons[lessonNumber]?.correctExercises / userProgress[level]?.lessons[lessonNumber]?.totalExercises) * 100) : 0}%` }}
                              ></div>
                         </div>
                     </div>
                  </div>
              </div>
          )}
      </main>

      {/* Fixed Bottom Navigation Control */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex w-full md:w-auto gap-3">
            </div>
            
            <div className="flex w-full md:w-auto gap-3 justify-end items-center">
                <button 
                    onClick={() => setShowPlacementModal(true)}
                    className="flex-1 md:flex-none py-3 px-4 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                    title="Teste de Nivelamento (Inglês, Espanhol, Italiano)"
                >
                    <ChartBarIcon className="w-5 h-5"/> Teste de Nível (EN/ES/IT)
                </button>

                <button 
                    onClick={startToeflTest}
                    className="flex-1 md:flex-none py-3 px-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                    title="Simulado de Prova"
                >
                    <ClipboardDocumentCheckIcon className="w-5 h-5"/> Simulado
                </button>

                {level !== Level.Conversation && (
                     <select 
                        value={level} 
                        onChange={(e) => { setLevel(e.target.value as Level); setLessonNumber(1); }}
                        className="flex-1 md:flex-none bg-slate-100 border-none rounded-lg font-bold text-slate-700 py-3 px-4 cursor-pointer hover:bg-slate-200"
                     >
                          {LEVELS.filter(l => l !== Level.Conversation).map(l => (
                              <option key={l} value={l}>Nível {l}</option>
                          ))}
                     </select>
                )}
            </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in">
             <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>
                 <div className="mb-6 flex justify-center">
                     <div className="bg-green-100 p-4 rounded-full">
                        <CheckCircleIcon className="w-12 h-12 text-green-600" />
                     </div>
                 </div>
                 <h2 className="text-2xl font-black text-slate-800 mb-2">Lição Concluída!</h2>
                 <p className="text-slate-600 mb-6">Você mandou muito bem.</p>
                 
                 <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200">
                     <p className="text-sm font-bold text-slate-500 uppercase">Pontos na Lição</p>
                     <p className="text-4xl font-black text-blue-600 mt-1">+{sessionPoints.current} XP</p>
                 </div>
                 
                 <div className="mb-6 space-y-2">
                    <button 
                        onClick={generatePDF}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-bold"
                    >
                          <ArrowRightOnRectangleIcon className="w-4 h-4" /> Salvar Relatório (PDF)
                    </button>
                     <button 
                         onClick={downloadJSON}
                         className="flex items-center justify-center gap-2 w-full py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-bold"
                     >
                          <ArrowRightOnRectangleIcon className="w-4 h-4" /> Salvar Dados (JSON)
                    </button>
                 </div>

                 <div className="space-y-3">
                     <button 
                        onClick={() => {
                            setShowCompletionModal(false);
                            if (lessonNumber < LESSONS_PER_LEVEL) {
                                setLessonNumber(lessonNumber + 1);
                                setActiveTab('read');
                            } else {
                                startLevelTest();
                            }
                        }}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all"
                     >
                        {lessonNumber < LESSONS_PER_LEVEL ? 'Nova Lição' : 'Fazer Prova Final'}
                     </button>
                     
                     <button 
                        onClick={startToeflTest}
                        className="w-full py-3.5 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl transition-colors"
                     >
                        Fazer Simulado
                     </button>
                 </div>
             </div>
        </div>
      )}

      {/* Other Modals */}
      {showDashboard && <ProgressDashboard userProgress={userProgress} onClose={() => setShowDashboard(false)} />}
      {showLeaderboard && <Leaderboard entries={storageService.getLeaderboard(user, userProgress.totalScore)} onClose={() => setShowLeaderboard(false)} />}

      {/* Placement Test Modal (English, Spanish, Italian) */}
      {showPlacementModal && (
        <div className="fixed inset-0 bg-slate-100 overflow-y-auto z-50 animate-in fade-in">
          <PlacementFlow 
            onComplete={(lang, lvl, score) => {
              handleOnboardingComplete(lang, lvl, score);
              setShowPlacementModal(false);
            }} 
            userName={user.name} 
            onClose={() => setShowPlacementModal(false)}
          />
        </div>
      )}
    </div>
  );
};

export default EnglishModule;
