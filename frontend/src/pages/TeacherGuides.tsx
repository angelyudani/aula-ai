import { useState, type FormEvent } from 'react'
import { topicLabels, type StudentTopic } from '../types/student'
import './TeacherGuides.css'

type TopicGuide = {
  title: string
  purpose: string
  materials: string
  steps: { time: string; title: string; description: string }[]
  check: string
}

type PreparedIntervention = {
  id: number
  topic: StudentTopic
  title: string
  objective: string
}

const topics: StudentTopic[] = ['suma', 'resta', 'multiplicacion', 'fracciones']

const guides: Record<StudentTopic, TopicGuide> = {
  suma: {
    title: 'Descomponer para sumar',
    purpose: 'Practicar la suma por valor posicional y explicar cada paso antes de calcular.',
    materials: 'Tarjetas con números, hojas y lápices.',
    steps: [
      { time: '3 min', title: 'Activar ideas', description: 'Pide al grupo estimar el resultado de una suma y contar cómo lo pensó.' },
      { time: '5 min', title: 'Modelar', description: 'Descompón ambos sumandos en centenas, decenas y unidades; suma cada parte.' },
      { time: '8 min', title: 'Resolver en pareja', description: 'Cada pareja resuelve dos sumas y compara su estrategia con otra pareja.' },
      { time: '2 min', title: 'Comprobar', description: 'Revisen si el resultado es razonable mediante una estimación.' },
    ],
    check: '¿Qué parte del número sumaste primero y cómo comprobaste el resultado?',
  },
  resta: {
    title: 'Restar con una recta numérica',
    purpose: 'Comprender la resta como distancia entre dos cantidades y revisar el sentido del resultado.',
    materials: 'Recta numérica en el pizarrón y tarjetas de operaciones.',
    steps: [
      { time: '3 min', title: 'Estimar la distancia', description: 'Presenta una resta y pregunta si la diferencia será menor o mayor que diez.' },
      { time: '5 min', title: 'Modelar saltos', description: 'Marca el minuendo y representa saltos hacia atrás o hacia adelante hasta el sustraendo.' },
      { time: '8 min', title: 'Resolver en equipo', description: 'El equipo dibuja una recta y explica por qué eligió cada salto.' },
      { time: '2 min', title: 'Verificar', description: 'Comprueben la respuesta sumando la diferencia al sustraendo.' },
    ],
    check: '¿Cómo puedes usar una suma para comprobar esta resta?',
  },
  multiplicacion: {
    title: 'Multiplicar con arreglos',
    purpose: 'Relacionar la multiplicación con grupos iguales y arreglos rectangulares.',
    materials: 'Fichas, puntos dibujados o papel cuadriculado.',
    steps: [
      { time: '3 min', title: 'Formar grupos', description: 'Representa una situación breve con grupos que tengan la misma cantidad.' },
      { time: '5 min', title: 'Dibujar el arreglo', description: 'Organiza las fichas en filas y columnas y vincula el dibujo con una multiplicación.' },
      { time: '8 min', title: 'Cambiar la representación', description: 'En parejas, dibujen otra disposición y expliquen por qué el total no cambia.' },
      { time: '2 min', title: 'Cerrar con una regla', description: 'Relacionen filas por columnas con el producto obtenido.' },
    ],
    check: '¿Qué representan las filas y las columnas en tu multiplicación?',
  },
  fracciones: {
    title: 'Construir fracciones equivalentes',
    purpose: 'Reconocer que distintas particiones pueden representar la misma cantidad.',
    materials: 'Tiras de papel del mismo tamaño y lápices de color.',
    steps: [
      { time: '3 min', title: 'Comparar partes', description: 'Muestra dos tiras iguales divididas en partes distintas y pregunta qué observan.' },
      { time: '5 min', title: 'Modelar equivalencias', description: 'Dobla o sombrea las tiras para comparar, por ejemplo, una mitad con dos cuartos.' },
      { time: '8 min', title: 'Explicar en parejas', description: 'Cada pareja crea una equivalencia y la justifica usando el mismo entero.' },
      { time: '2 min', title: 'Comprobar', description: 'Verifiquen que ambas fracciones cubren la misma longitud de la tira.' },
    ],
    check: '¿Qué debe mantenerse igual para que dos fracciones sean equivalentes?',
  },
}

function normalizeFailureRate(value: number | undefined) {
  return Math.min(100, Math.max(0, Math.round(value ?? 0)))
}

