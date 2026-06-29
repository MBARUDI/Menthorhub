import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

interface StepCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isValid?: boolean;
}

export const StepCard: React.FC<StepCardProps> = ({
  title,
  subtitle,
  children,
  onNext,
  onPrev,
  isFirst = false,
  isLast = false,
  isValid = true
}) => {
  return (
    <div className="bg-paper shadow-xl rounded-2xl overflow-hidden border border-stone-200 max-w-2xl w-full mx-auto paper-shadow flex flex-col min-h-[60vh]">
      <div className="bg-brand-600 p-6 text-white">
        <h2 className="text-2xl font-serif font-bold">{title}</h2>
        {subtitle && <p className="text-brand-100 mt-2 text-sm">{subtitle}</p>}
      </div>
      
      <div className="p-6 md:p-8 flex-grow flex flex-col justify-center">
        {children}
      </div>

      <div className="p-6 bg-stone-50 border-t border-stone-200 flex justify-between items-center">
        {!isFirst ? (
          <button
            onClick={onPrev}
            className="flex items-center text-stone-600 hover:text-brand-700 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-stone-200"
          >
            <ChevronLeft size={20} className="mr-1" />
            Voltar
          </button>
        ) : (
          <div></div> 
        )}

        <button
          onClick={onNext}
          disabled={!isValid}
          className={`flex items-center px-6 py-3 rounded-xl font-bold text-white transition-all shadow-md
            ${isValid 
              ? 'bg-brand-600 hover:bg-brand-700 hover:shadow-lg transform hover:-translate-y-0.5' 
              : 'bg-stone-400 cursor-not-allowed opacity-70'
            }`}
        >
          {isLast ? 'Finalizar' : 'Próximo'}
          {isLast ? <CheckCircle size={20} className="ml-2" /> : <ChevronRight size={20} className="ml-2" />}
        </button>
      </div>
    </div>
  );
};