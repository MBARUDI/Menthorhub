import { useState, useEffect } from 'react';
import { AlertCircle, Trash2, X, Package } from 'lucide-react';
import ModalMateriaisServicos from './ModalMateriaisServicos';

const TicketTable = ({ categoryFilter, searchQuery = '', tickets = [], onUpdateStatus, onDelete, user }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModalMateriais, setShowModalMateriais] = useState(false);
  const [ticketParaFinalizar, setTicketParaFinalizar] = useState(null);
  const [materiais, setMateriais] = useState([]);
  const [ativaTab, setAtivaTab] = useState('geral');

  useEffect(() => {
    const carregarMateriais = async () => {
      if (selectedTicket && selectedTicket.status === 'Concluído' && ativaTab === 'gastos') {
        try {
          const res = await fetch(`/api/tickets/${encodeURIComponent(selectedTicket.id)}/materiais`);
          const data = await res.json();
          setMateriais(data);
        } catch (err) {
          console.error('Erro ao buscar materiais:', err);
        }
      }
    };
    
    carregarMateriais();
  }, [selectedTicket, ativaTab]);

  // Resetar a aba ao mudar o ticket ou fechar
  useEffect(() => {
    setAtivaTab('geral');
    if (!selectedTicket) setMateriais([]);
  }, [selectedTicket]);

  const formatoMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const filteredTickets = tickets.filter(t => {
    const matchCat = categoryFilter === 'all' || t.catId === categoryFilter;
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchSearch = !searchQuery || 
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  const handleStatusChange = (ticketId, newStatus) => {
    if (newStatus === 'Concluído') {
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket && ticket.status !== 'Concluído') {
        setTicketParaFinalizar({ id: ticketId, status: newStatus });
        setShowModalMateriais(true);
        return;
      }
    }
    if (onUpdateStatus) {
      onUpdateStatus(ticketId, newStatus);
    }
  };

  const handleConfirmarMateriais = (dados) => {
    if (onUpdateStatus) {
      onUpdateStatus(dados.ticketId, 'Concluído', dados);
    }
    setShowModalMateriais(false);
    setTicketParaFinalizar(null);
  };

  const handleDelete = (ticketId) => {
    if (window.confirm('Tem certeza que deseja excluir este chamado?')) {
      if (onDelete) onDelete(ticketId);
    }
  };

  const priorityStyles = {
    'Crítica': 'text-red-700 bg-red-100 border-red-200',
    'Alta': 'text-orange-700 bg-orange-100 border-orange-200',
    'Média': 'text-amber-700 bg-amber-100 border-amber-200',
    'Baixa': 'text-blue-700 bg-blue-100 border-blue-200',
  };

  const statusStyles = {
    'Pendente': 'bg-slate-100 text-slate-600',
    'Em Progresso': 'bg-blue-100 text-blue-600',
    'Validando': 'bg-purple-100 text-purple-600',
    'Concluído': 'bg-emerald-100 text-emerald-600',
  };

  const categoryColors = {
    'Informática/TI': 'bg-blue-600',
    'Elétrica': 'bg-amber-500',
    'Predial/Civil': 'bg-orange-500',
    'Segurança': 'bg-indigo-600',
    'Telecom': 'bg-purple-600',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <h2 className="text-xl font-bold text-slate-800">Chamados Recentes</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase">Filtrar Status:</span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          >
            <option value="all">Todos os Status</option>
            <option value="Pendente">Pendente</option>
            <option value="Em Progresso">Em Progresso</option>
            <option value="Validando">Validando</option>
            <option value="Concluído">Concluído</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID/Ticket</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assunto</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Prioridade</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTickets.map((ticket, index) => (
              <tr key={index} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4 text-sm font-bold text-navy-700">{ticket.id}</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-slate-800 line-clamp-1">{ticket.subject}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${categoryColors[ticket.category]}`}></span>
                    <span className="text-sm font-medium text-slate-600">{ticket.category}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${priorityStyles[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-md outline-none transition-all cursor-pointer ${statusStyles[ticket.status]}`}
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Progresso">Em Progresso</option>
                    <option value="Validando">Validando</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                  <button 
                    onClick={() => setSelectedTicket(ticket)}
                    className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Detalhes
                  </button>
                  {user?.role === 'administrador' && (
                    <button 
                      onClick={() => handleDelete(ticket.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTickets.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-slate-300" size={32} />
          </div>
          <p className="text-slate-500 font-medium">Nenhum chamado encontrado para este filtro.</p>
        </div>
      )}

      <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-center">
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
          Ver todos os chamados
        </button>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                Detalhes do Chamado <span className="text-sm font-bold px-2 py-1 bg-slate-200 text-slate-600 rounded-lg">{selectedTicket.id}</span>
              </h3>
              <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Sistema de Abas */}
            <div className="flex px-6 bg-slate-50 border-b border-slate-100">
              <button 
                onClick={() => setAtivaTab('geral')}
                className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${ativaTab === 'geral' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Informações Gerais
              </button>
              {selectedTicket.status === 'Concluído' && (
                <button 
                  onClick={() => setAtivaTab('gastos')}
                  className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${ativaTab === 'gastos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Gastos e Materiais
                </button>
              )}
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {ativaTab === 'geral' ? (
                <>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Assunto</p>
                    <p className="text-lg font-bold text-slate-800">{selectedTicket.subject}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Status Atual</p>
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${statusStyles[selectedTicket.status]}`}>
                        {selectedTicket.status}
                      </span>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Prioridade</p>
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold border ${priorityStyles[selectedTicket.priority]}`}>
                        {selectedTicket.priority}
                      </span>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Categoria</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${categoryColors[selectedTicket.category]}`}></span>
                        <p className="font-bold text-slate-700 text-sm">{selectedTicket.category}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descrição do Problema</p>
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedTicket.description || 'Nenhuma descrição detalhada fornecida para este chamado.'}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div>
                      <p className="text-[10px] font-bold text-blue-400 uppercase">Data de Abertura</p>
                      <p className="text-sm font-bold text-blue-900">{new Date(selectedTicket.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                    {selectedTicket.closed_at && (
                      <div>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase">Data de Fechamento</p>
                        <p className="text-sm font-bold text-emerald-900">{new Date(selectedTicket.closed_at).toLocaleString('pt-BR')}</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex justify-between items-center">
                    <div>
                      <h4 className="text-emerald-800 font-bold">Investimento Total</h4>
                      <p className="text-xs text-emerald-600">Soma de todos os materiais e serviços</p>
                    </div>
                    <span className="text-3xl font-black text-emerald-700">
                      {formatoMoeda(parseFloat(selectedTicket.valor_total) || 0)}
                    </span>
                  </div>

                  {materiais && materiais.length > 0 ? (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Package size={14} /> Detalhamento de Insumos
                      </p>
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                              <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Qtd</th>
                              <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Descrição do Material / Serviço</th>
                              <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-500 uppercase">Preço Unit.</th>
                              <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-500 uppercase">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {materiais.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-xs font-bold text-slate-700">
                                    {item.quantidade}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-800">{item.descricao}</td>
                                <td className="px-4 py-3 text-right text-slate-600">{formatoMoeda(item.preco_unitario)}</td>
                                <td className="px-4 py-3 text-right font-bold text-slate-900">{formatoMoeda(item.subtotal)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Package className="text-slate-300" size={24} />
                      </div>
                      <p className="text-slate-500 font-medium">Nenhum detalhamento de materiais encontrado para este chamado.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end bg-slate-50 mt-auto">
              <button 
                onClick={() => setSelectedTicket(null)} 
                className="px-6 py-2.5 bg-navy-900 text-white font-bold rounded-xl shadow-lg shadow-navy-900/20 hover:bg-navy-800 transition-colors active:scale-95"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalMateriaisServicos
        isOpen={showModalMateriais}
        onClose={() => {
          setShowModalMateriais(false);
          setTicketParaFinalizar(null);
        }}
        onConfirm={handleConfirmarMateriais}
        ticketId={ticketParaFinalizar?.id}
      />
    </div>
  );
};

export default TicketTable;
