import { useEffect, useMemo, useState } from 'react'
import { teacherDemoStudent, teacherMockStudents, type TeacherStudent } from '../data/teacherMockData'
import { getTeacherSummary } from '../services/api'
import type { TeacherSummaryResponse } from '../types/api'
import { topicLabels, type StudentTopic } from '../types/student'

type StudentFilter = 'all' | 'risk'

const topicOrder: StudentTopic[] = ['suma', 'resta', 'multiplicacion', 'fracciones']

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(new Date(value))
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((part) => part[0]).join('')
}

function getStatus(student: TeacherStudent) {
  if (student.average < 60) return { label: 'Necesita apoyo', className: 'teacher-status-risk' }
  if (student.average < 75) return { label: 'En práctica', className: 'teacher-status-practice' }
  return { label: 'Buen avance', className: 'teacher-status-good' }
}

function TopicBars({ students, topicFailureRates }: { students: TeacherStudent[]; topicFailureRates?: TeacherSummaryResponse['topicFailureRates'] }) {
  const topics = topicOrder.map((topic) => {
    const strugglingCount = students.filter((student) => student.topics[topic] < 60).length
    const struggling = topicFailureRates?.find((item) => item.topic === topic)?.failurePercentage
      ?? Math.round((strugglingCount / students.length) * 100)
    return { topic, struggling, mastery: 100 - struggling }
  })

  return (
    <div className="teacher-topic-list">
      {topics.map(({ topic, mastery, struggling }) => (
        <div className={`teacher-topic-row ${topic === 'fracciones' ? 'is-focus' : ''}`} key={topic}>
          <div className="teacher-topic-heading">
            <span>{topicLabels[topic]}</span>
            <strong>{struggling}% <small>con dificultad</small></strong>
          </div>
          <div className="teacher-topic-track" role="img" aria-label={`${topicLabels[topic]}: ${struggling}% con dificultad, ${mastery}% de dominio`}>
            <span style={{ width: `${struggling}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function StudentRow({ student }: { student: TeacherStudent }) {
  const status = getStatus(student)
  const lowestTopic = topicOrder.reduce((lowest, topic) => student.topics[topic] < student.topics[lowest] ? topic : lowest, topicOrder[0])

  return (
    <tr>
      <td>
        <div className="teacher-student-name">
          <span className="teacher-student-avatar">{initials(student.name)}</span>
          <span><strong>{student.name}</strong><small>{student.id}</small></span>
        </div>
      </td>
      <td><strong className={`teacher-score ${student.average < 60 ? 'is-low' : ''}`}>{student.average}%</strong></td>
      <td><span className="teacher-topic-cell">{topicLabels[lowestTopic]} <small>{student.topics[lowestTopic]}%</small></span></td>
      <td><span className={`teacher-status ${status.className}`}><i />{status.label}</span></td>
      <td className="teacher-date-cell">{formatDate(student.completedAt)}</td>
    </tr>
  )
}

export default function TeacherDashboard() {
  const [filter, setFilter] = useState<StudentFilter>('all')
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [liveSummary, setLiveSummary] = useState<TeacherSummaryResponse | null>(null)
  const [summaryStatus, setSummaryStatus] = useState<'loading' | 'connected' | 'demo'>('loading')

  useEffect(() => {
    let active = true
    getTeacherSummary()
      .then((summary) => {
        if (!active) return
        setLiveSummary(summary)
        setSummaryStatus('connected')
      })
      .catch(() => {
        if (active) setSummaryStatus('demo')
      })
    return () => { active = false }
  }, [])

  const students: TeacherStudent[] = liveSummary?.students?.length
    ? liveSummary.students.map((student) => ({
      id: student.id,
      name: student.name,
      group: student.group,
      average: student.averageScore,
      topics: {
        suma: student.scoresByTopic.suma ?? 0,
        resta: student.scoresByTopic.resta ?? 0,
        multiplicacion: student.scoresByTopic.multiplicacion ?? 0,
        fracciones: student.scoresByTopic.fracciones ?? 0,
      },
      completedAt: student.completedAt ?? new Date().toISOString(),
    }))
    : teacherMockStudents
  const studentsAtRisk = students.filter((student) => student.average < 60)
  const average = liveSummary?.totalStudents
    ? liveSummary.averageScore
    : Math.round(students.reduce((sum, student) => sum + student.average, 0) / students.length)
  const fractionTrouble = liveSummary?.topicFailureRates.find((item) => item.topic === 'fracciones')?.failurePercentage
    ?? Math.round((students.filter((student) => student.topics.fracciones < 60).length / students.length) * 100)
  const sofia = liveSummary?.students.find((student) => student.id === teacherDemoStudent.id)

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es-MX')
    return students
      .filter((student) => filter === 'all' || student.average < 60)
      .filter((student) => !normalizedQuery || student.name.toLocaleLowerCase('es-MX').includes(normalizedQuery) || student.id.includes(normalizedQuery))
      .sort((a, b) => a.average - b.average)
  }, [filter, query, students])

  const visibleStudents = showAll ? filteredStudents : filteredStudents.slice(0, 8)

  return (
    <section className="teacher-dashboard" aria-labelledby="teacher-dashboard-title">
      <div className="teacher-welcome-row">
        <div>
          <div className="eyebrow muted-eyebrow"><span className="eyebrow-dot" /> PANEL DOCENTE <span className="eyebrow-line" /></div>
          <h1 id="teacher-dashboard-title">Hola, profe <span>✦</span></h1>
          <p>Un vistazo claro a cómo avanza tu grupo y dónde conviene acompañarlo.</p>
        </div>
        <div className="teacher-data-chip"><span className={summaryStatus === 'connected' ? 'teacher-live-dot' : 'teacher-demo-dot'} />{summaryStatus === 'loading' ? 'Cargando grupo…' : summaryStatus === 'connected' ? 'Datos de Supabase' : 'Datos de demostración'}</div>
      </div>

      <div className="teacher-summary-grid">
        <article className="teacher-summary-card teacher-summary-average">
          <div className="teacher-summary-icon" aria-hidden="true">↗</div>
          <span className="teacher-summary-label">Promedio del grupo</span>
          <strong>{average}<small>%</small></strong>
          <span className="teacher-summary-note">de {liveSummary?.totalStudents || 44} diagnósticos completados</span>
        </article>
        <article className="teacher-summary-card teacher-summary-risk">
          <div className="teacher-summary-icon" aria-hidden="true">!</div>
          <span className="teacher-summary-label">Alumnos que necesitan apoyo</span>
          <strong>{studentsAtRisk.length}<small> / {liveSummary?.totalStudents || 44}</small></strong>
          <span className="teacher-summary-note">promedio menor a 60%</span>
        </article>
        <article className="teacher-summary-card teacher-summary-focus">
          <div className="teacher-summary-icon" aria-hidden="true">⅟</div>
          <span className="teacher-summary-label">Tema para reforzar</span>
          <strong>Fracciones</strong>
          <span className="teacher-summary-note">{fractionTrouble}% del grupo tiene dificultad</span>
        </article>
      </div>

      <div className="teacher-insights-grid">
        <article className="teacher-panel teacher-topic-panel">
          <div className="teacher-panel-heading">
            <div><span className="teacher-panel-kicker">DOMINIO POR TEMA</span><h2>¿Qué necesita repaso?</h2></div>
            <span className="teacher-panel-caption">Grupo 2° A</span>
          </div>
          <TopicBars students={students} topicFailureRates={liveSummary?.topicFailureRates} />
          <div className="teacher-insight-note"><span aria-hidden="true">✦</span><p><strong>Fracciones es el reto principal.</strong> Un repaso grupal de equivalencias puede ayudar a muchos alumnos.</p></div>
        </article>

        <article className="teacher-panel teacher-demo-card">
          <div className="teacher-demo-orbit" aria-hidden="true"><span>✦</span></div>
          <span className="teacher-panel-kicker">CASO PARA LA DEMOSTRACIÓN</span>
          <h2>{sofia ? `${teacherDemoStudent.name} ya completó su diagnóstico` : `${teacherDemoStudent.name} está lista para empezar`}</h2>
          <p>{sofia ? `Su promedio es ${sofia.averageScore}%. Sus resultados ya forman parte del resumen del grupo.` : 'Su espacio está reservado. Al terminar el diagnóstico, sus resultados se sumarán al resumen del grupo.'}</p>
          <div className="teacher-demo-status"><span className={sofia ? 'teacher-live-dot' : 'teacher-pending-dot'} /> {sofia ? 'Resultados recibidos' : 'Diagnóstico pendiente'} <small>· Registro #45</small></div>
        </article>
      </div>

      <section className="teacher-panel teacher-roster-panel" aria-labelledby="teacher-roster-title">
        <div className="teacher-roster-heading">
          <div><span className="teacher-panel-kicker">SEGUIMIENTO INDIVIDUAL</span><h2 id="teacher-roster-title">Alumnos del grupo <span>{students.length}</span></h2><p>Ordenados por promedio para encontrar rápido a quién acompañar.</p></div>
          <label className="teacher-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setShowAll(false) }} placeholder="Buscar alumno" aria-label="Buscar alumno" /></label>
        </div>
        <div className="teacher-roster-toolbar">
          <div className="teacher-filter-switch" role="group" aria-label="Filtrar alumnos">
            <button type="button" className={filter === 'all' ? 'selected' : ''} onClick={() => { setFilter('all'); setShowAll(false) }}>Todos <span>{students.length}</span></button>
            <button type="button" className={filter === 'risk' ? 'selected' : ''} onClick={() => { setFilter('risk'); setShowAll(true) }}>Necesitan apoyo <span>{studentsAtRisk.length}</span></button>
          </div>
          <span className="teacher-roster-count">Mostrando {visibleStudents.length} de {filteredStudents.length}</span>
        </div>
        <div className="teacher-table-wrap">
          <table className="teacher-student-table">
            <thead><tr><th>ALUMNO</th><th>PROMEDIO</th><th>TEMA A REFORZAR</th><th>ESTADO</th><th>ÚLTIMO DIAGNÓSTICO</th></tr></thead>
            <tbody>
              {visibleStudents.map((student) => <StudentRow key={student.id} student={student} />)}
              {visibleStudents.length === 0 && <tr><td className="teacher-empty-row" colSpan={5}>No encontramos alumnos con esa búsqueda.</td></tr>}
            </tbody>
          </table>
        </div>
        {filteredStudents.length > 8 && filter === 'all' && (
          <button className="teacher-show-more" type="button" onClick={() => setShowAll((current) => !current)}>
            {showAll ? 'Mostrar menos' : `Ver los ${students.length} alumnos`} <span aria-hidden="true">{showAll ? '↑' : '↓'}</span>
          </button>
        )}
        <p className="teacher-demo-disclaimer">Los nombres y resultados de este panel son ficticios y se usan únicamente para la demostración.</p>
      </section>
    </section>
  )
}
