import { useEffect, useMemo, useRef, useState } from 'react'
import type { NavigationRequest } from '../App'
import type { Section } from '../components/Navbar'
import { submitDiagnostic } from '../services/api'
import type { DiagnosticRequest, DiagnosticResponse } from '../types/api'
import type { DiagnosticReport, StudentTopic, TopicResult } from '../types/student'

type TopicKey = StudentTopic
type DiagnosticScreen = 'welcome' | 'quiz' | 'results'

type DiagnosticQuestion = {
  id: string
  topic: TopicKey
  prompt: string
  options: string[]
  correctAnswer: string
}

const topicNames: Record<TopicKey, string> = {
  suma: 'Suma',
  resta: 'Resta',
  multiplicacion: 'Multiplicación',
  fracciones: 'Fracciones',
}

const questions: DiagnosticQuestion[] = [
  { id: 'sum-01', topic: 'suma', prompt: '¿Cuánto es 248 + 135?', options: ['373', '383', '393', '283'], correctAnswer: '383' },
  { id: 'sum-02', topic: 'suma', prompt: 'En una caja hay 36 lápices y agregan 27 más. ¿Cuántos hay ahora?', options: ['53', '63', '73', '59'], correctAnswer: '63' },
  { id: 'sum-03', topic: 'suma', prompt: '¿Cuánto es 1,250 + 750?', options: ['1,900', '2,000', '2,100', '1,500'], correctAnswer: '2,000' },
  { id: 'rest-01', topic: 'resta', prompt: '¿Cuánto es 503 − 178?', options: ['335', '325', '425', '315'], correctAnswer: '325' },
  { id: 'rest-02', topic: 'resta', prompt: 'Había 82 libros y prestaron 29. ¿Cuántos quedan?', options: ['53', '63', '51', '57'], correctAnswer: '53' },
  { id: 'rest-03', topic: 'resta', prompt: '¿Cuánto es 1,000 − 465?', options: ['545', '535', '635', '525'], correctAnswer: '535' },
  { id: 'mult-01', topic: 'multiplicacion', prompt: '¿Cuánto es 7 × 8?', options: ['54', '56', '64', '48'], correctAnswer: '56' },
  { id: 'mult-02', topic: 'multiplicacion', prompt: '¿Cuánto es 9 × 6?', options: ['54', '56', '63', '48'], correctAnswer: '54' },
  { id: 'mult-03', topic: 'multiplicacion', prompt: '¿Cuánto es 12 × 4?', options: ['46', '48', '42', '44'], correctAnswer: '48' },
  { id: 'frac-01', topic: 'fracciones', prompt: '¿Cuánto es 1/2 + 1/3?', options: ['2/5', '5/6', '1/6', '3/5'], correctAnswer: '5/6' },
  { id: 'frac-02', topic: 'fracciones', prompt: '¿Cuánto es 1/4 + 2/4?', options: ['3/8', '2/4', '3/4', '1/2'], correctAnswer: '3/4' },
  { id: 'frac-03', topic: 'fracciones', prompt: '¿Cuánto es 2/3 + 1/6?', options: ['3/9', '5/6', '1/2', '3/6'], correctAnswer: '5/6' },
]

const topics: TopicKey[] = ['suma', 'resta', 'multiplicacion', 'fracciones']

function getLevel(percentage: number): TopicResult['level'] {
  if (percentage >= 80) return 'Dominado'
  if (percentage >= 50) return 'En práctica'
  return 'Necesita apoyo'
}

function calculateResults(answers: Record<string, string>): TopicResult[] {
  return topics.map((topic) => {
    const topicQuestions = questions.filter((question) => question.topic === topic)
    const correct = topicQuestions.filter((question) => answers[question.id] === question.correctAnswer).length
    const percentage = Math.round((correct / topicQuestions.length) * 100)

    return {
      topic,
      correct,
      incorrect: topicQuestions.length - correct,
      percentage,
      level: getLevel(percentage),
    }
  })
}

function topicsFromApi(response: DiagnosticResponse): TopicResult[] {
  return topics.map((topic) => {
    const percentage = response.scoresByTopic[topic] ?? 0
    const correct = Math.round((percentage / 100) * 3)
    return { topic, correct, incorrect: 3 - correct, percentage, level: getLevel(percentage) }
  })
}

