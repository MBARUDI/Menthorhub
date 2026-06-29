import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ConversationMessage, TargetLanguage } from '../types';
import { getNextConversationTurn, translateBidirectional } from '../services/geminiService';
import { UserCircleIcon, MicrophoneIcon, SpeakerWaveIcon, SoundWaveAnimation, LanguageIcon } from './icons';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
}
interface SpeechRecognitionEvent extends Event { readonly results: any; }
interface SpeechRecognitionErrorEvent extends Event { readonly error: string; }
declare var SpeechRecognition: { new(): SpeechRecognition; };
declare var webkitSpeechRecognition: { new(): SpeechRecognition; };
declare global { interface Window { SpeechRecognition: typeof SpeechRecognition; webkitSpeechRecognition: typeof webkitSpeechRecognition; } }

interface ConversationComponentProps {
  userName: string;
  onSpeak: (text: string) => void;
  speakingText: string | null;
  targetLanguage: TargetLanguage;
  onUserTurn?: () => void;
}

const ConversationComponent: React.FC<ConversationComponentProps> = ({ userName, onSpeak, speakingText, targetLanguage, onUserTurn }) => {
  type Stage = 'topic_select' | 'profession_input' | 'chatting';

  const [stage, setStage] = useState<Stage>('topic_select');
  const [topic, setTopic] = useState<string>('');
  const [professionInput, setProfessionInput] = useState<string>('');
  
  const [history, setHistory] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef<string>("");
  const [isListening, setIsListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [transInput, setTransInput] = useState('');
  const [transOutput, setTransOutput] = useState('');
  const [transLoading, setTransLoading] = useState(false);
  const [transDirection, setTransDirection] = useState<'targetToPt' | 'ptToTarget'>('targetToPt');

  const getLangCode = (lang: TargetLanguage) => {
    switch (lang) {
        case 'English': return 'en-US';
        case 'Italian': return 'it-IT';
        case 'Spanish': return 'es-ES';
        default: return 'en-US';
    }
  };

  const getLangLabel = (lang: TargetLanguage) => {
      switch(lang) {
          case 'English': return 'Inglês';
          case 'Italian': return 'Italiano';
          case 'Spanish': return 'Espanhol';
          default: return lang;
      }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: ConversationMessage = { speaker: 'user', text: messageText };
    setHistory(prev => [...prev, userMessage]);
    
    if (onUserTurn) {
        onUserTurn();
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getNextConversationTurn([...history, userMessage], messageText, topic, userName, targetLanguage);
      
      setHistory(prev => {
          const updatedHistory = [...prev];
          const lastMessage = updatedHistory[updatedHistory.length - 1];
          if(lastMessage.speaker === 'user') {
              lastMessage.correction = response.correction;
              lastMessage.translation = response.userTranslation;
          }
          return updatedHistory;
      });

      const aiMessage: ConversationMessage = { 
          speaker: 'ai', 
          text: response.nextMessage,
          translation: response.nextMessageTranslation 
      };
      setHistory(prev => [...prev, aiMessage]);
      onSpeak(response.nextMessage);

    } catch (err) {
        setError("Desculpe, ocorreu um erro. Tente novamente.");
        setHistory(prev => prev.slice(0, -1));
    } finally {
        setIsLoading(false);
    }
  }, [history, topic, userName, onSpeak, targetLanguage, onUserTurn]);

  const sendMessageRef = useRef(sendMessage);
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setRecognitionError("A API de reconhecimento de fala não é suportada neste navegador.");
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.lang = getLangCode(targetLanguage);
    recognition.interimResults = true;
    
    const handleResult = (event: SpeechRecognitionEvent) => {
      if (event.results.length > 0) {
        const transcript = event.results[0][0].transcript;
        transcriptRef.current = transcript;
      }
    };
    
    const handleError = (event: SpeechRecognitionErrorEvent) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
            setRecognitionError(`Erro no reconhecimento de fala: ${event.error}`);
        }
        setIsListening(false);
    };
    
    const handleEnd = () => {
      setIsListening(false);
      
      if (transcriptRef.current.trim()) {
        sendMessageRef.current(transcriptRef.current);
        transcriptRef.current = ""; 
      }
    };

    recognition.addEventListener('result', handleResult);
    recognition.addEventListener('error', handleError as EventListener);
    recognition.addEventListener('end', handleEnd);

    recognitionRef.current = recognition;

    return () => {
      recognition.removeEventListener('result', handleResult);
      recognition.removeEventListener('error', handleError as EventListener);
      recognition.removeEventListener('end', handleEnd);
      recognition.abort();
    };
  }, [targetLanguage]);

  const startConversation = useCallback(async (convTopic: string) => {
    setTopic(convTopic);
    setStage('chatting');
    setIsLoading(true);
    setError(null);
    setHistory([]);

    try {
        const firstTurn = await getNextConversationTurn([], "Let's start.", convTopic, userName, targetLanguage);
        const firstMessage: ConversationMessage = {
            speaker: 'ai',
            text: firstTurn.nextMessage,
            translation: firstTurn.nextMessageTranslation
        };
        setHistory([firstMessage]);
        onSpeak(firstTurn.nextMessage);
    } catch (err) {
        setError("Desculpe, não foi possível iniciar a conversa. Tente novamente.");
    } finally {
        setIsLoading(false);
    }
  }, [userName, onSpeak, targetLanguage]);

  const handleTopicSelect = (selectedTopic: 'daily life' | 'profession') => {
    if (selectedTopic === 'profession') {
      setStage('profession_input');
    } else {
      startConversation('sobre o dia a dia (daily life)');
    }
  };

  const handleProfessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (professionInput.trim()) {
      startConversation(`sobre minha profissão de ${professionInput.trim()}`);
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        setRecognitionError("O reconhecimento de fala não está inicializado.");
        return;
      }
      setRecognitionError(null);
      transcriptRef.current = "";
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        setIsListening(false);
      }
    }
  };

  const handleTranslate = async () => {
      if(!transInput.trim()) return;
      setTransLoading(true);
      setTransOutput('');
      try {
          const fromLang = transDirection === 'targetToPt' ? targetLanguage : 'Portuguese';
          const toLang = transDirection === 'targetToPt' ? 'Portuguese' : targetLanguage;
          const result = await translateBidirectional(transInput, fromLang, toLang);
          setTransOutput(result);
      } catch(e) {
          setTransOutput("Erro na tradução.");
      } finally {
          setTransLoading(false);
      }
  };

  if (stage === 'topic_select') {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Iniciar Conversa em {targetLanguage}</h2>
        <p className="text-slate-600 mb-6">Sobre o que você gostaria de conversar hoje?</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => handleTopicSelect('daily life')} className="flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 bg-blue-600 text-white shadow-lg">
            Dia a Dia
          </button>
          <button onClick={() => handleTopicSelect('profession')} className="flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 bg-slate-200 text-slate-700 hover:bg-slate-300">
            Minha Profissão
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'profession_input') {
    return (
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Sua Profissão</h2>
            <p className="text-slate-600 mb-6">Para personalizar a conversa, por favor, diga-nos qual é a sua profissão.</p>
            <form onSubmit={handleProfessionSubmit}>
                <input
                    type="text"
                    value={professionInput}
                    onChange={(e) => setProfessionInput(e.target.value)}
                    placeholder="Ex: Engenheiro de Software, Médico, Professor"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-slate-800"
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={!professionInput.trim()}
                    className="w-full mt-4 px-6 py-3 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 bg-blue-600 text-white shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    Começar a Conversar
                </button>
            </form>
        </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-20">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-slate-800">Conversando sobre: <span className="text-blue-600">{topic}</span></h2>
        </div>
        <div className="p-4 h-96 overflow-y-auto bg-slate-50 flex flex-col gap-4">
            {history.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.speaker === 'user' ? 'justify-end' : ''}`}>
                {msg.speaker === 'ai' && (
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <UserCircleIcon className="w-7 h-7 text-slate-500" />
                </div>
                )}
                <div className={`max-w-md ${msg.speaker === 'user' ? 'text-right' : ''}`}>
                <div className={`p-3 rounded-lg ${msg.speaker === 'ai' ? 'bg-slate-200' : 'bg-blue-500 text-white'}`}>
                    <p className="text-base">{msg.text}</p>
                    {msg.translation && (
                    <p className={`text-xs mt-1 pt-1 border-t ${msg.speaker === 'ai' ? 'border-slate-300 text-slate-600' : 'border-blue-400 text-blue-100'}`}>
                        {msg.translation}
                    </p>
                    )}
                </div>
                {msg.speaker === 'user' && msg.correction && (
                    <div className={`mt-2 p-2 rounded-lg text-left text-sm ${msg.correction.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                        {msg.correction.correctedText && (
                            <p className="mb-1">
                                <span className="font-semibold text-slate-700">Correção: </span>
                                <span className="text-slate-800">{msg.correction.correctedText}</span>
                            </p>
                        )}
                        <p className="text-slate-600">{msg.correction.feedback}</p>
                    </div>
                )}
                </div>
                {msg.speaker === 'ai' && (
                    <button
                        onClick={() => onSpeak(msg.text)}
                        className="self-center w-8 h-8 rounded-full hover:bg-slate-200 transition-colors flex-shrink-0 flex items-center justify-center"
                        aria-label={speakingText === msg.text ? "Parar leitura" : "Ouvir"}
                    >
                    {speakingText === msg.text ? <SoundWaveAnimation className="w-5 h-5" /> : <SpeakerWaveIcon className="w-5 h-5 text-slate-500" />}
                    </button>
                )}
            </div>
            ))}
            {isLoading && (
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <UserCircleIcon className="w-7 h-7 text-slate-500" />
                    </div>
                    <div className="p-3 rounded-lg bg-slate-200">
                        <SoundWaveAnimation />
                    </div>
                </div>
            )}
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
            <div ref={chatEndRef} />
        </div>
        <div className="p-4 border-t flex justify-center items-center">
            {recognitionError ? (
                <p className="text-red-600 text-center">{recognitionError}</p>
            ) : (
                <div className="flex flex-col items-center">
                    <button
                        onClick={handleMicToggle}
                        disabled={isLoading}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 text-white shadow-lg disabled:opacity-50
                        ${isListening 
                            ? 'bg-red-600 hover:bg-red-700 animate-pulse scale-105' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        aria-label={isListening ? "Parar gravação" : "Falar"}
                    >
                        {isListening ? (
                             <div className="w-6 h-6 bg-white rounded-sm"></div>
                        ) : (
                             <MicrophoneIcon className="w-8 h-8" />
                        )}
                    </button>
                    <p className={`text-sm font-bold mt-2 ${isListening ? 'text-red-600' : 'text-slate-500'}`}>
                        {isListening ? "Gravando... Clique para Parar" : "Toque para Falar"}
                    </p>
                </div>
            )}
        </div>
        </div>

        {/* Translator Section */}
        <div className="bg-slate-100 rounded-lg shadow-lg border border-slate-300 overflow-hidden">
            <div className="bg-slate-200 p-3 border-b border-slate-300 flex items-center gap-2">
                 <LanguageIcon className="w-5 h-5 text-slate-700" />
                 <span className="font-bold text-slate-800">Tradutor de Apoio</span>
            </div>
            <div className="p-4">
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <button 
                        onClick={() => setTransDirection('targetToPt')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-colors border shadow-sm ${transDirection === 'targetToPt' ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                    >
                        {getLangLabel(targetLanguage)} &rarr; Português
                    </button>
                    <button 
                        onClick={() => setTransDirection('ptToTarget')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-colors border shadow-sm ${transDirection === 'ptToTarget' ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                    >
                        Português &rarr; {getLangLabel(targetLanguage)}
                    </button>
                </div>

                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={transInput}
                        onChange={(e) => setTransInput(e.target.value)}
                        placeholder={transDirection === 'targetToPt' ? `Digite em ${getLangLabel(targetLanguage)}...` : "Digite em Português..."}
                        className="flex-1 w-full border border-slate-400 rounded px-3 py-2 text-base text-black bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder-slate-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleTranslate()}
                    />
                    <button 
                        onClick={handleTranslate}
                        disabled={transLoading || !transInput.trim()}
                        className="bg-slate-800 text-white px-6 py-2 rounded font-bold hover:bg-slate-900 disabled:opacity-50 shadow-md transition-transform active:scale-95"
                    >
                        {transLoading ? '...' : 'Traduzir'}
                    </button>
                </div>
                
                {transOutput && (
                    <div className="mt-3 p-4 bg-white border-l-4 border-yellow-500 shadow-sm rounded-r-lg">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Resultado:</p>
                        <p className="text-slate-900 font-medium text-lg">{transOutput}</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default ConversationComponent;
