
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Book, Menu, X, Award, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { ChatMessage, SafetyQuizResponse, SafetyQuizQuestion } from '../../types';
import { generateChatResponse, generateSafetyQuiz } from '../../services/geminiService';

const SafetyModule: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Olá! Sou o Chatbot NR. Posso ajudar com dúvidas sobre as Normas Regulamentadoras ou podemos fazer um quiz rápido de treinamento.', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<SafetyQuizResponse | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const nrs = Array.from({ length: 38 }, (_, i) => i + 1);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, quizMode]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    if (textToSend.toLowerCase().includes('lista todas')) {
      const listText = nrs.map(n => `NR-${n}`).join(', ');
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: `📚 **Lista de NRs:**\n\n${listText}\n\nPergunte especificamente sobre uma delas (ex: "Resuma a NR 10").`, 
        timestamp: Date.now() 
      }]);
      setIsLoading(false);
      return;
    }

    const nrMatch = textToSend.match(/nr[-\s]?(\d+)/i);
    let systemPrompt = "Você é um especialista em Segurança do Trabalho e NRs do Brasil. Responda de forma clara e técnica.";
    
    if (nrMatch) {
      systemPrompt += ` Foco na NR-${nrMatch[1]}. Explique o objetivo e principais exigências de forma resumida.`;
    }

    const responseText = await generateChatResponse([...messages, userMsg], systemPrompt);
    setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: Date.now() }]);
    setIsLoading(false);
  };

  const startQuiz = async (topic: string = 'Segurança Geral') => {
    setIsLoading(true);
    setQuizMode(true);
    setQuizFinished(false);
    setQuizIndex(0);
    setScore(0);
    const quiz = await generateSafetyQuiz(topic);
    setCurrentQuiz(quiz);
    setIsLoading(false);
  };

  const handleAnswer = (idx: number) => {
    if (showFeedback) return;
    setSelectedOption(idx);
    setShowFeedback(true);
    if (idx === currentQuiz?.questions[quizIndex].correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setSelectedOption(null);
    if (currentQuiz && quizIndex < currentQuiz.questions.length - 1) {
      setQuizIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  return (
    <div className="flex h-full bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out
        ${showMenu ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:flex md:flex-col
      `}>
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-teal-900/20">
          <h2 className="font-bold text-lg flex items-center gap-2 text-teal-400">
            <Book size={20} /> Normas Técnicas
          </h2>
          <button onClick={() => setShowMenu(false)} className="md:hidden text-gray-400">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          <button 
            onClick={() => startQuiz()}
            className="w-full mb-4 bg-teal-600 hover:bg-teal-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-bold shadow-lg shadow-teal-900/20"
          >
            <Award size={18} /> Simulado IA
          </button>

          <ul className="space-y-1">
            {nrs.map(nr => (
              <li key={nr}>
                <button
                  onClick={() => { handleSend(`Resuma a NR ${nr}`); if (window.innerWidth < 768) setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-teal-500/10 hover:text-teal-400 transition-colors text-sm border border-transparent hover:border-teal-500/30"
                >
                  NR-{nr}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full relative">
        <div className="md:hidden p-4 absolute top-0 left-0 z-20">
          <button onClick={() => setShowMenu(true)} className="bg-gray-800 p-2 rounded-full shadow-lg border border-gray-700 text-teal-400">
            <Menu size={20} />
          </button>
        </div>

        <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 flex-1 justify-center md:justify-start">
             <Bot className="text-teal-400" />
             <h1 className="text-lg font-bold">Chatbot NR / Treinamento</h1>
          </div>
          {quizMode && (
            <button onClick={() => setQuizMode(false)} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
              <X size={14} /> Sair do Quiz
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
          {quizMode ? (
            <div className="max-w-2xl mx-auto h-full flex flex-col justify-center animate-fade-in">
              {isLoading ? (
                <div className="text-center space-y-4">
                  <RefreshCw className="mx-auto text-teal-500 animate-spin" size={40} />
                  <p className="text-gray-400">Gerando simulado personalizado com IA...</p>
                </div>
              ) : quizFinished ? (
                <div className="bg-gray-800 p-8 rounded-3xl text-center border border-teal-500/30 shadow-2xl">
                  <Award size={64} className="text-teal-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Simulado Concluído!</h2>
                  <p className="text-gray-400 mb-6">Você acertou {score} de {currentQuiz?.questions.length} questões.</p>
                  <button 
                    onClick={() => startQuiz()}
                    className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-full font-bold transition-all"
                  >
                    Tentar Novamente
                  </button>
                </div>
              ) : currentQuiz && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-teal-500 uppercase tracking-widest">Questão {quizIndex + 1}/{currentQuiz.questions.length}</span>
                    <span className="text-xs text-gray-500">Score: {score}</span>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                    <h3 className="text-lg font-medium leading-relaxed">{currentQuiz.questions[quizIndex].question}</h3>
                  </div>
                  <div className="grid gap-3">
                    {currentQuiz.questions[quizIndex].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        className={`p-4 text-left rounded-xl border transition-all flex items-start gap-3 ${
                          showFeedback 
                            ? i === currentQuiz.questions[quizIndex].correctAnswerIndex 
                              ? 'bg-green-500/20 border-green-500 text-green-300' 
                              : i === selectedOption 
                                ? 'bg-red-500/20 border-red-500 text-red-300'
                                : 'bg-gray-800/50 border-gray-700 opacity-50'
                            : 'bg-gray-800 border-gray-700 hover:border-teal-500 hover:bg-gray-750'
                        }`}
                      >
                        <span className="shrink-0 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">{String.fromCharCode(65 + i)}</span>
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                  {showFeedback && (
                    <div className="animate-slide-up space-y-4">
                      <div className={`p-4 rounded-xl flex items-start gap-3 ${selectedOption === currentQuiz.questions[quizIndex].correctAnswerIndex ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                        {selectedOption === currentQuiz.questions[quizIndex].correctAnswerIndex ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <p className="text-sm font-medium">{currentQuiz.questions[quizIndex].explanation}</p>
                      </div>
                      <button 
                        onClick={nextQuestion}
                        className="w-full bg-teal-600 hover:bg-teal-500 text-white py-3 rounded-xl font-bold transition-all"
                      >
                        Próxima Questão
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, idx) => {
                const formatText = (text: string) => {
                  let escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                  
                  // Headers
                  escaped = escaped.replace(/^### (.*$)/gim, '<h3 class="text-md font-bold text-teal-300 mt-2 mb-1">$1</h3>');
                  escaped = escaped.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-teal-300 mt-3 mb-2">$1</h2>');
                  
                  // Bold
                  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                  
                  // Italic
                  escaped = escaped.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
                  
                  // Bullet lists
                  escaped = escaped.replace(/^(?:-|\*) (.*$)/gim, '<li class="ml-4 list-disc mb-1">$1</li>');

                  return escaped;
                };

                return (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-100 border border-gray-700'}`}>
                      <div 
                        className="text-sm whitespace-pre-wrap [&>strong]:text-teal-400 [&>strong]:font-bold"
                        dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                      />
                    </div>
                  </div>
                );
              })}
              {isLoading && <div className="animate-pulse text-teal-500 text-sm">IA está analisando...</div>}
            </div>
          )}
        </div>

        {!quizMode && (
          <div className="p-4 bg-gray-900 border-t border-gray-800">
            <div className="flex gap-2 max-w-4xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ex: Qual o objetivo da NR 35?"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-5 py-3 focus:outline-none focus:border-teal-500 transition-all"
              />
              <button 
                onClick={() => handleSend()}
                disabled={isLoading}
                className="bg-teal-600 hover:bg-teal-500 text-white rounded-xl p-3 w-12 flex items-center justify-center disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyModule;
