import React, { useState, useRef, useLayoutEffect } from 'react';
import { Lesson, QuizData } from '../types';
import { generateFinalExam } from '../services/geminiService';
import { Award, Download, X, CheckCircle2, Loader2, BookOpen, AlertCircle, XCircle, RefreshCw, Trophy } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: Lesson[];
}

type ModalViewState = 'intro' | 'loading_exam' | 'exam' | 'result' | 'form' | 'certificate';

const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose, lessons }) => {
  const [viewState, setViewState] = useState<ModalViewState>('intro');
  const [examData, setExamData] = useState<QuizData | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);
  
  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [scale, setScale] = useState(1);
  const [isReady, setIsReady] = useState(false);
  
  const certificateRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Reset state when opening/closing
  React.useEffect(() => {
    if (isOpen) {
      setViewState('intro');
      setExamData(null);
      setUserAnswers({});
      setScore(0);
    }
  }, [isOpen]);

  // Lógica do CPF Mask
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    // Aplica máscara 000.000.000-00
    if (value.length > 9) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3}).*/, '$1.$2.$3');
    } else if (value.length > 3) {
      value = value.replace(/^(\d{3})(\d{3}).*/, '$1.$2');
    }
    setCpf(value);
  };

  const startExam = async () => {
    setViewState('loading_exam');
    try {
      const data = await generateFinalExam();
      setExamData(data);
      setViewState('exam');
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar a prova. Tente novamente.");
      setViewState('intro');
    }
  };

  const submitExam = () => {
    if (!examData) return;
    let correctCount = 0;
    examData.questions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setViewState('result');
  };

  const handleRetry = () => {
    setViewState('intro');
    setUserAnswers({});
    setScore(0);
  };

  const proceedToCertificate = () => {
    setViewState('form');
  };

  const handleGenerateCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length > 3 && cpf.length >= 11) {
      setViewState('certificate');
    }
  };

  // Cálculo robusto de escala para caber na tela
  useLayoutEffect(() => {
    if (viewState !== 'certificate' || !viewportRef.current) return;

    if (typeof ResizeObserver === 'undefined') {
        setScale(0.5);
        setIsReady(true);
        return;
    }

    const updateScale = () => {
      if (!viewportRef.current) return;
      const { clientWidth, clientHeight } = viewportRef.current;
      const CERT_WIDTH = 1123;
      const CERT_HEIGHT = 794;
      const PADDING = 24; 
      const availableWidth = clientWidth - PADDING;
      const availableHeight = clientHeight - PADDING;
      const scaleX = availableWidth / CERT_WIDTH;
      const scaleY = availableHeight / CERT_HEIGHT;
      const newScale = Math.min(scaleX, scaleY, 1); 
      setScale(Math.max(newScale, 0.25));
      setIsReady(true);
    };

    const observer = new ResizeObserver(updateScale);
    observer.observe(viewportRef.current);
    updateScale();

    return () => observer.disconnect();
  }, [viewState]);

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const html2canvasMod: any = await import('html2canvas');
      const html2canvas = html2canvasMod.default || html2canvasMod;
      const jspdfMod: any = await import('jspdf');
      const jsPDF = jspdfMod.jsPDF || jspdfMod.default || jspdfMod;

      if (!html2canvas || !jsPDF) throw new Error("Falha ao carregar bibliotecas de PDF");

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1200, 
        onclone: (clonedDoc: Document) => {
            const clonedCert = clonedDoc.querySelector('[data-certificate-content]') as HTMLElement;
            if (clonedCert) {
                clonedCert.style.transform = 'none';
            }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const safeName = fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`Certificado_GestaoMaster_${safeName}.pdf`);

    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Houve um erro ao gerar o certificado. Tente novamente.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!isOpen) return null;

  const totalHours = lessons.length;
  const currentDate = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  const passed = score >= 6; // 60% of 10

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-fadeIn">
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden relative flex flex-col h-full max-h-[90vh] md:max-h-[85vh]">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-2 bg-white/80 hover:bg-slate-100 rounded-full text-slate-500 hover:text-red-500 transition-colors shadow-sm backdrop-blur-sm border border-slate-200"
        >
          <X size={20} />
        </button>

        {/* --- STATE: INTRO --- */}
        {viewState === 'intro' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600">
               <BookOpen size={40} />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Prova Final de Certificação</h2>
            <div className="max-w-lg bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 text-left space-y-3">
               <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5" />
                  <p className="text-slate-600">A prova contém <strong>10 questões</strong> de múltipla escolha.</p>
               </div>
               <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5" />
                  <p className="text-slate-600">Cada questão vale <strong>1 ponto</strong>.</p>
               </div>
               <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-slate-600">Você precisa acertar no mínimo <strong>60% (6 questões)</strong> para ser aprovado e emitir o certificado.</p>
               </div>
               <div className="flex items-start gap-3">
                  <RefreshCw size={20} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-slate-600">Caso não passe, você poderá refazer a prova.</p>
               </div>
            </div>
            <button 
              onClick={startExam}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-3"
            >
              Iniciar Prova Agora
            </button>
          </div>
        )}

        {/* --- STATE: LOADING EXAM --- */}
        {viewState === 'loading_exam' && (
           <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
             <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
             <h3 className="text-xl font-bold text-slate-700">Elaborando Prova Final...</h3>
             <p className="text-slate-500 mt-2">A Inteligência Artificial está gerando questões exclusivas para você.</p>
           </div>
        )}

        {/* --- STATE: EXAM (TAKING TEST) --- */}
        {viewState === 'exam' && examData && (
          <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
             <div className="bg-white border-b border-slate-200 p-4 shadow-sm flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                   <BookOpen size={18} className="text-blue-600" />
                   Prova Final
                </h3>
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                   Respondidas: {Object.keys(userAnswers).length} / 10
                </span>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-4xl mx-auto w-full">
                <div className="space-y-8">
                   {examData.questions.map((q, idx) => (
                      <div key={q.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                         <h4 className="font-semibold text-lg text-slate-800 mb-4 flex gap-3">
                            <span className="bg-slate-100 text-slate-500 w-8 h-8 rounded flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">{idx + 1}</span>
                            {q.text}
                         </h4>
                         <div className="space-y-2 pl-11">
                            {q.options.map((opt, optIdx) => {
                               const isSelected = userAnswers[q.id] === optIdx;
                               return (
                                  <button
                                     key={optIdx}
                                     onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                                     className={`w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3
                                        ${isSelected 
                                           ? 'bg-blue-50 border-blue-500 text-blue-800 ring-1 ring-blue-500' 
                                           : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                        }`}
                                  >
                                     <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 
                                        ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}
                                     `}>
                                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                     </div>
                                     {opt}
                                  </button>
                               )
                            })}
                         </div>
                      </div>
                   ))}
                </div>
                
                <div className="mt-8 pb-8">
                   <button
                      onClick={submitExam}
                      disabled={Object.keys(userAnswers).length < 10}
                      className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all
                         ${Object.keys(userAnswers).length < 10 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-xl'
                         }`}
                   >
                      {Object.keys(userAnswers).length < 10 
                         ? `Responda todas as questões (${Object.keys(userAnswers).length}/10)` 
                         : 'Finalizar e Corrigir Prova'}
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* --- STATE: RESULT (PASS/FAIL & CORRECTION) --- */}
        {viewState === 'result' && examData && (
           <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
              <div className="bg-white border-b border-slate-200 p-6 text-center shadow-sm z-10">
                 <div className="mb-2">
                    {passed ? (
                       <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-bold uppercase tracking-wider">
                          <Award size={16} /> Aprovado
                       </div>
                    ) : (
                       <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-bold uppercase tracking-wider">
                          <XCircle size={16} /> Reprovado
                       </div>
                    )}
                 </div>
                 <h2 className="text-3xl font-black text-slate-800 mb-1">{score} / 10 Pontos</h2>
                 <p className="text-slate-500 text-sm">Nota mínima exigida: 6 pontos</p>
                 
                 <div className="mt-6 flex justify-center gap-4">
                    {!passed && (
                       <button onClick={handleRetry} className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors flex items-center gap-2">
                          <RefreshCw size={18} /> Tentar Novamente
                       </button>
                    )}
                    {passed && (
                       <button onClick={proceedToCertificate} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-colors flex items-center gap-2 animate-bounce">
                          <CheckCircle2 size={18} /> Emitir Certificado
                       </button>
                    )}
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-4xl mx-auto w-full">
                 <h3 className="text-slate-700 font-bold mb-4 uppercase text-sm tracking-wider">Correção Detalhada</h3>
                 <div className="space-y-6 pb-8">
                    {examData.questions.map((q, idx) => {
                       const userAnswer = userAnswers[q.id];
                       const isCorrect = userAnswer === q.correctIndex;
                       
                       return (
                          <div key={q.id} className={`p-5 rounded-xl border-l-4 shadow-sm bg-white ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                             <div className="flex items-start justify-between gap-4 mb-3">
                                <h4 className="font-semibold text-slate-800 flex gap-2">
                                   <span className="text-slate-400 font-mono text-sm mt-0.5">{idx + 1}.</span> {q.text}
                                </h4>
                                {isCorrect 
                                   ? <CheckCircle2 className="text-green-500 shrink-0" size={20} />
                                   : <XCircle className="text-red-500 shrink-0" size={20} />
                                }
                             </div>
                             
                             <div className="space-y-2 text-sm">
                                {q.options.map((opt, optIdx) => {
                                   const isThisCorrect = optIdx === q.correctIndex;
                                   const isThisSelected = optIdx === userAnswer;
                                   
                                   let style = "p-2 rounded border border-transparent";
                                   if (isThisCorrect) style = "bg-green-50 border-green-200 text-green-800 font-medium";
                                   else if (isThisSelected && !isThisCorrect) style = "bg-red-50 border-red-200 text-red-800 line-through opacity-75";
                                   else style = "text-slate-500 opacity-50";

                                   return (
                                      <div key={optIdx} className={style}>
                                         {opt} {isThisCorrect && "(Correta)"}
                                      </div>
                                   )
                                })}
                             </div>
                          </div>
                       )
                    })}
                 </div>
              </div>
           </div>
        )}

        {/* --- STATE: FORM (INPUT NAME & CPF) --- */}
        {viewState === 'form' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center bg-slate-50 w-full animate-fadeIn">
            <div className="w-full max-w-md">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-sm">
                   <Trophy size={40} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Parabéns pela Conquista!</h2>
                <p className="text-slate-600 mb-8">Preencha seus dados para a emissão oficial.</p>
                
                <form onSubmit={handleGenerateCertificate} className="space-y-4 text-left">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider ml-1">Nome Completo</label>
                      <input 
                         type="text" 
                         value={fullName}
                         onChange={(e) => setFullName(e.target.value)}
                         placeholder="Seu nome completo"
                         className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-semibold shadow-sm"
                         required
                         minLength={3}
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider ml-1">CPF</label>
                      <input 
                         type="text" 
                         value={cpf}
                         onChange={handleCpfChange}
                         placeholder="000.000.000-00"
                         className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono font-medium shadow-sm"
                         required
                         minLength={14}
                         maxLength={14}
                      />
                   </div>
                   
                   <button 
                      type="submit" 
                      className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg rounded-xl shadow-lg mt-4 transition-all flex items-center justify-center gap-2"
                   >
                      <CheckCircle2 size={20} />
                      Gerar Documento
                   </button>
                </form>
            </div>
          </div>
        )}

        {/* --- STATE: CERTIFICATE VIEW --- */}
        {viewState === 'certificate' && (
          <div className="flex flex-col h-full overflow-hidden bg-slate-100">
            {/* Toolbar */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0 shadow-sm z-20">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-500 hidden sm:inline">Visualização do Diploma</span>
              <button 
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className={`px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg
                  ${isGeneratingPdf ? 'opacity-80 cursor-wait' : 'hover:bg-slate-800 hover:shadow-xl active:scale-95'}`}
              >
                {isGeneratingPdf ? (
                  <><Loader2 size={18} className="animate-spin" /> Gerando PDF...</>
                ) : (
                  <><Download size={18} /> Baixar PDF (A4)</>
                )}
              </button>
            </div>

            {/* Viewport */}
            <div ref={viewportRef} className="flex-1 overflow-hidden relative flex items-center justify-center p-4 md:p-8 bg-slate-200/50">
              <div 
                style={{ 
                  width: '1123px', height: '794px',
                  transform: `scale(${scale})`, transformOrigin: 'center center',
                  opacity: isReady ? 1 : 0, transition: 'opacity 0.3s ease-out'
                }}
                className="bg-white shadow-2xl flex-shrink-0"
              >
                 <div ref={certificateRef} data-certificate-content className="w-full h-full bg-white text-slate-900 relative antialiased">
                    <div className="w-full h-full border-[12px] border-double border-slate-800 p-12 text-center relative flex flex-col justify-between box-border">
                      
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                        <Award size={600} />
                      </div>

                      <div className="relative z-10">
                        <div className="flex justify-center mb-6">
                          <div className="flex items-center gap-5">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <Award size={56} className="text-blue-800" />
                            </div>
                            <div className="text-left">
                              <h1 className="text-3xl font-bold uppercase tracking-widest leading-none text-slate-900">GestãoMaster AI</h1>
                              <p className="text-xs tracking-[0.4em] uppercase text-blue-800 font-bold mt-1">MBA Executivo Digital</p>
                            </div>
                          </div>
                        </div>
                        <h2 className="text-6xl font-serif font-bold text-slate-800 mb-2 uppercase tracking-wide">Certificado de Conclusão</h2>
                        <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
                      </div>

                      <div className="font-serif text-2xl text-slate-600 leading-relaxed px-20 relative z-10">
                        <p className="mb-4 italic">Certificamos para os devidos fins que</p>
                        
                        <div className="relative inline-block mb-2 min-w-[500px]">
                            <h3 className="text-5xl font-bold text-blue-900 italic px-8 py-2 relative z-10 font-serif">{fullName}</h3>
                            <div className="absolute bottom-0 left-0 w-full h-px bg-slate-300"></div>
                        </div>
                        <p className="text-sm font-sans font-bold text-slate-500 mb-6 uppercase tracking-widest">CPF: {cpf}</p>

                        <p>
                          Concluiu com êxito o curso de <strong className="text-slate-900 font-bold">Gestão Empresarial e Desenvolvimento Profissional</strong>, 
                          aprovado na avaliação final com nota <strong>{(score/10)*100}%</strong> e carga horária de <strong className="text-slate-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{totalHours} horas</strong>.
                        </p>
                      </div>

                      <div className="relative z-10 px-8 py-5 bg-slate-50 rounded-xl border border-slate-100 mx-8">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Conteúdo Programático</p>
                        <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-[9px] text-slate-600 font-medium text-left">
                          {lessons.map((lesson, idx) => (
                            <div key={lesson.id} className="flex items-center gap-1 truncate">
                              <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0"></span>
                              <span className="truncate">{idx + 1}. {lesson.title.replace(/Aula \d+: /, '')}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 px-12 relative z-10">
                        <div className="flex justify-between items-end gap-12">
                          <div className="text-center">
                            <p className="text-lg font-medium text-slate-600 mb-1 font-serif">{currentDate}</p>
                            <div className="w-48 h-px bg-slate-300 mx-auto"></div>
                            <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-wider">Data de Emissão</p>
                          </div>
                          <div className="text-center">
                            <div className="font-serif text-3xl text-slate-800 mb-[-5px] italic">Prof. Dr. GestãoMaster</div>
                            <div className="w-72 h-px bg-slate-800 mx-auto mt-4"></div>
                            <p className="text-xs font-bold text-slate-800 mt-2 uppercase tracking-wider">Diretoria Acadêmica</p>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center text-[9px] text-slate-400 font-mono border-t border-slate-100 pt-2">
                           <span>Registro: {Math.random().toString(36).substring(2, 10).toUpperCase()} • Nota Final: {score}.0</span>
                           <span>GestãoMaster AI Education System</span>
                        </div>
                      </div>

                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateModal;