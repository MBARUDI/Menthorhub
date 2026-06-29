
import React, { useState } from 'react';
import { Crown, Sparkles, Loader2, AlertCircle, ScrollText, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AnalysisResult, QuadrantItem, FiveQsData, IncomeItem, ExpenseItem, InvestmentItem, GoalItem, WorkItem, QuadrantType } from '../types';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

interface LifePlanProps {
  onGenerate: () => void;
  result: AnalysisResult;
  data: {
    userName: string;
    quadrantItems: QuadrantItem[];
    fiveQsData: FiveQsData;
    incomes: IncomeItem[];
    expenses: ExpenseItem[];
    investments: InvestmentItem[];
    goals: GoalItem[];
    works: WorkItem[];
    behavioralAnalysis: string;
  }
}

const LifePlan: React.FC<LifePlanProps> = ({ onGenerate, result, data }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Helper to remove markdown syntax for plain text PDF
  const stripMarkdown = (text: string) => {
    if (!text) return "";
    return text
      .replace(/#{1,6}\s?/g, '') // Headers
      .replace(/\*\*/g, '')      // Bold
      .replace(/\*/g, '')        // Italic
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Links
      .replace(/`{1,3}[^`]*`{1,3}/g, '') // Code
      .replace(/\n\s*\n/g, '\n\n'); // Multiple newlines
  };

  const generatePDF = () => {
    setIsGeneratingPdf(true);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;
    let finalY = margin;

    // --- COVER PAGE ---
    doc.setFillColor(67, 56, 202); // Indigo 700
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("ConsciousWallet", margin, 20);
    doc.setFontSize(12);
    doc.text("Relatório Financeiro & Plano Mestre de Vida", margin, 30);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, margin, 50);
    doc.text(`Usuário: ${data.userName || 'Não informado'}`, margin, 55);

    finalY = 65;

    // --- 1. MATRIZ DE DECISÃO ---
    doc.setFontSize(14);
    doc.setTextColor(67, 56, 202);
    doc.text("1. Diagrama de Ganhos Pessoais", margin, finalY);
    finalY += 8;

    const matrixData = [
      ['Motivadores', data.quadrantItems.filter(i => i.type === QuadrantType.MOTIVATORS).map(i => `• ${i.text}`).join('\n')],
      ['Sabotadores', data.quadrantItems.filter(i => i.type === QuadrantType.SABOTEURS).map(i => `• ${i.text}`).join('\n')],
      ['Ganhos (Consciente)', data.quadrantItems.filter(i => i.type === QuadrantType.GAINS).map(i => `• ${i.text}`).join('\n')],
      ['Perdas (Impulsivo)', data.quadrantItems.filter(i => i.type === QuadrantType.LOSSES).map(i => `• ${i.text}`).join('\n')],
    ];

    autoTable(doc, {
      startY: finalY,
      head: [['Categoria', 'Itens Mapeados']],
      body: matrixData,
      theme: 'grid',
      headStyles: { fillColor: [67, 56, 202] },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
    });
    
    // @ts-ignore
    finalY = doc.lastAutoTable.finalY + 15;

    // --- 2. 5 Qs DO CONSUMO ---
    doc.setFontSize(14);
    doc.setTextColor(67, 56, 202);
    doc.text("2. Reflexão: Os 5 Qs do Consumo", margin, finalY);
    finalY += 8;

    const qsData = [
      ['O que comprar?', data.fiveQsData.what],
      ['Por que comprar?', data.fiveQsData.why],
      ['Como comprar?', data.fiveQsData.how],
      ['De quem comprar?', data.fiveQsData.who],
      ['Como usar/descartar?', data.fiveQsData.usage],
    ];

    autoTable(doc, {
      startY: finalY,
      body: qsData,
      theme: 'striped',
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
    });

    // @ts-ignore
    finalY = doc.lastAutoTable.finalY + 15;

    // --- 3. ANÁLISE COMPORTAMENTAL AI ---
    if (data.behavioralAnalysis) {
        if (finalY > pageHeight - 60) { doc.addPage(); finalY = 20; }
        doc.setFontSize(14);
        doc.setTextColor(67, 56, 202);
        doc.text("3. Análise Comportamental (IA)", margin, finalY);
        finalY += 8;

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        const cleanAnalysis = stripMarkdown(data.behavioralAnalysis);
        const splitText = doc.splitTextToSize(cleanAnalysis, pageWidth - (margin * 2));
        
        // Paginação manual para o texto da análise
        const lineHeight = 5;
        splitText.forEach((line: string) => {
            if (finalY + lineHeight > pageHeight - margin) {
                doc.addPage();
                finalY = margin + 10;
            }
            doc.text(line, margin, finalY);
            finalY += lineHeight;
        });

        finalY += 10;
    }

    // --- 4. DASHBOARD FINANCEIRO ---
    doc.addPage();
    finalY = 20;
    doc.setFontSize(14);
    doc.setTextColor(67, 56, 202);
    doc.text("4. Raio-X Financeiro", margin, finalY);
    finalY += 8;

    // Incomes
    doc.setFontSize(11);
    doc.setTextColor(22, 163, 74); // Green
    doc.text("Renda Líquida", margin, finalY);
    finalY += 5;
    autoTable(doc, {
      startY: finalY,
      head: [['Fonte', 'Periodicidade', 'Valor']],
      body: data.incomes.map(i => [i.source, i.periodicity, `R$ ${i.amount.toFixed(2)}`]),
      theme: 'plain',
      headStyles: { fillColor: [220, 252, 231], textColor: 0 },
      foot: [['TOTAL', '', `R$ ${data.incomes.reduce((a, b) => a + b.amount, 0).toFixed(2)}`]],
      footStyles: { fontStyle: 'bold' }
    });
    // @ts-ignore
    finalY = doc.lastAutoTable.finalY + 10;

    // Expenses
    doc.setFontSize(11);
    doc.setTextColor(220, 38, 38); // Red
    doc.text("Gastos Mensais", margin, finalY);
    finalY += 5;
    autoTable(doc, {
      startY: finalY,
      head: [['Descrição', 'Valor']],
      body: data.expenses.map(e => [e.description, `R$ ${e.amount.toFixed(2)}`]),
      theme: 'plain',
      headStyles: { fillColor: [254, 226, 226], textColor: 0 },
      foot: [['TOTAL', `R$ ${data.expenses.reduce((a, b) => a + b.amount, 0).toFixed(2)}`]],
      footStyles: { fontStyle: 'bold' }
    });
    // @ts-ignore
    finalY = doc.lastAutoTable.finalY + 10;

    // Investments
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text("Investimentos", margin, finalY);
    finalY += 5;
    autoTable(doc, {
      startY: finalY,
      head: [['Tipo', 'Aporte Mensal', 'Acumulado']],
      body: data.investments.map(inv => [inv.type, `R$ ${inv.monthlyApplication.toFixed(2)}`, `R$ ${inv.totalValue.toFixed(2)}`]),
      theme: 'plain',
      headStyles: { fillColor: [224, 231, 255], textColor: 0 },
      foot: [['TOTAL', `R$ ${data.investments.reduce((a, b) => a + b.monthlyApplication, 0).toFixed(2)}`, `R$ ${data.investments.reduce((a, b) => a + b.totalValue, 0).toFixed(2)}`]],
      footStyles: { fontStyle: 'bold' }
    });

     // @ts-ignore
    finalY = doc.lastAutoTable.finalY + 15;

    // --- 5. SONHOS E METAS ---
    if (finalY > pageHeight - 60) { doc.addPage(); finalY = 20; }
    doc.setFontSize(14);
    doc.setTextColor(67, 56, 202);
    doc.text("5. Mural dos Sonhos", margin, finalY);
    finalY += 8;

    const goalsBody = data.goals.map(g => [
      g.description, 
      g.timeframe, 
      `R$ ${g.value.toFixed(2)}`,
      g.completed ? 'Sim' : 'Não'
    ]);

    autoTable(doc, {
      startY: finalY,
      head: [['Sonho', 'Prazo', 'Custo Estimado', 'Realizado']],
      body: goalsBody,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11] }, // Amber
      foot: [['CUSTO TOTAL DE VIDA', '', `R$ ${data.goals.reduce((a, b) => a + b.value, 0).toFixed(2)}`, '']],
    });
    
    // @ts-ignore
    finalY = doc.lastAutoTable.finalY + 15;

    // --- 6. PORTFÓLIO PROFISSIONAL ---
    doc.setFontSize(14);
    doc.setTextColor(67, 56, 202);
    doc.text("6. Portfólio Profissional", margin, finalY);
    finalY += 8;

    autoTable(doc, {
      startY: finalY,
      head: [['Área de Atuação', 'Renda Atual']],
      body: data.works.map(w => [w.area, `R$ ${w.currentIncome.toFixed(2)}`]),
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }, // Blue
    });

    // --- 7. PLANO MESTRE DE VIDA ---
    if (result.markdown) {
        doc.addPage();
        finalY = 20;
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0); // Black
        doc.text("7. PLANO MESTRE DE VIDA (IA)", margin, finalY);
        finalY += 10;
        doc.setLineWidth(0.5);
        doc.line(margin, finalY, pageWidth - margin, finalY);
        finalY += 10;

        doc.setFontSize(11);
        doc.setTextColor(40, 40, 40);
        
        const cleanPlan = stripMarkdown(result.markdown);
        const splitPlan = doc.splitTextToSize(cleanPlan, pageWidth - (margin * 2));
        
        // Paginação manual para o texto longo do plano
        const lineHeight = 6;
        
        splitPlan.forEach((line: string) => {
            // Verifica se a próxima linha ultrapassa o limite da página
            if (finalY + lineHeight > pageHeight - margin) {
                doc.addPage();
                finalY = margin + 10; // Reinicia Y na nova página
            }
            doc.text(line, margin, finalY);
            finalY += lineHeight;
        });
    }

    doc.save("ConsciousWallet_PlanoMestre.pdf");
    setIsGeneratingPdf(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-white shadow-lg shadow-orange-200">
            <Crown size={40} />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Plano Mestre de Vida</h2>
        <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
          A inteligência artificial irá conectar seus dados financeiros, psicológicos e profissionais para criar um roteiro único para seus sonhos.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        {!result.loading && (
          <button
            onClick={onGenerate}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-slate-900 font-lg rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 hover:bg-slate-800 hover:scale-105 shadow-xl"
          >
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-full opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
            <span className="relative flex items-center gap-3">
               <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
               {result.markdown ? 'Regerar Plano Mestre' : 'Gerar Metodologia de Sucesso'}
            </span>
          </button>
        )}

        {result.markdown && !result.loading && (
             <button
             onClick={generatePDF}
             disabled={isGeneratingPdf}
             className="group inline-flex items-center justify-center px-8 py-4 font-bold text-slate-900 bg-white border-2 border-slate-200 rounded-full hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-700 transition-all duration-200 shadow-md"
           >
              {isGeneratingPdf ? (
                 <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                 <Download className="w-5 h-5 mr-2 text-indigo-600" />
              )}
             {isGeneratingPdf ? 'Gerando PDF...' : 'Baixar Relatório Completo'}
           </button>
        )}
      </div>

      {result.loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-indigo-800 font-medium animate-pulse">
            Consultando especialistas... Cruzando dados... Criando estratégias...
          </p>
        </div>
      )}

      {result.error && (
        <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-3">
          <AlertCircle />
          <span>{result.error}</span>
        </div>
      )}

      {result.markdown && !result.loading && (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="bg-slate-900 p-6 flex items-center gap-3 border-b border-slate-800">
            <ScrollText className="text-yellow-400" />
            <h3 className="text-xl font-bold text-white">Seu Plano Personalizado</h3>
          </div>
          <div className="p-8 prose prose-indigo max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-indigo-700">
            <ReactMarkdown>{result.markdown}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default LifePlan;