export default function TeacherGuides({ topicFailureRates }: { topicFailureRates: { topic: string; failurePercentage: number }[] }) {
  const rankedTopics = topics
    .map((topic) => ({
      topic,
      failurePercentage: normalizeFailureRate(topicFailureRates.find((item) => item.topic === topic)?.failurePercentage),
    }))
    .sort((left, right) => right.failurePercentage - left.failurePercentage)
  const criticalTopic = rankedTopics[0]?.topic ?? 'fracciones'
  const [selectedTopic, setSelectedTopic] = useState<StudentTopic | null>(null)
  const activeTopic = selectedTopic ?? criticalTopic
  const activeGuide = guides[activeTopic]
  const activeRate = rankedTopics.find((item) => item.topic === activeTopic)?.failurePercentage ?? 0
  const [title, setTitle] = useState('')
  const [objective, setObjective] = useState('')
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false)
  const [prepared, setPrepared] = useState<PreparedIntervention[]>([])

  function prepareIntervention(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim() || !privacyConfirmed) return

    setPrepared((current) => [{
      id: Date.now(),
      topic: activeTopic,
      title: title.trim(),
      objective: objective.trim() || activeGuide.purpose,
    }, ...current])
    setTitle('')
    setObjective('')
    setPrivacyConfirmed(false)
  }

  return (
    <div className="teacher-guides-page">
      <header className="teacher-guides-heading">
        <div>
          <span className="teacher-panel-kicker">INTERVENCIÓN EN EL AULA</span>
          <h2>Guías didácticas</h2>
          <p>Elige un tema con dificultad y prepara una dinámica breve para reforzarlo con el grupo.</p>
        </div>
        <span className="teacher-guides-privacy-tag"><span aria-hidden="true">✦</span> Resultados agregados</span>
      </header>

      <div className="teacher-guides-topic-picker" role="group" aria-label="Elegir tema para la guía">
        {rankedTopics.map(({ topic, failurePercentage }, index) => (
          <button
            type="button"
            key={topic}
            className={`teacher-guides-topic ${activeTopic === topic ? 'is-selected' : ''}`}
            aria-pressed={activeTopic === topic}
            onClick={() => setSelectedTopic(topic)}
          >
            <span>{topicLabels[topic]}</span>
            <strong>{failurePercentage}% <small>con dificultad</small></strong>
            {index === 0 && failurePercentage > 0 && <em>Prioridad</em>}
          </button>
        ))}
      </div>

      <div className="teacher-guides-content">
        <article className="teacher-guides-plan teacher-panel" aria-labelledby="teacher-guide-plan-title">
          <div className="teacher-guides-plan-top">
            <div>
              <span className="teacher-panel-kicker">GUÍA PARA {topicLabels[activeTopic].toLocaleUpperCase('es-MX')}</span>
              <h3 id="teacher-guide-plan-title">{activeGuide.title}</h3>
            </div>
            <span className="teacher-guides-duration">18 min</span>
          </div>
          <p className="teacher-guides-purpose">{activeGuide.purpose}</p>
          <p className="teacher-guides-materials"><strong>Materiales:</strong> {activeGuide.materials}</p>
          <ol className="teacher-guides-steps">
            {activeGuide.steps.map((step) => (
              <li key={step.title}>
                <span className="teacher-guides-time">{step.time}</span>
                <div><strong>{step.title}</strong><p>{step.description}</p></div>
              </li>
            ))}
          </ol>
          <div className="teacher-guides-check"><span>CIERRE RÁPIDO</span><p>{activeGuide.check}</p></div>
          <p className="teacher-guides-source">{activeRate > 0 ? `Prioridad sugerida: ${activeRate}% del grupo presenta dificultad en este tema.` : 'No hay resultados de dificultad para este tema todavía; puedes usar la guía como práctica preventiva.'}</p>
        </article>

        <section className="teacher-guides-form-card teacher-panel" aria-labelledby="teacher-guide-form-title">
          <span className="teacher-panel-kicker">PREPARAR SESIÓN</span>
          <h3 id="teacher-guide-form-title">Adapta la intervención</h3>
          <form onSubmit={prepareIntervention}>
            <label className="teacher-guides-field">
              <span>Nombre de la actividad</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={60} placeholder="Ej. Reto de equivalencias" required />
            </label>
            <label className="teacher-guides-field">
              <span>Objetivo o ajuste para el grupo <small>Opcional</small></span>
              <textarea value={objective} onChange={(event) => setObjective(event.target.value)} maxLength={240} rows={3} placeholder="Describe el aprendizaje que quieres reforzar, sin datos de estudiantes." />
            </label>
            <div className="teacher-guides-privacy-alert" role="note">
              <strong>Cuida la privacidad del grupo</strong>
              <p>No escribas nombres, matrículas, correos, teléfonos ni situaciones personales. Usa únicamente información general del grupo.</p>
            </div>
            <label className="teacher-guides-consent">
              <input type="checkbox" checked={privacyConfirmed} onChange={(event) => setPrivacyConfirmed(event.target.checked)} />
              <span>Confirmo que no agregué datos personales del alumnado.</span>
            </label>
            <button className="teacher-guides-submit" type="submit" disabled={!title.trim() || !privacyConfirmed}>Preparar intervención <span aria-hidden="true">→</span></button>
            <p className="teacher-guides-local-note">Este borrador solo se conserva en esta pantalla y no se envía al servidor.</p>
          </form>
        </section>
      </div>

      {prepared.length > 0 && (
        <section className="teacher-guides-prepared" aria-labelledby="teacher-guides-prepared-title" aria-live="polite">
          <div><span className="teacher-panel-kicker">BORRADORES DE ESTA SESIÓN</span><h3 id="teacher-guides-prepared-title">Intervenciones preparadas <span>{prepared.length}</span></h3></div>
          <div className="teacher-guides-prepared-list">
            {prepared.map((item) => (
              <article key={item.id} className="teacher-panel teacher-guides-prepared-card">
                <span>{topicLabels[item.topic]}</span>
                <h4>{item.title}</h4>
                <p>{item.objective}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
