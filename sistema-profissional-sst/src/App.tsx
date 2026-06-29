import { useState, ReactNode, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Users, GraduationCap, LayoutDashboard, ClipboardCheck, Table as TableIcon, Stethoscope, ShieldCheck, Plus, Trash2, Download, Sparkles, Loader2, Image as ImageIcon, Copy, Check, History, LogIn, LogOut, Send, Thermometer, Volume2, Camera, ScanSearch, AlertTriangle, ClipboardList, CheckSquare, XCircle, MinusCircle } from "lucide-react";
import { auth, db, googleProvider, signInWithPopup, onAuthStateChanged, collection, addDoc, deleteDoc, doc, onSnapshot, query, where, User } from "./firebase";
import { ChecklistSSTModule } from "./ChecklistSSTModule";

export default function SSTSystem() {
  const [tab, setTab] = useState("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [documents, setDocuments] = useState<{ id: string; name: string; validity: string }[]>([]);
  const [trainings, setTrainings] = useState<{ id: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);

  const [form, setForm] = useState({ name: "", validity: "" });

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

  const addDocument = async () => {
    if (!form.name || !form.validity || !user) return;
    try {
      await addDoc(collection(db, "documents"), {
        ...form,
        uid: user.uid,
        createdAt: new Date().toISOString()
      });
      setForm({ name: "", validity: "" });
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  const removeDocument = async (id: string) => {
    try {
      await deleteDoc(doc(db, "documents", id));
    } catch (error) {
      console.error("Error removing document:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto p-4 md:p-8 grid gap-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Sistema Profissional SST</h1>
            <p className="text-slate-500 mt-1">Gestão Completa de Saúde e Segurança do Trabalho</p>
          </div>
          <div className="flex gap-2 items-center">
            {/* Botões removidos conforme solicitado */}
          </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button variant={tab === "dashboard" ? "default" : "ghost"} onClick={() => setTab("dashboard")} className="gap-2 shrink-0">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Button>
          <Button variant={tab === "kit" ? "default" : "ghost"} onClick={() => setTab("kit")} className="gap-2 shrink-0 bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200">
            <ShieldCheck className="w-4 h-4" /> Kit Completo SST
          </Button>
        </nav>

        <main className="grid gap-8">
          {tab === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">{employees.length}</div>
                    <div className="text-sm font-medium text-blue-100 uppercase tracking-wider">Colaboradores</div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <Users className="w-8 h-8" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-lg">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">{documents.length}</div>
                    <div className="text-sm font-medium text-emerald-100 uppercase tracking-wider">Documentos</div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <FileText className="w-8 h-8" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{trainings.length}</div>
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Treinamentos</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* KIT COMPLETO SST */}
          {tab === "kit" && (
            <KitSSTModule setMainTab={setTab} setDocuments={setDocuments} employees={employees} trainings={trainings} user={user} />
          )}

          {/* DDS COM IA */}
          {tab === "dds-ia" && (
             <DDSGeneratorModule setDocuments={setDocuments} />
          )}
        </main>
      </div>
    </div>
  );
}

function DDSGeneratorModule({ setDocuments }: { setDocuments: any }) {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [history, setHistory] = useState<{ topic: string, text: string, image: string, date: string }[]>([]);

  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownloadPDF = async (isPresentation: boolean = false) => {
    if (!generatedText) return;
    alert("Iniciando geração de PDF...");
    const jspdfLib = (window as any).jspdf;
    if (!jspdfLib) {
      alert("Erro: Biblioteca PDF (jspdf) não encontrada.");
      return;
    }
    setIsDownloading(true);
    try {
      const doc = new jspdfLib.jsPDF({
        orientation: isPresentation ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const margin = 18;
      let y = margin;
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxLineWidth = pageWidth - margin * 2;

      const addWrappedText = (text: string, fontSize: number, x: number, opts?: { bold?: boolean, color?: [number, number, number] }) => {
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
        // 1. Tenta encontrar a tag de forma flexível (com ou sem espaços internos)
        const regex = new RegExp(`\\[\\s*${tag}\\s*\\]\\s*([\\s\\S]*?)(?=\\s*\\[|$)`, 'i');
        const match = generatedText.match(regex);
        if (match && match[1].trim()) return match[1].trim();
        
        // 2. Fallback: procura pela palavra-chave no início da linha (ex: "PONTOS:")
        const fallbackRegex = new RegExp(`(?:^|\\n)\\s*${tag}\\s*:?\\s*([\\s\\S]*?)(?=\\n\\s*\\w+\\s*:|\\n\\s*\\[|$)`, 'i');
        const fallbackMatch = generatedText.match(fallbackRegex);
        return fallbackMatch ? fallbackMatch[1].trim() : "";
      };

      const sections = {
        titulo: getSection('TITULO') || topic || "DDS SST",
        objetivo: getSection('OBJETIVO'),
        pontos: getSection('PONTOS'),
        dicas: getSection('DICAS'),
        conclusao: getSection('CONCLUSAO')
      };
      
      console.log("DDS Parsed Sections:", sections);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(88, 28, 135);
      doc.text("DIÁLOGO DIÁRIO DE SEGURANÇA", margin, y);
      y += 10;

      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text(sections.titulo.toUpperCase(), margin, y);
      y += 12;

      if (sections.objetivo) {
        addWrappedText("OBJETIVO", 13, margin, { bold: true, color: [147, 51, 234] });
        y += 2;
        addWrappedText(sections.objetivo, 11, margin, { color: [51, 65, 85] });
        y += 4;
      }

      if (sections.pontos) {
        addWrappedText("PONTOS DE ATENÇÃO", 13, margin, { bold: true, color: [220, 38, 38] });
        y += 2;
        const pontos = sections.pontos.split('\n')
          .map(p => p.trim())
          .filter(p => p.length > 0);
        
        for (const ponto of pontos) {
          const clean = ponto.replace(/^[-*•]\s*/, '').replace(/^\d+[\.\)]\s*/, '').trim();
          if (clean) {
            addWrappedText("• " + clean, 11, margin, { color: [51, 65, 85] });
            y += 1;
          }
        }
        y += 3;
      }

      if (sections.dicas) {
        addWrappedText("DICAS PRÁTICAS", 13, margin, { bold: true, color: [5, 150, 105] });
        y += 2;
        const dicas = sections.dicas.split('\n')
          .map(d => d.trim())
          .filter(d => d.length > 0);

        for (const dica of dicas) {
          const clean = dica.replace(/^[-*•]\s*/, '').replace(/^\d+[\.\)]\s*/, '').trim();
          if (clean) {
            addWrappedText("• " + clean, 11, margin, { color: [51, 65, 85] });
            y += 1;
          }
        }
        y += 3;
      }

      if (sections.conclusao) {
        addWrappedText("CONCLUSÃO", 13, margin, { bold: true, color: [37, 99, 235] });
        y += 2;
        addWrappedText(sections.conclusao, 11, margin, { color: [51, 65, 85] });
      }

      const fileName = "DIÁLOGO_SST_OFICIAL.pdf";
      try {
        doc.save(fileName);
      } catch {
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
      }
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
        const regex = new RegExp(`\\[\\s*${tag}\\s*\\]\\s*([\\s\\S]*?)(?=\\s*\\[|$)`, 'i');
        const match = generatedText.match(regex);
        if (match && match[1].trim()) return match[1].trim();
        
        const fallbackRegex = new RegExp(`(?:^|\\n)\\s*${tag}\\s*:?\\s*([\\s\\S]*?)(?=\\n\\s*\\w+\\s*:|\\n\\s*\\[|$)`, 'i');
        const fallbackMatch = generatedText.match(fallbackRegex);
        return fallbackMatch ? fallbackMatch[1].trim() : "";
      };

      const sections = {
        titulo: getSection('TITULO') || topic || "DDS SST",
        objetivo: getSection('OBJETIVO'),
        pontos: getSection('PONTOS'),
        dicas: getSection('DICAS'),
        conclusao: getSection('CONCLUSAO')
      };

      pptx.layout = 'LAYOUT_WIDE';
      const bgColor = "F8FAFC";
      const primaryColor = "1E293B";
      const accentColor = "6B21A8";

      // SLIDE 1: CAPA
      const slide1 = pptx.addSlide();
      slide1.background = { color: accentColor };
      slide1.addText("DIÁLOGO DIÁRIO DE SEGURANÇA", { x: 0.5, y: 1.5, w: "90%", h: 1, fontSize: 24, color: "FFFFFF", align: "center", bold: true });
      slide1.addText(sections.titulo.toUpperCase(), { x: 0.5, y: 2.5, w: "90%", h: 2, fontSize: 44, color: "F97316", align: "center", bold: true });
      slide1.addText(`SISTEMA PROFISSIONAL SST | ${new Date().toLocaleDateString()}`, { x: 0.5, y: 6.0, w: "90%", h: 0.5, fontSize: 14, color: "E9D5FF", align: "center" });

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
          slideImg.addImage({ path: generatedImage, x: 1.5, y: 1.5, w: 10.33, h: 5, sizing: { type: 'contain', w: 10.33, h: 5 } });
        } catch (e) {
          console.error("Erro ao adicionar imagem ao PPTX:", e);
        }
      }

      // SLIDE 3: PONTOS DE ATENÇÃO
      if (sections.pontos) {
        const slide3 = pptx.addSlide();
        slide3.background = { color: bgColor };
        slide3.addText("02. PONTOS DE ATENÇÃO", { x: 0.5, y: 0.4, w: "90%", h: 0.8, fontSize: 28, color: "B91C1C", bold: true });
        
        const rawLines = sections.pontos.split('\n').map(p => p.trim()).filter(p => p.length > 0);
        const bulletPoints = rawLines.map(p => p.replace(/^[-*•]\s*/, '').replace(/^\d+[\.\)]\s*/, '').trim()).filter(p => p.length > 0);

        if (bulletPoints.length > 0) {
          slide3.addText(bulletPoints.map(p => ({ text: p, options: { bullet: true, color: primaryColor } })), { x: 1.0, y: 1.5, w: 11, h: 4, fontSize: 18, lineSpacing: 30 });
        } else {
          slide3.addText(sections.pontos, { x: 1.0, y: 1.5, w: 11, h: 4, fontSize: 16, color: primaryColor, align: 'center' });
        }
      }

      // SLIDE 4: DICAS PRÁTICAS
      if (sections.dicas) {
        const slide4 = pptx.addSlide();
        slide4.background = { color: bgColor };
        slide4.addText("03. DICAS PARA O DIA A DIA", { x: 0.5, y: 0.4, w: "90%", h: 0.8, fontSize: 28, color: "15803D", bold: true });
        
        const rawLines = sections.dicas.split('\n').map(t => t.trim()).filter(t => t.length > 0);
        const bulletTips = rawLines.map(t => t.replace(/^[-*•]\s*/, '').replace(/^\d+[\.\)]\s*/, '').trim()).filter(t => t.length > 0);

        if (bulletTips.length > 0) {
          slide4.addText(bulletTips.map(p => ({ text: p, options: { bullet: true, color: primaryColor } })), { x: 1.0, y: 1.5, w: 11, h: 4, fontSize: 18, lineSpacing: 30 });
        } else {
          slide4.addText(sections.dicas, { x: 1.0, y: 1.5, w: 11, h: 4, fontSize: 16, color: primaryColor, align: 'center' });
        }
      }

      // SLIDE 5: CONCLUSÃO
      if (sections.conclusao) {
        const slide5 = pptx.addSlide();
        slide5.background = { color: accentColor };
        slide5.addText("CONCLUSÃO", { x: 0.5, y: 1.0, w: "90%", h: 1, fontSize: 36, color: "FFFFFF", align: "center", bold: true });
        slide5.addText(sections.conclusao, { x: 1.5, y: 2.2, w: 10, h: 3, fontSize: 24, color: "E9D5FF", align: "center", italic: true });
        slide5.addText("SEGURANÇA EM PRIMEIRO LUGAR, SEMPRE!", { x: 0.5, y: 6.0, w: "90%", h: 0.5, fontSize: 16, color: "FFFFFF", align: "center", bold: true });
      }

      await pptx.writeFile({ fileName: `DDS_${sections.titulo.replace(/\s+/g, '_').substring(0, 20)}.pptx` });
    } catch (err: any) {
      alert("Erro na Apresentação: " + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSave = () => {
    if (!generatedText) return;

    // Salvar no localStorage
    const saved = JSON.parse(localStorage.getItem("dds_saved") || "[]");
    const entry = {
      id: Date.now(),
      topic: topic || "Sem Título",
      text: generatedText,
      image: generatedImage,
      date: new Date().toLocaleString('pt-BR')
    };
    saved.unshift(entry);
    localStorage.setItem("dds_saved", JSON.stringify(saved.slice(0, 50)));

    // Baixar arquivo .txt
    const content = `DIÁLOGO DIÁRIO DE SEGURANÇA\nTema: ${topic}\n\n${generatedText}\n\n---\nGerado em: ${new Date().toLocaleString('pt-BR')}\nSistema Profissional SST`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DDS_${topic?.replace(/[^a-zA-Z0-9]/g, '_') || "sst"}.txt`;
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
      // @ts-ignore
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!apiKey || apiKey === "SUA_CHAVE_OPENROUTER_AQUI") {
        throw new Error("API Key do OpenRouter não configurada. Por favor, adicione VITE_OPENROUTER_API_KEY ao seu arquivo .env");
      }

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
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Erro na resposta do OpenRouter");
      }

      const data = await response.json();
      const text = data.choices[0].message.content;
      setGeneratedText(text);

      // Placeholder de imagem profissional
      const imageUrl = `https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1000&auto=format&fit=crop`;
      setGeneratedImage(imageUrl);

      // Adicionar ao histórico
      setHistory(prev => [{
        topic,
        text,
        image: imageUrl,
        date: new Date().toLocaleString('pt-BR')
      }, ...prev].slice(0, 5));

    } catch (err: any) {
      console.error("Erro ao gerar DDS:", err);
      setError(err.message || "Ocorreu um erro ao gerar o DDS via OpenRouter.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <div className="xl:col-span-3 grid gap-6">
        <Card className="border-purple-200 bg-purple-50/30 overflow-hidden">
          <CardHeader className="bg-purple-100/20 border-b border-purple-100">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg text-white">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl text-purple-800">Gerador de DDS com IA</CardTitle>
                <CardDescription className="text-purple-700/70">Crie Diálogos Diários de Segurança personalizados com texto e imagens ilustrativas.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 grid gap-2">
                  <Label htmlFor="dds-topic" className="text-purple-900 font-bold">Tema do DDS</Label>
                  <Input 
                    id="dds-topic"
                    placeholder="Ex: Importância do uso de protetor auricular, Segurança em Altura, Ergonomia no Escritório..." 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-white border-purple-200 focus-visible:ring-purple-500"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={generateDDS} 
                    disabled={isGenerating || !topic}
                    className="w-full md:w-auto gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Gerar DDS Completo
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {(generatedText || generatedImage) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  <Card className="border-purple-100 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50 border-b py-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Conteúdo do DDS
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                        {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copySuccess ? "Copiado!" : "Copiar"}
                      </Button>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ScrollArea className="h-[400px] pr-4">
                        <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">
                          {generatedText || "O texto será gerado aqui..."}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-100 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50 border-b py-3">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Imagem Ilustrativa
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
                      {generatedImage ? (
                        <div className="grid gap-4 w-full">
                          <img 
                            src={generatedImage} 
                            alt="Ilustração de Segurança" 
                            className="rounded-lg shadow-md w-full object-cover aspect-video"
                            referrerPolicy="no-referrer"
                          />
                          <p className="text-xs text-center text-slate-400 italic">Imagem gerada por IA para fins ilustrativos.</p>
                        </div>
                      ) : isGenerating ? (
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <Loader2 className="w-10 h-10 animate-spin" />
                          <p className="text-sm">Criando ilustração personalizada...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-slate-300">
                          <ImageIcon className="w-16 h-16" />
                          <p className="text-sm">A imagem será exibida aqui.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {generatedText && (
                <div className="flex justify-end gap-3 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleDownloadPDF(false)}
                    disabled={isDownloading}
                    className="gap-2 border-red-200 text-red-700 bg-red-50/50 hover:bg-red-100 hover:text-red-800 transition-all shadow-sm group"
                  >
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />}
                    {isDownloading ? "Gerando..." : "Baixar PDF Oficial"}
                  </Button>
                  <Button 
                    onClick={() => handleDownloadPPTX()}
                    disabled={isDownloading}
                    className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Baixar Apresentação (.pptx)
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-purple-600" /> Sugestões de Temas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["Uso de Protetor Auricular", "Segurança em Altura (NR 35)", "Prevenção de Incêndios", "Ergonomia no Home Office", "Primeiros Socorros Básicos", "Importância do EPC", "Cuidado com Ferramentas Manuais", "Sinalização de Segurança"].map((suggestion, i) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                  onClick={() => setTopic(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="border-slate-200 bg-white h-full">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <History className="w-4 h-4" /> Gerados Recentemente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {history.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">Nenhum DDS gerado ainda nesta sessão.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {history.map((item, i) => (
                  <div 
                    key={i} 
                    className="p-3 rounded-lg border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 cursor-pointer transition-all group"
                    onClick={() => {
                      setTopic(item.topic);
                      setGeneratedText(item.text);
                      setGeneratedImage(item.image);
                    }}
                  >
                    <h4 className="text-sm font-bold text-slate-700 group-hover:text-purple-700 truncate">{item.topic}</h4>
                    <p className="text-[10px] text-slate-400 mt-1">{item.date}</p>
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

function KitSSTModule({ setMainTab, setDocuments, employees, trainings, user }: { 
  setMainTab: (tab: string) => void, 
  setDocuments: any,
  employees: any[],
  trainings: any[],
  user: User | null
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
        "Plano de Action do PGR",
        "Ordem de Serviço de Segurança do Trabalho",
        "Procedimentos de Segurança",
        "Análise Preliminar de Risco (APR)",
        "Permissão de Trabalho (PT), quando aplicável",
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
    },
    {
      title: "6. Documentos para Obras e Construção (NR 18)",
      icon: <Plus className="w-4 h-4" />,
      items: [
        "PGR da obra",
        "Diário de obra",
        "Lista de trabalhadores",
        "Certificados de treinamentos NR 18",
        "APR das atividades"
      ]
    },
    {
      title: "7. Documentos Específicos por NR (10, 33, 35)",
      icon: <ShieldCheck className="w-4 h-4" />,
      items: [
        "NR 10: Prontuário das Instalações Elétricas",
        "NR 10: Certificados e Diagramas",
        "NR 33: PET – Permissão de Entrada e Trabalho",
        "NR 33: Certificado Supervisor/Vigia e Resgate",
        "NR 35: Certificado NR 35",
        "NR 35: APR e Permissão de Trabalho",
        "NR 35: Inspeção de cinturões e equipamentos"
      ]
    },
    {
      title: "8. Documentos da CIPA (NR 5)",
      icon: <Users className="w-4 h-4" />,
      items: [
        "Ata de eleição da CIPA",
        "Ata de posse",
        "Calendário de reuniões",
        "Atas das reuniões",
        "Treinamento da CIPA"
      ]
    },
    {
      title: "9. Documentos Previdenciários",
      icon: <FileText className="w-4 h-4" />,
      items: [
        "PPP – Perfil Profissiográfico Previdenciário",
        "CAT – Comunicação de Acidente do Trabalho",
        "GFIP / eSocial (eventos SST)"
      ]
    },
    {
      title: "10. Outros Documentos Importantes",
      icon: <Plus className="w-4 h-4" />,
      items: [
        "DDS – Diálogo Diário de Segurança (registros)",
        "Procedimentos operacionais",
        "Checklist de máquinas",
        "Registro de inspeções",
        "Controle de terceiros",
        "Documentação de empresas terceirizadas"
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
    doc.setTextColor(249, 115, 22);
    doc.text("Checklist de Auditoria Documental SST", margin, y);
    y += 15;

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, y);
    y += 15;

    checklistData.forEach((section) => {
      const checkedInSection = section.items.filter(item => checkedItems[item]);
      if (checkedInSection.length > 0) {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "bold");
        doc.text(section.title, margin, y);
        y += 10;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
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

  const handleSaveToGoogle = async (type: 'sheets' | 'docs') => {
    const scope = type === 'sheets' 
      ? 'https://www.googleapis.com/auth/spreadsheets' 
      : 'https://www.googleapis.com/auth/documents';
    
    try {
      const response = await fetch(`/api/auth/google/url?scope=${encodeURIComponent(scope)}`);
      if (!response.ok) {
        alert(`Erro de Configuração: O VITE_GOOGLE_CLIENT_ID não foi encontrado.`);
        return;
      }
      const { url } = await response.json();
      const authWindow = window.open(url, 'google_auth', 'width=600,height=600');
      if (!authWindow) {
        alert("O popup foi bloqueado.");
        return;
      }

      const handleAuthMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type === 'OAUTH_TOKEN') {
          const token = event.data.token;
          window.removeEventListener('message', handleAuthMessage);
          try {
            if (type === 'sheets') await createGoogleSheet(token);
            else await createGoogleDoc(token);
            alert(`Checklist salvo com sucesso no Google ${type === 'sheets' ? 'Sheets' : 'Docs'}!`);
          } catch (error) { console.error(error); }
        }
      };
      window.addEventListener('message', handleAuthMessage);
    } catch (error) { console.error(error); }
  };

  const createGoogleSheet = async (token: string) => {
    const checkedData = checklistData.map(section => ({
      title: section.title,
      items: section.items.filter(item => checkedItems[item])
    })).filter(s => s.items.length > 0);

    const spreadsheet = {
      properties: { title: `Checklist Auditoria SST - ${new Date().toLocaleDateString()}` },
      sheets: [{
        data: [{
          startRow: 0,
          startColumn: 0,
          rowData: [
            { values: [{ userEnteredValue: { stringValue: "Sessão" } }, { userEnteredValue: { stringValue: "Item" } }] },
            ...checkedData.flatMap(s => s.items.map(item => ({
              values: [{ userEnteredValue: { stringValue: s.title } }, { userEnteredValue: { stringValue: item } }]
            })))
          ]
        }]
      }]
    };

    await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(spreadsheet)
    });
  };

  const createGoogleDoc = async (token: string) => {
    const checkedData = checklistData.map(section => ({
      title: section.title,
      items: section.items.filter(item => checkedItems[item])
    })).filter(s => s.items.length > 0);

    const createResponse = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: `Checklist Auditoria SST - ${new Date().toLocaleDateString()}` })
    });
    const doc = await createResponse.json();

    const requests = [
      { insertText: { location: { index: 1 }, text: "Checklist de Auditoria Documental SST\n\n" } },
      ...checkedData.flatMap(s => [
        { insertText: { endOfSegmentLocation: {}, text: `${s.title}\n` } },
        ...s.items.map(item => ({ insertText: { endOfSegmentLocation: {}, text: `[X] ${item}\n` } })),
        { insertText: { endOfSegmentLocation: {}, text: "\n" } }
      ])
    ];

    await fetch(`https://docs.googleapis.com/v1/documents/${doc.documentId}:batchUpdate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests })
    });
  };

  const filteredChecklist = checklistData.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  return (
    <div className="grid gap-6">
      <Card className="border-orange-200 bg-orange-50/30 overflow-hidden">
        <CardHeader className="bg-orange-100/20 border-b border-orange-100">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl text-orange-800 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6" /> Kit Completo de Segurança do Trabalho
              </CardTitle>
              <CardDescription className="text-orange-700/70">Modelos, planilhas e checklists editáveis para sua gestão SST.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setKitTab("inicio")} className="border-orange-200 text-orange-700 hover:bg-orange-100">
              Voltar ao Início
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={kitTab} onValueChange={setKitTab} className="w-full">
            <TabsList className="flex flex-wrap w-full bg-orange-50/50 rounded-none border-b border-orange-100 h-auto p-1 gap-1">
              <TabsTrigger value="inicio" className="flex-1 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-700">
                <LayoutDashboard className="w-4 h-4" /> <span className="hidden md:inline">Início</span>
              </TabsTrigger>
              <TabsTrigger value="checklist" className="flex-1 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-700">
                <ClipboardCheck className="w-4 h-4" /> <span className="hidden md:inline">Checklist</span>
              </TabsTrigger>
              <TabsTrigger value="dds" className="flex-1 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-700">
                <Sparkles className="w-4 h-4" /> <span className="hidden md:inline">DDS IA</span>
              </TabsTrigger>
               <TabsTrigger value="pgr" className="flex-1 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-700">
                <ShieldCheck className="w-4 h-4" /> <span className="hidden md:inline">PGR</span>
              </TabsTrigger>
              <TabsTrigger value="pcmso" className="flex-1 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-700">
                <Stethoscope className="w-4 h-4" /> <span className="hidden md:inline">PCMSO</span>
              </TabsTrigger>
              <TabsTrigger value="calor" className="flex-1 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-700">
                <Thermometer className="w-4 h-4" /> <span className="hidden md:inline">Calor (NR-15)</span>
              </TabsTrigger>
              <TabsTrigger value="ruido" className="flex-1 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-700">
                <Volume2 className="w-4 h-4" /> <span className="hidden md:inline">Ruído (NR-15)</span>
              </TabsTrigger>
              <TabsTrigger value="ergonomia" className="flex-1 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-700">
                <ScanSearch className="w-4 h-4" /> <span className="hidden md:inline">Ergonomia (NR-17)</span>
              </TabsTrigger>
              <TabsTrigger value="checklistsst" className="flex-1 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-700">
                <ClipboardList className="w-4 h-4" /> <span className="hidden md:inline">Checklist SST</span>
              </TabsTrigger>
              <TabsTrigger value="colaboradores" className="flex-1 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-700">
                <Users className="w-4 h-4" /> <span className="hidden md:inline">Colaboradores</span>
              </TabsTrigger>
              <TabsTrigger value="treinamentos" className="flex-1 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-700">
                <GraduationCap className="w-4 h-4" /> <span className="hidden md:inline">Treinamentos</span>
              </TabsTrigger>
              <TabsTrigger value="planilhas" className="flex-1 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-700">
                <TableIcon className="w-4 h-4" /> <span className="hidden md:inline">Planilhas</span>
              </TabsTrigger>
              <TabsTrigger value="prioridades" className="flex-1 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-700">
                <FileText className="w-4 h-4" /> <span className="hidden md:inline">Prioridades</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inicio" className="p-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <KitShortcutCard title="Checklist Geral" description="Auditoria documental completa." icon={<ClipboardCheck className="w-8 h-8 text-orange-600" />} onClick={() => setKitTab("checklist")} />
                <KitShortcutCard title="DDS com IA" description="Gere diálogos personalizados." icon={<Sparkles className="w-8 h-8 text-purple-600" />} onClick={() => setKitTab("dds")} />
                <KitShortcutCard title="Modelo PGR" description="Gerenciamento de Riscos (NR 1)." icon={<FileText className="w-8 h-8 text-blue-600" />} onClick={() => setKitTab("pgr")} />
                <KitShortcutCard title="Modelo PCMSO" description="Saúde Ocupacional (NR 7)." icon={<Stethoscope className="w-8 h-8 text-emerald-600" />} onClick={() => setKitTab("pcmso")} />
                <KitShortcutCard title="Avaliação Calor" description="NR-15 Anexo 3 / NHO 06." icon={<Thermometer className="w-8 h-8 text-red-600" />} onClick={() => setKitTab("calor")} />
                <KitShortcutCard title="Avaliação Ruído" description="NR-15 Anexo 1 / NHO 01." icon={<Volume2 className="w-8 h-8 text-indigo-600" />} onClick={() => setKitTab("ruido")} />
                <KitShortcutCard title="Inspeção Ergonômica IA" description="Análise por foto - NR 17." icon={<Camera className="w-8 h-8 text-teal-600" />} onClick={() => setKitTab("ergonomia")} />
                <KitShortcutCard title="Checklist SST com IA" description="Auditoria: Equip., Instalação, Ergonomia." icon={<ClipboardList className="w-8 h-8 text-violet-600" />} onClick={() => setKitTab("checklistsst")} />
                <KitShortcutCard title="Planilhas SST" description="Controles de EPI e Treinamentos." icon={<TableIcon className="w-8 h-8 text-amber-600" />} onClick={() => setKitTab("planilhas")} />
                <KitShortcutCard title="Prioridades Fiscais" description="Foco em fiscalizações do trabalho." icon={<ShieldCheck className="w-8 h-8 text-red-600" />} onClick={() => setKitTab("prioridades")} />
                <KitShortcutCard title="Gestão de Colaboradores" description="Cadastro e controle de funcionários." icon={<Users className="w-8 h-8 text-indigo-600" />} onClick={() => setKitTab("colaboradores")} />
                <KitShortcutCard title="Gestão de Treinamentos" description="Controle de NRs e certificados." icon={<GraduationCap className="w-8 h-8 text-amber-600" />} onClick={() => setKitTab("treinamentos")} />
              </div>
            </TabsContent>

            <TabsContent value="checklist" className="p-6 mt-0">
              <div className="grid gap-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <h3 className="text-xl font-bold text-slate-800">Checklist de Auditoria Documental</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input placeholder="Buscar..." className="pl-10 bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <Button onClick={handleSaveChecklistPDF} className="gap-2 bg-red-600 hover:bg-red-700 text-white" size="sm">PDF</Button>
                    <Button onClick={() => handleSaveToGoogle('sheets')} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">Sheets</Button>
                  </div>
                </div>
                <ScrollArea className="h-[500px] pr-4 bg-white rounded-xl border p-4 shadow-inner">
                  <div className="grid gap-8">
                    {filteredChecklist.map((section, idx) => (
                      <div key={idx} className="grid gap-3">
                        <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">{section.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                          {section.items.map((item, i) => (
                            <div key={i} className="flex items-start space-x-2 p-1">
                              <Checkbox id={`check-${idx}-${i}`} checked={checkedItems[item] || false} onCheckedChange={() => toggleCheck(item)} />
                              <label htmlFor={`check-${idx}-${i}`} className="text-sm font-medium leading-tight cursor-pointer">{item}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="dds" className="p-6 mt-0">
              <DDSGeneratorModule setDocuments={setDocuments} />
            </TabsContent>

            <TabsContent value="pgr" className="p-0 mt-0">
              <PGRGeneratorModule />
            </TabsContent>

            <TabsContent value="pcmso" className="p-0 mt-0">
              <PCMSOGeneratorModule />
            </TabsContent>

            <TabsContent value="calor" className="p-6 mt-0">
              <HeatExposureModule />
            </TabsContent>
            
            <TabsContent value="ruido" className="p-6 mt-0">
              <NoiseExposureModule />
            </TabsContent>

            <TabsContent value="ergonomia" className="p-6 mt-0">
              <ErgonomicInspectionModule />
            </TabsContent>

            <TabsContent value="checklistsst" className="p-6 mt-0">
              <ChecklistSSTModule />
            </TabsContent>

            <TabsContent value="planilhas" className="p-6 mt-0">
               <div className="grid gap-4">
                  <h4 className="font-bold text-slate-700">Controles em Planilha</h4>
                  <div className="border rounded-xl bg-white shadow-sm overflow-hidden p-8 text-center text-slate-400 italic">
                    Área para upload e visualização de planilhas de controle.
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="colaboradores" className="p-0 mt-0">
              <EmployeeModule employees={employees} user={user} />
            </TabsContent>

            <TabsContent value="treinamentos" className="p-0 mt-0">
              <TrainingModule trainings={trainings} user={user} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function EmployeeModule({ employees, user }: { employees: any[], user: User | null }) {
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
    <Card className="shadow-sm">
      <CardHeader><CardTitle className="text-2xl">Gestão de Colaboradores</CardTitle></CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex gap-2 bg-slate-50 p-4 rounded-xl border">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do colaborador" className="flex-1" />
          <Button onClick={add} disabled={!user}><Plus className="w-4 h-4" /> Adicionar</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {employees.map((e) => (
            <Card key={e.id} className="bg-white border p-4 flex justify-between items-center">
              <span className="font-medium">{e.name}</span>
              <Button variant="ghost" size="icon" onClick={() => remove(e.id)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TrainingModule({ trainings, user }: { trainings: any[], user: User | null }) {
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
    <Card className="shadow-sm">
      <CardHeader><CardTitle className="text-2xl">Gestão de Treinamentos</CardTitle></CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex gap-2 bg-slate-50 p-4 rounded-xl border">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: NR 35" className="flex-1" />
          <Button onClick={add} disabled={!user}><Plus className="w-4 h-4" /> Adicionar</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {trainings.map((t) => (
            <Card key={t.id} className="bg-white border p-4 flex justify-between items-center">
              <span className="font-medium">{t.name}</span>
              <Button variant="ghost" size="icon" onClick={() => remove(t.id)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function KitShortcutCard({ title, description, icon, onClick }: { title: string, description: string, icon: ReactNode, onClick: () => void }) {
  return (
    <Card className="group hover:border-orange-400 hover:shadow-md transition-all cursor-pointer bg-white" onClick={onClick}>
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="mb-4 p-3 rounded-2xl bg-slate-50 group-hover:bg-orange-50 transition-colors">
          {icon}
        </div>
        <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function PGRGeneratorModule() {
  const [messages, setMessages] = useState<{ role: 'bot' | 'user', text: string }[]>([
    { role: 'bot', text: "Olá! Sou seu assistente de SST. Para iniciarmos a elaboração do Programa de Gerenciamento de Riscos (PGR), qual é o nome da empresa?" }
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [pgrData, setPgrData] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedPlan, setSuggestedPlan] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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
      // @ts-ignore
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!apiKey || apiKey === "SUA_CHAVE_OPENROUTER_AQUI") {
        throw new Error("API Key do OpenRouter não configurada.");
      }

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
    } catch (e: any) {
      console.error(e);
      return "1. Providenciar EPIs adequados.\n2. Realizar treinamentos periódicos.\n3. Implementar sinalização de segurança no local.";
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;

    const userMessage = inputValue.trim();
    const currentQuestion = pgrQuestions[currentStep];

    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    
    let updatedPgrData = { ...pgrData, [currentQuestion.id]: userMessage };
    setPgrData(updatedPgrData);
    setInputValue("");

    if (currentStep === 4) {
      setMessages(prev => [...prev, { role: 'bot', text: "Analisando os riscos identificados e gerando uma sugestão de Plano de Ação..." }]);
      setIsGenerating(true);
      
      const plan = await generateAIPGRPlan(updatedPgrData.riscos, updatedPgrData.setor, updatedPgrData.matriz);
      setSuggestedPlan(plan);
      setIsGenerating(false);
      
      setMessages(prev => [...prev, { role: 'bot', text: `Baseado na sua análise, sugiro o seguinte Plano de Ação:\n\n${plan}\n\nVocê aceita essa sugestão? Responda "Sim" para aceitar ou digite o seu próprio plano de ação.` }]);
      setCurrentStep(5);
    } 
    else if (currentStep === 5) {
      const accepted = userMessage.toLowerCase() === 'sim' || userMessage.toLowerCase() === 'aceito';
      const finalPlan = accepted ? suggestedPlan : userMessage;
      setPgrData(prev => ({ ...prev, planoAcao: finalPlan }));
      
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', text: "Excelente! Dados coletados com sucesso. Agora você pode gerar o documento oficial do PGR em PDF clicando no botão abaixo." }]);
        setCurrentStep(6);
      }, 600);
    }
    else if (currentStep < pgrQuestions.length - 1) {
      const nextStep = currentStep + 1;
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', text: pgrQuestions[nextStep].text }]);
        setCurrentStep(nextStep);
      }, 600);
    }
  };

  const handleDownloadPGR = async () => {
    const html2pdfLib = (window as any).html2pdf;
    
    if (!html2pdfLib) {
      alert("Biblioteca html2pdf não carregada. Atualize a página (F5).");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const element = reportRef.current;
      if (!element) throw new Error("Elemento do relatório não encontrado");
      
      const opt = {
        margin:       [10, 0, 10, 0],
        filename:     `PGR_${(pgrData.empresa || 'Oficial').replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] }
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
      <p style="text-align:center;"><strong>Empresa:</strong> ${pgrData.empresa || 'Não informado'} | <strong>CNPJ:</strong> ${pgrData.cnpj || 'Não informado'}</p>
      <p style="text-align:center;"><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
      <hr>
      <h2 style="color: #334155;">1. OBJETIVO</h2>
      <p>O presente Programa de Gerenciamento de Riscos (PGR) tem por objetivo estabelecer diretrizes e requisitos para o gerenciamento de riscos ocupacionais, estabelecendo ações de prevenção, minimização ou eliminação dos riscos identificados no ambiente de trabalho, em conformidade com as diretrizes estabelecidas na Norma Regulamentadora nº 01 (NR-1).</p>
      
      <h2 style="color: #334155;">2. METODOLOGIA</h2>
      <p>A metodologia utilizada para avaliação dos riscos ocupacionais baseia-se na identificação dos perigos, na estimativa da probabilidade e na severidade das possíveis lesões ou agravos à saúde. Os riscos foram classificados e priorizados utilizando matriz de risco padrão da organização para o desenvolvimento de planos de ação específicos.</p>

      <h2 style="color: #334155;">3. INVENTÁRIO DE RISCOS</h2>
      <p><strong>Setor Analisado:</strong> ${pgrData.setor || 'Geral'}</p>
      <h3 style="color: #475569;">Perigos e Riscos Identificados:</h3>
      <div style="margin-left: 15px;">
        <p>${(pgrData.riscos || 'Nenhum risco descrito.').replace(/([.!?])\s+(\d+\.|-|\*)\s/g, '$1\n$2 ').replace(/\n/g, '<br><br>')}</p>
      </div>
      <h3 style="color: #475569;">Classificação de Risco Predominante:</h3>
      <p>Nível: ${pgrData.matriz || 'Não avaliado'}</p>

      <h2 style="color: #334155;">4. PLANO DE AÇÃO</h2>
      <p>Para os riscos identificados no inventário, foram propostas as seguintes medidas de controle, preventivas e corretivas, buscando a eliminação ou redução da exposição aos agentes nocivos:</p>
      <h3 style="color: #475569;">Ações Propostas:</h3>
      <div style="margin-left: 15px;">
        <p>${(pgrData.planoAcao || 'Nenhuma ação sugerida.').replace(/([.!?])\s+(\d+\.|-|\*)\s/g, '$1\n$2 ').replace(/\n/g, '<br><br>')}</p>
      </div>

      <h2 style="color: #334155;">5. TERMO DE RESPONSABILIDADE</h2>
      <p>A empresa compromete-se a implementar as ações definidas neste Programa de Gerenciamento de Riscos, zelando pela saúde e integridade física de seus colaboradores, monitorando continuamente os ambientes e condições de trabalho.</p>
      <br><br><br>
      <table style="width:100%; text-align:center; margin-top: 50px;">
        <tr>
          <td>_____________________________________<br>Assinatura do Profissional SST</td>
          <td>_____________________________________<br>Assinatura do Empregador</td>
        </tr>
      </table>
    `;

    const blob = new Blob(['\ufeff', header + content + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PGR_${(pgrData.empresa || 'Oficial').replace(/\s+/g, '_')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-blue-200 shadow-sm overflow-hidden bg-white">
      <CardHeader className="bg-blue-50 border-b border-blue-100 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
            <FileText className="w-5 h-5" /> Assistente PGR
          </CardTitle>
          <CardDescription className="text-blue-700/70">Responda às perguntas para gerar seu documento oficial.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col h-[500px]">
          <ScrollArea className="flex-1 p-6">
            <div className="flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none shadow-sm' : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            {currentStep < pgrQuestions.length ? (
              <div className="flex gap-2">
                <Textarea 
                  value={inputValue} 
                  onChange={(e) => setInputValue(e.target.value)} 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Sua resposta (Shift+Enter para pular linha)..." 
                  className="bg-white shadow-sm border-slate-300 focus-visible:ring-blue-500 min-h-[50px] max-h-[200px]"
                />
                <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 shadow-sm"><Send className="w-4 h-4" /></Button>
              </div>
            ) : (              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button onClick={handleDownloadPGR} disabled={isGenerating} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all px-6 py-6 text-base">
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  {isGenerating ? 'Processando PDF...' : 'Baixar Oficial (PDF)'}
                </Button>
                <Button onClick={handleDownloadWord} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all px-6 py-6 text-base">
                  <FileText className="w-5 h-5" />
                  Baixar Editável (.doc)
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Hidden Report Template for PDF Generation via Canvas */}
        <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
          <style>{`.pdf-export-container * { border-color: #e2e8f0 !important; outline-color: transparent !important; background-color: inherit; color: inherit; }`}</style>
          <div ref={reportRef} style={{ backgroundColor: "#ffffff", color: "#1e293b" }} className="pdf-export-container p-10 w-[800px] font-sans">
            <div style={{ borderBottom: "4px solid #1e40af" }} className="pb-6 mb-8 text-center">
              <h1 style={{ color: "#1e3a8a" }} className="text-3xl font-bold uppercase mb-2">Programa de Gerenciamento de Riscos (PGR)</h1>
              <h2 style={{ color: "#475569" }} className="text-xl font-semibold">Norma Regulamentadora Nº 01</h2>
            </div>
            
            <div style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }} className="border p-6 rounded-lg mb-8">
              <div className="grid grid-cols-2 gap-6">
                <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">Empresa</strong><p className="font-semibold text-lg">{pgrData.empresa || 'Não informado'}</p></div>
                <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">CNPJ</strong><p className="font-semibold text-lg">{pgrData.cnpj || 'Não informado'}</p></div>
                <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">Data de Elaboração</strong><p className="font-semibold text-lg">{new Date().toLocaleDateString('pt-BR')}</p></div>
                <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">Setor Avaliado</strong><p className="font-semibold text-lg">{pgrData.setor || 'Geral'}</p></div>
              </div>
            </div>

            <div className="mb-8">
              <h3 style={{ borderBottomColor: "#e2e8f0", color: "#1e40af" }} className="text-xl font-bold border-b-2 pb-2 mb-4">1. Objetivo</h3>
              <p style={{ color: "#334155" }} className="leading-relaxed text-justify">O presente Programa de Gerenciamento de Riscos (PGR) tem por objetivo estabelecer diretrizes e requisitos para o gerenciamento de riscos ocupacionais, estabelecendo ações de prevenção, minimização ou eliminação dos riscos identificados no ambiente de trabalho, em conformidade com as diretrizes estabelecidas na Norma Regulamentadora nº 01 (NR-1).</p>
            </div>

            <div className="mb-8">
              <h3 style={{ borderBottomColor: "#e2e8f0", color: "#1e40af" }} className="text-xl font-bold border-b-2 pb-2 mb-4">2. Metodologia</h3>
              <p style={{ color: "#334155" }} className="leading-relaxed text-justify">A metodologia utilizada para avaliação dos riscos ocupacionais baseia-se na identificação dos perigos, na estimativa da probabilidade e na severidade das possíveis lesões ou agravos à saúde. Os riscos foram classificados e priorizados utilizando matriz de risco padrão da organização para o desenvolvimento de planos de ação específicos.</p>
            </div>

            <div className="html2pdf__page-break"></div>

            <div className="mb-8 mt-4">
              <h3 style={{ borderBottomColor: "#e2e8f0", color: "#1e40af" }} className="text-xl font-bold border-b-2 pb-2 mb-4">3. Inventário de Riscos</h3>
              <table className="w-full text-left border-collapse mt-4">
                <tbody>
                  <tr>
                    <td style={{ borderColor: "#cbd5e1", backgroundColor: "#f1f5f9", color: "#1e293b" }} className="border font-bold p-4 w-1/3">Classificação Predominante</td>
                    <td style={{ borderColor: "#cbd5e1", color: "#334155" }} className="border p-4 font-semibold">{pgrData.matriz || 'Não avaliada'}</td>
                  </tr>
                  <tr>
                    <td style={{ borderColor: "#cbd5e1", backgroundColor: "#f1f5f9", color: "#1e293b" }} className="border font-bold p-4 align-top">Riscos e Perigos Identificados</td>
                    <td style={{ borderColor: "#cbd5e1", color: "#334155" }} className="border p-4 whitespace-pre-wrap leading-relaxed">{pgrData.riscos?.replace(/([.!?])\s+(\d+\.|-|\*)\s/g, '$1\n$2 ') || 'Nenhum risco descrito.'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="html2pdf__page-break"></div>

            <div className="mb-12 mt-4">
              <h3 style={{ borderBottomColor: "#e2e8f0", color: "#1e40af" }} className="text-xl font-bold border-b-2 pb-2 mb-4">4. Plano de Ação</h3>
              <table className="w-full text-left border-collapse mt-4">
                <tbody>
                  <tr>
                    <td style={{ borderColor: "#cbd5e1", backgroundColor: "#f1f5f9", color: "#1e293b" }} className="border font-bold p-4 align-top w-1/3">Medidas e Controles Propostos</td>
                    <td style={{ borderColor: "#cbd5e1", color: "#334155" }} className="border p-4 whitespace-pre-wrap leading-relaxed">{pgrData.planoAcao?.replace(/([.!?])\s+(\d+\.|-|\*)\s/g, '$1\n$2 ') || 'Nenhuma ação sugerida.'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-24 pt-8 flex justify-between px-10">
              <div className="text-center w-[40%]">
                <div style={{ borderTopColor: "#94a3b8", color: "#1e293b" }} className="border-t-2 pt-2 font-bold">Responsável SST</div>
                <div style={{ color: "#64748b" }} className="text-sm mt-1">Assinatura Profissional</div>
              </div>
              <div className="text-center w-[40%]">
                <div style={{ borderTopColor: "#94a3b8", color: "#1e293b" }} className="border-t-2 pt-2 font-bold">{pgrData.empresa || 'Empresa'}</div>
                <div style={{ color: "#64748b" }} className="text-sm mt-1">Empregador / Representante</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PCMSOGeneratorModule() {
  const [messages, setMessages] = useState<{ role: 'bot' | 'user', text: string }[]>([
    { role: 'bot', text: "Olá! Vamos elaborar o PCMSO (Programa de Controle Médico de Saúde Ocupacional). Qual é o nome da empresa?" }
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [pcmsoData, setPcmsoData] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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

    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setPcmsoData(prev => ({ ...prev, [currentQuestion.id]: userMessage }));
    setInputValue("");

    if (currentStep < pcmsoQuestions.length - 1) {
      const nextStep = currentStep + 1;
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', text: pcmsoQuestions[nextStep].text }]);
        setCurrentStep(nextStep);
      }, 600);
    } else {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', text: "Excelente! Dados clínicos coletados com sucesso. Agora você pode gerar o documento oficial do PCMSO em PDF clicando no botão abaixo." }]);
        setCurrentStep(currentStep + 1);
      }, 600);
    }
  };

  const handleDownloadPCMSO = async () => {
    const html2pdfLib = (window as any).html2pdf;
    
    if (!html2pdfLib) {
      alert("Biblioteca html2pdf não carregada. Atualize a página (F5).");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const element = reportRef.current;
      if (!element) throw new Error("Elemento do relatório não encontrado");
      
      const opt = {
        margin:       [10, 0, 10, 0],
        filename:     `PCMSO_${(pcmsoData.empresa || 'Oficial').replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] }
      };

      await html2pdfLib().set(opt).from(element).save();
    } catch (e: any) {
      alert("Erro ao gerar PDF: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card className="border-emerald-200 bg-emerald-50/30 overflow-hidden shadow-sm">
        <CardHeader className="bg-emerald-100/20 border-b border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg text-white">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl text-emerald-800">Assistente PCMSO (NR 7)</CardTitle>
              <CardDescription className="text-emerald-700/70">Insira os dados clínicos fornecidos pelo médico do trabalho.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col h-[600px]">
            <ScrollArea className="flex-1 p-6 bg-slate-50/50">
              <div className="space-y-6">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="p-4 bg-white border-t border-slate-100">
              {currentStep < pcmsoQuestions.length ? (
                <div className="flex gap-2">
                  <Textarea 
                    placeholder="Digite sua resposta..." 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    className="min-h-[50px] resize-none bg-slate-50 focus-visible:ring-emerald-500"
                  />
                  <Button onClick={handleSend} disabled={isGenerating} className="h-auto px-6 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-4">
                  <Button onClick={handleDownloadPCMSO} disabled={isGenerating} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 px-8 text-lg w-full sm:w-auto shadow-md">
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />} Baixar Oficial (PDF)
                  </Button>
                  <Button onClick={() => { setCurrentStep(0); setMessages([messages[0]]); setPcmsoData({}); }} variant="outline" className="border-slate-300 text-slate-600 py-6 px-8 text-lg w-full sm:w-auto">
                    Novo PCMSO
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden Report Template */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <style>{`.pdf-export-container * { border-color: #e2e8f0 !important; outline-color: transparent !important; background-color: inherit; color: inherit; }`}</style>
        <div ref={reportRef} style={{ backgroundColor: "#ffffff", color: "#1e293b" }} className="pdf-export-container p-10 w-[800px] font-sans">
          <div style={{ borderBottom: "4px solid #059669" }} className="pb-6 mb-8 text-center">
            <h1 style={{ color: "#065f46" }} className="text-3xl font-bold uppercase mb-2">Programa de Controle Médico de Saúde Ocupacional</h1>
            <h2 style={{ color: "#475569" }} className="text-xl font-semibold">Norma Regulamentadora Nº 07</h2>
          </div>
          
          <div style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }} className="border p-6 rounded-lg mb-8">
            <div className="grid grid-cols-2 gap-6">
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">Empresa</strong><p className="font-semibold text-lg">{pcmsoData.empresa || 'Não informado'}</p></div>
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">CNPJ</strong><p className="font-semibold text-lg">{pcmsoData.cnpj || 'Não informado'}</p></div>
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">Data de Elaboração</strong><p className="font-semibold text-lg">{new Date().toLocaleDateString('pt-BR')}</p></div>
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">Médico Coordenador</strong><p className="font-semibold text-lg">{pcmsoData.medico || 'Não informado'}</p></div>
              <div className="col-span-2"><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">CRM</strong><p className="font-semibold text-lg">{pcmsoData.crm || 'Não informado'}</p></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 style={{ borderBottomColor: "#e2e8f0", color: "#059669" }} className="text-xl font-bold border-b-2 pb-2 mb-4">1. Objetivo e Diretrizes</h3>
            <p style={{ color: "#334155" }} className="leading-relaxed text-justify">Este PCMSO tem o objetivo de promover e preservar a saúde do conjunto dos trabalhadores da empresa, mediante avaliação clínica e exames complementares, em obediência às diretrizes da NR-07. O programa estabelece o monitoramento da exposição aos riscos ocupacionais identificados no PGR.</p>
          </div>

          <div className="html2pdf__page-break"></div>

          <div className="mb-8 mt-4">
            <h3 style={{ borderBottomColor: "#e2e8f0", color: "#059669" }} className="text-xl font-bold border-b-2 pb-2 mb-4">2. Relação de Exames Ocupacionais</h3>
            <table className="w-full text-left border-collapse mt-4">
              <tbody>
                <tr>
                  <td style={{ borderColor: "#cbd5e1", backgroundColor: "#f1f5f9", color: "#1e293b" }} className="border font-bold p-4 align-top w-1/3">Periodicidade Base</td>
                  <td style={{ borderColor: "#cbd5e1", color: "#334155" }} className="border p-4 whitespace-pre-wrap leading-relaxed">{pcmsoData.periodicidade || 'Não informada'}</td>
                </tr>
                <tr>
                  <td style={{ borderColor: "#cbd5e1", backgroundColor: "#f1f5f9", color: "#1e293b" }} className="border font-bold p-4 align-top">Funções e Exames (Clínicos / Complementares)</td>
                  <td style={{ borderColor: "#cbd5e1", color: "#334155" }} className="border p-4 whitespace-pre-wrap leading-relaxed">{pcmsoData.exames?.replace(/([.!?])\s+(\d+\.|-|\*)\s/g, '$1\n$2 ') || 'Nenhum exame descrito.'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="html2pdf__page-break"></div>

          <div className="mb-12 mt-4">
            <h3 style={{ borderBottomColor: "#e2e8f0", color: "#059669" }} className="text-xl font-bold border-b-2 pb-2 mb-4">3. Conduta e Encerramento</h3>
            <p style={{ color: "#334155" }} className="leading-relaxed text-justify">O médico examinador deverá emitir o Atestado de Saúde Ocupacional (ASO) em duas vias. Caso sejam detectadas alterações indicativas de adoecimento relacionadas ao trabalho, o médico coordenador deverá orientar a empresa para adequação do PGR e afastamento do trabalhador da exposição ao risco.</p>
          </div>

          <div className="mt-24 pt-8 flex justify-between px-10">
            <div className="text-center w-[40%]">
              <div style={{ borderTopColor: "#94a3b8", color: "#1e293b" }} className="border-t-2 pt-2 font-bold">{pcmsoData.medico || 'Médico Coordenador'}</div>
              <div style={{ color: "#64748b" }} className="text-sm mt-1">CRM: {pcmsoData.crm || '_________'}</div>
            </div>
            <div className="text-center w-[40%]">
              <div style={{ borderTopColor: "#94a3b8", color: "#1e293b" }} className="border-t-2 pt-2 font-bold">{pcmsoData.empresa || 'Empresa'}</div>
              <div style={{ color: "#64748b" }} className="text-sm mt-1">Representante Legal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeatExposureModule() {
  const [messages, setMessages] = useState<{ role: 'bot' | 'user', text: string }[]>([
    { role: 'bot', text: "Olá! Sou o assistente especialista em Higiene Ocupacional (Calor). Posso ajudar a avaliar atividades de exposição ao calor conforme a NR-15 Anexo 3 e NHO-06.\n\nPara começar, preencha os dados da Empresa, CNPJ e Local no cabeçalho acima. Em seguida, descreva o cenário abaixo (ex: 'Trabalhador atua em fundição, o IBUTG medido é 31.0, atividade de montagem moderada com os braços')." }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [heatData, setHeatData] = useState({
    empresa: "",
    cnpj: "",
    local: ""
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputValue("");
    setIsGenerating(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: `Você é um Engenheiro de Segurança do Trabalho especialista em Higiene Ocupacional, com foco na avaliação de exposição ao calor (NR-15 Anexo 3 e NHO-06).
Sua tarefa é receber o cenário do usuário e gerar um relatório utilizando ESTRITAMENTE a seguinte estrutura de formatação em Markdown.
ATENÇÃO MATEMÁTICA CRÍTICA: Ao calcular o IBUTG com carga solar = (0,7*TBN) + (0,2*TG) + (0,1*TBS), você DEVE obrigatoriamente somar os três resultados parciais. Exemplo: (0,7*43) + (0,2*27) + (0,1*19) = 30,1 + 5,4 + 1,9 = 37,4 °C. NUNCA esqueça de somar os 3 termos. Sem carga solar: (0,7*TBN) + (0,3*TG).
IBUTG médio e Média Metabólica (M) devem ser calculados para os 60 minutos contínuos mais críticos, conforme exigido pela norma. SE A SOMA DOS TEMPOS (t_A + t_B) FOR MAIOR QUE 60: Você DEVE cortar o tempo da situação de descanso/menos crítica para que a soma exata dos tempos na fórmula dê 60. Exemplo: se o ciclo é 45m trabalho + 45m descanso, use t_A=45 e t_B=15 (45+15=60). O divisor É SEMPRE 60.
ATENÇÃO PARA WATTS: A NHO-06 exige o uso da Taxa Metabólica em WATTS (W). Se o usuário fornecer o dado em kcal/h, você DEVE fazer a conversão multiplicando por 1,163. (Ex: 324 kcal/h x 1,163 = 376,8 W). Utilize APENAS os valores convertidos em WATTS (W) na equação da média M_Média. Nunca misture kcal/h na equação. Se a situação A é 376,8 W e a B é 246,6 W, faça: [(376,8 x 45) + (246,6 x 15)] / 60.
PROIBIDO LATEX: É ESTRITAMENTE PROIBIDO o uso de formatação matemática LaTeX (como \frac, \overline, \times, \approx). Use apenas aritmética em texto simples. Exemplo obrigatório: M_Media = [(376,8 x 45) + (246,6 x 15)] / 60 = 344,25 W.


### 1. Dados Coletados na Avaliação

**Situação A (Ambiente ...):**
- **TBN (Bulbo Úmido Natural):** ... °C
- **TG (Globo):** ... °C
- **TBS (Bulbo Seco):** ... °C (se houver)
- **Duração (t):** ... minutos
- **Taxa Metabólica (M):** ... W

(Adicione Situação B, C etc. se o usuário fornecer)
---

### 2. Memória de Cálculo (Valores Corrigidos)

**Cálculo do IBUTG da(s) Situação(ões):**
- IBUTG = (0,7 x ...) + (0,2 x ...) + (0,1 x ...)
- IBUTG = ... + ... + ...
- **IBUTG = ... °C**

**Cálculo do IBUTG Médio Ponderado:**
> IBUTG_Médio = [(IBUTG_A x t_A) + ...] / 60
- **IBUTG_Médio = ... °C**

**Cálculo da Taxa Metabólica Média Ponderada (M_Média):**
> M_Média = [(M_A x t_A) + ...] / 60
- **M_Média = ... W**

---

### 3. Interpretação dos Resultados e Conformidade

Conforme a **Tabela 2 da NHO 06 (e Quadro 1 do Anexo 3 da NR-15)** para trabalhadores aclimatizados:
- Para uma Taxa Metabólica Média de **... W**, o Limite de Exposição Ocupacional é de **... °C**.
- O IBUTG Médio encontrado foi de **... °C**.
Portanto, a exposição média (ultrapassa/não ultrapassa) o limite legal.

**Análise de Valor Teto:**
O Valor Teto para a taxa metabólica de esforço (Maior M) é de aprox. **... °C**.
Como o maior IBUTG atingiu **... °C**, o trabalhador está exposto a uma condição que (ultrapassa/não ultrapassa) o teto.

---

### 4. Conclusão e Recomendações

**Conclusão Técnica:**
A atividade avaliada é caracterizada como **(INSALUBRE / NÃO INSALUBRE)**.

**Recomendações e Medidas Corretivas Imediatas:**
1. **Medidas de Engenharia:** ...
2. **Medidas Administrativas:** ...
3. **Equipamentos de Proteção Individual (EPIs):** ...`
            },
            ...messages.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text })),
            { role: "user", content: userMessage }
          ]
        })
      });

      if (!response.ok) {
        throw new Error("Erro de conexão com o OpenRouter.");
      }

      const data = await response.json();
      const botResponse = data.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', text: "Desculpe, ocorreu um erro ao analisar o cenário. Verifique se a chave da API do OpenRouter está configurada corretamente no seu .env." }]);
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
      if (!element) throw new Error("Elemento do relatório não encontrado");
      
      const opt = {
        margin:       [10, 0, 10, 0],
        filename:     `Avaliacao_Calor_${new Date().getTime()}.pdf`,
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] }
      };

      await html2pdfLib().set(opt).from(element).save();
    } catch (e: any) {
      alert("Erro ao gerar PDF: " + e.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadDOC = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Avaliação de Calor</title></head><body>";
    const footer = "</body></html>";
    
    const content = `
      <h1 style="text-align: center; color: #991b1b; border-bottom: 2px solid #fca5a5; padding-bottom: 10px; font-family: sans-serif; text-transform: uppercase;">Relatório de Avaliação de Calor</h1>
      <h2 style="text-align: center; color: #475569; margin-top: -5px; font-family: sans-serif;">Análise de Estresse Térmico - NR-15 e NHO-06</h2>
      <p style="text-align: right; font-family: sans-serif;">Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}</p>

      <h2 style="color: #dc2626; font-family: sans-serif;">1. DADOS DA EMPRESA E AVALIAÇÃO</h2>
      <ul style="font-family: sans-serif; line-height: 1.6;">
        <li><b>Empresa Avaliada:</b> ${heatData.empresa || 'Não informado'}</li>
        <li><b>CNPJ:</b> ${heatData.cnpj || 'Não informado'}</li>
        <li><b>Local/Setor da Avaliação:</b> ${heatData.local || 'Não informado'}</li>
        <li><b>Metodologia:</b> NR-15 Anexo 3 / Fundacentro NHO-06</li>
      </ul>

      <h2 style="color: #dc2626; font-family: sans-serif;">2. PARECER TÉCNICO DETALHADO</h2>
      <div style="margin-left: 15px; text-align: left; line-height: 1.6; font-family: sans-serif;">
        ${lastBotMessage ? markdownToHtml(lastBotMessage.text) : "<p>Nenhuma avaliação gerada.</p>"}
      </div>

      <br clear="all" style="page-break-before:always" />
      <table style="width:100%; text-align:center; margin-top: 50px; font-family: sans-serif;">
        <tr>
          <td>_____________________________________<br><b>Responsável Técnico SST</b><br><span style="font-size: 12px; color: #64748b;">Assinatura Profissional</span></td>
          <td>_____________________________________<br><b>Sistema Mentorhub</b><br><span style="font-size: 12px; color: #64748b;">Emissão Digital</span></td>
        </tr>
      </table>
    `;

    const blob = new Blob(['\ufeff', header + content + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Avaliacao_Calor_${new Date().getTime()}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setMessages([
      { role: 'bot', text: "Olá! Sou o assistente especialista em Higiene Ocupacional (Calor). Posso ajudar a avaliar atividades de exposição ao calor conforme a NR-15 Anexo 3 e NHO-06.\n\nPara começar, preencha os dados da Empresa, CNPJ e Local no cabeçalho acima. Em seguida, descreva o cenário abaixo (ex: 'Trabalhador atua em fundição, o IBUTG medido é 31.0, atividade de montagem moderada com os braços')." }
    ]);
    setInputValue("");
    setHeatData({ empresa: "", cnpj: "", local: "" });
  };

  const markdownToHtml = (text: string) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // bold
      .replace(/\*(.*?)\*/g, '<i>$1</i>')     // italic
      .replace(/### (.*?)\n/g, '<h3 style="color: #dc2626; margin-top: 15px; margin-bottom: 5px; font-weight: bold;">$1</h3>\n') // headers
      .replace(/## (.*?)\n/g, '<h2 style="color: #991b1b; margin-top: 20px; margin-bottom: 8px; font-weight: bold; font-size: 1.2rem;">$1</h2>\n')
      .replace(/> (.*?)\n/g, '<blockquote style="border-left: 3px solid #ccc; margin-left: 10px; padding-left: 10px; color: #555; background: #f9fafb; padding: 5px;">$1</blockquote>\n');

    const lines = html.split('\n');
    let inList = false;
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) {
        const item = `<li style="margin-bottom: 4px; text-align: left;">${trimmed.substring(2)}</li>`;
        if (!inList) {
          inList = true;
          return `<ul style="margin-left: 20px; margin-top: 5px; margin-bottom: 10px; list-style-type: disc; text-align: left;">${item}`;
        }
        return item;
      } else if (trimmed.match(/^\d+\.\s/)) {
        const item = `<li style="margin-bottom: 4px; text-align: left;">${trimmed.replace(/^\d+\.\s/, '')}</li>`;
        if (!inList) {
          inList = true;
          return `<ol style="margin-left: 20px; margin-top: 5px; margin-bottom: 10px; list-style-type: decimal; text-align: left;">${item}`;
        }
        return item;
      } else {
        let res = line;
        let prefix = '';
        if (inList) {
          inList = false;
          prefix = `</ul>`;
        }
        if (!res.trim()) {
           return prefix + '<div style="height: 10px;"></div>';
        }
        
        // If it's already an HTML tag from our replaces, just return it
        if (res.startsWith('<h') || res.startsWith('<blockquote')) {
            return prefix + res;
        }
        
        // Otherwise wrap in a div with explicit left alignment to fix html2canvas scrambling
        return prefix + `<div style="text-align: left !important; margin-bottom: 4px; width: 100%; display: block;">${res}</div>`;
      }
    });
    if (inList) processedLines.push('</ul>');
    return processedLines.join('');
  };

  const lastBotMessage = messages.filter(m => m.role === 'bot').pop();

  return (
    <div className="grid gap-6">
      <Card className="border-red-200 bg-red-50/30 overflow-hidden shadow-sm">
        <CardHeader className="bg-red-100/20 border-b border-red-100">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-lg text-white">
              <Thermometer className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl text-red-800">Avaliação de Calor (NR-15)</CardTitle>
              <CardDescription className="text-red-700/70">Assistente IA especialista em limites de tolerância e Higiene Ocupacional.</CardDescription>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-red-100/50">
            <div className="space-y-1">
              <Label className="text-xs text-red-800">Empresa / Razão Social</Label>
              <Input placeholder="Nome da Empresa" value={heatData.empresa} onChange={(e) => setHeatData({...heatData, empresa: e.target.value})} className="h-8 border-red-200 bg-white focus-visible:ring-red-500" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-red-800">CNPJ</Label>
              <Input placeholder="00.000.000/0000-00" value={heatData.cnpj} onChange={(e) => setHeatData({...heatData, cnpj: e.target.value})} className="h-8 border-red-200 bg-white focus-visible:ring-red-500" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-red-800">Local da Avaliação (Setor)</Label>
              <Input placeholder="Ex: Galpão de Fundição" value={heatData.local} onChange={(e) => setHeatData({...heatData, local: e.target.value})} className="h-8 border-red-200 bg-white focus-visible:ring-red-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 border-t border-red-100">
          <div className="flex flex-col h-[70vh] min-h-[500px]">
            <div className="flex-1 p-6 bg-slate-50/50 overflow-y-auto">
              <div className="space-y-6 pb-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.role === 'user' ? 'bg-red-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                      <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-red-600" /> <span className="text-sm">Analisando limites de tolerância...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2 mb-3">
                <Textarea 
                  placeholder="Descreva o cenário (Ex: IBUTG 29.5, atividade moderada...)" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  className="min-h-[50px] resize-none bg-slate-50 focus-visible:ring-red-500"
                />
                <Button onClick={handleSend} disabled={isGenerating} className="h-auto px-6 bg-red-600 hover:bg-red-700 text-white">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 flex-wrap">
                <Button onClick={handleReset} variant="outline" className="border-slate-300 text-slate-600">
                  Nova Avaliação
                </Button>
                <Button onClick={handleDownloadDOC} disabled={isDownloading || messages.length < 2} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Download className="w-4 h-4" /> Gerar DOC
                </Button>
                <Button onClick={handleDownloadPDF} disabled={isDownloading || messages.length < 2} className="gap-2 bg-red-600 hover:bg-red-700 text-white">
                  {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Gerar PDF
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden Report Template for Heat Exposure */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <style>{`.pdf-export-container * { border-color: #e2e8f0 !important; outline-color: transparent !important; background-color: inherit; color: inherit; }`}</style>
        <div ref={reportRef} style={{ backgroundColor: "#ffffff", color: "#1e293b" }} className="pdf-export-container p-10 w-[800px] font-sans">
          <div style={{ borderBottom: "4px solid #dc2626" }} className="pb-6 mb-8 text-center">
            <h1 style={{ color: "#991b1b" }} className="text-3xl font-bold uppercase mb-2">Relatório de Avaliação de Calor</h1>
            <h2 style={{ color: "#475569" }} className="text-xl font-semibold">Análise de Estresse Térmico - NR-15 e NHO-06</h2>
          </div>
          
          <div style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }} className="border p-6 rounded-lg mb-8">
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">Empresa Avaliada</strong><p className="font-semibold text-lg">{heatData.empresa || 'Não informado'}</p></div>
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">CNPJ</strong><p className="font-semibold text-lg">{heatData.cnpj || 'Não informado'}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-4 border-t" style={{ borderTopColor: "#e2e8f0" }}>
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">Local/Setor da Avaliação</strong><p className="font-semibold text-lg">{heatData.local || 'Não informado'}</p></div>
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">Data da Emissão</strong><p className="font-semibold text-lg">{new Date().toLocaleDateString('pt-BR')}</p></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 style={{ borderBottomColor: "#e2e8f0", color: "#dc2626" }} className="text-xl font-bold border-b-2 pb-2 mb-4">Parecer Técnico Detalhado</h3>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-left">
              <div style={{ color: "#1e293b", fontSize: "14px", lineHeight: "1.6", textAlign: "left" }} 
                   dangerouslySetInnerHTML={{ __html: lastBotMessage ? markdownToHtml(lastBotMessage.text) : "<p>Nenhuma avaliação gerada ainda.</p>" }} />
            </div>
          </div>

          <div className="html2pdf__page-break"></div>
          <div className="mt-24 pt-8 flex justify-between px-10" style={{ pageBreakBefore: "always" }}>
            <div className="text-center w-[40%]">
              <div style={{ borderTopColor: "#94a3b8", color: "#1e293b" }} className="border-t-2 pt-2 font-bold">Responsável Técnico SST</div>
              <div style={{ color: "#64748b" }} className="text-sm mt-1">Assinatura Profissional</div>
            </div>
            <div className="text-center w-[40%]">
              <div style={{ borderTopColor: "#94a3b8", color: "#1e293b" }} className="border-t-2 pt-2 font-bold">Sistema Mentorhub</div>
              <div style={{ color: "#64748b" }} className="text-sm mt-1">Emissão Digital</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NoiseExposureModule() {
  const [messages, setMessages] = useState<{ role: 'bot' | 'user', text: string }[]>([
    { role: 'bot', text: "Olá! Sou o assistente especialista em Higiene Ocupacional (Ruído). Posso ajudar a avaliar atividades de exposição ao ruído contínuo ou intermitente conforme a NR-15 Anexo 1 e NHO-01.\n\nPara começar, preencha os dados da Empresa, CNPJ e Local no cabeçalho acima. Em seguida, descreva o cenário abaixo (ex: 'Ponto 1: 95 dB por 1 hora, Ponto 2: 92 dB por 1 hora, Ponto 3: 70 dB por 1 hora, Ponto 4: 87 dB por 5 horas')." }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [noiseData, setNoiseData] = useState({
    empresa: "",
    cnpj: "",
    local: ""
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputValue("");
    setIsGenerating(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: `Você é um Engenheiro de Segurança do Trabalho especialista em Higiene Ocupacional, avaliando exposição a Ruído (NR-15 Anexo 1 e NHO-01).
Sua tarefa é receber o cenário do usuário e gerar um relatório utilizando ESTRITAMENTE a estrutura de formatação em Markdown abaixo.

REGRAS MATEMÁTICAS E LEGAIS CRÍTICAS:
1. Verifique sempre se a soma das horas trabalhadas resulta em exatamente 8 horas. Mostre o cálculo da soma.
2. Utilize ESTRITAMENTE a Tabela de Limites de Tolerância do Anexo 1 da NR-15 (Fator de duplicação q=5):
   85 dB(A) = 8 horas | 86 dB(A) = 7 horas | 87 dB(A) = 6 horas | 88 dB(A) = 5 horas | 89 dB(A) = 4,5 horas (4h30) | 90 dB(A) = 4 horas
   91 dB(A) = 3,5 horas | 92 dB(A) = 3 horas | 93 dB(A) = 160 min (2,66h) | 94 dB(A) = 135 min (2,25h) | 95 dB(A) = 2 horas | 96 dB(A) = 1,75h
   98 dB(A) = 1,25h | 100 dB(A) = 1 hora
3. Valores medidos ABAIXO de 85 dB(A) NÃO entram no somatório da dose pela NR-15. Você deve excluí-los do cálculo (ou usar T infinito, resultando em 0 na fração).
4. O cálculo da Dose é a soma das frações C/T (Tempo Exposto / Tempo Permitido).
5. Se a soma for MAIOR que 1, a exposição está ACIMA do limite de tolerância (Insalubridade Grau Médio - 20%).
6. PROIBIDO LATEX: É ESTRITAMENTE PROIBIDO o uso de formatação matemática LaTeX (como \\frac, \\sum, \\approx, ** ou símbolos estranhos que quebrem no PDF). Use apenas aritmética em texto simples.
Exemplo obrigatório do cálculo: Soma = 1/2 + 1/3 + 0 + 5/6 = 1,66.

ESTRUTURA OBRIGATÓRIA (Siga exatamente estes títulos, sem adicionar mais nada):

### 1. Identificação dos Dados de Exposição
- **Ponto 1:** ... dB(A) por ... horas
- **Ponto 2:** ... dB(A) por ... horas
(Liste todos os pontos)

### 2. Verificação da Jornada de Trabalho
**Cálculo da soma:** ... + ... = ... horas
**Análise:** (Diga se totalizou 8 horas e se podemos prosseguir)

### 3. Análise de Conformidade (Cálculo da Dose)
**Tabela de Referência (NR-15):**
- ... dB(A): T = ... horas
- ... dB(A): T = ... horas
(Para níveis abaixo de 85 dB, justifique que não entram no somatório)

**Aplicação da Fórmula (Soma = C1/T1 + C2/T2 + ...):**
Soma = ... + ...
**Soma = ...**

### 4. Conclusão Técnica
O resultado do cálculo da dose foi ...
**Parecer Final:** (Descreva a conclusão final com base no resultado, se há insalubridade de grau médio 20%, e quais EPIs ou medidas são necessárias).`
            },
            ...messages.filter(m => m.text).map(m => ({
              role: m.role === 'bot' ? 'assistant' : 'user',
              content: m.text
            })),
            { role: "user", content: userMessage }
          ],
          temperature: 0.1
        })
      });

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        setMessages(prev => [...prev, { role: 'bot', text: data.choices[0].message.content }]);
      } else {
        throw new Error("Resposta inválida da API");
      }
    } catch (error) {
      console.error("Erro no chat:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "Ocorreu um erro ao processar sua avaliação. Verifique sua conexão ou tente novamente." }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const markdownToHtml = (text: string) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.*?)\*/g, '<i>$1</i>')
      .replace(/### (.*?)\n/g, '<h3 style="color: #4f46e5; margin-top: 15px; margin-bottom: 5px; font-weight: bold;">$1</h3>\n')
      .replace(/## (.*?)\n/g, '<h2 style="color: #3730a3; margin-top: 20px; margin-bottom: 8px; font-weight: bold; font-size: 1.2rem;">$1</h2>\n')
      .replace(/> (.*?)\n/g, '<blockquote style="border-left: 3px solid #ccc; margin-left: 10px; padding-left: 10px; color: #555; background: #f9fafb; padding: 5px;">$1</blockquote>\n');

    const lines = html.split('\n');
    let inList = false;
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) {
        const item = `<li style="margin-bottom: 4px; text-align: left;">${trimmed.substring(2)}</li>`;
        if (!inList) {
          inList = true;
          return `<ul style="margin-left: 20px; margin-top: 5px; margin-bottom: 10px; list-style-type: disc; text-align: left;">${item}`;
        }
        return item;
      } else if (trimmed.match(/^\d+\.\s/)) {
        const item = `<li style="margin-bottom: 4px; text-align: left;">${trimmed.replace(/^\d+\.\s/, '')}</li>`;
        if (!inList) {
          inList = true;
          return `<ol style="margin-left: 20px; margin-top: 5px; margin-bottom: 10px; list-style-type: decimal; text-align: left;">${item}`;
        }
        return item;
      } else {
        let res = line;
        let prefix = '';
        if (inList) {
          inList = false;
          prefix = '</ul>';
        }
        if (!res.trim()) {
           return prefix + '<div style="height: 10px;"></div>';
        }
        if (res.startsWith('<h') || res.startsWith('<blockquote')) {
            return prefix + res;
        }
        return prefix + `<div style="text-align: left !important; margin-bottom: 4px; width: 100%; display: block;">${res}</div>`;
      }
    });
    if (inList) processedLines.push('</ul>');
    return processedLines.join('');
  };

  const handleDownloadDOC = () => {
    if (messages.length < 2) return;
    setIsDownloading(true);

    const lastBotMessage = messages.filter(m => m.role === 'bot').pop();
    
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Relatório de Ruído</title></head><body style='font-family: Arial, sans-serif; line-height: 1.5;'>";
    const footer = "</body></html>";
    const content = `
      <h1 style="text-align:center; color: #1e293b; font-family: sans-serif;">RELATÓRIO DE AVALIAÇÃO DE RUÍDO</h1>
      <h3 style="text-align:center; color: #475569; font-family: sans-serif;">Análise de Exposição Ocupacional - NR-15 e NHO-01</h3>
      <hr style="border: 1px solid #e2e8f0; margin-bottom: 20px;">
      
      <table style="width:100%; margin-bottom: 20px; font-family: sans-serif; font-size: 14px;">
        <tr>
          <td><strong>Empresa Avaliada:</strong> ${noiseData.empresa || 'Não informado'}</td>
          <td><strong>CNPJ:</strong> ${noiseData.cnpj || 'Não informado'}</td>
        </tr>
        <tr>
          <td><strong>Local/Setor:</strong> ${noiseData.local || 'Não informado'}</td>
          <td><strong>Data da Emissão:</strong> ${new Date().toLocaleDateString('pt-BR')}</td>
        </tr>
      </table>

      <h2 style="color: #4f46e5; font-family: sans-serif;">PARECER TÉCNICO DETALHADO</h2>
      <div style="margin-left: 15px; text-align: left; line-height: 1.6; font-family: sans-serif;">
        ${lastBotMessage ? markdownToHtml(lastBotMessage.text) : "<p>Nenhuma avaliação gerada.</p>"}
      </div>

      <br clear="all" style="page-break-before:always" />
      <table style="width:100%; text-align:center; margin-top: 50px; font-family: sans-serif;">
        <tr>
          <td>_____________________________________<br><b>Responsável Técnico SST</b><br><span style="font-size: 12px; color: #64748b;">Assinatura Profissional</span></td>
          <td>_____________________________________<br><b>Sistema Mentorhub</b><br><span style="font-size: 12px; color: #64748b;">Emissão Digital</span></td>
        </tr>
      </table>
    `;

    const blob = new Blob(['\ufeff', header + content + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Avaliacao_Ruido_${(noiseData.empresa || 'Empresa').replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsDownloading(false);
  };

  const handleDownloadPDF = async () => {
    const html2pdfLib = (window as any).html2pdf;
    if (!html2pdfLib) {
      alert("Biblioteca html2pdf não carregada. Atualize a página.");
      return;
    }
    
    setIsDownloading(true);
    
    try {
      const element = reportRef.current;
      if (!element) throw new Error("Elemento do relatório não encontrado");
      
      const opt = {
        margin:       [10, 0, 10, 0],
        filename:     `Avaliacao_Ruido_${(noiseData.empresa || 'Empresa').replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] }
      };

      await html2pdfLib().set(opt).from(element).save();
    } catch (e: any) {
      alert("Erro ao gerar PDF: " + e.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const lastBotMessage = messages.filter(m => m.role === 'bot').pop();

  return (
    <div className="grid gap-6">
      <Card className="border-indigo-200 bg-indigo-50/30 overflow-hidden shadow-sm">
        <CardHeader className="bg-indigo-100/20 border-b border-indigo-100 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-sm">
                <Volume2 className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl text-indigo-800">Avaliação de Ruído (NR-15)</CardTitle>
                <CardDescription className="text-indigo-700/70 mt-1">Cálculo de Dose de Exposição Ocupacional</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-white border-b border-slate-100 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label htmlFor="ruido-empresa" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Empresa Avaliada</Label>
                <Input id="ruido-empresa" placeholder="Nome da empresa..." value={noiseData.empresa} onChange={(e) => setNoiseData({...noiseData, empresa: e.target.value})} className="h-9 border-slate-200 focus-visible:ring-indigo-500 bg-slate-50" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ruido-cnpj" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CNPJ</Label>
                <Input id="ruido-cnpj" placeholder="00.000.000/0000-00" value={noiseData.cnpj} onChange={(e) => setNoiseData({...noiseData, cnpj: e.target.value})} className="h-9 border-slate-200 focus-visible:ring-indigo-500 bg-slate-50" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ruido-local" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Local / Setor</Label>
                <Input id="ruido-local" placeholder="Ex: Produção, Usinagem..." value={noiseData.local} onChange={(e) => setNoiseData({...noiseData, local: e.target.value})} className="h-9 border-slate-200 focus-visible:ring-indigo-500 bg-slate-50" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-5 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                      {msg.role === 'bot' ? (
                        <div className="prose prose-sm max-w-none prose-h3:text-indigo-700 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2 prose-h3:font-bold prose-p:leading-relaxed prose-li:my-1" dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.text) }} />
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      )}
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> <span className="text-sm">Calculando dose de ruído...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2 mb-3">
                <Textarea 
                  placeholder="Descreva o cenário (Ex: Ponto 1: 95 dB(A) por 1h, Ponto 2: 92 dB(A)...)" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  className="min-h-[50px] resize-none bg-slate-50 focus-visible:ring-indigo-500"
                />
                <Button onClick={handleSend} disabled={isGenerating} className="h-auto px-6 bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 flex-wrap">
                <Button onClick={() => setMessages([messages[0]])} variant="outline" className="border-slate-300 text-slate-600">
                  Nova Avaliação
                </Button>
                <Button onClick={handleDownloadDOC} disabled={isDownloading || messages.length < 2} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Download className="w-4 h-4" /> Gerar DOC
                </Button>
                <Button onClick={handleDownloadPDF} disabled={isDownloading || messages.length < 2} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                  {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Gerar PDF
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden Report Template for Noise Exposure */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <style>{`.pdf-export-container * { border-color: #e2e8f0 !important; outline-color: transparent !important; background-color: inherit; color: inherit; }`}</style>
        <div ref={reportRef} style={{ backgroundColor: "#ffffff", color: "#1e293b" }} className="pdf-export-container p-10 w-[800px] font-sans">
          <div style={{ borderBottom: "4px solid #4f46e5" }} className="pb-6 mb-8 text-center">
            <h1 style={{ color: "#3730a3" }} className="text-3xl font-bold uppercase mb-2">Relatório de Avaliação de Ruído</h1>
            <h2 style={{ color: "#475569" }} className="text-xl font-semibold">Análise de Exposição Ocupacional - NR-15 e NHO-01</h2>
          </div>
          
          <div style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }} className="border p-6 rounded-lg mb-8">
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">Empresa Avaliada</strong><p className="font-semibold text-lg">{noiseData.empresa || 'Não informado'}</p></div>
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">CNPJ</strong><p className="font-semibold text-lg">{noiseData.cnpj || 'Não informado'}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-4 border-t" style={{ borderTopColor: "#e2e8f0" }}>
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">Local/Setor da Avaliação</strong><p className="font-semibold text-lg">{noiseData.local || 'Não informado'}</p></div>
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">Data da Emissão</strong><p className="font-semibold text-lg">{new Date().toLocaleDateString('pt-BR')}</p></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 style={{ borderBottomColor: "#e2e8f0", color: "#4f46e5" }} className="text-xl font-bold border-b-2 pb-2 mb-4">Parecer Técnico Detalhado</h3>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-left">
              <div style={{ color: "#1e293b", fontSize: "14px", lineHeight: "1.6", textAlign: "left" }} 
                   dangerouslySetInnerHTML={{ __html: lastBotMessage ? markdownToHtml(lastBotMessage.text) : "<p>Nenhuma avaliação gerada ainda.</p>" }} />
            </div>
          </div>

          <div className="html2pdf__page-break"></div>
          <div className="mt-24 pt-8 flex justify-between px-10" style={{ pageBreakBefore: "always" }}>
            <div className="text-center w-[40%]">
              <div style={{ borderTopColor: "#94a3b8", color: "#1e293b" }} className="border-t-2 pt-2 font-bold">Responsável Técnico SST</div>
              <div style={{ color: "#64748b" }} className="text-sm mt-1">Assinatura Profissional</div>
            </div>
            <div className="text-center w-[40%]">
              <div style={{ borderTopColor: "#94a3b8", color: "#1e293b" }} className="border-t-2 pt-2 font-bold">Sistema Mentorhub</div>
              <div style={{ color: "#64748b" }} className="text-sm mt-1">Emissão Digital</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setReport(null);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract base64 data (remove data:image/...;base64, prefix)
      setImageBase64(result.split(',')[1]);
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
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages: [
            {
              role: "system",
              content: `Você é um Engenheiro de Segurança do Trabalho especialista em Ergonomia Ocupacional (NR 17 - Portaria MTP nº 423/2021 e ABNT NBR 17485).
Analise a imagem do posto de trabalho fornecida e gere um RELATÓRIO DE INSPEÇÃO ERGONÔMICA estruturado e profissional.

REGRAS:
- PROIBIDO LATEX. Use apenas texto simples e Markdown.
- Seja objetivo, técnico e fundamentado na NR 17.
- Se houver contexto adicional do inspetor, leve em conta.
- Use a Matriz de Risco 4x4 (Probabilidade x Severidade).

ESTRUTURA OBRIGATÓRIA DO RELATÓRIO:

### 1. Diagnóstico Visual
Descreva objetivamente o que foi observado na imagem: postura do trabalhador, posicionamento de equipamentos, mobiliário, iluminação, organização do posto.

### 2. Enquadramento Normativo (NR 17)
Liste os itens da NR 17 violados ou em risco, com a redação exata do item legal e justificativa baseada na imagem.

### 3. Classificação de Risco (Matriz 4x4)
**Probabilidade:** [1-4] — Justificativa
**Severidade:** [1-4] — Justificativa
**Nível de Risco:** [Baixo/Médio/Alto/Crítico] — Cor: [Verde/Amarelo/Laranja/Vermelho]

### 4. Plano de Ação Imediato
Liste ações corretivas numeradas, com prazo sugerido (Imediato / 30 dias / 90 dias).

### 5. Proteção Especial (Maternidade/Comorbidades)
Descreva cuidados adicionais para gestantes ou trabalhadores com condições especiais de saúde relacionadas ao risco identificado.`
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
                  text: `Analise ergonomicamente este posto de trabalho.\n\nContexto adicional do inspetor: ${additionalContext || "Nenhum contexto adicional fornecido."}\n\nEmpresa: ${ergData.empresa || "Não informado"}\nCargo avaliado: ${ergData.cargo || "Não informado"}\nLocal/Setor: ${ergData.local || "Não informado"}`
                }
              ]
            }
          ],
          max_tokens: 2500,
          temperature: 0.2
        })
      });

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        setReport(data.choices[0].message.content);
      } else {
        throw new Error(data.error?.message || "Resposta inválida da API");
      }
    } catch (error: any) {
      console.error("Erro na análise:", error);
      setReport(`**Erro ao analisar imagem:** ${error.message}\n\nVerifique sua conexão e a chave da API.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const markdownToHtml = (text: string) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.*?)\*/g, '<i>$1</i>')
      .replace(/### (.*?)\n/g, '<h3 style="color: #0d9488; margin-top: 18px; margin-bottom: 6px; font-weight: bold; font-size: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">$1</h3>\n')
      .replace(/## (.*?)\n/g, '<h2 style="color: #0f766e; margin-top: 22px; margin-bottom: 8px; font-weight: bold; font-size: 1.2rem;">$1</h2>\n');

    const lines = html.split('\n');
    let inList = false;
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) {
        const item = `<li style="margin-bottom: 4px; text-align: left;">${trimmed.substring(2)}</li>`;
        if (!inList) { inList = true; return `<ul style="margin-left: 20px; margin-top: 5px; margin-bottom: 10px; list-style-type: disc;">${item}`; }
        return item;
      } else if (trimmed.match(/^\d+\.\s/)) {
        const item = `<li style="margin-bottom: 4px; text-align: left;">${trimmed.replace(/^\d+\.\s/, '')}</li>`;
        if (!inList) { inList = true; return `<ol style="margin-left: 20px; margin-top: 5px; margin-bottom: 10px; list-style-type: decimal;">${item}`; }
        return item;
      } else {
        let res = line;
        let prefix = inList ? '</ul>' : '';
        if (inList) inList = false;
        if (!res.trim()) return prefix + '<div style="height: 8px;"></div>';
        if (res.startsWith('<h')) return prefix + res;
        return prefix + `<div style="text-align: left !important; margin-bottom: 4px; width: 100%; display: block;">${res}</div>`;
      }
    });
    if (inList) processedLines.push('</ul>');
    return processedLines.join('');
  };

  const handleDownloadDOC = () => {
    if (!report) return;
    setIsDownloading(true);

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Relatório Ergonômico</title></head><body style='font-family: Arial, sans-serif; line-height: 1.6;'>";
    const footer = "</body></html>";
    const content = `
      <h1 style="text-align:center; color: #134e4a; font-family: sans-serif;">RELATÓRIO DE INSPEÇÃO ERGONÔMICA</h1>
      <h3 style="text-align:center; color: #475569; font-family: sans-serif;">Avaliação por Inteligência Artificial - NR 17</h3>
      <hr style="border: 1px solid #e2e8f0; margin-bottom: 20px;">
      <table style="width:100%; margin-bottom: 20px; font-family: sans-serif; font-size: 14px;">
        <tr>
          <td><strong>Empresa:</strong> ${ergData.empresa || 'Não informado'}</td>
          <td><strong>CNPJ:</strong> ${ergData.cnpj || 'Não informado'}</td>
        </tr>
        <tr>
          <td><strong>Local/Setor:</strong> ${ergData.local || 'Não informado'}</td>
          <td><strong>Cargo Avaliado:</strong> ${ergData.cargo || 'Não informado'}</td>
        </tr>
        <tr>
          <td colspan="2"><strong>Data da Inspeção:</strong> ${new Date().toLocaleDateString('pt-BR')}</td>
        </tr>
      </table>
      <h2 style="color: #0d9488; font-family: sans-serif;">LAUDO TÉCNICO</h2>
      <div style="margin-left: 10px; text-align: left; line-height: 1.7; font-family: sans-serif;">
        ${markdownToHtml(report)}
      </div>
      <br clear="all" style="page-break-before:always" />
      <table style="width:100%; text-align:center; margin-top: 50px; font-family: sans-serif;">
        <tr>
          <td>_____________________________________<br><b>Responsável Técnico SST</b><br><span style="font-size: 12px;">Assinatura</span></td>
          <td>_____________________________________<br><b>Sistema Mentorhub</b><br><span style="font-size: 12px;">Emissão Digital</span></td>
        </tr>
      </table>
    `;

    const blob = new Blob(['\ufeff', header + content + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Inspecao_Ergonomica_${(ergData.empresa || 'Empresa').replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsDownloading(false);
  };

  const handleDownloadPDF = async () => {
    const html2pdfLib = (window as any).html2pdf;
    if (!html2pdfLib) { alert("Biblioteca html2pdf não carregada. Atualize a página."); return; }
    setIsDownloading(true);
    try {
      const element = reportRef.current;
      if (!element) throw new Error("Elemento não encontrado");
      const opt = {
        margin: [10, 5, 10, 5],
        filename: `Inspecao_Ergonomica_${(ergData.empresa || 'Empresa').replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };
      await html2pdfLib().set(opt).from(element).save();
    } catch (e: any) {
      alert("Erro ao gerar PDF: " + e.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const riskLevel = report ? (() => {
    const lower = report.toLowerCase();
    if (lower.includes('crítico') || lower.includes('critico') || lower.includes('vermelho')) return { label: 'Crítico', color: 'bg-red-100 text-red-700 border-red-300' };
    if (lower.includes('alto') || lower.includes('laranja')) return { label: 'Alto', color: 'bg-orange-100 text-orange-700 border-orange-300' };
    if (lower.includes('médio') || lower.includes('medio') || lower.includes('amarelo')) return { label: 'Médio', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
    return { label: 'Baixo', color: 'bg-green-100 text-green-700 border-green-300' };
  })() : null;

  return (
    <div className="grid gap-6">
      <Card className="border-teal-200 bg-teal-50/30 overflow-hidden shadow-sm">
        <CardHeader className="bg-teal-100/20 border-b border-teal-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-teal-600 p-2.5 rounded-xl text-white shadow-sm">
              <ScanSearch className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl text-teal-800">Inspeção Ergonômica por IA</CardTitle>
              <CardDescription className="text-teal-700/70 mt-1">Analise fotos do posto de trabalho — NR 17 / Portaria MTP nº 423/2021</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Header fields */}
          <div className="bg-white border-b border-slate-100 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label htmlFor="erg-empresa" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Empresa</Label>
                <Input id="erg-empresa" placeholder="Nome da empresa..." value={ergData.empresa} onChange={e => setErgData({...ergData, empresa: e.target.value})} className="h-9 border-slate-200 bg-slate-50" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="erg-cnpj" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CNPJ</Label>
                <Input id="erg-cnpj" placeholder="00.000.000/0000-00" value={ergData.cnpj} onChange={e => setErgData({...ergData, cnpj: e.target.value})} className="h-9 border-slate-200 bg-slate-50" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="erg-local" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Local / Setor</Label>
                <Input id="erg-local" placeholder="Ex: Administrativo..." value={ergData.local} onChange={e => setErgData({...ergData, local: e.target.value})} className="h-9 border-slate-200 bg-slate-50" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="erg-cargo" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cargo Avaliado</Label>
                <Input id="erg-cargo" placeholder="Ex: Operador de Caixa..." value={ergData.cargo} onChange={e => setErgData({...ergData, cargo: e.target.value})} className="h-9 border-slate-200 bg-slate-50" />
              </div>
            </div>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-6">
            {/* Left: Image Upload */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <Camera className="w-4 h-4 text-teal-600" /> Foto do Posto de Trabalho
              </h3>

              {/* Drop area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-teal-300 rounded-2xl bg-teal-50/40 hover:bg-teal-50/80 transition-colors cursor-pointer min-h-[280px] flex items-center justify-center overflow-hidden"
              >
                {imagePreviewUrl ? (
                  <img src={imagePreviewUrl} alt="Prévia do posto" className="w-full h-full object-contain max-h-[320px] rounded-xl" />
                ) : (
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-8 h-8 text-teal-500" />
                    </div>
                    <p className="text-teal-700 font-medium">Clique para selecionar uma foto</p>
                    <p className="text-teal-500 text-sm mt-1">ou use a câmera do celular</p>
                    <p className="text-slate-400 text-xs mt-3">JPG, PNG, WEBP — até 20 MB</p>
                  </div>
                )}
              </div>

              {/* Hidden inputs */}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1 border-teal-300 text-teal-700 hover:bg-teal-50">
                  <ImageIcon className="w-4 h-4 mr-2" /> Galeria
                </Button>
                <Button variant="outline" onClick={() => cameraInputRef.current?.click()} className="flex-1 border-teal-300 text-teal-700 hover:bg-teal-50">
                  <Camera className="w-4 h-4 mr-2" /> Câmera
                </Button>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contexto Adicional (opcional)</Label>
                <Textarea
                  placeholder="Ex: Trabalhador relata dor no pescoço. Jornada de 8h sentado. Monitor sem regulagem..."
                  value={additionalContext}
                  onChange={e => setAdditionalContext(e.target.value)}
                  className="min-h-[80px] resize-none bg-slate-50 border-slate-200 focus-visible:ring-teal-500 text-sm"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!imageBase64 || isAnalyzing}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl"
              >
                {isAnalyzing ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analisando imagem com IA...</>
                ) : (
                  <><ScanSearch className="w-4 h-4 mr-2" /> Gerar Laudo Ergonômico</>
                )}
              </Button>
            </div>

            {/* Right: Report */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" /> Laudo Técnico
                </h3>
                {riskLevel && (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${riskLevel.color}`}>
                    ⚠ Risco {riskLevel.label}
                  </span>
                )}
              </div>

              <div className="border border-slate-200 rounded-2xl bg-white min-h-[460px] overflow-y-auto p-5 shadow-sm">
                {isAnalyzing && (
                  <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
                    <p className="text-slate-500 text-sm">A IA está analisando a imagem...</p>
                    <p className="text-slate-400 text-xs">Isso pode levar alguns segundos</p>
                  </div>
                )}
                {!isAnalyzing && !report && (
                  <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
                    <AlertTriangle className="w-12 h-12 text-slate-200" />
                    <p className="text-slate-400 font-medium">O laudo aparecerá aqui</p>
                    <p className="text-slate-300 text-sm">Selecione uma foto e clique em "Gerar Laudo"</p>
                  </div>
                )}
                {!isAnalyzing && report && (
                  <div className="prose prose-sm max-w-none text-slate-800" dangerouslySetInnerHTML={{ __html: markdownToHtml(report) }} />
                )}
              </div>

              {report && (
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={handleDownloadDOC} disabled={isDownloading} className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Download className="w-4 h-4" /> Baixar DOC
                  </Button>
                  <Button onClick={handleDownloadPDF} disabled={isDownloading} className="flex-1 gap-2 bg-teal-600 hover:bg-teal-700 text-white">
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Baixar PDF
                  </Button>
                  <Button onClick={() => { setImageFile(null); setImagePreviewUrl(null); setImageBase64(null); setReport(null); }} variant="outline" className="flex-1 border-slate-300 text-slate-600">
                    Nova Inspeção
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden PDF template */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <div ref={reportRef} style={{ backgroundColor: "#ffffff", color: "#1e293b" }} className="p-10 w-[800px] font-sans">
          <div style={{ borderBottom: "4px solid #0d9488" }} className="pb-6 mb-8 text-center">
            <h1 style={{ color: "#134e4a" }} className="text-3xl font-bold uppercase mb-2">Relatório de Inspeção Ergonômica</h1>
            <h2 style={{ color: "#475569" }} className="text-xl font-semibold">Avaliação por Inteligência Artificial — NR 17</h2>
          </div>

          <div style={{ backgroundColor: "#f0fdfa", borderColor: "#99f6e4" }} className="border p-6 rounded-lg mb-8">
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">Empresa Avaliada</strong><p className="font-semibold text-lg">{ergData.empresa || 'Não informado'}</p></div>
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">CNPJ</strong><p className="font-semibold text-lg">{ergData.cnpj || 'Não informado'}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-6 pt-4 border-t" style={{ borderTopColor: "#99f6e4" }}>
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">Local / Setor</strong><p className="font-semibold">{ergData.local || 'Não informado'}</p></div>
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">Cargo Avaliado</strong><p className="font-semibold">{ergData.cargo || 'Não informado'}</p></div>
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">Data da Inspeção</strong><p className="font-semibold">{new Date().toLocaleDateString('pt-BR')}</p></div>
            </div>
          </div>

          {imagePreviewUrl && (
            <div className="mb-8 text-center">
              <h3 style={{ color: "#0d9488" }} className="text-lg font-bold mb-3 text-left">Registro Fotográfico do Posto</h3>
              <img src={imagePreviewUrl} alt="Posto de trabalho inspecionado" style={{ maxWidth: "100%", maxHeight: "350px", border: "1px solid #e2e8f0", borderRadius: "8px", display: "block", margin: "0 auto" }} />
            </div>
          )}

          <div className="mb-8">
            <h3 style={{ borderBottomColor: "#e2e8f0", color: "#0d9488" }} className="text-xl font-bold border-b-2 pb-2 mb-4">Laudo Técnico Ergonômico</h3>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div style={{ color: "#1e293b", fontSize: "13px", lineHeight: "1.7", textAlign: "left" }}
                   dangerouslySetInnerHTML={{ __html: report ? markdownToHtml(report) : "<p>Nenhum laudo gerado.</p>" }} />
            </div>
          </div>

          <div className="html2pdf__page-break"></div>
          <div className="mt-24 pt-8 flex justify-between px-10" style={{ pageBreakBefore: "always" }}>
            <div className="text-center w-[40%]">
              <div style={{ borderTopColor: "#94a3b8", color: "#1e293b" }} className="border-t-2 pt-2 font-bold">Responsável Técnico SST</div>
              <div style={{ color: "#64748b" }} className="text-sm mt-1">Assinatura Profissional</div>
            </div>
            <div className="text-center w-[40%]">
              <div style={{ borderTopColor: "#94a3b8", color: "#1e293b" }} className="border-t-2 pt-2 font-bold">Sistema Mentorhub</div>
              <div style={{ color: "#64748b" }} className="text-sm mt-1">Emissão Digital</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
