import React, { useEffect, useState } from 'react';
import { generateLessonQuiz } from '../services/geminiService';
import { LoadingState, QuizData } from '../types';
import { Loader2, CheckCircle, XCircle, Award, RefreshCw, ChevronRight, BookOpen } from 'lucide-react';

interface QuizPanelProps {
  lessonTitle: string;
  onQuizComplete: (score: number) => void;
  hasCompleted: boolean;
  onNextLesson?: () => void;
  hasNext?: boolean;
  onBackToLesson: () => void;
}

const QuizPanel: React.FC<QuizPanelProps> = ({ 
    lessonTitle, 
    onQuizComplete, 
    hasCompleted, 
    onNextLesson,
    hasNext,
    onBackToLesson
}) => {
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadQuiz = async () => {
      setStatus(LoadingState.LOADING);
      setSubmitted(false);
      setUserAnswers({});
      setScore(0);
      
      try {
        const data = await generateLessonQuiz(lessonTitle);
        if (isMounted) {
          setQuizData(data);
          setStatus(LoadingState.SUCCESS);
        }
      } catch (error) {
        if (isMounted) setStatus(LoadingState.ERROR);
      }
    };

    if (!hasCompleted) {
        loadQuiz();
    } else {
        setStatus(LoadingState.IDLE); 
    }
    
    // Reset se mudar a aula
    if (!hasCompleted) {
        setSubmitted(false);
        setScore(0);
    }

    return () => { isMounted = false; };
  }, [lessonTitle]);

  const handleOptionSelect = (questionId: number, optionIndex: number) => {
    if (submitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = () => {
    if (!quizData) return;

    let calculatedScore = 0;
    quizData.questions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        calculatedScore += 10;
      }
    });

    setScore(calculatedScore);
    setSubmitted(true);
    onQuizComplete(calculatedScore);
  };

  if (hasCompleted && !submitted && status === LoadingState.IDLE) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50 rounded-lg border border-slate-100 min-h-[300px]">
              <div className="bg-yellow-100 p-4 rounded-full mb-4">
                 <Award className="text-yellow-600" size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Prova Finalizada!</h3>
              <p className="text-slate-500 mb-8 max-w-sm">Você já realizou a prova desta aula e garantiu sua pontuação.</p>
              
              <div className="flex gap-4">
                  <button 
                    onClick={onBackToLesson}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-white font-medium flex items-center gap-2"
                  >
                     <BookOpen size={16} /> Revisar Aula
                  </button>
                  {hasNext && (
                      <button 
                        onClick={onNextLesson}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-sm"
                      >
                         Próxima Aula <ChevronRight size={16} />
                      </button>
                  )}
              </div>
          </div>
      )
  }

  if (status === LoadingState.LOADING) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="text-sm font-medium animate-pulse">Elaborando prova com IA...</p>
      </div>
    );
  }

  if (status === LoadingState.ERROR || !quizData) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center">
        Erro ao carregar a prova. Tente recarregar a página.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-6">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-between">
        <div>
           <h3 className="font-bold text-blue-900">Prova de Conhecimento</h3>
           <p className="text-blue-700 text-sm">5 questões • 10 XP cada</p>
        </div>
        {submitted && (
            <div className="text-right">
                <span className="block text-xs text-blue-600 uppercase tracking-wide font-bold">Nota Final</span>
                <span className="text-3xl font-black text-blue-800">{score} XP</span>
            </div>
        )}
      </div>

      <div className="space-y-6">
        {quizData.questions.map((q, index) => {
          const isCorrect = userAnswers[q.id] === q.correctIndex;
          const isUserSelected = userAnswers[q.id] !== undefined;
          
          let borderColor = "border-slate-200";
          if (submitted) {
              borderColor = isCorrect ? "border-green-200 bg-green-50/30" : "border-red-200 bg-red-50/30";
          }

          return (
            <div key={q.id} className={`p-5 rounded-xl border-2 ${borderColor} transition-colors bg-white`}>
              <h4 className="font-semibold text-slate-800 mb-4 flex gap-3">
                <span className="bg-slate-100 text-slate-500 w-6 h-6 rounded flex items-center justify-center text-xs shrink-0 mt-0.5">{index + 1}</span>
                {q.text}
              </h4>
              
              <div className="space-y-2">
                {q.options.map((option, optIdx) => {
                  const isSelected = userAnswers[q.id] === optIdx;
                  const isAnswerCorrect = q.correctIndex === optIdx;
                  
                  let optionClass = "hover:bg-slate-50 border-slate-200 text-slate-600";
                  let icon = null;

                  if (submitted) {
                    if (isAnswerCorrect) {
                        optionClass = "bg-green-100 border-green-400 text-green-800 font-medium";
                        icon = <CheckCircle size={16} className="text-green-600" />;
                    } else if (isSelected && !isAnswerCorrect) {
                        optionClass = "bg-red-100 border-red-400 text-red-800";
                        icon = <XCircle size={16} className="text-red-600" />;
                    } else {
                        optionClass = "opacity-50 border-transparent";
                    }
                  } else {
                    if (isSelected) {
                        optionClass = "bg-blue-50 border-blue-500 text-blue-800 shadow-sm ring-1 ring-blue-500";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleOptionSelect(q.id, optIdx)}
                      disabled={submitted}
                      className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group ${optionClass}`}
                    >
                      <span className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 
                            ${isSelected && !submitted ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}
                            ${submitted && isAnswerCorrect ? '!border-green-600 !bg-green-600' : ''}
                        `}>
                            {(isSelected || (submitted && isAnswerCorrect)) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        {option}
                      </span>
                      {icon}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(userAnswers).length < 5}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95
            ${Object.keys(userAnswers).length < 5 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl'
            }`}
        >
          {Object.keys(userAnswers).length < 5 ? `Responda todas as questões (${Object.keys(userAnswers).length}/5)` : 'Finalizar Prova e Ver Nota'}
        </button>
      )}
      
      {submitted && (
          <div className="bg-slate-900 text-white p-6 rounded-xl text-center shadow-xl animate-fadeIn">
              <h3 className="text-xl font-bold mb-2">Resultado Processado!</h3>
              <p className="text-slate-300 mb-4">Sua pontuação foi adicionada ao Ranking Global.</p>
              <div className="inline-block px-4 py-1 bg-slate-800 rounded-full text-sm font-mono text-yellow-400 mb-4">
                  + {score} XP
              </div>
              <div className="flex gap-4 justify-center mt-2">
                  <button 
                    onClick={onBackToLesson}
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                  >
                     Revisar Aula
                  </button>
                  {hasNext && (
                      <button 
                        onClick={onNextLesson}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg transition-colors flex items-center gap-2"
                      >
                         Próxima Aula <ChevronRight size={18} />
                      </button>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default QuizPanel;