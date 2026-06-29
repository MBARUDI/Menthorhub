import React from 'react';
import { Quote, RefreshCw, Loader2 } from 'lucide-react';

interface MessageCardProps {
  message: string;
  loading: boolean;
  onRefresh: () => void;
}

export const MessageCard: React.FC<MessageCardProps> = ({ message, loading, onRefresh }) => {
  return (
    <div className="w-full max-w-md aspect-square relative group">
      {/* Decorative background glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-gold-400 to-yellow-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
      
      {/* Main Card */}
      <div className="relative w-full h-full glass-card rounded-xl p-8 flex flex-col items-center justify-between shadow-2xl text-center border-t border-white/10">
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <Quote className="w-10 h-10 text-gold-400 mb-6 opacity-80" />
          
          <div className="min-h-[120px] flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-3 animate-pulse">
                <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
                <span className="text-sm text-gray-400 font-sans tracking-wide">Buscando inspiração...</span>
              </div>
            ) : (
              <p className="text-xl md:text-2xl font-serif text-white leading-relaxed drop-shadow-md">
                "{message}"
              </p>
            )}
          </div>
          
          <div className="w-16 h-1 bg-gold-500/50 rounded-full mt-8 mb-2"></div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="group/btn relative px-8 py-3 bg-transparent overflow-hidden rounded-full border border-gold-500/30 hover:border-gold-400 transition-all duration-300"
        >
          <div className="absolute inset-0 w-0 bg-gold-500/10 transition-all duration-[250ms] ease-out group-hover/btn:w-full"></div>
          <span className="relative flex items-center gap-2 text-sm uppercase tracking-widest font-sans font-bold text-gold-400 group-hover/btn:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Nova Mensagem
          </span>
        </button>
      </div>
    </div>
  );
};