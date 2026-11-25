import React, { useState, useEffect } from "react";

export interface TutorChatProps {
  questionPrompt: string;
  studentAnswer: string;
  errorPattern: string;
}

interface ChatMessage {
  id: string;
  sender: "tutor" | "student";
  level?: 1 | 2 | 3;
  text: string;
}

export const TutorChat: React.FC<TutorChatProps> = ({
  questionPrompt,
  studentAnswer,
  errorPattern,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(0);

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        sender: "tutor",
        text: "Estoy aquí para ayudarte a razonar el problema paso a paso. Pide una pista si te atoras.",
      },
    ]);
    setUnlockedLevel(0);
  }, [questionPrompt]);

  const requestHint = async (level: 1 | 2 | 3) => {
    if (loading) return;

    const labels: Record<1 | 2 | 3, string> = {
      1: "Dame una pista inicial",
      2: "Explícame el concepto",
      3: "Muéstrame un ejemplo similar",
    };

    setMessages((prev) => [
      ...prev,
      { id: `req-${Date.now()}`, sender: "student", text: labels[level] },
    ]);
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/tutor/hint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionPrompt,
          studentAnswer,
          errorPattern,
          hintLevel: level,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `res-${Date.now()}`,
          sender: "tutor",
          level: data.hintLevel,
          text: data.message,
        },
      ]);
      setUnlockedLevel((prev) => Math.max(prev, level));
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "tutor",
          text: "Revisa primero los datos clave del problema y avanza paso a paso sin apresurarte.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article
      className="glass-panel"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        padding: "1.15rem",
        borderRadius: "1rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
        <div>
          <span className="eyebrow muted-eyebrow" style={{ display: "block", marginBottom: "0.2rem" }}>
            TUTOR INTELIGENTE AULA AI
          </span>
          <h3 style={{ margin: 0, fontSize: "1rem" }}>Guía socrática paso a paso</h3>
        </div>
        <span className="session-pill" style={{ fontSize: "0.72rem", padding: "0.25rem 0.6rem" }}>
          <span className="live-dot" /> IA Activa
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          maxHeight: "230px",
          overflowY: "auto",
          padding: "0.65rem",
          borderRadius: "0.75rem",
          background: "rgba(124, 58, 237, 0.08)",
          border: "1px solid rgba(168, 85, 247, 0.2)",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.sender === "student" ? "flex-end" : "flex-start",
              maxWidth: "88%",
              padding: "0.6rem 0.85rem",
              borderRadius: "0.75rem",
              fontSize: "0.84rem",
              lineHeight: 1.45,
              background:
                msg.sender === "student"
                  ? "linear-gradient(135deg, #7c3aed, #a855f7)"
                  : "rgba(255, 255, 255, 0.06)",
              color: msg.sender === "student" ? "#ffffff" : "inherit",
              border: msg.sender === "tutor" ? "1px solid rgba(168, 85, 247, 0.22)" : "none",
            }}
          >
            {msg.level && (
              <span
                style={{
                  display: "block",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#c084fc",
                  marginBottom: "0.2rem",
                }}
              >
                Pista {msg.level}
              </span>
            )}
            <p style={{ margin: 0 }}>{msg.text}</p>
          </div>
        ))}
        {loading && (
          <div style={{ fontSize: "0.78rem", opacity: 0.75, padding: "0.3rem 0.5rem" }}>
            Analizando tu procedimiento...
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
        <span style={{ fontSize: "0.75rem", opacity: 0.75 }}>Elige el nivel de ayuda:</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.45rem" }}>
          <button
            type="button"
            onClick={() => requestHint(1)}
            disabled={loading}
            className="button button-quiet"
            style={{ padding: "0.5rem 0.45rem", fontSize: "0.75rem", justifyContent: "center" }}
          >
            1. Pista guía
          </button>
          <button
            type="button"
            onClick={() => requestHint(2)}
            disabled={loading || unlockedLevel < 1}
            className="button button-quiet"
            style={{ padding: "0.5rem 0.45rem", fontSize: "0.75rem", justifyContent: "center" }}
          >
            2. Concepto
          </button>
          <button
            type="button"
            onClick={() => requestHint(3)}
            disabled={loading || unlockedLevel < 2}
            className="button button-quiet"
            style={{ padding: "0.5rem 0.45rem", fontSize: "0.75rem", justifyContent: "center" }}
          >
            3. Ejemplo
          </button>
        </div>
      </div>
    </article>
  );
};