import React, { useState } from 'react';
import { 
  Rocket, 
  Sun, 
  Hourglass, 
  Calendar, 
  Mountain, 
  Telescope, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle,
  DollarSign,
  Target
} from 'lucide-react';
import { GoalItem, GoalTimeframe } from '../../../types';
import MicButton from './MicButton';

interface DreamsGoalsProps {
  goals: GoalItem[];
  setGoals: React.Dispatch<React.SetStateAction<GoalItem[]>>;
}

const DreamsGoals: React.FC<DreamsGoalsProps> = ({ goals, setGoals }) => {
  const [description, setDescription] = useState('');
  const [valueStr, setValueStr] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<GoalTimeframe>(GoalTimeframe.SHORT);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const timeframeConfig = {
    [GoalTimeframe.TODAY]: {
      label: 'Curtíssimo (Hoje)',
      labelShort: 'Hoje',
      icon: <Sun className="w-5 h-5 text-orange-500" />,
      color: 'bg-orange-50 border-orange-200 text-orange-700',
      desc: 'O que você precisa fazer hoje para chegar lá?'
    },
    [GoalTimeframe.SHORT]: {
      label: 'Curto (Até 2 anos)',
      labelShort: 'Até 2 anos',
      icon: <Hourglass className="w-5 h-5 text-blue-500" />,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      desc: 'Metas tangíveis para breve.'
    },
    [GoalTimeframe.MEDIUM]: {
      label: 'Médio (2 a 5 anos)',
      labelShort: '2-5 anos',
      icon: <Calendar className="w-5 h-5 text-indigo-500" />,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      desc: 'Construção de patrimônio e carreira.'
    },
    [GoalTimeframe.LONG]: {
      label: 'Longo (6 a 10 anos)',
      labelShort: '6-10 anos',
      icon: <Mountain className="w-5 h-5 text-purple-500" />,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      desc: 'Grandes realizações de vida.'
    },
    [GoalTimeframe.VERY_LONG]: {
      label: 'Longuíssimo (+10 anos)',
      labelShort: '+10 anos',
      icon: <Telescope className="w-5 h-5 text-fuchsia-500" />,
      color: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700',
      desc: 'Legado e aposentadoria.'
    }
  };

  const handleAddGoal = () => {
    if (!description.trim()) return;
    const numericValue = valueStr ? parseFloat(valueStr.replace(/[^\d,]/g, '').replace(',', '.')) : 0;
    
    const newGoal: GoalItem = {
      id: Date.now().toString(),
      description,
      value: numericValue || 0,
      timeframe: selectedTimeframe,
      completed: false
    };
    setGoals([...goals, newGoal]);
    setDescription('');
    setValueStr('');
  };

  const toggleGoal = (id: string) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const totalGoalsValue = goals.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
            <Rocket size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Mural dos Sonhos & Metas</h2>
        <p className="text-slate-600 mt-2">Quanto custa o seu sonho? Planeje e realize.</p>
      </div>

      {/* Input Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 sticky top-20 z-10">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2 justify-center mb-2">
            {(Object.keys(timeframeConfig) as GoalTimeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 border ${
                  selectedTimeframe === tf 
                    ? timeframeConfig[tf].color + ' ring-2 ring-offset-1 ring-slate-200' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {timeframeConfig[tf].icon}
                {timeframeConfig[tf].label}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-2 items-center">
            <div className="flex-1 flex items-center gap-2 w-full bg-white border border-slate-300 rounded-xl pr-2 focus-within:ring-2 focus-within:ring-indigo-500">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                placeholder={`Qual seu sonho para: ${timeframeConfig[selectedTimeframe].label}?`}
                className="flex-1 p-4 text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
              />
              <MicButton onTranscript={(text) => setDescription(prev => prev ? `${prev} ${text}` : text)} />
            </div>
            
            <div className="relative w-full md:w-48">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="number"
                value={valueStr}
                onChange={(e) => setValueStr(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                placeholder="Valor (R$)"
                className="w-full p-4 pl-10 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 transition-all shadow-inner"
              />
            </div>
            <button
              onClick={handleAddGoal}
              className="w-full md:w-auto px-6 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Plus size={20} />
              <span className="md:hidden lg:inline">Adicionar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Goals Display */}
      <div className="space-y-6">
        {(Object.keys(timeframeConfig) as GoalTimeframe[]).map((tf) => {
          const sectionGoals = goals.filter(g => g.timeframe === tf);
          return (
            <div key={tf} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${timeframeConfig[tf].color} bg-opacity-20`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white bg-opacity-60 shadow-sm`}>
                    {timeframeConfig[tf].icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{timeframeConfig[tf].label}</h3>
                    <p className="text-xs text-slate-600 opacity-80">{timeframeConfig[tf].desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-600 bg-white/50 px-2 py-1 rounded">
                        Total: {formatCurrency(sectionGoals.reduce((sum, g) => sum + g.value, 0))}
                    </span>
                    <span className="text-xs font-bold bg-white bg-opacity-50 px-2 py-1 rounded-md">
                    {sectionGoals.length}
                    </span>
                </div>
              </div>
              
              <div className="p-4 space-y-2">
                {sectionGoals.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm italic py-4">Nenhuma meta definida para este período ainda.</p>
                ) : (
                  sectionGoals.map(goal => (
                    <div 
                      key={goal.id} 
                      className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                        goal.completed 
                          ? 'bg-green-50 border-green-100 opacity-70' 
                          : 'bg-white border-slate-100 hover:border-indigo-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <button 
                          onClick={() => toggleGoal(goal.id)}
                          className={`transition-colors ${goal.completed ? 'text-green-500' : 'text-slate-300 hover:text-indigo-500'}`}
                        >
                          {goal.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                        </button>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 flex-1">
                            <span className={`text-slate-700 font-medium transition-all ${goal.completed ? 'line-through text-slate-400' : ''}`}>
                            {goal.description}
                            </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`text-sm font-bold whitespace-nowrap ${goal.completed ? 'text-slate-400' : 'text-indigo-600'}`}>
                            {formatCurrency(goal.value)}
                        </span>
                        <button 
                            onClick={() => removeGoal(goal.id)}
                            className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity px-2"
                        >
                            <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Dashboard */}
      {goals.length > 0 && (
          <div className="mt-12 pt-8 border-t-2 border-slate-100 animate-fade-in-up">
            <div className="bg-slate-800 rounded-3xl p-8 text-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <Target className="text-indigo-300" size={28} />
                        <h2 className="text-2xl font-bold text-white">Resumo dos Sonhos</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                                    <th className="py-3 px-2">Sonho</th>
                                    <th className="py-3 px-2">Prazo</th>
                                    <th className="py-3 px-2 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50 text-sm">
                                {goals.map(goal => (
                                    <tr key={goal.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="py-3 px-2 font-medium text-white">{goal.description}</td>
                                        <td className="py-3 px-2 text-slate-300">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-700/50 text-xs">
                                                {timeframeConfig[goal.timeframe].icon}
                                                {timeframeConfig[goal.timeframe].labelShort}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-right font-mono text-indigo-300">{formatCurrency(goal.value)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t border-slate-600 bg-slate-900/30">
                                    <td colSpan={2} className="py-4 px-2 text-right font-bold text-slate-300 text-lg">CUSTO TOTAL DE VIDA:</td>
                                    <td className="py-4 px-2 text-right font-bold text-2xl text-green-400">{formatCurrency(totalGoalsValue)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default DreamsGoals;
