import React, { useState } from 'react';
import { initialRepertories } from '../data/vestibularDB';
import { Film, BookOpen, Quote, Sparkles, Copy, Eye } from 'lucide-react';

const RepertorioGeral = () => {
  const [selectedType, setSelectedType] = useState('Todos');
  const [activeAnalysisMode, setActiveAnalysisMode] = useState({}); // { id: 'resumo' | 'profunda' }
  const [expandedCitationId, setExpandedCitationId] = useState(null);

  const mediaTypes = ['Todos', '🎬 Filmes', '📺 Séries', '📚 Livros', '🎵 Músicas'];

  const filteredRepertories = initialRepertories.filter(item => 
    selectedType === 'Todos' || item.tipo === selectedType
  );

  const toggleAnalysisMode = (id, mode) => {
    setActiveAnalysisMode(prev => ({
      ...prev,
      [id]: mode
    }));
  };

  const toggleCitation = (id) => {
    if (expandedCitationId === id) {
      setExpandedCitationId(null);
    } else {
      setExpandedCitationId(id);
    }
  };

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '40px' }}>
        <h1 className="font-title section-title">Repertório Cultural para Redação</h1>
        <p className="section-subtitle">
          Acervo de obras legitimadas, de fácil aplicabilidade no edital de ciências humanas.
        </p>
      </header>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {mediaTypes.map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`btn ${selectedType === type ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              padding: '6px 16px', 
              fontSize: '0.7rem', 
              borderRadius: '20px' 
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Repertories Grid */}
      <div className="grid-2">
        {filteredRepertories.map(item => {
          const mode = activeAnalysisMode[item.id] || 'resumo';
          
          return (
            <div key={item.id} className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 className="font-title" style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                    {item.tipo} - {item.titulo}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {item.ano} • {item.autor}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {item.vestibulares.map(vest => (
                    <span key={vest} className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{vest}</span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {item.tags.map(tag => (
                  <span key={tag} className="badge badge-dark" style={{ fontSize: '0.6rem' }}>{tag}</span>
                ))}
              </div>

              {/* Toggle switch for Summary vs Deep Analysis */}
              <div style={{ alignSelf: 'flex-start', margin: '4px 0' }} className="toggle-switch">
                <div 
                  onClick={() => toggleAnalysisMode(item.id, 'resumo')}
                  className={`toggle-option ${mode === 'resumo' ? 'active' : ''}`}
                >
                  Resumo Rápido
                </div>
                <div 
                  onClick={() => toggleAnalysisMode(item.id, 'profunda')}
                  className={`toggle-option ${mode === 'profunda' ? 'active' : ''}`}
                >
                  Análise Profunda
                </div>
              </div>

              {/* Body Content based on active mode */}
              <div style={{ 
                backgroundColor: 'var(--bg-primary)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                padding: '16px',
                minHeight: '120px',
                fontSize: '0.88rem',
                lineHeight: '1.6'
              }}>
                {mode === 'resumo' ? (
                  <p className="font-body" style={{ color: 'var(--text-secondary)' }}>
                    {item.resumo}
                  </p>
                ) : (
                  <div className="font-body" style={{ color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--secondary)' }}>
                      <Sparkles size={12} />
                      <strong className="font-mono" style={{ fontSize: '0.7rem' }}>CONEXÕES SOCIOLÓGICAS:</strong>
                    </div>
                    {item.analise}
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '8px' }}>
                <button 
                  onClick={() => toggleCitation(item.id)}
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.75rem' }}
                >
                  <Quote size={12} />
                  Ver Citação Pronta
                </button>
              </div>

              {/* Expanded citation text */}
              {expandedCitationId === item.id && (
                <div className="fade-in" style={{ 
                  backgroundColor: 'rgba(232, 93, 58, 0.05)', 
                  border: '1px solid rgba(232, 93, 58, 0.15)', 
                  padding: '16px', 
                  borderRadius: '6px',
                  marginTop: '8px'
                }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.5' }} className="font-body">
                    "{item.citacao}"
                  </p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(item.citacao);
                      alert("Argumentação pronta copiada!");
                    }}
                    className="btn btn-accent"
                    style={{ marginTop: '10px', padding: '4px 10px', fontSize: '0.65rem' }}
                  >
                    <Copy size={10} /> Copiar Trecho
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RepertorioGeral;
