import { useEffect, useMemo, useState } from 'react'
import { teacherDemoStudent, teacherMockStudents, type TeacherStudent } from '../data/teacherMockData'
import { getTeacherSummary } from '../services/api'
import type { TeacherSummaryResponse } from '../types/api'
import { topicLabels, type StudentTopic } from '../types/student'

type StudentFilter = 'all' | 'risk'

type DidacticGuide = {
  objective: string
  duration: string
  classroomActivity: string
  concreteMaterial: string
  reflectionPrompt: string
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const topicOrder: StudentTopic[] = ['suma', 'resta', 'multiplicacion', 'fracciones']

const didacticGuides: Record<StudentTopic, DidacticGuide> = {
  fracciones: {
    objective: 'Comprender la equivalencia y suma con distinto denominador sin memorizar reglas mecánicas.',
    duration: '15 minutos',
    classroomActivity:
      'Divide al grupo en parejas con tiras de papel (1 entero, 1/2, 1/4 y 1/8) para superponer físicamente 1/2 + 1/4 antes de resolver en el pizarrón.',
    concreteMaterial: 'Tiras fraccionarias de papel de colores o círculos recortables.',
    reflectionPrompt: '¿Por qué no podemos sumar directamente los números de abajo (denominadores) cuando las partes son de distinto tamaño?',
  },
  suma: {
    objective: 'Consolidar el valor posicional y la reagrupación en sumas de dos y tres cifras.',
    duration: '15 minutos',
    classroomActivity:
      'Organiza estaciones rápidas con fichas de unidades, decenas y centenas donde los alumnos canjeen cada grupo de 10 fichas por una de orden superior.',
    concreteMaterial: 'Fichas de colores por valor posicional o bloques base 10.',
    reflectionPrompt: '¿Qué ocurre en la columna de las decenas cuando al sumar las unidades pasamos de 9?',
  },
  resta: {
    objective: 'Dominar la desagrupación y la resta como distancia entre dos cantidades.',
    duration: '15 minutos',
    classroomActivity:
      'Trabaja en pizarrón con recta numérica abierta: pide calcular 1,000 − 476 dando saltos hacia adelante (476 → 500 → 1,000) y compara con el algoritmo tradicional.',
    concreteMaterial: 'Recta numérica laminada y marcadores borrables.',
    reflectionPrompt: '¿Cómo puedes comprobar con una suma si el resultado de tu resta es correcto?',
  },
  multiplicacion: {
    objective: 'Desarrollar cálculo mental mediante descomposición distributiva de factores.',
    duration: '15 minutos',
    classroomActivity:
      'Proyecta arreglos rectangulares de puntos (ej. 8 × 7) y pide a dos equipos dividir el rectángulo en dos tablas conocidas (4 × 7 + 4 × 7) para sumar ambos bloques.',
    concreteMaterial: 'Cuadrículas impresas o tableros de arreglos rectangulares.',
    reflectionPrompt: '¿Qué tabla que ya dominas te ayuda a resolver más rápido una multiplicación difícil?',
  },
}

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

function StudentRow({ student, anonymousMode }: { student: TeacherStudent; anonymousMode: boolean }) {
  const status = getStatus(student)
  const lowestTopic = topicOrder.reduce((lowest, topic) => student.topics[topic] < student.topics[lowest] ? topic : lowest, topicOrder[0])
  const displayName = anonymousMode ? `Estudiante (${student.id})` : student.name

  return (
    <tr>
      <td>
        <div className="teacher-student-name">
          <span className="teacher-student-avatar">{anonymousMode ? 'ID' : initials(student.name)}</span>
          <span><strong>{displayName}</strong><small>{student.id}</small></span>
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
  const [anonymousMode, setAnonymousMode] = useState(false)
  const [guideTopic, setGuideTopic] = useState<StudentTopic>('fracciones')
  const [customPrompt, setCustomPrompt] = useState('')
  const [aiGuideLoading, setAiGuideLoading] = useState(false)
  const [aiGuideResponse, setAiGuideResponse] = useState<{ text: string; blocked: boolean } | null>(null)
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
  const activeGuide = didacticGuides[guideTopic]

  const requestCustomGuide = async (promptOverride?: string) => {
    const finalPrompt = (promptOverride ?? customPrompt).trim()
    if (!finalPrompt || aiGuideLoading) return
    setAiGuideLoading(true)
    setAiGuideResponse(null)

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: finalPrompt,
          role: 'teacher',
          language: 'es',
          context: `Grupo 2° A · Tema seleccionado: ${topicLabels[guideTopic]} · ${studentsAtRisk.length} alumnos requieren apoyo`,
        }),
      })
      const data = await response.json()
      setAiGuideResponse({
        text: data.reply || 'No se pudo generar la adaptación didáctica.',
        blocked: Boolean(data.blocked),
      })
    } catch {
      setAiGuideResponse({
        text: `📘 Guía rápida (${topicLabels[guideTopic]}): ${activeGuide.classroomActivity} Cierre: ${activeGuide.reflectionPrompt}`,
        blocked: false,
      })
    } finally {
      setAiGuideLoading(false)
    }
  }

  return (
    <section className="teacher-dashboard" aria-labelledby="teacher-dashboard-title">
      <div className="teacher-welcome-row">
        <div>
          <div className="eyebrow muted-eyebrow"><span className="eyebrow-dot" /> PANEL DOCENTE <span className="eyebrow-line" /></div>
          <h1 id="teacher-dashboard-title">Hola, profe <span>✦</span></h1>
          <p>Un vistazo claro a cómo avanza tu grupo, con guías didácticas accionables y privacidad por diseño.</p>
        </div>
        <div className="teacher-data-chip"><span className={summaryStatus === 'connected' ? 'teacher-live-dot' : 'teacher-demo-dot'} />{summaryStatus === 'loading' ? 'Cargando grupo…' : summaryStatus === 'connected' ? 'Datos de Supabase' : 'Datos de demostración'}</div>
      </div>

      {/* Aviso de Privacidad por Diseño (Rol 5) */}
      <div
        role="note"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          padding: '0.8rem 1.1rem',
          marginBottom: '1.25rem',
          borderRadius: '14px',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          background: 'rgba(245, 158, 11, 0.08)',
          fontSize: '0.9rem',
        }}
      >
        <span>
          🔒 <strong>Privacidad por Diseño Activa:</strong> El asistente de IA opera únicamente con métricas agregadas y códigos anónimos (ej. <code>alum-demo-45</code>). Bloquea automáticamente nombres reales, CURP o expedientes.
        </span>
        <button
          type="button"
          className="button button-quiet"
          onClick={() => setAnonymousMode((prev) => !prev)}
        >
          {anonymousMode ? 'Mostrar nombres demo' : 'Modo proyector (anónimo)'}
        </button>
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
          <h2>{sofia ? `${anonymousMode ? teacherDemoStudent.id : teacherDemoStudent.name} ya completó su diagnóstico` : `${anonymousMode ? teacherDemoStudent.id : teacherDemoStudent.name} está lista para empezar`}</h2>
          <p>{sofia ? `Su promedio es ${sofia.averageScore}%. Sus resultados ya forman parte del resumen del grupo.` : 'Su espacio está reservado. Al terminar el diagnóstico, sus resultados se sumarán al resumen del grupo.'}</p>
          <div className="teacher-demo-status"><span className={sofia ? 'teacher-live-dot' : 'teacher-pending-dot'} /> {sofia ? 'Resultados recibidos' : 'Diagnóstico pendiente'} <small>· {teacherDemoStudent.id}</small></div>
        </article>
      </div>

      {/* Guías Didácticas Accionables + Generador Protegido (Rol 5) */}
      <section className="teacher-panel" style={{ marginBottom: '1.5rem' }} aria-labelledby="didactic-guides-title">
        <div className="teacher-panel-heading" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span className="teacher-panel-kicker">INTERVENCIÓN PEDAGÓGICA ACCIONABLE</span>
            <h2 id="didactic-guides-title">Guías Didácticas para el Aula ({activeGuide.duration})</h2>
          </div>
          <div className="teacher-filter-switch" role="group" aria-label="Seleccionar tema para guía didáctica">
            {topicOrder.map((topic) => (
              <button
                key={topic}
                type="button"
                className={guideTopic === topic ? 'selected' : ''}
                onClick={() => {
                  setGuideTopic(topic)
                  setAiGuideResponse(null)
                }}
              >
                {topicLabels[topic]}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '0.9rem',
            marginTop: '1rem',
            marginBottom: '1.1rem',
          }}
        >
          <div style={{ padding: '0.9rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.35)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
            <span className="teacher-panel-kicker">1. OBJETIVO DE APRENDIZAJE</span>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.92rem' }}>{activeGuide.objective}</p>
          </div>
          <div style={{ padding: '0.9rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.35)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
            <span className="teacher-panel-kicker">2. DINÁMICA EN CLASE</span>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.92rem' }}>{activeGuide.classroomActivity}</p>
          </div>
          <div style={{ padding: '0.9rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.35)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
            <span className="teacher-panel-kicker">3. MATERIAL Y CIERRE</span>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.92rem' }}>
              <strong>Material:</strong> {activeGuide.concreteMaterial}
              <br />
              <strong>Pregunta de cierre:</strong> <em>“{activeGuide.reflectionPrompt}”</em>
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            requestCustomGuide()
          }}
          style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}
        >
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder={`Pedir adaptación IA para ${topicLabels[guideTopic]} (sin datos personales)...`}
            style={{
              flex: 1,
              minWidth: '240px',
              padding: '0.65rem 0.9rem',
              borderRadius: '10px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: 'inherit',
            }}
          />
          <button type="submit" className="button button-primary" disabled={aiGuideLoading}>
            {aiGuideLoading ? 'Generando…' : 'Generar guía con IA'}
          </button>
          <button
            type="button"
            className="button button-quiet"
            onClick={() =>
              requestCustomGuide('Genera una recomendación individual para el alumno Juan Pérez con CURP ABCD990101HDFRRL09')
            }
          >
            Probar candado de privacidad
          </button>
        </form>

        {aiGuideResponse && (
          <div
            role="status"
            style={{
              marginTop: '0.9rem',
              padding: '0.95rem 1.1rem',
              borderRadius: '12px',
              whiteSpace: 'pre-line',
              fontSize: '0.92rem',
              lineHeight: 1.5,
              background: aiGuideResponse.blocked ? 'rgba(127, 29, 29, 0.45)' : 'rgba(30, 41, 59, 0.65)',
              border: aiGuideResponse.blocked ? '1px solid #ef4444' : '1px solid rgba(245, 158, 11, 0.35)',
            }}
          >
            {aiGuideResponse.text}
          </div>
        )}
      </section>

      <section className="teacher-panel teacher-roster-panel" aria-labelledby="teacher-roster-title">
        <div className="teacher-roster-heading">
          <div><span className="teacher-panel-kicker">SEGUIMIENTO INDIVIDUAL</span><h2 id="teacher-roster-title">Alumnos del grupo <span>{students.length}</span></h2><p>Ordenados por promedio para encontrar rápido a quién acompañar.</p></div>
          <label className="teacher-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setShowAll(false) }} placeholder="Buscar por nombre o código" aria-label="Buscar alumno" /></label>
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
              {visibleStudents.map((student) => <StudentRow key={student.id} student={student} anonymousMode={anonymousMode} />)}
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