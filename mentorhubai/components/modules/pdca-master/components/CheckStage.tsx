import React, { useState } from 'react';
import { Cycle } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { analyzePerformance } from '../services/geminiService';
import { BrainCircuit, Loader2 } from 'lucide-react';
import SpeechMic from './SpeechMic';

interface CheckStageProps {
  cycle: Cycle;
  onUpdate: (updatedCycle: Cycle) => void;
  onNext: () => void;
  onBack: () => void;
}

const CheckStage: React.FC<CheckStageProps> = ({ cycle, onUpdate, onNext, onBack }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const completedCount = cycle.tasks.filter(t => t.completed).length;
  const pendingCount = cycle.tasks.length - completedCount;

  const data = [
    { name: 'Concluído', value: completedCount },
    { name: 'Pendente', value: pendingCount },
  ];

  const COLORS = ['#10B981', '#E5E7EB'];

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzePerformance(cycle);
      onUpdate({ ...cycle, checkAiAnalysis: analysis });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const appendToObservations = (text: string) => {
    const current = cycle.checkObservations || '';
    const newText = current ? `${current} ${text}` : text;
    onUpdate({ ...cycle, checkObservations: newText });
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
        <h3 className="font-semibold text-purple-800 mb-2">Fase de Verificação (CHECK)</h3>
        <p className="text-sm text-purple-700">Analise os resultados obtidos versus o planejado.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart Section */}
        <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col items-center justify-center min-h-[250px]">
          <h4 className="text-sm font-semibold text-gray-600 mb-4">Taxa de Conclusão</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Observation Section */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Suas Observações</label>
              <SpeechMic onTranscript={appendToObservations} />
            </div>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 outline-none h-32 resize-none"
              placeholder="O que funcionou? O que deu errado? Escreva aqui ou use o microfone..."
              value={cycle.checkObservations || ''}
              onChange={(e) => onUpdate({ ...cycle, checkObservations: e.target.value })}
            />
          </div>
          
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2 rounded-md hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            {isAnalyzing ? <Loader2 className="animate-spin w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
            Analisar com IA
          </button>
        </div>
      </div>

      {cycle.checkAiAnalysis && (
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit className="w-5 h-5 text-indigo-600" />
            <h4 className="font-semibold text-indigo-800">Feedback da IA</h4>
          </div>
          <p className="text-sm text-indigo-900 whitespace-pre-wrap leading-relaxed">
            {cycle.checkAiAnalysis}
          </p>
        </div>
      )}

      <div className="pt-4 border-t flex justify-between">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900 px-4 py-2">
          &larr; Voltar
        </button>
        <button
          onClick={onNext}
          className="bg-orange-600 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-700 transition-colors"
        >
          Definir Ações (ACT) &rarr;
        </button>
      </div>
    </div>
  );
};

export default CheckStage;