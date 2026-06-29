import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Sparkles, Send, Loader2, Calendar, Award, 
  TrendingUp, RefreshCw, ChevronRight, Copy, Check, 
  BookHeart, Trash2, HeartHandshake, Smile, Star, Shield,
  History
} from 'lucide-react';
import { generateChatResponse } from '../../services/geminiService';
import { ChatMessage } from '../../types';

// Simple premium UI components local to the module
const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div className={`bg-android-surface/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div className={className}>{children}</div>
);

const Label: React.FC<{ htmlFor?: string; className?: string; children: React.ReactNode }> = ({ htmlFor, className = "", children }) => (
  <label htmlFor={htmlFor} className={`text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 ml-1 ${className}`}>
    {children}
  </label>
);

const ScrollArea: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div className={`overflow-y-auto no-scrollbar custom-scrollbar ${className}`}>{children}</div>
);

const Button: React.FC<{ 
  className?: string; 
  variant?: 'default' | 'outline' | 'ghost' | 'rose'; 
  size?: 'default' | 'sm' | 'icon'; 
  onClick?: () => void; 
  disabled?: boolean; 
  children: React.ReactNode 
}> = ({ className = "", variant = 'default', size = 'default', onClick, disabled, children }) => {
  const base = "inline-flex items-center justify-center font-black rounded-2xl transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none tracking-tight select-none";
  const variants = {
    default: "bg-android-accent text-android-bg hover:bg-android-accent/90 shadow-lg shadow-android-accent/5",
    outline: "border border-white/10 hover:bg-white/5 hover:border-white/20 text-white",
    ghost: "hover:bg-white/5 text-gray-500 hover:text-white",
    rose: "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-950/20"
  };
  const sizes = {
    default: "px-6 py-3.5 text-sm",
    sm: "px-4 py-2 text-xs",
    icon: "p-3 w-11 h-11"
  };
  return (
    <button disabled={disabled} onClick={onClick} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = "", ...props }) => (
  <input className={`w-full bg-white/5 border border-white/5 focus:border-rose-500/40 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 font-bold transition-all ${className}`} {...props} />
);

const GratitudeModule: React.FC = () => {
  const [items, setItems] = useState({ item1: "", item2: "", item3: "" });
  const [category, setCategory] = useState<'personal' | 'professional' | 'spiritual' | 'relationships'>('personal');
  const [mood, setMood] = useState<'happy' | 'peaceful' | 'excited' | 'grateful'>('grateful');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [mentoringFeedback, setMentoringFeedback] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [dailyQuote, setDailyQuote] = useState("A gratidão transforma o que temos em suficiente.");
  const [loadingQuote, setLoadingQuote] = useState(false);
  
  const [history, setHistory] = useState<Array<{
    id: number;
    items: string[];
    category: string;
    mood: string;
    feedback: string;
    date: string;
  }>>([]);

  const [copySuccess, setCopySuccess] = useState(false);

  // Load quote and history
  const fetchDailyQuote = async () => {
    setLoadingQuote(true);
    try {
      const historyMock: ChatMessage[] = [{ role: 'user', text: 'Gere uma mensagem inspiradora e profunda sobre a prática da gratidão e psicologia positiva. Seja curto (máximo 2 linhas).', timestamp: Date.now() }];
      const response = await generateChatResponse(historyMock, "Você é um mentor espiritual e psicólogo focado em bem-estar.");
      setDailyQuote(response.replace(/"/g, ''));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQuote(false);
    }
  };

  useEffect(() => {
    fetchDailyQuote();
    const saved = JSON.parse(localStorage.getItem('gratitude_history') || '[]');
    setHistory(saved);
  }, []);

  const handleCopy = () => {
    if (!mentoringFeedback) return;
    navigator.clipboard.writeText(mentoringFeedback);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleReset = () => {
    setItems({ item1: "", item2: "", item3: "" });
    setMentoringFeedback(null);
    setError("");
  };

  const handleDelete = (id: number) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('gratitude_history', JSON.stringify(updated));
  };

  const handleSubmit = async () => {
    if (!items.item1.trim() || !items.item2.trim() || !items.item3.trim()) {
      setError("Por favor, preencha as 3 gratidões do dia!");
      return;
    }
    
    setIsGenerating(true);
    setError("");
    setMentoringFeedback(null);

    const gratitudeText = `
    1. ${items.item1}
    2. ${items.item2}
    3. ${items.item3}
    `;

    try {
      const chatHistory: ChatMessage[] = [
        {
          role: 'user',
          text: `Eu sou grato por hoje pelas seguintes coisas:
          ${gratitudeText}
          A categoria principal é ${category} e estou me sentindo ${mood}. 
          Forneça uma análise empática deste diário de gratidão na perspectiva de mentoria de bem-estar. Destaque os pontos psicológicos positivos implícitos nessas afirmações de forma carinhosa e sugira um pequeno exercício/desafio prático baseado no que descrevi para que eu possa cultivar ainda mais esse estado mental.`,
          timestamp: Date.now()
        }
      ];

      const systemPrompt = `Você é o "Gratitude Strategist", um mentor de psicologia positiva e desenvolvimento pessoal de alta performance. 
      Sua missão é dar um feedback de mentoria de alta qualidade (em português brasileiro), acolhedor, profundo e inspirador sobre as gratidões diárias escritas pelo usuário.
      Estruture sua resposta de forma limpa usando Markdown:
      
      ### 🌟 Insights da Mentoria
      (Uma análise com psicologia positiva das gratidões do usuário, identificando forças de caráter e valores demonstrados)
      
      ### 🎯 Desafio de Desenvolvimento
      (Um desafio prático específico e personalizado para o dia baseado no relato dele)
      
      ### 🧘 Sabedoria Diária
      (Uma frase de poder ou pensamento motivacional)
      
      Evite ser genérico ou excessivamente formal. Fale como um mentor próximo. Proibido LaTeX ou formatação científica complexa.`;

      const feedback = await generateChatResponse(chatHistory, systemPrompt);
      setMentoringFeedback(feedback);

      // Save to history
      const newEntry = {
        id: Date.now(),
        items: [items.item1, items.item2, items.item3],
        category: category,
        mood: mood,
        feedback: feedback,
        date: new Date().toLocaleDateString('pt-BR')
      };
      
      const updatedHistory = [newEntry, ...history].slice(0, 20);
      setHistory(updatedHistory);
      localStorage.setItem('gratitude_history', JSON.stringify(updatedHistory));
      
    } catch (e: any) {
      console.error(e);
      setError("Ocorreu um erro ao obter os insights da mentoria.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-fade-in text-white">
      <div className="xl:col-span-3 grid gap-6">
        
        {/* Daily Quote Card */}
        <Card className="bg-gradient-to-br from-rose-950/20 via-android-surface/40 to-purple-950/10 border-rose-500/10">
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-[60px]" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-rose-500/10 p-2.5 rounded-xl text-rose-400 border border-rose-500/20">
                <BookHeart size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-rose-400 uppercase tracking-[0.3em]">Sabedoria Diária</p>
                <p className="text-[11px] text-gray-500 font-bold">Insight para Alimentar a Mente</p>
              </div>
            </div>
            <button 
              onClick={fetchDailyQuote} 
              disabled={loadingQuote}
              className={`p-2.5 bg-white/5 rounded-xl border border-white/5 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all ${loadingQuote ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={14} />
            </button>
          </div>
          <p className="text-base md:text-lg text-white font-medium italic leading-relaxed">
            "{dailyQuote}"
          </p>
        </Card>

        {/* Strategic Journal Entry */}
        <Card className="border-white/5 relative overflow-hidden">
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="bg-rose-500 p-2.5 rounded-xl text-white shadow-lg shadow-rose-600/10">
              <Heart size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-rose-300">Meu Diário de Gratidão</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Escreva 3 conquistas ou motivos de gratidão hoje</p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-3">
              <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3.5 border border-white/5">
                <span className="text-rose-400 font-mono font-bold text-sm">01</span>
                <input 
                  type="text" 
                  value={items.item1}
                  onChange={e => setItems({...items, item1: e.target.value})}
                  placeholder="Ex: Pelo suporte da minha equipe no projeto de hoje..."
                  className="bg-transparent text-sm w-full focus:outline-none text-white font-bold"
                />
              </div>
              <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3.5 border border-white/5">
                <span className="text-rose-400 font-mono font-bold text-sm">02</span>
                <input 
                  type="text" 
                  value={items.item2}
                  onChange={e => setItems({...items, item2: e.target.value})}
                  placeholder="Ex: Pela conversa profunda e acolhedora com minha família..."
                  className="bg-transparent text-sm w-full focus:outline-none text-white font-bold"
                />
              </div>
              <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3.5 border border-white/5">
                <span className="text-rose-400 font-mono font-bold text-sm">03</span>
                <input 
                  type="text" 
                  value={items.item3}
                  onChange={e => setItems({...items, item3: e.target.value})}
                  placeholder="Ex: Pela minha saúde e disposição para caminhar esta tarde..."
                  className="bg-transparent text-sm w-full focus:outline-none text-white font-bold"
                />
              </div>
            </div>

            {/* Category and Mood selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <Label>Área Foco Principal</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'personal', label: 'Pessoal', emoji: '🧘' },
                    { id: 'professional', label: 'Carreira', emoji: '💼' },
                    { id: 'spiritual', label: 'Conexão', emoji: '✨' },
                    { id: 'relationships', label: 'Relações', emoji: '🤝' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id as any)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${category === cat.id ? "bg-rose-500 border-rose-500 text-white" : "bg-white/5 border-white/5 text-gray-500 hover:text-white"}`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Como você se sente?</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'grateful', label: 'Grato', emoji: '🙏' },
                    { id: 'peaceful', label: 'Em Paz', emoji: '🍃' },
                    { id: 'happy', label: 'Feliz', emoji: '😊' },
                    { id: 'excited', label: 'Motivado', emoji: '🔥' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMood(m.id as any)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${mood === m.id ? "bg-purple-600 border-purple-600 text-white" : "bg-white/5 border-white/5 text-gray-500 hover:text-white"}`}
                    >
                      {m.emoji} {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-red-400 mt-2 bg-red-950/20 border border-red-500/20 p-4 rounded-xl">
                ⚠️ {error}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <Button variant="outline" onClick={handleReset}>
                Limpar Campos
              </Button>
              <Button 
                variant="rose" 
                onClick={handleSubmit} 
                disabled={isGenerating || !items.item1.trim() || !items.item2.trim() || !items.item3.trim()}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Gerando Mentoria...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Receber Mentoria IA
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* AI Mentoring Response */}
        {mentoringFeedback && (
          <Card className="border-rose-500/15 bg-rose-950/5 relative overflow-hidden animate-slide-up">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px]" />
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5 px-2">
              <div className="flex items-center gap-3">
                <div className="bg-rose-500/10 p-2.5 rounded-xl text-rose-400 border border-rose-500/20">
                  <Star size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-rose-300">Mentoria de Gratidão</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Análise Personalizada Estratégica</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2 text-rose-400 hover:text-white">
                {copySuccess ? <Check size={14} /> : <Copy size={14} />}
                {copySuccess ? "Copiado!" : "Copiar Insight"}
              </Button>
            </div>

            <CardContent className="p-2">
              <ScrollArea className="max-h-[500px] pr-2">
                <div className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed font-medium space-y-4">
                  {mentoringFeedback}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar: History */}
      <div className="grid gap-6">
        <Card className="border-white/5 bg-white/5 h-full">
          <div className="border-b border-white/5 bg-black/20 px-6 py-4 rounded-t-[2rem]">
            <h3 className="text-xs font-black uppercase tracking-wider text-rose-300 flex items-center gap-2">
              <History size={14} /> Histórico do Diário
            </h3>
          </div>
          <CardContent className="p-4">
            {history.length === 0 ? (
              <div className="text-center py-16 text-gray-600 font-bold uppercase tracking-widest text-[9px]">
                Nenhum registro ainda
              </div>
            ) : (
              <ScrollArea className="max-h-[60vh] pr-1">
                <div className="grid gap-4">
                  {history.map((entry) => (
                    <div 
                      key={entry.id}
                      className="p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all group relative cursor-pointer"
                      onClick={() => {
                        setItems({
                          item1: entry.items[0] || "",
                          item2: entry.items[1] || "",
                          item3: entry.items[2] || ""
                        });
                        setCategory(entry.category as any);
                        setMood(entry.mood as any);
                        setMentoringFeedback(entry.feedback);
                      }}
                    >
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 hover:bg-white/5 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/10">
                          {entry.category === 'personal' ? '🧘 Pessoal' : entry.category === 'professional' ? '💼 Carreira' : entry.category === 'spiritual' ? '✨ Conexão' : '🤝 Relações'}
                        </span>
                        <span className="text-[9px] font-black text-gray-500 font-mono tracking-tighter">
                          {entry.date}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-200 truncate group-hover:text-rose-300 transition-colors">
                        1. {entry.items[0]}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate mt-1 leading-none">
                        2. {entry.items[1]}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GratitudeModule;
