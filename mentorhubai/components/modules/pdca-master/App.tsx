
import React, { useState, useEffect, useRef } from 'react';
import { Cycle, PDCAStage, UserProfile } from './types';
import PlanStage from './components/PlanStage';
import DoStage from './components/DoStage';
import CheckStage from './components/CheckStage';
import ActStage from './components/ActStage';
import SpeechMic from './components/SpeechMic';
import { fetchUsers, createUser } from './services/userService';
import { fetchCycles, saveCycle, deleteCycle } from './services/cycleService';
import { LayoutDashboard, PlusCircle, ChevronRight, CheckCircle2, RotateCw, ClipboardList, BrainCircuit, Lightbulb, ArrowLeft, Download, Loader2, User, Trash2, Database, Save } from 'lucide-react';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [tempName, setTempName] = useState(''); // For the input field before saving
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'create' | 'detail'>('dashboard');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isLoadingCycles, setIsLoadingCycles] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Login State
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Reference for debounce timer
  const saveTimeoutRef = useRef<any>(null);

  // Load users from Supabase on mount
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true);
      const users = await fetchUsers();
      setAvailableUsers(users);
      setIsLoadingUsers(false);
    };
    loadUsers();
  }, []);

  // Load cycles when user changes
  useEffect(() => {
    if (currentUser?.id) {
      const loadUserCycles = async () => {
        setIsLoadingCycles(true);
        const userCycles = await fetchCycles(currentUser.id!);
        setCycles(userCycles);
        setIsLoadingCycles(false);
      };
      loadUserCycles();
    } else {
      setCycles([]);
    }
  }, [currentUser]);

  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const handleCreateNewUser = async () => {
    if (tempName.trim()) {
      setIsCreatingUser(true);
      try {
        const newUser = await createUser(tempName);
        if (newUser) {
          setCurrentUser(newUser);
        } else {
          alert("Não foi possível criar o usuário. Verifique a conexão.");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsCreatingUser(false);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCycles([]);
    setActiveCycleId(null);
    setView('dashboard');
    // Reload users to ensure list is fresh
    setIsLoadingUsers(true);
    fetchUsers().then(users => {
      setAvailableUsers(users);
      setIsLoadingUsers(false);
    });
  };

  const createCycle = async () => {
    // Garante que existe um usuário logado
    if (!currentUser) return;

    const newCycle: Cycle = {
      id: crypto.randomUUID(),
      title: 'Novo Ciclo',
      goal: '',
      startDate: new Date().toLocaleDateString('pt-BR'),
      currentStage: PDCAStage.PLAN,
      tasks: []
    };
    
    // Optimistic update - Atualiza a UI imediatamente
    setCycles([newCycle, ...cycles]);
    setActiveCycleId(newCycle.id);
    setView('detail');

    // Save to DB se o usuário tiver um ID válido
    if (currentUser.id) {
      await saveCycle(newCycle, currentUser.id);
    } else {
      console.warn("Usuário sem ID, ciclo não será salvo no banco de dados.");
    }
  };

  const updateCycle = (updated: Cycle) => {
    if (!currentUser) return;

    // 1. Optimistic update (Immediate UI feedback)
    setCycles(prevCycles => prevCycles.map(c => c.id === updated.id ? updated : c));
    
    // 2. Debounced Save to DB (Wait for user to stop typing)
    if (currentUser.id) {
      // Clear any pending save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout to save after 1 second of inactivity
      saveTimeoutRef.current = setTimeout(async () => {
        if (currentUser.id) {
          await saveCycle(updated, currentUser.id);
        }
      }, 1000);
    }
  };

  const handleManualSave = async () => {
    if (!activeCycle || !currentUser?.id) {
        alert("Erro: Ciclo ou Usuário não encontrados.");
        return;
    }

    setIsSaving(true);
    try {
        await saveCycle(activeCycle, currentUser.id);
        alert("Dados gravados com sucesso no Supabase!");
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Ocorreu um erro ao tentar gravar os dados.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteCycle = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja excluir este ciclo?")) {
      setCycles(cycles.filter(c => c.id !== id));
      await deleteCycle(id);
      if (activeCycleId === id) {
        setView('dashboard');
        setActiveCycleId(null);
      }
    }
  };

  const advanceStage = (cycle: Cycle) => {
    let nextStage = cycle.currentStage;
    if (cycle.currentStage === PDCAStage.PLAN) nextStage = PDCAStage.DO;
    else if (cycle.currentStage === PDCAStage.DO) nextStage = PDCAStage.CHECK;
    else if (cycle.currentStage === PDCAStage.CHECK) nextStage = PDCAStage.ACT;
    
    updateCycle({ ...cycle, currentStage: nextStage });
  };

  const retreatStage = (cycle: Cycle) => {
    let prevStage = cycle.currentStage;
    if (cycle.currentStage === PDCAStage.DO) prevStage = PDCAStage.PLAN;
    else if (cycle.currentStage === PDCAStage.CHECK) prevStage = PDCAStage.DO;
    else if (cycle.currentStage === PDCAStage.ACT) prevStage = PDCAStage.CHECK;

    updateCycle({ ...cycle, currentStage: prevStage });
  };

  const completeCycle = async (cycle: Cycle) => {
    const updatedCycle = { ...cycle, currentStage: PDCAStage.COMPLETED };
    
    // Atualiza estado local e view
    updateCycle(updatedCycle);
    setView('detail'); 

    // Força salvamento imediato (bypassing debounce)
    if (currentUser?.id) {
      setIsSaving(true);
      try {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); // Limpa debounce pendente
        await saveCycle(updatedCycle, currentUser.id);
      } catch (e) {
        console.error("Erro ao finalizar ciclo:", e);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const generatePDF = async () => {
    const element = document.getElementById('pdca-report-content');
    if (!element) return;

    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Improve quality
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // If content is longer than one page (basic implementation)
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`PDCA-Relatorio-${activeCycle?.goal.slice(0, 15) || 'Ciclo'}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Houve um erro ao gerar o PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const activeCycle = cycles.find(c => c.id === activeCycleId);

  // Render Welcome Screen if no name
  if (!currentUser) {
    return (
      <div className="h-full overflow-y-auto bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-xl shadow-lg border border-gray-100 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <RotateCw className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Bem-vindo ao PDCA Master</h1>
          <p className="text-center text-gray-500 mb-6">Quem está acessando hoje?</p>

          {/* User List Section */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Usuários Encontrados</h3>
            
            {isLoadingUsers ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : availableUsers.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                {availableUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 truncate">{user.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic text-center py-2">Nenhum usuário encontrado.</p>
            )}
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">Ou criar novo</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Novo Perfil</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateNewUser()}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Digite seu nome..."
                />
                <SpeechMic onTranscript={(text) => setTempName(text)} />
              </div>
            </div>
            
            <button
              onClick={handleCreateNewUser}
              disabled={!tempName.trim() || isCreatingUser}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isCreatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              Criar e Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Dashboard
  const renderDashboard = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Olá, {currentUser.name}</h1>
          <p className="text-gray-500 mt-1">Gerencie sua melhoria contínua</p>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-500 p-2"
                title="Sair"
            >
                <User className="w-5 h-5" />
            </button>
            <button
            onClick={createCycle}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 shadow-md transition-all hover:scale-105"
            >
            <PlusCircle className="w-5 h-5" />
            Novo Ciclo
            </button>
        </div>
      </div>

      {isLoadingCycles ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cycles.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
              <RotateCw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum ciclo iniciado. Comece um novo agora!</p>
            </div>
          )}

          {cycles.map(cycle => (
            <div 
              key={cycle.id} 
              onClick={() => { setActiveCycleId(cycle.id); setView('detail'); }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group relative"
            >
              <button 
                onClick={(e) => handleDeleteCycle(e, cycle.id)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Excluir Ciclo"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex justify-between items-start mb-4 pr-6">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {cycle.goal || 'Ciclo sem título'}
                  </h3>
                  <span className="text-xs text-gray-400">Iniciado em: {cycle.startDate}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap
                  ${cycle.currentStage === PDCAStage.COMPLETED ? 'bg-gray-100 text-gray-600' : 
                    cycle.currentStage === PDCAStage.PLAN ? 'bg-blue-100 text-blue-700' :
                    cycle.currentStage === PDCAStage.DO ? 'bg-yellow-100 text-yellow-700' :
                    cycle.currentStage === PDCAStage.CHECK ? 'bg-purple-100 text-purple-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                  {cycle.currentStage === PDCAStage.COMPLETED ? 'CONCLUÍDO' : cycle.currentStage}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>{cycle.tasks.filter(t => t.completed).length}/{cycle.tasks.length} Tarefas</span>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full" 
                  style={{ width: `${cycle.tasks.length > 0 ? (cycle.tasks.filter(t => t.completed).length / cycle.tasks.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render Detail View
  const renderDetail = () => {
    if (!activeCycle) return null;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <button 
          onClick={() => setView('dashboard')}
          className="text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-1 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{activeCycle.goal || 'Defina um Objetivo'}</h2>
              <p className="text-sm text-gray-500">Ciclo ID: {activeCycle.id.slice(0, 8)}</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Progress Steps */}
              <div className="flex items-center gap-2 text-xs font-bold overflow-x-auto max-w-full pb-2 md:pb-0">
                {[PDCAStage.PLAN, PDCAStage.DO, PDCAStage.CHECK, PDCAStage.ACT].map((stage, idx) => {
                   const stages = [PDCAStage.PLAN, PDCAStage.DO, PDCAStage.CHECK, PDCAStage.ACT, PDCAStage.COMPLETED];
                   const currentIdx = stages.indexOf(activeCycle.currentStage);
                   const thisIdx = stages.indexOf(stage);
                   
                   const isActive = activeCycle.currentStage === stage;
                   const isPast = thisIdx < currentIdx;

                   return (
                     <div key={stage} className={`flex items-center ${isActive ? 'text-blue-600' : isPast ? 'text-green-600' : 'text-gray-300'}`}>
                       <span className={`w-8 h-8 flex items-center justify-center rounded-full border-2 flex-shrink-0
                         ${isActive ? 'border-blue-600 bg-blue-50' : isPast ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}>
                         {stage[0]}
                       </span>
                       {idx < 3 && <div className={`w-8 h-0.5 mx-1 flex-shrink-0 ${isPast ? 'bg-green-600' : 'bg-gray-200'}`}></div>}
                     </div>
                   );
                })}
              </div>

              {activeCycle.currentStage === PDCAStage.COMPLETED && (
                <button 
                  onClick={generatePDF}
                  disabled={isGeneratingPdf}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md transition-colors disabled:opacity-50"
                  title="Baixar Relatório em PDF"
                >
                  {isGeneratingPdf ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {activeCycle.currentStage === PDCAStage.PLAN && (
              <PlanStage 
                cycle={activeCycle} 
                onUpdate={updateCycle} 
                onNext={() => advanceStage(activeCycle)} 
              />
            )}
            {activeCycle.currentStage === PDCAStage.DO && (
              <DoStage 
                cycle={activeCycle} 
                onUpdate={updateCycle} 
                onNext={() => advanceStage(activeCycle)} 
                onBack={() => retreatStage(activeCycle)}
              />
            )}
            {activeCycle.currentStage === PDCAStage.CHECK && (
              <CheckStage 
                cycle={activeCycle} 
                onUpdate={updateCycle} 
                onNext={() => advanceStage(activeCycle)}
                onBack={() => retreatStage(activeCycle)}
              />
            )}
            {activeCycle.currentStage === PDCAStage.ACT && (
              <ActStage 
                cycle={activeCycle} 
                onUpdate={updateCycle} 
                onComplete={() => completeCycle(activeCycle)}
                onBack={() => retreatStage(activeCycle)}
              />
            )}
             {activeCycle.currentStage === PDCAStage.COMPLETED && (
               <>
                 <div className="animate-fade-in space-y-8" id="pdca-report-content">
                   <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                     <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                     <h3 className="text-2xl font-bold text-green-800">Ciclo Finalizado com Sucesso!</h3>
                     <p className="text-green-700">Relatório Completo do Ciclo PDCA.</p>
                     <p className="text-sm text-green-800 mt-2 font-medium bg-green-100 inline-block px-3 py-1 rounded-full border border-green-200">
                       Executado por: {currentUser.name}
                     </p>
                   </div>

                   {/* REPORT - SECTION 1: EXECUTION */}
                   <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden break-inside-avoid">
                     <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center gap-2">
                       <ClipboardList className="w-5 h-5 text-blue-700" />
                       <h4 className="font-bold text-blue-800">1. Execução (Planejamento & Ação)</h4>
                     </div>
                     <div className="p-6">
                       <div className="mb-6">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Objetivo</span>
                          <p className="text-lg font-medium text-gray-900 mt-1">{activeCycle.goal}</p>
                       </div>
                       <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tarefas Concluídas</span>
                            <span className="text-sm font-bold text-blue-600">
                               {activeCycle.tasks.filter(t => t.completed).length} de {activeCycle.tasks.length}
                            </span>
                          </div>
                          <div className="bg-gray-100 rounded-full h-2 mb-4">
                             <div 
                               className="bg-blue-600 h-2 rounded-full" 
                               style={{ width: `${activeCycle.tasks.length > 0 ? (activeCycle.tasks.filter(t => t.completed).length / activeCycle.tasks.length) * 100 : 0}%` }}
                             ></div>
                          </div>
                          <ul className="space-y-2">
                            {activeCycle.tasks.map(t => (
                              <li key={t.id} className="flex items-center text-sm">
                                {t.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                ) : (
                                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2 flex-shrink-0" />
                                )}
                                <span className={t.completed ? 'text-gray-500 line-through' : 'text-gray-800'}>{t.description}</span>
                              </li>
                            ))}
                          </ul>
                       </div>
                     </div>
                   </div>

                   {/* REPORT - SECTION 2: CHECK */}
                   <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden break-inside-avoid">
                      <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex items-center gap-2">
                         <BrainCircuit className="w-5 h-5 text-purple-700" />
                         <h4 className="font-bold text-purple-800">2. Análise (Verificação)</h4>
                      </div>
                      <div className="p-6 grid md:grid-cols-2 gap-6">
                         <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Suas Observações</span>
                            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 min-h-[100px] whitespace-pre-wrap">
                               {activeCycle.checkObservations || "Nenhuma observação registrada."}
                            </div>
                         </div>
                         <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Análise da IA</span>
                            <div className="bg-purple-50 p-4 rounded-lg text-sm text-purple-800 min-h-[100px] whitespace-pre-wrap border border-purple-100">
                               {activeCycle.checkAiAnalysis || "Análise de IA não solicitada."}
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* REPORT - SECTION 3: ACT */}
                   <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden break-inside-avoid">
                      <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center gap-2">
                         <Lightbulb className="w-5 h-5 text-orange-700" />
                         <h4 className="font-bold text-orange-800">3. Ação (Melhoria Contínua)</h4>
                      </div>
                      <div className="p-6 space-y-6">
                         <div className="grid md:grid-cols-2 gap-6">
                            <div>
                               <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">O que melhorar</span>
                               <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 min-h-[80px] whitespace-pre-wrap">
                                  {activeCycle.actImprovements || "Não especificado."}
                               </div>
                            </div>
                            <div>
                               <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Próximos Passos (Próximo Ciclo)</span>
                               <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 min-h-[80px] whitespace-pre-wrap">
                                  {activeCycle.actNextSteps || "Não especificado."}
                               </div>
                            </div>
                         </div>
                         
                         {activeCycle.actAiSuggestions && (
                           <div>
                              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider block mb-2">Sugestões da IA</span>
                              <div className="bg-orange-50 p-4 rounded-lg text-sm text-orange-900 border border-orange-100 whitespace-pre-wrap">
                                 {activeCycle.actAiSuggestions}
                              </div>
                           </div>
                         )}
                      </div>
                   </div>
                 </div>

                 {/* Action Buttons OUTSIDE the report ID so it doesn't get printed */}
                 <div className="flex justify-center gap-4 pt-8 pb-4">
                    <button 
                      onClick={() => setView('dashboard')} 
                      className="bg-gray-200 text-gray-800 px-6 py-3 rounded-full font-semibold hover:bg-gray-300 transition-all"
                    >
                      Voltar ao Painel
                    </button>
                    
                    <button 
                      onClick={handleManualSave}
                      disabled={isSaving}
                      className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      {isSaving ? 'Salvando...' : 'Salvar Dados no Banco'}
                    </button>
                 </div>
               </>
             )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {view === 'dashboard' ? renderDashboard() : renderDetail()}
    </div>
  );
};

export default App;
