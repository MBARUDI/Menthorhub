import React, { useState } from 'react';
import { Target, DollarSign, Percent, Clock, TrendingUp, BarChart3, LineChart as IconLineChart } from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const MillionModule: React.FC = () => {
  const [monthlyDeposit, setMonthlyDeposit] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [result, setResult] = useState<{ totalMonths: number, years: number, remainingMonths: number } | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [sensitivityData, setSensitivityData] = useState<any[]>([]);
  const [error, setError] = useState('');

  const calculateFirstMillion = () => {
    setError('');
    setResult(null);
    setChartData([]);
    setSensitivityData([]);

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

    // 1. Calculate Time to Goal
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

    // 2. Generate Trajectory Chart Data
    const data = [];
    let currentBalance = 0;
    let totalInvested = 0;
    
    const step = totalMonths > 120 ? 12 : 1; 
    const limit = Math.ceil(totalMonths);

    for (let i = 0; i <= limit + step; i++) {
      if (i > 0) {
         if (monthlyRate === 0) {
             currentBalance = deposit * i;
         } else {
             currentBalance = deposit * (Math.pow(1 + monthlyRate, i) - 1) / monthlyRate;
         }
         totalInvested = deposit * i;
      }

      if (i % step === 0 || i >= limit) {
         data.push({
           name: (i / 12).toFixed(1) + ' anos',
           Total: parseFloat(currentBalance.toFixed(2)),
           Investido: parseFloat(totalInvested.toFixed(2)),
         });
         
         if (i >= limit) break; 
      }
    }
    setChartData(data);

    // 3. Generate Sensitivity Data (Impact of Monthly Deposit 0-10000)
    const sensData = [];
    // Start from 200 to avoid division by zero or infinite time visual issues
    for (let d = 200; d <= 10000; d += 200) {
      let m = 0;
      if (monthlyRate === 0) {
        m = TARGET_VALUE / d;
      } else {
        const val = (TARGET_VALUE * monthlyRate) / d;
        m = Math.log(1 + val) / Math.log(1 + monthlyRate);
      }
      
      if (m > 0 && isFinite(m)) {
          sensData.push({
              deposit: d,
              years: parseFloat((m / 12).toFixed(1))
          });
      }
    }
    setSensitivityData(sensData);
  };

  const toCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
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

      <div className="p-6 max-w-2xl mx-auto w-full flex-1 flex flex-col">
        
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
        <div className="grid md:grid-cols-2 gap-5 mb-6">
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
        </div>
          
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-fade-in mb-4">
            {error}
          </div>
        )}

        <button
          onClick={calculateFirstMillion}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/30 transition-transform active:scale-[0.98]"
        >
          Calcular Trajetória
        </button>

        {/* Results */}
        {result && (
          <div className="mt-8 animate-slide-up space-y-8 pb-10">
            {/* Time Result */}
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

            {/* Trajectory Chart */}
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 shadow-lg">
               <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Evolução Patrimonial</h4>
               <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorInvestido" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                     <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} />
                     <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={toCurrency} tickLine={false} axisLine={false} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                     />
                     <ReferenceLine y={1000000} stroke="#fff" strokeDasharray="3 3" label={{ position: 'top', value: '1 Milhão', fill: '#fff', fontSize: 10 }} />
                     <Area type="monotone" dataKey="Total" stroke="#10b981" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
                     <Area type="monotone" dataKey="Investido" stroke="#6b7280" fillOpacity={1} fill="url(#colorInvestido)" strokeWidth={2} />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* Sensitivity Analysis Chart */}
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 shadow-lg">
               <div className="mb-4">
                 <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <IconLineChart size={16} className="text-blue-400"/>
                   Poder do Aporte (0 a 10k)
                 </h4>
                 <p className="text-xs text-gray-500 mt-1">
                   Como o valor do aporte mensal altera o tempo para atingir o milhão (com taxa de {interestRate}%)
                 </p>
               </div>
               
               <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={sensitivityData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                     <XAxis 
                        dataKey="deposit" 
                        stroke="#9ca3af" 
                        fontSize={10} 
                        tickLine={false} 
                        tickFormatter={(val) => `R$${val/1000}k`}
                        type="number"
                        domain={[0, 10000]}
                        ticks={[0, 2000, 4000, 6000, 8000, 10000]}
                     />
                     <YAxis 
                        stroke="#9ca3af" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        label={{ value: 'Anos', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 10 }} 
                     />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                        cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                        formatter={(value: number, name: string) => [
                          `${value} anos`, 
                          name === 'years' ? 'Tempo' : name
                        ]}
                        labelFormatter={(label) => `Aporte: R$ ${label.toLocaleString('pt-BR')}`}
                     />
                     <Line 
                        type="monotone" 
                        dataKey="years" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        dot={false}
                        activeDot={{ r: 6, fill: '#3b82f6' }}
                     />
                     {/* Highlight user's current choice */}
                     <ReferenceLine x={parseFloat(monthlyDeposit)} stroke="#10b981" strokeDasharray="3 3" />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
               <div className="text-center mt-2">
                  <span className="text-xs text-gray-500">
                    <span className="text-green-500">---</span> Seu aporte atual
                  </span>
               </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default MillionModule;