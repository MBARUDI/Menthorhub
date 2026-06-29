import React from 'react';
import { Cycle } from '../types';
import { CheckCircle2, Circle } from 'lucide-react';

interface DoStageProps {
  cycle: Cycle;
  onUpdate: (updatedCycle: Cycle) => void;
  onNext: () => void;
  onBack: () => void;
}

const DoStage: React.FC<DoStageProps> = ({ cycle, onUpdate, onNext, onBack }) => {
  const toggleTask = (taskId: string) => {
    onUpdate({
      ...cycle,
      tasks: cycle.tasks.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    });
  };

  const progress = Math.round((cycle.tasks.filter(t => t.completed).length / cycle.tasks.length) * 100) || 0;

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
        <h3 className="font-semibold text-yellow-800 mb-2">Fase de Execução (DO)</h3>
        <p className="text-sm text-yellow-700">Execute o que foi planejado. Marque as tarefas conforme forem concluídas.</p>
      </div>

      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-500">Progresso</span>
          <span className="text-sm font-bold text-blue-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="space-y-3">
        {cycle.tasks.map(task => (
          <div 
            key={task.id} 
            onClick={() => toggleTask(task.id)}
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${task.completed ? 'bg-green-50 border-green-200' : 'bg-white hover:bg-gray-50'}`}
          >
            {task.completed ? (
              <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
            ) : (
              <Circle className="w-6 h-6 text-gray-300 mr-3 flex-shrink-0" />
            )}
            <span className={`${task.completed ? 'text-green-800 line-through' : 'text-gray-800'}`}>
              {task.description}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t flex justify-between">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900 px-4 py-2">
          &larr; Voltar
        </button>
        <button
          onClick={onNext}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors"
        >
          Ir para Verificação (CHECK) &rarr;
        </button>
      </div>
    </div>
  );
};

export default DoStage;
