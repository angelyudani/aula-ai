import { useEffect, useState } from 'react'
import type { DiagnosticReport, PracticeStats, StudentTopic } from '../types/student'
import { topicLabels, weakestTopic } from '../types/student'
import type { Section } from '../components/Navbar'
import { TutorChat } from '../components/TutorChat'

type Exercise = {
  id: string
  prompt: string
  options: string[]
  answer: string
  hints: [string, string, string]
  encouragement: string
}

const exercises: Record<StudentTopic, Exercise[]> = {
  suma: [
    { id: 'practice-sum-01', prompt: '¿Cuánto es 268 + 157?', options: ['415', '425', '435', '325'], answer: '425', hints: ['Alinea centenas, decenas y unidades.', 'Suma primero 8 + 7 unidades y recuerda reagrupar.', 'Después de reagrupar, combina las centenas, decenas y unidades.'], encouragement: 'Reagrupar las unidades te ayuda a mantener cada columna en orden.' },
    { id: 'practice-sum-02', prompt: 'Una biblioteca recibió 145 libros por la mañana y 238 por la tarde. ¿Cuántos recibió?', options: ['373', '383', '393', '283'], answer: '383', hints: ['La palabra “recibió” indica que las cantidades se juntan.', 'Calcula 145 + 200 y luego agrega los 38 restantes.', 'Suma centenas, decenas y unidades, reagrupando cuando sea necesario.'], encouragement: 'Tradujiste la situación a una suma y combinaste las cantidades.' },
    { id: 'practice-sum-03', prompt: '¿Cuánto es 3,475 + 1,208?', options: ['4,683', '4,673', '4,783', '4,583'], answer: '4,683', hints: ['Escribe los números alineando las unidades.', 'Suma por columnas desde las unidades.', 'Revisa el 7 + 0 de las decenas y el 4 + 2 de las centenas.'], encouragement: 'El valor posicional hace más sencillo sumar números grandes.' },
    { id: 'practice-sum-04', prompt: 'Si avanzas 36 casillas y luego 29 más, ¿cuántas avanzaste?', options: ['55', '65', '75', '63'], answer: '65', hints: ['Junta las dos distancias con una suma.', 'Puedes transformar 29 en 30 y compensar al final.', 'Calcula 36 + 30 y quita una casilla.'], encouragement: 'Usar un número cercano puede hacer el cálculo mental más rápido.' },
    { id: 'practice-sum-05', prompt: '¿Qué número falta? 425 + ___ = 700', options: ['275', '285', '325', '175'], answer: '275', hints: ['Busca cuánto falta de 425 para llegar a 700.', 'Cuenta de 425 a 500 y luego de 500 a 700.', 'Suma esas dos distancias.'], encouragement: 'Pensar en la distancia entre dos números también resuelve una suma faltante.' },
  ],
  resta: [
    { id: 'practice-rest-01', prompt: '¿Cuánto es 624 − 287?', options: ['347', '337', '437', '327'], answer: '337', hints: ['Alinea unidades, decenas y centenas.', 'En las unidades, piensa cómo reagrupar una decena.', 'Resta por columnas después de reagrupar.'], encouragement: 'La reagrupación permite restar cuando una cifra de arriba es menor.' },
    { id: 'practice-rest-02', prompt: 'Había 350 boletos y se usaron 128. ¿Cuántos quedan?', options: ['232', '222', '212', '228'], answer: '222', hints: ['“Quedan” pregunta por la diferencia.', 'Calcula 350 − 100 y después quita 28.', 'Al restar 28, puedes quitar 30 y devolver 2.'], encouragement: 'Identificaste que la situación se resuelve encontrando lo que queda.' },
    { id: 'practice-rest-03', prompt: '¿Cuánto es 1,000 − 476?', options: ['534', '524', '624', '514'], answer: '524', hints: ['Puedes contar desde 476 hasta 1,000.', 'Primero llega de 476 a 500 y luego de 500 a 1,000.', 'Suma los dos saltos para encontrar la diferencia.'], encouragement: 'Contar hacia adelante es una estrategia útil para restar.' },
    { id: 'practice-rest-04', prompt: '¿Qué número falta? ___ − 185 = 315', options: ['400', '500', '510', '490'], answer: '500', hints: ['La resta pregunta qué queda al quitar 185.', 'Para recuperar el número inicial, suma 315 y 185.', 'Verifica que 500 − 185 dé 315.'], encouragement: 'La suma y la resta son operaciones inversas.' },
    { id: 'practice-rest-05', prompt: 'Una cinta mide 2 metros. Si cortan 75 centímetros, ¿cuántos centímetros quedan?', options: ['125 cm', '135 cm', '115 cm', '175 cm'], answer: '125 cm', hints: ['Convierte primero 2 metros a centímetros.', 'Un metro tiene 100 centímetros.', 'Resta 75 a la cantidad equivalente a 2 metros.'], encouragement: 'Convertir a la misma unidad permite comparar y restar correctamente.' },
  ],
  fracciones: [
    { id: 'practice-frac-01', prompt: '¿Cuánto es 1/2 + 1/4?', options: ['2/6', '3/4', '2/4', '1/6'], answer: '3/4', hints: ['Antes de sumar, revisa si las dos fracciones tienen el mismo denominador.', 'Puedes expresar 1/2 en cuartos. ¿Cuántos cuartos equivalen a la mitad?', 'Cuando los denominadores coinciden, suma las partes de arriba y conserva el denominador.'], encouragement: 'Busca una unidad de medida común para ambas partes.' },
    { id: 'practice-frac-02', prompt: '¿Qué fracción es equivalente a 2/3?', options: ['4/6', '3/5', '2/6', '5/6'], answer: '4/6', hints: ['Las fracciones equivalentes representan la misma cantidad.', 'Multiplica el numerador y el denominador por el mismo número.', 'Prueba con el factor 2 y comprueba que el valor no cambie.'], encouragement: 'Si cambias el numerador, aplica el mismo cambio al denominador.' },
    { id: 'practice-frac-03', prompt: '¿Cuánto es 3/5 − 1/5?', options: ['2/5', '2/0', '4/5', '2/10'], answer: '2/5', hints: ['Los denominadores son iguales, así que las partes son del mismo tamaño.', 'Resta los numeradores y conserva el denominador.', 'Piensa: ¿cuántas quintas partes quedan al quitar una de tres?'], encouragement: 'El denominador sigue indicando el tamaño de cada parte.' },
    { id: 'practice-frac-04', prompt: '¿Cuánto es 1/3 + 1/6?', options: ['2/9', '1/2', '2/6', '1/9'], answer: '1/2', hints: ['Para sumar, necesitas que ambas fracciones nombren partes del mismo tamaño.', 'Un denominador común para 3 y 6 es 6.', 'Convierte 1/3 a sextos y luego suma los numeradores.'], encouragement: 'Encuentra un denominador que sea múltiplo de los dos.' },
    { id: 'practice-frac-05', prompt: '¿Cuál es mayor: 3/4 o 2/3?', options: ['2/3', 'Son iguales', '3/4', 'No se puede saber'], answer: '3/4', hints: ['Puedes comparar ambas fracciones usando el mismo denominador.', 'Un denominador común para 4 y 3 es 12.', 'Escribe cada fracción en doceavos y compara sus numeradores.'], encouragement: 'Comparar partes del mismo tamaño hace más clara la decisión.' },
  ],
  multiplicacion: [
    { id: 'practice-mult-01', prompt: '¿Cuánto es 8 × 7?', options: ['54', '56', '64', '48'], answer: '56', hints: ['Puedes pensar en 8 grupos de 7.', 'Descompón 8 × 7 como 4 × 7 + 4 × 7.', 'Recuerda el doble de 28.'], encouragement: 'Prueba una descomposición que ya conozcas.' },
    { id: 'practice-mult-02', prompt: '¿Cuánto es 6 × 9?', options: ['45', '56', '54', '63'], answer: '54', hints: ['Piensa en 6 grupos de 10 y quita un grupo de 6.', 'Primero calcula 6 × 10.', 'Ahora resta 6 al resultado.'], encouragement: 'Usar un número cercano puede simplificar el cálculo.' },
    { id: 'practice-mult-03', prompt: '¿Cuánto es 12 × 4?', options: ['42', '48', '46', '36'], answer: '48', hints: ['Puedes separar 12 en 10 y 2.', 'Calcula 10 × 4 y 2 × 4.', 'Suma los dos productos parciales.'], encouragement: 'Divide un factor y combina los productos.' },
    { id: 'practice-mult-04', prompt: '¿Cuánto es 7 × 6?', options: ['36', '42', '48', '40'], answer: '42', hints: ['Puedes pensar en 5 × 6 y agregar 2 × 6.', 'Calcula 30 + 12.', 'Suma los productos parciales.'], encouragement: 'Busca una tabla que recuerdes y completa lo que falta.' },
    { id: 'practice-mult-05', prompt: '¿Cuánto es 9 × 8?', options: ['64', '72', '81', '68'], answer: '72', hints: ['Piensa en 10 grupos de 8 y quita un grupo.', 'Calcula 10 × 8.', 'Resta 8 al producto.'], encouragement: 'La tabla del diez puede servirte como punto de partida.' },
  ],
}

