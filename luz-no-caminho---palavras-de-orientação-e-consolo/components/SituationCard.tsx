
import React from 'react';
import { Situation } from '../types';

interface SituationCardProps {
  situation: Situation;
  onClick: (situation: Situation) => void;
}

const SituationCard: React.FC<SituationCardProps> = ({ situation, onClick }) => {
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Conforto': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Orientação': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Crescimento': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Oração': return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <button
      onClick={() => onClick(situation)}
      className="group relative flex flex-col p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 text-left w-full h-full"
    >
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mb-4 ${getCategoryColor(situation.category)}`}>
        {situation.category || 'Geral'}
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
        {situation.title}
      </h3>
      <p className="text-sm text-slate-500 line-clamp-2 italic">
        {situation.references}
      </p>
      <div className="mt-auto pt-4 flex items-center text-blue-600 font-medium text-sm">
        Ler reflexão
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
};

export default SituationCard;
