import React, { useState } from 'react';
import { Cycle, Task } from '../types';
import { generateTasksForGoal } from '../services/geminiService';
import { Plus, Trash2, Wand2, Loader2 } from 'lucide-react';
import SpeechMic from './SpeechMic';

interface PlanStageProps {
  cycle: Cycle;
  onUpdate: (updatedCycle: Cycle) => void;
  onNext: () => void;
}

const PlanStage: React.FC<PlanStageProps> = ({ cycle, onUpdate, onNext }) => {
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const addTask = () => {
    if (!newTaskDesc.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      description: newTaskDesc,
      completed: false
    };
    onUpdate({
      ...cycle,
      tasks: [...cycle.tasks, newTask]
    });
    setNewTaskDesc('');
  };

  const removeTask = (taskId: string) => {
    onUpdate({
      ...cycle,
      tasks: cycle.tasks.filter(t => t.id !== taskId)
    });
  };

  const handleAiSuggest = async () => {
    setIsLoadingAi(true);
    try {
      const suggestions = await generateTasksForGoal(cycle.goal);
      const newTasks: Task[] = suggestions.map(s => ({
        id: crypto.randomUUID(),
        description: s,
        completed: false
      }));
      onUpdate({
        ...cycle,
        tasks: [...cycle.tasks, ...newTasks]
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Helper to append text from speech
  const appendToGoal = (text: string) => {
    const current = cycle.goal;
    const newText = current ? `${current} ${text}` : text;
    onUpdate({ ...cycle, goal: newText });
  };

  const appendToTask = (text: string) => {
    setNewTaskDesc(prev => prev ? `${prev} ${text}` : text);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h3 className="font-semibold text-blue-800 mb-2">Fase de Planejamento (PLAN)</h3>
        <p className="text-sm text-blue-600">Defina claramente seu objetivo e quebre-o em tarefas menores.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo Principal</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={cycle.goal}
            onChange={(e) => onUpdate({ ...cycle, goal: e.target.value })}
            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ex: Ler 2 livros técnicos este mês"
          />
          <SpeechMic onTranscript={appendToGoal} />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Lista de Tarefas</label>
          <button
            onClick={handleAiSuggest}
            disabled={!cycle.goal || isLoadingAi}
            className="flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-100 hover:bg-purple-200 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
          >
            {isLoadingAi ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
            Sugerir com IA
          </button>
        </div>
        
        <div className="flex gap-2 mb-4 items-center">
          <div className="flex-1 flex gap-2">
             <input
              type="text"
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              className="flex-1 p-2 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500"
              placeholder="Nova tarefa..."
            />
            <SpeechMic onTranscript={appendToTask} />
          </div>
          
          <button
            onClick={addTask}
            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <ul className="space-y-2">
          {cycle.tasks.length === 0 && (
            <li className="text-gray-400 text-center text-sm py-4 italic">Nenhuma tarefa adicionada ainda.</li>
          )}
          {cycle.tasks.map(task => (
            <li key={task.id} className="flex justify-between items-center bg-white p-3 border rounded-md shadow-sm">
              <span className="text-gray-800">{task.description}</span>
              <button onClick={() => removeTask(task.id)} className="text-red-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-4 border-t flex justify-end">
        <button
          onClick={onNext}
          disabled={cycle.tasks.length === 0}
          className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Iniciar Execução (DO) &rarr;
        </button>
      </div>
    </div>
  );
};

export default PlanStage;