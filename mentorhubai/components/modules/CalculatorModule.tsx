
import React, { useState } from 'react';
import { Delete, Divide, X, Plus, Minus, Equal, Percent } from 'lucide-react';

type Mode = 'standard' | 'scientific' | 'financial';
type FinancialType = 'compound' | 'loan';

const CalculatorModule: React.FC = () => {
  const [mode, setMode] = useState<Mode>('standard');
  const [display, setDisplay] = useState('');
  const [lastResult, setLastResult] = useState('');

  // Financial State
  const [finType, setFinType] = useState<FinancialType>('compound');
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState(''); 
  const [contribution, setContribution] = useState('');
  const [finResult, setFinResult] = useState<{ label: string; value: string; subValue?: string } | null>(null);

  const handleBtn = (val: string) => {
    if (val === 'C') {
      setDisplay('');
      setLastResult('');
    } else if (val === 'DEL') {
      setDisplay(prev => prev.slice(0, -1));
    } else if (val === '=') {
      try {
        let evalString = display
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/ln\(/g, 'Math.log(')
          .replace(/√\(/g, 'Math.sqrt(')
          .replace(/\^/g, '**')
          .replace(/%/g, '/100');
        
        const res = new Function(`return ${evalString}`)();
        
        if (!isFinite(res) || isNaN(res)) {
            setLastResult('Erro');
        } else {
            const formatted = Number(res).toLocaleString('pt-BR', { maximumFractionDigits: 6 });
            setLastResult(formatted);
            setDisplay(String(res));
        }
      } catch (e) {
        setLastResult('Erro');
      }
    } else {
      setDisplay(prev => prev + val);
    }
  };

  const handleScientific = (func: string) => {
    setDisplay(prev => prev + func + '(');
  };

  const calculateFinancial = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(time);
    const c = parseFloat(contribution) || 0;
    if (isNaN(p) || isNaN(r) || isNaN(t)) return;

    if (finType === 'compound') {
      const n = 12;
      const amountPrincipal = p * Math.pow(1 + r/n, n*t);
      const amountContrib = c * (Math.pow(1 + r/n, n*t) - 1) / (r/n);
      const total = amountPrincipal + amountContrib;
      const totalInvested = p + (c * n * t);
      const interest = total - totalInvested;
      setFinResult({
        label: 'Montante',
        value: total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        subValue: `Juros: ${interest.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
      });
    } else if (finType === 'loan') {
      const monthlyRate = r;
      const totalMonths = t;
      const pmt = p * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      const totalPaid = pmt * totalMonths;
      const interest = totalPaid - p;
      setFinResult({
        label: 'Parcela',
        value: pmt.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        subValue: `Total: ${totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
      });
    }
  };

  const renderKeypad = () => (
    <div className={`grid grid-cols-4 ${mode === 'scientific' ? 'gap-1' : 'gap-1.5'} p-2 w-full`}>
      {mode === 'scientific' && (
        <div className="col-span-4 grid grid-cols-4 gap-1 mb-1 animate-fade-in">
          <button onClick={() => handleScientific('sin')} className="btn-sci">sin</button>
          <button onClick={() => handleScientific('cos')} className="btn-sci">cos</button>
          <button onClick={() => handleScientific('tan')} className="btn-sci">tan</button>
          <button onClick={() => handleScientific('log')} className="btn-sci">log</button>
          <button onClick={() => handleScientific('ln')} className="btn-sci">ln</button>
          <button onClick={() => handleScientific('√')} className="btn-sci">√</button>
          <button onClick={() => handleBtn('^')} className="btn-sci">^</button>
          <button onClick={() => handleBtn('%')} className="btn-sci">%</button>
          <button onClick={() => handleBtn('(')} className="btn-sci">(</button>
          <button onClick={() => handleBtn(')')} className="btn-sci">)</button>
          <button onClick={() => handleBtn('π')} className="btn-sci">π</button>
          <button onClick={() => handleBtn('e')} className="btn-sci">e</button>
        </div>
      )}
      
      <button onClick={() => handleBtn('C')} className={`col-span-2 bg-red-500/10 text-red-400 font-bold rounded-lg p-2.5 hover:bg-red-500/20 active:scale-95 transition-all border border-red-500/20 text-xs`}>AC</button>
      <button onClick={() => handleBtn('DEL')} className={`bg-gray-800 text-gray-200 rounded-lg p-2.5 hover:bg-gray-750 active:scale-95 transition-all flex items-center justify-center border border-gray-700`}><Delete size={16} /></button>
      <button onClick={() => handleBtn('÷')} className={`bg-indigo-600/20 text-indigo-400 rounded-lg p-2.5 hover:bg-indigo-600/30 active:scale-95 transition-all flex items-center justify-center border border-indigo-500/30`}><Divide size={18} /></button>

      <button onClick={() => handleBtn('7')} className="btn-num">7</button>
      <button onClick={() => handleBtn('8')} className="btn-num">8</button>
      <button onClick={() => handleBtn('9')} className="btn-num">9</button>
      <button onClick={() => handleBtn('×')} className={`bg-indigo-600/20 text-indigo-400 rounded-lg p-2.5 hover:bg-indigo-600/30 active:scale-95 transition-all flex items-center justify-center border border-indigo-500/30`}><X size={18} /></button>

      <button onClick={() => handleBtn('4')} className="btn-num">4</button>
      <button onClick={() => handleBtn('5')} className="btn-num">5</button>
      <button onClick={() => handleBtn('6')} className="btn-num">6</button>
      <button onClick={() => handleBtn('-')} className={`bg-indigo-600/20 text-indigo-400 rounded-lg p-2.5 hover:bg-indigo-600/30 active:scale-95 transition-all flex items-center justify-center border border-indigo-500/30`}><Minus size={18} /></button>

      <button onClick={() => handleBtn('1')} className="btn-num">1</button>
      <button onClick={() => handleBtn('2')} className="btn-num">2</button>
      <button onClick={() => handleBtn('3')} className="btn-num">3</button>
      <button onClick={() => handleBtn('+')} className={`bg-indigo-600/20 text-indigo-400 rounded-lg p-2.5 hover:bg-indigo-600/30 active:scale-95 transition-all flex items-center justify-center border border-indigo-500/30`}><Plus size={18} /></button>

      <button onClick={() => handleBtn('0')} className="col-span-2 btn-num">0</button>
      <button onClick={() => handleBtn('.')} className="btn-num">.</button>
      <button onClick={() => handleBtn('=')} className={`bg-indigo-600 text-white rounded-lg p-2.5 hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-indigo-900/40`}><Equal size={20} /></button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white overflow-hidden items-center justify-start p-4">
      {/* Container Principal com Altura Limitada e Margem no Topo */}
      <div className="w-full max-w-[260px] max-h-[520px] bg-gray-900/40 rounded-[2rem] border border-gray-800 shadow-2xl flex flex-col overflow-hidden animate-fade-in backdrop-blur-sm mt-2">
        
        {/* Header / Mode Switcher */}
        <div className="w-full p-2 bg-gray-800/60 border-b border-gray-700/50 flex gap-1 justify-center shrink-0">
          <button 
            onClick={() => setMode('standard')}
            className={`px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all ${mode === 'standard' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Smp
          </button>
          <button 
            onClick={() => setMode('scientific')}
            className={`px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all ${mode === 'scientific' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Sci
          </button>
          <button 
            onClick={() => setMode('financial')}
            className={`px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all ${mode === 'financial' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Fin
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {mode !== 'financial' ? (
            <>
              {/* Display Screen com Altura Controlada */}
              <div className={`flex flex-col items-end justify-center px-4 py-4 break-words relative shrink-0 border-b border-gray-800/30 ${mode === 'scientific' ? 'h-20' : 'h-28'}`}>
                <div className="text-gray-500 text-[10px] mb-1 font-medium truncate w-full text-right h-4">{lastResult}</div>
                <div className={`text-white font-light tracking-tighter break-all text-right w-full leading-none transition-all ${mode === 'scientific' ? 'text-2xl' : 'text-4xl'}`}>
                  {display || '0'}
                </div>
              </div>

              {/* Keypad Wrapper */}
              <div className="flex-1 flex items-center justify-center bg-gray-950/20">
                {renderKeypad()}
              </div>
            </>
          ) : (
            <div className="p-4 flex-1 overflow-y-auto animate-fade-in custom-scrollbar">
              <div className="bg-gray-800/50 rounded-lg p-1 mb-4 flex border border-gray-700">
                <button 
                  onClick={() => { setFinType('compound'); setFinResult(null); }}
                  className={`flex-1 py-1.5 rounded text-[8px] font-bold uppercase transition-all ${finType === 'compound' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500'}`}
                >
                  Compostos
                </button>
                <button 
                  onClick={() => { setFinType('loan'); setFinResult(null); }}
                  className={`flex-1 py-1.5 rounded text-[8px] font-bold uppercase transition-all ${finType === 'loan' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500'}`}
                >
                  Empréstimo
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[7px] font-bold text-gray-500 uppercase tracking-widest ml-1">Principal (R$)</label>
                  <input 
                    type="number" 
                    value={principal} 
                    onChange={(e) => setPrincipal(e.target.value)} 
                    className="w-full bg-gray-800/40 border border-gray-700/50 rounded-lg p-2 text-white focus:border-indigo-500 outline-none text-xs"
                    placeholder="0.00"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[7px] font-bold text-gray-500 uppercase ml-1">
                      {finType === 'compound' ? 'Taxa (% a.a.)' : 'Taxa (% a.m.)'}
                    </label>
                    <input 
                      type="number" 
                      value={rate} 
                      onChange={(e) => setRate(e.target.value)} 
                      className="w-full bg-gray-800/40 border border-gray-700/50 rounded-lg p-2 text-white focus:border-indigo-500 outline-none text-xs"
                      placeholder="10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-bold text-gray-500 uppercase ml-1">{finType === 'compound' ? 'Anos' : 'Meses'}</label>
                    <input 
                      type="number" 
                      value={time} 
                      onChange={(e) => setTime(e.target.value)} 
                      className="w-full bg-gray-800/40 border border-gray-700/50 rounded-lg p-2 text-white focus:border-indigo-500 outline-none text-xs"
                      placeholder="5"
                    />
                  </div>
                </div>

                <button 
                  onClick={calculateFinancial}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg mt-2 shadow-lg text-[9px] uppercase tracking-widest transition-colors"
                >
                  Calcular
                </button>

                {finResult && (
                  <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-3 mt-3 text-center animate-slide-up">
                    <p className="text-gray-500 text-[7px] font-bold uppercase tracking-widest mb-1">{finResult.label}</p>
                    <h3 className="text-lg font-bold text-indigo-400 mb-0.5">{finResult.value}</h3>
                    {finResult.subValue && (
                      <div className="text-[7px] text-gray-500 border-t border-gray-800/30 pt-2 mt-1">
                        {finResult.subValue}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .btn-sci {
          @apply bg-gray-800/40 text-gray-400 text-[7px] font-black uppercase rounded-lg p-1.5 hover:bg-gray-800 hover:text-white active:scale-95 transition-all border border-gray-700/30 flex items-center justify-center h-7;
        }
        .btn-num {
          @apply bg-gray-800/30 text-white text-sm font-light rounded-lg ${mode === 'scientific' ? 'p-1.5' : 'p-2.5'} hover:bg-gray-750 active:scale-95 transition-all border border-gray-700/10;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
      `}</style>
    </div>
  );
};

export default CalculatorModule;
