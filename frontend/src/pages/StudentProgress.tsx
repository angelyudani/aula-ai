import { useState } from 'react'
import type { DiagnosticReport, PracticeStats, StudentTopic } from '../types/student'
import { topicLabels } from '../types/student'
import type { Section } from '../components/Navbar'

type StudyTask = {
  id: string
  day: string
  duration: string
  title: string
  detail: string
  priority: 'Alta' | 'Media' | 'Refuerzo'
  targetSection: Section
}

function percent(value: number) {
  return `${Math.max(0, Math.min(100, value))}%`
}

export default function StudentProgress({
  report,
  stats,
  onNavigate,
}: {
  report: DiagnosticReport | null
  stats: PracticeStats
  onNavigate: (section: Section) => void
}) {
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([])
  const [customTasks, setCustomTasks] = useState<StudyTask[]>([])
  const [newTaskDay, setNewTaskDay] = useState('Sábado')
  const [newTaskText, setNewTaskText] = useState('')

  if (!report) {
    return (
      <section className="student-page" aria-labelledby="progress-title">
        <div className="student-page-heading">
          <div>
            <span className="eyebrow muted-eyebrow">TU HISTORIAL DE APRENDIZAJE</span>
            <h1 id="progress-title">Tu progreso empieza aquí.</h1>
            <p>Después del diagnóstico, podrás consultar tu dominio por tema y tus avances de práctica.</p>
          </div>
        </div>
        <div className="empty-state glass-panel">
          <div className="student-symbol-large">◈</div>
          <h2>Aún no hay un diagnóstico registrado</h2>
          <p>Completa las doce preguntas para crear tu primer mapa de aprendizaje.</p>
          <button className="button button-primary" type="button" onClick={() => onNavigate('diagnostico')}>
            Comenzar diagnóstico <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    )
  }

  const mastered = report.topics.filter((topic) => topic.percentage >= 80).length
  const date = new Date(report.completedAt).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
  const topicTotals: Record<StudentTopic, number> = { suma: 3, resta: 3, multiplicacion: 3, fracciones: 3 }
  const questionCount = report.topics.reduce((total, topic) => total + topicTotals[topic.topic], 0)

  const sortedByNeed = [...report.topics].sort((a, b) => a.percentage - b.percentage)
  const firstWeak = sortedByNeed[0]
  const secondWeak = sortedByNeed[1] ?? sortedByNeed[0]
  const thirdTopic = sortedByNeed[2] ?? sortedByNeed[0]

  const recommendedTasks: StudyTask[] = [
    {
      id: 'plan-priority-1',
      day: 'Lunes y Miércoles',
      duration: '25 min',
      title: `Prioridad 1: ${topicLabels[firstWeak.topic]} (${firstWeak.percentage}% diagnóstico)`,
      detail: 'Resuelve 3 ejercicios con micro-reflexión y revisa el porqué de cada paso antes de avanzar.',
      priority: 'Alta',
      targetSection: 'practica',
    },
    {
      id: 'plan-priority-2',
      day: 'Martes y Jueves',
      duration: '20 min',
      title: `Prioridad 2: ${topicLabels[secondWeak.topic]} (${secondWeak.percentage}% diagnóstico)`,
      detail: 'Completa 2 ejercicios guiados usando las pistas progresivas del Tutor Socrático.',
      priority: 'Media',
      targetSection: 'practica',
    },
    {
      id: 'plan-reading-review',
      day: 'Viernes',
      duration: '15 min',
      title: `Lectura multilingüe + repaso de ${topicLabels[thirdTopic.topic]}`,
      detail: 'Lee el texto literario en ES/EN/PT para reforzar vocabulario y cierra con 1 ejercicio mixto.',
      priority: 'Refuerzo',
      targetSection: 'lectura',
    },
  ]

  const allTasks = [...recommendedTasks, ...customTasks]

  const toggleTask = (id: string) => {
    setCompletedTaskIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const addCustomTask = (event: React.FormEvent) => {
    event.preventDefault()
    const cleanText = newTaskText.trim()
    if (!cleanText) return
    setCustomTasks((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        day: newTaskDay,
        duration: '15 min',
        title: cleanText,
        detail: 'Meta personal agregada a tu horario semanal de estudio.',
        priority: 'Refuerzo',
        targetSection: 'practica',
      },
    ])
    setNewTaskText('')
  }

  return (
    <section className="student-page" aria-labelledby="progress-title">
      <div className="student-page-heading progress-page-heading">
        <div>
          <span className="eyebrow muted-eyebrow">TU HISTORIAL DE APRENDIZAJE</span>
          <h1 id="progress-title">Cada paso cuenta, {report.studentName}.</h1>
          <p>Un vistazo claro a lo que ya sabes, lo que estás practicando y tu horario semanal sugerido.</p>
        </div>
        <span className="session-data-pill">
          <span className="live-dot" /> Datos de esta sesión
        </span>
      </div>

      <div className="progress-summary-grid">
        <article className="progress-summary-card glass-panel">
          <span className="summary-card-icon summary-violet">◈</span>
          <span className="eyebrow muted-eyebrow">TEMAS EVALUADOS</span>
          <strong>
            {report.topics.length}
            <small> / 4</small>
          </strong>
          <span className="summary-caption">en el diagnóstico inicial</span>
        </article>
        <article className="progress-summary-card glass-panel">
          <span className="summary-card-icon summary-mint">✦</span>
          <span className="eyebrow muted-eyebrow">TEMAS SÓLIDOS</span>
          <strong>
            {mastered}
            <small> / {report.topics.length}</small>
          </strong>
          <span className="summary-caption">con 80% o más de aciertos</span>
        </article>
        <article className="progress-summary-card glass-panel">
          <span className="summary-card-icon summary-pink">✓</span>
          <span className="eyebrow muted-eyebrow">PRÁCTICA COMPLETADA</span>
          <strong>{stats.completed}</strong>
          <span className="summary-caption">ejercicios resueltos correctamente</span>
        </article>
      </div>

      <div className="progress-content-grid">
        <article className="progress-topic-panel glass-panel">
          <div className="progress-panel-heading">
            <div>
              <span className="eyebrow muted-eyebrow">RESULTADO DEL DIAGNÓSTICO</span>
              <h2>Dominio por tema</h2>
            </div>
            <span className="question-count">{questionCount} respuestas</span>
          </div>
          <div className="progress-topic-list">
            {report.topics.map((topic) => (
              <div className={`progress-topic-row ${topic.topic}`} key={topic.topic}>
                <div className="progress-topic-row-head">
                  <div>
                    <span className="topic-dot" />
                    <strong>{topicLabels[topic.topic]}</strong>
                  </div>
                  <span className="progress-level-label">{topic.level}</span>
                </div>
                <div
                  className="progress-topic-track"
                  role="progressbar"
                  aria-label={`Dominio en ${topicLabels[topic.topic]}`}
                  aria-valuenow={topic.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span style={{ width: percent(topic.percentage) }} />
                </div>
                <div className="progress-topic-caption">
                  <span>
                    {topic.correct} de {topicTotals[topic.topic]} correctas
                  </span>
                  <strong>{topic.percentage}%</strong>
                </div>
              </div>
            ))}
          </div>
          <div className="progress-activity-note">
            <span>✦</span> Diagnóstico completado el {date}
          </div>
        </article>

        <article className="progress-practice-panel glass-panel">
          <div className="progress-panel-heading">
            <div>
              <span className="eyebrow muted-eyebrow">ACTIVIDAD DE PRÁCTICA</span>
              <h2>Tu esfuerzo reciente</h2>
            </div>
            <span className="practice-stat-spark">✧</span>
          </div>
          <div className="attempt-totals">
            <div>
              <strong>{stats.attempts}</strong>
              <span>intentos</span>
            </div>
            <div>
              <strong className="stat-good">{stats.correct}</strong>
              <span>correctas</span>
            </div>
            <div>
              <strong className="stat-needs-work">{stats.incorrect}</strong>
              <span>incorrectas</span>
            </div>
          </div>
          <p className="progress-practice-copy">
            Los intentos incorrectos cuentan como oportunidades de práctica; un ejercicio se completa cuando llegas a la
            respuesta correcta.
          </p>
          <div className="progress-local-note">
            <span className="local-note-dot" /> Planificador sincronizado con tus temas de menor puntaje en el diagnóstico.
          </div>
          <button className="button button-secondary" type="button" onClick={() => onNavigate('practica')}>
            Seguir practicando <span aria-hidden="true">→</span>
          </button>
        </article>
      </div>

      {/* Planificador de Estudio Semanal (Rol 4) */}
      <article className="glass-panel" style={{ marginTop: '1.5rem', padding: '1.5rem' }} aria-labelledby="study-planner-title">
        <div className="progress-panel-heading" style={{ marginBottom: '1rem' }}>
          <div>
            <span className="eyebrow muted-eyebrow">ORGANIZACIÓN Y HÁBITOS DE ESTUDIO</span>
            <h2 id="study-planner-title">Planificador Semanal Personalizado</h2>
          </div>
          <span className="question-count">
            {completedTaskIds.length} / {allTasks.length} bloques listos
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {allTasks.map((task) => {
            const done = completedTaskIds.includes(task.id)
            return (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  padding: '0.9rem 1rem',
                  borderRadius: '14px',
                  border: '1px solid rgba(148, 163, 184, 0.22)',
                  background: done ? 'rgba(16, 185, 129, 0.08)' : 'rgba(15, 23, 42, 0.35)',
                  opacity: done ? 0.8 : 1,
                }}
              >
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => toggleTask(task.id)}
                    style={{ marginTop: '0.25rem', width: '17px', height: '17px', accentColor: '#6366f1' }}
                  />
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                      <span className="eyebrow muted-eyebrow" style={{ margin: 0 }}>
                        {task.day} · {task.duration}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.5rem',
                          borderRadius: '999px',
                          background:
                            task.priority === 'Alta'
                              ? 'rgba(244, 63, 94, 0.18)'
                              : task.priority === 'Media'
                              ? 'rgba(245, 158, 11, 0.18)'
                              : 'rgba(99, 102, 241, 0.18)',
                        }}
                      >
                        Prioridad {task.priority}
                      </span>
                    </div>
                    <strong style={{ display: 'block', textDecoration: done ? 'line-through' : 'none' }}>{task.title}</strong>
                    <span style={{ fontSize: '0.88rem', opacity: 0.82 }}>{task.detail}</span>
                  </div>
                </label>

                <button
                  type="button"
                  className="button button-quiet"
                  onClick={() => onNavigate(task.targetSection)}
                >
                  Ir a {task.targetSection === 'lectura' ? 'lectura' : 'práctica'} →
                </button>
              </div>
            )
          })}
        </div>

        <form
          onSubmit={addCustomTask}
          style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}
        >
          <select
            value={newTaskDay}
            onChange={(e) => setNewTaskDay(e.target.value)}
            aria-label="Día de estudio"
            style={{
              padding: '0.6rem 0.8rem',
              borderRadius: '10px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: 'inherit',
            }}
          >
            <option value="Lunes">Lunes</option>
            <option value="Martes">Martes</option>
            <option value="Miércoles">Miércoles</option>
            <option value="Jueves">Jueves</option>
            <option value="Viernes">Viernes</option>
            <option value="Sábado">Sábado</option>
          </select>
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Agregar tarea a mi horario (ej. Repasar tablas de multiplicar 15 min)..."
            style={{
              flex: 1,
              minWidth: '220px',
              padding: '0.6rem 0.85rem',
              borderRadius: '10px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: 'inherit',
            }}
          />
          <button type="submit" className="button button-primary">
            + Agregar al horario
          </button>
        </form>
      </article>
    </section>
  )
}