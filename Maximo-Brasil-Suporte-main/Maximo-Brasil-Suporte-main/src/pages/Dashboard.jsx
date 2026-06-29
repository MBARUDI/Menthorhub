import { useState } from 'react';
import StatusCards from '../components/StatusCards';
import TicketTable from '../components/TicketTable';
import CategoryFilters from '../components/CategoryFilters';
import { motion } from 'framer-motion';

const Dashboard = ({ searchQuery, tickets, onUpdateStatus, onDelete }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className="flex-1 flex flex-col">
      <main className="p-8 flex-1">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-navy-900 tracking-tight mb-2">Painel de Gerenciamento</h2>
          <p className="text-slate-500 font-medium">Bem-vindo de volta! Aqui está o resumo das atividades de suporte.</p>
        </div>

        <StatusCards tickets={tickets} />

        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Filtrar por Categoria</h3>
          </div>
          
          <CategoryFilters 
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory} 
          />

          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <TicketTable 
              categoryFilter={activeCategory} 
              searchQuery={searchQuery} 
              tickets={tickets}
              onUpdateStatus={onUpdateStatus}
              onDelete={onDelete}
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
