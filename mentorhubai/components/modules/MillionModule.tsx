import React, { useState } from 'react';
import { Target, DollarSign, Percent, Clock, TrendingUp } from 'lucide-react';

const MillionModule: React.FC = () => {
  const [monthlyDeposit, setMonthlyDeposit] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [result, setResult] = useState<{ totalMonths: number, years: number, remainingMonths: number } | null>(null);
  const [error, setError] = useState('');

  const calculateFirstMillion = () => {
    setError('');
    setResult(null);

    const deposit = parseFloat(monthlyDeposit);
    const ratePercent = parseFloat(interestRate);
    const TARGET_VALUE = 1000000.00;

    if (isNaN(deposit) || deposit <= 0) {
      setError('Por favor, insira um valor de depósito positivo.');
      return;
    }

    if (isNaN(ratePercent) || ratePercent < 0) {
      setError('A taxa de juros deve ser zero ou positiva.');
      return;
    }

    const monthlyRate = ratePercent / 100.0;
    let months: number;

    if (monthlyRate === 0) {
      months = TARGET_VALUE / deposit;
    } else {
      // Formula: n = log(1 + (FV * i) / PMT) / log(1 + i)
      const innerTerm = (TARGET_VALUE * monthlyRate) / deposit;
      const numerator = Math.log(1 + innerTerm);
      const denominator = Math.log(1 + monthlyRate);
      months = numerator / denominator;
    }

    const totalMonths = months;
    const years = Math.floor(totalMonths / 12);
    const remainingMonths = Math.round(totalMonths % 12);

    setResult({
      totalMonths,
      years,
      remainingMonths
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white overflow-y-auto">
      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-emerald-900 to-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-emerald-500/20 rounded-full">
            <Target className="text-emerald-400" size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight">Calculadora do Milhão</h2>
            <p className="text-xs text-emerald-300/70 uppercase tracking-wider">Planejamento Financeiro</p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-md mx-auto w-full flex-1 flex flex-col">
        
        {/* Target Card */}
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700 mb-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
           <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-1">Meta Financeira</p>
           <h3 className="text-4xl font-bold text-emerald-400 tracking-tight">R$ 1.000.000,00</h3>
           <div className="flex items-center gap-2 mt-4 text-sm text-gray-400 bg-gray-900/50 p-2 rounded-lg border border-gray-700/50">
              <TrendingUp size={16} className="text-emerald-500" />
              <span>Juros compostos trabalhando para você</span>
           </div>
        </div>

        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Depósito Mensal (R$)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <DollarSign size={18} className="text-gray-500" />
              </div>
              <input
                type="number"
                value={monthlyDeposit}
                onChange={(e) => setMonthlyDeposit(e.target.value)}
                placeholder="Ex: 500.00"
                className="w-full bg-gray-800 border border-gray-700 text-white text-lg rounded-xl pl-11 pr-4 py-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Taxa de Juros Mensal (%)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Percent size={18} className="text-gray-500" />
              </div>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="Ex: 0.8"
                className="w-full bg-gray-800 border border-gray-700 text-white text-lg rounded-xl pl-11 pr-4 py-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-gray-600"
              />
            </div>
          </div>
          
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-fade-in">
              {error}
            </div>
          )}

          <button
            onClick={calculateFirstMillion}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/30 transition-transform active:scale-[0.98] mt-2"
          >
            Calcular Tempo
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 animate-slide-up">
            <div className="bg-gray-800 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Clock size={20} className="text-emerald-400" />
                Tempo Estimado
              </h4>

              <div className="space-y-4">
                 <div>
                    <p className="text-sm text-gray-400">Total em meses</p>
                    <p className="text-2xl font-mono text-white">{result.totalMonths.toFixed(2)} meses</p>
                 </div>
                 <div className="pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">Isso equivale a aproximadamente:</p>
                    <p className="text-3xl font-bold text-emerald-400">
                      {result.years} <span className="text-lg font-normal text-gray-300">anos</span> e {result.remainingMonths} <span className="text-lg font-normal text-gray-300">meses</span>
                    </p>
                 </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MillionModule;