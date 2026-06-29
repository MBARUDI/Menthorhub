import React, { useState } from 'react';
import { LayoutDashboard, PenTool, BrainCircuit, TableProperties, Rocket, Briefcase, Crown, ArrowRight } from 'lucide-react';
import DecisionMatrix from './consciouswallet/DecisionMatrix';
import FiveQs from './consciouswallet/FiveQs';
import AIAdvisor from './consciouswallet/AIAdvisor';
import FinancialDashboard from './consciouswallet/FinancialDashboard';
import DreamsGoals from './consciouswallet/DreamsGoals';
import WorkAreas from './consciouswallet/WorkAreas';
import LifePlan from './consciouswallet/LifePlan';
import WelcomeScreen from './consciouswallet/WelcomeScreen';
import { QuadrantItem, FiveQsData, AnalysisResult, IncomeItem, ExpenseItem, InvestmentItem, GoalItem, WorkItem } from '../../types';
import { analyzeFinancialBehavior, generateLifePlan } from '../../services/geminiService';

enum Tab {
  MATRIX = 'matrix',
  FIVE_QS = 'five_qs',
  ADVISOR = 'advisor',
  DASHBOARD = 'dashboard',
  DREAMS = 'dreams',
  WORK = 'work',
  PLAN = 'plan'
}

