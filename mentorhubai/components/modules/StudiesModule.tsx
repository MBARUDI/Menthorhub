import React, { useState, useEffect, useCallback } from 'react';
import { 
  GraduationCap, Search, Loader2, Plus, Check, X, 
  BookOpen, Calculator, Globe, RefreshCw, Award, 
  ChevronRight, Copy, ArrowRight, User, BookCheck, HelpCircle,
  Languages
} from 'lucide-react';
import { generateStudyExercise, StudyExerciseResponse } from '../../services/geminiService';

interface Flashcard {
  id: string;
  college: string;
  question: string;
  answer: string;
  color: string;
}

const FLASHCARDS: Flashcard[] = [
  {
    id: 'enem',
    college: 'ENEM',
    question: 'Qual o foco principal da redação do ENEM e como garantir nota máxima?',
    answer: 'Proposta de Intervenção Detalhada. Exige solucionar um problema social abordando: Agente, Ação, Meio/Modo, Efeito e Detalhamento (5 elementos obrigatórios). Além disso, exibe forte foco em competências leitoras e de matriz de referência interdisciplinar.',
    color: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30'
  },
  {
    id: 'fuvest',
    college: 'FUVEST',
    question: 'Como é a cobrança de obras literárias na FUVEST?',
    answer: 'Análise Crítica e Intertextualidade. Não basta saber o enredo; a prova cobra o contexto histórico, a escola literária, as escolhas estéticas do autor e relações comparativas complexas entre obras da lista obrigatória.',
    color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30'
  },
  {
    id: 'insper',
    college: 'INSPER',
    question: 'Qual a característica mais marcante da prova de Matemática do INSPER?',
    answer: 'Modelagem Matemática e Análise de Dados. As questões exigem interpretar tabelas longas, gráficos complexos de negócios e modelar situações reais em funções matemáticas, matrizes e raciocínio puramente analítico.',
    color: 'from-red-500/20 to-rose-500/10 border-red-500/30'
  },
  {
    id: 'fgv',
    college: 'FGV',
    question: 'O que esperar da redação e das questões de humanas da FGV?',
    answer: 'Rigidez Argumentativa e Análise Macroeconômica. Exige linguagem técnica formal, raciocínio lógico-formal impecável e domínio de conceitos sociológicos, históricos e políticos aplicados à realidade econômica brasileira.',
    color: 'from-teal-500/20 to-emerald-500/10 border-teal-500/30'
  },
  {
    id: 'maua',
    college: 'MAUÁ',
    question: 'Como funciona o vestibular de Engenharia da Mauá?',
    answer: 'Raciocínio Aplicado à Inovação. Foco em questões práticas que conectam física mecânica, termodinâmica e cálculo geométrico com projetos reais de engenharia, desenho técnico básico e tecnologia aplicada.',
    color: 'from-blue-600/20 to-cyan-600/10 border-blue-600/30'
  },
  {
    id: 'fei',
    college: 'FEI',
    question: 'Qual o foco das provas exatas da FEI?',
    answer: 'Precisão Algorítmica e Cálculo. Exige domínio absoluto de equações físicas complexas, eletrostática, estática de corpos e álgebra matricial de alto nível para engenharia de ponta.',
    color: 'from-slate-500/20 to-gray-500/10 border-slate-500/30'
  },
  {
    id: 'unicamp',
    college: 'UNICAMP',
    question: 'Qual a principal diferença da redação da UNICAMP?',
    answer: 'Diversidade de Gêneros Textuais. A prova exige que o candidato produza cartas argumentativas, manifestos, crônicas, relatórios ou discursos, respeitando rigorosamente a máscara e a voz do gênero solicitado.',
    color: 'from-orange-500/20 to-red-500/10 border-orange-500/30'
  },
  {
    id: 'unesp',
    college: 'UNESP',
    question: 'Qual a filosofia de correção da redação da UNESP?',
    answer: 'Tema Filosófico e Argumentação Lógica. Os temas costumam ser perguntas reflexivas (\'O homem é o lobo do homem?\'). Exige repertório sociocultural clássico sólido e argumentação dissertativa de profunda coerência lógica.',
    color: 'from-purple-500/20 to-violet-500/10 border-purple-500/30'
  },
  {
    id: 'if',
    college: 'IF (Inst. Federal)',
    question: 'Qual a estrutura do exame técnico do Instituto Federal?',
    answer: 'Fundamentos Integrados. Questões objetivas focando em matemática elementar aplicada (razão, proporção, geometria de base) e interpretação textual em ciências naturais e exatas aplicadas à tecnologia.',
    color: 'from-green-500/20 to-emerald-500/10 border-green-500/30'
  },
  {
    id: 'link',
    college: 'LINK (Faculdade)',
    question: 'Como funciona o vestibular prático da Faculdade LINK?',
    answer: 'Resolução de Case de Negócios e Pitch. Foco em avaliar soft skills, liderança, espírito empreendedor, comunicação persuasiva e raciocínio lógico através da análise de problemas reais de mercado e dinâmicas coletivas.',
    color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30'
  }
];

