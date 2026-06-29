import React, { useState, useRef, useEffect, ReactNode } from "react";
import { 
  FileText, Users, GraduationCap, LayoutDashboard, ClipboardCheck, 
  Table as TableIcon, Stethoscope, ShieldCheck, Plus, Trash2, 
  Download, Sparkles, Loader2, Image as ImageIcon, Copy, Check, 
  History, Send, Thermometer, Volume2, Camera, ScanSearch, 
  AlertTriangle, ClipboardList, CheckSquare, XCircle, MinusCircle, 
  ChevronLeft, ArrowRight, Play, Award, HelpCircle
} from "lucide-react";
import { auth, db, googleProvider, signInWithPopup, onAuthStateChanged, collection, addDoc, deleteDoc, doc, onSnapshot, query, where, User } from "./firebase";

// Custom premium UI components to replace shadcn-ui without dependencies
const Card: React.FC<{ className?: string; children: ReactNode; onClick?: () => void }> = ({ className = "", children, onClick }) => (
  <div onClick={onClick} className={`bg-android-surface/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transition-all duration-300 ${onClick ? "hover:bg-android-surface/60 hover:border-android-accent/20 cursor-pointer active:scale-[0.98]" : ""} ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ className?: string; children: ReactNode }> = ({ className = "", children }) => (
  <div className={`mb-4 flex flex-col gap-1.5 ${className}`}>{children}</div>
);

const CardTitle: React.FC<{ className?: string; children: ReactNode }> = ({ className = "", children }) => (
  <h3 className={`text-xl font-black text-white tracking-tight leading-none ${className}`}>{children}</h3>
);

const CardDescription: React.FC<{ className?: string; children: ReactNode }> = ({ className = "", children }) => (
  <p className={`text-xs font-bold text-gray-500 uppercase tracking-wider ${className}`}>{children}</p>
);

const CardContent: React.FC<{ className?: string; children: ReactNode }> = ({ className = "", children }) => (
  <div className={className}>{children}</div>
);

const Button: React.FC<{ 
  className?: string; 
  variant?: "default" | "outline" | "ghost" | "danger" | "success" | "purple"; 
  size?: "default" | "sm" | "icon" | "lg"; 
  onClick?: () => void; 
  disabled?: boolean; 
  children: ReactNode 
}> = ({ className = "", variant = "default", size = "default", onClick, disabled, children }) => {
  const base = "inline-flex items-center justify-center font-black rounded-2xl transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none tracking-tight select-none";
  const variants = {
    default: "bg-android-accent text-android-bg hover:bg-android-accent/90 shadow-lg shadow-android-accent/5",
    outline: "border border-white/10 hover:bg-white/5 hover:border-white/20 text-white",
    ghost: "hover:bg-white/5 text-gray-500 hover:text-white",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-950/20",
    success: "bg-android-success text-android-bg hover:bg-android-success/90 shadow-lg shadow-android-success/5",
    purple: "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-950/20 border-b-4 border-purple-800 active:border-b-0 active:translate-y-[2px]"
  };
  const sizes = {
    default: "px-6 py-3.5 text-sm",
    sm: "px-4 py-2 text-xs",
    lg: "px-8 py-4.5 text-base rounded-[1.5rem]",
    icon: "p-3 w-11 h-11"
  };
  return (
    <button disabled={disabled} onClick={onClick} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = "", ...props }) => (
  <input className={`w-full bg-white/5 border border-white/5 focus:border-android-accent/40 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 font-bold transition-all ${className}`} {...props} />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = "", ...props }) => (
  <textarea className={`w-full bg-white/5 border border-white/5 focus:border-android-accent/40 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 font-bold transition-all ${className}`} {...props} />
);

const Label: React.FC<{ htmlFor?: string; className?: string; children: ReactNode }> = ({ htmlFor, className = "", children }) => (
  <label htmlFor={htmlFor} className={`text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 ml-1 ${className}`}>
    {children}
  </label>
);

const Checkbox: React.FC<{ id: string; checked: boolean; onCheckedChange: (checked: boolean) => void }> = ({ id, checked, onCheckedChange }) => (
  <input id={id} type="checkbox" checked={checked} onChange={(e) => onCheckedChange(e.target.checked)} className="w-5 h-5 rounded-lg border-white/10 text-android-accent focus:ring-android-accent focus:ring-opacity-20 bg-white/5 cursor-pointer accent-android-accent shrink-0" />
);

const ScrollArea: React.FC<{ className?: string; children: ReactNode }> = ({ className = "", children }) => (
  <div className={`overflow-y-auto no-scrollbar custom-scrollbar ${className}`}>{children}</div>
);

// Main TST Module Component
export default function TSTModule() {
  const [tab, setTab] = useState("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [documents, setDocuments] = useState<{ id: string; name: string; validity: string }[]>([]);
  const [trainings, setTrainings] = useState<{ id: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setDocuments([]);
      setEmployees([]);
      setTrainings([]);
      return;
    }

    const qDocs = query(collection(db, "documents"), where("uid", "==", user.uid));
    const unsubDocs = onSnapshot(qDocs, (snapshot) => {
      setDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    });

    const qEmps = query(collection(db, "employees"), where("uid", "==", user.uid));
    const unsubEmps = onSnapshot(qEmps, (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    });

    const qTrains = query(collection(db, "trainings"), where("uid", "==", user.uid));
    const unsubTrains = onSnapshot(qTrains, (snapshot) => {
      setTrainings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    });

    return () => {
      unsubDocs();
      unsubEmps();
      unsubTrains();
    };
  }, [user]);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const logout = () => auth.signOut();

  return (
    <div className="flex flex-col h-full bg-android-bg text-white overflow-hidden animate-fade-in font-sans">
      {/* Module Sub-Header */}
      <header className="px-8 py-5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-android-surface/20 backdrop-blur-3xl relative z-10">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <ShieldCheck size={28} className="text-android-accent" />
            Sistema Profissional SST
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Gestão Completa de Saúde e Segurança do Trabalho</p>
        </div>
        <div className="flex gap-2.5 items-center">
          {isAuthReady && (
            user ? (
              <div className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-android-accent/10 border border-android-accent/20 flex items-center justify-center text-xs font-bold text-android-accent font-mono uppercase">
                  {user.displayName ? user.displayName.substring(0,2) : "US"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-black text-white truncate max-w-[120px]">{user.displayName}</p>
                  <p className="text-[9px] text-android-success font-bold uppercase tracking-widest leading-none mt-0.5">Online</p>
                </div>
                <button onClick={logout} className="text-xs font-black text-red-400 hover:text-red-300 ml-2 py-1 transition-colors">
                  Sair
                </button>
              </div>
            ) : (
              <Button size="sm" onClick={login} className="gap-2 bg-android-accent text-android-bg">
                <Users size={14} /> Entrar com Google
              </Button>
            )
          )}
        </div>
      </header>

      {/* Module Sub-Navigation */}
      <nav className="px-8 py-3 bg-black/40 border-b border-white/5 flex gap-2 overflow-x-auto shrink-0 scrollbar-hide select-none z-10">
        <Button size="sm" variant={tab === "dashboard" ? "default" : "ghost"} onClick={() => setTab("dashboard")} className="gap-2 shrink-0">
          <LayoutDashboard size={14} /> Dashboard
        </Button>
        <Button size="sm" variant={tab === "kit" ? "purple" : "ghost"} onClick={() => setTab("kit")} className="gap-2 shrink-0">
          <ShieldCheck size={14} /> Kit Completo SST
        </Button>
        <Button size="sm" variant={tab === "dds-ia" ? "outline" : "ghost"} onClick={() => setTab("dds-ia")} className="gap-2 shrink-0 border-purple-500/20 text-purple-300 hover:bg-purple-500/10">
          <Sparkles size={14} className="text-purple-400" /> DDS IA
        </Button>
      </nav>

      {/* Main Module Content */}
      <div className="flex-1 overflow-y-auto p-8 relative min-h-0 bg-gradient-to-b from-android-bg to-black/80">
        <main className="max-w-7xl mx-auto space-y-8 h-full">
          {tab === "dashboard" && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-600/20 to-blue-900/10 border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-black text-white">{employees.length}</div>
                      <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-2">Colaboradores Cadastrados</div>
                    </div>
                    <div className="bg-blue-500/10 p-4 rounded-3xl text-blue-400 border border-blue-500/20">
                      <Users size={28} />
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-black text-white">{documents.length}</div>
                      <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-2">Documentos Ativos</div>
                    </div>
                    <div className="bg-emerald-500/10 p-4 rounded-3xl text-emerald-400 border border-emerald-500/20">
                      <FileText size={28} />
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-orange-600/20 to-orange-900/10 border-orange-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-black text-white">{trainings.length}</div>
                      <div className="text-[10px] font-black text-orange-400 uppercase tracking-widest mt-2">Treinamentos Controlados</div>
                    </div>
                    <div className="bg-orange-500/10 p-4 rounded-3xl text-orange-400 border border-orange-500/20">
                      <GraduationCap size={28} />
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Painel do Gestor de SST</CardTitle>
                    <CardDescription>Ações Rápidas Disponíveis</CardDescription>
                  </CardHeader>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <button onClick={() => setTab("kit")} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-android-accent/20 transition-all text-left">
                      <div className="p-3 bg-android-accent/10 rounded-xl text-android-accent"><ShieldCheck size={20} /></div>
                      <div>
                        <p className="text-sm font-black text-white">Kit Completo</p>
                        <p className="text-[10px] text-gray-500 font-bold mt-0.5">Acessar checklists e laudos</p>
                      </div>
                    </button>
                    <button onClick={() => setTab("dds-ia")} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/20 transition-all text-left">
                      <div className="p-3 bg-purple-500/10 rounded-xl text-purple-300"><Sparkles size={20} /></div>
                      <div>
                        <p className="text-sm font-black text-white">Gerador de DDS</p>
                        <p className="text-[10px] text-gray-500 font-bold mt-0.5">Criação rápida com Inteligência Artificial</p>
                      </div>
                    </button>
                  </div>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Informações de Segurança</CardTitle>
                    <CardDescription>Normas Regulamentadoras integradas</CardDescription>
                  </CardHeader>
                  <div className="space-y-3 mt-4 text-sm text-gray-400 leading-relaxed font-medium">
                    <p>O MentorhubAI integra de forma nativa os controles técnicos do **Sistema Profissional SST**. Através do painel do TST, você tem acesso rápido a:</p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>Elaboração de PGR conforme a **NR-1**</li>
                      <li>Estruturação de cronogramas clínicos de PCMSO conforme a **NR-7**</li>
                      <li>Memória de cálculo higiênico para agentes físicos da **NR-15**</li>
                      <li>Inspeção ergonômica visual direcionada pela **NR-17**</li>
                    </ul>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {tab === "kit" && (
            <KitSSTModule setMainTab={setTab} setDocuments={setDocuments} employees={employees} trainings={trainings} user={user} />
          )}

          {tab === "dds-ia" && (
            <DDSGeneratorModule setDocuments={setDocuments} />
          )}
        </main>
      </div>
    </div>
  );
}

// DDS IA Module Component
function DDSGeneratorModule({ setDocuments }: { setDocuments: any }) {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [history, setHistory] = useState<{ topic: string; text: string; image: string; date: string }[]>([]);

  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!generatedText) return;
    const jspdfLib = (window as any).jspdf;
    if (!jspdfLib) {
      alert("Erro: Biblioteca PDF (jspdf) não encontrada.");
      return;
    }
    setIsDownloading(true);
    try {
      const doc = new jspdfLib.jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const margin = 18;
      let y = margin;
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxLineWidth = pageWidth - margin * 2;

      const addWrappedText = (text: string, fontSize: number, x: number, opts?: { bold?: boolean; color?: [number, number, number] }) => {
        doc.setFontSize(fontSize);
        if (opts?.bold) doc.setFont("helvetica", "bold"); else doc.setFont("helvetica", "normal");
        if (opts?.color) doc.setTextColor(...opts.color);
        const lines = doc.splitTextToSize(text, maxLineWidth);
        for (const line of lines) {
          if (y + fontSize > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, x, y);
          y += fontSize * 0.45;
        }
      };

      const getSection = (tag: string) => {
        const regex = new RegExp(`\\[\\s*${tag}\\s*\\]\\s*([\\s\\S]*?)(?=\\s*\\[|$)`, "i");
        const match = generatedText.match(regex);
        if (match && match[1].trim()) return match[1].trim();
        const fallbackRegex = new RegExp(`(?:^|\\n)\\s*${tag}\\s*:?\\s*([\\s\\S]*?)(?=\\n\\s*\\w+\\s*:|\\n\\s*\\[|$)`, "i");
        const fallbackMatch = generatedText.match(fallbackRegex);
        return fallbackMatch ? fallbackMatch[1].trim() : "";
      };

      const sections = {
        titulo: getSection("TITULO") || topic || "DDS SST",
        objetivo: getSection("OBJETIVO"),
        pontos: getSection("PONTOS"),
        dicas: getSection("DICAS"),
        conclusao: getSection("CONCLUSAO")
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(187, 134, 252); // Android accent color #BB86FC
      doc.text("DIÁLOGO DIÁRIO DE SEGURANÇA", margin, y);
      y += 10;

      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text(sections.titulo.toUpperCase(), margin, y);
      y += 12;

      if (sections.objetivo) {
        addWrappedText("OBJETIVO", 13, margin, { bold: true, color: [187, 134, 252] });
        y += 2;
        addWrappedText(sections.objetivo, 11, margin, { color: [220, 220, 220] });
        y += 4;
      }

      if (sections.pontos) {
        addWrappedText("PONTOS DE ATENÇÃO", 13, margin, { bold: true, color: [239, 68, 68] });
        y += 2;
        const pontos = sections.pontos.split("\n").map(p => p.trim()).filter(p => p.length > 0);
        for (const ponto of pontos) {
          const clean = ponto.replace(/^[-*•]\s*/, "").replace(/^\d+[\.\)]\s*/, "").trim();
          if (clean) {
            addWrappedText("• " + clean, 11, margin, { color: [220, 220, 220] });
            y += 1;
          }
        }
        y += 3;
      }

      if (sections.dicas) {
        addWrappedText("DICAS PRÁTICAS", 13, margin, { bold: true, color: [3, 218, 198] }); // Android success color
        y += 2;
        const dicas = sections.dicas.split("\n").map(d => d.trim()).filter(d => d.length > 0);
        for (const dica of dicas) {
          const clean = dica.replace(/^[-*•]\s*/, "").replace(/^\d+[\.\)]\s*/, "").trim();
          if (clean) {
            addWrappedText("• " + clean, 11, margin, { color: [220, 220, 220] });
            y += 1;
          }
        }
        y += 3;
      }

      if (sections.conclusao) {
        addWrappedText("CONCLUSÃO", 13, margin, { bold: true, color: [59, 130, 246] });
        y += 2;
        addWrappedText(sections.conclusao, 11, margin, { color: [220, 220, 220] });
      }

      doc.save("DIÁLOGO_SST_OFICIAL.pdf");
    } catch (err: any) {
      alert("Erro ao gerar PDF: " + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPPTX = async () => {
    if (!generatedText) return;
    const PptxLib = (window as any).PptxGenJS || (window as any).pptxgen;
    if (!PptxLib) {
      alert("Erro: Biblioteca de Apresentação não carregada.");
      return;
    }
    setIsDownloading(true);
    try {
      const pptx = new PptxLib();
      
      const getSection = (tag: string) => {
        const regex = new RegExp(`\\[\\s*${tag}\\s*\\]\\s*([\\s\\S]*?)(?=\\s*\\[|$)`, "i");
        const match = generatedText.match(regex);
        if (match && match[1].trim()) return match[1].trim();
        const fallbackRegex = new RegExp(`(?:^|\\n)\\s*${tag}\\s*:?\\s*([\\s\\S]*?)(?=\\n\\s*\\w+\\s*:|\\n\\s*\\[|$)`, "i");
        const fallbackMatch = generatedText.match(fallbackRegex);
        return fallbackMatch ? fallbackMatch[1].trim() : "";
      };

      const sections = {
        titulo: getSection("TITULO") || topic || "DDS SST",
        objetivo: getSection("OBJETIVO"),
        pontos: getSection("PONTOS"),
        dicas: getSection("DICAS"),
        conclusao: getSection("CONCLUSAO")
      };

      pptx.layout = "LAYOUT_WIDE";
      const bgColor = "121212";
      const primaryColor = "FFFFFF";
      const accentColor = "BB86FC";

      // SLIDE 1: CAPA
      const slide1 = pptx.addSlide();
      slide1.background = { color: bgColor };
      slide1.addText("DIÁLOGO DIÁRIO DE SEGURANÇA", { x: 0.5, y: 1.5, w: "90%", h: 1, fontSize: 24, color: accentColor, align: "center", bold: true });
      slide1.addText(sections.titulo.toUpperCase(), { x: 0.5, y: 2.5, w: "90%", h: 2, fontSize: 44, color: "03DAC6", align: "center", bold: true });
      slide1.addText(`SISTEMA PROFISSIONAL SST | ${new Date().toLocaleDateString()}`, { x: 0.5, y: 6.0, w: "90%", h: 0.5, fontSize: 14, color: "888888", align: "center" });

      // SLIDE 2: OBJETIVO
      if (sections.objetivo) {
        const slide2 = pptx.addSlide();
        slide2.background = { color: bgColor };
        slide2.addText("01. OBJETIVO DO TREINAMENTO", { x: 0.5, y: 0.4, w: "90%", h: 0.8, fontSize: 28, color: accentColor, bold: true });
        slide2.addText(sections.objetivo, { x: 0.8, y: 1.5, w: 11.5, h: 4, fontSize: 20, color: primaryColor, valign: "middle", align: "center", italic: true });
      }

      // SLIDE ILUSTRAÇÃO
      if (generatedImage) {
        try {
          const slideImg = pptx.addSlide();
          slideImg.background = { color: bgColor };
          slideImg.addText("ILUSTRAÇÃO DO TEMA", { x: 0.5, y: 0.4, w: "90%", h: 0.8, fontSize: 28, color: accentColor, bold: true });
          slideImg.addImage({ path: generatedImage, x: 1.5, y: 1.5, w: 10.33, h: 5, sizing: { type: "contain", w: 10.33, h: 5 } });
        } catch (e) {
          console.error("Erro ao adicionar imagem ao PPTX:", e);
        }
      }

      // SLIDE 3: PONTOS DE ATENÇÃO
      if (sections.pontos) {
        const slide3 = pptx.addSlide();
        slide3.background = { color: bgColor };
        slide3.addText("02. PONTOS DE ATENÇÃO", { x: 0.5, y: 0.4, w: "90%", h: 0.8, fontSize: 28, color: "EF4444", bold: true });
        const rawLines = sections.pontos.split("\n").map(p => p.trim()).filter(p => p.length > 0);
        const bulletPoints = rawLines.map(p => p.replace(/^[-*•]\s*/, "").replace(/^\d+[\.\)]\s*/, "").trim()).filter(p => p.length > 0);
        if (bulletPoints.length > 0) {
          slide3.addText(bulletPoints.map(p => ({ text: p, options: { bullet: true, color: primaryColor } })), { x: 1.0, y: 1.5, w: 11, h: 4, fontSize: 18, lineSpacing: 30 });
        } else {
          slide3.addText(sections.pontos, { x: 1.0, y: 1.5, w: 11, h: 4, fontSize: 16, color: primaryColor, align: "center" });
        }
      }

      // SLIDE 4: DICAS PRÁTICAS
      if (sections.dicas) {
        const slide4 = pptx.addSlide();
        slide4.background = { color: bgColor };
        slide4.addText("03. DICAS PARA O DIA A DIA", { x: 0.5, y: 0.4, w: "90%", h: 0.8, fontSize: 28, color: "03DAC6", bold: true });
        const rawLines = sections.dicas.split("\n").map(t => t.trim()).filter(t => t.length > 0);
        const bulletTips = rawLines.map(t => t.replace(/^[-*•]\s*/, "").replace(/^\d+[\.\)]\s*/, "").trim()).filter(t => t.length > 0);
        if (bulletTips.length > 0) {
          slide4.addText(bulletTips.map(p => ({ text: p, options: { bullet: true, color: primaryColor } })), { x: 1.0, y: 1.5, w: 11, h: 4, fontSize: 18, lineSpacing: 30 });
        } else {
          slide4.addText(sections.dicas, { x: 1.0, y: 1.5, w: 11, h: 4, fontSize: 16, color: primaryColor, align: "center" });
        }
      }

      // SLIDE 5: CONCLUSÃO
      if (sections.conclusao) {
        const slide5 = pptx.addSlide();
        slide5.background = { color: bgColor };
        slide5.addText("CONCLUSÃO", { x: 0.5, y: 1.0, w: "90%", h: 1, fontSize: 36, color: accentColor, align: "center", bold: true });
        slide5.addText(sections.conclusao, { x: 1.5, y: 2.2, w: 10, h: 3, fontSize: 24, color: "E2E8F0", align: "center", italic: true });
        slide5.addText("SEGURANÇA EM PRIMEIRO LUGAR, SEMPRE!", { x: 0.5, y: 6.0, w: "90%", h: 0.5, fontSize: 16, color: "FFFFFF", align: "center", bold: true });
      }

      await pptx.writeFile({ fileName: `DDS_${sections.titulo.replace(/\s+/g, "_").substring(0, 20)}.pptx` });
    } catch (err: any) {
      alert("Erro na Apresentação: " + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSave = () => {
    if (!generatedText) return;
    const content = `DIÁLOGO DIÁRIO DE SEGURANÇA\nTema: ${topic}\n\n${generatedText}\n\n---\nGerado em: ${new Date().toLocaleString("pt-BR")}\nSistema Profissional SST`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DDS_${topic?.replace(/[^a-zA-Z0-9]/g, "_") || "sst"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const generateDDS = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setError("");
    setGeneratedText("");
    setGeneratedImage("");

    try {
      const apiKey = (import.meta as any).env.VITE_OPENROUTER_API_KEY || "";

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Sistema Profissional SST"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `Crie um DDS (Diálogo Diário de Segurança) completo sobre o tema: ${topic}. 
              O DDS deve ser estruturado EXATAMENTE com as seguintes tags em maiúsculas e entre colchetes:
              [TITULO]
              [OBJETIVO]
              [PONTOS]
              [DICAS]
              [CONCLUSAO]
              
              Nas seções [PONTOS] e [DICAS], use uma lista com hífen (-) para cada item.
              Não use negrito ou outros formatos nas tags.
              Não inclua nenhum texto introdutório ou conclusivo fora das seções.`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error("Erro ao conectar com o serviço do OpenRouter.");
      }

      const data = await response.json();
      const text = data.choices[0].message.content;
      setGeneratedText(text);

      const imageUrl = `https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1000&auto=format&fit=crop`;
      setGeneratedImage(imageUrl);

      setHistory(prev => [{
        topic,
        text,
        image: imageUrl,
        date: new Date().toLocaleString("pt-BR")
      }, ...prev].slice(0, 5));

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao gerar o DDS.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-fade-in">
      <div className="xl:col-span-3 grid gap-6">
        <Card className="border-purple-500/10 bg-purple-950/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500 rounded-full blur-[100px]" />
          </div>
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2.5 rounded-xl text-white shadow-lg shadow-purple-600/10">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg text-purple-300">Gerador de DDS com IA</CardTitle>
                <CardDescription className="text-purple-400/60 mt-0.5">Treinamentos Diários Personalizados</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 relative z-10">
            <div className="grid gap-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 grid gap-2">
                  <Label htmlFor="dds-topic" className="text-purple-300">Tema do DDS</Label>
                  <Input 
                    id="dds-topic"
                    placeholder="Ex: Uso de protetor auricular, Segurança em Altura, Ergonomia..." 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="border-purple-500/20 focus:border-purple-400 bg-white/5"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={generateDDS} 
                    disabled={isGenerating || !topic}
                    className="w-full md:w-auto gap-2 bg-purple-600 text-white hover:bg-purple-700 shadow-purple-600/10"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Gerar DDS IA
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-950/20 border border-red-500/30 text-red-300 rounded-2xl text-xs font-bold leading-normal">
                  {error}
                </div>
              )}

              {(generatedText || generatedImage) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  <Card className="border-white/5 bg-white/5 shadow-inner">
                    <CardHeader className="bg-white/5 border-b border-white/5 py-3 flex flex-row items-center justify-between px-6 rounded-t-[2rem]">
                      <CardTitle className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Conteúdo do DDS
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-2 text-purple-300 hover:text-white">
                        {copySuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copySuccess ? "Copiado!" : "Copiar"}
                      </Button>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ScrollArea className="h-[360px] pr-2">
                        <div className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed font-medium">
                          {generatedText || "O texto será gerado aqui..."}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Card className="border-white/5 bg-white/5 shadow-inner">
                    <CardHeader className="bg-white/5 border-b border-white/5 py-3 px-6 rounded-t-[2rem]">
                      <CardTitle className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Imagem Ilustrativa
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col items-center justify-center min-h-[360px]">
                      {generatedImage ? (
                        <div className="grid gap-4 w-full text-center">
                          <img 
                            src={generatedImage} 
                            alt="Ilustração de Segurança" 
                            className="rounded-2xl shadow-2xl w-full object-cover aspect-video border border-white/10"
                            referrerPolicy="no-referrer"
                          />
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">Imagem sugerida para treinamento.</p>
                        </div>
                      ) : isGenerating ? (
                        <div className="flex flex-col items-center gap-3 text-purple-300/40">
                          <Loader2 className="w-8 h-8 animate-spin" />
                          <p className="text-xs font-black uppercase tracking-widest">Criando ilustração...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-white/10">
                          <ImageIcon className="w-12 h-12" />
                          <p className="text-xs font-black uppercase tracking-widest">Aguardando geração</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {generatedText && (
                <div className="flex justify-end gap-3 mt-4 flex-wrap">
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="gap-2 border-red-500/20 text-red-300 hover:bg-red-500/10 hover:border-red-500/30"
                  >
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    PDF Oficial
                  </Button>
                  <Button 
                    variant="purple"
                    onClick={handleDownloadPPTX}
                    disabled={isDownloading}
                    className="gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Baixar Apresentação (.pptx)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleSave}
                    className="gap-2 border-white/10 text-white"
                  >
                    <Download className="w-4 h-4" /> Salvar TXT
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="border-white/5 bg-white/5 h-full">
          <CardHeader className="border-b border-white/5 bg-black/20 rounded-t-[2rem] px-6 py-4">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-2">
              <History className="w-4 h-4" /> Histórico Recente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {history.length === 0 ? (
              <div className="text-center py-12 text-gray-600 font-bold uppercase tracking-widest text-[10px]">
                Nenhum DDS gerado
              </div>
            ) : (
              <div className="grid gap-3">
                {history.map((item, i) => (
                  <div 
                    key={i} 
                    className="p-3.5 rounded-2xl border border-white/5 bg-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 cursor-pointer transition-all group"
                    onClick={() => {
                      setTopic(item.topic);
                      setGeneratedText(item.text);
                      setGeneratedImage(item.image);
                    }}
                  >
                    <h4 className="text-xs font-black text-white group-hover:text-purple-300 truncate">{item.topic}</h4>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1.5">{item.date}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Kit SST Module Component
function KitSSTModule({ setMainTab, setDocuments, employees, trainings, user }: { 
  setMainTab: (tab: string) => void; 
  setDocuments: any;
  employees: any[];
  trainings: any[];
  user: User | null;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [kitTab, setKitTab] = useState("inicio");

  const checklistData = [
    {
      title: "1. Documentos Obrigatórios Gerais (NR 1 – GRO/PGR)",
      icon: <FileText className="w-4 h-4" />,
      items: [
        "Programa de Gerenciamento de Riscos (PGR)",
        "Inventário de Riscos",
        "Plano de Ação do PGR",
        "Ordem de Serviço de Segurança do Trabalho",
        "Procedimentos de Segurança",
        "Análise Preliminar de Risco (APR)",
        "Permissão de Trabalho (PT)",
        "Ficha de Entrega de EPI",
        "Registro de Treinamentos de Segurança",
        "Certificados de Treinamentos obrigatórios",
        "Registro de Inspeções de Segurança",
        "Investigação e Relatório de Acidentes",
        "Comunicação de Acidente do Trabalho (CAT)"
      ]
    },
    {
      title: "2. Documentos de Saúde Ocupacional (NR 7 – PCMSO)",
      icon: <Stethoscope className="w-4 h-4" />,
      items: [
        "PCMSO (Programa de Controle Médico de Saúde Ocupacional)",
        "ASO – Admissional",
        "ASO – Periódico",
        "ASO – Retorno ao trabalho",
        "ASO – Mudança de risco",
        "ASO – Demissional",
        "Relatório Anual do PCMSO",
        "Prontuários médicos"
      ]
    },
    {
      title: "3. Documentos de EPI (NR 6)",
      icon: <ShieldCheck className="w-4 h-4" />,
      items: [
        "Ficha de entrega de EPI assinada",
        "Controle de substituição de EPI",
        "Certificado de Aprovação (CA) dos EPIs",
        "Treinamento de uso de EPI"
      ]
    },
    {
      title: "4. Documentos de Emergência",
      icon: <ClipboardCheck className="w-4 h-4" />,
      items: [
        "Plano de Emergência",
        "Plano de Abandono",
        "Mapa de Rotas de Fuga",
        "Treinamento de Brigada de Incêndio",
        "Certificado de Brigadista",
        "Inspeção de extintores",
        "AVCB ou CLCB (Corpo de Bombeiros)"
      ]
    },
    {
      title: "5. Documentos Técnicos e Laudos",
      icon: <TableIcon className="w-4 h-4" />,
      items: [
        "LTCAT – Laudo Técnico das Condições Ambientais de Trabalho",
        "Laudo de Insalubridade",
        "Laudo de Periculosidade",
        "Laudo Ergonômico (NR 17)",
        "Laudo de instalações elétricas (NR 10)",
        "Laudo de máquinas e equipamentos (NR 12)",
        "Laudo de SPDA (para-raios)"
      ]
    }
  ];

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const handleSaveChecklistPDF = () => {
    const jspdfLib = (window as any).jspdf;
    if (!jspdfLib) {
      alert("Biblioteca PDF não carregada.");
      return;
    }
    const doc = new jspdfLib.jsPDF();
    const margin = 20;
    let y = 20;

    doc.setFontSize(20);
    doc.setTextColor(239, 108, 0); // Orange primary
    doc.text("Checklist de Auditoria Documental SST", margin, y);
    y += 15;

    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, margin, y);
    y += 15;

    checklistData.forEach((section) => {
      const checkedInSection = section.items.filter(item => checkedItems[item]);
      if (checkedInSection.length > 0) {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 30);
        doc.setFont("helvetica", "bold");
        doc.text(section.title, margin, y);
        y += 10;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        checkedInSection.forEach((item) => {
          if (y > 275) { doc.addPage(); y = 20; }
          doc.text(`[X] ${item}`, margin + 5, y);
          y += 8;
        });
        y += 5;
      }
    });
    doc.save("checklist-auditoria-sst.pdf");
  };

  const filteredChecklist = checklistData.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  const renderTabsList = () => {
    const items = [
      { id: "inicio", label: "Início", icon: <LayoutDashboard size={14} /> },
      { id: "checklist", label: "Checklist", icon: <ClipboardCheck size={14} /> },
      { id: "pgr", label: "PGR", icon: <ShieldCheck size={14} /> },
      { id: "pcmso", label: "PCMSO", icon: <Stethoscope size={14} /> },
      { id: "calor", label: "Calor (NR-15)", icon: <Thermometer size={14} /> },
      { id: "ruido", label: "Ruído (NR-15)", icon: <Volume2 size={14} /> },
      { id: "ergonomia", label: "Ergonomia (NR-17)", icon: <ScanSearch size={14} /> },
      { id: "checklistsst", label: "Checklist IA", icon: <ClipboardList size={14} /> },
      { id: "colaboradores", label: "Colaboradores", icon: <Users size={14} /> },
      { id: "treinamentos", label: "Treinamentos", icon: <GraduationCap size={14} /> }
    ];
    return (
      <div className="flex flex-wrap w-full bg-white/5 border-b border-white/5 p-1 gap-1.5 select-none rounded-t-[2rem]">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => setKitTab(item.id)}
            className={`flex-1 min-w-[120px] md:min-w-0 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${kitTab === item.id ? "bg-android-accent text-android-bg shadow-lg" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card className="border-orange-500/10 bg-orange-950/5 relative overflow-hidden animate-fade-in">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-500 rounded-full blur-[100px]" />
      </div>
      <CardHeader className="border-b border-white/5 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-orange-300 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Kit Completo de Segurança do Trabalho
            </CardTitle>
            <CardDescription className="text-orange-400/60 mt-0.5">Modelos, planilhas e checklists editáveis</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setKitTab("inicio")} className="border-orange-500/20 text-orange-300 hover:bg-orange-500/10">
            Voltar ao Início
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative z-10">
        <div className="w-full">
          {renderTabsList()}

          <div className="p-6">
            {kitTab === "inicio" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                <KitShortcutCard title="Checklist Geral" description="Auditoria documental completa." icon={<ClipboardCheck className="w-7 h-7 text-orange-400" />} onClick={() => setKitTab("checklist")} />
                <KitShortcutCard title="Modelo PGR" description="Gerenciamento de Riscos (NR 1)." icon={<FileText className="w-7 h-7 text-blue-400" />} onClick={() => setKitTab("pgr")} />
                <KitShortcutCard title="Modelo PCMSO" description="Saúde Ocupacional (NR 7)." icon={<Stethoscope className="w-7 h-7 text-emerald-400" />} onClick={() => setKitTab("pcmso")} />
                <KitShortcutCard title="Avaliação Calor" description="NR-15 Anexo 3 / NHO 06." icon={<Thermometer className="w-7 h-7 text-red-400" />} onClick={() => setKitTab("calor")} />
                <KitShortcutCard title="Avaliação Ruído" description="NR-15 Anexo 1 / NHO 01." icon={<Volume2 className="w-7 h-7 text-indigo-400" />} onClick={() => setKitTab("ruido")} />
                <KitShortcutCard title="Inspeção Ergonômica IA" description="Análise visual - NR 17." icon={<Camera className="w-7 h-7 text-teal-400" />} onClick={() => setKitTab("ergonomia")} />
                <KitShortcutCard title="Checklist SST com IA" description="Auditoria automatizada por IA." icon={<ClipboardList className="w-7 h-7 text-violet-400" />} onClick={() => setKitTab("checklistsst")} />
                <KitShortcutCard title="Gestão de Colaboradores" description="Controle e cadastro rápido." icon={<Users className="w-7 h-7 text-sky-400" />} onClick={() => setKitTab("colaboradores")} />
                <KitShortcutCard title="Gestão de Treinamentos" description="Controle de NRs e certificados." icon={<GraduationCap className="w-7 h-7 text-amber-400" />} onClick={() => setKitTab("treinamentos")} />
              </div>
            )}

            {kitTab === "checklist" && (
              <div className="grid gap-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <h3 className="text-lg font-black text-white">Checklist de Auditoria Documental</h3>
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <Input placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full md:w-48" />
                    <Button onClick={handleSaveChecklistPDF} className="bg-red-600 hover:bg-red-700 text-white font-bold" size="sm">PDF</Button>
                  </div>
                </div>
                <ScrollArea className="h-[460px] pr-2 bg-black/20 rounded-2xl border border-white/5 p-6 shadow-inner">
                  <div className="grid gap-6">
                    {filteredChecklist.map((section, idx) => (
                      <div key={idx} className="grid gap-3">
                        <h3 className="font-black text-xs uppercase tracking-widest text-orange-400 border-b border-white/5 pb-2 flex items-center gap-2">{section.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                          {section.items.map((item, i) => (
                            <div key={i} className="flex items-start space-x-3 p-1">
                              <Checkbox id={`check-${idx}-${i}`} checked={checkedItems[item] || false} onCheckedChange={() => toggleCheck(item)} />
                              <label htmlFor={`check-${idx}-${i}`} className="text-xs font-semibold text-gray-300 cursor-pointer select-none leading-normal">{item}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {kitTab === "pgr" && <PGRGeneratorModule />}
            {kitTab === "pcmso" && <PCMSOGeneratorModule />}
            {kitTab === "calor" && <HeatExposureModule />}
            {kitTab === "ruido" && <NoiseExposureModule />}
            {kitTab === "ergonomia" && <ErgonomicInspectionModule />}
            {kitTab === "checklistsst" && <ChecklistSSTModule />}
            {kitTab === "colaboradores" && <EmployeeModule employees={employees} user={user} />}
            {kitTab === "treinamentos" && <TrainingModule trainings={trainings} user={user} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KitShortcutCard({ title, description, icon, onClick }: { title: string; description: string; icon: ReactNode; onClick: () => void }) {
  return (
    <Card onClick={onClick} className="group border-white/5 bg-white/5 hover:border-orange-500/20 active:scale-95">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 p-4 rounded-2xl bg-white/5 group-hover:bg-orange-500/10 transition-colors">
          {icon}
        </div>
        <h4 className="font-black text-sm text-white mb-1.5 group-hover:text-orange-400 transition-colors">{title}</h4>
        <p className="text-[10px] text-gray-500 font-bold leading-normal">{description}</p>
      </div>
    </Card>
  );
}

// PGR Generator Module Component
function PGRGeneratorModule() {
  const [messages, setMessages] = useState<{ role: "bot" | "user"; text: string }[]>([
    { role: "bot", text: "Olá! Sou seu assistente de SST. Para iniciarmos a elaboração do Programa de Gerenciamento de Riscos (PGR), qual é o nome da empresa?" }
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [pgrData, setPgrData] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedPlan, setSuggestedPlan] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const pgrQuestions = [
    { id: "empresa", text: "Olá! Sou seu assistente de SST. Para iniciarmos o Programa de Gerenciamento de Riscos (PGR), qual é o nome da empresa?" },
    { id: "cnpj", text: "Qual o CNPJ da empresa?" },
    { id: "setor", text: "Descreva o setor ou a área específica que está sendo analisada neste PGR (ex: Produção, Administrativo, Manutenção)." },
    { id: "riscos", text: "Quais os principais riscos identificados na área? Descreva os perigos e possíveis lesões (ex: Físico - Ruído: Perda auditiva)." },
    { id: "matriz", text: "Com base na sua matriz de risco, qual a classificação predominante para este setor? (Baixo, Médio, Alto)" },
    { id: "planoAcao", text: "Gerando sugestão..." },
  ];

  const generateAIPGRPlan = async (riscos: string, setor: string, matriz: string) => {
    try {
      const apiKey = (import.meta as any).env.VITE_OPENROUTER_API_KEY || "";
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Sistema Profissional SST"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `Você é um engenheiro de segurança do trabalho. Crie um Plano de Ação (medidas de controle) curto e direto em formato de tópicos (bullet points) para o seguinte cenário de PGR:\nSetor: ${setor}\nRiscos: ${riscos}\nMatriz de Risco: ${matriz}\nNão escreva introduções, apenas a lista de ações sugeridas de forma técnica.`
            }
          ]
        })
      });
      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (e) {
      console.error(e);
      return "1. Providenciar EPIs adequados.\n2. Realizar treinamentos periódicos.\n3. Implementar sinalização de segurança no local.";
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;

    const userMessage = inputValue.trim();
    const currentQuestion = pgrQuestions[currentStep];

    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    let updatedPgrData = { ...pgrData, [currentQuestion.id]: userMessage };
    setPgrData(updatedPgrData);
    setInputValue("");

    if (currentStep === 4) {
      setMessages(prev => [...prev, { role: "bot", text: "Analisando os riscos identificados e gerando uma sugestão de Plano de Ação..." }]);
      setIsGenerating(true);
      const plan = await generateAIPGRPlan(updatedPgrData.riscos, updatedPgrData.setor, updatedPgrData.matriz);
      setSuggestedPlan(plan);
      setIsGenerating(false);
      setMessages(prev => [...prev, { role: "bot", text: `Baseado na sua análise, sugiro o seguinte Plano de Ação:\n\n${plan}\n\nVocê aceita essa sugestão? Responda "Sim" para aceitar ou digite o seu próprio plano de ação.` }]);
      setCurrentStep(5);
    } else if (currentStep === 5) {
      const accepted = userMessage.toLowerCase() === "sim" || userMessage.toLowerCase() === "aceito";
      const finalPlan = accepted ? suggestedPlan : userMessage;
      setPgrData(prev => ({ ...prev, planoAcao: finalPlan }));
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "bot", text: "Excelente! Dados coletados com sucesso. Agora você pode gerar o documento oficial do PGR em PDF clicando no botão abaixo." }]);
        setCurrentStep(6);
      }, 600);
    } else if (currentStep < pgrQuestions.length - 1) {
      const nextStep = currentStep + 1;
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "bot", text: pgrQuestions[nextStep].text }]);
        setCurrentStep(nextStep);
      }, 600);
    }
  };

  const handleDownloadPGR = async () => {
    const html2pdfLib = (window as any).html2pdf;
    if (!html2pdfLib) {
      alert("Biblioteca html2pdf não carregada. Atualize a página.");
      return;
    }
    setIsGenerating(true);
    try {
      const element = reportRef.current;
      if (!element) throw new Error("Elemento do relatório não encontrado");
      const opt = {
        margin: [10, 0, 10, 0],
        filename: `PGR_${(pgrData.empresa || "Oficial").replace(/\s+/g, "_")}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] }
      };
      await html2pdfLib().set(opt).from(element).save();
    } catch (e: any) {
      alert("Erro ao gerar PDF: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadWord = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>PGR</title></head><body style='font-family: Arial, sans-serif; line-height: 1.5;'>";
    const footer = "</body></html>";
    const content = `
      <h1 style="text-align:center; color: #1e293b;">PROGRAMA DE GERENCIAMENTO DE RISCOS (PGR - NR 1)</h1>
      <p style="text-align:center;"><strong>Empresa:</strong> ${pgrData.empresa || "Não informado"} | <strong>CNPJ:</strong> ${pgrData.cnpj || "Não informado"}</p>
      <p style="text-align:center;"><strong>Data:</strong> ${new Date().toLocaleDateString("pt-BR")}</p>
      <hr>
      <h2 style="color: #334155;">1. OBJETIVO</h2>
      <p>O presente PGR tem por objetivo estabelecer diretrizes e requisitos para o gerenciamento de riscos ocupacionais, estabelecendo ações de prevenção, minimização ou eliminação dos riscos identificados no ambiente de trabalho, em conformidade com as diretrizes da NR-01.</p>
      <h2 style="color: #334155;">2. METODOLOGIA</h2>
      <p>A metodologia utilizada baseia-se na identificação dos perigos e na estimativa da probabilidade e severidade das possíveis lesões ou agravos à saúde.</p>
      <h2 style="color: #334155;">3. INVENTÁRIO DE RISCOS</h2>
      <p><strong>Setor Analisado:</strong> ${pgrData.setor || "Geral"}</p>
      <p>${(pgrData.riscos || "").replace(/\n/g, "<br>")}</p>
      <p><strong>Classificação Predominante:</strong> ${pgrData.matriz || "Não avaliado"}</p>
      <h2 style="color: #334155;">4. PLANO DE AÇÃO</h2>
      <p>${(pgrData.planoAcao || "").replace(/\n/g, "<br>")}</p>
    `;
    const blob = new Blob(["\ufeff", header + content + footer], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PGR_${(pgrData.empresa || "Oficial").replace(/\s+/g, "_")}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-blue-500/10 bg-blue-950/5 relative overflow-hidden animate-fade-in shadow-inner">
      <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-blue-300 flex items-center gap-2">
            <FileText className="w-5 h-5" /> Assistente PGR (NR-1)
          </CardTitle>
          <CardDescription className="text-blue-400/60 mt-0.5">Elaboração simplificada passo a passo</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col h-[460px]">
          <ScrollArea className="flex-1 p-6">
            <div className="flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs font-semibold leading-normal ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white/5 text-gray-300 border border-white/5 rounded-tl-none"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-4 bg-black/20 border-t border-white/5">
            {currentStep < pgrQuestions.length ? (
              <div className="flex gap-2">
                <Textarea 
                  value={inputValue} 
                  onChange={(e) => setInputValue(e.target.value)} 
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Sua resposta..." 
                  className="bg-white/5 border-white/5 min-h-[50px] max-h-[150px] text-xs"
                />
                <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-750 font-bold"><Send className="w-4 h-4" /></Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button onClick={handleDownloadPGR} disabled={isGenerating} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-6 py-3.5">
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Gerar PDF
                </Button>
                <Button onClick={handleDownloadWord} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg px-6 py-3.5 border-none">
                  <FileText className="w-4 h-4" /> Baixar Word (.doc)
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Hidden PGR template */}
        <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
          <div ref={reportRef} style={{ backgroundColor: "#ffffff", color: "#1e293b" }} className="p-10 w-[800px] font-sans">
            <div style={{ borderBottom: "4px solid #1e40af" }} className="pb-6 mb-8 text-center">
              <h1 style={{ color: "#1e3a8a" }} className="text-3xl font-bold uppercase mb-2">Programa de Gerenciamento de Riscos (PGR)</h1>
              <h2 style={{ color: "#475569" }} className="text-xl font-semibold">Norma Regulamentadora Nº 01</h2>
            </div>
            <div style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }} className="border p-6 rounded-lg mb-8">
              <div className="grid grid-cols-2 gap-6">
                <div><strong className="uppercase text-xs text-slate-500 block mb-1">Empresa</strong><p className="font-semibold text-lg">{pgrData.empresa}</p></div>
                <div><strong className="uppercase text-xs text-slate-500 block mb-1">CNPJ</strong><p className="font-semibold text-lg">{pgrData.cnpj}</p></div>
                <div><strong className="uppercase text-xs text-slate-500 block mb-1">Data</strong><p className="font-semibold text-lg">{new Date().toLocaleDateString("pt-BR")}</p></div>
                <div><strong className="uppercase text-xs text-slate-500 block mb-1">Setor</strong><p className="font-semibold text-lg">{pgrData.setor}</p></div>
              </div>
            </div>
            <div className="mb-8">
              <h3 style={{ color: "#1e40af" }} className="text-xl font-bold border-b pb-2 mb-4">1. Objetivo</h3>
              <p className="leading-relaxed text-justify text-slate-700">Este PGR tem por objetivo gerenciar os riscos ocupacionais em conformidade com as diretrizes da NR-01.</p>
            </div>
            <div className="mb-8">
              <h3 style={{ color: "#1e40af" }} className="text-xl font-bold border-b pb-2 mb-4">2. Inventário de Riscos</h3>
              <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{pgrData.riscos}</p>
              <p className="mt-4"><strong>Classificação Predominante:</strong> {pgrData.matriz}</p>
            </div>
            <div className="mb-8">
              <h3 style={{ color: "#1e40af" }} className="text-xl font-bold border-b pb-2 mb-4">3. Plano de Ação</h3>
              <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{pgrData.planoAcao}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// PCMSO Generator Module Component
function PCMSOGeneratorModule() {
  const [messages, setMessages] = useState<{ role: "bot" | "user"; text: string }[]>([
    { role: "bot", text: "Olá! Vamos elaborar o PCMSO (Programa de Controle Médico de Saúde Ocupacional). Qual é o nome da empresa?" }
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [pcmsoData, setPcmsoData] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const pcmsoQuestions = [
    { id: "empresa", text: "Olá! Vamos elaborar o PCMSO. Qual é o nome da empresa?" },
    { id: "cnpj", text: "Qual o CNPJ da empresa?" },
    { id: "medico", text: "Qual é o nome do Médico do Trabalho coordenador deste PCMSO?" },
    { id: "crm", text: "Qual é o CRM (com UF) do médico coordenador?" },
    { id: "exames", text: "Relacione as funções e os respectivos exames clínicos/complementares necessários (Ex: Soldador - Audiometria, Espirometria, Raio-X)." },
    { id: "periodicidade", text: "Qual a periodicidade definida para os exames periódicos (Ex: Anual, Semestral)?" },
  ];

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    const currentQuestion = pcmsoQuestions[currentStep];

    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setPcmsoData(prev => ({ ...prev, [currentQuestion.id]: userMessage }));
    setInputValue("");

    if (currentStep < pcmsoQuestions.length - 1) {
      const nextStep = currentStep + 1;
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "bot", text: pcmsoQuestions[nextStep].text }]);
        setCurrentStep(nextStep);
      }, 600);
    } else {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "bot", text: "Excelente! Dados clínicos coletados com sucesso. Agora você pode gerar o documento oficial do PCMSO em PDF clicando no botão abaixo." }]);
        setCurrentStep(currentStep + 1);
      }, 600);
    }
  };

  const handleDownloadPCMSO = async () => {
    const html2pdfLib = (window as any).html2pdf;
    if (!html2pdfLib) {
      alert("Biblioteca html2pdf não carregada. Atualize a página.");
      return;
    }
    setIsGenerating(true);
    try {
      const element = reportRef.current;
      if (!element) throw new Error("Elemento não encontrado");
      const opt = {
        margin: [10, 0, 10, 0],
        filename: `PCMSO_${(pcmsoData.empresa || "Oficial").replace(/\s+/g, "_")}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] }
      };
      await html2pdfLib().set(opt).from(element).save();
    } catch (e: any) {
      alert("Erro ao gerar PDF: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-emerald-500/10 bg-emerald-950/5 relative overflow-hidden animate-fade-in shadow-inner">
      <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-emerald-300 flex items-center gap-2">
            <Stethoscope className="w-5 h-5" /> Assistente PCMSO (NR-7)
          </CardTitle>
          <CardDescription className="text-emerald-400/60 mt-0.5">Elaboração estruturada clínica</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col h-[460px]">
          <ScrollArea className="flex-1 p-6">
            <div className="flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs font-semibold leading-normal ${msg.role === "user" ? "bg-emerald-600 text-white rounded-tr-none" : "bg-white/5 text-gray-300 border border-white/5 rounded-tl-none"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-4 bg-black/20 border-t border-white/5">
            {currentStep < pcmsoQuestions.length ? (
              <div className="flex gap-2">
                <Textarea 
                  value={inputValue} 
                  onChange={(e) => setInputValue(e.target.value)} 
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Digite sua resposta..." 
                  className="bg-white/5 border-white/5 min-h-[50px] max-h-[150px] text-xs"
                />
                <Button onClick={handleSend} className="bg-emerald-600 hover:bg-emerald-700 font-bold"><Send className="w-4 h-4" /></Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button onClick={handleDownloadPCMSO} disabled={isGenerating} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg px-6 py-3.5">
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Gerar PDF
                </Button>
                <Button onClick={() => { setCurrentStep(0); setMessages([messages[0]]); setPcmsoData({}); }} variant="outline" className="border-white/5 hover:bg-white/5 text-white shadow-lg px-6 py-3.5">
                  Reiniciar
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Hidden PCMSO template */}
        <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
          <div ref={reportRef} style={{ backgroundColor: "#ffffff", color: "#1e293b" }} className="p-10 w-[800px] font-sans">
            <div style={{ borderBottom: "4px solid #059669" }} className="pb-6 mb-8 text-center">
              <h1 style={{ color: "#065f46" }} className="text-3xl font-bold uppercase mb-2">Programa de Controle Médico de Saúde Ocupacional</h1>
              <h2 style={{ color: "#475569" }} className="text-xl font-semibold">Norma Regulamentadora Nº 07</h2>
            </div>
            <div style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }} className="border p-6 rounded-lg mb-8">
              <div className="grid grid-cols-2 gap-6">
                <div><strong className="text-slate-500 uppercase text-xs block mb-1">Empresa</strong><p className="font-semibold text-lg">{pcmsoData.empresa}</p></div>
                <div><strong className="text-slate-500 uppercase text-xs block mb-1">CNPJ</strong><p className="font-semibold text-lg">{pcmsoData.cnpj}</p></div>
                <div><strong className="text-slate-500 uppercase text-xs block mb-1">Médico Coordenador</strong><p className="font-semibold text-lg">{pcmsoData.medico}</p></div>
                <div><strong className="text-slate-500 uppercase text-xs block mb-1">CRM</strong><p className="font-semibold text-lg">{pcmsoData.crm}</p></div>
              </div>
            </div>
            <div className="mb-8">
              <h3 style={{ color: "#059669" }} className="text-xl font-bold border-b pb-2 mb-4">1. Diretrizes Clínicas</h3>
              <p className="leading-relaxed text-justify text-slate-700">Este PCMSO visa promover e preservar a saúde do conjunto dos trabalhadores da empresa com exames periódicos em conformidade com as diretrizes da NR-07.</p>
            </div>
            <div className="mb-8">
              <h3 style={{ color: "#059669" }} className="text-xl font-bold border-b pb-2 mb-4">2. Funções e Exames</h3>
              <p className="whitespace-pre-wrap text-slate-700">{pcmsoData.exames}</p>
              <p className="mt-4"><strong>Periodicidade:</strong> {pcmsoData.periodicidade}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Heat Exposure Module Component
function HeatExposureModule() {
  const [messages, setMessages] = useState<{ role: "bot" | "user"; text: string }[]>([
    { role: "bot", text: "Olá! Sou o assistente especialista em Higiene Ocupacional (Calor). Posso ajudar a avaliar atividades de exposição ao calor conforme a NR-15 Anexo 3 e NHO-06.\n\nPara começar, preencha os dados da Empresa, CNPJ e Local no cabeçalho acima. Em seguida, descreva o cenário abaixo (ex: 'Trabalhador atua em fundição, o IBUTG medido é 31.0, atividade de montagem moderada com os braços')." }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [heatData, setHeatData] = useState({ empresa: "", cnpj: "", local: "" });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setInputValue("");
    setIsGenerating(true);

    try {
      const apiKey = (import.meta as any).env.VITE_OPENROUTER_API_KEY || "";
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: `Você é um Engenheiro de Segurança do Trabalho especialista em Higiene Ocupacional, com foco na avaliação de exposição ao calor (NR-15 Anexo 3 e NHO-06).
Sua tarefa é receber o cenário do usuário e gerar um relatório utilizando ESTRITAMENTE a seguinte estrutura de formatação em Markdown.
ATENÇÃO MATEMÁTICA CRÍTICA: Ao calcular o IBUTG com carga solar = (0,7*TBN) + (0,2*TG) + (0,1*TBS), você DEVE obrigatoriamente somar os três resultados parciais. Exemplo: (0,7*43) + (0,2*27) + (0,1*19) = 30,1 + 5,4 + 1,9 = 37,4 °C. Sem carga solar: (0,7*TBN) + (0,3*TG).
IBUTG médio e Média Metabólica (M) devem ser calculados para os 60 minutos contínuos mais críticos, conforme exigido pela norma. SE A SOMA DOS TEMPOS (t_A + t_B) FOR MAIOR QUE 60: Você DEVE cortar o tempo da situação de descanso para que a soma exata dê 60. Exemplo: t_A=45 e t_B=15 (45+15=60). O divisor É SEMPRE 60.
ATENÇÃO PARA WATTS: A NHO-06 exige o uso da Taxa Metabólica em WATTS (W). Se o usuário fornecer kcal/h, multiplique por 1,163. (Ex: 324 kcal/h x 1,163 = 376,8 W). Utilize APENAS os valores em WATTS (W).
PROIBIDO LATEX: É ESTRITAMENTE PROIBIDO o uso de formatação matemática LaTeX. Use apenas aritmética em texto simples. Exemplo: M_Media = [(376,8 x 45) + (246,6 x 15)] / 60 = 344,25 W.

### 1. Dados Coletados na Avaliação
**Situação A (Ambiente ...):**
- **TBN (Bulbo Úmido Natural):** ... °C
- **TG (Globo):** ... °C
- **TBS (Bulbo Seco):** ... °C (se houver)
- **Duração (t):** ... minutos
- **Taxa Metabólica (M):** ... W

### 2. Memória de Cálculo (Valores Corrigidos)
**Cálculo do IBUTG da(s) Situação(ões):**
- IBUTG = (0,7 x ...) + (0,2 x ...) + (0,1 x ...)
- IBUTG = ... °C
**Cálculo do IBUTG Médio Ponderado:**
- IBUTG_Médio = ... °C
**Cálculo da Taxa Metabólica Média Ponderada (M_Média):**
- M_Média = ... W

### 3. Interpretação dos Resultados e Conformidade
Conforme a Tabela 2 da NHO 06 (e Quadro 1 do Anexo 3 da NR-15):
- Para uma Taxa Metabólica Média de **... W**, o Limite de Exposição Ocupacional é de **... °C**.
- O IBUTG Médio encontrado foi de **... °C**.
Portanto, a exposição (ultrapassa/não ultrapassa) o limite legal.

### 4. Conclusão e Recomendações
A atividade avaliada é caracterizada como **(INSALUBRE / NÃO INSALUBRE)**.
1. Medidas de Engenharia: ...
2. Medidas Administrativas: ...
3. EPIs: ...`
            },
            ...messages.map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text })),
            { role: "user", content: userMessage }
          ]
        })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: "bot", text: data.choices[0].message.content }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "bot", text: "Erro ao analisar estresse térmico." }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    const html2pdfLib = (window as any).html2pdf;
    if (!html2pdfLib) {
      alert("Biblioteca html2pdf não carregada.");
      return;
    }
    setIsDownloading(true);
    try {
      const element = reportRef.current;
      if (!element) throw new Error("Elemento não encontrado");
      const opt = {
        margin: [10, 0, 10, 0],
        filename: `Avaliacao_Calor_${new Date().getTime()}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] }
      };
      await html2pdfLib().set(opt).from(element).save();
    } catch (e: any) {
      alert("Erro: " + e.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const lastBotMessage = messages.filter(m => m.role === "bot").pop();

  return (
    <div className="grid gap-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 p-5 rounded-2xl border border-white/5">
        <div className="space-y-1">
          <Label className="text-red-300">Empresa / Razão Social</Label>
          <Input placeholder="Nome da Empresa" value={heatData.empresa} onChange={(e) => setHeatData({...heatData, empresa: e.target.value})} className="h-9 border-red-500/20 bg-white/5" />
        </div>
        <div className="space-y-1">
          <Label className="text-red-300">CNPJ</Label>
          <Input placeholder="00.000.000/0000-00" value={heatData.cnpj} onChange={(e) => setHeatData({...heatData, cnpj: e.target.value})} className="h-9 border-red-500/20 bg-white/5" />
        </div>
        <div className="space-y-1">
          <Label className="text-red-300">Local (Setor)</Label>
          <Input placeholder="Ex: Galpão de Fundição" value={heatData.local} onChange={(e) => setHeatData({...heatData, local: e.target.value})} className="h-9 border-red-500/20 bg-white/5" />
        </div>
      </div>

      <Card className="border-red-500/10 bg-red-950/5 relative overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col h-[400px]">
            <ScrollArea className="flex-1 p-6 bg-slate-900/50">
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-xs font-semibold leading-normal ${msg.role === "user" ? "bg-red-600 text-white rounded-br-none" : "bg-white/5 text-gray-300 border border-white/5 rounded-tl-none"}`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/5 text-gray-300 rounded-2xl p-3 shadow-sm flex items-center gap-2 text-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-red-400" /> <span className="font-bold">Analisando calor (IBUTG)...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="p-4 bg-black/20 border-t border-white/5 flex gap-2">
              <Textarea 
                placeholder="Ex: IBUTG medido foi 31.0, atividade moderada..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if(e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                className="min-h-[50px] resize-none bg-white/5 border-white/5 text-xs"
              />
              <Button onClick={handleSend} disabled={isGenerating} className="h-auto bg-red-600 hover:bg-red-700 text-white font-bold px-6">
                <Send size={16} />
              </Button>
            </div>
          </div>
          {messages.length > 1 && (
            <div className="p-4 bg-black/40 border-t border-white/5 flex justify-end gap-2">
              <Button onClick={handleDownloadPDF} disabled={isDownloading} className="bg-red-600 hover:bg-red-700 text-white gap-2 font-bold py-2 px-4 text-xs">
                <Download size={14} /> PDF
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden Heat Report */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <div ref={reportRef} style={{ backgroundColor: "#ffffff", color: "#1e293b" }} className="p-10 w-[800px] font-sans">
          <div style={{ borderBottom: "4px solid #dc2626" }} className="pb-6 mb-8 text-center">
            <h1 style={{ color: "#991b1b" }} className="text-3xl font-bold uppercase mb-2">Relatório de Avaliação de Calor</h1>
            <h2 style={{ color: "#475569" }} className="text-xl font-semibold">Análise de Estresse Térmico - NR-15 e NHO-06</h2>
          </div>
          <div style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }} className="border p-6 rounded-lg mb-8">
            <div className="grid grid-cols-2 gap-6">
              <div><strong className="text-slate-500 uppercase text-xs block mb-1">Empresa</strong><p className="font-semibold text-lg">{heatData.empresa || "Não informado"}</p></div>
              <div><strong className="text-slate-500 uppercase text-xs block mb-1">CNPJ</strong><p className="font-semibold text-lg">{heatData.cnpj || "Não informado"}</p></div>
              <div className="col-span-2"><strong className="text-slate-500 uppercase text-xs block mb-1">Local</strong><p className="font-semibold text-lg">{heatData.local || "Não informado"}</p></div>
            </div>
          </div>
          <div className="mb-8">
            <h3 style={{ color: "#dc2626" }} className="text-xl font-bold border-b pb-2 mb-4">Parecer Técnico Detalhado</h3>
            <p className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed">{lastBotMessage?.text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Noise Exposure Module Component
function NoiseExposureModule() {
  const [messages, setMessages] = useState<{ role: "bot" | "user"; text: string }[]>([
    { role: "bot", text: "Olá! Sou o assistente especialista em Higiene Ocupacional (Ruído). Posso ajudar a avaliar atividades de exposição ao ruído contínuo ou intermitente conforme a NR-15 Anexo 1 e NHO-01.\n\nPara começar, preencha os dados da Empresa, CNPJ e Local no cabeçalho acima. Em seguida, descreva o cenário abaixo (ex: 'Ponto 1: 95 dB por 1 hora, Ponto 2: 92 dB por 1 hora, Ponto 3: 70 dB por 1 hora, Ponto 4: 87 dB por 5 horas')." }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [noiseData, setNoiseData] = useState({ empresa: "", cnpj: "", local: "" });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setInputValue("");
    setIsGenerating(true);

    try {
      const apiKey = (import.meta as any).env.VITE_OPENROUTER_API_KEY || "";
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: `Você é um Engenheiro de Segurança do Trabalho especialista em Higiene Ocupacional, avaliando exposição a Ruído (NR-15 Anexo 1 e NHO-01).
Sua tarefa é receber o cenário do usuário e gerar um relatório utilizando ESTRITAMENTE a estrutura de formatação em Markdown.
REGRAS CRÍTICAS:
1. Verifique se a soma das horas trabalhadas dá exatamente 8 horas.
2. Limites de tolerância NR-15 (Fator q=5): 85 dB(A) = 8h | 90 dB(A) = 4h | 95 dB(A) = 2h | 100 dB(A) = 1h. Níveis abaixo de 85 dB(A) não entram no cálculo de dose pela NR-15.
3. O cálculo da Dose é a soma das frações C/T (Tempo Exposto / Tempo Permitido). Se a dose > 1, há insalubridade de grau médio (20%).
4. PROIBIDO LATEX. Use apenas texto simples e Markdown.

### 1. Identificação dos Dados de Exposição
- **Ponto 1:** ... dB(A) por ... horas

### 2. Verificação da Jornada de Trabalho
**Cálculo da soma:** ... horas

### 3. Análise de Conformidade (Cálculo da Dose)
**Soma = C1/T1 + C2/T2 + ...**
Soma = ...
**Dose = ...**

### 4. Conclusão Técnica
O resultado do cálculo da dose foi ... caracterizando atividade como (INSALUBRE/NÃO INSALUBRE).`
            },
            ...messages.map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text })),
            { role: "user", content: userMessage }
          ]
        })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: "bot", text: data.choices[0].message.content }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "bot", text: "Erro ao analisar ruído." }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    const html2pdfLib = (window as any).html2pdf;
    if (!html2pdfLib) {
      alert("Biblioteca html2pdf não carregada.");
      return;
    }
    setIsDownloading(true);
    try {
      const element = reportRef.current;
      if (!element) throw new Error("Elemento não encontrado");
      const opt = {
        margin: [10, 0, 10, 0],
        filename: `Avaliacao_Ruido_${new Date().getTime()}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] }
      };
      await html2pdfLib().set(opt).from(element).save();
    } catch (e: any) {
      alert("Erro: " + e.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const lastBotMessage = messages.filter(m => m.role === "bot").pop();

  return (
    <div className="grid gap-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 p-5 rounded-2xl border border-white/5">
        <div className="space-y-1">
          <Label className="text-indigo-300">Empresa / Razão Social</Label>
          <Input placeholder="Nome da Empresa" value={noiseData.empresa} onChange={(e) => setNoiseData({...noiseData, empresa: e.target.value})} className="h-9 border-indigo-500/20 bg-white/5" />
        </div>
        <div className="space-y-1">
          <Label className="text-indigo-300">CNPJ</Label>
          <Input placeholder="00.000.000/0000-00" value={noiseData.cnpj} onChange={(e) => setNoiseData({...noiseData, cnpj: e.target.value})} className="h-9 border-indigo-500/20 bg-white/5" />
        </div>
        <div className="space-y-1">
          <Label className="text-indigo-300">Local (Setor)</Label>
          <Input placeholder="Ex: Produção, Usinagem" value={noiseData.local} onChange={(e) => setNoiseData({...noiseData, local: e.target.value})} className="h-9 border-indigo-500/20 bg-white/5" />
        </div>
      </div>

      <Card className="border-indigo-500/10 bg-indigo-950/5 relative overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col h-[400px]">
            <ScrollArea className="flex-1 p-6 bg-slate-900/50">
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-xs font-semibold leading-normal ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-white/5 text-gray-300 border border-white/5 rounded-tl-none"}`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/5 text-gray-300 rounded-2xl p-3 shadow-sm flex items-center gap-2 text-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> <span className="font-bold">Calculando dose de ruído...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="p-4 bg-black/20 border-t border-white/5 flex gap-2">
              <Textarea 
                placeholder="Ex: Ponto 1: 95 dB por 2 horas, Ponto 2: 80 dB por 6 horas..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if(e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                className="min-h-[50px] resize-none bg-white/5 border-white/5 text-xs"
              />
              <Button onClick={handleSend} disabled={isGenerating} className="h-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6">
                <Send size={16} />
              </Button>
            </div>
          </div>
          {messages.length > 1 && (
            <div className="p-4 bg-black/40 border-t border-white/5 flex justify-end gap-2">
              <Button onClick={handleDownloadPDF} disabled={isDownloading} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-bold py-2 px-4 text-xs">
                <Download size={14} /> PDF
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden Noise Report */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <div ref={reportRef} style={{ backgroundColor: "#ffffff", color: "#1e293b" }} className="p-10 w-[800px] font-sans">
          <div style={{ borderBottom: "4px solid #4f46e5" }} className="pb-6 mb-8 text-center">
            <h1 style={{ color: "#3730a3" }} className="text-3xl font-bold uppercase mb-2">Relatório de Avaliação de Ruído</h1>
            <h2 style={{ color: "#475569" }} className="text-xl font-semibold">Análise de Exposição Ocupacional - NR-15 e NHO-01</h2>
          </div>
          <div style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }} className="border p-6 rounded-lg mb-8">
            <div className="grid grid-cols-2 gap-6">
              <div><strong className="text-slate-500 uppercase text-xs block mb-1">Empresa</strong><p className="font-semibold text-lg">{noiseData.empresa || "Não informado"}</p></div>
              <div><strong className="text-slate-500 uppercase text-xs block mb-1">CNPJ</strong><p className="font-semibold text-lg">{noiseData.cnpj || "Não informado"}</p></div>
              <div className="col-span-2"><strong className="text-slate-500 uppercase text-xs block mb-1">Local</strong><p className="font-semibold text-lg">{noiseData.local || "Não informado"}</p></div>
            </div>
          </div>
          <div className="mb-8">
            <h3 style={{ color: "#4f46e5" }} className="text-xl font-bold border-b pb-2 mb-4">Parecer Técnico Detalhado</h3>
            <p className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed">{lastBotMessage?.text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ergonomic Inspection Module Component
function ErgonomicInspectionModule() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [ergData, setErgData] = useState({ empresa: "", cnpj: "", local: "", cargo: "" });
  const [additionalContext, setAdditionalContext] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setReport(null);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImageBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: { target: HTMLInputElement }) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setIsAnalyzing(true);
    setReport(null);

    try {
      const apiKey = (import.meta as any).env.VITE_OPENROUTER_API_KEY || "";
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages: [
            {
              role: "system",
              content: `Você é um Engenheiro de Segurança do Trabalho especialista em Ergonomia Ocupacional (NR 17).
Analise a imagem do posto de trabalho fornecida e gere um RELATÓRIO DE INSPEÇÃO ERGONÔMICA estruturado.
PROIBIDO LATEX. Use apenas texto simples e Markdown.

### 1. Diagnóstico Visual
Descreva o que foi observado na imagem: postura, mobiliário, equipamentos.

### 2. Enquadramento Normativo (NR 17)
Liste os itens da NR 17 violados ou em risco.

### 3. Classificação de Risco (Matriz 4x4)
Probabilidade (1-4), Severidade (1-4), Risco Final (Baixo/Médio/Alto/Crítico).

### 4. Plano de Ação Imediato
Ações corretivas numeradas e prazos.`
            },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`,
                    detail: "high"
                  }
                },
                {
                  type: "text",
                  text: `Analise ergonomicamente este posto de trabalho.\n\nContexto: ${additionalContext || "Nenhum"}\n\nEmpresa: ${ergData.empresa}\nCargo: ${ergData.cargo}\nLocal: ${ergData.local}`
                }
              ]
            }
          ],
          max_tokens: 2000,
          temperature: 0.2
        })
      });

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        setReport(data.choices[0].message.content);
      } else {
        throw new Error("Resposta inválida do serviço.");
      }
    } catch (error: any) {
      console.error(error);
      setReport(`**Erro ao analisar:** ${error.message || "Serviço indisponível"}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPDF = async () => {
    const html2pdfLib = (window as any).html2pdf;
    if (!html2pdfLib) { alert("Biblioteca html2pdf não carregada."); return; }
    setIsDownloading(true);
    try {
      const element = reportRef.current;
      if (!element) throw new Error("Elemento não encontrado");
      const opt = {
        margin: [10, 5, 10, 5],
        filename: `Inspecao_Ergonomica_${new Date().getTime()}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] }
      };
      await html2pdfLib().set(opt).from(element).save();
    } catch (e: any) {
      alert("Erro ao gerar PDF: " + e.message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="grid gap-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/5 p-5 rounded-2xl border border-white/5">
        <div className="space-y-1">
          <Label className="text-teal-300">Empresa</Label>
          <Input placeholder="Nome da empresa..." value={ergData.empresa} onChange={e => setErgData({...ergData, empresa: e.target.value})} className="h-9 border-teal-500/20 bg-white/5" />
        </div>
        <div className="space-y-1">
          <Label className="text-teal-300">CNPJ</Label>
          <Input placeholder="00.000.000/0000-00" value={ergData.cnpj} onChange={e => setErgData({...ergData, cnpj: e.target.value})} className="h-9 border-teal-500/20 bg-white/5" />
        </div>
        <div className="space-y-1">
          <Label className="text-teal-300">Local / Setor</Label>
          <Input placeholder="Ex: Administrativo" value={ergData.local} onChange={e => setErgData({...ergData, local: e.target.value})} className="h-9 border-teal-500/20 bg-white/5" />
        </div>
        <div className="space-y-1">
          <Label className="text-teal-300">Cargo Avaliado</Label>
          <Input placeholder="Ex: Assistente Administrativo" value={ergData.cargo} onChange={e => setErgData({...ergData, cargo: e.target.value})} className="h-9 border-teal-500/20 bg-white/5" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-teal-500/10 bg-teal-950/5">
          <CardHeader>
            <CardTitle className="text-teal-300 flex items-center gap-2"><Camera size={18} /> Foto do Posto de Trabalho</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative border border-dashed border-teal-500/30 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer min-h-[220px] flex items-center justify-center overflow-hidden"
            >
              {imagePreviewUrl ? (
                <img src={imagePreviewUrl} alt="Posto de trabalho" className="w-full h-full object-contain max-h-[220px] rounded-xl" />
              ) : (
                <div className="text-center p-6">
                  <Camera className="w-8 h-8 text-teal-400 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-black text-teal-300 uppercase tracking-wider">Clique para selecionar foto</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            <div className="space-y-1">
              <Label className="text-teal-300">Contexto Adicional (opcional)</Label>
              <Textarea
                placeholder="Ex: Monitor sem regulagem de altura..."
                value={additionalContext}
                onChange={e => setAdditionalContext(e.target.value)}
                className="min-h-[60px] bg-white/5 border-white/5 text-xs"
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!imageBase64 || isAnalyzing}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold"
            >
              {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analisando...</> : "Gerar Laudo Ergonômico"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-teal-500/10 bg-teal-950/5">
          <CardHeader>
            <CardTitle className="text-teal-300 flex items-center gap-2"><FileText size={18} /> Relatório Ergonômico IA</CardTitle>
          </CardHeader>
          <CardContent className="h-[360px]">
            <ScrollArea className="h-full pr-2 bg-black/20 rounded-2xl p-5 border border-white/5 shadow-inner">
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-teal-300/40">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-xs font-black uppercase tracking-widest">A IA está processando...</p>
                </div>
              )}
              {!isAnalyzing && !report && (
                <div className="flex flex-col items-center justify-center h-full text-center text-white/10">
                  <AlertTriangle className="w-10 h-10 mb-2" />
                  <p className="text-xs font-black uppercase tracking-widest">Aguardando Laudo</p>
                </div>
              )}
              {!isAnalyzing && report && (
                <div className="whitespace-pre-wrap text-xs text-gray-300 font-medium leading-relaxed">{report}</div>
              )}
            </ScrollArea>
          </CardContent>
          {report && (
            <div className="p-4 flex justify-end gap-2 border-t border-white/5">
              <Button onClick={handleDownloadPDF} disabled={isDownloading} className="bg-teal-600 hover:bg-teal-700 text-white gap-2 font-bold py-2 px-4 text-xs">
                <Download size={14} /> PDF
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Hidden Ergonomic PDF template */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <div ref={reportRef} style={{ backgroundColor: "#ffffff", color: "#1e293b" }} className="p-10 w-[800px] font-sans">
          <div style={{ borderBottom: "4px solid #0d9488" }} className="pb-6 mb-8 text-center">
            <h1 style={{ color: "#134e4a" }} className="text-3xl font-bold uppercase mb-2">Relatório de Inspeção Ergonômica</h1>
            <h2 style={{ color: "#475569" }} className="text-xl font-semibold">Avaliação por Inteligência Artificial — NR 17</h2>
          </div>
          <div style={{ backgroundColor: "#f0fdfa", borderColor: "#99f6e4" }} className="border p-6 rounded-lg mb-8">
            <div className="grid grid-cols-2 gap-6">
              <div><strong className="text-slate-500 uppercase text-xs block mb-1">Empresa</strong><p className="font-semibold text-lg">{ergData.empresa}</p></div>
              <div><strong className="text-slate-500 uppercase text-xs block mb-1">CNPJ</strong><p className="font-semibold text-lg">{ergData.cnpj}</p></div>
              <div><strong className="text-slate-500 uppercase text-xs block mb-1">Cargo</strong><p className="font-semibold text-lg">{ergData.cargo}</p></div>
              <div><strong className="text-slate-500 uppercase text-xs block mb-1">Local</strong><p className="font-semibold text-lg">{ergData.local}</p></div>
            </div>
          </div>
          <div className="mb-8">
            <h3 style={{ color: "#0d9488" }} className="text-xl font-bold border-b pb-2 mb-4">Parecer Ergonômico</h3>
            <p className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed">{report}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Checklist SST with IA Module Component
function ChecklistSSTModule() {
  const [messages, setMessages] = useState<{ role: "bot" | "user"; text: string }[]>([
    { role: "bot", text: "Olá! Sou o assistente de **Checklist SST com IA**.\n\nSelecione o tipo de checklist desejado (loja, escritório, indústria, equipamento etc.) e informe o contexto da auditoria. Vou gerar um relatório técnico completo com fundamentação legal, checklist detalhado e parecer final.\n\nPreencha os dados da empresa acima e descreva o que deseja auditar!" }
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({ empresa: "", cnpj: "", local: "", responsavel: "" });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsGenerating(true);

    try {
      const apiKey = (import.meta as any).env.VITE_OPENROUTER_API_KEY || "";
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: `Você é um Engenheiro de Segurança do Trabalho especialista em checklists ocupacionais.
Gere um Checklist Técnico detalhado em tópicos para a situação informada pelo usuário.
PROIBIDO LATEX. Use apenas texto simples e Markdown.` 
            },
            ...messages.map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text })),
            { role: "user", content: `Empresa: ${formData.empresa || "não informado"}. Local: ${formData.local || "não informado"}. Tipo: ${selectedType}.\n\n${userMsg}` }
          ]
        })
      });
      const data = await resp.json();
      setMessages(prev => [...prev, { role: "bot", text: data.choices[0].message.content }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "bot", text: "Erro ao gerar checklist com IA." }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-purple-500/10 bg-purple-950/5 relative overflow-hidden animate-fade-in shadow-inner">
      <CardHeader className="border-b border-white/5 pb-4">
        <CardTitle className="text-purple-300 flex items-center gap-2"><ClipboardList size={18} /> Checklist SST Inteligente</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input placeholder="Empresa" value={formData.empresa} onChange={e => setFormData({...formData, empresa: e.target.value})} className="h-9 text-xs" />
          <Input placeholder="CNPJ" value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} className="h-9 text-xs" />
          <Input placeholder="Local" value={formData.local} onChange={e => setFormData({...formData, local: e.target.value})} className="h-9 text-xs" />
          <Input placeholder="Responsável" value={formData.responsavel} onChange={e => setFormData({...formData, responsavel: e.target.value})} className="h-9 text-xs" />
        </div>

        <div className="flex flex-col h-[340px]">
          <ScrollArea className="flex-1 p-4 bg-slate-900/50 rounded-2xl border border-white/5">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-xs font-semibold leading-normal ${msg.role === "user" ? "bg-purple-600 text-white rounded-tr-none" : "bg-white/5 text-gray-300 border border-white/5 rounded-tl-none"}`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3 shadow-sm flex items-center gap-2 text-xs text-gray-300">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> <span>Processando checklist...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-3 bg-black/20 border-t border-white/5 mt-3 flex gap-2">
            <Textarea
              placeholder="Descreva o contexto da auditoria técnica..."
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              className="min-h-[50px] bg-white/5 border-white/5 text-xs"
            />
            <Button onClick={handleSend} disabled={isGenerating || !input.trim()} className="h-auto bg-purple-600 hover:bg-purple-700 text-white px-6">
              <Send size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Employee Management Module Component
function EmployeeModule({ employees, user }: { employees: any[]; user: User | null }) {
  const [name, setName] = useState("");
  const add = async () => {
    if (!name || !user) return;
    try {
      await addDoc(collection(db, "employees"), { name, uid: user.uid, createdAt: new Date().toISOString() });
      setName("");
    } catch (error) { console.error(error); }
  };
  const remove = async (id: string) => { await deleteDoc(doc(db, "employees", id)); };
  return (
    <Card className="border-white/5 bg-white/5 shadow-inner">
      <CardHeader><CardTitle className="text-xl">Gestão de Colaboradores</CardTitle></CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex gap-3 bg-black/25 p-4 rounded-2xl border border-white/5">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do colaborador" className="flex-1 bg-white/5" />
          <Button onClick={add} disabled={!user} className="bg-android-accent text-android-bg font-bold px-6"><Plus size={16} className="mr-2" /> Adicionar</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {employees.map((e) => (
            <Card key={e.id} className="bg-white/5 border border-white/5 p-4 flex justify-between items-center rounded-2xl">
              <span className="font-bold text-sm text-gray-200">{e.name}</span>
              <Button variant="ghost" size="icon" onClick={() => remove(e.id)} className="text-red-400 hover:bg-red-500/10 hover:text-red-300"><Trash2 size={16} /></Button>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Training Management Module Component
function TrainingModule({ trainings, user }: { trainings: any[]; user: User | null }) {
  const [name, setName] = useState("");
  const add = async () => {
    if (!name || !user) return;
    try {
      await addDoc(collection(db, "trainings"), { name, uid: user.uid, createdAt: new Date().toISOString() });
      setName("");
    } catch (error) { console.error(error); }
  };
  const remove = async (id: string) => { await deleteDoc(doc(db, "trainings", id)); };
  return (
    <Card className="border-white/5 bg-white/5 shadow-inner">
      <CardHeader><CardTitle className="text-xl">Gestão de Treinamentos</CardTitle></CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex gap-3 bg-black/25 p-4 rounded-2xl border border-white/5">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: NR 35 - Trabalho em Altura" className="flex-1 bg-white/5" />
          <Button onClick={add} disabled={!user} className="bg-android-accent text-android-bg font-bold px-6"><Plus size={16} className="mr-2" /> Adicionar</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {trainings.map((t) => (
            <Card key={t.id} className="bg-white/5 border border-white/5 p-4 flex justify-between items-center rounded-2xl">
              <span className="font-bold text-sm text-gray-200">{t.name}</span>
              <Button variant="ghost" size="icon" onClick={() => remove(t.id)} className="text-red-400 hover:bg-red-500/10 hover:text-red-300"><Trash2 size={16} /></Button>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
