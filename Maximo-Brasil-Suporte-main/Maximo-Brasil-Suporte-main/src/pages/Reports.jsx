import { motion } from 'framer-motion';
import { BarChart, DollarSign, Clock, CheckCircle, TrendingUp, Layers } from 'lucide-react';

const Reports = ({ tickets }) => {
  // Cálculos de Métricas Reais
  const resolvedTickets = tickets.filter(t => t.status === 'Concluído');
  const totalResolved = resolvedTickets.length;
  
  // Cálculo de Custo Estimado baseado na Prioridade (Simulação)
  // Cálculo de Custo Real e Estimado
  const totalCost = tickets.reduce((acc, ticket) => {
    // Se tiver valor_total (custo real), usa ele. Caso contrário, usa a estimativa por prioridade.
    const realCost = parseFloat(ticket.valor_total) || 0;
    if (realCost > 0) return acc + realCost;
    
    const priorityCosts = { 'Baixa': 50, 'Média': 150, 'Alta': 300, 'Crítica': 600 };
    return acc + (priorityCosts[ticket.priority] || 100);
  }, 0);

  // Cálculo de Itens Executados (simulado baseado nos chamados concluídos que têm custo)
  const itemsExecuted = tickets.filter(t => (parseFloat(t.valor_total) || 0) > 0).length;

  // Distribuição por Categoria
  const categoriesCount = tickets.reduce((acc, ticket) => {
    acc[ticket.category] = (acc[ticket.category] || 0) + 1;
    return acc;
  }, {});
  
  const categoryEntries = Object.entries(categoriesCount).sort((a, b) => b[1] - a[1]);
  const maxCatCount = Math.max(...Object.values(categoriesCount), 1);

  // Tempo Médio de Resolução
  let totalHours = 0;
  resolvedTickets.forEach(t => {
    if (t.closed_at) {
      const diffMs = new Date(t.closed_at) - new Date(t.created_at);
      totalHours += diffMs / (1000 * 60 * 60); // Converte para horas
    }
  });
  const avgResolutionTime = totalResolved > 0 ? (totalHours / totalResolved).toFixed(1) + 'h' : 'N/A';

  return (
    <div className="p-8 flex-1">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-navy-900 tracking-tight mb-2">Relatórios e Métricas</h2>
        <p className="text-slate-500 font-medium">Análise em tempo real do desempenho e custos operacionais.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Layers size={20} className="text-blue-500" /> Chamados por Área / Categoria
            </h3>
          </div>
          
          <div className="space-y-6">
            {categoryEntries.length > 0 ? categoryEntries.map(([category, count], index) => {
              const percentage = (count / maxCatCount) * 100;
              return (
                <div key={index} className="relative">
                  <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                    <span>{category}</span>
                    <span>{count} serviço(s)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="h-full bg-blue-500 rounded-full"
                    ></motion.div>
                  </div>
                </div>
              );
            }) : (
              <p className="text-center text-slate-400 font-medium py-10">Nenhum chamado registrado ainda.</p>
            )}
          </div>
        </div>

        <div className="bg-navy-900 p-8 rounded-3xl text-white flex flex-col justify-between overflow-hidden relative shadow-xl shadow-navy-900/20">
          <div className="relative z-10">
            <h3 className="font-bold mb-1">Custo Total Acumulado</h3>
            <p className="text-slate-400 text-sm">Considerando custos reais e estimativas</p>
          </div>
          
          <div className="relative z-10 space-y-4 my-8">
            <p className="text-4xl font-black text-emerald-400">
              R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="relative z-10 mt-auto border-t border-navy-800 pt-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Total de Chamados</span>
              <span className="font-bold text-white">{tickets.length}</span>
            </div>
          </div>

          <div className="absolute -right-4 -bottom-4 opacity-10">
            <DollarSign size={160} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-blue-50 text-blue-600">
            <Clock size={20} />
          </div>
          <p className="text-2xl font-black text-slate-800">{avgResolutionTime}</p>
          <p className="text-xs font-bold text-slate-500 uppercase mt-1">Tempo Médio de Resolução</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-emerald-50 text-emerald-600">
            <CheckCircle size={20} />
          </div>
          <p className="text-2xl font-black text-slate-800">{totalResolved}</p>
          <p className="text-xs font-bold text-slate-500 uppercase mt-1">Chamados Concluídos</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-purple-50 text-purple-600">
            <BarChart size={20} />
          </div>
          <p className="text-2xl font-black text-slate-800">{itemsExecuted}</p>
          <p className="text-xs font-bold text-slate-500 uppercase mt-1">Serviços com Materiais</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-amber-50 text-amber-600">
            <TrendingUp size={20} />
          </div>
          <p className="text-2xl font-black text-slate-800">
            {tickets.length > 0 ? Math.round((totalResolved / tickets.length) * 100) : 0}%
          </p>
          <p className="text-xs font-bold text-slate-500 uppercase mt-1">Taxa de Resolução</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
