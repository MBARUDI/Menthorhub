import React, { useState } from 'react';
import { Plus, Trash2, DollarSign, TrendingUp, Wallet, Calendar, User } from 'lucide-react';
import { IncomeItem, ExpenseItem, InvestmentItem } from '../../../types';
import MicButton from './MicButton';

interface FinancialDashboardProps {
  incomes: IncomeItem[];
  setIncomes: React.Dispatch<React.SetStateAction<IncomeItem[]>>;
  expenses: ExpenseItem[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
  investments: InvestmentItem[];
  setInvestments: React.Dispatch<React.SetStateAction<InvestmentItem[]>>;
  userName: string;
  setUserName: (name: string) => void;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  incomes, setIncomes,
  expenses, setExpenses,
  investments, setInvestments,
  userName, setUserName
}) => {
  // Temporary state for inputs
  const [newIncome, setNewIncome] = useState({ source: '', periodicity: 'Mensal', amount: '' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });
  const [newInvestment, setNewInvestment] = useState({ type: '', monthlyApplication: '', totalValue: '' });

  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const currentDate = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  // Handlers
  const addIncome = () => {
    if (!newIncome.source || !newIncome.amount) return;
    setIncomes([...incomes, { 
      id: Date.now().toString(), 
      source: newIncome.source, 
      periodicity: newIncome.periodicity, 
      amount: parseFloat(newIncome.amount) 
    }]);
    setNewIncome({ source: '', periodicity: 'Mensal', amount: '' });
  };

  const addExpense = () => {
    if (!newExpense.description || !newExpense.amount) return;
    setExpenses([...expenses, { 
      id: Date.now().toString(), 
      description: newExpense.description, 
      amount: parseFloat(newExpense.amount) 
    }]);
    setNewExpense({ description: '', amount: '' });
  };

  const addInvestment = () => {
    if (!newInvestment.type || !newInvestment.monthlyApplication) return;
    setInvestments([...investments, {
      id: Date.now().toString(),
      type: newInvestment.type,
      monthlyApplication: parseFloat(newInvestment.monthlyApplication),
      totalValue: parseFloat(newInvestment.totalValue) || 0
    }]);
    setNewInvestment({ type: '', monthlyApplication: '', totalValue: '' });
  };

  const removeIncome = (id: string) => setIncomes(incomes.filter(i => i.id !== id));
  const removeExpense = (id: string) => setExpenses(expenses.filter(e => e.id !== id));
  const removeInvestment = (id: string) => setInvestments(investments.filter(i => i.id !== id));

  // Totals
  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalInvestedMonthly = investments.reduce((acc, curr) => acc + curr.monthlyApplication, 0);
  const totalInvestedAccumulated = investments.reduce((acc, curr) => acc + curr.totalValue, 0);
  const balance = totalIncome - totalExpenses - totalInvestedMonthly;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Profile */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
            <User size={24} />
          </div>
          <div className="flex-1 w-full relative">
            <label className="text-xs text-slate-500 font-semibold uppercase">Planejamento de</label>
            <div className="flex items-center gap-2">
                <input 
                type="text" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Digite seu nome"
                className="block w-full text-xl font-bold text-slate-900 bg-white/50 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none transition-colors rounded px-1"
                />
                <MicButton onTranscript={(text) => setUserName(text)} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
          <Calendar size={18} />
          <span className="font-medium">{currentDate}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Income Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="text-green-600" />
            <h2 className="text-xl font-bold text-slate-800">Renda Líquida</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap sm:flex-nowrap items-center">
              <div className="flex-1 flex items-center gap-1 border border-slate-200 rounded-lg pr-1 bg-white">
                 <input 
                    type="text" 
                    placeholder="Fonte (ex: Salário)" 
                    value={newIncome.source}
                    onChange={e => setNewIncome({...newIncome, source: e.target.value})}
                    className="flex-1 p-2 text-sm text-slate-900 bg-transparent outline-none placeholder:text-slate-400 rounded-lg"
                />
                <MicButton onTranscript={(text) => setNewIncome(prev => ({...prev, source: text}))} />
              </div>

               <select
                value={newIncome.periodicity}
                onChange={e => setNewIncome({...newIncome, periodicity: e.target.value})}
                className="p-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
               >
                 <option>Mensal</option>
                 <option>Quinzenal</option>
                 <option>Semanal</option>
                 <option>Ocasional</option>
               </select>
              <input 
                type="number" 
                placeholder="Valor" 
                value={newIncome.amount}
                onChange={e => setNewIncome({...newIncome, amount: e.target.value})}
                className="w-24 p-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none placeholder:text-slate-400"
              />
              <button 
                onClick={addIncome}
                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 rounded-l-lg">Fonte</th>
                    <th className="px-3 py-2">Período</th>
                    <th className="px-3 py-2 text-right">Valor</th>
                    <th className="px-3 py-2 rounded-r-lg"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incomes.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-3 font-medium text-slate-700">{item.source}</td>
                      <td className="px-3 py-3 text-slate-500">{item.periodicity}</td>
                      <td className="px-3 py-3 text-right font-semibold text-green-600">{formatCurrency(item.amount)}</td>
                      <td className="px-3 py-3 text-right">
                        <button onClick={() => removeIncome(item.id)} className="text-slate-300 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {incomes.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-4 text-slate-400 italic">Nenhuma renda cadastrada</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="font-semibold text-slate-600">Total Entradas</span>
              <span className="text-lg font-bold text-green-600">{formatCurrency(totalIncome)}</span>
            </div>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <Wallet className="text-red-500" />
            <h2 className="text-xl font-bold text-slate-800">Gastos Mensais</h2>
          </div>

          <div className="space-y-4">
             <div className="flex gap-2 flex-wrap sm:flex-nowrap items-center">
              <div className="flex-1 flex items-center gap-1 border border-slate-200 rounded-lg pr-1 bg-white">
                <input 
                    type="text" 
                    placeholder="Descrição (ex: Aluguel)" 
                    value={newExpense.description}
                    onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                    className="flex-1 p-2 text-sm text-slate-900 bg-transparent outline-none placeholder:text-slate-400 rounded-lg"
                />
                <MicButton onTranscript={(text) => setNewExpense(prev => ({...prev, description: text}))} />
              </div>
              <input 
                type="number" 
                placeholder="Valor" 
                value={newExpense.amount}
                onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                className="w-24 p-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none placeholder:text-slate-400"
              />
              <button 
                onClick={addExpense}
                className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {expenses.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-red-100 transition-all">
                  <span className="text-slate-700 font-medium">{item.description}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-600">{formatCurrency(item.amount)}</span>
                    <button onClick={() => removeExpense(item.id)} className="text-slate-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="text-center py-6 text-slate-400 italic">Adicione seus gastos fixos e variáveis</div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="font-semibold text-slate-600">Total Saídas</span>
              <span className="text-lg font-bold text-red-500">{formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Investments Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-800">Investimentos & Aplicações</h2>
        </div>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Tipo / Ativo</th>
                <th className="px-4 py-3 text-right">Aplicação Mensal</th>
                <th className="px-4 py-3 text-right">Saldo Total Acumulado</th>
                <th className="px-4 py-3 rounded-r-lg"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Input Row */}
              <tr className="bg-indigo-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 bg-white border border-indigo-200 rounded-md pr-1">
                     <input 
                        placeholder="Ex: Tesouro Direto" 
                        value={newInvestment.type}
                        onChange={e => setNewInvestment({...newInvestment, type: e.target.value})}
                        className="w-full outline-none p-2 rounded-md text-slate-900 placeholder:text-slate-400 bg-transparent"
                    />
                     <MicButton onTranscript={(text) => setNewInvestment(prev => ({...prev, type: text}))} />
                  </div>
                </td>
                <td className="px-4 py-3">
                   <input 
                    type="number"
                    placeholder="R$ 0,00" 
                    value={newInvestment.monthlyApplication}
                    onChange={e => setNewInvestment({...newInvestment, monthlyApplication: e.target.value})}
                    className="w-full text-right bg-white border border-indigo-200 focus:border-indigo-500 outline-none p-2 rounded-md text-slate-900 placeholder:text-slate-400"
                  />
                </td>
                <td className="px-4 py-3">
                   <input 
                    type="number"
                    placeholder="R$ 0,00" 
                    value={newInvestment.totalValue}
                    onChange={e => setNewInvestment({...newInvestment, totalValue: e.target.value})}
                    className="w-full text-right bg-white border border-indigo-200 focus:border-indigo-500 outline-none p-2 rounded-md text-slate-900 placeholder:text-slate-400"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button 
                    onClick={addInvestment}
                    className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <Plus size={16} />
                  </button>
                </td>
              </tr>
              {/* Data Rows */}
              {investments.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-700">{item.type}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.monthlyApplication)}</td>
                  <td className="px-4 py-3 text-right font-bold text-indigo-600">{formatCurrency(item.totalValue)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => removeInvestment(item.id)} className="text-slate-300 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Final Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg">
          <p className="text-green-100 font-medium mb-1">Renda Total Mensal</p>
          <div className="text-3xl font-bold">{formatCurrency(totalIncome)}</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-rose-600 p-6 rounded-2xl text-white shadow-lg">
          <p className="text-red-100 font-medium mb-1">Gasto Total Mensal</p>
          <div className="text-3xl font-bold">{formatCurrency(totalExpenses)}</div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-indigo-200 font-medium mb-1">Aporte Mensal</p>
            <div className="text-3xl font-bold mb-2">{formatCurrency(totalInvestedMonthly)}</div>
            <div className="text-xs text-indigo-200 pt-2 border-t border-indigo-500/50">
              Patrimônio Acumulado: <span className="font-bold text-white">{formatCurrency(totalInvestedAccumulated)}</span>
            </div>
          </div>
          <TrendingUp className="absolute right-4 bottom-4 text-indigo-400 w-24 h-24 opacity-20" />
        </div>
      </div>

      <div className="bg-slate-100 p-4 rounded-xl text-center">
        <p className="text-slate-500 text-sm">
          Saldo Restante (Renda - Gastos - Aportes): 
          <span className={`ml-2 font-bold text-lg ${balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {formatCurrency(balance)}
          </span>
        </p>
      </div>

    </div>
  );
};

export default FinancialDashboard;