function getRecommendation(results: TopicResult[]) {
  const weakest = [...results].sort((a, b) => a.percentage - b.percentage)[0]
  if (weakest.percentage === 100) {
    return {
      eyebrow: 'TU SIGUIENTE PASO',
      title: '¡Tienes una base muy sólida!',
      body: 'Respondiste correctamente todos los ejercicios. Sigue practicando para que estos conocimientos se queden contigo.'
    }
  }

  const practiceNames: Record<TopicKey, string> = {
    suma: 'las sumas',
    resta: 'las restas',
    multiplicacion: 'las multiplicaciones',
    fracciones: 'las fracciones',
  }
  return {
    eyebrow: 'TU SIGUIENTE PASO',
    title: weakest.level === 'Necesita apoyo' ? `Practiquemos ${practiceNames[weakest.topic]}.` : `Sigue ganando confianza en ${practiceNames[weakest.topic]}.`,
    body: 'El diagnóstico nos muestra dónde conviene poner atención. Puedes volver a intentarlo cuando quieras y comparar cómo avanzas.'
  }
}

function TopicIcon({ topic }: { topic: TopicKey }) {
  if (topic === 'suma' || topic === 'resta') return (
    <svg aria-hidden="true" viewBox="0 0 40 40" fill="none">
      <path d="M11.5 20h17M20 11.5v17" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" style={topic === 'resta' ? { display: 'none' } : undefined} />
      {topic === 'resta' && <path d="M11.5 20h17" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />}
      <circle cx="20" cy="20" r="17.5" stroke="currentColor" strokeOpacity=".22" />
    </svg>
  )
  return topic === 'multiplicacion' ? (
    <svg aria-hidden="true" viewBox="0 0 40 40" fill="none">
      <path d="M12 11.5 28 27.5M28 11.5 12 27.5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="20" cy="20" r="15.5" stroke="currentColor" strokeOpacity=".25" />
      <circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeOpacity=".12" strokeDasharray="2 4" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 40 40" fill="none">
      <path d="M11.5 15h17M11.5 25h17M20 10v20" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="20" cy="20" r="17.5" stroke="currentColor" strokeOpacity=".18" />
      <circle cx="20" cy="20" r="12.5" stroke="currentColor" strokeOpacity=".2" strokeDasharray="2 4" />
    </svg>
  )
}

function topicIconClass(topic: TopicKey) {
  return { suma: 'sum-icon', resta: 'subtraction-icon', multiplicacion: 'multiplication-icon', fracciones: 'fractions-icon' }[topic]
}

function Sparkle({ className = '' }: { className?: string }) {
  return <span className={`sparkle ${className}`} aria-hidden="true">✦</span>
}

