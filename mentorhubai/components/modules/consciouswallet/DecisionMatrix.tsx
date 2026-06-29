import React, { useState } from 'react';
import { Plus, X, TrendingUp, TrendingDown, ShieldAlert, Zap } from 'lucide-react';
import { QuadrantItem, QuadrantType } from '../../../types';
import MicButton from './MicButton';

interface DecisionMatrixProps {
  items: QuadrantItem[];
  setItems: React.Dispatch<React.SetStateAction<QuadrantItem[]>>;
}

// Extracted Component to prevent re-rendering issues
const QuadrantCard = ({ 
  type, 
  title, 
  description, 
  items, 
  onAdd, 
  onDelete, 
  inputValue, 
  onInputChange 
}: { 
  type: QuadrantType, 
  title: string, 
  description: string, 
  items: QuadrantItem[],
  onAdd: (type: QuadrantType) => void,
  onDelete: (id: string) => void,
  inputValue: string,
  onInputChange: (type: QuadrantType, value: string) => void
}) => {
  
  const getIcon = (t: QuadrantType) => {
    switch (t) {
      case QuadrantType.MOTIVATORS: return <Zap className="w-5 h-5 text-yellow-500" />;
      case QuadrantType.SABOTEURS: return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case QuadrantType.GAINS: return <TrendingUp className="w-5 h-5 text-green-500" />;
      case QuadrantType.LOSSES: return <TrendingDown className="w-5 h-5 text-orange-500" />;
    }
  };

  const getColorClass = (t: QuadrantType) => {
    switch (t) {
      case QuadrantType.MOTIVATORS: return 'bg-yellow-50 border-yellow-200';
      case QuadrantType.SABOTEURS: return 'bg-red-50 border-red-200';
      case QuadrantType.GAINS: return 'bg-green-50 border-green-200';
      case QuadrantType.LOSSES: return 'bg-orange-50 border-orange-200';
    }
  };

  const getButtonClass = (t: QuadrantType) => {
    switch (t) {
      case QuadrantType.MOTIVATORS: return 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600';
      case QuadrantType.SABOTEURS: return 'bg-red-500 hover:bg-red-600 text-white border-red-600';
      case QuadrantType.GAINS: return 'bg-green-500 hover:bg-green-600 text-white border-green-600';
      case QuadrantType.LOSSES: return 'bg-orange-500 hover:bg-orange-600 text-white border-orange-600';
    }
  };

  const handleMicInput = (text: string) => {
    const newVal = inputValue ? `${inputValue} ${text}` : text;
    onInputChange(type, newVal);
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${getColorClass(type)} flex flex-col h-full shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-center gap-2 mb-2">
        {getIcon(type)}
        <h3 className="font-bold text-slate-800">{title}</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4 h-8">{description}</p>
      
      <div className="flex-1 overflow-y-auto max-h-48 space-y-2 mb-4 custom-scrollbar">
        {items.filter(i => i.type === type).map(item => (
          <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 shadow-sm animate-fade-in-up">
            <span className="text-sm text-slate-700 break-words">{item.text}</span>
            <button onClick={() => onDelete(item.id)} className="text-slate-400 hover:text-red-500 transition-colors ml-2 flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        ))}
        {items.filter(i => i.type === type).length === 0 && (
          <div className="text-center text-slate-400 text-sm italic py-4">
            Adicione itens aqui
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-auto items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(type, e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAdd(type)}
            placeholder="Digite e clique no +"
            className="w-full text-sm p-2 pr-8 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 placeholder:text-slate-400 shadow-inner"
          />
        </div>
        <MicButton onTranscript={handleMicInput} />
        <button
          onClick={() => onAdd(type)}
          className={`p-2 rounded-lg transition-colors shadow-sm flex items-center justify-center ${getButtonClass(type)}`}
          title="Adicionar item"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};

const DecisionMatrix: React.FC<DecisionMatrixProps> = ({ items, setItems }) => {
  const [inputs, setInputs] = useState<Record<QuadrantType, string>>({
    [QuadrantType.MOTIVATORS]: '',
    [QuadrantType.SABOTEURS]: '',
    [QuadrantType.GAINS]: '',
    [QuadrantType.LOSSES]: '',
  });

  const handleAddItem = (type: QuadrantType) => {
    if (!inputs[type].trim()) return;
    const newItem: QuadrantItem = {
      id: Date.now().toString() + Math.random(),
      text: inputs[type],
      type,
    };
    setItems((prev) => [...prev, newItem]);
    setInputs((prev) => ({ ...prev, [type]: '' }));
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleInputChange = (type: QuadrantType, value: string) => {
    setInputs((prev) => ({ ...prev, [type]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Diagrama de Ganhos Pessoais</h2>
        <p className="text-slate-600 mt-2">Mapeie o que impulsiona e o que freia sua liberdade financeira.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuadrantCard 
          type={QuadrantType.MOTIVATORS} 
          title="Motivadores" 
          description="O que te anima a mudar? (Ex: Viajar, paz mental)"
          items={items}
          onAdd={handleAddItem}
          onDelete={handleDeleteItem}
          inputValue={inputs[QuadrantType.MOTIVATORS]}
          onInputChange={handleInputChange}
        />
        <QuadrantCard 
          type={QuadrantType.SABOTEURS} 
          title="Sabotadores" 
          description="O que te impede? (Ex: Impulsividade, status social)"
          items={items}
          onAdd={handleAddItem}
          onDelete={handleDeleteItem}
          inputValue={inputs[QuadrantType.SABOTEURS]}
          onInputChange={handleInputChange}
        />
        <QuadrantCard 
          type={QuadrantType.GAINS} 
          title="Ganhos (Consumo Consciente)" 
          description="O que você ganha ao ser consciente? (Ex: Reserva, sonhos)"
          items={items}
          onAdd={handleAddItem}
          onDelete={handleDeleteItem}
          inputValue={inputs[QuadrantType.GAINS]}
          onInputChange={handleInputChange}
        />
        <QuadrantCard 
          type={QuadrantType.LOSSES} 
          title="Perdas (Consumo Impulsivo)" 
          description="O que você perde se continuar igual? (Ex: Dívidas, stress)"
          items={items}
          onAdd={handleAddItem}
          onDelete={handleDeleteItem}
          inputValue={inputs[QuadrantType.LOSSES]}
          onInputChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default DecisionMatrix;
