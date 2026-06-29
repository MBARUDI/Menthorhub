import React, { useContext } from 'react';
import { VestibularContext } from '../context/VestibularContext';
import { Calendar, CheckCircle2, TrendingUp, HelpCircle, Trophy } from 'lucide-react';

const Dashboard = () => {
  const { 
    userProfile, 
    simulados, 
    questoesFeitasCount, 
    getSubjectAverages, 
    streak, 
    xp 
  } = useContext(VestibularContext);

  const averages = getSubjectAverages();

  // Calculate estimated scores based on actual simulation averages
  // We take the average percentage across all simulators
  const totalSimulados = simulados.length;
  const avgPct = totalSimulados > 0 
    ? simulados.reduce((acc, curr) => acc + curr.pct, 0) / totalSimulados 
    : 0;

  // ENEM Estimado: between 500 and 850 depending on average percentage
  const enemEstimado = totalSimulados > 0 
    ? Math.round(520 + (avgPct * 3.4)) 
    : 0;

  // FUVEST Estimada: out of 90
  const fuvestEstimada = totalSimulados > 0 
    ? Math.round((avgPct / 100) * 90) 
    : 0;

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '40px' }}>
        <h1 className="font-title section-title" style={{ fontSize: '2.5rem' }}>
          Bom dia, {userProfile.nome}.
        </h1>
        <p className="section-subtitle">
          Faltam 142 dias para a FUVEST. Vamos garantir sua vaga em <strong>{userProfile.foco}</strong> hoje?
        </p>
      </header>

      {/* Stats Cards Row */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">ENEM Estimado</span>
            <TrendingUp size={16} color="var(--info)" />
          </div>
          <div className="stat-value font-mono" style={{ color: 'var(--info)' }}>
            {enemEstimado > 0 ? `${enemEstimado} pts` : '--'}
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Média TRI projetada</span>
        </div>

        <div className="panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">FUVEST Estimada</span>
            <TrendingUp size={16} color="var(--primary)" />
          </div>
          <div className="stat-value font-mono" style={{ color: 'var(--primary)' }}>
            {fuvestEstimada > 0 ? `${fuvestEstimada} / 90` : '--'}
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Primeira fase estimada</span>
        </div>

        <div className="panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Meta de Corte (USP)</span>
            <Trophy size={16} color="var(--secondary)" />
          </div>
          <div className="stat-value font-mono" style={{ color: 'var(--secondary)' }}>
            76 / 90
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Direito USP (FUVEST 2024)</span>
        </div>

        <div className="panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Total de Questões</span>
            <HelpCircle size={16} color="var(--success)" />
          </div>
          <div className="stat-value font-mono" style={{ color: 'var(--success)' }}>
            {questoesFeitasCount}
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Exercícios + simulados</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
        {/* Desempenho por Matéria Bar Chart */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 className="font-title" style={{ fontSize: '1.4rem' }}>Desempenho Real por Matéria</h2>
          <div className="chart-container">
            {Object.keys(averages).map(mat => {
              const val = averages[mat];
              let barColor = 'var(--error)';
              if (val >= 65 && val <= 80) barColor = 'var(--secondary)';
              if (val > 80) barColor = 'var(--success)';

              return (
                <div key={mat} className="chart-bar-row">
                  <div className="chart-bar-label">{mat}</div>
                  <div className="chart-bar-outer">
                    <div 
                      className="chart-bar-inner" 
                      style={{ 
                        width: `${val}%`, 
                        backgroundColor: barColor 
                      }} 
                    />
                  </div>
                  <div className="chart-bar-value font-mono" style={{ color: barColor }}>
                    {val}%
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', marginTop: '8px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--error)', borderRadius: '2px' }} />
              Zona Crítica (&lt;65%)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--secondary)', borderRadius: '2px' }} />
              Desenvolvimento (65%-80%)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--success)', borderRadius: '2px' }} />
              Forte (&gt;80%)
            </div>
          </div>
        </div>

        {/* Histórico de Simulados */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 className="font-title" style={{ fontSize: '1.4rem' }}>Simulados Feitos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {simulados.map(sim => (
              <div key={sim.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{sim.nome}</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>
                      <Calendar size={12} />
                      <span>{sim.data}</span>
                      <span>•</span>
                      <span>Média por questão: {sim.tempoMedio}</span>
                    </div>
                  </div>
                  <span className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 600, color: sim.pct >= 65 ? 'var(--success)' : 'var(--error)' }}>
                    {sim.acertos}/{sim.total} ({sim.pct.toFixed(1)}%)
                  </span>
                </div>
                <div className="progress-container" style={{ height: '4px' }}>
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${sim.pct}%`, 
                      backgroundColor: sim.pct >= 80 ? 'var(--success)' : sim.pct >= 65 ? 'var(--secondary)' : 'var(--error)' 
                    }} 
                  />
                </div>
              </div>
            ))}
            {simulados.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>
                Nenhum simulado registrado. Conclua seu primeiro simulado adaptativo!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
