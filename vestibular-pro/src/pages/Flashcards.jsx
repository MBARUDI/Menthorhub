import React, { useState, useContext } from 'react';
import { VestibularContext } from '../context/VestibularContext';
import { Flame, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

const Flashcards = () => {
  const { flashcards, avaliarFlashcard } = useContext(VestibularContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const activeCard = flashcards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = (ratingValue) => {
    // 1: Não sabia (vermelho), 2: Quase (âmbar), 3: Sabia (verde)
    avaliarFlashcard(activeCard.id, ratingValue);
    setIsFlipped(false);
    
    // Go to next card
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Loop or trigger completion state
      setCurrentIndex(flashcards.length); // will trigger completion view
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const isCompleted = currentIndex >= flashcards.length;

  return (
    <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 className="font-title section-title">Cartões de Memorização</h1>
        <p className="section-subtitle">Repetição Espaçada Inteligente baseada nos seus erros e revisões.</p>
      </header>

      {isCompleted ? (
        <div className="panel" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)', marginBottom: '20px' }}>
            <CheckCircle2 size={30} color="var(--success)" />
          </div>
          <h2 className="font-title" style={{ fontSize: '1.6rem', marginBottom: '12px' }}>Meta Diária Batida!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>
            Você revisou todos os {flashcards.length} flashcards disponíveis para hoje. Novos cartões são criados automaticamente sempre que você erra questões nos testes ou simulados.
          </p>
          <button onClick={handleRestart} className="btn btn-primary">
            Revisar Novamente
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Card progress bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              <span>PROGRESSO DA REVISÃO</span>
              <span>{currentIndex + 1} / {flashcards.length} CARTÕES</span>
            </div>
            {/* Pill progress pills */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {flashcards.map((_, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    flex: 1, 
                    height: '6px', 
                    borderRadius: '3px',
                    backgroundColor: idx < currentIndex 
                      ? 'var(--success)' 
                      : idx === currentIndex 
                      ? 'var(--primary)' 
                      : 'var(--border-color)',
                    transition: 'all var(--transition-fast)'
                  }} 
                />
              ))}
            </div>
          </div>

          {/* 3D Flippable Card */}
          <div 
            onClick={handleFlip} 
            className={`flashcard-wrapper ${isFlipped ? 'flipped' : ''}`}
          >
            <div className="flashcard-inner">
              {/* Front side */}
              <div className="flashcard-front">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-primary">{activeCard.materia}</span>
                  <span className="badge badge-dark">{activeCard.topico}</span>
                </div>

                <div className="font-title" style={{ fontSize: '1.4rem', textAlign: 'center', margin: '20px 0', lineHeight: '1.5' }}>
                  {activeCard.pergunta}
                </div>

                <div className="font-mono" style={{ fontSize: '0.65rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  CLIQUE NO CARTÃO PARA REVELAR A RESPOSTA
                </div>
              </div>

              {/* Back side */}
              <div className="flashcard-back">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-success">Gabarito Pedagógico</span>
                  <span className="badge badge-dark">{activeCard.topico}</span>
                </div>

                <div className="font-body" style={{ fontSize: '0.92rem', overflowY: 'auto', margin: '20px 0', paddingRight: '4px', textAlign: 'left', lineHeight: '1.6' }}>
                  {activeCard.resposta}
                </div>

                <div className="font-mono" style={{ fontSize: '0.65rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  CLIQUE NOVAMENTE PARA VER A PERGUNTA
                </div>
              </div>
            </div>
          </div>

          {/* Rating Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            {isFlipped ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', textTransform: 'uppercase' }}>
                  Qual foi o seu nível de facilidade?
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRate(1); }} 
                    className="btn btn-secondary"
                    style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
                  >
                    😖 Não sabia
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRate(2); }} 
                    className="btn btn-secondary"
                    style={{ borderColor: 'rgba(240, 165, 0, 0.4)', color: 'var(--secondary)', backgroundColor: 'rgba(240, 165, 0, 0.05)' }}
                  >
                    🤔 Quase
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRate(3); }} 
                    className="btn btn-secondary"
                    style={{ borderColor: 'rgba(74, 222, 128, 0.4)', color: 'var(--success)', backgroundColor: 'rgba(74, 222, 128, 0.05)' }}
                  >
                    😊 Sabia
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={handleFlip} className="btn btn-primary" style={{ width: '220px' }}>
                <RefreshCw size={14} />
                Revelar Resposta
              </button>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            backgroundColor: 'rgba(240, 165, 0, 0.05)', 
            border: '1px solid rgba(240, 165, 0, 0.15)', 
            borderRadius: '8px', 
            padding: '16px',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.4'
          }}>
            <Sparkles size={20} color="var(--secondary)" style={{ flexShrink: 0 }} />
            <span>
              <strong>Geração Automática:</strong> Se você errar questões no banco de exercícios ou nos simulados, o sistema cria automaticamente um novo cartão de memorização personalizado para fixar o assunto.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
