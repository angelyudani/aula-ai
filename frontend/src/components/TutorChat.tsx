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
          text: "Revisa si los denominadores son iguales antes de operar. Si son distintos, busca un múltiplo común.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Tutor Inteligente AULA AI</h3>
          <p className="text-xs text-indigo-100">Guía paso a paso · Sin respuestas directas</p>
        </div>
        <span className="text-xs bg-indigo-500 px-2 py-1 rounded-full">Activo</span>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-80 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm ${
              msg.sender === "student"
                ? "ml-auto bg-indigo-600 text-white"
                : "mr-auto bg-white border border-slate-200 text-slate-800"
            }`}
          >
            {msg.level && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-1">
                Pista {msg.level}
              </span>
            )}
            <p className="leading-relaxed">{msg.text}</p>
          </div>
        ))}
        {loading && (
          <div className="mr-auto bg-white border border-slate-200 text-slate-500 rounded-lg px-3.5 py-2 text-xs animate-pulse">
            Analizando tu procedimiento...
          </div>
        )}
      </div>

      <div className="p-3 bg-white border-t border-slate-200 flex flex-col gap-2">
        <p className="text-xs text-slate-500 font-medium">Elige el nivel de ayuda:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => requestHint(1)}
            disabled={loading}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition disabled:opacity-50"
          >
            1. Pista guía
          </button>
          <button
            onClick={() => requestHint(2)}
            disabled={loading || unlockedLevel < 1}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition disabled:opacity-40"
          >
            2. Explicar concepto
          </button>
          <button
            onClick={() => requestHint(3)}
            disabled={loading || unlockedLevel < 2}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition disabled:opacity-40"
          >
            3. Ver ejemplo similar
          </button>
        </div>
      </div>
    </div>
  );
};