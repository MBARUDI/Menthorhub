import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Globe, BookOpen, MessageSquare, ExternalLink, PlayCircle } from 'lucide-react';
import { ChatMessage } from '../../types';
import { generateChatResponse } from '../../services/geminiService';

const LanguageModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'course' | 'chat'>('course');
  // Default to Inglês
  const [language, setLanguage] = useState<string>('Inglês');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Hello! I am your AI language tutor. Let's practice English.`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Map display name to system prompt language
    const langMap: Record<string, string> = {
      'Inglês': 'English',
      'Espanhol': 'Spanish',
      'Italiano': 'Italian'
    };

    const targetLang = langMap[language] || 'English';

    const systemInstruction = `You are a helpful, patient language tutor teaching ${targetLang}. 
    Correct the user's grammar gently if they make mistakes. 
    Keep the conversation engaging but educational. 
    Respond primarily in ${targetLang}, but provide translations in parentheses if the concept is complex.`;

    const historyForApi = [...messages, userMsg];
    const responseText = await generateChatResponse(historyForApi, systemInstruction);

    const botMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    let greeting = "";
    switch(newLang) {
      case 'Espanhol': greeting = "¡Hola! Soy tu tutor de español. ¿Cómo puedo ayudarte?"; break;
      case 'Italiano': greeting = "Ciao! Sono il tuo tutor di italiano. Come posso aiutarti?"; break;
      default: greeting = "Hello! I am your English tutor. How can I help?";
    }
    setMessages([{ role: 'model', text: greeting, timestamp: Date.now() }]);
  };

  // Configuration for the Course Material Icons
  const courses = [
    { 
      id: 'en', 
      name: 'Inglês', 
      color: 'text-blue-400', 
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      flag: '🇺🇸',
      url: "https://ai.studio/apps/drive/17oDThhO4TuNNqx3M0R67Ri7ylTKa5YeY?fullscreenApplet=true"
    },
    { 
      id: 'es', 
      name: 'Espanhol', 
      color: 'text-yellow-400', 
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      flag: '🇪🇸',
      url: "https://ai.studio/apps/drive/17oDThhO4TuNNqx3M0R67Ri7ylTKa5YeY?fullscreenApplet=true"
    },
    { 
      id: 'it', 
      name: 'Italiano', 
      color: 'text-green-400', 
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      flag: '🇮🇹',
      url: "https://ai.studio/apps/drive/17oDThhO4TuNNqx3M0R67Ri7ylTKa5YeY?fullscreenApplet=true"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900 flex flex-col gap-3 shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Globe className="text-blue-400" /> 
            Language Hub
          </h2>
          
          {activeTab === 'chat' && (
            <select 
              value={language} 
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 text-gray-200"
            >
              <option value="Inglês">Inglês</option>
              <option value="Espanhol">Espanhol</option>
              <option value="Italiano">Italiano</option>
            </select>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-gray-800 rounded-lg">
          <button
            onClick={() => setActiveTab('course')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'course' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <BookOpen size={16} />
            Course Material
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'chat' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <MessageSquare size={16} />
            AI Tutor
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'chat' ? (
          // Chat View
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-gray-800 text-gray-100 rounded-tl-none'
                  }`}>
                    <div className="flex items-center gap-2 mb-1 opacity-70 text-xs">
                      {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                      <span>{msg.role === 'user' ? 'You' : 'MentorAI'}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none animate-pulse">
                    Thinking...
                  </div>
                </div>
              )}
            </div>
            
            {/* Input Area */}
            <div className="p-4 bg-gray-900 border-t border-gray-800 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={`Type in ${language}...`}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Course View - Simplified Icons as requested
          <div className="h-full w-full flex flex-col items-center justify-center bg-gray-900 p-6 animate-fade-in">
            <div className="flex flex-row flex-wrap justify-center gap-8 w-full max-w-2xl">
              {courses.map((course) => (
                <a 
                  key={course.id}
                  href={course.url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-4 group cursor-pointer"
                >
                  <div className={`relative w-24 h-24 rounded-3xl ${course.bgColor} border ${course.borderColor} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:shadow-blue-500/20`}>
                    <Globe size={40} className={course.color} strokeWidth={1.5} />
                    {/* Flag Detail - Small symbol on the icon */}
                    <span className="absolute bottom-2 right-2 text-lg drop-shadow-md filter grayscale-[20%] group-hover:grayscale-0 transition-all">
                        {course.flag}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-300 group-hover:text-white tracking-wide transition-colors">
                    {course.name}
                  </h3>
                </a>
              ))}
            </div>
            
            <div className="mt-16 text-center opacity-40">
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Select a language</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageModule;