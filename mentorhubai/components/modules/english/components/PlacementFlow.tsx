import React, { useState } from 'react';
import { TargetLanguage, Level, TestQuestion } from '../types';
import { generatePlacementTest } from '../services/geminiService';
import { ChartBarIcon, BookOpenIcon, ClipboardDocumentCheckIcon, ChevronLeftIcon } from './icons';

interface PlacementFlowProps {
  onComplete: (language: TargetLanguage, level: Level, score: number) => void;
  userName: string;
  onClose?: () => void;
  initialLanguage?: TargetLanguage;
  initialStep?: 'language' | 'choice' | 'test' | 'loading' | 'results';
}

const PlacementFlow: React.FC<PlacementFlowProps> = ({ 
  onComplete, 
  userName, 
  onClose,
  initialLanguage = 'English',
  initialStep = 'language'
}) => {
  const [step, setStep] = useState<'language' | 'choice' | 'test' | 'loading' | 'results'>(initialStep);
  const [selectedLanguage, setSelectedLanguage] = useState<TargetLanguage>(initialLanguage);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [recommendedLevel, setRecommendedLevel] = useState<Level>(Level.Beginner);

  const handleLanguageSelect = (lang: TargetLanguage) => {
    setSelectedLanguage(lang);
    setStep('choice');
  };

  const startTest = async () => {
    setStep('loading');
    try {
      const testQuestions = await generatePlacementTest(selectedLanguage);
      setQuestions(testQuestions);
      setStep('test');
    } catch (error) {
      console.error("Error generating placement test", error);
      setStep('choice');
      alert("Houve um erro ao gerar o teste. Por favor, tente novamente.");
    }
  };

  const handleAnswer = (questionId: number, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const calculateResults = () => {
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);

    if (correctCount <= 2) setRecommendedLevel(Level.Beginner);
    else if (correctCount <= 4) setRecommendedLevel(Level.Intermediate);
    else setRecommendedLevel(Level.Advanced);

    setStep('results');
  };

  const handleLevelSelection = (level: Level) => {
    onComplete(selectedLanguage, level, score);
  };

  if (step === 'choice') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative">
        <button 
          onClick={() => setStep('language')}
          className="absolute top-6 left-6 px-4 py-2 bg-white text-slate-600 hover:text-slate-900 rounded-lg shadow-sm border border-slate-200 font-bold transition-all text-sm flex items-center gap-1 hover:shadow-md hover:bg-slate-50"
        >
          <ChevronLeftIcon className="w-4 h-4" /> Voltar
        </button>
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 px-4 py-2 bg-white text-slate-600 hover:text-slate-900 rounded-lg shadow-sm border border-slate-200 font-bold transition-all text-sm flex items-center gap-1 hover:shadow-md hover:bg-slate-50"
          >
            ✕ Fechar
          </button>
        )}
        <div className="bg-white max-w-4xl w-full p-8 rounded-2xl shadow-xl text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">
              {selectedLanguage === 'English' && '🇺🇸'}
              {selectedLanguage === 'Spanish' && '🇪🇸'}
              {selectedLanguage === 'Italian' && '🇮🇹'}
            </span>
            <h1 className="text-3xl font-black text-slate-800">
              Idioma: {selectedLanguage === 'English' ? 'Inglês' : selectedLanguage === 'Spanish' ? 'Espanhol' : 'Italiano'}
            </h1>
          </div>
          <p className="text-slate-500 mb-8 text-lg">Como você gostaria de começar seus estudos?</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
            {[
              {
                level: Level.Beginner,
                title: "Nível Básico / Iniciante",
                description: "Perfeito se você está começando do zero absoluto ou quer revisar fundamentos e gramática primária.",
                color: "border-blue-200 hover:border-blue-500 hover:bg-blue-50",
                iconBg: "bg-blue-100 text-blue-700",
                badge: "Recomendado para início"
              },
              {
                level: Level.Intermediate,
                title: "Nível Intermediário",
                description: "Ideal se você já entende estruturas básicas e quer expandir vocabulário, tempos verbais e diálogos complexos.",
                color: "border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50",
                iconBg: "bg-emerald-100 text-emerald-700",
                badge: "Autonomia na língua"
              },
              {
                level: Level.Advanced,
                title: "Nível Avançado",
                description: "Projetado para quem quer refinar fluência, expressões idiomáticas ricas, phrasal verbs e literatura complexa.",
                color: "border-violet-200 hover:border-violet-500 hover:bg-violet-50",
                iconBg: "bg-violet-100 text-violet-700",
                badge: "Alto desempenho"
              },
              {
                level: Level.Conversation,
                title: "Conversação Livre",
                description: "Foque 100% em conversação interativa dinâmica com nossa IA inteligente para destravar a fala.",
                color: "border-amber-200 hover:border-amber-500 hover:bg-amber-50",
                iconBg: "bg-amber-100 text-amber-700",
                badge: "Foco prático"
              }
            ].map((item) => (
              <button
                key={item.level}
                onClick={() => handleLevelSelection(item.level)}
                className={`group relative p-6 bg-slate-50 border-2 rounded-xl transition-all flex gap-4 hover:shadow-lg hover:-translate-y-0.5 ${item.color}`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 text-2xl ${item.iconBg}`}>
                  <BookOpenIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-slate-900">
                      {item.title}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden text-left hover:shadow-2xl transition-all">
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 scale-150">
              <ClipboardDocumentCheckIcon className="w-64 h-64" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-xl">
                <span className="inline-block bg-amber-400 text-slate-900 text-xs font-black uppercase px-3 py-1 rounded-full mb-3 tracking-wider animate-pulse">
                  ⚡ Recomendado
                </span>
                <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                  Não tem certeza do seu nível real?
                </h3>
                <p className="text-blue-100 text-sm md:text-base leading-relaxed">
                  Faça o nosso **Teste de Nivelamento IA**. Em apenas 6 questões dinâmicas de gramática, vocabulário e interpretação, nossa inteligência artificial recomendará o nível ideal para você começar sem perder tempo!
                </p>
              </div>
              <button
                onClick={startTest}
                className="w-full md:w-auto px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <ClipboardDocumentCheckIcon className="w-5 h-5" />
                Iniciar Teste de Nivelamento
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'language') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 px-4 py-2 bg-white text-slate-600 hover:text-slate-900 rounded-lg shadow-sm border border-slate-200 font-bold transition-all text-sm flex items-center gap-1 hover:shadow-md hover:bg-slate-50"
          >
            ✕ Fechar
          </button>
        )}
        <div className="bg-white max-w-2xl w-full p-8 rounded-2xl shadow-xl text-center">
          <h1 className="text-3xl font-black text-slate-800 mb-2">Bem-vindo, {userName}!</h1>
          <p className="text-slate-500 mb-8 text-lg">Qual língua você quer testar ou aprender hoje?</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['English', 'Spanish', 'Italian'] as TargetLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageSelect(lang)}
                className="group relative p-6 bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-4 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm text-3xl group-hover:scale-110 transition-transform">
                   {lang === 'English' && '🇺🇸'}
                   {lang === 'Spanish' && '🇪🇸'}
                   {lang === 'Italian' && '🇮🇹'}
                </div>
                <span className="font-bold text-slate-700 text-xl group-hover:text-blue-700">
                    {lang === 'English' ? 'Inglês' : lang === 'Spanish' ? 'Espanhol' : 'Italiano'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Preparando sua avaliação...</h2>
            <p className="text-slate-500">Nossa IA está criando perguntas personalizadas para descobrir seu nível.</p>
        </div>
      </div>
    );
  }

  if (step === 'test') {
    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / questions.length) * 100;

    return (
      <div className="min-h-screen bg-slate-100 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6 sticky top-4 z-10 border border-slate-200">
             <div className="flex justify-between items-center mb-2">
                 <h2 className="font-bold text-slate-700 text-lg">Teste de Nível: {selectedLanguage}</h2>
                 <div className="flex items-center gap-3">
                     <span className="text-sm font-bold text-blue-600">{answeredCount}/{questions.length}</span>
                     {onClose && (
                         <button 
                             onClick={onClose}
                             className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors border border-rose-200 shadow-sm"
                         >
                             Sair
                         </button>
                     )}
                 </div>
             </div>
             <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                 <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
             </div>
          </div>

          <div className="space-y-6">
              {questions.map((q, idx) => (
                  <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <div className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                              {idx + 1}
                          </span>
                          <div className="flex-1">
                              <p className="font-semibold text-slate-800 text-lg mb-4">{q.question}</p>
                              <div className="space-y-3">
                                  {q.options.map((option) => (
                                      <label 
                                        key={option} 
                                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all hover:bg-slate-50 ${
                                            answers[q.id] === option ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200'
                                        }`}
                                      >
                                          <input 
                                            type="radio" 
                                            name={`q-${q.id}`} 
                                            value={option}
                                            checked={answers[q.id] === option}
                                            onChange={() => handleAnswer(q.id, option)}
                                            className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                          />
                                          <span className="ml-3 text-slate-700">{option}</span>
                                      </label>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
              ))}
          </div>

          <div className="mt-8 flex justify-center">
              <button
                onClick={calculateResults}
                disabled={answeredCount < questions.length}
                className="px-8 py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                  Verificar Resultados
              </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'results') {
    return (
      <div className="min-h-screen bg-slate-100 py-10 px-4 relative">
         {onClose && (
           <button 
             onClick={onClose}
             className="absolute top-6 right-6 px-4 py-2 bg-white text-slate-600 hover:text-slate-900 rounded-lg shadow-sm border border-slate-200 font-bold transition-all text-sm hover:shadow-md hover:bg-slate-50 z-20"
           >
             ✕ Concluir e Fechar
           </button>
         )}
         <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-blue-600 p-8 text-center text-white">
                <h2 className="text-3xl font-black mb-2">Resultado da Avaliação</h2>
                <div className="text-6xl font-black my-6">{score}/{questions.length}</div>
                <p className="text-xl opacity-90">
                    Com base no seu desempenho, recomendamos o nível:
                </p>
                <div className="inline-block bg-white text-blue-700 px-6 py-2 rounded-full font-bold text-xl mt-4 uppercase">
                    {recommendedLevel}
                </div>
            </div>

            <div className="p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <ChartBarIcon className="w-6 h-6 text-slate-500" /> Gabarito e Correção
                </h3>
                
                <div className="space-y-6 mb-10">
                    {questions.map((q, idx) => {
                        const isCorrect = answers[q.id] === q.correctAnswer;
                        return (
                            <div key={q.id} className={`p-4 rounded-lg border-l-4 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                                <p className="font-bold text-slate-700 mb-2">{idx + 1}. {q.question}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className={`${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                        <span className="font-bold block text-xs uppercase opacity-70">Sua Resposta:</span>
                                        {answers[q.id]}
                                    </div>
                                    {!isCorrect && (
                                        <div className="text-green-700">
                                            <span className="font-bold block text-xs uppercase opacity-70">Resposta Correta:</span>
                                            {q.correctAnswer}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 text-center">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Onde você quer começar?</h3>
                    <p className="text-slate-500 mb-6">Escolha o nível que você se sente mais confortável.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {[Level.Beginner, Level.Intermediate, Level.Advanced, Level.Conversation].map((lvl) => (
                            <button
                                key={lvl}
                                onClick={() => handleLevelSelection(lvl)}
                                className={`p-4 rounded-xl border-2 font-bold transition-all ${
                                    lvl === recommendedLevel 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' 
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                            >
                                {lvl} {lvl === recommendedLevel && "(Recomendado)"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
         </div>
      </div>
    );
  }

  return null;
};

export default PlacementFlow;
