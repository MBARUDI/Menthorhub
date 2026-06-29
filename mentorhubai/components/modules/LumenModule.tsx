import React, { useState, useEffect, useCallback } from 'react';
import { Quote, RefreshCw, Loader2, Cross, Flame } from 'lucide-react';
import { generateLumenMessage } from '../../services/geminiService';

export default function LumenModule() {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMessage = useCallback(async () => {
    setLoading(true);
    try {
      const msg = await generateLumenMessage();
      setMessage(msg);
    } catch (error) {
      console.error(error);
      setMessage("Mantenha a fé e trabalhe duro; a luz divina guia os passos de quem busca a excelência com o coração puro.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessage();
  }, [fetchMessage]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 relative overflow-hidden text-white font-lato">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gold-400/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header / Brand */}
      <header className="flex flex-col items-center gap-3 mb-10 text-center select-none opacity-90 z-10 animate-fade-in">
        <div className="p-4 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-gold-400">
          <Cross className="w-8 h-8 filter drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-cinzel text-white tracking-[0.25em] font-light mt-2 drop-shadow-md">
          LUMEN
        </h2>
        <p className="text-[10px] text-gray-500 font-sans tracking-[0.3em] uppercase font-black">
          Fé &bull; Negócios &bull; Propósito
        </p>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex items-center justify-center z-10 max-w-lg">
        <div className="w-full aspect-square md:aspect-[4/3] relative group">
          {/* Decorative background glow on card hover */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-gold-400 to-yellow-600 rounded-[2.5rem] blur opacity-15 group-hover:opacity-30 transition duration-1000 group-hover:duration-300"></div>
          
          {/* Main Glass Card */}
          <div className="relative w-full h-full bg-android-surface/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 flex flex-col items-center justify-between shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] text-center">
            
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <Quote className="w-12 h-12 text-gold-400 mb-8 opacity-40 filter drop-shadow-[0_0_4px_rgba(212,175,55,0.2)]" />
              
              <div className="min-h-[140px] flex items-center justify-center px-4 w-full">
                {loading ? (
                  <div className="flex flex-col items-center gap-4 animate-pulse">
                    <Loader2 className="w-10 h-10 text-gold-400 animate-spin" />
                    <span className="text-xs text-gray-400 font-sans tracking-widest font-black uppercase">Buscando inspiração...</span>
                  </div>
                ) : (
                  <p className="text-lg md:text-xl font-cinzel text-white/95 leading-relaxed tracking-wide drop-shadow-md font-medium select-text">
                    "{message}"
                  </p>
                )}
              </div>
              
              <div className="w-20 h-0.5 bg-gold-400/25 rounded-full mt-8 mb-2"></div>
            </div>

            {/* Premium Button */}
            <button
              onClick={fetchMessage}
              disabled={loading}
              className="group/btn relative px-8 py-3.5 bg-transparent overflow-hidden rounded-2xl border border-gold-400/20 hover:border-gold-400 transition-all duration-300 active:scale-95 select-none disabled:opacity-40 disabled:pointer-events-none"
            >
              <div className="absolute inset-0 w-0 bg-gold-400/10 transition-all duration-[300ms] ease-out group-hover/btn:w-full"></div>
              <span className="relative flex items-center gap-2 text-xs uppercase tracking-widest font-sans font-black text-gold-400 group-hover/btn:text-white transition-colors">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Nova Mensagem
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 text-center opacity-30 hover:opacity-60 transition-opacity duration-300 z-10 select-none">
        <p className="text-[10px] text-white tracking-[0.2em] font-sans font-bold uppercase">
          Inspirado pela Tradição &bull; Impulsionado pela Tecnologia
        </p>
      </footer>
    </div>
  );
}
