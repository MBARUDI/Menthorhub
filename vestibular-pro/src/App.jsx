import React, { useState, useContext } from 'react';
import { VestibularContext } from './context/VestibularContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AnaliseFragilidades from './pages/AnaliseFragilidades';
import ExerciciosPersonalizados from './pages/ExerciciosPersonalizados';
import BlocosConteudo from './pages/BlocosConteudo';
import ExerciciosGerais from './pages/ExerciciosGerais';
import Flashcards from './pages/Flashcards';
import Redacao from './pages/Redacao';
import SimuladoAdaptativo from './pages/SimuladoAdaptativo';
import TutoraIA from './pages/TutoraIA';
import Atualidades from './pages/Atualidades';
import RepertorioGeral from './pages/RepertorioGeral';
import PlanoEstudos from './pages/PlanoEstudos';
import { Menu, X, Zap } from 'lucide-react';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { streak, xp } = useContext(VestibularContext);

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'fragilidades':
        return <AnaliseFragilidades />;
      case 'exercicios-p':
        return <ExerciciosPersonalizados />;
      case 'conteudos':
        return <BlocosConteudo />;
      case 'exercicios-g':
        return <ExerciciosGerais />;
      case 'flashcards':
        return <Flashcards />;
      case 'redacao':
        return <Redacao />;
      case 'simulado':
        return <SimuladoAdaptativo />;
      case 'tutor':
        return <TutoraIA />;
      case 'atualidades':
        return <Atualidades />;
      case 'repertorio':
        return <RepertorioGeral />;
      case 'plano':
        return <PlanoEstudos />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Top Bar */}
      <header className="mobile-header">
        <div className="sidebar-logo">
          <span>Vestibular</span>Pro
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(240, 165, 0, 0.15)', padding: '4px 8px', borderRadius: '4px' }}>
            <Zap size={12} color="#f0a500" fill="#f0a500" />
            <span className="font-mono" style={{ fontSize: '0.65rem', fontWeight: 600, color: '#f0a500' }}>{streak}D</span>
          </div>
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        streak={streak} 
        xp={xp}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {renderSection()}
      </main>
    </div>
  );
}

export default App;
