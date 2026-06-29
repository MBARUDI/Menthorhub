import React, { useState, useContext } from 'react';
import { VestibularContext } from '../context/VestibularContext';
import { initialQuestions } from '../data/vestibularDB';
import { Check, X, AlertTriangle, ArrowRight, BookOpen, Star } from 'lucide-react';

const ExerciciosPersonalizados = () => {
  const { getFragilityZones, responderQuestao } = useContext(VestibularContext);
  const { criticas, medias } = getFragilityZones();

  // Get difficulty subjects and topics (from criticas and medias)
  const difficultySubjects = [...criticas, ...medias].map(item => item.materia);
  const difficultyTopics = [...criticas, ...medias].reduce((acc, curr) => {
    return [...acc, ...(curr.topicosErrados || [])];
  }, []);

  // Filter questions: topic or subject matches difficulty zones
  const targetedQuestions = initialQuestions.filter(q => {
    const subjectMatch = difficultySubjects.includes(q.materia);
    const topicMatch = difficultyTopics.some(topic => {
      const qTopic = q.topico.toLowerCase().trim();
      const diffTopic = topic.toLowerCase().trim();
      return qTopic.includes(diffTopic) || diffTopic.includes(qTopic);
    });
    return subjectMatch && topicMatch;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);

  const currentQuestion = targetedQuestions[currentIndex];

  const handleSelect = (idx) => {
    if (hasConfirmed) return;
    setSelectedOption(idx);
  };

  const handleConfirm = () => {
    if (selectedOption === null || hasConfirmed) return;

    const correct = selectedOption === currentQuestion.respostaCorreta;
    setIsAnswerCorrect(correct);
    setHasConfirmed(true);

    // Track response in global context
    responderQuestao(
      currentQuestion.id, 
      correct, 
      currentQuestion.materia, 
      currentQuestion.topico
    );
  };

  const handleNext = () => {
    setSelectedOption(null);
    setHasConfirmed(false);
    setIsAnswerCorrect(false);
    setCurrentIndex(prev => prev + 1);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasConfirmed(false);
    setIsAnswerCorrect(false);
  };

  if (targetedQuestions.length === 0 || currentIndex >= targetedQuestions.length) {
    return (
      <div className="fade-in">
        <header style={{ marginBottom: '40px' }}>
          <h1 className="font-title section-title">Exercícios Focados</h1>
          <p className="section-subtitle">Aprimoramento direcionado nas suas zonas de fragilidade.</p>
        </header>
        <div className="panel" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)', marginBottom: '20px' }}>
            <Star size={30} color="var(--success)" fill="var(--success)" />
          </div>
          <h2 className="font-title" style={{ fontSize: '1.6rem', marginBottom: '12px' }}>
            Excelente, Luiggi!
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 24px auto', fontSize: '0.95rem' }}>
            {criticalSubjects.length > 0 
              ? `Você concluiu todas as questões focadas em suas matérias críticas (${criticalSubjects.join(', ')}).` 
              : "Não há matérias críticas identificadas no momento. Continue fazendo simulados!"}
          </p>
          <button onClick={handleReset} className="btn btn-primary">
            Reiniciar Prática
          </button>
        </div>
      </div>
    );
  }

  const optionLetters = ["A", "B", "C", "D", "E"];

  return (
    <div className="fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="font-title section-title">Exercícios Focados</h1>
            <p className="section-subtitle">
              Treinamento focado nas suas maiores lacunas identificadas.
            </p>
          </div>
          <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px' }}>
            QUESTÃO {currentIndex + 1} DE {targetedQuestions.length}
          </div>
        </div>
      </header>

      <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Badges bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <span className="badge badge-primary">{currentQuestion.vestibular}</span>
          <span className="badge badge-info">{currentQuestion.materia}</span>
          <span className="badge badge-dark">{currentQuestion.topico}</span>
          <span className="badge badge-secondary" style={{
            color: currentQuestion.dificuldade === 'Difícil' ? 'var(--error)' : currentQuestion.dificuldade === 'Média' ? 'var(--secondary)' : 'var(--success)',
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderColor: currentQuestion.dificuldade === 'Difícil' ? 'rgba(239,68,68,0.2)' : currentQuestion.dificuldade === 'Média' ? 'rgba(240,165,0,0.2)' : 'rgba(74,222,128,0.2)'
          }}>{currentQuestion.dificuldade}</span>
        </div>

        {/* Question Statement */}
        <div style={{ fontSize: '1.05rem', lineHeight: '1.7', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }} className="font-body">
          {currentQuestion.pergunta}
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentQuestion.alternativas.map((option, idx) => {
            let stateClass = "";
            if (selectedOption === idx) stateClass = "selected";
            if (hasConfirmed) {
              if (idx === currentQuestion.respostaCorreta) {
                stateClass = "correct";
              } else if (selectedOption === idx) {
                stateClass = "wrong";
              }
            }

            return (
              <div 
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`option-row ${stateClass}`}
              >
                <div className="option-circle">
                  {optionLetters[idx]}
                </div>
                <div style={{ fontSize: '0.92rem', lineHeight: '1.5' }}>
                  {option}
                </div>
                {hasConfirmed && idx === currentQuestion.respostaCorreta && (
                  <Check size={18} color="var(--success)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                )}
                {hasConfirmed && selectedOption === idx && idx !== currentQuestion.respostaCorreta && (
                  <X size={18} color="var(--error)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {!hasConfirmed ? (
          <button 
            onClick={handleConfirm}
            disabled={selectedOption === null}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end', marginTop: '12px' }}
          >
            Confirmar Resposta
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px', 
              backgroundColor: isAnswerCorrect ? 'rgba(74, 222, 128, 0.05)' : 'rgba(239, 68, 68, 0.05)',
              border: `1px solid ${isAnswerCorrect ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
              padding: '16px',
              borderRadius: '8px'
            }}>
              {isAnswerCorrect ? (
                <div style={{ backgroundColor: 'var(--success-bg)', padding: '6px', borderRadius: '50%' }}>
                  <Check size={18} color="var(--success)" />
                </div>
              ) : (
                <div style={{ backgroundColor: 'var(--error-bg)', padding: '6px', borderRadius: '50%' }}>
                  <X size={18} color="var(--error)" />
                </div>
              )}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: isAnswerCorrect ? 'var(--success)' : 'var(--error)', marginBottom: '4px' }}>
                  {isAnswerCorrect ? 'Você acertou! (+15 XP)' : 'Resposta incorreta (+5 XP)'}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {isAnswerCorrect 
                    ? 'Excelente análise. Continue consolidando os tópicos correlacionados.' 
                    : 'Não desanime. O erro foi registrado e geramos um Flashcard específico para revisão espaçada.'}
                </p>
              </div>
            </div>

            {/* Explanation box */}
            <div style={{ backgroundColor: 'var(--bg-panel-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <BookOpen size={16} color="var(--primary)" />
                <h4 className="font-title" style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>Resolução Pedagógica</h4>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {currentQuestion.explicacao}
              </p>
            </div>

            <button 
              onClick={handleNext}
              className="btn btn-primary"
              style={{ alignSelf: 'flex-end' }}
            >
              Próxima Questão
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciciosPersonalizados;