function inferPracticeErrorPattern(topic: StudentTopic, selected: string): string {
  if (topic === 'fracciones') {
    if (selected === '2/6' || selected === '2/9' || selected === '2/10') return 'suma_lineal_denominadores'
    return 'denominador_comun_fracciones'
  }
  if (topic === 'suma') return 'reagrupacion_valor_posicional'
  if (topic === 'resta') return 'desagrupacion_o_conversion_unidades'
  return 'descomposicion_factores_tablas'
}

function recommendationReason(topic: StudentTopic, percentage: number) {
  return percentage < 50
    ? `En el diagnóstico, ${topicLabels[topic].toLowerCase()} tuvo ${percentage}% de aciertos. Practicar paso a paso puede ayudarte a consolidar las ideas.`
    : `Es el tema con menor porcentaje en tu diagnóstico (${percentage}%). Un poco de práctica puede ayudarte a ganar confianza.`
}

function topicSymbol(topic: StudentTopic) {
  return { suma: '+', resta: '−', multiplicacion: '×', fracciones: '½' }[topic]
}

function topicIconClass(topic: StudentTopic) {
  return { suma: 'sum-icon', resta: 'subtraction-icon', multiplicacion: 'multiplication-icon', fracciones: 'fractions-icon' }[topic]
}

