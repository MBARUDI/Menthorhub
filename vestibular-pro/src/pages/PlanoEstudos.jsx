import React, { useContext } from 'react';
import { VestibularContext } from '../context/VestibularContext';
import { Calendar, CheckCircle2, Zap, Flame, Award } from 'lucide-react';

const PlanoEstudos = () => {
  const { planoEstudos, toggleMetaPlanoEstudo, streak, xp } = useContext(VestibularContext);

  // Determine current day of week (in Portuguese) to highlight
  const diasDaSemanaPt = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const currentDayName = diasDaSemanaPt[new Date().getDay()];

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '40px' }}>
        <h1 className="font-title section-title">Plano de Estudos Inteligente</h1>
        <p className="section-subtitle">
          Cronograma semanal ajustado dinamicamente com base nas suas fragilidades nos simulados.
        </p>
      </header>

      {/* Gamification Streak & XP Panel */}
      <div className="panel" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '24px 32px', 
        marginBottom: '32px',
        background: 'linear-gradient(135deg, rgba(240, 165, 0, 0.08) 0%, rgba(232, 93, 58, 0.05) 100%)',
        border: '1px solid rgba(240, 165, 0, 0.15)'
      }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={28} color="var(--primary)" fill="var(--primary)" />
            <div>
              <span className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{streak} DIAS</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Streak atual de estudos</p>
            </div>
          </div>
          
          <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--border-color)' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={28} color="var(--secondary)" />
            <div>
              <span className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{xp} XP</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pontuação acumulada</p>
            </div>
          </div>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '400px', textAlign: 'right' }} className="font-body">
          💡 <strong>Dica:</strong> Concluir as metas diárias do plano de estudos concede bônus de XP adicionais para o seu ranqueamento semanal!
        </span>
      </div>

      {/* Weekly Schedule Grid */}
      <h2 className="font-title" style={{ fontSize: '1.4rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Calendar size={18} color="var(--primary)" />
        Agenda Semanal Inteligente
      </h2>

      <div className="calendar-grid" style={{ marginBottom: '32px' }}>
        {planoEstudos.map((diaCard, diaIndex) => {
          const isToday = diaCard.dia === currentDayName;
          
          return (
            <div 
              key={diaCard.dia} 
              className={`calendar-day-card ${isToday ? 'today' : ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-title" style={{ fontSize: '1.15rem', fontWeight: 700, color: isToday ? 'var(--primary)' : 'var(--text-primary)' }}>
                  {diaCard.dia}
                </span>
                {diaCard.horas > 0 && (
                  <span className="badge badge-dark" style={{ fontSize: '0.6rem' }}>{diaCard.horas}h/estudo</span>
                )}
              </div>

              {/* Matérias badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {diaCard.materias.map(mat => {
                  let badgeType = "badge-dark";
                  if (mat.includes("Crítica")) badgeType = "badge-error";
                  return (
                    <span key={mat} className={`badge ${badgeType}`} style={{ fontSize: '0.55rem', padding: '2px 6px' }}>
                      {mat}
                    </span>
                  );
                })}
              </div>

              {/* Day Goals List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                {diaCard.metas.map((meta, metaIndex) => (
                  <div 
                    key={metaIndex} 
                    onClick={() => toggleMetaPlanoEstudo(diaIndex, metaIndex)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '8px', 
                      cursor: 'pointer',
                      fontSize: '0.72rem',
                      color: meta.concluida ? 'var(--text-tertiary)' : 'var(--text-secondary)'
                    }}
                  >
                    <div style={{ flexShrink: 0, marginTop: '2px' }}>
                      {meta.concluida ? (
                        <CheckCircle2 size={13} color="var(--success)" fill="var(--success-bg)" />
                      ) : (
                        <div style={{ width: '12px', height: '12px', border: '1px solid var(--text-secondary)', borderRadius: '2px' }} />
                      )}
                    </div>
                    <span style={{ 
                      textDecoration: meta.concluida ? 'line-through' : 'none', 
                      lineHeight: '1.4' 
                    }}>
                      {meta.texto} <span style={{ color: 'var(--secondary)', fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>({meta.xp} XP)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanoEstudos;
