import { useState } from 'react';
import TicketTable from '../components/TicketTable';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';

const MyTickets = ({ searchQuery, user, tickets, onUpdateStatus, onDelete }) => {
  // Se for cliente, mostra apenas os dele. Se for técnico/admin, mostra todos ou baseia na lógica de atribuição.
  // Por enquanto, mostraremos todos se for técnico/admin, e filtrados se for cliente.
  const myTickets = user.role === 'cliente' 
    ? tickets.filter(t => t.user_id === user.id)
    : tickets;

  return (
    <div className="p-8 flex-1">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-navy-900 tracking-tight mb-2">Meus Chamados</h2>
        <p className="text-slate-500 font-medium">Olá, {user.name}! Gerencie e acompanhe todos os seus tickets de suporte.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <TicketTable 
          categoryFilter="all" 
          searchQuery={searchQuery} 
          tickets={myTickets}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
          user={user}
        />
      </motion.div>
    </div>
  );
};

export default MyTickets;
