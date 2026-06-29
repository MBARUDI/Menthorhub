import React, { useState } from 'react';
import { Briefcase, Plus, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import { WorkItem } from '../types';
import MicButton from './MicButton';

interface WorkAreasProps {
  works: WorkItem[];
  setWorks: React.Dispatch<React.SetStateAction<WorkItem[]>>;
}

const WorkAreas: React.FC<WorkAreasProps> = ({ works, setWorks }) => {
  const [area, setArea] = useState('');
  const [incomeStr, setIncomeStr] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleAddWork = () => {
    if (!area.trim()) return;
    const numericIncome = incomeStr ? parseFloat(incomeStr.replace(/[^\d,]/g, '').replace(',', '.')) : 0;
    
    const newWork: WorkItem = {
      id: Date.now().toString(),
      area,
      currentIncome: numericIncome || 0,
    };
    setWorks([...works, newWork]);
    setArea('');
    setIncomeStr('');
  };

  const removeWork = (id: string) => {
    setWorks(works.filter(w => w.id !== id));
  };

  const totalIncome = works.reduce((acc, curr) => acc + curr.currentIncome, 0);

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <Briefcase size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Portfólio Profissional</h2>
        <p className="text-slate-600 mt-2">Mapeie suas áreas de atuação e fontes de renda (principal e extra).</p>
      </div>

      {/* Input Card */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-500" />
          Adicionar Área de Atuação
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs text-slate-500 font-medium ml-1">Área / Profissão</label>
            <div className="mt-1 flex items-center gap-1 bg-white border border-slate-200 rounded-xl pr-1 focus-within:ring-2 focus-within:ring-blue-500">
                <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Ex: Marketing Digital, Uber, Consultoria..."
                    className="w-full p-3 bg-transparent focus:outline-none text-slate-900 rounded-xl"
                />
                <MicButton onTranscript={(text) => setArea(text)} />
            </div>
          </div>
          <div className="w-full md:w-48">
            <label className="text-xs text-slate-500 font-medium ml-1">Renda Mensal (Atual/Média)</label>
            <div className="relative mt-1">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="number"
                value={incomeStr}
                onChange={(e) => setIncomeStr(e.target.value)}
                placeholder="0,00"
                className="w-full p-3 pl-9 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddWork}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md"
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {works.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-blue-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Briefcase size={18} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{item.area}</h4>
                <p className="text-xs text-slate-500">Área de atuação</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-green-600">{formatCurrency(item.currentIncome)}</span>
              <button 
                onClick={() => removeWork(item.id)}
                className="text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {works.length === 0 && (
          <div className="col-span-full text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-400">Nenhuma área profissional adicionada ainda.</p>
          </div>
        )}
      </div>

      {/* Total */}
      {works.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-6 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-green-400" />
            <span className="text-slate-300">Potencial de Renda Total</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {formatCurrency(totalIncome)}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkAreas;