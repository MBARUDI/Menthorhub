import React, { useContext, useState } from 'react';
import { VestibularContext } from '../context/VestibularContext';
import { initialContentBlocks } from '../data/vestibularDB';
import { BookOpen, Headphones, Play, X, Compass, ExternalLink } from 'lucide-react';

const BlocosConteudo = () => {
  const { getSubjectAverages } = useContext(VestibularContext);
  const averages = getSubjectAverages();

  // Sort content blocks by user's fragility (lowest score first)
  const sortedBlocks = [...initialContentBlocks].sort((a, b) => {
    const avgA = averages[a.materia] !== undefined ? averages[a.materia] : 100;
    const avgB = averages[b.materia] !== undefined ? averages[b.materia] : 100;
    return avgA - avgB;
  });

  const [activePodcastBlock, setActivePodcastBlock] = useState(null);

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '40px' }}>
        <h1 className="font-title section-title">Blocos de Estudo</h1>
        <p className="section-subtitle">
          Material teórico priorizado automaticamente de acordo com as suas lacunas de desempenho.
        </p>
      </header>

      {/* NotebookLM Guide Modal */}
      {activePodcastBlock && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="panel" style={{ maxWidth: '600px', width: '100%', border: '1px solid var(--border-light)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <button 
              onClick={() => setActivePodcastBlock(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ backgroundColor: 'rgba(232, 93, 58, 0.15)', padding: '8px', borderRadius: '8px' }}>
                <Headphones size={24} color="var(--primary)" />
              </div>
              <div>
                <h3 className="font-title" style={{ fontSize: '1.25rem' }}>Integração NotebookLM: {activePodcastBlock.materia}</h3>
                <span className="badge badge-primary" style={{ marginTop: '4px' }}>Podcast de Estudo Automático</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
              <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '8px' }}>Resumo Teórico do Módulo:</p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }} className="font-body">
                {activePodcastBlock.descricao}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Compass size={14} color="var(--secondary)" />
                Como gerar o Podcast no NotebookLM:
              </h4>
              <ol style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Copie o texto do <strong>Resumo Teórico</strong> acima.</li>
                <li>Clique no botão abaixo para abrir a plataforma do <strong>NotebookLM</strong> da Google.</li>
                <li>Crie um novo caderno e cole o texto como uma fonte de documento.</li>
                <li>Na seção de Guia de Estudo, clique em <strong>Gerar Conversa de Áudio</strong> (Deep Dive).</li>
                <li>A IA gerará um podcast de rádio completo de 3-5 minutos debatendo esse tema em português!</li>
              </ol>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button onClick={() => setActivePodcastBlock(null)} className="btn btn-secondary">
                Fechar
              </button>
              <a 
                href={activePodcastBlock.podcastGuide.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
                style={{ textDecoration: 'none' }}
              >
                Abrir NotebookLM
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Blocks */}
      <div className="grid-3" style={{ marginBottom: '40px' }}>
        {sortedBlocks.map((block, idx) => {
          const score = averages[block.materia];
          let colorClass = "badge-success";
          if (block.prioridade.includes("Alta")) colorClass = "badge-error";
          if (block.prioridade.includes("Média")) colorClass = "badge-secondary";

          return (
            <div key={block.id} className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '360px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge ${colorClass}`}>{block.prioridade} Prioridade</span>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{block.leituraEstimada}</span>
                </div>

                <h3 className="font-title" style={{ fontSize: '1.35rem', marginTop: '8px' }}>{block.materia}</h3>
                
                <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                  Aproveitamento nos Simulados: <span style={{ color: score >= 80 ? 'var(--success)' : score >= 65 ? 'var(--secondary)' : 'var(--error)', fontWeight: 600 }}>{score !== undefined ? `${score}%` : 'Sem dados'}</span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '4px' }} className="font-body">
                  {block.descricao.substring(0, 140)}...
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                <div 
                  onClick={() => setActivePodcastBlock(block)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    backgroundColor: 'rgba(232, 93, 58, 0.06)', 
                    border: '1px dashed rgba(232, 93, 58, 0.25)', 
                    padding: '8px 12px', 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  className="panel-interactive"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Play size={12} color="var(--primary)" fill="var(--primary)" />
                    <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>OUVIR PODCAST IA</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>NotebookLM</span>
                </div>

                <button 
                  onClick={() => alert(`Você iniciou o estudo teórico do bloco de ${block.materia}. O resumo expandido e as fichas de exercícios associadas foram carregados no seu painel principal!`)} 
                  className="btn btn-secondary" 
                  style={{ width: '100%', padding: '8px' }}
                >
                  Estudar Agora
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Banner NotebookLM Fixo */}
      <div className="panel" style={{ 
        background: 'linear-gradient(135deg, rgba(232, 93, 58, 0.08) 0%, rgba(240, 165, 0, 0.05) 100%)', 
        border: '1px solid rgba(232, 93, 58, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        padding: '32px'
      }}>
        <div style={{ backgroundColor: 'rgba(232, 93, 58, 0.15)', padding: '16px', borderRadius: '50%', flexShrink: 0 }}>
          <Headphones size={32} color="var(--primary)" />
        </div>
        <div>
          <h3 className="font-title" style={{ fontSize: '1.3rem', marginBottom: '6px' }}>Ouça seus conteúdos em formato de Podcast</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '850px' }}>
            Integre seus blocos de estudo com o <strong>NotebookLM</strong> da Google. A plataforma converte resumos complexos em debates em áudio dinâmicos conduzidos por dois apresentadores virtuais. Clique em <strong>OUVIR PODCAST IA</strong> em qualquer card acima para acessar o guia de instruções personalizadas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlocosConteudo;
