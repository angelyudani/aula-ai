import React, { useState, useRef, useEffect } from 'react';

export interface FloatingChatBubbleProps {
  role?: 'student' | 'teacher';
  language?: 'es' | 'en' | 'pt';
  contextHint?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  isPrivacyAlert?: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const FloatingChatBubble: React.FC<FloatingChatBubbleProps> = ({
  role = 'student',
  language = 'es',
  contextHint = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text:
        role === 'teacher'
          ? 'Hola, profe. Puedo ayudarte a diseñar guías didácticas y dinámicas grupales sin exponer datos personales de tus alumnos.'
          : '¡Hola! Soy tu copiloto AULA AI. Pregúntame por qué fallaste un ejercicio, traduce lecturas (ES/EN/PT) o armemos tu horario de estudio.'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages([
      {
        id: `welcome-${role}`,
        sender: 'bot',
        text:
          role === 'teacher'
            ? 'Modo Docente activo: Pide guías didácticas para reforzar temas críticos del grupo. Recuerda usar códigos anónimos (ej. alum-demo-45).'
            : 'Modo Estudiante activo: Te explico el porqué de cada paso sin darte la respuesta directa, traduzco lecturas y organizo tu plan de estudio.'
      }
    ]);
  }, [role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const quickChips =
    role === 'teacher'
      ? [
          'Guía didáctica de Fracciones',
          'Dinámica grupal de 15 min',
          'Probar candado: expediente de Juan Pérez'
        ]
      : [
          '¿Por qué fallé este ejercicio?',
          'Armar mi horario de estudio',
          'Traducir lectura a Inglés y Portugués'
        ];

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `${Date.now()}-u`,
      sender: 'user',
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          role,
          language,
          context: contextHint
        })
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-b`,
          sender: 'bot',
          text: data.reply || 'No pude procesar la consulta en este momento.',
          isPrivacyAlert: Boolean(data.blocked)
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-err`,
          sender: 'bot',
          text:
            role === 'teacher'
              ? '📘 Guía rápida (modo offline): Divide la clase en bloques de 15 min usando material visual y códigos anónimos.'
              : '💡 Pista rápida (modo offline): Revisa paso a paso la regla del tema antes de operar. ¡Tú puedes!'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const accentColor = role === 'teacher' ? '#d97706' : '#4f46e5';

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      {isOpen && (
        <div
          style={{
            width: '350px',
            maxWidth: '90vw',
            height: '470px',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            borderRadius: '16px',
            border: `1px solid ${accentColor}`,
            boxShadow: '0 20px 35px rgba(0,0,0,0.45)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            marginBottom: '12px'
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: accentColor,
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: 700,
              fontSize: '14px'
            }}
          >
            <span>
              {role === 'teacher' ? '👩‍🏫 Copiloto Docente AI' : '🎓 Tutor Socrático AULA AI'}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '18px',
                cursor: 'pointer'
              }}
              aria-label="Cerrar chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: '12px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '13px',
              lineHeight: 1.45
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '9px 12px',
                  borderRadius: '12px',
                  whiteSpace: 'pre-line',
                  backgroundColor: m.isPrivacyAlert
                    ? '#7f1d1d'
                    : m.sender === 'user'
                    ? accentColor
                    : '#1e293b',
                  border: m.isPrivacyAlert ? '1px solid #ef4444' : 'none'
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Analizando consulta...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Chips */}
          <div
            style={{
              padding: '6px 10px',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              borderTop: '1px solid #1e293b'
            }}
          >
            {quickChips.map((chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: '11px',
                  padding: '4px 9px',
                  borderRadius: '999px',
                  border: `1px solid ${accentColor}`,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: '#e2e8f0',
                  cursor: 'pointer'
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            style={{
              display: 'flex',
              padding: '10px',
              gap: '6px',
              borderTop: '1px solid #1e293b',
              backgroundColor: '#020617'
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                role === 'teacher'
                  ? 'Pide una guía o dinámica...'
                  : 'Pregunta sobre tu ejercicio o horario...'
              }
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #334155',
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: accentColor,
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Enviar
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          float: 'right',
          padding: '13px 18px',
          borderRadius: '999px',
          border: 'none',
          backgroundColor: accentColor,
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '14px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span>{role === 'teacher' ? '👩‍🏫' : '💬'}</span>
        <span>{isOpen ? 'Cerrar' : role === 'teacher' ? 'Guía AI' : 'Tutor AI'}</span>
      </button>
    </div>
  );
};

export default FloatingChatBubble;