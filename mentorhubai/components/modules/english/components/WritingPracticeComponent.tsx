import React, { useState } from 'react';
import { Lesson, WritingCorrection, TargetLanguage } from '../types';
import { correctWriting } from '../services/geminiService';
import { StarIcon, ArrowRightOnRectangleIcon, CheckCircleIcon, TrophyIcon, BookOpenIcon, LanguageIcon, ChartBarIcon } from './icons';

interface WritingPracticeComponentProps {
  lesson: Lesson;
  targetLanguage: TargetLanguage;
  onComplete?: (score: number) => void;
  totalLessonPoints?: number;
  onNextLesson?: () => void;
  onStartSimulator?: () => void;
  onChangeLevel?: () => void;
  onChangeLanguage?: () => void;
  onGoToPractice?: () => void;
}

const WritingPracticeComponent: React.FC<WritingPracticeComponentProps> = ({ 
    lesson, 
    targetLanguage, 
    onComplete, 
    totalLessonPoints = 0,
    onNextLesson,
    onStartSimulator,
    onChangeLevel,
    onChangeLanguage,
    onGoToPractice
}) => {
  const [writingText, setWritingText] = useState<string>('');
  const [writingCorrection, setWritingCorrection] = useState<WritingCorrection | null>(null);
  const [isCorrecting, setIsCorrecting] = useState<boolean>(false);
  const [correctionError, setCorrectionError] = useState<string | null>(null);
  const [hasSubmittedScore, setHasSubmittedScore] = useState<boolean>(false);

  const handleCorrectWriting = async () => {
    if (!writingText.trim() || !lesson) return;
    setIsCorrecting(true);
    setCorrectionError(null);
    setWritingCorrection(null);
    try {
        const context = `Lesson: ${lesson.title}. Reading text: ${lesson.text.substring(0, 150)}...`;
        const correction = await correctWriting(writingText, context, targetLanguage);
        setWritingCorrection(correction);

        // Award points if score is decent and haven't submitted yet
        if (!hasSubmittedScore && correction.score >= 60 && onComplete) {
            onComplete(correction.score);
            setHasSubmittedScore(true);
        }

    } catch (err) {
        setCorrectionError('Não foi possível corrigir o texto. Tente novamente.');
    } finally {
        setIsCorrecting(false);
    }
  };

  const getScoreColor = (score: number) => {
      if (score >= 90) return 'text-green-600';
      if (score >= 70) return 'text-blue-600';
      if (score >= 50) return 'text-yellow-600';
      return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
         <StarIcon className="w-6 h-6 text-yellow-500" /> Prática de Escrita
      </h3>
      
      {!writingCorrection ? (
          <>
            <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
                <p className="text-sm text-slate-600 font-medium">Tema sugerido:</p>
                <p className="text-slate-800 mt-1 italic">"{lesson.title}"</p>
                <p className="mt-3 text-xs text-slate-500">Escreva um texto (3-5 frases) em {targetLanguage} sobre este tema. A IA irá avaliar sua gramática e vocabulário.</p>
            </div>

            <textarea
                className="w-full h-40 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow text-slate-800 bg-white text-base leading-relaxed"
                value={writingText}
                onChange={(e) => setWritingText(e.target.value)}
                placeholder={`Escreva seu texto em ${targetLanguage} aqui...`}
                aria-label="Texto para correção"
                disabled={isCorrecting}
            />
            
            <div className="flex justify-end mt-4">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        handleCorrectWriting();
                    }}
                    disabled={isCorrecting || !writingText.trim()}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    {isCorrecting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Corrigindo...
                        </>
                    ) : (
                        <>
                            <ArrowRightOnRectangleIcon className="w-5 h-5" /> Enviar para Avaliação
                        </>
                    )}
                </button>
            </div>
          </>
      ) : (
        // Result View
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h4 className="text-lg font-bold text-slate-700">Resultado da Avaliação</h4>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 self-start sm:self-auto`}>
                    <span className="text-xs font-bold text-slate-500 uppercase">Nota:</span>
                    <span className={`text-2xl font-black ${getScoreColor(writingCorrection.score)}`}>
                        {writingCorrection.score}
                    </span>
                    <span className="text-slate-400 text-sm">/100</span>
                </div>
            </div>

            <div className={`p-5 rounded-xl border mb-8 ${writingCorrection.isCorrect ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'} space-y-4`}>
                
                {writingCorrection.correctedText && (
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Correção Sugerida</p>
                        <p className="text-slate-800 font-medium text-lg leading-relaxed">{writingCorrection.correctedText}</p>
                    </div>
                )}

                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Feedback</p>
                    <p className="text-slate-700 leading-relaxed">{writingCorrection.feedback}</p>
                </div>

                {hasSubmittedScore && (
                        <div className="flex items-center gap-2 text-green-600 font-bold text-sm pt-2 border-t border-slate-200/50">
                            <CheckCircleIcon className="w-5 h-5" /> Pontos computados!
                        </div>
                )}
            </div>

            {/* Continue Button */}
            {onGoToPractice && (
                <div className="flex justify-center mb-8">
                    <button 
                        onClick={onGoToPractice}
                        className="w-full md:w-auto px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-3"
                    >
                        <CheckCircleIcon className="w-6 h-6" /> Concluir e Ir para Prática
                    </button>
                </div>
            )}

            {/* Next Steps Dashboard */}
            <div className="bg-slate-800 rounded-xl p-6 text-white shadow-lg">
                 <div className="text-center mb-6">
                     <p className="text-slate-400 uppercase text-xs font-bold tracking-wider mb-1">Pontuação Total na Lição</p>
                     <p className="text-4xl font-black text-yellow-400 flex items-center justify-center gap-2">
                        <TrophyIcon className="w-8 h-8" /> {totalLessonPoints} XP
                     </p>
                 </div>

                 <p className="text-center text-slate-300 font-medium mb-4">O que você quer fazer agora?</p>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {onNextLesson && (
                        <button onClick={onNextLesson} className="p-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
                            <BookOpenIcon className="w-5 h-5" /> Próxima Lição
                        </button>
                    )}
                    
                    {onStartSimulator && (
                        <button onClick={onStartSimulator} className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
                            <CheckCircleIcon className="w-5 h-5" /> Fazer Simulado
                        </button>
                    )}

                    {onChangeLevel && (
                        <button onClick={onChangeLevel} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
                            <ChartBarIcon className="w-5 h-5" /> Mudar Nível
                        </button>
                    )}

                    {onChangeLanguage && (
                        <button onClick={onChangeLanguage} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
                            <LanguageIcon className="w-5 h-5" /> Mudar Língua
                        </button>
                    )}
                 </div>
            </div>
        </div>
      )}

      <div className="mt-6">
          {correctionError && <p className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-100">{correctionError}</p>}
      </div>
    </div>
  );
};

export default WritingPracticeComponent;
