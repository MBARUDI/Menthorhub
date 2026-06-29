import { useState } from 'react';
import { Search, Bell, User, Plus, HelpCircle, ChevronDown, Mail, LogOut, Settings, Phone, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ user, onLogout, onNewTicket, onOpenProfile, helpInfo, systemSettings, searchQuery, setSearchQuery }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 backdrop-blur-md bg-white/80">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar chamados..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl text-sm transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onNewTicket}
          className="btn-primary shadow-lg shadow-navy-900/10 active:scale-95 transition-transform"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Novo Chamado</span>
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        <div className="relative">
          <button 
            onClick={() => { setShowHelp(!showHelp); setShowUserMenu(false); }}
            className={`p-2 rounded-full transition-all ${showHelp ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-100'}`} 
            title="Ajuda"
          >
            <HelpCircle size={20} />
          </button>

          <AnimatePresence>
            {showHelp && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50"
              >
                <div className="mb-4 pb-4 border-b border-slate-100">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <HelpCircle size={16} className="text-blue-500" /> {helpInfo.text}
                  </h4>
                </div>
                <div className="space-y-3">
                  {helpInfo.email && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Mail size={14} /></div>
                      <span>{helpInfo.email}</span>
                    </div>
                  )}
                  {helpInfo.phone && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Phone size={14} /></div>
                      <span>{helpInfo.phone}</span>
                    </div>
                  )}
                  {helpInfo.whatsapp && (
                    <a href={helpInfo.whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-green-600 hover:underline">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500"><MessageCircle size={14} /></div>
                      <span className="font-semibold">Chamar no WhatsApp</span>
                    </a>
                  )}
                  {helpInfo.site && (
                    <a href={helpInfo.site} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-blue-600 hover:underline">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-400"><Settings size={14} /></div>
                      <span>Documentação Online</span>
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="relative">
          <button 
            onClick={() => { setShowUserMenu(!showUserMenu); setShowHelp(false); }}
            className={`flex items-center gap-2 p-1 rounded-full pr-3 transition-all group ${showUserMenu ? 'bg-navy-900 text-white' : 'hover:bg-slate-100'}`}
          >
            <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-bold text-xs border border-navy-200 overflow-hidden">
              {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.substring(0, 2).toUpperCase()}
            </div>
            <span className={`text-sm font-semibold hidden md:block ${showUserMenu ? 'text-white' : 'text-slate-700'}`}>{user.name}</span>
            <ChevronDown size={14} className={showUserMenu ? 'text-white/50' : 'text-slate-400 group-hover:text-slate-600'} />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50"
              >
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Logado como</p>
                  <p className="text-sm font-bold text-slate-800">{user.role.toUpperCase()}</p>
                </div>
                <div className="p-2">
                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onOpenProfile) onOpenProfile();
                    }}
                    className="w-full flex items-center gap-3 p-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <User size={18} /> Perfil do Usuário
                  </button>
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 p-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <LogOut size={18} /> Sair do Sistema
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
