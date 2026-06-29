import { LayoutDashboard, ClipboardList, BarChart3, Settings, ChevronRight, LogOut } from 'lucide-react';

const Sidebar = ({ activePage, setActivePage, systemSettings, user, onLogout }) => {
  const isAdmin = user?.role?.toLowerCase() === 'administrador';

  const menuItems = [
    ...(isAdmin ? [{ id: 'dashboard', icon: LayoutDashboard, label: 'Visão Geral' }] : []),
    { id: 'tickets', icon: ClipboardList, label: 'Meus Chamados' },
    ...(isAdmin ? [{ id: 'reports', icon: BarChart3, label: 'Relatórios' }] : []),
    { id: 'settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-navy-900 text-slate-300 flex flex-col shadow-2xl z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center overflow-hidden">
          {systemSettings?.logo ? (
            <img src={systemSettings.logo} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <Settings className="text-white animate-spin-slow" size={24} />
          )}
        </div>
        <h1 className="text-white font-bold text-xl tracking-tight">{systemSettings?.title || 'SupportHub'}</h1>
      </div>

      <nav className="flex-1 px-4 mt-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all group ${
                  activePage === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'hover:bg-navy-800 hover:text-white text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={activePage === item.id ? 'text-white' : 'group-hover:text-white'} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {activePage === item.id && <ChevronRight size={16} />}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-navy-800 space-y-4">
        {user && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-950/50 border border-navy-800">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-slate-500 flex items-center justify-center text-sm font-bold text-white overflow-hidden border-2 border-blue-500/30">
                {user.avatar ? (
                  <img src={user.avatar} className="w-full h-full object-cover" />
                ) : (
                  user.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-navy-900 rounded-full"></div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
        )}

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all text-sm font-semibold"
        >
          <LogOut size={18} />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
