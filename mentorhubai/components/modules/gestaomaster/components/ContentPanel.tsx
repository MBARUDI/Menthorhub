import React, { useEffect, useState } from 'react';
import { Lesson, LoadingState } from '../types';
import { generateLessonContent, LessonContentResponse } from '../services/geminiService';
import QuizPanel from './QuizPanel';
import ChatPanel from './ChatPanel';
import { Sparkles, BookOpen, Lightbulb, Loader2, GraduationCap, FileText, ChevronRight, ChevronLeft } from 'lucide-react';

interface ContentPanelProps {
  currentLesson: Lesson;
  onQuizComplete: (score: number) => void;
  hasCompletedQuiz: boolean;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

const ContentPanel: React.FC<ContentPanelProps> = ({ 
    currentLesson, 
    onQuizComplete, 
    hasCompletedQuiz,
    onNextLesson,
    onPrevLesson,
    hasPrev,
    hasNext
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'quiz'>('summary');
  const [content, setContent] = useState<LessonContentResponse | null>(null);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);

  useEffect(() => {
    setActiveTab('summary');
  }, [currentLesson.id]);

  useEffect(() => {
    let isMounted = true;

    const fetchContent = async () => {
      setStatus(LoadingState.LOADING);
      setContent(null);
      
      try {
        const data = await generateLessonContent(currentLesson.title);
        if (isMounted) {
          setContent(data);
          setStatus(LoadingState.SUCCESS);
        }
      } catch (error) {
        if (isMounted) {
          setStatus(LoadingState.ERROR);
        }
      }
    };

    fetchContent();

    return () => {
      isMounted = false;
    };
  }, [currentLesson.id, currentLesson.title]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-full overflow-hidden">
      
      <div className="bg-slate-50 border-b border-slate-200 px-6 pt-6 pb-0">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight mb-4">{currentLesson.title}</h2>
          
          <div className="flex gap-6">
              <button 
                onClick={() => setActiveTab('summary')}
                className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === 'summary' 
                    ? 'border-indigo-600 text-indigo-700' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                  <FileText size={16} />
                  Resumo & Insights
              </button>
              <button 
                onClick={() => setActiveTab('quiz')}
                className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === 'quiz' 
                    ? 'border-blue-600 text-blue-700' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                  <GraduationCap size={16} />
                  Prova Prática
                  {hasCompletedQuiz && <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded-full">Feito</span>}
              </button>
          </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {activeTab === 'summary' && (
            <>
                {status === LoadingState.LOADING && (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-3 min-h-[200px]">
                    <Loader2 size={32} className="animate-spin text-indigo-500" />
                    <p className="text-sm font-medium animate-pulse">Gerando resumo executivo...</p>
                    </div>
                )}

                {status === LoadingState.SUCCESS && content && (
                    <div className="space-y-6 animate-fadeIn pb-6">
                        <div className="bg-indigo-50/50 rounded-lg p-5 border border-indigo-100">
                            <div className="flex items-center gap-2 mb-3 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                                <BookOpen size={14} />
                                <span>Resumo da Aula</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed text-sm md:text-base">
                            {content.summary}
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3 text-amber-600 font-bold text-xs uppercase tracking-wider">
                                <Lightbulb size={14} />
                                <span>Pontos Chave</span>
                            </div>
                            <ul className="grid gap-3">
                            {content.keyPoints.map((point, idx) => (
                                <li key={idx} className="flex items-start gap-3 bg-white p-4 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                <span className="text-slate-700 text-sm font-medium">{point}</span>
                                </li>
                             ))}
                            </ul>
                        </div>

                        <ChatPanel lessonTitle={currentLesson.title} />

                        <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-6">
                            <button 
                                onClick={onPrevLesson}
                                disabled={!hasPrev}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-sm font-medium transition-colors"
                            >
                                <ChevronLeft size={18} />
                                Aula Anterior
                            </button>

                            <button
                                onClick={() => setActiveTab('quiz')}
                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 hover:shadow-lg transition-all text-sm font-bold active:scale-95"
                            >
                                <GraduationCap size={18} />
                                Fazer Prova
                            </button>

                            <button 
                                onClick={onNextLesson}
                                disabled={!hasNext}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-sm font-medium transition-colors"
                            >
                                Próxima Aula
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {status === LoadingState.ERROR && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm">
                    Não foi possível gerar a análise. Verifique sua chave de API ou conexão.
                    </div>
                )}
            </>
        )}

        {activeTab === 'quiz' && (
            <QuizPanel 
                lessonTitle={currentLesson.title} 
                onQuizComplete={onQuizComplete}
                hasCompleted={hasCompletedQuiz}
                onNextLesson={onNextLesson}
                hasNext={hasNext}
                onBackToLesson={() => setActiveTab('summary')}
            />
        )}
      </div>
    </div>
  );
};

export default ContentPanel;
