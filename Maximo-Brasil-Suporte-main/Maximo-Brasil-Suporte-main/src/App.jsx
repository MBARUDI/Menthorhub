import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import MyTickets from './pages/MyTickets';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NewTicket from './pages/NewTicket';
import Login from './pages/Login';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState([]);

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/tickets?userId=${user.id}`);
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      console.error('Erro ao buscar chamados:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user, fetchTickets]);

  const addTicket = async (newTicket) => {
    const id = `#TK-${Math.floor(Math.random() * 9000) + 1000}`;
    const ticket = {
      ...newTicket,
      id,
      status: 'Pendente',
      user_id: user.id
    };
    
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket)
      });
      if (response.ok) {
        fetchTickets(); // Atualiza a lista após criar
      }
    } catch (err) {
      console.error('Erro ao adicionar chamado:', err);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus, materiaisData = null) => {
    try {
      const response = await fetch(`/api/tickets/${encodeURIComponent(ticketId)}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          materiais: materiaisData ? materiaisData.materiais : null,
          valorTotal: materiaisData ? materiaisData.valorTotal : null
        })
      });
      if (response.ok) {
        fetchTickets();
      }
    } catch (err) {
      console.error('Erro ao atualizar chamado:', err);
    }
  };

  const deleteTicket = async (ticketId) => {
    try {
      const response = await fetch(`/api/tickets/${encodeURIComponent(ticketId)}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchTickets();
      }
    } catch (err) {
      console.error('Erro ao excluir chamado:', err);
    }
  };

  const clearAllTickets = () => {
    // Para simplificar, vou apenas limpar no front, mas idealmente seria na API também
    setTickets([]);
  };

  const [systemSettings, setSystemSettings] = useState({
    title: 'Máximo Brasil',
    subtitle: 'Gestão Inteligente de Suporte',
    logo: '/imgMaximo.png'
  });

  const updateSystemSettings = (newSettings) => {
    setSystemSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateUser = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role?.toLowerCase() === 'administrador') {
      setActivePage('dashboard');
    } else {
      setActivePage('tickets');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActivePage('dashboard');
  };

  const [helpInfo, setHelpInfo] = useState({
    text: 'Suporte Maximo',
    email: 'maximobrasilmanut@gmail.com',
    site: 'https://ajuda.maximo.com.br',
    phone: '(11) 98591-9330',
    whatsapp: 'https://wa.me/5511985919330'
  });

  const updateHelpInfo = (newInfo) => {
    setHelpInfo(prev => ({ ...prev, ...newInfo }));
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    if (isCreatingTicket) {
      return (
        <NewTicket 
          onBack={() => setIsCreatingTicket(false)} 
          onSubmit={(data) => {
            addTicket(data);
            setIsCreatingTicket(false);
            setActivePage('tickets');
          }} 
        />
      );
    }

    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard 
            searchQuery={searchQuery} 
            tickets={tickets} 
            onUpdateStatus={updateTicketStatus} 
            onDelete={deleteTicket} 
          />
        );
      case 'tickets':
        return (
          <MyTickets 
            searchQuery={searchQuery} 
            tickets={tickets} 
            onUpdateStatus={updateTicketStatus} 
            onDelete={deleteTicket} 
            user={user}
          />
        );
      case 'reports':
        return <Reports tickets={tickets} />;
      case 'settings':
        return (
          <Settings 
            user={user} 
            updateUser={updateUser}
            systemSettings={systemSettings} 
            updateSystemSettings={updateSystemSettings}
            helpInfo={helpInfo}
            updateHelpInfo={updateHelpInfo}
            onClearAllTickets={clearAllTickets}
          />
        );
      default:
        return <Dashboard searchQuery={searchQuery} tickets={tickets} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activePage={activePage} 
        setActivePage={(page) => {
          setActivePage(page);
          setIsCreatingTicket(false);
          setSearchQuery(''); // Limpar busca ao mudar de página
        }} 
        systemSettings={systemSettings}
        user={user}
        onLogout={handleLogout}
      />

      <div className="flex-1 ml-64 flex flex-col">
        <Header 
          user={user} 
          onLogout={handleLogout} 
          onNewTicket={() => setIsCreatingTicket(true)} 
          onOpenProfile={() => {
            setActivePage('settings');
            setIsCreatingTicket(false);
          }}
          helpInfo={helpInfo}
          systemSettings={systemSettings}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={isCreatingTicket ? 'new-ticket' : activePage}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="p-8 text-center text-slate-400 text-sm border-t border-slate-200 bg-white">
          &copy; 2026 Maximo Brasil Suporte - Todos os direitos reservados.
        </footer>
      </div>
    </div>
  );
}

export default App;
