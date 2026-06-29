import React, { useState, useContext } from 'react';
import { VestibularContext } from '../context/VestibularContext';
import { initialQuestions } from '../data/vestibularDB';
import { Check, X, Filter, BarChart3, RotateCcw } from 'lucide-react';

const ExerciciosGerais = () => {
  const { responderQuestao, questoesFeitasList, getFragilityZones } = useContext(VestibularContext);
  const { criticas, medias } = getFragilityZones();

  // Get difficulty subjects and topics (from criticas and medias)
  const difficultySubjects = [...criticas, ...medias].map(item => item.materia);
  const difficultyTopics = [...criticas, ...medias].reduce((acc, curr) => {
    return [...acc, ...(curr.topicosErrados || [])];
  }, []);

  const isFocused = (q) => {
    const subjectMatch = difficultySubjects.includes(q.materia);
    const topicMatch = difficultyTopics.some(topic => {
      const qTopic = q.topico.toLowerCase().trim();
      const diffTopic = topic.toLowerCase().trim();
      return qTopic.includes(diffTopic) || diffTopic.includes(qTopic);
    });
    return subjectMatch && topicMatch;
  };

  const [materiaFilter, setMateriaFilter] = useState('Todos');
  const [vestibularFilter, setVestibularFilter] = useState('Todos');
  const [dificuldadeFilter, setDificuldadeFilter] = useState('Todos');

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Filter logic
  const filteredQuestions = initialQuestions.filter(q => {
    const matchMateria = materiaFilter === 'Todos' || q.materia === materiaFilter;
    // For vestibular, check if filter is included in the string (e.g. "FUVEST" matches "FUVEST 2023")
    const matchVestibular = vestibularFilter === 'Todos' || q.vestibular.includes(vestibularFilter);
    const matchDificuldade = dificuldadeFilter === 'Todos' || q.dificuldade === dificuldadeFilter;
    const matchGeneral = !isFocused(q);
    return matchMateria && matchVestibular && matchDificuldade && matchGeneral;
  });

  const currentQuestion = filteredQuestions[currentQuestionIdx];

  const handleSelect = (idx) => {
    if (hasConfirmed) return;
    setSelectedOption(idx);
  };

  const handleConfirm = () => {
    if (selectedOption === null || hasConfirmed) return;
    const correct = selectedOption === currentQuestion.respostaCorreta;
    setIsCorrect(correct);
    setHasConfirmed(true);
    responderQuestao(currentQuestion.id, correct, currentQuestion.materia, currentQuestion.topico);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setHasConfirmed(false);
    setIsCorrect(false);
    setCurrentQuestionIdx(prev => prev + 1);
  };

  const resetFilterAndIndex = (filterSetter, value) => {
    filterSetter(value);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setHasConfirmed(false);
    setIsCorrect(false);
  };

  // Weekly evolution report stats calculated dynamically
  const totalGeraisResolvidas = questoesFeitasList.length;
  const acertosGerais = questoesFeitasList.filter(q => q.acertou).length;
  const pctAcertos = totalGeraisResolvidas > 0 
    ? Math.round((acertosGerais / totalGeraisResolvidas) * 100) 
    : 0;

  const optionLetters = ["A", "B", "C", "D", "E"];

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '40px' }}>
        <h1 className="font-title section-title">Banco Geral de Exercícios</h1>
        <p className="section-subtitle">Acesso ilimitado ao acervo de provas reais para treinamento livre.</p>
      </header>

      {/* Filter toolbar */}
      <div className="panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '32px', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginRight: '16px' }}>
          <Filter size={16} />
          <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Filtros</span>
        </div>

        {/* Materia */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>MATÉRIA</label>
          <select 
            value={materiaFilter} 
            onChange={(e) => resetFilterAndIndex(setMateriaFilter, e.target.value)}
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
          >
            <option value="Todos">Todas as Matérias</option>
            <option value="História">História</option>
            <option value="Geografia">Geografia</option>
            <option value="Filosofia/Sociologia">Filosofia & Sociologia</option>
            <option value="Português">Português</option>
            <option value="Literatura">Literatura</option>
            <option value="Matemática">Matemática</option>
            <option value="Inglês">Inglês</option>
          </select>
        </div>

        {/* Vestibular */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>VESTIBULAR</label>
          <select 
            value={vestibularFilter} 
            onChange={(e) => resetFilterAndIndex(setVestibularFilter, e.target.value)}
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
          >
            <option value="Todos">Todos os Vestibulares</option>
            <option value="FUVEST">FUVEST</option>
            <option value="ENEM">ENEM</option>
            <option value="FGV">FGV</option>
            <option value="INSPER">INSPER</option>
          </select>
        </div>

        {/* Dificuldade */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>DIFICULDADE</label>
          <select 
            value={dificuldadeFilter} 
            onChange={(e) => resetFilterAndIndex(setDificuldadeFilter, e.target.value)}
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
          >
            <option value="Todos">Todas as Dificuldades</option>
            <option value="Fácil">Fácil</option>
            <option value="Média">Média</option>
            <option value="Difícil">Difícil</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '32px', alignItems: 'start' }}>
        {/* Question Area */}
        <div className="panel" style={{ minHeight: '400px' }}>
          {currentQuestion ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className="badge badge-primary">{currentQuestion.vestibular}</span>
                  <span className="badge badge-info">{currentQuestion.materia}</span>
                  <span className="badge badge-dark">{currentQuestion.topico}</span>
                </div>
                <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {currentQuestionIdx + 1} de {filteredQuestions.length} filtradas
                </span>
              </div>

              <div className="font-body" style={{ fontSize: '1rem', lineHeight: '1.6', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                {currentQuestion.pergunta}
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                      style={{ padding: '10px 16px', borderRadius: '8px' }}
                    >
                      <div className="option-circle" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
                        {optionLetters[idx]}
                      </div>
                      <span style={{ fontSize: '0.85rem' }}>{option}</span>
                    </div>
                  );
                })}
              </div>

              {/* Confirmation or explanation block */}
              {!hasConfirmed ? (
                <button 
                  onClick={handleConfirm}
                  disabled={selectedOption === null}
                  className="btn btn-primary"
                  style={{ alignSelf: 'flex-end', marginTop: '12px' }}
                >
                  Confirmar
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: isCorrect ? 'var(--success)' : 'var(--error)' }}>
                    {isCorrect ? <Check size={16} /> : <X size={16} />}
                    <span className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      {isCorrect ? 'RESPOSTA CORRETA (+15 XP)' : 'RESPOSTA INCORRETA (+5 XP)'}
                    </span>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-panel-hover)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    <strong>Resolução:</strong> {currentQuestion.explicacao}
                  </div>

                  {currentQuestionIdx < filteredQuestions.length - 1 ? (
                    <button onClick={handleNext} className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
                      Próxima Questão
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <span className="font-mono" style={{ fontSize: '0.75rem', alignSelf: 'center', color: 'var(--text-secondary)' }}>Fim das questões com esses filtros.</span>
                      <button onClick={() => setCurrentQuestionIdx(0)} className="btn btn-secondary">
                        <RotateCcw size={12} /> Reiniciar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '16px', color: 'var(--text-secondary)' }}>
              <span>Nenhuma questão atende aos filtros selecionados.</span>
              <button 
                onClick={() => {
                  setMateriaFilter('Todos');
                  setVestabularFilter('Todos');
                  setDificuldadeFilter('Todos');
                  setCurrentQuestionIdx(0);
                }} 
                className="btn btn-secondary"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>

        {/* Weekly Evolutions Panel */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="var(--primary)" />
            <h2 className="font-title" style={{ fontSize: '1.2rem' }}>Relatório Semanal</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Questões resolvidas</span>
              <span className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{totalGeraisResolvidas}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Acertos gerais</span>
              <span className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--success)' }}>{acertosGerais}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Aproveitamento geral</span>
              <span className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>{pctAcertos}%</span>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(96, 165, 250, 0.05)', border: '1px solid rgba(96, 165, 250, 0.15)', borderRadius: '6px', padding: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            💡 <strong>Atualização adaptativa:</strong> Toda semana a plataforma prioriza no topo do banco questões nos tópicos em que seu aproveitamento geral nos simulados é menor, ajudando no foco preventivo.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciciosGerais;
