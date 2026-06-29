import React, { useContext } from 'react';
import { VestibularContext } from '../context/VestibularContext';
import { AlertCircle, ChevronRight, Activity, ShieldCheck, Tag } from 'lucide-react';

const AnaliseFragilidades = () => {
  const { getFragilityZones } = useContext(VestibularContext);
  const { criticas, medias, fortes } = getFragilityZones();

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '40px' }}>
        <h1 className="font-title section-title">Análise de Fragilidades</h1>
        <p className="section-subtitle">
          Mapeamento preditivo de gargalos de desempenho com base nos simulados realizados.
        </p>
      </header>

      {/* ZONA CRÍTICA */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <AlertCircle size={16} color="var(--error)" />
          </div>
          <h2 className="font-title" style={{ fontSize: '1.5rem', color: 'var(--error)' }}>
            Zona Crítica <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-secondary)' }}>— Abaixo de 65% de acertos</span>
          </h2>
        </div>

        <div className="grid-1">
          {criticas.map(item => (
            <div key={item.materia} className="panel" style={{ borderLeft: '4px solid var(--error)', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 className="font-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>{item.materia}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                    APROVEITAMENTO ESTIMADO: {item.errosCount} ERROS MEDIDOS
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--error)' }}>
                    {item.porcentagem}%
                  </span>
                </div>
              </div>

              <div className="progress-container" style={{ height: '8px', marginBottom: '20px' }}>
                <div className="progress-fill" style={{ width: `${item.porcentagem}%`, backgroundColor: 'var(--error)' }} />
              </div>

              <div>
                <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Tópicos Críticos Identificados no Gabarito:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {item.topicosErrados.map(topic => (
                    <div 
                      key={topic} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        backgroundColor: 'rgba(239, 68, 68, 0.08)', 
                        border: '1px solid rgba(239, 68, 68, 0.15)', 
                        padding: '6px 12px', 
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: '#fca5a5'
                      }}
                    >
                      <Tag size={12} />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {criticas.length === 0 && (
            <div className="panel" style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
              🎉 Excelente! Você não possui matérias abaixo de 65% de aproveitamento.
            </div>
          )}
        </div>
      </section>

      {/* ZONA DE DESENVOLVIMENTO */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(240, 165, 0, 0.1)', border: '1px solid rgba(240, 165, 0, 0.2)' }}>
            <Activity size={16} color="var(--secondary)" />
          </div>
          <h2 className="font-title" style={{ fontSize: '1.5rem', color: 'var(--secondary)' }}>
            Zona de Desenvolvimento <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-secondary)' }}>— Entre 65% e 80% de acertos</span>
          </h2>
        </div>

        <div className="grid-2">
          {medias.map(item => (
            <div key={item.materia} className="panel" style={{ borderLeft: '4px solid var(--secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 className="font-title" style={{ fontSize: '1.1rem', fontWeight: 600 }}>{item.materia}</h3>
                <span className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--secondary)' }}>
                  {item.porcentagem}%
                </span>
              </div>

              <div className="progress-container" style={{ height: '6px', marginBottom: '16px' }}>
                <div className="progress-fill" style={{ width: `${item.porcentagem}%`, backgroundColor: 'var(--secondary)' }} />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {item.topicosErrados.map(topic => (
                  <span 
                    key={topic} 
                    className="badge badge-secondary" 
                    style={{ fontSize: '0.65rem', textTransform: 'none' }}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {medias.length === 0 && (
            <div className="panel" style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
              Nenhuma matéria nesta faixa de consolidação intermediária.
            </div>
          )}
        </div>
      </section>

      {/* ZONA FORTE */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
            <ShieldCheck size={16} color="var(--success)" />
          </div>
          <h2 className="font-title" style={{ fontSize: '1.5rem', color: 'var(--success)' }}>
            Zona Forte <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-secondary)' }}>— Acima de 80% de acertos</span>
          </h2>
        </div>

        <div className="grid-3">
          {fortes.map(item => (
            <div key={item.materia} className="panel" style={{ borderLeft: '4px solid var(--success)', padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 className="font-title" style={{ fontSize: '0.95rem', fontWeight: 600 }}>{item.materia}</h3>
                <span className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--success)' }}>
                  {item.porcentagem}%
                </span>
              </div>
              <div className="progress-container" style={{ height: '4px' }}>
                <div className="progress-fill" style={{ width: `${item.porcentagem}%`, backgroundColor: 'var(--success)' }} />
              </div>
            </div>
          ))}

          {fortes.length === 0 && (
            <div className="panel" style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
              Suas matérias ainda não ultrapassaram a linha de 80%. Continue praticando nos simulados!
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AnaliseFragilidades;
