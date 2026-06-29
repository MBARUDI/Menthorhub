import React from 'react';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Target, 
  BookOpen, 
  Database, 
  Layers, 
  PenTool, 
  Sliders, 
  MessageSquare, 
  Newspaper, 
  Film, 
  Calendar,
  Zap,
  Award
} from 'lucide-react';

const Sidebar = ({ activeSection, setActiveSection, streak, xp, mobileOpen, setMobileOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fragilidades', label: 'Fragilidades', icon: AlertTriangle },
    { id: 'exercicios-p', label: 'Exercícios Focados', icon: Target },
    { id: 'conteudos', label: 'Blocos de Estudo', icon: BookOpen },
    { id: 'exercicios-g', label: 'Exercícios Gerais', icon: Database },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'redacao', label: 'Redação Claude', icon: PenTool },
    { id: 'simulado', label: 'Simulado Adaptativo', icon: Sliders },
    { id: 'tutor', label: 'Tutora IA', icon: MessageSquare },
    { id: 'atualidades', label: 'Atualidades + Edital', icon: Newspaper },
    { id: 'repertorio', label: 'Repertório Cultural', icon: Film },
    { id: 'plano', label: 'Plano de Estudos', icon: Calendar },
  ];

  const handleNav = (id) => {
    setActiveSection(id);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-logo">
        <span>Vestibular</span>Pro
      </div>

      <div style={{ display: 'flex', gap: '12px', padding: '0 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(240, 165, 0, 0.15)', padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(240, 165, 0, 0.25)' }}>
          <Zap size={14} color="#f0a500" fill="#f0a500" />
          <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f0a500' }}>{streak} DIAS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(232, 93, 58, 0.15)', padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(232, 93, 58, 0.25)' }}>
          <Award size={14} color="#e85d3a" />
          <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e85d3a' }}>{xp} XP</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`sidebar-link ${activeSection === item.id ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-profile">
        <div className="profile-name">Luiggi</div>
        <div className="profile-tag">Humanas (Direito/Econ)</div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
          FUVEST • ENEM • FGV • INSPER
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
