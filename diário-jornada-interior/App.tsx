import React, { useState } from 'react';
import { Step, JournalEntry, AiFeedbackState } from './types';
import { ProgressBar } from './components/ProgressBar';
import { StepCard } from './components/StepCard';
import { SpeechInput } from './components/SpeechInput';
import { generateCoachingFeedback } from './services/geminiService';
import { saveJournalEntry } from './services/supabaseService';
import { jsPDF } from "jspdf";
import { 
  PenTool, 
  Lightbulb, 
  RotateCcw, 
  ListTodo, 
  Heart, 
  BrainCircuit, 
  Sparkles,
  Leaf,
  Printer,
  User
} from 'lucide-react';

const getInitialEntry = (userName: string = ''): JournalEntry => ({
  userName: userName,
  date: new Date().toLocaleDateString('pt-BR'),
  positiveHighlight: '',
  contributionIdea: '',
  rewindChange: '',
  tomorrowActions: ['', '', '', '', '', ''],
  productivityScore: 8,
  productivityReason: '',
  gratitudeList: ['', '', ''],
  forgivenessSelf: '',
  forgivenessOthers: '',
  learningConclusion: ''
});

export default function App() {
  const [step, setStep] = useState<number>(Step.REFLECTION);
  const [entry, setEntry] = useState<JournalEntry>(getInitialEntry());
  const [aiFeedback, setAiFeedback] = useState<AiFeedbackState>({ loading: false, content: null, error: null });
  const [showIntro, setShowIntro] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const totalSteps = 6;

  const handleTextChange = (field: keyof JournalEntry, value: string) => {
    setEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'tomorrowActions' | 'gratitudeList', index: number, value: string) => {
    setEntry(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const finishJournal = async () => {
    // 1. Move to Review Step immediately to show loading state
    setStep(Step.REVIEW);
    setAiFeedback({ loading: true, content: null, error: null });
    
    // 2. Get AI Feedback
    const feedback = await generateCoachingFeedback(entry);
    setAiFeedback({ loading: false, content: feedback, error: null });

    // 3. Save to Supabase
    setIsSaving(true);
    const result = await saveJournalEntry(entry, feedback);
    setIsSaving(false);
    
    if (result.success) {
      setSaveStatus('success');
    } else {
      setSaveStatus('error');
    }
  };

  const nextStep = () => {
    // If we are on the Forgiveness step (index 4), the next logical step is to FINISH
    if (step === Step.FORGIVENESS) {
      finishJournal();
    } else if (step < Step.REVIEW) {
      setStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const startNewJournal = () => {
    // Preserves the username but resets the rest of the entry
    setEntry(getInitialEntry(entry.userName));
    setStep(Step.REFLECTION);
    setAiFeedback({ loading: false, content: null, error: null });
    setSaveStatus('idle');
    window.scrollTo(0, 0);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    let y = 20;

    // Helper to add text and update Y position
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false, color: string = '#000000') => {
      doc.setFontSize(fontSize);
      doc.setTextColor(color);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      
      const lines = doc.splitTextToSize(text || "---", contentWidth);
      doc.text(lines, margin, y);
      y += (lines.length * fontSize * 0.5) + 6;
      
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    };

    const addSection = (title: string, content: string | string[]) => {
      y += 5;
      doc.setFillColor(240, 240, 240); // Light gray background for headers
      doc.rect(margin, y - 6, contentWidth, 10, 'F');
      addText(title, 12, true, '#0ea5e9'); // Brand color
      
      if (Array.isArray(content)) {
        content.forEach(item => {
          if (item.trim()) addText(`• ${item}`, 11);
        });
      } else {
        addText(content, 11);
      }
      y += 5;
    };

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor('#0c4a6e'); // Brand dark
    doc.text("Diário Jornada Interior", pageWidth / 2, y, { align: "center" });
    y += 10;
    
    doc.setFontSize(12);
    doc.setTextColor('#78716c');
    doc.text(`${entry.date} • ${entry.userName}`, pageWidth / 2, y, { align: "center" });
    y += 20;

    // Content
    addSection("O que fez o dia valer a pena?", entry.positiveHighlight);
    addSection("Ideia para contribuir com o mundo", entry.contributionIdea);
    addSection("O que faria de diferente hoje?", entry.rewindChange);
    addSection("Ações para Amanhã", entry.tomorrowActions.filter(a => a.trim() !== ''));
    
    // Productivity
    y += 5;
    addText(`Nota de Produtividade: ${entry.productivityScore}/10`, 12, true);
    addText(`Motivo: ${entry.productivityReason}`, 11);
    y += 5;

    addSection("Gratidão", entry.gratitudeList.filter(g => g.trim() !== ''));
    addSection("Perdão a si mesmo", entry.forgivenessSelf);
    addSection("Perdão aos outros", entry.forgivenessOthers);
    addSection("Aprendizado do Dia", entry.learningConclusion);

    // AI Feedback
    if (aiFeedback.content) {
        y += 10;
        doc.setDrawColor(14, 165, 233);
        doc.setLineWidth(1);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
        addText("Insight do MentorHubAI", 14, true, '#4338ca');
        addText(aiFeedback.content, 11, false, '#4338ca');
    }

    doc.save(`diario-jornada-interior-${entry.userName.replace(/\s+/g, '-')}-${entry.date.replace(/\//g, '-')}.pdf`);
  };

  // Intro Screen
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-stone-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl text-center border border-white/50">
          <div className="flex justify-center mb-6">
            <div className="bg-brand-100 p-4 rounded-full">
              <PenTool size={48} className="text-brand-600" />
            </div>
          </div>
          <h1 className="text-3xl font-serif font-bold text-brand-900 mb-2">Diário Jornada Interior</h1>
          <p className="text-stone-600 mb-6 leading-relaxed">
            Reserve alguns minutos para se conectar consigo mesmo, celebrar suas vitórias e planejar um amanhã brilhante.
          </p>

          <div className="mb-6 text-left">
            <label className="block text-brand-800 font-serif font-semibold mb-2 flex items-center gap-2">
              <User size={18} />
              Como gostaria de ser chamado?
            </label>
            <SpeechInput 
              value={entry.userName}
              onChange={(val) => handleTextChange('userName', val)}
              placeholder="Digite ou diga seu nome..."
              className="text-lg shadow-sm"
            />
          </div>

          <button 
            onClick={() => {
              if (entry.userName.trim()) {
                setShowIntro(false);
              } else {
                alert("Por favor, diga-nos seu nome para começar.");
              }
            }}
            className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-500/30 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!entry.userName.trim()}
          >
            Iniciar Jornada de Hoje
          </button>
        </div>
      </div>
    );
  }

  // Helper to render steps
  const renderStep = () => {
    switch (step) {
      case Step.REFLECTION:
        return (
          <StepCard 
            title={`Reflexão do Dia, ${entry.userName.split(' ')[0]}`}
            subtitle="Conecte-se com os momentos positivos e o seu impacto no mundo."
            onNext={nextStep} 
            isFirst={true}
          >
            <div className="space-y-8">
              <SpeechInput
                label={
                  <label className="block text-brand-800 font-serif font-semibold flex items-center gap-2">
                    <Sparkles size={18} className="text-yellow-500" />
                    O que trouxe brilho aos seus olhos hoje?
                  </label>
                }
                value={entry.positiveHighlight}
                onChange={(val) => handleTextChange('positiveHighlight', val)}
                placeholder="Descreva um momento, uma conversa ou uma pequena vitória que fez seu dia valer a pena..."
                isTextArea={true}
              />

              <SpeechInput
                label={
                  <label className="block text-brand-800 font-serif font-semibold flex items-center gap-2">
                    <Lightbulb size={18} className="text-amber-500" />
                    Qual semente você plantou hoje para o futuro?
                  </label>
                }
                value={entry.contributionIdea}
                onChange={(val) => handleTextChange('contributionIdea', val)}
                placeholder="Uma ideia, uma atitude gentil, ou um trabalho bem feito que contribui para algo maior..."
                isTextArea={true}
              />
            </div>
          </StepCard>
        );

      case Step.IMPROVEMENT:
        return (
          <StepCard 
            title="Crescimento Contínuo" 
            subtitle="Aprender com o passado para melhorar o presente."
            onNext={nextStep} 
            onPrev={prevStep}
          >
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 mb-6">
                <p className="text-sm text-blue-800 italic">"Não há falhas, apenas feedback."</p>
              </div>
              
              <SpeechInput
                label={
                  <label className="block text-brand-800 font-serif font-semibold flex items-center gap-2">
                    <RotateCcw size={18} className="text-brand-600" />
                    Se você possuísse uma máquina do tempo apenas para hoje, o que faria diferente?
                  </label>
                }
                value={entry.rewindChange}
                onChange={(val) => handleTextChange('rewindChange', val)}
                placeholder="Reflita sobre uma reação, uma decisão ou uma palavra dita que poderia ser melhor..."
                isTextArea={true}
              />
            </div>
          </StepCard>
        );

      case Step.PLANNING:
        return (
          <StepCard 
            title="Arquitetando o Amanhã" 
            subtitle="Defina intenções claras para um dia produtivo."
            onNext={nextStep} 
            onPrev={prevStep}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-brand-800 font-serif font-semibold mb-4 flex items-center gap-2">
                  <ListTodo size={18} className="text-green-600" />
                  6 Ações prioritárias para realizar amanhã
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entry.tomorrowActions.map((action, index) => (
                    <div key={index} className="relative">
                      <span className="absolute left-3 top-3.5 text-stone-400 font-bold text-sm z-10">#{index + 1}</span>
                      <SpeechInput
                        value={action}
                        onChange={(val) => handleArrayChange('tomorrowActions', index, val)}
                        placeholder="Ação concreta..."
                        className="pl-10"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-stone-200">
                <label className="block text-brand-800 font-serif font-semibold mb-3">
                  Nível de Confiança (0-10)
                </label>
                <div className="flex items-center gap-4 mb-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    value={entry.productivityScore}
                    onChange={(e) => setEntry({...entry, productivityScore: parseInt(e.target.value)})}
                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                  />
                  <span className="text-2xl font-bold text-brand-600 min-w-[2ch] text-center">{entry.productivityScore}</span>
                </div>
                <SpeechInput
                   value={entry.productivityReason}
                   onChange={(val) => handleTextChange('productivityReason', val)}
                   placeholder="Por que você acredita nessa nota? (Argumentos)"
                   className="text-sm"
                />
              </div>
            </div>
          </StepCard>
        );

      case Step.GRATITUDE:
        return (
          <StepCard 
            title="Tríade da Gratidão" 
            subtitle="Eleve sua vibração reconhecendo o que há de bom."
            onNext={nextStep} 
            onPrev={prevStep}
          >
            <div className="space-y-6">
               <div className="text-center mb-6">
                 <Heart className="mx-auto text-rose-400 mb-2 h-12 w-12 animate-pulse" />
                 <p className="text-stone-600">Agradeça por 3 bênçãos, fatos ou emoções do dia.</p>
               </div>

               <div className="space-y-4">
                  {entry.gratitudeList.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="bg-rose-100 text-rose-600 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="w-full">
                        <SpeechInput
                          value={item}
                          onChange={(val) => handleArrayChange('gratitudeList', index, val)}
                          placeholder={`Eu agradeço por...`}
                          className="border-rose-100 focus:ring-rose-300 focus:border-rose-300"
                        />
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </StepCard>
        );
      
      case Step.FORGIVENESS:
        return (
          <StepCard 
            title="Paz Interior e Aprendizado" 
            subtitle="Liberte o peso do dia e consolide sua sabedoria."
            onNext={nextStep} 
            onPrev={prevStep}
            isLast={true}
          >
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-serif font-bold text-brand-800 mb-3 flex items-center gap-2">
                  <Leaf size={18} className="text-emerald-600" />
                  Exercício de Perdão
                </h3>
                <p className="text-sm text-stone-500 mb-3 italic">Complete mentalmente ou escreva: "Eu me perdoo por...", "Eu perdoo [nome] por..."</p>
                <div className="grid gap-4">
                   <SpeechInput
                    value={entry.forgivenessSelf}
                    onChange={(val) => handleTextChange('forgivenessSelf', val)}
                    placeholder="Eu me aceito e me perdoo por..."
                    isTextArea={true}
                    className="border-stone-200 focus:ring-emerald-400 bg-emerald-50/30 text-sm !h-24"
                  />
                   <SpeechInput
                    value={entry.forgivenessOthers}
                    onChange={(val) => handleTextChange('forgivenessOthers', val)}
                    placeholder="Eu liberto e perdoo os outros por..."
                    isTextArea={true}
                    className="border-stone-200 focus:ring-emerald-400 bg-emerald-50/30 text-sm !h-24"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-serif font-bold text-brand-800 mb-3 flex items-center gap-2">
                  <BrainCircuit size={18} className="text-purple-600" />
                  O Grande Aprendizado
                </h3>
                <SpeechInput
                  value={entry.learningConclusion}
                  onChange={(val) => handleTextChange('learningConclusion', val)}
                  placeholder="Qual a lição mais valiosa que você leva deste dia ao refletir agora?"
                  isTextArea={true}
                  className="focus:ring-purple-400 !h-24"
                />
              </div>
            </div>
          </StepCard>
        );

      case Step.REVIEW:
        return (
          <div className="max-w-2xl mx-auto w-full pb-10">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-stone-200">
               <div className="bg-brand-900 p-8 text-center text-white relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                 <h2 className="text-3xl font-serif font-bold relative z-10">Diário Finalizado</h2>
                 <p className="text-brand-200 mt-2 relative z-10">{entry.date}</p>
                 <p className="text-brand-100 text-sm relative z-10 mt-1">Autor: {entry.userName}</p>
               </div>

               <div className="p-8 space-y-6">
                 {/* Status Message */}
                 {saveStatus === 'success' && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-sm" role="alert">
                      <strong className="font-bold">Sucesso!</strong>
                      <span className="block sm:inline"> Seu diário foi salvo na nuvem com segurança.</span>
                    </div>
                 )}
                 {saveStatus === 'error' && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
                      <strong className="font-bold">Atenção:</strong>
                      <span className="block sm:inline"> Houve um erro ao salvar na nuvem, mas você pode baixar o PDF.</span>
                    </div>
                 )}

                 {/* AI Feedback Section */}
                 <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
                    <h3 className="text-indigo-900 font-bold flex items-center gap-2 mb-3">
                      <Sparkles size={20} className="text-indigo-500" />
                      Insight do MentorHubAI
                    </h3>
                    {aiFeedback.loading ? (
                      <div className="flex flex-col items-center py-4 text-indigo-400">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                         <p className="text-sm">Analisando seu dia...</p>
                      </div>
                    ) : aiFeedback.error ? (
                      <p className="text-red-500 text-sm">{aiFeedback.error}</p>
                    ) : (
                      <p className="text-indigo-800 italic leading-relaxed text-sm md:text-base">
                        "{aiFeedback.content}"
                      </p>
                    )}
                 </div>
                  
                 <div className="prose prose-stone max-w-none">
                   <h4 className="font-bold text-stone-800 border-b border-stone-200 pb-2">Destaques do Dia</h4>
                   <p className="text-stone-600 mt-2"><strong className="text-stone-900">Brilho:</strong> {entry.positiveHighlight}</p>
                   <p className="text-stone-600"><strong className="text-stone-900">Semente:</strong> {entry.contributionIdea}</p>
                   
                   <h4 className="font-bold text-stone-800 border-b border-stone-200 pb-2 mt-6">Compromissos para Amanhã</h4>
                   <ul className="list-disc pl-5 mt-2 space-y-1">
                     {entry.tomorrowActions.filter(a => a).map((action, i) => (
                       <li key={i} className="text-stone-600">{action}</li>
                     ))}
                   </ul>

                   <h4 className="font-bold text-stone-800 border-b border-stone-200 pb-2 mt-6">Gratidão</h4>
                   <ul className="list-disc pl-5 mt-2 space-y-1">
                     {entry.gratitudeList.filter(g => g).map((gratitude, i) => (
                       <li key={i} className="text-stone-600">{gratitude}</li>
                     ))}
                   </ul>
                 </div>
               </div>

               <div className="bg-stone-50 p-6 text-center border-t border-stone-200 flex flex-col md:flex-row justify-center gap-4">
                 <button 
                   onClick={generatePDF}
                   disabled={aiFeedback.loading}
                   className={`flex items-center justify-center gap-2 bg-brand-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg transform ${aiFeedback.loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-700 hover:shadow-xl hover:-translate-y-0.5'}`}
                 >
                   <Printer size={20} />
                   Imprimir Relatório (PDF)
                 </button>
                 <button 
                  onClick={startNewJournal}
                  className="px-6 py-3 rounded-xl text-brand-600 hover:text-brand-800 hover:bg-brand-50 transition-colors font-medium"
                 >
                   Novo Diário
                 </button>
               </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 font-sans selection:bg-brand-200 selection:text-brand-900 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 text-white p-1.5 rounded-lg">
              <PenTool size={20} />
            </div>
            <h1 className="text-xl font-serif font-bold text-stone-800 hidden sm:block">Jornada Interior</h1>
          </div>
          <div className="flex items-center gap-3">
             {entry.userName && <span className="text-sm font-medium text-brand-800 hidden md:block">Olá, {entry.userName.split(' ')[0]}</span>}
             <div className="text-sm font-medium text-stone-500 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
               {entry.date}
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {step !== Step.REVIEW && (
          <div className="max-w-2xl mx-auto">
            <ProgressBar currentStep={step} totalSteps={totalSteps} />
          </div>
        )}
        
        <div className="transition-opacity duration-300 ease-in-out">
          {renderStep()}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-stone-400 text-xs py-6">
        <p>© {new Date().getFullYear()} Diário Jornada Interior. Pratique o autoconhecimento diariamente.</p>
      </footer>
    </div>
  );
}