export default function ConsciousWalletModule() {
  const [hasStarted, setHasStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.MATRIX);
  
  // User Data
  const [userName, setUserName] = useState<string>('');
  const [userAge, setUserAge] = useState<string>('');

  // State for Decision Matrix
  const [quadrantItems, setQuadrantItems] = useState<QuadrantItem[]>([]);

  // State for 5 Qs
  const [fiveQsData, setFiveQsData] = useState<FiveQsData>({
    what: '',
    why: '',
    how: '',
    who: '',
    usage: ''
  });

  // State for AI Analysis (Advisor)
  const [analysis, setAnalysis] = useState<AnalysisResult>({
    markdown: '',
    loading: false,
    error: null
  });

  // State for Financial Dashboard
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);

  // State for Dreams & Goals
  const [goals, setGoals] = useState<GoalItem[]>([]);

  // State for Work Areas
  const [works, setWorks] = useState<WorkItem[]>([]);

  // State for Master Plan Analysis
  const [masterPlan, setMasterPlan] = useState<AnalysisResult>({
    markdown: '',
    loading: false,
    error: null
  });

  const handleStart = (name: string, age: string) => {
    setUserName(name);
    setUserAge(age);
    setHasStarted(true);
  };

  const handleAnalyze = async () => {
    setAnalysis({ markdown: '', loading: true, error: null });
    try {
      const result = await analyzeFinancialBehavior(quadrantItems, fiveQsData);
      setAnalysis({ markdown: result, loading: false, error: null });
    } catch (error) {
      setAnalysis({ 
        markdown: '', 
        loading: false, 
        error: "Erro ao conectar. Verifique sua chave de API ou tente novamente." 
      });
    }
  };

  const handleGeneratePlan = async () => {
    setMasterPlan({ markdown: '', loading: true, error: null });
    try {
      const result = await generateLifePlan(
        quadrantItems,
        fiveQsData,
        incomes,
        expenses,
        investments,
        goals,
        works
      );
      setMasterPlan({ markdown: result, loading: false, error: null });
    } catch (error) {
      setMasterPlan({
        markdown: '',
        loading: false,
        error: "Erro ao gerar o plano. Verifique a API Key ou tente novamente."
      });
    }
  };

  const hasEnoughData = quadrantItems.length > 0 || Object.values(fiveQsData).some((v) => (v as string).length > 0);

  // Navigation Logic
  const getNextTab = (current: Tab): Tab | null => {
    const flow = [
      Tab.MATRIX,
      Tab.FIVE_QS,
      Tab.ADVISOR,
      Tab.DASHBOARD,
      Tab.DREAMS,
      Tab.WORK,
      Tab.PLAN
    ];
    const currentIndex = flow.indexOf(current);
    return currentIndex < flow.length - 1 ? flow[currentIndex + 1] : null;
  };

  const getTabLabel = (tab: Tab) => {
    switch (tab) {
      case Tab.MATRIX: return 'Matriz';
      case Tab.FIVE_QS: return '5 Qs';
      case Tab.ADVISOR: return 'Análise';
      case Tab.DASHBOARD: return 'Planilha';
      case Tab.DREAMS: return 'Sonhos';
      case Tab.WORK: return 'Trabalho';
      case Tab.PLAN: return 'Plano Mestre';
      default: return '';
    }
  };

  const handleNext = () => {
    const next = getNextTab(activeTab);
    if (next) {
      setActiveTab(next);
    }
  };

  if (!hasStarted) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  const nextTab = getNextTab(activeTab);

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 flex flex-col font-sans text-slate-800 custom-scrollbar">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 mr-4 flex-shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              CW
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">ConsciousWallet</h1>
          </div>
          <nav className="flex gap-1">
            <button
              onClick={() => setActiveTab(Tab.MATRIX)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === Tab.MATRIX ? 'bg-indigo-55 text-indigo-700 font-bold bg-indigo-50' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard size={18} />
              <span className="hidden lg:inline">Matriz</span>
            </button>
            <button
              onClick={() => setActiveTab(Tab.FIVE_QS)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === Tab.FIVE_QS ? 'bg-indigo-55 text-indigo-700 font-bold bg-indigo-50' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PenTool size={18} />
              <span className="hidden lg:inline">5 Qs</span>
            </button>
             <button
              onClick={() => setActiveTab(Tab.ADVISOR)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === Tab.ADVISOR ? 'bg-indigo-55 text-indigo-700 font-bold bg-indigo-50' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BrainCircuit size={18} />
              <span className="hidden lg:inline">Análise</span>
            </button>
            <button
              onClick={() => setActiveTab(Tab.DASHBOARD)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === Tab.DASHBOARD ? 'bg-indigo-55 text-indigo-700 font-bold bg-indigo-50' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <TableProperties size={18} />
              <span className="hidden lg:inline">Planilha</span>
            </button>
            <button
              onClick={() => setActiveTab(Tab.DREAMS)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === Tab.DREAMS ? 'bg-indigo-55 text-indigo-700 font-bold bg-indigo-50' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Rocket size={18} />
              <span className="hidden lg:inline">Sonhos</span>
            </button>
            <button
              onClick={() => setActiveTab(Tab.WORK)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === Tab.WORK ? 'bg-indigo-55 text-indigo-700 font-bold bg-indigo-50' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Briefcase size={18} />
              <span className="hidden lg:inline">Trabalho</span>
            </button>
            <button
              onClick={() => setActiveTab(Tab.PLAN)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === Tab.PLAN ? 'bg-indigo-900 text-yellow-300' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Crown size={18} />
              <span className="hidden lg:inline font-bold">PLANO</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === Tab.MATRIX && (
          <div className="animate-fade-in">
            <DecisionMatrix items={quadrantItems} setItems={setQuadrantItems} />
          </div>
        )}

        {activeTab === Tab.FIVE_QS && (
          <div className="animate-fade-in">
            <FiveQs data={fiveQsData} setData={setFiveQsData} />
          </div>
        )}

        {activeTab === Tab.ADVISOR && (
           <div className="animate-fade-in">
             <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Análise Comportamental</h2>
                <p className="text-slate-600 mt-2">Feedback rápido sobre seus hábitos e motivações.</p>
             </div>
             
             {/* Summary Cards */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
               <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Matriz de Decisão</h3>
                  <div className="text-2xl font-bold text-indigo-600">{quadrantItems.length}</div>
                  <p className="text-sm text-slate-500">Fatores mapeados</p>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">5 Qs Respondidos</h3>
                  <div className="text-2xl font-bold text-indigo-600">
                    {Object.values(fiveQsData).filter((x) => (x as string).length > 3).length}/5
                  </div>
                  <p className="text-sm text-slate-500">Perguntas completas</p>
               </div>
             </div>

             <AIAdvisor onAnalyze={handleAnalyze} result={analysis} hasData={hasEnoughData} />
           </div>
        )}

        {activeTab === Tab.DASHBOARD && (
          <FinancialDashboard 
            incomes={incomes}
            setIncomes={setIncomes}
            expenses={expenses}
            setExpenses={setExpenses}
            investments={investments}
            setInvestments={setInvestments}
            userName={userName}
            setUserName={setUserName}
          />
        )}

        {activeTab === Tab.DREAMS && (
          <DreamsGoals goals={goals} setGoals={setGoals} />
        )}

        {activeTab === Tab.WORK && (
          <WorkAreas works={works} setWorks={setWorks} />
        )}

        {activeTab === Tab.PLAN && (
          <LifePlan 
            onGenerate={handleGeneratePlan} 
            result={masterPlan} 
            // Passing all data for PDF generation
            data={{
              userName,
              quadrantItems,
              fiveQsData,
              incomes,
              expenses,
              investments,
              goals,
              works,
              behavioralAnalysis: analysis.markdown
            }}
          />
        )}

        {/* Navigation Button */}
        {nextTab && (
          <div className="mt-16 border-t border-slate-200 pt-8 flex justify-end animate-fade-in">
            <button
              onClick={handleNext}
              className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95"
            >
              <span>Ir para {getTabLabel(nextTab)}</span>
              <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} ConsciousWallet. Tome decisões que seu "eu do futuro" irá agradecer.</p>
        </div>
      </footer>
    </div>
  );
}
