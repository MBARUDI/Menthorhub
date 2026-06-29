import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ClipboardList, Send, Loader2, Download, CheckSquare, XCircle, MinusCircle } from "lucide-react";

const CHECKLIST_TYPES = [
  { id: "loja", label: "Loja / Varejo", emoji: "🏪" },
  { id: "escritorio", label: "Escritório", emoji: "🖥️" },
  { id: "industria", label: "Indústria / Fábrica", emoji: "🏭" },
  { id: "construcao", label: "Construção Civil", emoji: "🏗️" },
  { id: "saude", label: "Saúde / Clínica", emoji: "🏥" },
  { id: "equipamento", label: "Equipamento / Máquina", emoji: "⚙️" },
  { id: "eletrico", label: "Instalação Elétrica (NR-10)", emoji: "⚡" },
  { id: "incendio", label: "Prevenção de Incêndio (NR-23)", emoji: "🔥" },
  { id: "ergonomia_wr", label: "Ergonomia Posto de Trabalho (NR-17)", emoji: "🪑" },
  { id: "epi", label: "EPI / EPC", emoji: "🦺" },
  { id: "personalizado", label: "Personalizado (descrever)", emoji: "✏️" },
];

const SYSTEM_PROMPT = `Você é um Engenheiro de Segurança do Trabalho especialista em auditorias e checklists ocupacionais.
Gere um RELATÓRIO TÉCNICO DE AUDITORIA completo em Markdown, seguindo ESTRITAMENTE esta estrutura:

### 1. Introdução e Objetivo
(Contextualização do setor, riscos específicos, objetivo da auditoria)

### 2. Fundamentação Legal e Normativa
(Liste CLT, NRs aplicáveis, normas ABNT, convenções sindicais relevantes — com artigos e itens específicos)

### 3. Checklist de Auditoria

**Empresa/Unidade:** [usar dados fornecidos]
**Responsável pela Inspeção:** ___________________________
**Data:** [data atual]

| Nº | Componente / Item de Verificação | C | NC | N/A | Observações / Parâmetros Técnicos |
|---|---|---|---|---|---|
| 01 | [item] | | | | [parâmetro] |
(Mínimo 15 itens técnicos e detalhados)

*Legenda: C = Conforme | NC = Não Conforme | N/A = Não Se Aplica*

### 4. Parecer Técnico Final
[ ] INSTALAÇÃO/EQUIPAMENTO LIBERADO
[ ] LIBERADO COM PLANO DE AÇÃO
[ ] INTERDITADO

(Justificativa técnica do parecer)

### 5. Exemplos Práticos e Tomadas de Decisão
(2-3 casos práticos do setor com conduta técnica recomendada)

### 6. Glossário Técnico
(8-10 termos técnicos relevantes com definições)

REGRAS: PROIBIDO LATEX. Use apenas texto simples e Markdown. Seja objetivo e use linguagem técnica profissional.`;

