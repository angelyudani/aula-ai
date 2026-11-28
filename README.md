# AULA AI — Copiloto Pedagógico Inclusivo y Privado

Plataforma educativa con Inteligencia Artificial diseñada para reducir brechas de aprendizaje mediante **tutoría socrática adaptativa** para estudiantes y **asistencia didáctica accionable** para docentes, bajo un esquema estricto de **privacidad por diseño**.

**Equipo:** Los Thonys

---

## Características Principales

### Perfil Estudiante
* **Diagnóstico Inicial:** Evaluación rápida por temas (`suma`, `resta`, `multiplicación`, `fracciones`) para detectar áreas de oportunidad.
* **Práctica Adaptativa con Micro-Reflexión:** Sistema de pistas progresivas en 3 niveles y retroalimentación conceptual que explica *por qué* una respuesta es aceptada o rechazada antes de revelar soluciones.
* **Lectura Multilingüe y Accesible:** Contenidos literarios con cambio dinámico entre **Español (ES), Inglés (EN) y Portugués (PT)**, controles de accesibilidad visual (tamaño de fuente y contraste) y atribución de derechos de autor.
* **Planificador de Estudio:** Priorización automática de temas críticos del diagnóstico con bloques semanales de estudio.

### Perfil Docente
* **Analítica Grupal Anónima:** Visualización de desempeño por tema utilizando exclusivamente identificadores anónimos (ej. `alum-demo-45`).
* **Copiloto de Guías Didácticas:** Generación de secuencias didácticas, objetivos y dinámicas de 15 minutos para reforzar los temas con menor puntaje del grupo.

### Candado de Privacidad y Resiliencia (`POST /api/chat`)
* **Filtro Anti-PII:** El backend inspecciona cada consulta antes de enviarla a la API de Gemini y bloquea (`HTTP 400`) mensajes que contengan nombres reales de alumnos, CURP, RFC, matrículas, correos electrónicos o teléfonos.
* **Respaldo Local (*Fallback*):** Si no hay conectividad o cuota de API, el sistema conmuta automáticamente a respuestas pedagógicas locales sin interrumpir la sesión.

---

## Instalación y Ejecución Local

1. **Backend:** `cd backend && npm install && npm run dev` (corre en `http://localhost:3000`).
2. **Frontend:** `cd frontend && npm install && npm run dev` (corre en `http://localhost:5173`).