import React from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { AnalysisResult } from '../types';
import ReactMarkdown from 'react-markdown';

interface AIAdvisorProps {
  onAnalyze: () => void;
  result: AnalysisResult;
  hasData: boolean;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ onAnalyze, result, hasData }) => {
  return (
    <div className="mt-12 bg-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-32 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="text-yellow-300 w-6 h-6" />
          <h2 className="text-2xl font-bold">Assistente Financeiro Inteligente</h2>
        </div>
        
        <p className="text-indigo-200 mb-8 max-w-2xl">
          Use a inteligência artificial para analisar seus padrões, identificar sabotadores ocultos e validar se sua próxima compra está alinhada com seus objetivos de vida.
        </p>

        {!result.markdown && !result.loading && (
          <button
            onClick={onAnalyze}
            disabled={!hasData}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all shadow-lg
              ${hasData 
                ? 'bg-white text-indigo-900 hover:bg-indigo-50 hover:scale-105 cursor-pointer' 
                : 'bg-indigo-800 text-indigo-400 cursor-not-allowed'}
            `}
          >
            <Sparkles size={18} />
            {hasData ? 'Analisar meu Perfil e Respostas' : 'Preencha os dados acima para analisar'}
          </button>
        )}

        {result.loading && (
          <div className="flex items-center gap-3 text-indigo-200 animate-pulse">
            <Loader2 className="animate-spin" />
            <span>Analisando suas respostas com Gemini...</span>
          </div>
        )}

        {result.error && (
          <div className="flex items-center gap-3 text-red-300 bg-red-900/50 p-4 rounded-lg border border-red-700">
            <AlertCircle />
            <span>{result.error}</span>
          </div>
        )}

        {result.markdown && !result.loading && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 animate-fade-in text-indigo-50 prose prose-invert prose-p:leading-relaxed prose-headings:text-yellow-300">
            <ReactMarkdown>{result.markdown}</ReactMarkdown>
            <button 
              onClick={onAnalyze}
              className="mt-6 text-sm text-indigo-300 hover:text-white underline underline-offset-4"
            >
              Gerar nova análise
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAdvisor;