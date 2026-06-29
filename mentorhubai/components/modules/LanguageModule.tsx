
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Globe, BookOpen, MessageSquare, ExternalLink, PlayCircle, Sparkles, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../../types';
import { generateChatResponse, generateDailyTip } from '../../services/geminiService';

const LanguageModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'course' | 'chat'>('course');
  const [language, setLanguage] = useState<string>('Inglês');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Hello! I am your AI language tutor. How can I help you today?`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyWord, setDailyWord] = useState<string>('Loading phrase of the day...');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  useEffect(() => {
    const fetchWord = async () => {
      const tip = await generateDailyTip('language');
      setDailyWord(tip);
    };
    fetchWord();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const systemInstruction = `Você é um tutor de ${language}. Seja paciente, corrija erros gramaticais de forma gentil e incentive a conversa. Responda em ${language}, mas use português em parênteses se necessário para clareza.`;

    const responseText = await generateChatResponse([...messages, userMsg], systemInstruction);
    setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: Date.now() }]);
    setIsLoading(false);
  };

  const courses = [
    { id: 'en', name: 'English Hub', color: 'text-blue-400', bgColor: 'bg-blue-500/10', flag: '🇺🇸', url: "https://ai.studio/apps/drive/17oDThhO4TuNNqx3M0R67Ri7ylTKa5YeY" },
    { id: 'es', name: 'Spanish Hub', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', flag: '🇪🇸', url: "https://ai.studio/apps/drive/17oDThhO4TuNNqx3M0R67Ri7ylTKa5YeY" },
    { id: 'it', name: 'Italian Hub', color: 'text-green-400', bgColor: 'bg-green-500/10', flag: '🇮🇹', url: "https://ai.studio/apps/drive/17oDThhO4TuNNqx3M0R67Ri7ylTKa5YeY" }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Tab Switcher */}
      <div className="p-4 border-b border-gray-800 bg-gray-900 shrink-0">
        <div className="flex p-1 bg-gray-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('course')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'course' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}
          >
            <BookOpen size={14} /> Material de Estudo
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}
          >
            <MessageSquare size={14} /> Tutor AI
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'chat' ? (
          <div className="flex flex-col h-full">
            <div className="p-2 border-b border-gray-800 bg-gray-800/20 flex justify-center">
               <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-xs font-bold border-none focus:ring-0 text-blue-400 uppercase tracking-widest"
              >
                <option value="Inglês">Inglês</option>
                <option value="Espanhol">Espanhol</option>
                <option value="Italiano">Italiano</option>
              </select>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-tl-none'}`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && <div className="animate-pulse text-blue-400 text-[10px] font-bold uppercase tracking-widest">Tutor está digitando...</div>}
            </div>
            <div className="p-4 bg-gray-900 border-t border-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={`Mande um "Oi" em ${language}...`}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-5 py-3 focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
                <button onClick={handleSend} disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-3 w-12 h-12 flex items-center justify-center disabled:opacity-50">
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-6 space-y-8 animate-fade-in">
            {/* Daily Phrase Card */}
            <div className="bg-gradient-to-br from-blue-900/40 to-gray-800/40 border border-blue-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
               <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-blue-400" />
                  <span className="text-[10px] font-bold text-blue-300 uppercase tracking-[0.2em]">Pílula de Conhecimento</span>
               </div>
               <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-medium italic">
                  {dailyWord}
               </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Escolha seu curso</h3>
              <div className="grid grid-cols-1 gap-4">
                {courses.map((course) => (
                  <a key={course.id} href={course.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-gray-800 rounded-2xl border border-gray-700 hover:border-blue-500/50 hover:bg-gray-750 transition-all group">
                    <div className={`w-14 h-14 rounded-2xl ${course.bgColor} flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform`}>
                      {course.flag}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{course.name}</h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Clique para abrir material completo</p>
                    </div>
                    <ExternalLink size={18} className="text-gray-600 group-hover:text-white" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageModule;
