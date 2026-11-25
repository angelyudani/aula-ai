import { useState } from 'react'
import type { Section } from '../components/Navbar'

const questions = [
  {
    prompt: '¿Cuál es la idea principal del texto?',
    options: ['Luna aprende a cuidar un huerto con ayuda de su comunidad.', 'Luna quería comprar todas las plantas del mercado.', 'La lluvia impidió que crecieran las semillas.'],
    answer: 'Luna aprende a cuidar un huerto con ayuda de su comunidad.',
    feedback: 'El texto cuenta cómo Luna y sus vecinos preparan, cuidan y comparten lo que crece en el huerto.',
    hint: 'Piensa en lo que ocurre desde el comienzo hasta el final de la historia.',
  },
  {
    prompt: '¿Por qué Don Luis recomendó poner las semillas en agua antes de sembrarlas?',
    options: ['Para que germinaran más rápido.', 'Para que cambiaran de color.', 'Para medir cuánta lluvia caería.'],
    answer: 'Para que germinaran más rápido.',
    feedback: 'Don Luis explicó que así algunas semillas comenzarían a germinar más rápido.',
    hint: 'Busca la explicación que Don Luis dio cuando entregó las semillas.',
  },
  {
    prompt: '¿Qué se puede inferir cuando los vecinos comparten la cosecha?',
    options: ['Que colaborar ayuda a que todos disfruten el resultado.', 'Que Luna hizo todo el trabajo sin ayuda.', 'Que las verduras solo sirven para venderlas.'],
    answer: 'Que colaborar ayuda a que todos disfruten el resultado.',
    feedback: 'Aunque cada persona ayudó de una manera distinta, compartieron lo que cosecharon.',
    hint: 'Relaciona el trabajo de los vecinos con lo que hicieron al final.',
  },
  {
    prompt: 'En el texto, ¿qué significa “cosecha”?',
    options: ['Los frutos y verduras que se recogen al crecer.', 'El lugar donde se guardan las herramientas.', 'El agua que se usa para regar.'],
    answer: 'Los frutos y verduras que se recogen al crecer.',
    feedback: 'La cosecha es lo que se recoge de las plantas después de cultivarlas.',
    hint: 'Observa qué encontraron Luna y sus vecinos después de cuidar las plantas.',
  },
]

const passage = [
  'El sábado por la mañana, Luna encontró un terreno vacío junto a la biblioteca. Don Luis, el bibliotecario, le contó que antes allí había un pequeño huerto. Luna invitó a sus vecinos a recuperarlo.',
  'Primero quitaron las piedras y aflojaron la tierra. Don Luis llevó semillas de frijol y calabaza. Les explicó que algunas semillas germinaban más rápido si las dejaban en agua durante la noche. Los niños hicieron letreros para recordar dónde habían sembrado cada una.',
  'Durante las semanas siguientes, varias familias se turnaron para regar las plantas. Cuando llegó el momento de cosechar, encontraron frijoles, calabazas y algunas flores. Luna propuso compartir todo con quienes habían ayudado. Desde entonces, el huerto se convirtió en un lugar para aprender y trabajar en equipo.'
]

export default function ReadingComingSoon({ onNavigate }: { onNavigate: (section: Section) => void }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState('')
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(0)
  const question = questions[index]
  const isCorrect = checked && selected === question.answer

  const checkAnswer = () => {
    if (!selected || checked) return
    setChecked(true)
    if (selected === question.answer) setCorrect((count) => count + 1)
  }

  const nextQuestion = () => {
    setIndex((current) => current + 1)
    setSelected('')
    setChecked(false)
  }

  const restart = () => {
    setIndex(0)
    setSelected('')
    setChecked(false)
    setCorrect(0)
  }

  return (
    <section className="student-page reading-page" aria-labelledby="reading-title">
      <div className="student-page-heading">
        <div><span className="eyebrow muted-eyebrow">COMPRENSIÓN LECTORA</span><h1 id="reading-title">Leer también es descubrir.</h1><p>Lee con calma, encuentra pistas en el texto y construye tus propias respuestas.</p></div>
        {index < questions.length && <span className="session-data-pill"><span className="live-dot" /> Pregunta {index + 1} de {questions.length}</span>}
      </div>

      {index < questions.length ? (
        <div className="reading-layout">
          <article className="reading-passage glass-panel">
            <div className="reading-passage-head"><span className="reading-book-icon" aria-hidden="true">Aa</span><div><span className="eyebrow muted-eyebrow">LECTURA BREVE</span><h2>El huerto de la biblioteca</h2></div></div>
            <div className="reading-text">{passage.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}</div>
            <div className="reading-vocabulary"><span className="vocabulary-mark">✧</span><p><strong>Pista de lectura</strong> Puedes volver al texto para encontrar nombres, motivos y detalles que apoyen tu respuesta.</p></div>
          </article>

          <article className="reading-question-card glass-panel" aria-labelledby="reading-question">
            <div className="reading-question-head"><span className="eyebrow"><span className="eyebrow-dot" /> COMPRENDE Y RESPONDE</span><span className="reading-question-count">{String(index + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}</span></div>
            <div className="reading-progress-track" aria-hidden="true"><span style={{ width: `${Math.round(((index + 1) / questions.length) * 100)}%` }} /></div>
            <h2 id="reading-question">{question.prompt}</h2>
            <div className="reading-options" role="group" aria-label="Opciones de respuesta">
              {question.options.map((option, optionIndex) => <button key={option} type="button" className={`answer-option ${selected === option ? 'is-selected' : ''} ${checked && option === question.answer ? 'reading-correct-option' : ''}`} aria-pressed={selected === option} onClick={() => { if (!checked) setSelected(option) }} disabled={checked}><span className="answer-letter">{String.fromCharCode(65 + optionIndex)}</span><span className="answer-value">{option}</span><span className="answer-radio" aria-hidden="true">{selected === option && <span />}</span></button>)}
            </div>
            {checked && <div className={`practice-feedback ${isCorrect ? 'feedback-success' : 'feedback-retry'}`} role="status"><span aria-hidden="true">{isCorrect ? '✓' : '↗'}</span>{isCorrect ? question.feedback : `Revisa el texto y vuelve a intentarlo. ${question.hint}`}</div>}
            <div className="reading-actions">{checked && !isCorrect ? <button className="button button-secondary" type="button" onClick={() => { setChecked(false); setSelected('') }}>Intentar de nuevo <span aria-hidden="true">↻</span></button> : checked ? <button className="button button-primary" type="button" onClick={nextQuestion}>{index === questions.length - 1 ? 'Ver resultado' : 'Siguiente pregunta'} <span aria-hidden="true">→</span></button> : <button className="button button-primary" type="button" onClick={checkAnswer} disabled={!selected}>Comprobar respuesta <span aria-hidden="true">→</span></button>}</div>
          </article>
        </div>
      ) : (
        <article className="reading-finish glass-panel">
          <span className="reading-finish-icon" aria-hidden="true">✦</span><span className="eyebrow muted-eyebrow">LECTURA COMPLETADA</span><h2>¡Terminaste esta historia!</h2><p>Respondiste correctamente {correct} de {questions.length} preguntas. Puedes volver al texto o explorar otro tema.</p>
          <div className="reading-finish-actions"><button className="button button-secondary" type="button" onClick={restart}>Leer de nuevo <span aria-hidden="true">↻</span></button><button className="button button-primary" type="button" onClick={() => onNavigate('practica')}>Ir a práctica <span aria-hidden="true">→</span></button></div>
        </article>
      )}
    </section>
  )
}
