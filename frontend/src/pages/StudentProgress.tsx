import type { DiagnosticReport, PracticeStats, StudentTopic } from '../types/student'
import { topicLabels } from '../types/student'
import type { Section } from '../components/Navbar'

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
  // The local view model stays separate from GET /student/:id/progress until its
  // response contract is published in src/types/api.ts.
  if (!report) {
    return (
      <section className="student-page" aria-labelledby="progress-title">
        <div className="student-page-heading"><div><span className="eyebrow muted-eyebrow">TU HISTORIAL DE APRENDIZAJE</span><h1 id="progress-title">Tu progreso empieza aquí.</h1><p>Después del diagnóstico, podrás consultar tu dominio por tema y tus avances de práctica.</p></div></div>
        <div className="empty-state glass-panel"><div className="student-symbol-large">◈</div><h2>Aún no hay un diagnóstico registrado</h2><p>Completa las doce preguntas para crear tu primer mapa de aprendizaje.</p><button className="button button-primary" type="button" onClick={() => onNavigate('diagnostico')}>Comenzar diagnóstico <span aria-hidden="true">→</span></button></div>
      </section>
    )
  }

  const mastered = report.topics.filter((topic) => topic.percentage >= 80).length
  const date = new Date(report.completedAt).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
  const topicTotals: Record<StudentTopic, number> = { suma: 3, resta: 3, multiplicacion: 3, fracciones: 3 }
  const questionCount = report.topics.reduce((total, topic) => total + topicTotals[topic.topic], 0)

  return (
    <section className="student-page" aria-labelledby="progress-title">
      <div className="student-page-heading progress-page-heading"><div><span className="eyebrow muted-eyebrow">TU HISTORIAL DE APRENDIZAJE</span><h1 id="progress-title">Cada paso cuenta, {report.studentName}.</h1><p>Un vistazo claro a lo que ya sabes y a lo que estás practicando.</p></div><span className="session-data-pill"><span className="live-dot" /> Datos de esta sesión</span></div>

      <div className="progress-summary-grid">
        <article className="progress-summary-card glass-panel"><span className="summary-card-icon summary-violet">◈</span><span className="eyebrow muted-eyebrow">TEMAS EVALUADOS</span><strong>{report.topics.length}<small> / 4</small></strong><span className="summary-caption">en el diagnóstico inicial</span></article>
        <article className="progress-summary-card glass-panel"><span className="summary-card-icon summary-mint">✦</span><span className="eyebrow muted-eyebrow">TEMAS SÓLIDOS</span><strong>{mastered}<small> / {report.topics.length}</small></strong><span className="summary-caption">con 80% o más de aciertos</span></article>
        <article className="progress-summary-card glass-panel"><span className="summary-card-icon summary-pink">✓</span><span className="eyebrow muted-eyebrow">PRÁCTICA COMPLETADA</span><strong>{stats.completed}</strong><span className="summary-caption">ejercicios resueltos correctamente</span></article>
      </div>

      <div className="progress-content-grid">
        <article className="progress-topic-panel glass-panel">
          <div className="progress-panel-heading"><div><span className="eyebrow muted-eyebrow">RESULTADO DEL DIAGNÓSTICO</span><h2>Dominio por tema</h2></div><span className="question-count">{questionCount} respuestas</span></div>
          <div className="progress-topic-list">
            {report.topics.map((topic) => <div className={`progress-topic-row ${topic.topic}`} key={topic.topic}><div className="progress-topic-row-head"><div><span className="topic-dot" /><strong>{topicLabels[topic.topic]}</strong></div><span className="progress-level-label">{topic.level}</span></div><div className="progress-topic-track" role="progressbar" aria-label={`Dominio en ${topicLabels[topic.topic]}`} aria-valuenow={topic.percentage} aria-valuemin={0} aria-valuemax={100}><span style={{ width: percent(topic.percentage) }} /></div><div className="progress-topic-caption"><span>{topic.correct} de {topicTotals[topic.topic]} correctas</span><strong>{topic.percentage}%</strong></div></div>)}
          </div>
          <div className="progress-activity-note"><span>✦</span> Diagnóstico completado el {date}</div>
        </article>

        <article className="progress-practice-panel glass-panel">
          <div className="progress-panel-heading"><div><span className="eyebrow muted-eyebrow">ACTIVIDAD DE PRÁCTICA</span><h2>Tu esfuerzo reciente</h2></div><span className="practice-stat-spark">✧</span></div>
          <div className="attempt-totals"><div><strong>{stats.attempts}</strong><span>intentos</span></div><div><strong className="stat-good">{stats.correct}</strong><span>correctas</span></div><div><strong className="stat-needs-work">{stats.incorrect}</strong><span>incorrectas</span></div></div>
          <p className="progress-practice-copy">Los intentos incorrectos cuentan como oportunidades de práctica; un ejercicio se completa cuando llegas a la respuesta correcta.</p>
          <div className="progress-local-note"><span className="local-note-dot" /> Este resumen vive en la sesión actual y aún no se sincroniza con el servidor.</div>
          <button className="button button-secondary" type="button" onClick={() => onNavigate('practica')}>Seguir practicando <span aria-hidden="true">→</span></button>
        </article>
      </div>
    </section>
  )
}
