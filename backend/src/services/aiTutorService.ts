import * as dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";
import { getFallbackHint } from "../data/fallbackHints";

// Conecta con Google usando la clave oculta de .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface HintRequest {
  questionPrompt: string;
  studentAnswer: string;
  errorPattern: string;
  hintLevel: 1 | 2 | 3;
}

export interface HintResponse {
  hintLevel: 1 | 2 | 3;
  message: string;
  source: "ai" | "fallback";
}

// Instrucción dinámica según el botón de ayuda que presione el alumno
const LEVEL_RULES: Record<1 | 2 | 3, string> = {
  1: "NIVEL 1 (Pregunta guía): Haz una sola pregunta corta que ayude al estudiante a notar su error y pensar cuál es el primer paso correcto.",
  2: "NIVEL 2 (Concepto): Explica brevemente el concepto o procedimiento matemático que necesita aplicar, sin hacer las operaciones de su ejercicio.",
  3: "NIVEL 3 (Ejemplo análogo): Muestra un ejercicio parecido con NÚMEROS DIFERENTES completamente resuelto paso a paso, e invítalo a replicarlo en el suyo."
};

export async function generateTutorHint(req: HintRequest): Promise<HintResponse> {
  const { questionPrompt, studentAnswer, errorPattern, hintLevel } = req;

  // Si falta la clave en .env, activa el Plan B
  if (!process.env.GEMINI_API_KEY) {
    return {
      hintLevel,
      message: getFallbackHint(errorPattern, hintLevel),
      source: "fallback"
    };
  }

  // Reglas fijas de comportamiento del tutor
  const systemInstruction = `
Eres un tutor de matemáticas paciente y claro para estudiantes de secundaria en México (plataforma AULA AI).
REGLAS ESTRICTAS:
1. PROHIBIDO dar la respuesta final del ejercicio del estudiante ni hacer los cálculos de sus números específicos.
2. Responde en un máximo de 3 oraciones claras y directas.
3. NO uses formato LaTeX ni signos de dólar ($). Escribe fracciones como 1/2, 3/4, etc.
4. Cumple exactamente esta instrucción de nivel: ${LEVEL_RULES[hintLevel]}
`;

  const userPrompt = `
Ejercicio del estudiante: "${questionPrompt}"
Respuesta incorrecta del estudiante: "${studentAnswer}"
Patrón de error detectado: "${errorPattern}"
Genera únicamente la pista de nivel ${hintLevel}.
`;

  try {
    // Reloj de arena: si Gemini tarda más de 4 segundos, salta al Plan B
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("AI_TIMEOUT")), 4000)
    );

    const aiPromise = ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.4,
        maxOutputTokens: 200
      }
    });

    const response = await Promise.race([aiPromise, timeoutPromise]);
    const text = response.text?.trim();

    if (!text) throw new Error("Respuesta vacía");

    return {
      hintLevel,
      message: text,
      source: "ai"
    };
  } catch (error) {
    console.warn("[TutorAI] Activando Plan B offline:", error);
    return {
      hintLevel,
      message: getFallbackHint(errorPattern, hintLevel),
      source: "fallback"
    };
  }
}