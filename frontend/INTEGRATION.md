# Integración AULA AI

## Diagnóstico de 12 preguntas

- El frontend envía las 12 respuestas en el contrato `DiagnosticRequest` a `POST /diagnostic`.
- La sesión de demostración usa `alum-demo-45` y el nombre Sofía.
- El backend califica los mismos IDs, temas y respuestas correctas que usa el frontend. Guarda una calificación por tema en `diagnostic_results`.
- Si la API no responde, el frontend muestra el resultado calculado localmente y advierte que no se guardó en Supabase.

## Panel docente

- `TeacherDashboard.tsx` solicita `GET /teacher/summary` y muestra los datos de Supabase cuando la llamada funciona; si no, conserva el grupo demo local.
- `TeacherSummaryResponse` incluye promedios, tasas de dificultad por tema, estudiantes en riesgo y los datos para el padrón.
- El backend deriva el resumen de `diagnostic_results` y asigna los nombres ficticios por ID demo.
- El registro `alum-demo-45` queda libre en la carga semilla y aparece en el panel tras guardar su diagnóstico.

## Carga de datos demo

Desde `backend/`, ejecutar `npm run seed:demo`. El script agrega los resultados faltantes de los 44 alumnos ficticios y no elimina ni reemplaza filas existentes. Requiere que `diagnostic_results` tenga `student_id`, `topic`, `score`, `error_pattern` y `created_at`.
