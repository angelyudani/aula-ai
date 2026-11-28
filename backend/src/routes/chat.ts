import { Router, Request, Response } from 'express';

const router = Router();

interface ChatRequestBody {
  message?: string;
  role?: 'student' | 'teacher';
  language?: 'es' | 'en' | 'pt';
  context?: string;
}

function containsSensitiveData(text: string): { blocked: boolean; reason?: string } {
  const patterns: Array<{ regex: RegExp; reason: string }> = [
    {
      regex: /\b[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/i,
      reason: 'Se detectó una posible CURP.'
    },
    {
      regex: /\b[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}\b/i,
      reason: 'Se detectó un posible RFC.'
    },
    {
      regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
      reason: 'Se detectó un correo electrónico personal.'
    },
    {
      regex: /\b(?:\+?52\s?)?(?:\d{2,3}[\s-]?)?\d{4}[\s-]?\d{4}\b/,
      reason: 'Se detectó un número telefónico.'
    },
    {
      regex: /\b(?:matr[ií]cula|boleta|expediente|folio)\s*(?:de|:|#)?\s*[a-zA-Z0-9-]{4,}/i,
      reason: 'Se detectó una matrícula o número de expediente.'
    },
    {
      regex: /\b(?:alumno|alumna|estudiante)\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+/,
      reason: 'Se detectó el nombre completo de un estudiante. Usa códigos anónimos como alum-demo-45.'
    }
  ];

  for (const item of patterns) {
    if (item.regex.test(text)) {
      return { blocked: true, reason: item.reason };
    }
  }
  return { blocked: false };
}

function buildLocalFallback(
  message: string,
  role: 'student' | 'teacher',
  language: 'es' | 'en' | 'pt'
): string {
  const lower = message.toLowerCase();

  if (role === 'teacher') {
    if (lower.includes('fracc')) {
      return [
        '📘 **Guía Didáctica Rápida — Fracciones (15 min)**',
        '• **Objetivo:** Comprender equivalencia y suma con distinto denominador sin memorizar reglas mecánicas.',
        '• **Actividad en clase:** Divide al grupo en parejas con tiras de papel (1 entero, 1/2, 1/4 y 1/8) para representar físicamente 1/2 + 1/4 antes de pasar al pizarrón.',
        '• **Cierre:** Pide que expliquen con sus propias palabras por qué no se suman los denominadores directamente.'
      ].join('\n');
    }
    return [
      '👩‍🏫 **Sugerencia Pedagógica AULA AI**',
      '1. **Diagnóstico focalizado:** Agrupa a los estudiantes con puntaje menor al 60% en bloques de 15 minutos con material visual.',
      '2. **Micro-reflexión:** Antes de validar una respuesta, pide que escriban en una línea *por qué* eligieron ese procedimiento.',
      '3. **Privacidad:** Recuerda trabajar siempre con identificadores anónimos (ej. `alum-demo-45`).'
    ].join('\n');
  }

  if (lower.includes('horario') || lower.includes('plan')) {
    return [
      '🗓️ **Plan de Estudio Semanal Recomendado (25 min/día)**',
      '• **Lunes y Miércoles:** Refuerzo de Fracciones (2 ejercicios guiados + revisar por qué falló cada paso).',
      '• **Martes y Jueves:** Práctica de Multiplicación y Resta (15 min) + Lectura comprensiva (10 min).',
      '• **Viernes:** Repaso mixto rápido y autoevaluación en AULA AI.'
    ].join('\n');
  }

  if (lower.includes('traduc') || language !== 'es') {
    return '🌐 **Apoyo Multilingüe (ES / EN / PT):** Pega el párrafo que estás leyendo y te ayudo a traducirlo y explicar el vocabulario clave sin darte directamente las respuestas del cuestionario.';
  }

  return '💡 **Pista Socrática:** Revisa qué operación te pide el problema y divide el ejercicio en dos pasos pequeños. Si fallaste en el intento anterior, verifica si aplicaste bien la regla antes de operar. ¿Qué paso intentaste primero?';
}

router.post('/', async (req: Request<unknown, unknown, ChatRequestBody>, res: Response) => {
  const message = (req.body.message || '').trim();
  const role: 'student' | 'teacher' = req.body.role === 'teacher' ? 'teacher' : 'student';
  const language: 'es' | 'en' | 'pt' =
    req.body.language === 'en' || req.body.language === 'pt' ? req.body.language : 'es';
  const context = (req.body.context || '').trim();

  if (!message) {
    res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    return;
  }

  const privacyCheck = containsSensitiveData(message);
  if (privacyCheck.blocked) {
    res.status(400).json({
      blocked: true,
      reply: `🔒 **Candado de Privacidad AULA AI:** ${privacyCheck.reason} Por protección de datos, nunca ingreses nombres reales, correos, CURP o expedientes identificables.`
    });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.json({
      blocked: false,
      source: 'local-fallback',
      reply: buildLocalFallback(message, role, language)
    });
    return;
  }

  const systemInstruction =
    role === 'teacher'
      ? `Eres el Asistente Pedagógico de AULA AI para docentes. Responde en español de forma clara, estructurada y accionable. Genera guías didácticas, dinámicas de clase de 15 minutos y estrategias de intervención basadas en métricas anónimas del grupo. Nunca solicites ni proceses datos personales reales de alumnos. Contexto actual: ${context || 'Panel Docente'}.`
      : `Eres el Tutor Socrático de AULA AI para estudiantes. Responde en el idioma solicitado (${language.toUpperCase()}). Reglas estrictas: 1) Explica el razonamiento conceptual detrás de cada acierto o error adaptándote al nivel del alumno, 2) NUNCA entregues directamente la respuesta final de un ejercicio activo, da pistas progresivas, 3) Apoya con traducción y comprensión literaria en Español, Inglés y Portugués, y 4) Ayuda a crear horarios de estudio realistas. Contexto actual: ${context || 'Práctica del Estudiante'}.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: message }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 450
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      buildLocalFallback(message, role, language);

    res.json({
      blocked: false,
      source: 'gemini',
      reply
    });
  } catch {
    res.json({
      blocked: false,
      source: 'local-fallback',
      reply: buildLocalFallback(message, role, language)
    });
  }
});

export default router;