const SUBJECTS = [
  { id: 'Matemática', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400', icon: Calculator },
  { id: 'Física', color: 'bg-orange-500/10 border-orange-500/20 text-orange-400', icon: HelpCircle },
  { id: 'Química', color: 'bg-green-500/10 border-green-500/20 text-green-400', icon: Award },
  { id: 'Português', color: 'bg-purple-500/10 border-purple-500/20 text-purple-400', icon: BookOpen },
  { id: 'Inglês', color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400', icon: Languages },
  { id: 'Espanhol', color: 'bg-pink-500/10 border-pink-500/20 text-pink-400', icon: Globe },
  { id: 'História', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400', icon: Globe },
  { id: 'Geografia', color: 'bg-teal-500/10 border-teal-500/20 text-teal-400', icon: Globe },
  { id: 'Biologia', color: 'bg-rose-500/10 border-rose-500/20 text-rose-400', icon: BookCheck }
];


const getExampleTopics = (subject: string): string => {
  switch (subject) {
    case 'Matemática': return 'Trigonometria, Funções de 2º Grau, Análise Combinatória, Probabilidade';
    case 'Física': return 'Cinemática, Dinâmica/Leis de Newton, Eletrodinâmica, Calorimetria';
    case 'Química': return 'Estequiometria, Tabela Periódica, Funções Orgânicas, Eletroquímica';
    case 'Português': return 'Interpretação de Texto, Sintaxe do Período, Modernismo, Crase';
    case 'Inglês': return 'Reading Comprehension, Passive Voice, Modal Verbs, False Friends';
    case 'Espanhol': return 'Comprensión de Textos, Falsos Amigos (Heterosemánticos), Pronombres';
    case 'História': return 'Segunda Guerra Mundial, Ditadura Militar, Revolução Industrial, Brasil Colônia';
    case 'Geografia': return 'Climatologia, Demografia do Brasil, Cartografia, Globalização';
    case 'Biologia': return 'Genética/Leis de Mendel, Ecologia, Sistema Imunológico, Evolução';
    default: return 'Assuntos Gerais';
  }
};

const INSTITUTIONS = [
  'ENEM', 'FUVEST', 'INSPER', 'FGV', 'MAUÁ', 'FEI', 'UNICAMP', 'UNESP', 'INSTITUTO FEDERAL', 'LINK'
];

export default function StudiesModule() {
  // Onboarding States
  const [userName, setUserName] = useState(() => localStorage.getItem('study_user_name') || '');
  const [tempName, setTempName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [tempTopic, setTempTopic] = useState<string>('');
  const [topicConfirmed, setTopicConfirmed] = useState<boolean>(false);
  const [selectedColleges, setSelectedColleges] = useState<string[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);

  // Simulation States
  const [exercise, setExercise] = useState<StudyExerciseResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Flashcards Carousel States
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Export State
  const [copySuccess, setCopySuccess] = useState(false);

  const toggleCollege = (college: string) => {
    if (selectedColleges.includes(college)) {
      setSelectedColleges(selectedColleges.filter(c => c !== college));
    } else {
      setSelectedColleges([...selectedColleges, college]);
    }
  };

  const selectAllColleges = () => {
    if (selectedColleges.length === INSTITUTIONS.length) {
      setSelectedColleges([]);
    } else {
      setSelectedColleges([...INSTITUTIONS]);
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName.trim());
      localStorage.setItem('study_user_name', tempName.trim());
    }
  };

  const startJourney = () => {
    if (selectedSubject && selectedColleges.length > 0) {
      setIsConfigured(true);
      fetchNewExercise();
    }
  };

  const fetchNewExercise = async () => {
    if (!selectedSubject) return;
    setIsLoading(true);
    setError(null);
    setExercise(null);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setCurrentCardIndex(0);
    setIsCardFlipped(false);

    const collegesStr = selectedColleges.length === INSTITUTIONS.length ? "Todas" : selectedColleges.join(", ");
    try {
      const data = await generateStudyExercise(selectedSubject, collegesStr, selectedTopic);
      setExercise(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Não foi possível carregar o exercício. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = (index: number) => {
    if (isSubmitted) return;
    setSelectedAnswer(index);
  };

  const submitAnswer = () => {
    if (selectedAnswer !== null) {
      setIsSubmitted(true);
    }
  };




  const handleCopySummary = () => {
    if (!exercise) return;
    const summaryText = `
=== PLATAFORMA INTERATIVA DE ESTUDOS VESTIBULARES ===
Matéria: ${selectedSubject}
Tópico Foco: ${selectedTopic || 'Tudo / Assuntos Gerais'}
Vestibulares: ${selectedColleges.join(', ')}

QUESTÃO:
${exercise.question}

ALTERNATIVAS:
A) ${exercise.options[0]}
B) ${exercise.options[1]}
C) ${exercise.options[2]}
D) ${exercise.options[3]}

RESPOSTA CORRETA: Alternativa ${String.fromCharCode(65 + exercise.correctAnswerIndex)}

EXPLICAÇÃO DETALHADA:
${exercise.explanation}

FÓRMULAS & REFERÊNCIAS:
${exercise.formulas}

GLOSSÁRIO TÉCNICO:
${exercise.glossary.map(g => `- ${g.term}: ${g.definition}`).join('\n')}
    `;
    navigator.clipboard.writeText(summaryText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const resetConfig = () => {
    setIsConfigured(false);
    setExercise(null);
    setSelectedSubject(null);
    setSelectedTopic('');
    setTempTopic('');
    setTopicConfirmed(false);
    setSelectedColleges([]);
  };


  return (
    <div className="flex flex-col h-full bg-android-bg text-white overflow-hidden animate-fade-in font-sans relative">
      <style>{`
        @keyframes pulseSubtle {
          0%, 100% {
            border-color: rgba(99, 102, 241, 0.4);
            box-shadow: 0 0 25px rgba(99, 102, 241, 0.2);
            transform: scale(1);
          }
          50% {
            border-color: rgba(99, 102, 241, 0.75);
            box-shadow: 0 0 35px rgba(99, 102, 241, 0.45);
            transform: scale(1.005);
          }
        }
        .animate-pulse-subtle {
          animation: pulseSubtle 3s infinite ease-in-out;
        }
      `}</style>
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* 1. NAME ONBOARDING SCREEN */}
      {!userName ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-lg mx-auto text-center z-10">
          <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6 shadow-md animate-pulse">
            <GraduationCap className="w-12 h-12" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white mb-2 leading-tight">Plataforma de Vestibulares</h2>
          <p className="text-sm text-gray-500 font-bold mb-8 uppercase tracking-widest leading-relaxed">Crie o seu plano de estudos prático com suporte de IA</p>
          
          <form onSubmit={handleNameSubmit} className="w-full bg-android-surface/40 backdrop-blur-2xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl flex flex-col gap-4">
            <div className="text-left">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2.5 ml-1">Como devemos te chamar?</label>
              <input 
                type="text" 
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                placeholder="Insira seu nome..."
                className="w-full bg-white/5 border border-white/5 focus:border-indigo-500/40 focus:outline-none rounded-2xl px-5 py-4 text-sm text-white placeholder-gray-600 font-bold transition-all shadow-inner"
              />
            </div>
            <button 
              type="submit"
              disabled={!tempName.trim()}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-950/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none mt-2"
            >
              Iniciar Acesso <ArrowRight size={14} />
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Sub-Header */}
          <div className="px-8 py-5 border-b border-white/5 shrink-0 bg-android-surface/20 backdrop-blur-3xl relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-3">
                <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-400 border border-indigo-500/20 shadow-md">
                  <GraduationCap size={22} />
                </div>
                Estudos Vestibulares
              </h1>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1.5 ml-1">
                Olá, {userName} &bull; Treinamento Técnico e Simulador de Questões
              </p>
            </div>
            
            {isConfigured && (
              <button 
                onClick={resetConfig}
                className="px-5 py-2.5 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 rounded-xl text-xs font-black uppercase tracking-wider text-gray-400 hover:text-white transition-all active:scale-95 self-start md:self-auto"
              >
                Ajustar Configurações
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* 2. CONFIGURATION SCREEN */}
            {!isConfigured ? (
              <div className="max-w-4xl mx-auto p-8 pb-32 space-y-10">
                <div className="bg-android-surface/30 border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/5 rounded-full blur-[80px]" />
                  <h3 className="text-lg font-black text-indigo-300 flex items-center gap-2 mb-2">
                    <BookOpen size={18} /> Configurar Foco de Estudo
                  </h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-8">Personalize os vestibulares e a matéria que deseja exercitar agora</p>

                  <div className="space-y-8">
                    {/* Choose Subject */}
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4 ml-1">Selecione uma matéria:</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {SUBJECTS.map((sub) => {
                          const IconComp = sub.icon;
                          const isSelected = selectedSubject === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => {
                                setSelectedSubject(sub.id);
                                setSelectedTopic('');
                                setTempTopic('');
                                setTopicConfirmed(false);
                              }}
                              className={`flex flex-col items-center justify-center p-5 rounded-[2rem] border transition-all duration-300 active:scale-95 gap-3 ${
                                isSelected 
                                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg scale-[1.02]' 
                                  : `${sub.color} hover:bg-white/5`
                              }`}
                            >
                              <IconComp size={28} className="transition-transform group-hover:scale-110" />
                              <span className="text-xs font-black tracking-tight">{sub.id}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Conversational Topic Selector Chat */}
                    {selectedSubject && (
                      <div className="bg-android-surface/60 border border-white/5 p-6 rounded-[2.5rem] space-y-4 animate-slide-up relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none" />
                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" /> Assistente de Estudos
                        </h4>
                        
                        <div className="space-y-4 font-sans text-xs">
                          {/* Assistant Welcome Bubble */}
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/10 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                              🤖
                            </div>
                            <div className="bg-white/5 border border-white/5 p-4 rounded-[1.5rem] rounded-tl-none max-w-[85%] text-gray-200 font-bold leading-relaxed space-y-2 select-none">
                              <p>Excelente escolha! 🧠 Você selecionou **{selectedSubject}**.</p>
                              <p className="text-gray-400 font-medium">Qual assunto ou tópico específico de {selectedSubject} você quer estudar hoje?</p>
                              <p className="text-[10px] text-gray-500 font-medium border-t border-white/5 pt-2 italic leading-relaxed">Exemplos sugeridos: {getExampleTopics(selectedSubject)}</p>
                            </div>
                          </div>

                          {/* User Chat Bubble (after topic confirmed) */}
                          {topicConfirmed && (
                            <div className="flex items-start justify-end gap-3 animate-fade-in">
                              <div className="bg-indigo-600 text-white p-4 rounded-[1.5rem] rounded-tr-none max-w-[85%] font-bold shadow-md">
                                Quero focar em: <span className="underline">{selectedTopic || "Tudo / Assuntos Gerais"}</span>
                              </div>
                              <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md select-none">
                                👤
                              </div>
                            </div>
                          )}

                          {/* Assistant Confirmation Bubble */}
                          {topicConfirmed && (
                            <div className="flex items-start gap-3 animate-slide-up">
                              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/10 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                                🤖
                              </div>
                              <div className="bg-white/5 border border-white/5 p-4 rounded-[1.5rem] rounded-tl-none max-w-[85%] text-gray-200 font-bold leading-relaxed select-none">
                                Perfeito! Vou programar um exercício completo de **{selectedSubject}** sobre **{selectedTopic || "Assuntos Gerais"}**.<br/><br/>
                                👇 Escolha abaixo as instituições alvo e clique em "Começar":
                              </div>
                            </div>
                          )}

                          {/* Input Chat Field (active when not confirmed) */}
                          {!topicConfirmed && (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                setSelectedTopic(tempTopic.trim());
                                setTopicConfirmed(true);
                              }}
                              className="flex items-center gap-3 pt-2"
                            >
                              <input
                                type="text"
                                value={tempTopic}
                                onChange={(e) => setTempTopic(e.target.value)}
                                placeholder={`Ex: ${getExampleTopics(selectedSubject).split(', ')[0]} (ou deixe em branco...)`}
                                className="flex-1 bg-white/5 border border-white/5 focus:border-indigo-500/40 focus:outline-none rounded-2xl px-5 py-4 text-xs text-white placeholder-gray-600 font-bold transition-all shadow-inner"
                              />
                              <button
                                type="submit"
                                className="px-5 py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-950/20 transition-all shrink-0"
                              >
                                Confirmar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTopic('');
                                  setTopicConfirmed(true);
                                }}
                                className="px-5 py-4 bg-white/5 hover:bg-white/10 active:scale-95 text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-2xl border border-white/5 transition-all shrink-0"
                              >
                                Pular
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Choose Colleges & Start Button (Only after topic is confirmed) */}
                    {selectedSubject && topicConfirmed && (
                      <div className="space-y-6 pt-4 border-t border-white/5 animate-fade-in">
                        {/* Choose Colleges */}
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">Selecione as instituições alvo:</label>
                            <button 
                              onClick={selectAllColleges}
                              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-wider text-indigo-400 hover:text-white transition-colors"
                            >
                              {selectedColleges.length === INSTITUTIONS.length ? "Limpar Todos" : "Selecionar Todas"}
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2.5">
                            {INSTITUTIONS.map((inst) => {
                              const isSelected = selectedColleges.includes(inst);
                              return (
                                <button
                                  key={inst}
                                  onClick={() => toggleCollege(inst)}
                                  className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all active:scale-95 ${
                                    isSelected
                                      ? 'bg-indigo-500 border-indigo-500 text-white shadow-md'
                                      : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:border-white/10'
                                  }`}
                                >
                                  {inst}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Start Button */}
                        <div className="pt-4 border-t border-white/5 flex justify-end">
                          <button
                            onClick={startJourney}
                            disabled={!selectedSubject || selectedColleges.length === 0}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-950/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
                          >
                            Começar Jornada de Estudos <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Info Text */}
                <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6 text-center">
                  <p className="text-xs text-gray-500 font-bold leading-relaxed">
                    💡 **Dica de Performance:** Você pode escolher vestibulares específicos como FUVEST e INSPER se estiver estudando para carreiras exatas focadas em alta concorrência.
                  </p>
                </div>
              </div>
            ) : (
              /* 3. SIMULATOR & FLASHCARDS PLAYGROUND */
              <div className="max-w-6xl mx-auto p-8 pb-32 grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Left Area: AI Simulator */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Simulator Screen */}
                  <div className="bg-android-surface/30 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
                    
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                        <BookCheck size={16} /> Questão Simulada por IA
                      </h4>
                      <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-black text-indigo-400">
                        {selectedSubject}
                      </div>
                    </div>

                    {/* Loader */}
                    {isLoading && (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
                        <p className="text-xs text-gray-500 font-sans tracking-widest uppercase font-black animate-pulse">Buscando e formatando questão técnica...</p>
                      </div>
                    )}

                    {/* Error State */}
                    {error && (
                      <div className="text-center py-10 flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-red-950/20 border border-red-500/30 text-red-400 flex items-center justify-center mb-6">
                          <X size={24} />
                        </div>
                        <h3 className="text-base font-black text-white mb-2">{error}</h3>
                        <button
                          onClick={fetchNewExercise}
                          className="mt-6 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-xs font-black uppercase tracking-wider text-white shadow-lg"
                        >
                          Tentar Novamente
                        </button>
                      </div>
                    )}

                    {/* Exercise Display */}
                    {exercise && !isLoading && (
                      <div className="space-y-6 animate-fade-in">
                        {/* Question Text */}
                        <div className="text-sm md:text-base text-gray-200 font-medium leading-relaxed whitespace-pre-wrap font-sans select-text border-l-2 border-indigo-500/50 pl-4 py-1">
                          {exercise.question}
                        </div>

                        {/* Options */}
                        <div className="grid gap-3 pt-2">
                          {exercise.options.map((opt, idx) => {
                            const isSelected = selectedAnswer === idx;
                            let btnStyle = "bg-white/5 border-white/5 hover:border-white/10 text-gray-300";
                            
                            if (isSelected) {
                              btnStyle = "bg-indigo-500/10 border-indigo-500 text-indigo-300";
                            }
                            
                            if (isSubmitted) {
                              const isCorrect = idx === exercise.correctAnswerIndex;
                              const isWrongSelection = isSelected && !isCorrect;
                              
                              if (isCorrect) {
                                btnStyle = "bg-android-success/10 border-android-success text-android-success";
                              } else if (isWrongSelection) {
                                btnStyle = "bg-red-500/10 border-red-500 text-red-400";
                              } else {
                                btnStyle = "bg-white/5 border-white/5 opacity-40 text-gray-500 cursor-not-allowed";
                              }
                            }

                            return (
                              <button
                                key={idx}
                                onClick={() => handleOptionClick(idx)}
                                disabled={isSubmitted}
                                className={`w-full flex items-start gap-4 p-5 rounded-[1.5rem] border transition-all text-left font-bold ${btnStyle}`}
                              >
                                <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black font-mono shrink-0">
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="text-xs leading-relaxed">{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Submitted Feedback Banner */}
                        {isSubmitted && (
                          <div className={`p-6 rounded-[2rem] border animate-slide-up flex flex-col gap-4 mt-6 ${
                            selectedAnswer === exercise.correctAnswerIndex 
                              ? 'bg-android-success/10 border-android-success/20 text-android-success' 
                              : 'bg-red-500/10 border-red-500/20 text-red-400'
                          }`}>
                            <div className="flex items-center gap-3">
                              {selectedAnswer === exercise.correctAnswerIndex ? (
                                <div className="w-10 h-10 rounded-xl bg-android-success/20 flex items-center justify-center text-android-success">
                                  <Check size={22} strokeWidth={3} />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                                  <X size={22} strokeWidth={3} />
                                </div>
                              )}
                              <div>
                                <p className="text-xs font-black uppercase tracking-wider">
                                  {selectedAnswer === exercise.correctAnswerIndex ? "Resposta Correta! ✅" : "Resposta Incorreta! ❌"}
                                </p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                                  Você escolheu a Alternativa {String.fromCharCode(65 + (selectedAnswer ?? 0))}
                                </p>
                              </div>
                            </div>

                            {/* Solution Tabs */}
                            <div className="bg-android-bg/60 p-6 rounded-2xl border border-white/5 text-gray-300 text-xs leading-relaxed space-y-6 mt-2 select-text">
                              {/* Explanation */}
                              <div>
                                <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Explicação Detalhada</h5>
                                <p className="whitespace-pre-wrap font-medium">{exercise.explanation}</p>
                              </div>

                              {/* Formulas */}
                              {exercise.formulas && exercise.formulas.toLowerCase() !== "não aplicável" && (
                                <div className="pt-4 border-t border-white/5">
                                  <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Fórmulas & Conceitos Científicos</h5>
                                  <p className="whitespace-pre-wrap font-medium bg-white/5 p-4 rounded-xl border border-white/5 font-mono italic">{exercise.formulas}</p>
                                </div>
                              )}

                              {/* Glossary */}
                              {exercise.glossary.length > 0 && (
                                <div className="pt-4 border-t border-white/5">
                                  <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Glossário Técnico</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {exercise.glossary.map((item, key) => (
                                      <div key={key} className="p-3 bg-white/5 rounded-xl border border-white/5">
                                        <span className="block font-black text-white text-[10px] uppercase tracking-wider mb-1">{item.term}</span>
                                        <span className="text-[10px] text-gray-500 font-bold leading-normal">{item.definition}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Controls */}
                        <div className="pt-6 border-t border-white/5 flex justify-between items-center gap-3">
                          {isSubmitted && (
                            <button
                              onClick={handleCopySummary}
                              className="px-5 py-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-wider text-indigo-400 hover:text-white transition-all flex items-center gap-2 active:scale-95"
                            >
                              {copySuccess ? <Check size={14} /> : <Copy size={14} />}
                              {copySuccess ? "Copiado!" : "Copiar Resumo"}
                            </button>
                          )}
                          
                          <div className="ml-auto flex gap-3">
                            {!isSubmitted ? (
                              <button
                                onClick={submitAnswer}
                                disabled={selectedAnswer === null}
                                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-950/20 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
                              >
                                Enviar Resposta
                              </button>
                            ) : (
                              <button
                                onClick={fetchNewExercise}
                                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-950/20 active:scale-95 transition-all flex items-center gap-2"
                              >
                                Próxima Questão <ChevronRight size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Area: Flashcards */}
                <div className="space-y-6">
                  {(() => {
                    const activeCardsDeck = exercise?.flashcards && exercise.flashcards.length > 0 ? exercise.flashcards : FLASHCARDS;

                    const activeCard = activeCardsDeck[currentCardIndex] || activeCardsDeck[0];
                    
                    return (
                      <div className="bg-android-surface/30 border border-white/5 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[580px]">
                        <div>
                          <div className="border-b border-white/5 pb-4 mb-6">
                            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                              <BookOpen size={16} className="text-indigo-400" /> 10 Flashcards Vestibulares
                            </h4>
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                              {exercise ? `Foco: ${selectedSubject} - ${selectedTopic || 'Geral'}` : "Conceitos chave e formatos de cada faculdade"}
                            </p>
                          </div>

                          {/* Opaque Flipped Flashcard */}
                          <div
                            onClick={() => setIsCardFlipped(!isCardFlipped)}
                            className={`p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer relative group flex flex-col justify-between min-h-[400px] select-none ${
                              isCardFlipped
                                ? 'border-indigo-500/60 bg-zinc-950 shadow-[0_0_35px_rgba(99,102,241,0.25)] animate-pulse-subtle'
                                : 'border-white/5 hover:border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-android-surface/30 to-purple-950/20 hover:scale-[1.01] shadow-[0_10px_30px_rgba(0,0,0,0.2)]'
                            }`}
                          >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none" />
                            
                            <div className="flex-1 flex flex-col justify-between">
                              {/* Header inside the card */}
                              <div className="flex flex-col gap-2.5 mb-4 border-b border-white/5 pb-3 shrink-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black tracking-widest uppercase text-white bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 shadow-sm flex items-center gap-1.5">
                                    🏫 {activeCard.college}
                                  </span>
                                  <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                                    {isCardFlipped ? "🔄 Ver Pergunta" : "🔄 Revelar Dica"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20 shadow-sm self-start">
                                  <span>📚 {selectedSubject}</span>
                                  {selectedTopic && (
                                    <>
                                      <span className="text-indigo-400/40">&bull;</span>
                                      <span className="text-gray-300 font-bold truncate max-w-[150px]">{selectedTopic}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Question / Answer Text */}
                              <div className="flex-1 flex flex-col justify-center py-2">
                                <span className="text-[9px] font-black text-indigo-400/80 uppercase tracking-widest block mb-2.5 leading-none">
                                  {isCardFlipped ? "✓ Resposta / Dica" : "❓ Pergunta / Conceito"}
                                </span>
                                
                                {isCardFlipped ? (
                                  <div className="bg-indigo-500/10 border border-indigo-500/25 p-5 rounded-2xl relative overflow-hidden flex-1 flex flex-col justify-center">
                                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                                    <p className="text-[13px] font-bold leading-relaxed tracking-wide text-zinc-100">
                                      {activeCard.answer}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-[13px] font-semibold leading-relaxed tracking-wide text-zinc-200 py-3">
                                    {activeCard.question}
                                  </p>
                                )}
                              </div>

                              {/* Flip Action Button or Hint */}
                              {isCardFlipped ? (
                                <div className="mt-4 flex flex-col gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsCardFlipped(false);
                                      setCurrentCardIndex((prev) => (prev === activeCardsDeck.length - 1 ? 0 : prev + 1));
                                    }}
                                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-950/20 transition-all flex items-center justify-center gap-2 font-sans"
                                  >
                                    Próximo Card <ChevronRight size={14} />
                                  </button>
                                  <span className="text-center text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                                    Ou clique no card para ver a pergunta
                                  </span>
                                </div>
                              ) : (
                                <div className="border-t border-white/5 pt-3 mt-4 flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-gray-500">
                                  <span>⭐ Clique para Revelar</span>
                                  <span className="text-indigo-400 group-hover:underline">Girar Card 🔄</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Carousel Controls */}
                        <div className="mt-6 flex flex-col gap-2.5">
                          <div className="flex items-center justify-between gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsCardFlipped(false);
                                setCurrentCardIndex((prev) => (prev === 0 ? activeCardsDeck.length - 1 : prev - 1));
                              }}
                              className="flex-1 py-3 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all text-center text-gray-400 hover:text-white"
                            >
                              Anterior
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsCardFlipped(false);
                                setCurrentCardIndex((prev) => (prev === activeCardsDeck.length - 1 ? 0 : prev + 1));
                              }}
                              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-950/20 transition-all text-center"
                            >
                              Próximo Card
                            </button>
                          </div>
                          <div className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-wider">
                            Card {currentCardIndex + 1} de {activeCardsDeck.length}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
