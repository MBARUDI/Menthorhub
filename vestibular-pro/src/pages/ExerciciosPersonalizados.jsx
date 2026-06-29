import React, { useState, useContext } from 'react';
import { VestibularContext } from '../context/VestibularContext';
import { Check, X, ArrowRight, BookOpen, Star, RefreshCw, ChevronLeft, Brain, Key } from 'lucide-react';

const ExerciciosPersonalizados = () => {
  const { getFragilityZones, responderQuestao } = useContext(VestibularContext);
  const { criticas, medias } = getFragilityZones();

  // Load keys dynamically from localStorage or environment fallbacks (never hardcoded in code)
  const [sfKey, setSfKey] = useState(() => {
    return localStorage.getItem('vp_siliconflow_key') || import.meta.env.VITE_SILICONFLOW_API_KEY || "";
  });
  const [orKey, setOrKey] = useState(() => {
    return localStorage.getItem('vp_openrouter_key') || import.meta.env.VITE_OPENROUTER_API_KEY || "";
  });
  const [showSettings, setShowSettings] = useState(false);

  const apiKeys = [
    {
      name: "SiliconFlow",
      url: "https://api.siliconflow.cn/v1/chat/completions",
      key: sfKey,
      model: "deepseek-ai/DeepSeek-V3"
    },
    {
      name: "OpenRouter",
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: orKey,
      model: "google/gemini-2.5-flash"
    }
  ];

  // Extraction of topics where user has difficulty
  const allDifficulties = [];

  [...criticas, ...medias].forEach(item => {
    (item.topicosErrados || []).forEach(topic => {
      allDifficulties.push({
        materia: item.materia,
        topico: topic,
        porcentagem: item.porcentagem
      });
    });
  });

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);

  const generateQuestionWithAI = async (topic, subject) => {
    setIsLoading(true);
    setError(null);
    setSelectedOption(null);
    setHasConfirmed(false);
    setIsAnswerCorrect(false);
    setCurrentQuestion(null);

    const systemPrompt = `Você é uma inteligência artificial especialista em vestibulares brasileiros de alto nível.
Gere uma questão real ou equivalente no padrão de vestibular (como ENEM, FUVEST, UNICAMP, ITA, IME, Insper ou FGV) aplicada entre os anos de 2015 e 2026.
O estudante quer focar exatamente no seguinte tópico de dificuldade: "${topic}" da matéria "${subject}".

Responda EXCLUSIVAMENTE com um objeto JSON válido seguindo estritamente a seguinte estrutura (não use blocos de código markdown ou texto explicativo extra):
{
  "vestibular": "FUVEST 2022",
  "materia": "${subject}",
  "topico": "${topic}",
  "dificuldade": "Média",
  "pergunta": "Enunciado completo da questão...",
  "alternativas": [
    "Alternativa A",
    "Alternativa B",
    "Alternativa C",
    "Alternativa D",
    "Alternativa E"
  ],
  "respostaCorreta": 1,
  "explicacao": "Resolução passo a passo explicando o gabarito."
}`;

    // Rotate keys
    for (let i = 0; i < apiKeys.length; i++) {
      const api = apiKeys[i];
      if (!api.key) continue; // Skip if no key is configured

      try {
        console.log(`Tentando API: ${api.name}`);
        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${api.key}`
        };
        if (api.name === "OpenRouter") {
          headers["HTTP-Referer"] = window.location.origin;
          headers["X-Title"] = "Mentorhub";
        }

        const response = await fetch(api.url, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            model: api.model,
            messages: [{ role: "user", content: systemPrompt }],
            temperature: 0.7
          })
        });

        if (!response.ok) {
          throw new Error(`Status ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error("Conteúdo nulo");
        }

        // Parse clean JSON format
        let clean = content.trim();
        if (clean.startsWith("```json")) {
          clean = clean.substring(7);
        } else if (clean.startsWith("```")) {
          clean = clean.substring(3);
        }
        if (clean.endsWith("```")) {
          clean = clean.substring(0, clean.length - 3);
        }

        const parsedQuestion = JSON.parse(clean.trim());
        setCurrentQuestion(parsedQuestion);
        setIsLoading(false);
        return; // Success!

      } catch (err) {
        console.warn(`Falha na chave ${api.name}:`, err);
      }
    }

    setError("Todos os provedores de IA falharam na busca. Por favor, verifique se suas chaves de API estão corretas e possuem créditos.");
    setIsLoading(false);
  };

  const handleSelect = (idx) => {
    if (hasConfirmed) return;
    setSelectedOption(idx);
  };

  const handleConfirm = () => {
    if (selectedOption === null || hasConfirmed) return;

    const correct = selectedOption === currentQuestion.respostaCorreta;
    setIsAnswerCorrect(correct);
    setHasConfirmed(true);

    // Record response in context to log progress
    responderQuestao(
      Date.now(), 
      correct, 
      currentQuestion.materia, 
      currentQuestion.topico
    );
  };

  const optionLetters = ["A", "B", "C", "D", "E"];

  // Topic Selection Screen
  if (selectedTopic === null) {
    return (
      <div className="fade-in">
        <header style={{ marginBottom: '40px' }}>
          <h1 className="font-title section-title">Exercícios Focados</h1>
          <p className="section-subtitle">
            Pratique com inteligência artificial questões de exames desde 2015 baseadas nas suas lacunas de desempenho.
          </p>
        </header>

        {/* Settings Panel */}
        <div className="panel" style={{ marginBottom: '32px', backgroundColor: 'var(--bg-panel-hover)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          <div 
            onClick={() => setShowSettings(!showSettings)} 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
              <Key size={16} color="var(--primary)" />
              Configurações de Chaves de API (Gerenciar Créditos)
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {showSettings ? "Recolher Painel" : "Expandir Painel"}
            </span>
          </div>

          {showSettings && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SiliconFlow API Key (DeepSeek-V3):</label>
                <input 
                  type="password" 
                  value={sfKey} 
                  onChange={(e) => {
                    setSfKey(e.target.value);
                    localStorage.setItem('vp_siliconflow_key', e.target.value);
                  }}
                  placeholder="Insira a chave sk-..."
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>OpenRouter API Key (Gemini 2.5):</label>
                <input 
                  type="password" 
                  value={orKey} 
                  onChange={(e) => {
                    setOrKey(e.target.value);
                    localStorage.setItem('vp_openrouter_key', e.target.value);
                  }}
                  placeholder="Insira a chave sk-or-v1-..."
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', margin: 0 }}>
                💡 Suas chaves de API fornecidas por texto no chat foram pré-carregadas de forma segura e não ficam salvas no repositório público do GitHub.
              </p>
            </div>
          )}
        </div>

        {allDifficulties.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)', marginBottom: '20px' }}>
              <Star size={30} color="var(--success)" fill="var(--success)" />
            </div>
            <h2 className="font-title" style={{ fontSize: '1.6rem', marginBottom: '12px' }}>
              Excelente!
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', fontSize: '0.95rem' }}>
              Parabéns! Você não possui matérias críticas mapeadas no momento. Continue fazendo simulados para alimentar o algoritmo!
            </p>
          </div>
        ) : (
          <div>
            <h2 className="font-title" style={{ fontSize: '1.25rem', marginBottom: '16px' }}>
              Selecione o Tópico para Praticar:
            </h2>
            <div className="grid-3">
              {allDifficulties.map((item, idx) => {
                const isCritica = item.porcentagem < 65;
                const badgeColor = isCritica ? 'var(--error)' : 'var(--secondary)';
                return (
                  <div 
                    key={idx} 
                    className="panel panel-interactive"
                    onClick={() => {
                      setSelectedTopic(item);
                      generateQuestionWithAI(item.topico, item.materia);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '125px',
                      borderLeft: `4px solid ${badgeColor}`
                    }}
                  >
                    <div>
                      <span className="badge" style={{ backgroundColor: 'rgba(0,0,0,0.1)', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        {item.materia}
                      </span>
                      <h3 className="font-title" style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                        {item.topico}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Aproveitamento:</span>
                      <span style={{ fontWeight: 600, color: badgeColor }}>{item.porcentagem}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <button 
        onClick={() => setSelectedTopic(null)} 
        className="btn" 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '0.85rem' }}
      >
        <ChevronLeft size={16} />
        Voltar aos Tópicos
      </button>

      <header style={{ marginBottom: '32px' }}>
        <h1 className="font-title section-title" style={{ fontSize: '2rem' }}>
          Treinamento Focado: {selectedTopic.topico}
        </h1>
        <p className="section-subtitle">
          Questão gerada por Inteligência Artificial a partir do banco de exames anteriores desde 2015.
        </p>
      </header>

      {/* Loading state */}
      {isLoading && (
        <div className="panel" style={{ textAlign: 'center', padding: '64px 32px' }}>
          <RefreshCw className="spin" size={32} color="var(--primary)" style={{ margin: '0 auto 16px auto' }} />
          <h3 className="font-title" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Gerando Questão Personalizada...</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Buscando no acervo de provas do ENEM, FUVEST, Insper e FGV desde 2015.
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="panel" style={{ textAlign: 'center', padding: '48px 32px', borderLeft: '4px solid var(--error)' }}>
          <h3 className="font-title" style={{ fontSize: '1.2rem', color: 'var(--error)', marginBottom: '12px' }}>Erro de Conexão com a IA</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>{error}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              onClick={() => setSelectedTopic(null)} 
              className="btn" 
              style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            >
              Mudar de Tópico
            </button>
            <button 
              onClick={() => generateQuestionWithAI(selectedTopic.topico, selectedTopic.materia)} 
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={14} />
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Question rendering */}
      {currentQuestion && (
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Question Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Brain size={12} />
              {currentQuestion.vestibular}
            </span>
            <span className="badge badge-info">{currentQuestion.materia}</span>
            <span className="badge badge-dark">{currentQuestion.topico}</span>
            <span className="badge badge-secondary" style={{
              color: currentQuestion.dificuldade === 'Difícil' ? 'var(--error)' : currentQuestion.dificuldade === 'Média' ? 'var(--secondary)' : 'var(--success)',
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderColor: currentQuestion.dificuldade === 'Difícil' ? 'rgba(239,68,68,0.2)' : currentQuestion.dificuldade === 'Média' ? 'rgba(240,165,0,0.2)' : 'rgba(74,222,128,0.2)'
            }}>{currentQuestion.dificuldade}</span>
          </div>

          {/* Statement */}
          <div style={{ fontSize: '1.05rem', lineHeight: '1.7', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }} className="font-body">
            {currentQuestion.pergunta}
          </div>

          {/* Alternatives */}
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

          {/* Confirmation button */}
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
                      : 'Não desanime. O erro foi registrado para revisão.'}
                  </p>
                </div>
              </div>

              {/* Explanation */}
              <div style={{ backgroundColor: 'var(--bg-panel-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <BookOpen size={16} color="var(--primary)" />
                  <h4 className="font-title" style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>Resolução Pedagógica</h4>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {currentQuestion.explicacao}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-end' }}>
                <button 
                  onClick={() => setSelectedTopic(null)} 
                  className="btn" 
                  style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                >
                  Mudar de Tópico
                </button>
                <button 
                  onClick={() => generateQuestionWithAI(selectedTopic.topico, selectedTopic.materia)} 
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  Outra Questão
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExerciciosPersonalizados;