export default function StudentPractice({
  report,
  stats,
  onStatsChange,
  onNavigate,
}: {
  report: DiagnosticReport | null
  stats: PracticeStats
  onStatsChange: (stats: PracticeStats) => void
  onNavigate: (section: Section) => void
}) {
  const target: StudentTopic = report ? weakestTopic(report.topics) : 'fracciones'
  const [selectedTopic, setSelectedTopic] = useState<StudentTopic | null>(null)
  const topic = selectedTopic ?? target
  const topicExercises = exercises[topic]
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [message, setMessage] = useState('')
  const [hintLevel, setHintLevel] = useState(0)
  const [solved, setSolved] = useState(false)
  const [solvedInRun, setSolvedInRun] = useState(0)
  const exercise = topicExercises[index]

  useEffect(() => {
    setSelectedTopic(null)
    setIndex(0)
    setAnswer('')
    setMessage('')
    setHintLevel(0)
    setSolved(false)
    setSolvedInRun(0)
  }, [report?.completedAt])

  const updateStats = (correct: boolean, exerciseId?: string) => {
    const alreadyCompleted = exerciseId ? stats.completedExerciseIds.includes(exerciseId) : true
    onStatsChange({
      ...stats,
      attempts: stats.attempts + 1,
      correct: stats.correct + (correct ? 1 : 0),
      incorrect: stats.incorrect + (correct ? 0 : 1),
      completed: stats.completed + (correct && !alreadyCompleted ? 1 : 0),
      completedExerciseIds: correct && exerciseId && !alreadyCompleted ? [...stats.completedExerciseIds, exerciseId] : stats.completedExerciseIds,
      updatedAt: new Date().toISOString(),
    })
  }

  const checkAnswer = () => {
    if (!answer || solved) return
    if (answer === exercise.answer) {
      setSolved(true)
      setMessage(`¡Muy bien! ${exercise.encouragement}`)
      setSolvedInRun((count) => Math.min(count + 1, topicExercises.length))
      onStatsChange({
        ...stats,
        attempts: stats.attempts + 1,
        correct: stats.correct + 1,
        completed: stats.completed + (stats.completedExerciseIds.includes(exercise.id) ? 0 : 1),
        completedExerciseIds: stats.completedExerciseIds.includes(exercise.id) ? stats.completedExerciseIds : [...stats.completedExerciseIds, exercise.id],
        updatedAt: new Date().toISOString(),
      })
    } else {
      setMessage('Aún no coincide. Revisa tu estrategia y vuelve a intentarlo con el Tutor IA.')
      setHintLevel((current) => Math.min(current + 1, exercise.hints.length))
      updateStats(false)
    }
  }

  const nextExercise = () => {
    setIndex((current) => (current + 1) % topicExercises.length)
    setAnswer('')
    setMessage('')
    setHintLevel(0)
    setSolved(false)
  }

  const revealHint = () => setHintLevel((current) => Math.min(current + 1, exercise.hints.length))
  const progress = Math.round((solvedInRun / topicExercises.length) * 100)

  if (!report) {
    return (
      <section className="student-page" aria-labelledby="practice-title">
        <div className="student-page-heading"><div><span className="eyebrow muted-eyebrow">PRÁCTICA PERSONALIZADA</span><h1 id="practice-title">Primero, conozcamos tu punto de partida.</h1><p>Completa el diagnóstico para que AULA AI sugiera por dónde empezar.</p></div></div>
        <div className="empty-state glass-panel"><div className="student-symbol-large">✦</div><h2>Tu plan empieza con doce preguntas</h2><p>El resultado del diagnóstico elegirá el tema con menor dominio y preparará ejercicios para ti.</p><button className="button button-primary" type="button" onClick={() => onNavigate('diagnostico')}>Ir al diagnóstico <span aria-hidden="true">→</span></button></div>
      </section>
    )
  }

  return (
    <section className="student-page" aria-labelledby="practice-title">
      <div className="student-page-heading practice-page-heading">
        <div><span className="eyebrow muted-eyebrow">TU RUTA DE APRENDIZAJE</span><h1 id="practice-title">Practica a tu ritmo, Sofía.</h1><p>Usamos tu diagnóstico para proponer el siguiente paso. Cada error te da una pista para razonar.</p></div>
        <span className="session-data-pill"><span className="live-dot" /> Conectado a AULA AI</span>
      </div>

      <div className="practice-overview-grid">
        <article className="practice-recommendation glass-panel">
          <span className="eyebrow"><span className="eyebrow-dot" /> RECOMENDACIÓN PERSONALIZADA</span>
          <div className="practice-rec-main"><span className={`topic-icon ${topicIconClass(target)}`}>{topicSymbol(target)}</span><div><span className="topic-overline">EMPEZAMOS POR TU ÁREA DE OPORTUNIDAD</span><h2>{topicLabels[target]}</h2></div><strong className="practice-score">{report.topics.find((item) => item.topic === target)?.percentage ?? 0}%<small> dominio</small></strong></div>
          <p>{recommendationReason(target, report.topics.find((item) => item.topic === target)?.percentage ?? 0)}</p>
          <div className="topic-switch" role="group" aria-label="Elegir tema de práctica">
            {(['suma', 'resta', 'multiplicacion', 'fracciones'] as StudentTopic[]).map((item) => <button key={item} type="button" className={topic === item ? 'selected' : ''} aria-pressed={topic === item} onClick={() => { setSelectedTopic(item); setIndex(0); setAnswer(''); setMessage(''); setHintLevel(0); setSolved(false); setSolvedInRun(0) }}>{topicLabels[item]} <span>{report.topics.find((row) => row.topic === item)?.percentage ?? 0}%</span></button>)}
          </div>
        </article>

        <article className="practice-stats-card glass-panel" aria-label="Resumen de práctica">
          <div className="practice-stats-title"><span className="eyebrow muted-eyebrow">TU PRÁCTICA</span><span className="practice-stat-spark">✦</span></div>
          <strong className="practice-big-number">{solvedInRun}<small> / {topicExercises.length}</small></strong><span className="practice-stat-label">ejercicios en esta ronda</span>
          <div className="practice-progress-track" role="progressbar" aria-label="Progreso de esta ronda de práctica" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>
          <div className="practice-mini-stats"><span><b className="stat-good">{stats.correct}</b> correctas</span><span><b className="stat-needs-work">{stats.incorrect}</b> por revisar</span></div>
          <div className="practice-attempts">{stats.attempts} intentos registrados en esta sesión</div>
        </article>
      </div>

      <div className="practice-session-grid">
        <article className="exercise-card glass-panel" aria-labelledby="exercise-question" key={`${topic}-${exercise.id}`}>
          <div className="exercise-card-head"><div><span className="eyebrow muted-eyebrow">EJERCICIO {String(index + 1).padStart(2, '0')} <span className="exercise-total">/ {String(topicExercises.length).padStart(2, '0')}</span></span><h2>{topicLabels[topic]}</h2></div><span className="exercise-kind">PRACTIQUEMOS</span></div>
          <div className="exercise-progress-track" aria-hidden="true"><span style={{ width: `${Math.round(((index + 1) / topicExercises.length) * 100)}%` }} /></div>
          <div className="exercise-question-block"><span className="question-kicker">PIENSA PASO A PASO</span><h3 id="exercise-question">{exercise.prompt}</h3><p>Elige una opción. Si necesitas apoyo, pide una pista al Tutor IA antes de comprobar.</p></div>
          <div className="exercise-options" role="group" aria-label="Opciones de respuesta">
            {exercise.options.map((option, optionIndex) => <button key={option} type="button" className={`answer-option ${answer === option ? 'is-selected' : ''}`} aria-pressed={answer === option} disabled={solved} onClick={() => { setAnswer(option); setMessage('') }}><span className="answer-letter">{String.fromCharCode(65 + optionIndex)}</span><span className="answer-value">{option}</span><span className="answer-radio" aria-hidden="true">{answer === option && <span />}</span></button>)}
          </div>
          {message && <div className={`practice-feedback ${solved ? 'feedback-success' : 'feedback-retry'}`} role="status"><span aria-hidden="true">{solved ? '✓' : '↗'}</span>{message}</div>}
          {solved ? <div className="exercise-actions"><span className="answer-hint">¡Avanzaste un paso!</span><button className="button button-primary" type="button" onClick={nextExercise}>Siguiente ejercicio <span aria-hidden="true">→</span></button></div> : <div className="exercise-actions"><button className="button button-quiet" type="button" onClick={revealHint} disabled={hintLevel >= exercise.hints.length}>Dame una pista <span aria-hidden="true">✧</span></button><button className="button button-primary" type="button" disabled={!answer} onClick={checkAnswer}>Comprobar <span aria-hidden="true">→</span></button></div>}
        </article>

        <aside className="practice-help-column">
          <TutorChat
            questionPrompt={exercise.prompt}
            studentAnswer={answer || 'Aún no ha seleccionado una opción'}
            errorPattern={inferPracticeErrorPattern(topic, answer)}
          />
          <article className="thinking-card"><span className="thinking-icon">✧</span><span className="eyebrow muted-eyebrow">PISTAS RÁPIDAS</span><h3>Construye el razonamiento.</h3><p>{hintLevel > 0 ? exercise.hints[hintLevel - 1] : 'Intenta resolverlo con calma. Puedes pedir pistas al Tutor IA o usar las pistas rápidas.'}</p><div className="hint-steps" aria-label={`Pista ${hintLevel} de 3`}>{exercise.hints.map((_, hintIndex) => <span className={hintIndex < hintLevel ? 'hint-shown' : ''} key={hintIndex} />)}</div></article>
          <article className="practice-focus-card"><span className="focus-check">✓</span><p>Equivocarse es parte del proceso. Aquí avanzas cuando encuentras tu propio camino.</p></article>
        </aside>
      </div>
      <div className="practice-session-note">Tutor Inteligente conectado al motor socrático de AULA AI con respaldo local de alta disponibilidad.</div>
    </section>
  )
}