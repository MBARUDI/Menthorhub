import { useState } from 'react';
import { Send, FileText, AlertTriangle, Layers, ArrowLeft, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const NewTicket = ({ onBack, onSubmit }) => {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'Informática/TI',
    catId: 'it',
    priority: 'Média',
    description: ''
  });

  const categories = [
    { id: 'it', name: 'Informática/TI' },
    { id: 'electric', name: 'Elétrica' },
    { id: 'civil', name: 'Predial/Civil' },
    { id: 'security', name: 'Segurança' },
    { id: 'telecom', name: 'Telecom' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="p-8 flex-1 max-w-4xl mx-auto w-full">
      <div className="mb-8 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-3xl font-black text-navy-900 tracking-tight">Novo Chamado</h2>
          <p className="text-slate-500 font-medium">Preencha os detalhes abaixo para solicitar suporte.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-8 space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                <FileText size={14} /> Assunto do Chamado
              </label>
              <input 
                type="text" 
                required
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="Ex: Impressora do RH não está funcionando" 
                className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl text-base focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                  <Layers size={14} /> Categoria
                </label>
                <select 
                  value={formData.catId}
                  onChange={(e) => {
                    const cat = categories.find(c => c.id === e.target.value);
                    setFormData({...formData, catId: cat.id, category: cat.name});
                  }}
                  className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl text-base focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                  <AlertTriangle size={14} /> Prioridade
                </label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl text-base focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Descrição Detalhada</label>
              <textarea 
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descreva o problema com o máximo de detalhes possível..." 
                className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl text-base focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none"
              ></textarea>
            </div>
          </div>

          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button type="button" onClick={onBack} className="text-sm font-bold text-slate-500 hover:text-slate-700">
              Cancelar e Voltar
            </button>
            <button type="submit" className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2">
              <Plus size={20} />
              Abrir Chamado
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default NewTicket;