function WelcomeScreen({ onStart, hasProgress, notice, onExploreReading, profileImage }: { onStart: () => void; hasProgress: boolean; notice: string; onExploreReading: () => void; profileImage: string | null }) {
  return (
    <section className="diagnostic-content welcome-screen" aria-labelledby="welcome-title">
      {notice && <div className="inline-notice" role="status">{notice}</div>}
      <div className="welcome-hero glass-panel">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkle /> TU DIAGNÓSTICO INICIAL <span className="eyebrow-line" /></div>
          <h1 id="welcome-title">¡Hola, Sofía<span className="hero-comma">!</span></h1>
          <p className="hero-lede">Descubre qué temas dominas y cuáles puedes mejorar.</p>
          <p className="hero-detail">Una pequeña evaluación para ayudarte a aprender a tu ritmo. Sin presión: cada respuesta nos ayuda a conocerte mejor.</p>
          <button className="button button-primary hero-button" type="button" onClick={onStart}>
            {hasProgress ? 'Retomar diagnóstico' : 'Comenzar diagnóstico'}
            <span className="button-arrow" aria-hidden="true">→</span>
          </button>
          <div className="hero-note"><span className="check-ring" aria-hidden="true">✓</span> {questions.length} preguntas <span className="note-divider">·</span> {topics.length} temas <span className="note-divider">·</span> A tu propio ritmo</div>
        </div>
        <div className="hero-art" aria-hidden={profileImage ? undefined : true}>
          <div className="art-orbit orbit-a" />
          <div className="art-orbit orbit-b" />
          <span className="art-star art-star-one">✦</span>
          <span className="art-star art-star-two">✧</span>
          <div className={`art-core ${profileImage ? 'has-profile-photo' : ''}`}>
            {profileImage ? <img className="art-profile-photo" src={profileImage} alt="Foto de perfil de Sofía" /> : <div className="art-core-inner"><span className="core-spark">✦</span><span className="core-word">AULA</span><span className="core-ai">AI</span></div>}
          </div>
          <div className="floating-math math-card-one"><span>7 × 8</span><b>56</b></div>
          <div className="floating-math math-card-two"><span>1/2 + 1/3</span><b>?</b></div>
          <span className="art-particle particle-one" />
          <span className="art-particle particle-two" />
          <span className="art-particle particle-three" />
        </div>
        <div className="hero-glow" aria-hidden="true" />
      </div>

      <div className="section-heading">
        <div>
          <span className="eyebrow muted-eyebrow">LO QUE VAMOS A EXPLORAR</span>
          <h2>Cuatro temas y una lectura para comenzar.</h2>
        </div>
        <span className="question-count"><Sparkle /> {questions.length} preguntas · {topics.length} temas</span>
      </div>

      <div className="topic-grid">
        <article className="topic-card multiplication-card" tabIndex={0}>
          <div className="topic-card-top">
            <div className="topic-icon multiplication-icon"><TopicIcon topic="multiplicacion" /></div>
            <span className="topic-count">03 <span>/ 04</span></span>
          </div>
          <div className="topic-card-copy">
            <span className="topic-overline">OPERACIONES</span>
            <h3>Multiplicación</h3>
            <p>Explora qué tan bien manejas las tablas y los productos.</p>
          </div>
          <div className="topic-card-footer"><span className="topic-dot magenta-dot" /> 3 preguntas <span className="topic-footer-line" /> <span className="topic-footer-mark">×</span></div>
        </article>
        <article className="topic-card fractions-card" tabIndex={0}>
          <div className="topic-card-top">
            <div className="topic-icon fractions-icon"><TopicIcon topic="fracciones" /></div>
            <span className="topic-count">04 <span>/ 04</span></span>
          </div>
          <div className="topic-card-copy">
            <span className="topic-overline">NÚMEROS RACIONALES</span>
            <h3>Fracciones</h3>
            <p>Revisa cómo sumas partes con el mismo o distinto denominador.</p>
          </div>
          <div className="topic-card-footer"><span className="topic-dot violet-dot" /> 3 preguntas <span className="topic-footer-line" /> <span className="topic-footer-mark fraction-mark">½</span></div>
        </article>
        <article className="topic-card sum-card" tabIndex={0}>
          <div className="topic-card-top"><div className="topic-icon sum-icon"><TopicIcon topic="suma" /></div><span className="topic-count">01 <span>/ 04</span></span></div>
          <div className="topic-card-copy"><span className="topic-overline">OPERACIONES</span><h3>Suma</h3><p>Combina cantidades y practica sumas con números de varios dígitos.</p></div>
          <div className="topic-card-footer"><span className="topic-dot sum-dot" /> 3 preguntas <span className="topic-footer-line" /><span className="topic-footer-mark">+</span></div>
        </article>
        <article className="topic-card subtraction-card" tabIndex={0}>
          <div className="topic-card-top"><div className="topic-icon subtraction-icon"><TopicIcon topic="resta" /></div><span className="topic-count">02 <span>/ 04</span></span></div>
          <div className="topic-card-copy"><span className="topic-overline">OPERACIONES</span><h3>Resta</h3><p>Encuentra diferencias y resuelve situaciones cotidianas paso a paso.</p></div>
          <div className="topic-card-footer"><span className="topic-dot subtraction-dot" /> 3 preguntas <span className="topic-footer-line" /><span className="topic-footer-mark">−</span></div>
        </article>
        <button className="topic-card reading-topic-card" type="button" onClick={onExploreReading}>
          <div className="topic-card-top"><div className="topic-icon reading-icon"><span aria-hidden="true">Aa</span></div><span className="topic-count">LECTURA</span></div>
          <div className="topic-card-copy"><span className="topic-overline">COMPRENSIÓN LECTORA</span><h3>Comprensión lectora</h3><p>Lee una historia breve, encuentra sus ideas y responde preguntas.</p></div>
          <div className="topic-card-footer"><span className="topic-dot reading-dot" /> Texto y preguntas <span className="topic-footer-line" /><span className="topic-footer-mark">Aa</span></div>
        </button>
      </div>

      <div className="reassurance-strip"><div className="reassurance-icon"><Sparkle /></div><p><strong>Esto no es un examen.</strong> Es una forma de descubrir qué sabes y cómo podemos ayudarte a avanzar.</p><span className="reassurance-arrow" aria-hidden="true">✧</span></div>
    </section>
  )
}

