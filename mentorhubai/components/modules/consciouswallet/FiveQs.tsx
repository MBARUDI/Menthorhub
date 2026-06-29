import React from 'react';
import { HelpCircle, ShoppingBag, CreditCard, Users, Recycle } from 'lucide-react';
import { FiveQsData } from '../../../types';
import MicButton from './MicButton';

interface FiveQsProps {
  data: FiveQsData;
  setData: React.Dispatch<React.SetStateAction<FiveQsData>>;
}

// Extracted component
const QuestionCard = ({ 
  icon, 
  title, 
  subtitle, 
  value, 
  field, 
  placeholder,
  onChange
}: { 
  icon: React.ReactNode, 
  title: string, 
  subtitle: string, 
  value: string, 
  field: keyof FiveQsData, 
  placeholder: string,
  onChange: (field: keyof FiveQsData, value: string) => void
}) => {
  
  const handleMicInput = (text: string) => {
    const newVal = value ? `${value} ${text}` : text;
    onChange(field, newVal);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group relative">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
          {icon}
        </div>
        <div className="flex-1 relative">
          <div className="flex justify-between items-start">
             <div>
                <label className="block text-lg font-semibold text-slate-800 mb-1">
                  {title}
                </label>
                <p className="text-sm text-slate-500 mb-3">{subtitle}</p>
             </div>
             <MicButton onTranscript={handleMicInput} className="ml-2" />
          </div>
          <textarea
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 text-slate-900 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all h-24 resize-none placeholder:text-slate-400"
          />
        </div>
      </div>
    </div>
  );
};

const FiveQs: React.FC<FiveQsProps> = ({ data, setData }) => {
  const handleChange = (field: keyof FiveQsData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Os 5 Qs do Consumo Consciente</h2>
        <p className="text-slate-600 mt-2">Antes de comprar, reflita sobre estas cinco perguntas essenciais.</p>
      </div>

      <QuestionCard 
        icon={<ShoppingBag />}
        title="1. O que comprar?"
        subtitle="É um desejo ou uma necessidade? Qual a utilidade real?"
        field="what"
        value={data.what}
        placeholder="Ex: Preciso de um tênis novo para correr, pois o atual rasgou..."
        onChange={handleChange}
      />

      <QuestionCard 
        icon={<HelpCircle />}
        title="2. Por que comprar?"
        subtitle="O que motiva essa compra? Estou triste, feliz ou preciso mesmo?"
        field="why"
        value={data.why}
        placeholder="Ex: É essencial para minha saúde, não é apenas moda..."
        onChange={handleChange}
      />

      <QuestionCard 
        icon={<CreditCard />}
        title="3. Como comprar?"
        subtitle="À vista? Parcelado? Cabe no orçamento mensal sem juros?"
        field="how"
        value={data.how}
        placeholder="Ex: Vou pagar à vista com o dinheiro que guardei mês passado..."
        onChange={handleChange}
      />

      <QuestionCard 
        icon={<Users />}
        title="4. De quem comprar?"
        subtitle="A empresa respeita o meio ambiente e os funcionários?"
        field="who"
        value={data.who}
        placeholder="Ex: Vou comprar de uma loja local que apoia produtores da região..."
        onChange={handleChange}
      />

      <QuestionCard 
        icon={<Recycle />}
        title="5. Como usar/descartar?"
        subtitle="Vai durar? Como será o descarte quando não servir mais?"
        field="usage"
        value={data.usage}
        placeholder="Ex: Vou usar até acabar. Depois, vou doar ou reciclar..."
        onChange={handleChange}
      />
    </div>
  );
};

export default FiveQs;
