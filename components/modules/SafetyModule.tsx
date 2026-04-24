import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Book, Menu, X } from 'lucide-react';
import { ChatMessage } from '../../types';
import { generateChatResponse } from '../../services/geminiService';

const SafetyModule: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Olá! Sou o Chatbot NR. Posso ajudar com dúvidas sobre as Normas Regulamentadoras de Segurança e Saúde no Trabalho.', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // For mobile toggle
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate list of NRs 1-38
  const nrs = Array.from({ length: 38 }, (_, i) => i + 1);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getNrUrl = (nr: number) => {
    // Fallback generic URL since gov.br links change frequently, but trying a standard pattern
    return `https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/seguranca-e-saude-no-trabalho/ctpp-nrs/normas-regulamentadoras-nrs/norma-regulamentadora-no-${nr}-nr-${nr}`;
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Logic for "Lista todas"
    if (textToSend.toLowerCase().includes('lista todas')) {
      const listText = nrs.map(n => `NR-${n}`).join(', ');
      const botMsg: ChatMessage = { 
        role: 'model', 
        text: `📚 **Lista de NRs:**\n\n${listText}\n\nSelecione uma no menu ao lado para ver detalhes ou pergunte especificamente (ex: "Resuma a NR 10").`, 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, botMsg]);
      setIsLoading(false);
      return;
    }

    // Check if user is asking about a specific NR to add context
    const nrMatch = textToSend.match(/nr[-\s]?(\d+)/i);
    let systemPrompt = "Você é um especialista em Segurança do Trabalho e Normas Regulamentadoras (NRs) do Brasil. Responda de forma clara, objetiva e técnica.";
    
    if (nrMatch) {
      const nrNum = nrMatch[1];
      systemPrompt += ` O usuário está perguntando sobre a NR-${nrNum}. Utilize seu conhecimento interno para resumir os pontos chave desta norma. Se não souber detalhes específicos recentes, forneça um resumo geral do objetivo da norma. Sempre mencione que a consulta oficial deve ser feita no site do governo.`;
    }

    const responseText = await generateChatResponse([...messages, userMsg], systemPrompt);
    
    // Append link if an NR was detected
    let finalResponse = responseText;
    if (nrMatch) {
      const nrNum = parseInt(nrMatch[1]);
      if (nrNum >= 1 && nrNum <= 38) {
        finalResponse += `\n\n🔗 [Acesse a NR-${nrNum} oficial](${getNrUrl(nrNum)})`;
      }
    }

    const botMsg: ChatMessage = { role: 'model', text: finalResponse, timestamp: Date.now() };
    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleNrClick = (nr: number) => {
    handleSend(`Resuma a NR ${nr} e me explique seus principais pontos.`);
    if (window.innerWidth < 768) setShowMenu(false); // Close menu on mobile after click
  };

  return (
    <div className="flex h-full bg-gray-900 text-white overflow-hidden">
      {/* Sidebar / Menu - Hidden on mobile unless toggled */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out
        ${showMenu ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:flex md:flex-col
      `}>
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-teal-900/20">
          <h2 className="font-bold text-lg flex items-center gap-2 text-teal-400">
            <Book size={20} /> NRs
          </h2>
          <button onClick={() => setShowMenu(false)} className="md:hidden text-gray-400">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          <ul className="space-y-1">
            {nrs.map(nr => (
              <li key={nr}>
                <button
                  onClick={() => handleNrClick(nr)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-teal-500/10 hover:text-teal-400 transition-colors text-sm font-medium border border-transparent hover:border-teal-500/30 flex justify-between items-center group"
                >
                  <span>NR-{nr}</span>
                  <span className="opacity-0 group-hover:opacity-100 text-xs text-teal-500">Ver resumo</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative w-full">
        {/* Mobile Header Toggle */}
        <div className="md:hidden p-2 absolute top-2 left-2 z-20">
          <button 
            onClick={() => setShowMenu(true)}
            className="bg-gray-800 p-2 rounded-full shadow-lg border border-gray-700 text-teal-400"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Chat Header */}
        <div className="p-4 bg-gray-900 border-b border-gray-800 text-center shrink-0 z-10">
          <h1 className="text-xl font-bold text-white flex items-center justify-center gap-2">
            <Bot className="text-teal-400" /> Chatbot NR
          </h1>
          <p className="text-xs text-gray-500">Assistente de Segurança do Trabalho</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl shadow-md ${
                msg.role === 'user' 
                  ? 'bg-teal-600 text-white rounded-tr-none' 
                  : 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700'
              }`}>
                <div className="flex items-center gap-2 mb-2 opacity-70 text-xs uppercase tracking-wider font-bold">
                  {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                  <span>{msg.role === 'user' ? 'Você' : 'Gemini AI'}</span>
                </div>
                <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap leading-relaxed">
                  {/* Render simple markdown-like links manually or just text */}
                  {msg.text.split('🔗').map((part, i) => {
                      if (i === 0) return part;
                      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                      if (linkMatch) {
                          return (
                              <React.Fragment key={i}>
                                  <br/><br/>🔗 <a href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-teal-400 underline hover:text-teal-300 font-medium">{linkMatch[1]}</a>
                              </React.Fragment>
                          );
                      }
                      return part;
                  })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start">
                <div className="bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-700 flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-900 border-t border-gray-800 shrink-0">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua pergunta ou o número da NR..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-5 py-3 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder-gray-500"
            />
            <button 
              onClick={() => handleSend()}
              disabled={isLoading}
              className="bg-teal-600 hover:bg-teal-500 text-white rounded-xl p-3 w-12 flex items-center justify-center transition-colors shadow-lg shadow-teal-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
            <button
              onClick={() => handleSend("lista todas")}
              className="bg-gray-800 hover:bg-gray-700 text-teal-400 border border-gray-700 rounded-xl px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap hidden sm:block"
            >
              📚 Listar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyModule;