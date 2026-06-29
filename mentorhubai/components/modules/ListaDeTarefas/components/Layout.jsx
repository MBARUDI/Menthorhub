import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CheckSquare, BarChart3, CalendarDays, LogOut, Zap, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-obsidian-950 bg-mesh">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-obsidian-950/80 border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white tracking-tight">
                Task<span className="text-gradient">Flow</span>
              </span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <CheckSquare size={16} />
                <span className="hidden sm:inline">Tarefas</span>
              </NavLink>

              <NavLink
                to="/analises"
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <BarChart3 size={16} />
                <span className="hidden sm:inline">Análises</span>
              </NavLink>

              <NavLink
                to="/calendario"
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <CalendarDays size={16} />
                <span className="hidden sm:inline">Calendário</span>
              </NavLink>
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-white/50 font-medium max-w-[120px] truncate">
                  {user?.email}
                </span>
              </div>
              
              <button
                id="btn-logout"
                onClick={handleLogout}
                className="nav-link text-white/30 hover:text-rose-400 hover:bg-rose-500/10"
                title="Sair"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