function QuizScreen({
  currentIndex,
  answers,
  onSelect,
  onBack,
  onContinue,
  notice,
  isSubmitting,
}: {
  currentIndex: number
  answers: Record<string, string>
  onSelect: (answer: string) => void
  onBack: () => void
  onContinue: () => void
  notice: string
  isSubmitting: boolean
}) {
  const question = questions[currentIndex]
  const selectedAnswer = answers[question.id]
  const answeredCount = Object.keys(answers).length
  const optionLetters = ['A', 'B', 'C', 'D']
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100)

  return (
    <section className="diagnostic-content quiz-screen" aria-labelledby="question-title">
      <div className="quiz-heading-row">
        <div>
          <span className="eyebrow muted-eyebrow">UN PASO A LA VEZ</span>
          <h1>Diagnóstico <span className="heading-light">inicial</span></h1>
          <p>Piensa con calma. Puedes cambiar tu respuesta antes de continuar.</p>
        </div>
        <div className="quiz-total-pill"><span className="quiz-total-icon"><Sparkle /></span><span><strong>{answeredCount}<small> / {questions.length}</small></strong><em>respondidas</em></span></div>
      </div>

      <div className="quiz-layout">
        <aside className="quiz-aside">
          <div className="progress-card glass-panel">
            <div className="progress-card-head"><span>Tu recorrido</span><Sparkle /></div>
            <div className="progress-number"><strong>{String(currentIndex + 1).padStart(2, '0')}</strong><span> / {String(questions.length).padStart(2, '0')}</span></div>
            <div className="progress-track" role="progressbar" aria-label="Progreso del diagnóstico" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>
            <div className="progress-caption"><span>Progreso</span><strong>{progress}%</strong></div>
            <div className="progress-steps" aria-hidden="true">{questions.map((item, index) => <span key={item.id} className={`${index < currentIndex ? 'step-complete' : ''} ${index === currentIndex ? 'step-current' : ''}`} />)}</div>
            <div className="progress-topic"><span className={`topic-dot ${question.topic === 'multiplicacion' ? 'magenta-dot' : question.topic === 'fracciones' ? 'violet-dot' : question.topic === 'suma' ? 'sum-dot' : 'subtraction-dot'}`} /> <span>{topicNames[question.topic]}</span><span className="topic-step">Tema {topics.indexOf(question.topic) + 1} de {topics.length}</span></div>
          </div>

          <div className="encouragement-card">
            <div className="encouragement-star"><Sparkle /></div>
            <strong>Confía en lo que sabes.</strong>
            <p>Cada pregunta es una oportunidad para aprender algo sobre ti.</p>
            <span className="encouragement-doodle" aria-hidden="true">✧</span>
          </div>
        </aside>

        <div className="question-panel glass-panel" key={question.id}>
          <div className="question-panel-top">
            <span className={`topic-chip chip-${question.topic}`}><span className="topic-dot" /> {topicNames[question.topic]}</span>
            <span className="question-index">PREGUNTA <strong>{String(currentIndex + 1).padStart(2, '0')}</strong><span> / {String(questions.length).padStart(2, '0')}</span></span>
          </div>
          <div className="question-body">
            <span className="question-kicker">ELIGE UNA RESPUESTA</span>
            <h2 id="question-title">{question.prompt}</h2>
            <p>Selecciona la opción que te parezca correcta.</p>
          </div>
          <div className="answer-list w-full" role="group" aria-label="Opciones de respuesta">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option
              return (
                <button
                  className={`answer-option ${isSelected ? 'is-selected' : ''}`}
                  type="button"
                  key={option}
                  aria-pressed={isSelected}
                  onClick={() => onSelect(option)}
                >
                  <span className="answer-letter">{optionLetters[index]}</span>
                  <span className="answer-value">{option}</span>
                  <span className="answer-radio" aria-hidden="true">{isSelected && <span />}</span>
                </button>
              )
            })}
          </div>
          {notice && <div className="inline-notice quiz-notice" role="status">{notice}</div>}
          <div className="question-actions flex items-center gap-3">
            <button className="button button-quiet" type="button" onClick={onBack} disabled={currentIndex === 0}><span aria-hidden="true">←</span> Anterior</button>
            <span className="answer-hint">{selectedAnswer ? 'Respuesta guardada' : 'Elige una opción para continuar'}</span>
            <button className="button button-primary continue-button" type="button" onClick={onContinue} disabled={!selectedAnswer || isSubmitting}>
              {isSubmitting ? 'Guardando…' : currentIndex === questions.length - 1 ? 'Ver resultados' : 'Continuar'} <span className="button-arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function ResultScreen({ results, answers, onRepeat, syncStatus }: { results: TopicResult[]; answers: Record<string, string>; onRepeat: () => void; syncStatus: 'saved' | 'local' }) {
  const totalCorrect = results.reduce((sum, result) => sum + result.correct, 0)
  const recommendation = getRecommendation(results)

  return (
    <section className="diagnostic-content results-screen" aria-labelledby="results-title">
      <div className="results-hero glass-panel">
        <div className="results-hero-copy">
          <span className="eyebrow"><Sparkle /> TU MAPA DE APRENDIZAJE</span>
          <h1 id="results-title">¡Muy bien, Sofía<span>!</span></h1>
          <p>Terminaste el diagnóstico. Aquí puedes ver lo que ya dominas y lo que puedes seguir practicando.</p>
        </div>
        <div className="score-orbit" aria-label={`${totalCorrect} de ${questions.length} respuestas correctas`}>
          <svg viewBox="0 0 150 150" aria-hidden="true">
            <circle className="score-ring-bg" cx="75" cy="75" r="61" />
            <circle className="score-ring-value" cx="75" cy="75" r="61" style={{ strokeDasharray: `${(totalCorrect / questions.length) * 383.3} 383.3` }} />
          </svg>
          <div className="score-center"><strong>{totalCorrect}<span>/{questions.length}</span></strong><small>ACERTADAS</small></div>
          <span className="score-orbit-spark">✦</span>
        </div>
        <span className="results-orb orb-one" aria-hidden="true" />
        <span className="results-orb orb-two" aria-hidden="true" />
      </div>

      <div className="section-heading results-section-heading">
        <div><span className="eyebrow muted-eyebrow">DETALLE POR TEMA</span><h2>Tu progreso, tema por tema.</h2></div>
        <span className="question-count"><span className="result-count-dot" /> {questions.length} respuestas revisadas</span>
      </div>

      <div className={`inline-notice ${syncStatus === 'saved' ? 'teacher-save-success' : ''}`} role="status">
        {syncStatus === 'saved'
          ? 'Diagnóstico guardado para Sofía. El panel docente ya puede consultar sus resultados.'
          : 'No se pudo conectar con el servidor. Estos resultados solo están en esta sesión y no actualizaron el panel docente.'}
      </div>

      <div className="result-grid">
        {results.map((result) => (
          <article className={`result-card result-${result.topic}`} key={result.topic}>
            <div className="result-card-head">
              <div className={`topic-icon ${topicIconClass(result.topic)}`}><TopicIcon topic={result.topic} /></div>
              <span className={`level-badge level-${result.level === 'Dominado' ? 'mastered' : result.level === 'En práctica' ? 'practice' : 'support'}`}><span />{result.level}</span>
            </div>
            <div className="result-title-row"><div><span className="topic-overline">{result.topic === 'fracciones' ? 'NÚMEROS RACIONALES' : 'OPERACIONES'}</span><h3>{topicNames[result.topic]}</h3></div><strong className="result-percentage">{result.percentage}<span>%</span></strong></div>
            <div className="result-meter" role="progressbar" aria-label={`Aciertos en ${topicNames[result.topic]}`} aria-valuenow={result.percentage} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${result.percentage}%` }} /></div>
            <div className="result-meter-caption"><span>Nivel de dominio</span><strong>{result.percentage}%</strong></div>
            <div className="result-stats">
              <div className="result-stat"><span className="stat-mark correct-mark">✓</span><span>Correctas</span><strong>{result.correct}</strong></div>
              <div className="result-stat"><span className="stat-mark incorrect-mark">×</span><span>Incorrectas</span><strong>{result.incorrect}</strong></div>
            </div>
            <div className="result-card-note"><span className="note-spark">✧</span>{result.correct} de {result.correct + result.incorrect} preguntas correctas</div>
          </article>
        ))}
      </div>

      <div className="recommendation-card">
        <div className="recommendation-icon"><Sparkle /></div>
        <div className="recommendation-copy"><span className="eyebrow muted-eyebrow">{recommendation.eyebrow}</span><h3>{recommendation.title}</h3><p>{recommendation.body}</p></div>
        <div className="recommendation-action"><span className="recommendation-label">¿Quieres intentarlo otra vez?</span><button className="button button-secondary" type="button" onClick={onRepeat}>Repetir diagnóstico <span aria-hidden="true">↻</span></button></div>
      </div>
      <div className="results-footnote"><span>✦</span> Este resultado es una guía para aprender; no es una calificación oficial.</div>
      <details className="answer-review"><summary>Revisar mis respuestas <span aria-hidden="true">⌄</span></summary><div className="answer-review-list">{questions.map((question, index) => <div className="answer-review-row" key={question.id}><span className="review-number">{String(index + 1).padStart(2, '0')}</span><span className="review-prompt">{question.prompt}</span><span className={`review-answer ${answers[question.id] === question.correctAnswer ? 'review-correct' : 'review-incorrect'}`}>{answers[question.id]} {answers[question.id] === question.correctAnswer ? '✓' : `· correcta: ${question.correctAnswer}`}</span></div>)}</div></details>
    </section>
  )
}

export default function StudentDiagnostic({
  navigationRequest,
  onSectionChange,
  onComplete,
  onStart,
  onExploreReading,
  profileImage,
}: {
  navigationRequest: NavigationRequest
  onSectionChange: (section: Section) => void
  onComplete: (report: DiagnosticReport) => void
  onStart: () => void
  onExploreReading: () => void
  profileImage: string | null
}) {
  const [screen, setScreen] = useState<DiagnosticScreen>('welcome')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'saved' | 'local'>('local')
  const results = useMemo(() => calculateResults(answers), [answers])
  const hasProgress = Object.keys(answers).length > 0
  const lastNavigationSequence = useRef(0)

  useEffect(() => {
    const section: Section = screen === 'welcome' ? 'inicio' : 'diagnostico'
    onSectionChange(section)
  }, [screen, onSectionChange])

  useEffect(() => {
    if (navigationRequest.sequence === 0 || lastNavigationSequence.current === navigationRequest.sequence) return
    lastNavigationSequence.current = navigationRequest.sequence
    setNotice('')

    if (navigationRequest.section === 'inicio') {
      setScreen('welcome')
    } else if (navigationRequest.section === 'diagnostico') {
      if (screen === 'results') {
        setCurrentIndex(0)
        setScreen('quiz')
      } else {
        setScreen('quiz')
      }
    }
  }, [navigationRequest.sequence, navigationRequest.section, screen, onSectionChange])

  const startDiagnostic = () => {
    onStart()
    setNotice('')
    setCurrentIndex(0)
    setAnswers({})
    setScreen('quiz')
  }

  const selectAnswer = (answer: string) => {
    const question = questions[currentIndex]
    setAnswers((current) => ({ ...current, [question.id]: answer }))
    setNotice('')
  }

  const continueQuestion = async () => {
    if (!answers[questions[currentIndex].id]) {
      setNotice('Selecciona una respuesta para continuar.')
      return
    }
    setNotice('')
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((current) => current + 1)
    } else {
      const studentId = 'alum-demo-45'
      const request: DiagnosticRequest = {
        studentId,
        answers: questions.map((question) => ({ questionId: question.id, answer: answers[question.id] ?? '' })),
      }
      setIsSubmitting(true)
      let report: DiagnosticReport
      try {
        const response = await submitDiagnostic(request)
        report = {
          studentId,
          studentName: 'Sofía',
          completedAt: new Date().toISOString(),
          topics: topicsFromApi(response),
          answers: { ...answers },
          source: 'api',
        }
        setSyncStatus('saved')
      } catch {
        report = {
          studentId,
          studentName: 'Sofía',
          completedAt: new Date().toISOString(),
          topics: calculateResults(answers),
          answers: { ...answers },
          source: 'mock',
        }
        setSyncStatus('local')
      } finally {
        setIsSubmitting(false)
      }
      onComplete(report)
      setScreen('results')
    }
  }

  const goBack = () => {
    setNotice('')
    setCurrentIndex((current) => Math.max(0, current - 1))
  }

  const repeatDiagnostic = () => {
    onStart()
    setCurrentIndex(0)
    setAnswers({})
    setNotice('')
    setScreen('quiz')
  }

  return (
    <>
      {screen === 'welcome' && <WelcomeScreen onStart={startDiagnostic} hasProgress={hasProgress} notice={notice} onExploreReading={onExploreReading} profileImage={profileImage} />}
      {screen === 'quiz' && <QuizScreen currentIndex={currentIndex} answers={answers} onSelect={selectAnswer} onBack={goBack} onContinue={continueQuestion} notice={notice} isSubmitting={isSubmitting} />}
      {screen === 'results' && <ResultScreen results={results} answers={answers} onRepeat={repeatDiagnostic} syncStatus={syncStatus} />}
    </>
  )
}
