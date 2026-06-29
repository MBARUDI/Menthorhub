import React, { useState } from 'react';
import { Cycle } from '../types';
import { suggestImprovements } from '../services/geminiService';
import { Lightbulb, Loader2, Save } from 'lucide-react';
import SpeechMic from './SpeechMic';

interface ActStageProps {
  cycle: Cycle;
  onUpdate: (updatedCycle: Cycle) => void;
  onComplete: () => void;
  onBack: () => void;
}

const ActStage: React.FC<ActStageProps> = ({ cycle, onUpdate, onComplete, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    try {
      const suggestions = await suggestImprovements(cycle);
      onUpdate({ ...cycle, actAiSuggestions: suggestions });
    } finally {
      setIsLoading(false);
    }
  };

  const appendToImprovements = (text: string) => {
    const current = cycle.actImprovements || '';
    const newText = current ? `${current} ${text}` : text;
    onUpdate({ ...cycle, actImprovements: newText });
  };

  const appendToNextSteps = (text: string) => {
    const current = cycle.actNextSteps || '';
    const newText = current ? `${current} ${text}` : text;
    onUpdate({ ...cycle, actNextSteps: newText });
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-50 p-4 rounded-lg border border-red-100">
        <h3 className="font-semibold text-red-800 mb-2">Fase de Ação (ACT)</h3>
        <p className="text-sm text-red-700">Padronize o que deu certo e corrija o que deu errado para o próximo ciclo.</p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
             <label className="block text-sm font-medium text-gray-700">Ações de Melhoria</label>
             <SpeechMic onTranscript={appendToImprovements} />
          </div>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none h-24 resize-none"
            placeholder="O que vou fazer diferente na próxima vez? (Use o microfone se preferir)"
            value={cycle.actImprovements || ''}
            onChange={(e) => onUpdate({ ...cycle, actImprovements: e.target.value })}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
             <label className="block text-sm font-medium text-gray-700">Próximos Passos</label>
             <SpeechMic onTranscript={appendToNextSteps} />
          </div>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none h-24 resize-none"
            placeholder="Ações imediatas para padronizar o sucesso."
            value={cycle.actNextSteps || ''}
            onChange={(e) => onUpdate({ ...cycle, actNextSteps: e.target.value })}
          />
        </div>

        <button
          onClick={handleGetSuggestions}
          disabled={isLoading}
          className="text-sm text-orange-600 font-medium flex items-center gap-1 hover:text-orange-800 transition-colors"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
          Pedir sugestões para o próximo ciclo
        </button>

        {cycle.actAiSuggestions && (
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-md">
            <h4 className="font-semibold text-orange-800 text-sm mb-2">Sugestões da IA</h4>
            <p className="text-sm text-orange-900 whitespace-pre-wrap">{cycle.actAiSuggestions}</p>
          </div>
        )}
      </div>

      <div className="pt-4 border-t flex justify-between">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900 px-4 py-2">
          &larr; Voltar
        </button>
        <button
          onClick={onComplete}
          className="bg-gray-800 text-white px-6 py-2 rounded-md font-medium hover:bg-gray-900 flex items-center gap-2 transition-colors"
        >
          <Save className="w-4 h-4" />
          Finalizar Ciclo
        </button>
      </div>
    </div>
  );
};

export default ActStage;