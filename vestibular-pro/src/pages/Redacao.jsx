import React, { useState, useContext } from 'react';
import { VestibularContext } from '../context/VestibularContext';
import { PenTool, Send, History, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const Redacao = () => {
  const { redacoes, submeterRedacao } = useContext(VestibularContext);

  const temasDisponiveis = [
    {
      id: 1,
      titulo: "O avanço da inteligência artificial generativa e as transformações do mercado de trabalho juvenil no Brasil",
      tipo: "ENEM/INSPER",
      repertorios: ["The News (Notícia sobre IA)", "1984 (George Orwell)", "Modernidade Líquida (Zygmunt Bauman)"]
    },
    {
      id: 2,
      titulo: "Caminhos para combater a desigualdade habitacional nas metrópoles brasileiras",
      tipo: "FUVEST/ENEM",
      repertorios: ["Quarto de Despejo (Carolina Maria de Jesus)", "Milton Santos (Cidadania Incompleta)", "Que Horas Ela Volta? (Filme)"]
    }
  ];

  const [selectedTemaIdx, setSelectedTemaIdx] = useState(0);
  const [textoRedacao, setTextoRedacao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correcaoRecente, setCorrecaoRecente] = useState(null);

  const activeTema = temasDisponiveis[selectedTemaIdx];

  const handleSubmeter = () => {
    if (textoRedacao.trim().split(/\s+/).length < 80) {
      alert("Sua redação precisa ter no mínimo 80 palavras para uma correção estruturada.");
      return;
    }

    setIsSubmitting(true);

    // Simulate Claude 3.5 Sonnet processing time
    setTimeout(() => {
      const novaCorrecao = submeterRedacao(activeTema.titulo, textoRedacao);
      setCorrecaoRecente(novaCorrecao);
      setIsSubmitting(false);
      setTextoRedacao('');
    }, 2500);
  };

  const getWordCount = () => {
    if (!textoRedacao.trim()) return 0;
    return textoRedacao.trim().split(/\s+/).length;
  };

  const getLineCount = () => {
    if (!textoRedacao) return 0;
    return Math.max(1, textoRedacao.split('\n').length);
  };

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '40px' }}>
        <h1 className="font-title section-title">Laboratório de Redação</h1>
        <p className="section-subtitle">Envie sua redação e receba uma correção detalhada via Claude 3.5 Sonnet.</p>
      </header>

      {/* Loading overlay */}
      {isSubmitting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px'
        }}>
          <div className="typing-indicator" style={{ transform: 'scale(1.5)' }}>
            <div className="typing-dot" style={{ backgroundColor: 'var(--primary)' }} />
            <div className="typing-dot" style={{ backgroundColor: 'var(--secondary)' }} />
            <div className="typing-dot" style={{ backgroundColor: 'var(--info)' }} />
          </div>
          <h3 className="font-title" style={{ fontSize: '1.25rem' }}>Claude 3.5 Sonnet está avaliando seu texto...</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Analisando competências normativas, repertório mobilizado e argumentação lógica.</p>
        </div>
      )}

      {/* Main Grid: Writer vs History */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', alignItems: 'start' }}>
        {/* Editor Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {correcaoRecente ? (
            /* Result Panel */
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="font-title" style={{ fontSize: '1.4rem', color: 'var(--success)' }}>Redação Corrigida!</h2>
                <span className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--success)' }}>
                  {correcaoRecente.notaTotal} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ 1000</span>
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong>Tema:</strong> {correcaoRecente.tema}
              </div>

              {/* Competencies breakdown */}
              <div>
                <h3 className="font-title" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Notas por Competência (ENEM)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: "Comp 1: Domínio da norma culta", val: correcaoRecente.competencias.comp1 },
                    { label: "Comp 2: Compreensão da proposta", val: correcaoRecente.competencias.comp2 },
                    { label: "Comp 3: Seleção e organização de argumentos", val: correcaoRecente.competencias.comp3 },
                    { label: "Comp 4: Coesão e coerência", val: correcaoRecente.competencias.comp4 },
                    { label: "Comp 5: Proposta de intervenção", val: correcaoRecente.competencias.comp5 }
                  ].map((comp, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{comp.label}</span>
                        <span className="font-mono" style={{ fontWeight: 600 }}>{comp.val} / 200</span>
                      </div>
                      <div className="progress-container" style={{ height: '4px' }}>
                        <div className="progress-fill" style={{ width: `${(comp.val / 200) * 100}%`, backgroundColor: 'var(--primary)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Claude Feedback Comments */}
              <div style={{ backgroundColor: 'rgba(232, 93, 58, 0.05)', border: '1px solid rgba(232, 93, 58, 0.2)', padding: '20px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Sparkles size={16} color="var(--primary)" />
                  <h4 className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>PARECER DA TUTORA CLAUDE</h4>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }} className="font-body">
                  {correcaoRecente.comentarios}
                </p>
              </div>

              <button onClick={() => setCorrecaoRecente(null)} className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
                Escrever Nova Redação
              </button>
            </div>
          ) : (
            /* Writing Panel */
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Selecione o Tema da Semana:</label>
                <select 
                  value={selectedTemaIdx} 
                  onChange={(e) => setSelectedTemaIdx(parseInt(e.target.value))}
                  style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '10px 14px', borderRadius: '6px', fontSize: '0.9rem' }}
                >
                  {temasDisponiveis.map((tema, idx) => (
                    <option key={tema.id} value={idx}>{tema.tipo} - {tema.titulo.substring(0, 70)}...</option>
                  ))}
                </select>
              </div>

              <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <strong>Tema Completo:</strong> {activeTema.titulo}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Folha de Redação:</label>
                  <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    {getWordCount()} palavras | {getLineCount()} / 30 linhas
                  </div>
                </div>
                <textarea
                  value={textoRedacao}
                  onChange={(e) => setTextoRedacao(e.target.value)}
                  placeholder="Inicie sua redação aqui. Mobilize citações literárias, filósofos e referências históricas para enriquecer sua pontuação nas competências..."
                  style={{
                    width: '100%',
                    height: '420px',
                    backgroundColor: '#0a0a0c',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    padding: '20px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                    lineHeight: '1.8',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Repertory suggestions */}
              <div style={{ backgroundColor: 'var(--bg-panel-hover)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Sparkles size={14} color="var(--secondary)" />
                  Repertórios sugeridos para esse tema:
                </h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {activeTema.repertorios.map(rep => (
                    <span key={rep} className="badge badge-secondary" style={{ textTransform: 'none', fontSize: '0.65rem' }}>{rep}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mínimo 80 palavras recomendadas.</span>
                <button 
                  onClick={handleSubmeter} 
                  disabled={textoRedacao.trim().length === 0}
                  className="btn btn-primary"
                >
                  <Send size={14} />
                  Enviar para Correção Claude
                </button>
              </div>
            </div>
          )}
        </div>

        {/* History Area */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="var(--primary)" />
            <h2 className="font-title" style={{ fontSize: '1.25rem' }}>Histórico de Notas</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {redacoes.map(red => (
              <div key={red.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div style={{ maxWidth: '80%' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {red.tema}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Enviada em {red.data}</span>
                  </div>
                  <span className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--success)' }}>
                    {red.notaTotal}
                  </span>
                </div>
              </div>
            ))}
            {redacoes.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center' }}>Nenhuma redação corrigida anteriormente.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Redacao;
