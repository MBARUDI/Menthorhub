import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
      <div 
        className="bg-brand-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
        style={{ width: `${progress}%` }}
      ></div>
      <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
        <span>Início</span>
        <span>Conclusão</span>
      </div>
    </div>
  );
};