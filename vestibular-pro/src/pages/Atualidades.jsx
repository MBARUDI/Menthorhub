import React, { useState } from 'react';
import { initialNews } from '../data/vestibularDB';
import { Share2, BookOpen, ExternalLink, Calendar } from 'lucide-react';

const Atualidades = () => {
  const [selectedSource, setSelectedSource] = useState('Todos');
  const [expandedCitationId, setExpandedCitationId] = useState(null);

  const fontes = ['Todos', 'BBC Brasil', 'CNN Brasil', 'The News', 'El País Brasil'];

  const filteredNews = initialNews.filter(item => 
    selectedSource === 'Todos' || item.fonte === selectedSource
  );

  const getSourceColor = (fonte) => {
    switch(fonte) {
      case 'BBC Brasil': return '#ff3b30';
      case 'CNN Brasil': return '#e60000';
      case 'The News': return '#007aff';
      case 'El País Brasil': return '#34c759';
      default: return 'var(--primary)';
    }
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
        <h1 className="font-title section-title">Atualidades & Foco Vestibular</h1>
        <p className="section-subtitle">
          Notícias diárias conectadas diretamente ao edital de humanas das principais provas.
        </p>
      </header>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {fontes.map(fonte => (
          <button
            key={fonte}
            onClick={() => setSelectedSource(fonte)}
            className={`btn ${selectedSource === fonte ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              padding: '6px 16px', 
              fontSize: '0.7rem', 
              borderRadius: '20px' 
            }}
          >
            {fonte}
          </button>
        ))}
      </div>

      {/* News Feed Grid */}
      <div className="grid-2">
        {filteredNews.map(item => (
          <div key={item.id} className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span 
                  className="badge" 
                  style={{ 
                    backgroundColor: 'rgba(0,0,0,0.1)', 
                    color: getSourceColor(item.fonte),
                    borderColor: getSourceColor(item.fonte)
                  }}
                >
                  {item.fonte}
                </span>
                <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{item.tempo}</span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {item.vestibulares.map(vest => (
                  <span key={vest} className="badge badge-dark" style={{ fontSize: '0.6rem' }}>{vest}</span>
                ))}
              </div>
            </div>

            <h3 className="font-title" style={{ fontSize: '1.25rem', lineHeight: '1.4', fontWeight: 700 }}>
              {item.titulo}
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }} className="font-body">
              {item.resumo}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '4px 0' }}>
              {item.tags.map(tag => (
                <span key={tag} className="badge badge-info" style={{ textTransform: 'none', fontSize: '0.65rem' }}>{tag}</span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
              <button 
                onClick={() => toggleCitation(item.id)}
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '8px', fontSize: '0.75rem' }}
              >
                <BookOpen size={12} />
                Como usar na Redação
              </button>
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary" 
                style={{ padding: '8px 12px', textDecoration: 'none' }}
              >
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Citation dropdown card */}
            {expandedCitationId === item.id && (
              <div className="fade-in" style={{ backgroundColor: 'rgba(240, 165, 0, 0.05)', border: '1px solid rgba(240, 165, 0, 0.15)', padding: '16px', borderRadius: '6px', marginTop: '8px' }}>
                <h4 className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Share2 size={12} />
                  SUGESTÃO DE CITAÇÃO PRONTA (COPIAR)
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', fontStyle: 'italic' }} className="font-body">
                  "{item.citacao}"
                </p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(item.citacao);
                    alert("Citação copiada para a área de transferência!");
                  }}
                  className="btn btn-accent"
                  style={{ marginTop: '12px', padding: '6px 12px', fontSize: '0.65rem', textTransform: 'uppercase' }}
                >
                  Copiar Citação
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Atualidades;