export function ChecklistSSTModule() {
  const [messages, setMessages] = useState<{ role: "bot" | "user"; text: string }[]>([
    { role: "bot", text: "Olá! Sou o assistente de **Checklist SST com IA**.\n\nSelecione o tipo de checklist desejado (loja, escritório, indústria, equipamento etc.) e informe o contexto da auditoria. Vou gerar um relatório técnico completo com fundamentação legal, checklist detalhado e parecer final.\n\nPreencha os dados da empresa acima e descreva o que deseja auditar!" }
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({ empresa: "", cnpj: "", local: "", responsavel: "" });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsGenerating(true);
    try {
      const context = selectedType ? `Tipo de checklist selecionado: ${CHECKLIST_TYPES.find(t => t.id === selectedType)?.label || selectedType}.\n` : "";
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text })),
            { role: "user", content: `${context}Empresa: ${formData.empresa || "não informado"}. Local: ${formData.local || "não informado"}. Responsável: ${formData.responsavel || "não informado"}.\n\n${userMsg}` }
          ],
          max_tokens: 3500,
          temperature: 0.2
        })
      });
      const data = await resp.json();
      if (data.error) {
        throw new Error(`API: ${data.error.message || JSON.stringify(data.error)}`);
      }
      const reply = data.choices?.[0]?.message?.content;
      if (!reply) throw new Error(`Resposta inesperada da API: ${JSON.stringify(data)}`);
      setMessages(prev => [...prev, { role: "bot", text: reply }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "bot", text: `**Erro:** ${e.message}\n\nVerifique a chave VITE_OPENROUTER_API_KEY no arquivo .env e sua conexão.` }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const mdToHtml = (text: string) => {
    let h = text
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
      .replace(/\*(.*?)\*/g, "<i>$1</i>")
      .replace(/### (.*?)\n/g, '<h3 style="color:#5b21b6;margin-top:16px;margin-bottom:6px;font-weight:bold;border-bottom:1px solid #e2e8f0;padding-bottom:3px;">$1</h3>\n')
      .replace(/## (.*?)\n/g, '<h2 style="color:#4c1d95;margin-top:20px;margin-bottom:8px;font-weight:bold;">$1</h2>\n');

    // Table handling
    const lines = h.split("\n");
    let inTable = false;
    let inList = false;
    const out: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        if (!inTable) { inTable = true; out.push('<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px;margin:10px 0">'); }
        if (trimmed.replace(/\|/g, "").replace(/-/g, "").trim() === "") continue;
        const cells = trimmed.split("|").slice(1, -1);
        const isHeader = i === lines.findIndex(l => l.trim().startsWith("|") && l.trim().endsWith("|"));
        const tag = isHeader ? "th" : "td";
        const style = isHeader
          ? 'style="background:#5b21b6;color:#fff;padding:8px;text-align:left;font-size:12px"'
          : 'style="padding:7px 8px;border-bottom:1px solid #e2e8f0;vertical-align:top"';
        const rowStyle = isHeader ? "" : 'style="background:#faf5ff"';
        out.push(`<tr ${rowStyle}>${cells.map(c => `<${tag} ${style}>${c.trim()}</${tag}>`).join("")}</tr>`);
        continue;
      } else if (inTable) {
        inTable = false;
        out.push("</table></div>");
      }
      if (trimmed.startsWith("- ")) {
        const item = `<li style="margin-bottom:3px;text-align:left">${trimmed.substring(2)}</li>`;
        if (!inList) { inList = true; out.push(`<ul style="margin-left:20px;margin-top:4px;margin-bottom:8px;list-style:disc">${item}`); }
        else out.push(item);
        continue;
      } else if (inList) { inList = false; out.push("</ul>"); }
      if (!trimmed) { out.push('<div style="height:8px"></div>'); continue; }
      if (trimmed.startsWith("<h")) { out.push(line); continue; }
      out.push(`<div style="text-align:left;margin-bottom:3px;display:block">${line}</div>`);
    }
    if (inTable) out.push("</table></div>");
    if (inList) out.push("</ul>");
    return out.join("");
  };

  const lastBot = messages.filter(m => m.role === "bot").pop();

  const handleDOC = () => {
    if (!lastBot) return;
    setIsDownloading(true);
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'></head><body style='font-family:Arial,sans-serif;line-height:1.6'>";
    const footer = "</body></html>";
    const body = `
      <h1 style="text-align:center;color:#1e293b">RELATÓRIO TÉCNICO DE AUDITORIA SST</h1>
      <h3 style="text-align:center;color:#475569">Checklist de Segurança do Trabalho com IA — Mentorhub</h3>
      <hr>
      <table style="width:100%;font-size:14px;margin-bottom:20px">
        <tr><td><b>Empresa:</b> ${formData.empresa || "—"}</td><td><b>CNPJ:</b> ${formData.cnpj || "—"}</td></tr>
        <tr><td><b>Local/Setor:</b> ${formData.local || "—"}</td><td><b>Responsável:</b> ${formData.responsavel || "—"}</td></tr>
        <tr><td colspan="2"><b>Data:</b> ${new Date().toLocaleDateString("pt-BR")}</td></tr>
      </table>
      <div style="text-align:left;line-height:1.7">${mdToHtml(lastBot.text)}</div>
      <br style="page-break-before:always"/>
      <table style="width:100%;text-align:center;margin-top:50px">
        <tr>
          <td>_______________________<br><b>Eng./Técnico de Segurança</b></td>
          <td>_______________________<br><b>Responsável da Unidade</b></td>
          <td>_______________________<br><b>Sistema Mentorhub</b></td>
        </tr>
      </table>`;
    const blob = new Blob(["\ufeff", header + body + footer], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `Checklist_SST_${(formData.empresa || "Empresa").replace(/\s+/g, "_")}.doc`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    setIsDownloading(false);
  };

  const handlePDF = async () => {
    const lib = (window as any).html2pdf;
    if (!lib) { alert("html2pdf não carregado. Atualize a página."); return; }
    setIsDownloading(true);
    try {
      await lib().set({
        margin: [10, 5, 10, 5],
        filename: `Checklist_SST_${(formData.empresa || "Empresa").replace(/\s+/g, "_")}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] }
      }).from(reportRef.current!).save();
    } catch (e: any) { alert("Erro: " + e.message); }
    finally { setIsDownloading(false); }
  };

  return (
    <div className="grid gap-6">
      <Card className="border-violet-200 bg-violet-50/30 overflow-hidden shadow-sm">
        <CardHeader className="bg-violet-100/20 border-b border-violet-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-violet-600 p-2.5 rounded-xl text-white shadow-sm"><ClipboardList className="w-6 h-6" /></div>
            <div>
              <CardTitle className="text-xl text-violet-800">Checklist SST com IA</CardTitle>
              <CardDescription className="text-violet-700/70 mt-1">Geração de checklists técnicos para equipamentos, instalações e ergonomia</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Fields */}
          <div className="bg-white border-b p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[["ck-emp","Empresa","empresa","Ex: Lojas Exemplo..."],["ck-cnpj","CNPJ","cnpj","00.000.000/0001-00"],["ck-loc","Local/Setor","local","Ex: Loja Centro..."],["ck-resp","Responsável","responsavel","Nome do inspetor..."]].map(([id, label, key, ph]) => (
                <div key={id} className="space-y-1">
                  <Label htmlFor={id} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</Label>
                  <Input id={id} placeholder={ph} value={(formData as any)[key]} onChange={e => setFormData({...formData, [key]: e.target.value})} className="h-9 border-slate-200 bg-slate-50" />
                </div>
              ))}
            </div>
            {/* Type selector */}
            <div>
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Tipo de Checklist</Label>
              <div className="flex flex-wrap gap-2">
                {CHECKLIST_TYPES.map(t => (
                  <button key={t.id} onClick={() => setSelectedType(t.id === selectedType ? "" : t.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${selectedType === t.id ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"}`}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="flex flex-col h-[520px]">
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
              <div className="max-w-4xl mx-auto space-y-5">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[88%] rounded-2xl p-5 shadow-sm ${msg.role === "user" ? "bg-violet-600 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"}`}>
                      {msg.role === "bot"
                        ? <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: mdToHtml(msg.text) }} />
                        : <div className="whitespace-pre-wrap text-sm">{msg.text}</div>}
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                      <span className="text-sm text-slate-500">Gerando checklist técnico...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2 mb-3">
                <Textarea
                  placeholder={selectedType ? `Descreva o contexto da auditoria de ${CHECKLIST_TYPES.find(t=>t.id===selectedType)?.label}...` : "Selecione um tipo acima e descreva o que deseja auditar..."}
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  className="min-h-[54px] resize-none bg-slate-50 focus-visible:ring-violet-500"
                />
                <Button onClick={handleSend} disabled={isGenerating || !input.trim()} className="h-auto px-6 bg-violet-600 hover:bg-violet-700 text-white">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5 text-green-500" /> Conforme</span>
                  <span className="flex items-center gap-1"><XCircle className="w-3.5 h-3.5 text-red-500" /> Não Conforme</span>
                  <span className="flex items-center gap-1"><MinusCircle className="w-3.5 h-3.5 text-slate-400" /> Não Se Aplica</span>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setMessages([messages[0]])} variant="outline" size="sm" className="border-slate-300 text-slate-600">Novo</Button>
                  <Button onClick={handleDOC} disabled={isDownloading || messages.length < 2} size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                    <Download className="w-3.5 h-3.5" /> DOC
                  </Button>
                  <Button onClick={handlePDF} disabled={isDownloading || messages.length < 2} size="sm" className="gap-1.5 bg-violet-600 hover:bg-violet-700 text-white">
                    {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden PDF template */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <div ref={reportRef} style={{ backgroundColor: "#fff", color: "#1e293b" }} className="p-10 w-[800px] font-sans">
          <div style={{ borderBottom: "4px solid #7c3aed" }} className="pb-6 mb-8 text-center">
            <h1 style={{ color: "#4c1d95" }} className="text-3xl font-bold uppercase mb-2">Relatório Técnico de Auditoria SST</h1>
            <h2 style={{ color: "#475569" }} className="text-xl font-semibold">Checklist de Segurança do Trabalho com IA</h2>
          </div>
          <div style={{ backgroundColor: "#faf5ff", borderColor: "#ddd6fe" }} className="border p-6 rounded-lg mb-8">
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">Empresa Auditada</strong><p className="font-semibold text-lg">{formData.empresa || "—"}</p></div>
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">CNPJ</strong><p className="font-semibold text-lg">{formData.cnpj || "—"}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-6 pt-4 border-t" style={{ borderTopColor: "#ddd6fe" }}>
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">Local / Setor</strong><p className="font-semibold">{formData.local || "—"}</p></div>
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">Responsável</strong><p className="font-semibold">{formData.responsavel || "—"}</p></div>
              <div><strong style={{ color: "#64748b" }} className="uppercase text-xs block mb-1">Data da Auditoria</strong><p className="font-semibold">{new Date().toLocaleDateString("pt-BR")}</p></div>
            </div>
          </div>
          <div className="mb-8">
            <h3 style={{ color: "#7c3aed", borderBottomColor: "#e2e8f0" }} className="text-xl font-bold border-b-2 pb-2 mb-4">Laudo Técnico</h3>
            <div style={{ color: "#1e293b", fontSize: "13px", lineHeight: "1.7", textAlign: "left" }}
              dangerouslySetInnerHTML={{ __html: lastBot ? mdToHtml(lastBot.text) : "<p>Nenhum laudo gerado.</p>" }} />
          </div>
          <div className="html2pdf__page-break"></div>
          <div className="mt-24 pt-8 flex justify-between px-10" style={{ pageBreakBefore: "always" }}>
            <div className="text-center w-[30%]"><div style={{ borderTopColor: "#94a3b8" }} className="border-t-2 pt-2 font-bold">Eng./Técnico SST</div></div>
            <div className="text-center w-[30%]"><div style={{ borderTopColor: "#94a3b8" }} className="border-t-2 pt-2 font-bold">Responsável da Unidade</div></div>
            <div className="text-center w-[30%]"><div style={{ borderTopColor: "#94a3b8" }} className="border-t-2 pt-2 font-bold">Sistema Mentorhub</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
