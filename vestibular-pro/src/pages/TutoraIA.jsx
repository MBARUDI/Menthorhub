import React, { useState, useEffect, useRef, useContext } from 'react';
import { VestibularContext } from '../context/VestibularContext';
import { Send, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';

const TutoraIA = () => {
  const { tutorChat, enviarMensagemTutor, getFragilityZones, simulados } = useContext(VestibularContext);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Automatically scroll to bottom when chat updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [tutorChat]);

  // Simulate typing animation timing
  useEffect(() => {
    // Count 'user' messages vs 'ai' messages. If user just sent a message, trigger typing state
    if (tutorChat.length > 0 && tutorChat[tutorChat.length - 1].sender === 'user') {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  }, [tutorChat]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    enviarMensagemTutor(inputText);
    setInputText('');
  };

  // Compile student data to show transparently in the tutor panel
  const zones = getFragilityZones();
  const criticasStr = zones.criticas.map(c => c.materia).join(', ') || 'Nenhuma';
  const mediasStr = zones.medias.map(m => m.materia).join(', ') || 'Nenhuma';
  const fortesStr = zones.fortes.map(f => f.materia).join(', ') || 'Nenhuma';
  
  const sim1 = simulados[0] || { acertos: 0, total: 0, pct: 0 };
  const sim2 = simulados[1] || { acertos: 0, total: 0, pct: 0 };

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 0.4fr', gap: '32px', height: 'calc(100vh - 120px)' }}>
      
      {/* Chat Area */}
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px 24px 16px 24px' }}>
        
        {/* Chat Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: '#4ade80', borderRadius: '50%' }} />
          <h2 className="font-title" style={{ fontSize: '1.25rem' }}>◉ Tutora IA</h2>
          <span className="badge badge-dark" style={{ fontSize: '0.6rem' }}>CLAUDE 3.5 SONNET</span>
        </div>

        {/* Messages list container */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {tutorChat.map(msg => (
            <div 
              key={msg.id} 
              className={`chat-message ${msg.sender === 'user' ? 'chat-message-user' : ''}`}
            >
              <div className={`chat-bubble ${msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                {msg.sender === 'ai' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)' }}>
                    <span>◉ TUTORA IA</span>
                  </div>
                )}
                <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {msg.text}
                </div>
                <div style={{ display: 'block', textAlign: 'right', fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="chat-message">
              <div className="chat-bubble chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px' }}>
                <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Digitando</span>
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Pergunte sobre República Oligárquica, redação ou tire uma dúvida de matemática..."
            className="input-field"
            style={{ borderRadius: '8px' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 24px', borderRadius: '8px' }}>
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Tutor context details pane */}
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--primary)" />
          <h3 className="font-title" style={{ fontSize: '1.15rem' }}>Instruções da IA</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>SYSTEM PROMPT EXECUTADO</span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '6px' }}>
              "Você é a Tutora IA da plataforma Vestibular Pro. Seu aluno é Luiggi, estudando para FUVEST, ENEM, FGV e INSPER... Seu foco é Direito/Economia."
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
            <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>MÉTRICAS DETECTADAS</span>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Simulado Recente</span>
              <span style={{ fontWeight: 600 }}>{sim1.acertos}/{sim1.total} ({sim1.pct.toFixed(1)}%)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Simulado Anterior</span>
              <span style={{ fontWeight: 600 }}>{sim2.acertos}/{sim2.total} ({sim2.pct.toFixed(1)}%)</span>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginTop: '6px' }}>
              <span style={{ color: 'var(--error)', fontWeight: 600, display: 'block', fontSize: '0.7rem', textTransform: 'uppercase' }}>🚨 Maiores Fragilidades</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{criticasStr}</span>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--secondary)', fontWeight: 600, display: 'block', fontSize: '0.7rem', textTransform: 'uppercase' }}>🟡 Pontos Médios</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{mediasStr}</span>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--success)', fontWeight: 600, display: 'block', fontSize: '0.7rem', textTransform: 'uppercase' }}>🟢 Pontos Fortes</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{fortesStr}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutoraIA;
