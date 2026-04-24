
import React, { useState, useRef, useEffect } from 'react';
import { Delete, X, Plus, Minus, Divide, Equal, Calculator, TrendingUp, Table, Sigma, ArrowRightLeft, History, Settings } from 'lucide-react';

type Mode = 'standard' | 'scientific' | 'financial' | 'fin_pro';
type FinancialType = 'compound' | 'loan';
type FinProTab = 'tvm' | 'cash' | 'stat';

const CalculatorModule: React.FC = () => {
  const [mode, setMode] = useState<Mode>('standard');
  const [display, setDisplay] = useState('');
  const [lastResult, setLastResult] = useState('');
  const displayRef = useRef<HTMLDivElement>(null);

  // Advanced Scientific State
  const [isShift, setIsShift] = useState(false);
  const [memory, setMemory] = useState<number>(0);
  const [showFraction, setShowFraction] = useState(false);

  // Financial Basic State
  const [finType, setFinType] = useState<FinancialType>('compound');
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState(''); 
  const [contribution, setContribution] = useState('');
  const [finResult, setFinResult] = useState<{ label: string; value: string; subValue?: string; details?: string } | null>(null);

  // Financial PRO State
  const [proTab, setProTab] = useState<FinProTab>('tvm');
  const [tvmN, setTvmN] = useState('');
  const [tvmI, setTvmI] = useState('');
  const [tvmPV, setTvmPV] = useState('');
  const [tvmPMT, setTvmPMT] = useState('');
  const [tvmFV, setTvmFV] = useState('');
  const [tvmMode, setTvmMode] = useState<'end' | 'beg'>('end');
  const [amortizationSchedule, setAmortizationSchedule] = useState<any[]>([]);
  const [showAmortization, setShowAmortization] = useState(false);

  // Cash Flow / Stats
  const [cashFlows, setCashFlows] = useState<string>('-1000, 200, 300, 400, 500');
  const [cashResult, setCashResult] = useState<{ npv: string, irr: string } | null>(null);
  const [statData, setStatData] = useState<string>('10, 15, 20, 25, 30');
  const [statResult, setStatResult] = useState<{ mean: string, median: string, stdDev: string, count: number } | null>(null);

  // Auto-resize font
  const getFontSize = () => {
    if (display.length > 18) return 'text-xl sm:text-2xl';
    if (display.length > 12) return 'text-3xl sm:text-4xl';
    if (display.length > 9) return 'text-4xl sm:text-5xl';
    return 'text-5xl sm:text-6xl';
  };

  // Helper: GCD for Fraction
  const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
  const toFraction = (val: number): string => {
    const len = val.toString().length - 2;
    if (len < 0) return String(val);
    let denominator = Math.pow(10, len);
    let numerator = val * denominator;
    const divisor = gcd(numerator, denominator);
    numerator /= divisor;
    denominator /= divisor;
    if (denominator === 1) return String(numerator);
    return `${Math.floor(numerator)}/${Math.floor(denominator)}`;
  };
  const toDMS = (val: number): string => {
    const d = Math.floor(val);
    const minFloat = (val - d) * 60;
    const m = Math.floor(minFloat);
    const s = ((minFloat - m) * 60).toFixed(2);
    return `${d}° ${m}' ${s}"`;
  };

  const handleBtn = (val: string) => {
    if (val === 'C') {
      setDisplay('');
      setLastResult('');
      setShowFraction(false);
    } else if (val === 'DEL') {
      if (display === 'Erro') setDisplay('');
      else setDisplay(prev => prev.slice(0, -1));
    } else if (val === '=') {
      calculateResult();
    } else if (val === 'a/b') {
       if (display && !isNaN(Number(display))) setShowFraction(!showFraction);
    } else if (val === 'dms') {
       if (display && !isNaN(Number(display))) {
          setDisplay(toDMS(Number(display)));
          setLastResult('DMS Conv');
       }
    } else {
      setShowFraction(false); 
      if (display === 'Erro') setDisplay(val);
      else setDisplay(prev => prev + val);
    }
  };

  const handleScientific = (func: string) => {
    setShowFraction(false);
    let append = '';
    
    if (isShift) {
        switch(func) {
            case 'sin': append = 'asin('; break;
            case 'cos': append = 'acos('; break;
            case 'tan': append = 'atan('; break;
            case 'ln': append = 'e^'; break; // Changed to e^ for visual, handled in logic
            case 'log': append = '10^'; break;
            case '√': append = 'cbrt('; break;
            case '^': append = '^(1/'; break; 
            default: append = func;
        }
    } else {
        switch(func) {
            case 'sin': append = 'sin('; break;
            case 'cos': append = 'cos('; break;
            case 'tan': append = 'tan('; break;
            case 'ln': append = 'ln('; break;
            case 'log': append = 'log('; break;
            case '√': append = '√('; break;
            case '^': append = '^'; break;
            case '!': append = '!'; break;
            default: append = func;
        }
    }
    if (display === 'Erro') setDisplay(append);
    else setDisplay(prev => prev + append);
  };

  const handleMemory = (action: 'MRC' | 'M+' | 'M-') => {
    const currentVal = parseFloat(display);
    if (isNaN(currentVal) && action !== 'MRC') return;
    if (action === 'M+') {
        setMemory(prev => prev + currentVal);
        setLastResult(`M+ (${currentVal})`);
    } else if (action === 'M-') {
        setMemory(prev => prev - currentVal);
        setLastResult(`M- (${currentVal})`);
    } else if (action === 'MRC') {
        if (display === String(memory)) {
            setMemory(0);
            setLastResult('Memória Limpa');
        } else {
            setDisplay(String(memory));
            setLastResult('M Rec');
        }
    }
  };

  // --- ROBUST CALCULATION ENGINE ---
  const calculateResult = () => {
    try {
      if (!display) return;
      if (display.includes('°')) return;

      // Define Math functions in a local scope to be used by the evaluator
      const scope: any = {
        // Trigonometry in DEGREES
        sin: (d: number) => Math.sin(d * Math.PI / 180),
        cos: (d: number) => Math.cos(d * Math.PI / 180),
        tan: (d: number) => Math.tan(d * Math.PI / 180),
        // Inverse Trig returns DEGREES
        asin: (v: number) => Math.asin(v) * 180 / Math.PI,
        acos: (v: number) => Math.acos(v) * 180 / Math.PI,
        atan: (v: number) => Math.atan(v) * 180 / Math.PI,
        
        sqrt: Math.sqrt,
        cbrt: Math.cbrt,
        log: Math.log10,
        ln: Math.log,
        fact: (n: number) => {
             if (n < 0) return NaN;
             if (n === 0 || n === 1) return 1;
             let res = 1;
             for (let i = 2; i <= n; i++) res *= i;
             return res;
        },
        PI: Math.PI,
        E: Math.E,
        pow: Math.pow
      };

      // Prepare expression string
      let expr = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'PI')
        .replace(/e/g, 'E')
        .replace(/√\(/g, 'sqrt(')
        .replace(/!/g, '') // Factorial handled by regex logic or simplified?
                           // Actually, "5!" syntax is hard for eval. 
                           // Let's replace "num!" with "fact(num)".
        .replace(/(\d+)!/g, 'fact($1)')
        .replace(/\^/g, '**') // Power
        .replace(/%/g, '/100'); 

      // Implicit multiplication: 2sin(30) -> 2*sin(30), 2(3) -> 2*(3), ) ( -> )*(
      expr = expr.replace(/(\d)([a-z(])/g, '$1*$2');
      expr = expr.replace(/\)\(/g, ')*(');

      // Evaluate using Function constructor with scope
      const keys = Object.keys(scope);
      const values = Object.values(scope);
      
      // eslint-disable-next-line no-new-func
      const func = new Function(...keys, `return ${expr};`);
      const res = func(...values);

      if (!isFinite(res) || isNaN(res)) {
          setLastResult('Erro Matemático');
      } else {
          const resString = String(res);
          setLastResult(`${display} =`);
          // Avoid tiny precision errors like 0.000000000004
          const precise = Math.abs(res) < 1e-10 && res !== 0 ? 0 : parseFloat(res.toPrecision(12));
          setDisplay(String(precise));
      }
    } catch (e) {
      setLastResult('Erro de Sintaxe');
    }
  };

  const calculateFinancialBasic = () => {
    const p = parseFloat(principal);
    const r_annual = parseFloat(rate);
    const t = parseFloat(time);
    const c = parseFloat(contribution) || 0;

    if (isNaN(p) || isNaN(r_annual) || isNaN(t)) return;
    const r_monthly = (r_annual / 100) / 12;

    if (finType === 'compound') {
      const totalMonths = t * 12;
      const fv_principal = p * Math.pow(1 + r_monthly, totalMonths);
      let fv_contributions = 0;
      if (c > 0 && r_monthly > 0) {
        fv_contributions = c * ((Math.pow(1 + r_monthly, totalMonths) - 1) / r_monthly);
      } else if (c > 0 && r_monthly === 0) fv_contributions = c * totalMonths;
      
      const total = fv_principal + fv_contributions;
      const totalInvested = p + (c * totalMonths);
      setFinResult({
        label: 'Valor Total Bruto',
        value: total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        subValue: `Juros: ${(total - totalInvested).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
        details: `Investido: ${totalInvested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
      });
    } else {
      const totalMonths = t; 
      let pmt = 0;
      if (r_monthly > 0) {
        pmt = p * (r_monthly * Math.pow(1 + r_monthly, totalMonths)) / (Math.pow(1 + r_monthly, totalMonths) - 1);
      } else pmt = p / totalMonths;
      
      const totalPaid = pmt * totalMonths;
      setFinResult({
        label: 'Parcela Mensal',
        value: pmt.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        subValue: `Total Pago: ${totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
        details: `Juros: ${(totalPaid - p).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
      });
    }
  };

  const solveTVM = (target: 'n' | 'i' | 'pv' | 'pmt' | 'fv') => {
    const n = parseFloat(tvmN);
    const i = parseFloat(tvmI) / 100;
    const pv = parseFloat(tvmPV);
    const pmt = parseFloat(tvmPMT);
    const fv = parseFloat(tvmFV);
    const type = tvmMode === 'beg' ? 1 : 0;

    try {
      if (target === 'fv') {
         if (isNaN(n) || isNaN(i) || isNaN(pv) || isNaN(pmt)) return;
         let fvVal = i === 0 ? -(pv + pmt * n) : -(pv * Math.pow(1 + i, n) + pmt * ((Math.pow(1 + i, n) - 1) / i) * (type ? (1 + i) : 1));
         setTvmFV(fvVal.toFixed(2));
         generateAmortization(pv, i, n, pmt, fvVal);
      } 
      else if (target === 'pmt') {
         if (isNaN(n) || isNaN(i) || isNaN(pv) || isNaN(fv)) return;
         let pmtVal = i === 0 ? -(pv + fv) / n : -(pv * Math.pow(1+i, n) + fv) / (((Math.pow(1+i, n) - 1) / i) * (type ? (1+i) : 1));
         setTvmPMT(pmtVal.toFixed(2));
         generateAmortization(pv, i, n, pmtVal, fv);
      }
      else if (target === 'pv') {
         if (isNaN(n) || isNaN(i) || isNaN(pmt) || isNaN(fv)) return;
         let pvVal = i === 0 ? -(fv + pmt * n) : -(fv / Math.pow(1 + i, n) + pmt * ((1 - Math.pow(1 + i, -n)) / i) * (type ? (1+i) : 1));
         setTvmPV(pvVal.toFixed(2));
      }
    } catch (e) { setLastResult("Erro no Cálculo"); }
  };

  const generateAmortization = (pv: number, i: number, n: number, pmt: number, fv: number) => {
      const schedule = [];
      let balance = pv;
      for (let period = 1; period <= Math.ceil(n); period++) {
          const interest = balance * i;
          const payment = Math.abs(pmt); 
          const principalPaid = payment - interest;
          balance = balance - principalPaid;
          schedule.push({ period, payment: payment.toFixed(2), interest: interest.toFixed(2), principal: principalPaid.toFixed(2), balance: balance > 0 ? balance.toFixed(2) : "0.00" });
          if (balance <= 0) break;
      }
      setAmortizationSchedule(schedule);
  };

  const calculateCashFlow = () => {
    const flows = cashFlows.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    if (flows.length < 2) return;
    const calculateIRR = (values: number[], guess = 0.1) => {
        let x0 = guess;
        for (let i = 0; i < 50; i++) {
            let fValue = 0, fDerivative = 0;
            for (let j = 0; j < values.length; j++) {
                fValue += values[j] / Math.pow(1 + x0, j);
                fDerivative += -j * values[j] / Math.pow(1 + x0, j + 1);
            }
            const x1 = x0 - fValue / fDerivative;
            if (Math.abs(x1 - x0) < 0.00001) return x1;
            x0 = x1;
        }
        return x0;
    };
    const irr = calculateIRR(flows);
    let npv10 = 0;
    flows.forEach((v, i) => { npv10 += v / Math.pow(1.1, i) });
    setCashResult({ irr: (irr * 100).toFixed(2), npv: npv10.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) });
  };

  const calculateStats = () => {
      const data = statData.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
      if (data.length === 0) return;
      const sum = data.reduce((a, b) => a + b, 0);
      const mean = sum / data.length;
      const sorted = [...data].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (data.length - 1);
      setStatResult({ mean: mean.toFixed(4), median: median.toFixed(4), stdDev: Math.sqrt(variance).toFixed(4), count: data.length });
  };

  // --- UI COMPONENTS ---
  const Button = ({ val, onClick, type = 'num', className = '', labelOverride, icon }: any) => {
    // Style logic
    let baseSize = "h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16";
    if (type === 'zero') baseSize = "h-12 sm:h-14 md:h-16 w-full";

    let style = `flex items-center justify-center rounded-full text-lg sm:text-xl md:text-2xl font-medium transition-all active:scale-95 select-none shadow-sm mx-auto ${baseSize} `;
    
    if (type === 'num') style += "bg-zinc-800 text-white hover:bg-zinc-700";
    if (type === 'op') style += "bg-amber-500 text-white hover:bg-amber-400 text-2xl sm:text-3xl pb-1"; 
    if (type === 'func') style += "bg-zinc-400 text-black font-semibold hover:bg-zinc-300 text-base sm:text-lg"; 
    if (type === 'mem') style += "bg-zinc-700 text-amber-500 font-bold hover:bg-zinc-600 text-xs sm:text-sm";
    if (type === 'shift') style += isShift ? "bg-amber-600 text-white" : "bg-zinc-700 text-amber-500";
    if (type === 'eq') style += "bg-green-600 text-white hover:bg-green-500";
    if (type === 'ac') style += "bg-red-500/20 text-red-500 hover:bg-red-500/30 font-bold";
    
    if (type === 'zero') style += " rounded-full pl-6 sm:pl-8 justify-start";

    return (
      <button onClick={() => onClick(val)} className={`${style} ${className}`}>
        {icon ? icon : (labelOverride || val)}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-black text-white items-center justify-center md:py-8 font-sans overflow-hidden">
      
      {/* Device Frame (Desktop/Tablet) or Full Screen (Mobile) */}
      <div className="w-full h-full md:h-[95%] md:max-h-[900px] max-w-sm md:max-w-md bg-black md:bg-gray-950 md:rounded-[3rem] md:shadow-2xl md:border-[6px] md:border-gray-800 flex flex-col overflow-hidden relative">
        
        {/* Top Bar / Mode Switcher */}
        <div className="pt-4 px-4 flex items-center justify-center shrink-0 z-20">
          <div className="bg-gray-900/90 backdrop-blur-md p-1.5 rounded-full flex gap-1 shadow-lg border border-gray-800">
             {[
               { id: 'standard', icon: <Calculator size={18}/> },
               { id: 'scientific', icon: <History size={18}/> }, // Using History icon as abstract for complex/sci
               { id: 'financial', icon: <TrendingUp size={18}/> },
               { id: 'fin_pro', icon: <Settings size={18}/> }
             ].map(m => (
               <button 
                key={m.id} 
                onClick={() => setMode(m.id as Mode)}
                className={`p-3 rounded-full transition-all ${mode === m.id ? 'bg-amber-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
               >
                 {m.icon}
               </button>
             ))}
          </div>
        </div>

        {/* --- STANDARD & SCIENTIFIC UI --- */}
        {(mode === 'standard' || mode === 'scientific') && (
          <>
            {/* Display Area */}
            <div className="flex-1 flex flex-col items-end justify-end p-6 gap-2 break-all relative mt-8">
               <div className="flex gap-4 text-[10px] text-gray-500 font-bold tracking-widest uppercase absolute top-4 left-6">
                  {mode === 'scientific' && <span className="text-amber-500">DEG</span>}
                  {isShift && <span className="bg-amber-500 text-black px-1 rounded">SHIFT</span>}
                  {memory !== 0 && <span className="text-white">MEM</span>}
               </div>

               <div className="text-gray-500 text-lg font-light h-6">{lastResult}</div>
               <div 
                 ref={displayRef} 
                 className={`${getFontSize()} font-light tracking-tight text-right text-white transition-all duration-200 select-all leading-none`}
               >
                 {showFraction && !isNaN(Number(display)) ? toFraction(Number(display)) : (display || '0')}
               </div>
            </div>

            {/* Keypad */}
            <div className="bg-gray-900/40 p-3 sm:p-5 pb-8 md:rounded-b-[2.5rem]">
              {mode === 'scientific' ? (
                <div className="grid grid-cols-5 gap-2 sm:gap-3 justify-items-center">
                   {/* Row 1 */}
                   <Button type="shift" val="SHIFT" onClick={() => setIsShift(!isShift)} labelOverride={isShift ? '2ND' : 'SFT'} className="!text-[10px] sm:!text-xs" />
                   <Button type="mem" val="MRC" onClick={() => handleMemory('MRC')} />
                   <Button type="mem" val="M-" onClick={() => handleMemory('M-')} />
                   <Button type="mem" val="M+" onClick={() => handleMemory('M+')} />
                   <Button type="func" val="DEL" onClick={handleBtn} icon={<Delete size={20}/>} className="!bg-red-900/40 !text-red-400" />

                   {/* Row 2 */}
                   <Button type="func" val="sin" onClick={() => handleScientific('sin')} labelOverride={isShift ? 'asin' : 'sin'} className="!text-xs sm:!text-sm" />
                   <Button type="func" val="cos" onClick={() => handleScientific('cos')} labelOverride={isShift ? 'acos' : 'cos'} className="!text-xs sm:!text-sm" />
                   <Button type="func" val="tan" onClick={() => handleScientific('tan')} labelOverride={isShift ? 'atan' : 'tan'} className="!text-xs sm:!text-sm" />
                   <Button type="func" val="log" onClick={() => handleScientific('log')} labelOverride={isShift ? '10ˣ' : 'log'} className="!text-xs sm:!text-sm" />
                   <Button type="func" val="ln" onClick={() => handleScientific('ln')} labelOverride={isShift ? 'eˣ' : 'ln'} className="!text-xs sm:!text-sm" />
                   
                   {/* Row 3 */}
                   <Button type="func" val="(" onClick={handleBtn} className="!text-xs sm:!text-sm" />
                   <Button type="func" val=")" onClick={handleBtn} className="!text-xs sm:!text-sm" />
                   <Button type="func" val="√" onClick={() => handleScientific('√')} labelOverride={isShift ? '∛' : '√'} className="!text-xs sm:!text-sm" />
                   <Button type="func" val="^" onClick={() => handleScientific('^')} labelOverride={isShift ? 'ʸ√x' : 'xʸ'} className="!text-xs sm:!text-sm" />
                   <Button type="func" val="!" onClick={() => handleScientific('!')} labelOverride="n!" className="!text-xs sm:!text-sm" />

                   {/* Standard Numpad Overlay */}
                   <div className="col-span-5 grid grid-cols-4 gap-2 sm:gap-3 mt-2 w-full">
                     <Button type="ac" val="C" onClick={handleBtn} />
                     <Button type="func" val="π" onClick={handleBtn} />
                     <Button type="func" val="%" onClick={handleBtn} />
                     <Button type="op" val="÷" onClick={handleBtn} icon={<Divide size={24}/>} />

                     <Button val="7" onClick={handleBtn} />
                     <Button val="8" onClick={handleBtn} />
                     <Button val="9" onClick={handleBtn} />
                     <Button type="op" val="×" onClick={handleBtn} icon={<X size={24}/>} />

                     <Button val="4" onClick={handleBtn} />
                     <Button val="5" onClick={handleBtn} />
                     <Button val="6" onClick={handleBtn} />
                     <Button type="op" val="-" onClick={handleBtn} icon={<Minus size={24}/>} />

                     <Button val="1" onClick={handleBtn} />
                     <Button val="2" onClick={handleBtn} />
                     <Button val="3" onClick={handleBtn} />
                     <Button type="op" val="+" onClick={handleBtn} icon={<Plus size={24}/>} />

                     <Button val="0" onClick={handleBtn} type="zero" className="col-span-2" />
                     <Button val="." onClick={handleBtn} />
                     <Button type="eq" val="=" onClick={handleBtn} icon={<Equal size={24}/>} />
                   </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3 sm:gap-4 justify-items-center">
                  <Button type="ac" val="C" onClick={handleBtn} />
                  <Button type="func" val="DEL" onClick={handleBtn} icon={<Delete size={24}/>} />
                  <Button type="func" val="%" onClick={handleBtn} />
                  <Button type="op" val="÷" onClick={handleBtn} icon={<Divide size={24}/>} />

                  <Button val="7" onClick={handleBtn} />
                  <Button val="8" onClick={handleBtn} />
                  <Button val="9" onClick={handleBtn} />
                  <Button type="op" val="×" onClick={handleBtn} icon={<X size={24}/>} />

                  <Button val="4" onClick={handleBtn} />
                  <Button val="5" onClick={handleBtn} />
                  <Button val="6" onClick={handleBtn} />
                  <Button type="op" val="-" onClick={handleBtn} icon={<Minus size={24}/>} />

                  <Button val="1" onClick={handleBtn} />
                  <Button val="2" onClick={handleBtn} />
                  <Button val="3" onClick={handleBtn} />
                  <Button type="op" val="+" onClick={handleBtn} icon={<Plus size={24}/>} />

                  <Button val="0" onClick={handleBtn} type="zero" className="col-span-2" />
                  <Button val="." onClick={handleBtn} />
                  <Button type="eq" val="=" onClick={handleBtn} icon={<Equal size={24}/>} />
                </div>
              )}
            </div>
          </>
        )}

        {/* --- FINANCIAL MODES --- */}
        {(mode === 'financial' || mode === 'fin_pro') && (
           <div className="flex-1 overflow-y-auto p-6 pb-20 scroll-smooth">
             
             {/* Header */}
             <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">
                   {mode === 'financial' ? 'Calculadora Financeira' : 'Finanças Pro'}
                </h2>
                <p className="text-gray-500 text-sm">
                   {mode === 'financial' ? 'Juros Compostos e Financiamentos' : 'TVM, Fluxo de Caixa e Estatísticas'}
                </p>
             </div>

             {mode === 'financial' ? (
                // FINANCIAL BASIC
                <div className="space-y-4">
                  <div className="flex bg-gray-900 p-1 rounded-xl mb-4 border border-gray-800">
                    <button onClick={() => setFinType('compound')} className={`flex-1 py-2 text-sm rounded-lg ${finType === 'compound' ? 'bg-amber-600 text-white' : 'text-gray-400'}`}>Juros Compostos</button>
                    <button onClick={() => setFinType('loan')} className={`flex-1 py-2 text-sm rounded-lg ${finType === 'loan' ? 'bg-amber-600 text-white' : 'text-gray-400'}`}>Financiamento</button>
                  </div>

                  <div className="space-y-4">
                     <div>
                       <label className="text-xs text-gray-500 font-bold ml-2">PRINCIPAL (R$)</label>
                       <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-white text-lg focus:border-amber-500 outline-none" placeholder="0.00" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-500 font-bold ml-2">TAXA ANUAL (%)</label>
                          <input type="number" value={rate} onChange={e => setRate(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-white text-lg focus:border-amber-500 outline-none" placeholder="13.75" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 font-bold ml-2">{finType === 'compound' ? 'ANOS' : 'MESES'}</label>
                          <input type="number" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-white text-lg focus:border-amber-500 outline-none" placeholder="12" />
                        </div>
                     </div>
                     {finType === 'compound' && (
                        <div>
                           <label className="text-xs text-gray-500 font-bold ml-2">APORTE MENSAL (R$)</label>
                           <input type="number" value={contribution} onChange={e => setContribution(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-white text-lg focus:border-amber-500 outline-none" placeholder="0.00" />
                        </div>
                     )}
                     <button onClick={calculateFinancialBasic} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-4 rounded-2xl shadow-lg mt-2 active:scale-95 transition-all">CALCULAR</button>
                  </div>
                  
                  {finResult && (
                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mt-6 text-center animate-slide-up">
                       <p className="text-gray-500 text-xs uppercase font-bold mb-1">{finResult.label}</p>
                       <h3 className="text-3xl font-bold text-amber-500 mb-2">{finResult.value}</h3>
                       <div className="text-sm text-gray-300">{finResult.subValue}</div>
                       <div className="text-xs text-gray-600 mt-1">{finResult.details}</div>
                    </div>
                  )}
                </div>
             ) : (
                // FINANCIAL PRO
                <div>
                   <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
                      <button onClick={() => setProTab('tvm')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${proTab === 'tvm' ? 'bg-amber-600 text-white' : 'bg-gray-900 text-gray-500'}`}>TVM Solver</button>
                      <button onClick={() => setProTab('cash')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${proTab === 'cash' ? 'bg-amber-600 text-white' : 'bg-gray-900 text-gray-500'}`}>Fluxo Caixa</button>
                      <button onClick={() => setProTab('stat')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${proTab === 'stat' ? 'bg-amber-600 text-white' : 'bg-gray-900 text-gray-500'}`}>Estatística</button>
                   </div>

                   {proTab === 'tvm' && (
                     <div className="space-y-3 animate-slide-up">
                        <div className="bg-amber-900/20 text-amber-500 text-xs p-3 rounded-lg border border-amber-900/50 flex items-center gap-2 mb-4">
                           <ArrowRightLeft size={14}/> Preencha 4 campos e clique no botão do 5º.
                        </div>
                        {[
                           { id: 'n', label: 'N (Prazo)', val: tvmN, set: setTvmN },
                           { id: 'i', label: 'I (Taxa %)', val: tvmI, set: setTvmI },
                           { id: 'pv', label: 'PV (Presente)', val: tvmPV, set: setTvmPV },
                           { id: 'pmt', label: 'PMT (Pagamento)', val: tvmPMT, set: setTvmPMT },
                           { id: 'fv', label: 'FV (Futuro)', val: tvmFV, set: setTvmFV },
                        ].map((f) => (
                           <div key={f.id} className="flex gap-3">
                              <div className="flex-1">
                                 <label className="text-[10px] font-bold text-gray-600 ml-2 uppercase">{f.label}</label>
                                 <input type="number" value={f.val} onChange={e => f.set(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" placeholder="0" />
                              </div>
                              <button onClick={() => solveTVM(f.id as any)} className="bg-amber-600 hover:bg-amber-500 text-white font-bold w-16 rounded-xl mt-5 shadow-lg active:scale-95 text-xs">CALC</button>
                           </div>
                        ))}
                        <div className="flex justify-between items-center bg-gray-900 p-2 rounded-xl mt-2 px-4">
                           <span className="text-xs text-gray-500 font-bold">MODO</span>
                           <div className="flex gap-1">
                              <button onClick={() => setTvmMode('end')} className={`px-3 py-1 rounded text-xs ${tvmMode === 'end' ? 'bg-amber-600 text-white' : 'text-gray-500'}`}>END</button>
                              <button onClick={() => setTvmMode('beg')} className={`px-3 py-1 rounded text-xs ${tvmMode === 'beg' ? 'bg-amber-600 text-white' : 'text-gray-500'}`}>BEG</button>
                           </div>
                        </div>
                        {amortizationSchedule.length > 0 && (
                          <div className="mt-4 border-t border-gray-800 pt-4">
                             <button onClick={() => setShowAmortization(!showAmortization)} className="w-full py-3 bg-gray-900 text-gray-300 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-800"><Table size={16}/> Tabela Price</button>
                             {showAmortization && (
                                <div className="mt-4 max-h-60 overflow-y-auto rounded-xl border border-gray-800">
                                   <table className="w-full text-xs text-left text-gray-400">
                                      <thead className="bg-gray-800 text-gray-200 sticky top-0"><tr><th className="p-2">Mês</th><th className="p-2">Juros</th><th className="p-2">Amort</th><th className="p-2">Saldo</th></tr></thead>
                                      <tbody>
                                         {amortizationSchedule.map((r) => (
                                            <tr key={r.period} className="border-b border-gray-800 hover:bg-gray-900/50">
                                               <td className="p-2">{r.period}</td>
                                               <td className="p-2 text-red-400">{r.interest}</td>
                                               <td className="p-2 text-green-400">{r.principal}</td>
                                               <td className="p-2 text-white">{r.balance}</td>
                                            </tr>
                                         ))}
                                      </tbody>
                                   </table>
                                </div>
                             )}
                          </div>
                        )}
                     </div>
                   )}

                   {proTab === 'cash' && (
                     <div className="animate-slide-up space-y-4">
                        <div>
                           <label className="text-xs text-gray-500 font-bold ml-2">FLUXOS DE CAIXA (Separados por vírgula)</label>
                           <textarea value={cashFlows} onChange={e => setCashFlows(e.target.value)} className="w-full h-32 bg-gray-900 border border-gray-800 rounded-2xl p-4 text-white text-sm focus:border-amber-500 outline-none resize-none mt-1" />
                        </div>
                        <button onClick={calculateCashFlow} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-4 rounded-2xl shadow-lg active:scale-95">CALCULAR TIR & VPL</button>
                        {cashResult && (
                           <div className="grid grid-cols-2 gap-4 mt-4">
                              <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 text-center"><p className="text-xs text-gray-500 font-bold">TIR (IRR)</p><p className="text-2xl font-bold text-green-400">{cashResult.irr}%</p></div>
                              <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 text-center"><p className="text-xs text-gray-500 font-bold">VPL (NPV)</p><p className="text-lg font-bold text-white truncate">{cashResult.npv}</p></div>
                           </div>
                        )}
                     </div>
                   )}

                   {proTab === 'stat' && (
                     <div className="animate-slide-up space-y-4">
                        <div>
                           <label className="text-xs text-gray-500 font-bold ml-2">DADOS (Separados por vírgula)</label>
                           <textarea value={statData} onChange={e => setStatData(e.target.value)} className="w-full h-32 bg-gray-900 border border-gray-800 rounded-2xl p-4 text-white text-sm focus:border-amber-500 outline-none resize-none mt-1" />
                        </div>
                        <button onClick={calculateStats} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-4 rounded-2xl shadow-lg active:scale-95">CALCULAR ESTATÍSTICA</button>
                        {statResult && (
                           <div className="grid grid-cols-2 gap-3 mt-4">
                              <div className="bg-gray-900 p-3 rounded-2xl border border-gray-800"><p className="text-[10px] text-gray-500 font-bold uppercase">Média</p><p className="text-lg font-bold text-white">{statResult.mean}</p></div>
                              <div className="bg-gray-900 p-3 rounded-2xl border border-gray-800"><p className="text-[10px] text-gray-500 font-bold uppercase">Mediana</p><p className="text-lg font-bold text-white">{statResult.median}</p></div>
                              <div className="bg-gray-900 p-3 rounded-2xl border border-gray-800"><p className="text-[10px] text-gray-500 font-bold uppercase">Desvio Padrão</p><p className="text-lg font-bold text-amber-500">{statResult.stdDev}</p></div>
                              <div className="bg-gray-900 p-3 rounded-2xl border border-gray-800"><p className="text-[10px] text-gray-500 font-bold uppercase">Amostra</p><p className="text-lg font-bold text-white">{statResult.count}</p></div>
                           </div>
                        )}
                     </div>
                   )}
                </div>
             )}
           </div>
        )}
      </div>
    </div>
  );
};

export default CalculatorModule;
