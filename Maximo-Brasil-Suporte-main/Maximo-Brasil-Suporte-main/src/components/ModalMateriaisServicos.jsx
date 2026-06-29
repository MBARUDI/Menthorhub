import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const ModalMateriaisServicos = ({ isOpen, onClose, onConfirm, ticketId }) => {
  const [itens, setItens] = useState([
    { id: 1, quantidade: '', descricao: '', preco: '' }
  ]);

  const adicionarItem = () => {
    setItens([...itens, { id: Date.now(), quantidade: '', descricao: '', preco: '' }]);
  };

  const removerItem = (id) => {
    if (itens.length > 1) {
      setItens(itens.filter(item => item.id !== id));
    }
  };

  const atualizarItem = (id, campo, valor) => {
    setItens(itens.map(item => 
      item.id === id ? { ...item, [campo]: valor } : item
    ));
  };

  const calcularTotal = () => {
    return itens.reduce((total, item) => {
      const qtd = parseFloat(item.quantidade) || 0;
      const preco = parseFloat(item.preco) || 0;
      return total + (qtd * preco);
    }, 0);
  };

  const handleConfirmar = () => {
    const dados = {
      ticketId,
      materiais: itens.map(item => ({
        quantidade: parseFloat(item.quantidade) || 0,
        descricao: item.descricao,
        precoUnitario: parseFloat(item.preco) || 0,
        subtotal: (parseFloat(item.quantidade) || 0) * (parseFloat(item.preco) || 0)
      })),
      valorTotal: calcularTotal()
    };
    onConfirm(dados);
  };

  if (!isOpen) return null;

  const formatoMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-navy-900">Finalizar Chamado</h3>
            <p className="text-sm text-slate-500">Ticket: {ticketId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Materiais e Serviços</h4>
            
            <div className="space-y-3">
              {itens.map((item, index) => (
                <div key={item.id} className="flex gap-3 items-start bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="w-16">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Qtd</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) => atualizarItem(item.id, 'quantidade', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Descrição</label>
                    <input
                      type="text"
                      value={item.descricao}
                      onChange={(e) => atualizarItem(item.id, 'descricao', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="Ex: Fio cabo 2,5mm"
                    />
                  </div>
                  <div className="w-28">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Preço Unit.</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.preco}
                      onChange={(e) => atualizarItem(item.id, 'preco', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="0,00"
                    />
                  </div>
                  <div className="w-24 pt-5">
                    <p className="text-xs font-bold text-slate-400 uppercase">Subtotal</p>
                    <p className="text-sm font-bold text-slate-700">
                      {formatoMoeda((parseFloat(item.quantidade) || 0) * (parseFloat(item.preco) || 0))}
                    </p>
                  </div>
                  <button
                    onClick={() => removerItem(item.id)}
                    disabled={itens.length === 1}
                    className={`p-2 mt-5 rounded-lg transition-colors ${itens.length === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={adicionarItem}
              className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Plus size={18} />
              Adicionar Item
            </button>
          </div>

          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                <p className="text-[10px] font-bold text-emerald-500 uppercase leading-none mb-1">Itens Executados</p>
                <p className="text-xl font-black text-emerald-700 leading-none">
                  {itens.filter(i => i.descricao.trim() !== '').length}
                </p>
              </div>
              <div className="h-10 w-px bg-emerald-200 hidden md:block"></div>
              <div>
                <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Resumo de Finalização</h4>
                <p className="text-xs text-emerald-600">Verifique os valores antes de confirmar</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-emerald-500 uppercase mb-1">Valor Total Geral</p>
              <span className="text-3xl font-black text-emerald-700 tracking-tight">{formatoMoeda(calcularTotal())}</span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-4 bg-slate-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors active:scale-95"
          >
            Finalizar Chamado
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalMateriaisServicos;