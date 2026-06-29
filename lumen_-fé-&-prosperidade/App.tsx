import React, { useState, useEffect, useCallback } from 'react';
import { MessageCard } from './components/MessageCard';
import { generateInspirationMessage } from './services/geminiService';
import { Cross } from 'lucide-react';

export default function App() {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMessage = useCallback(async () => {
    setLoading(true);
    try {
      const msg = await generateInspirationMessage();
      setMessage(msg);
    } catch (error) {
      console.error(error);
      setMessage("Ocorreu um erro ao buscar a mensagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-deepBlue-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black flex flex-col items-center justify-center p-4">
      
      {/* Header / Brand */}
      <header className="absolute top-8 md:top-12 flex flex-col items-center gap-2 opacity-90">
        <div className="p-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          <Cross className="w-6 h-6 text-gold-400" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-serif text-white tracking-[0.2em] font-light">
          LUMEN
        </h1>
        <p className="text-xs text-gray-400 font-sans tracking-widest uppercase">
          Fé &bull; Negócios &bull; Propósito
        </p>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex items-center justify-center z-10 mt-10 md:mt-0">
        <MessageCard 
          message={message} 
          loading={loading} 
          onRefresh={fetchMessage} 
        />
      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 text-center opacity-40 hover:opacity-80 transition-opacity">
        <p className="text-xs text-white font-sans">
          Inspirado pela Tradição • Impulsionado pela Tecnologia
        </p>
      </footer>
    </div>
  );
}