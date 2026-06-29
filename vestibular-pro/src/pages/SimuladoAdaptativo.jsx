import React, { useState, useEffect, useContext, useRef } from 'react';
import { VestibularContext } from '../context/VestibularContext';
import { initialQuestions } from '../data/vestibularDB';
import { Timer, Award, CheckCircle2, Sliders, AlertTriangle } from 'lucide-react';

const SimuladoAdaptativo = () => {
  const { addSimulado, simulados } = useContext(VestibularContext);

  const [isRunning, setIsRunning] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState('Média');
  const [selectedOption, setSelectedOption] = useState(null);
  
  // Timers
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [questionSeconds, setQuestionSeconds] = useState(0);
  
  const [answeredHistory, setAnsweredHistory] = useState([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);
  
  const [showReport, setShowReport] = useState(false);
  const [recemConcluido, setRecemConcluido] = useState(null);

  const totalTimerRef = useRef(null);
  const questionTimerRef = useRef(null);

  // Set up the next question depending on the active difficulty
  const selectQuestion = (difficulty, excludeIds) => {
    // Find questions with target difficulty not yet answered
    let candidates = initialQuestions.filter(q => q.dificuldade === difficulty && !excludeIds.includes(q.id));
    
    // Fallback if no matching difficulty question is left
    if (candidates.length === 0) {
      candidates = initialQuestions.filter(q => !excludeIds.includes(q.id));
    }
    
    if (candidates.length === 0) {
      // Complete fallback to any question
      candidates = initialQuestions;
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  };

  // Start the Simulator
  const handleStart = () => {
    setIsRunning(true);
    setCurrentIdx(0);
    setCurrentDifficulty('Média');
    setSelectedOption(null);
    setTotalSeconds(0);
    setQuestionSeconds(0);
    setAnsweredHistory([]);
    setShowReport(false);
    setRecemConcluido(null);
    
    const firstQ = selectQuestion('Média', []);
    setActiveQuestion(firstQ);
    setUsedQuestionIds([firstQ.id]);
  };

  // Timer side-effects
  useEffect(() => {
    if (isRunning && !showReport) {
      totalTimerRef.current = setInterval(() => {
        setTotalSeconds(prev => prev + 1);
      }, 1000);
      
      questionTimerRef.current = setInterval(() => {
        setQuestionSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => {
      clearInterval(totalTimerRef.current);
      clearInterval(questionTimerRef.current);
    };
  }, [isRunning, showReport]);

  // Answer Submission and Adaptive Progression
  const handleConfirmNext = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === activeQuestion.respostaCorreta;
    const timeSpent = questionSeconds;

    // Record response
    const record = {
      questionId: activeQuestion.id,
      materia: activeQuestion.materia,
      topico: activeQuestion.topico,
      difficulty: activeQuestion.dificuldade,
      isCorrect,
      timeSpent
    };

    const newHistory = [...answeredHistory, record];
    setAnsweredHistory(newHistory);

    // Adaptive difficulty logic:
    // If correct: Easy -> Medium -> Hard
    // If wrong: Hard -> Medium -> Easy
    let nextDifficulty = currentDifficulty;
    if (isCorrect) {
      if (currentDifficulty === 'Fácil') nextDifficulty = 'Média';
      else if (currentDifficulty === 'Média') nextDifficulty = 'Difícil';
    } else {
      if (currentDifficulty === 'Difícil') nextDifficulty = 'Média';
      else if (currentDifficulty === 'Média') nextDifficulty = 'Fácil';
    }

    const newExcluded = [...usedQuestionIds, activeQuestion.id];

    if (currentIdx < 4) { // Test length of 5 questions
      const nextQ = selectQuestion(nextDifficulty, newExcluded);
      setActiveQuestion(nextQ);
      setUsedQuestionIds([...newExcluded, nextQ.id]);
      setCurrentDifficulty(nextDifficulty);
      setSelectedOption(null);
      setQuestionSeconds(0);
      setCurrentIdx(prev => prev + 1);
    } else {
      // Finish simulator and generate report
      handleFinish(newHistory);
    }
  };

  const handleFinish = (finalHistory) => {
    setIsRunning(false);
    clearInterval(totalTimerRef.current);
    clearInterval(questionTimerRef.current);

    const correctCount = finalHistory.filter(h => h.isCorrect).length;
    const totalCount = finalHistory.length;
    const finalPct = (correctCount / totalCount) * 100;
    
    // Calculate average time
    const avgSec = totalSeconds / totalCount;
    const avgTimeStr = `${Math.floor(avgSec / 60)}m ${Math.round(avgSec % 60)}s`;

    // Dynamic subject performance generator based on answers
    // If user got correct, score 80-100. If incorrect, score 40-60.
    const desempenhoCalculado = {};
    const materias = ["História", "Geografia", "Filosofia/Sociologia", "Português", "Literatura", "Matemática", "Inglês"];
    
    materias.forEach(mat => {
      const respMat = finalHistory.find(h => h.materia === mat);
      if (respMat) {
        desempenhoCalculado[mat] = respMat.isCorrect ? 90 : 50;
      } else {
        // Average or realistic performance based on target profile
        // Math is typically lower for Luiggi, Literature/History higher
        if (mat === 'Matemática') desempenhoCalculado[mat] = 55;
        else if (mat === 'Inglês') desempenhoCalculado[mat] = 88;
        else if (mat === 'Português') desempenhoCalculado[mat] = 78;
        else desempenhoCalculado[mat] = 70;
      }
    });

    const simuladoId = Date.now();
    const nomeSimulado = `Simulado Adaptativo #${simulados.length + 1}`;

    const novoSimuladoObj = {
      nome: nomeSimulado,
      acertos: correctCount,
      total: totalCount,
      pct: finalPct,
      tempoMedio: avgTimeStr,
      desempenho: desempenhoCalculado
    };

    // Save in global state (re-populates Dashboard graphs automatically!)
    addSimulado(novoSimuladoObj);

    setRecemConcluido(novoSimuladoObj);
    setShowReport(true);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rest = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rest.toString().padStart(2, '0')}`;
  };

  const optionLetters = ["A", "B", "C", "D", "E"];

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 className="font-title section-title">Simulado Adaptativo</h1>
        <p className="section-subtitle">
          Prova dinâmica calibrada por algoritmo de proficiência. Questões aumentam de nível conforme seus acertos.
        </p>
      </header>

      {!isRunning && !showReport ? (
        /* Welcome Panel */
        <div className="panel" style={{ textAlign: 'center', padding: '48px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: 'rgba(232, 93, 58, 0.1)', padding: '16px', borderRadius: '50%' }}>
            <Sliders size={36} color="var(--primary)" />
          </div>
          <h2 className="font-title" style={{ fontSize: '1.6rem' }}>Pronto para iniciar?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '520px', lineHeight: '1.6' }}>
            Este simulado contém 5 questões rápidas selecionadas de exames reais (FUVEST, ENEM, FGV, INSPER). A dificuldade será adaptada dinamicamente com base nas suas respostas.
          </p>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', margin: '10px 0' }}>
            <span>⏱ Cronômetro Geral</span>
            <span>🧠 Algoritmo de Dificuldade</span>
          </div>
          <button onClick={handleStart} className="btn btn-primary" style={{ width: '220px' }}>
            Iniciar Prova
          </button>
        </div>
      ) : isRunning && activeQuestion ? (
        /* Test Panel */
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header timers */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              QUESTÃO {currentIdx + 1} DE 5 | DIFICULDADE ATUAL: 
              <span className="badge badge-secondary" style={{ marginLeft: '8px', color: currentDifficulty === 'Difícil' ? 'var(--error)' : 'var(--secondary)' }}>{currentDifficulty}</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Timer size={14} />
                <span className="font-mono">Questão: {formatTime(questionSeconds)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Timer size={14} color="var(--primary)" />
                <span className="font-mono" style={{ color: 'var(--primary)', fontWeight: 600 }}>Total: {formatTime(totalSeconds)}</span>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-primary">{activeQuestion.vestibular}</span>
            <span className="badge badge-info">{activeQuestion.materia}</span>
            <span className="badge badge-dark">{activeQuestion.topico}</span>
          </div>

          {/* Question Text */}
          <div className="font-body" style={{ fontSize: '1rem', lineHeight: '1.7' }}>
            {activeQuestion.pergunta}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeQuestion.alternativas.map((option, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedOption(idx)}
                className={`option-row ${selectedOption === idx ? 'selected' : ''}`}
                style={{ padding: '10px 16px', borderRadius: '8px' }}
              >
                <div className="option-circle" style={{ width: '30px', height: '30px', fontSize: '0.85rem' }}>
                  {optionLetters[idx]}
                </div>
                <span style={{ fontSize: '0.85rem' }}>{option}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={handleConfirmNext}
            disabled={selectedOption === null}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end', marginTop: '12px' }}
          >
            Confirmar e Prosseguir
          </button>
        </div>
      ) : (
        /* Report Panel */
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)', marginBottom: '16px' }}>
              <CheckCircle2 size={28} color="var(--success)" />
            </div>
            <h2 className="font-title" style={{ fontSize: '1.6rem' }}>Simulado Concluído!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
              Parabéns! Seus dados foram computados e suas estimativas do ENEM/FUVEST foram atualizadas no Dashboard.
            </p>
          </div>

          {/* Metrics Row */}
          <div className="grid-3" style={{ margin: '10px 0' }}>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>ACERTOS / TOTAL</span>
              <h3 className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary)', marginTop: '4px' }}>
                {recemConcluido?.acertos} / {recemConcluido?.total}
              </h3>
            </div>

            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>APROVEITAMENTO</span>
              <h3 className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--success)', marginTop: '4px' }}>
                {recemConcluido?.pct.toFixed(1)}%
              </h3>
            </div>

            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>TEMPO MÉDIO / QUESTÃO</span>
              <h3 className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--info)', marginTop: '4px' }}>
                {recemConcluido?.tempoMedio}
              </h3>
            </div>
          </div>

          {/* Breakdown per Question */}
          <div>
            <h4 className="font-title" style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Linha do Tempo Adaptativa</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {answeredHistory.map((hist, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  backgroundColor: 'var(--bg-panel-hover)', 
                  border: '1px solid var(--border-color)', 
                  padding: '12px 16px',
                  borderRadius: '6px'
                }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Q{idx + 1}</span>
                    <span style={{ fontSize: '0.85rem' }}>{hist.materia} ({hist.topico})</span>
                    <span className="badge badge-dark" style={{ fontSize: '0.6rem' }}>{hist.difficulty}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatTime(hist.timeSpent)}</span>
                    {hist.isCorrect ? (
                      <span className="badge badge-success">Acertou</span>
                    ) : (
                      <span className="badge badge-error">Errou</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleStart} className="btn btn-primary" style={{ alignSelf: 'center', marginTop: '12px' }}>
            Fazer Novo Simulado
          </button>
        </div>
      )}
    </div>
  );
};

export default SimuladoAdaptativo;
