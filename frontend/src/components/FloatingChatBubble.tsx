import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import type { Mode } from './Navbar'
import { sendChatMessage, type ChatSender } from './chat/chatService'
import './FloatingChatBubble.css'

type FloatingChatBubbleProps = {
  mode: Mode
  sendMessage?: ChatSender
}

type Message = {
  id: number
  role: 'assistant' | 'user'
  text: string
}

type QuickPrompt = {
  label: string
  student: string
  teacher: string
}

const quickPrompts: QuickPrompt[] = [
  {
    label: '¿Por qué fallé?',
    student: 'Ayúdame a entender por qué me equivoqué. Te compartiré el ejercicio y mi respuesta para que me guíes paso a paso.',
    teacher: 'Ayúdame a analizar el error de un estudiante. Te compartiré el ejercicio y su respuesta para identificar una explicación y una pista didáctica.',
  },
  {
    label: 'Traducir fragmento',
    student: 'Quiero traducir un fragmento. Te lo compartiré; ayúdame con una traducción clara y el significado de las palabras difíciles.',
    teacher: 'Ayúdame a preparar una traducción clara de un fragmento y a identificar vocabulario que pueda explicar al grupo.',
  },
  {
    label: 'Armar horario',
    student: 'Ayúdame a armar un horario de estudio realista. Pregúntame mis materias, tareas y tiempo disponible.',
    teacher: 'Ayúdame a organizar un horario de actividades para el grupo. Te compartiré los tiempos y prioridades.',
  },
  {
    label: 'Guía grupal',
    student: 'Guíame para trabajar en grupo. Ayúdame a repartir tareas, escuchar ideas y organizar una conclusión.',
    teacher: 'Ayúdame a preparar una guía grupal con objetivo, pasos, roles y un cierre para revisar lo aprendido.',
  },
]

const welcomeFor: Record<Mode, string> = {
  student: '¡Hola! Estoy aquí para ayudarte con paciencia y paso a paso. Elige una sugerencia o cuéntame qué quieres aprender.',
  teacher: 'Hola. Puedo colaborar contigo para organizar actividades y explicar contenidos. Elige una sugerencia o escribe tu consulta.',
}

function ChatIcon({ name }: { name: 'chat' | 'close' | 'send' | 'spark' }) {
  const paths = {
    chat: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.6-.85L4 20l1.55-4.15A7.45 7.45 0 0 1 4.5 11.5 7.5 7.5 0 0 1 12 4h.5a7.5 7.5 0 0 1 7.5 7.5Z" /><path d="M8 11h8M8 14h5" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    send: <><path d="m21 3-7.2 18-3.9-7.9L2 9.2 21 3Z" /><path d="M21 3 9.9 13.1" /></>,
    spark: <path d="m12 3 1.9 5.3L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.7L12 3Z" />,
  }

  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

export default function FloatingChatBubble({ mode, sendMessage = sendChatMessage }: FloatingChatBubbleProps) {
  const [open, setOpen] = useState(false)
  const isStudent = mode === 'student'

  return (
    <div className={`floating-chat ${mode}`}>
      {open && <ChatPanel key={mode} mode={mode} sendMessage={sendMessage} onClose={() => setOpen(false)} />}
      <button
        className={`chat-launcher ${open ? 'is-open' : ''}`}
        type="button"
        aria-label={open ? 'Cerrar asistente AULA AI' : 'Abrir asistente AULA AI'}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <ChatIcon name={open ? 'close' : 'chat'} />
        {!open && <span className="chat-launcher-label">{isStudent ? '¿Necesitas ayuda?' : 'Asistente docente'}</span>}
      </button>
    </div>
  )
}

type ChatPanelProps = {
  mode: Mode
  sendMessage: ChatSender
  onClose: () => void
}

function ChatPanel({ mode, sendMessage, onClose }: ChatPanelProps) {
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<Message[]>(() => [{ id: 0, role: 'assistant', text: welcomeFor[mode] }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryMessage, setRetryMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef(false)
  const nextIdRef = useRef(1)
  const isStudent = mode === 'student'
  const assistantName = isStudent ? 'Guía AULA AI' : 'Asistente AULA AI'
  const title = isStudent ? 'Tu espacio para aprender' : 'Tu espacio docente'

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const container = messagesRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [messages, loading, error])

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const transmit = async (message: string) => {
    if (requestRef.current || !message.trim()) return
    requestRef.current = true
    setLoading(true)
    setError(null)
    setRetryMessage(message)
    try {
      const reply = await sendMessage(message, mode)
      setMessages((current) => [...current, { id: nextIdRef.current++, role: 'assistant', text: reply }])
      setRetryMessage(null)
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : 'Ocurrió un error al conectar.'
      setError(detail)
    } finally {
      requestRef.current = false
      setLoading(false)
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = draft.trim()
    if (!message || loading) return
    setMessages((current) => [...current, { id: nextIdRef.current++, role: 'user', text: message }])
    setDraft('')
    await transmit(message)
  }

  const submitOnEnter = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  const choosePrompt = (prompt: QuickPrompt) => {
    setDraft(isStudent ? prompt.student : prompt.teacher)
    inputRef.current?.focus()
  }

  return (
    <section className="chat-panel glass-panel" role="dialog" aria-modal="true" aria-labelledby="floating-chat-title">
      <header className="chat-header">
        <span className="chat-avatar" aria-hidden="true"><ChatIcon name="spark" /></span>
        <div className="chat-heading">
          <span className="chat-mode-label">{isStudent ? 'MODO ALUMNO' : 'MODO PROFESOR'}</span>
          <h2 id="floating-chat-title">{title}</h2>
          <span className="chat-assistant-name"><span className="live-dot" />{assistantName}</span>
        </div>
        <button className="chat-icon-button chat-close" type="button" onClick={onClose} aria-label="Cerrar conversación">
          <ChatIcon name="close" />
        </button>
      </header>

      <div className="chat-messages" ref={messagesRef} aria-live="polite" aria-label="Mensajes de la conversación">
        {messages.map((message) => (
          <div className={`chat-message ${message.role}`} key={message.id}>
            {message.role === 'assistant' && <span className="chat-message-avatar" aria-hidden="true">A</span>}
            <p>{message.text}</p>
          </div>
        ))}
        {loading && <div className="chat-loading" role="status"><span className="chat-spinner" /> Enviando tu mensaje…</div>}
        {error && (
          <div className="chat-error" role="alert">
            <span>{error}</span>
            {retryMessage && <button type="button" disabled={loading} onClick={() => void transmit(retryMessage)}>Reintentar</button>}
          </div>
        )}
      </div>

      <div className="chat-suggestions" aria-label="Sugerencias rápidas">
        {quickPrompts.map((prompt) => (
          <button key={prompt.label} type="button" className="chat-suggestion" disabled={loading} onClick={() => choosePrompt(prompt)}>
            {prompt.label}
          </button>
        ))}
      </div>

      <form className="chat-composer" onSubmit={(event) => void submit(event)}>
        <label className="sr-only" htmlFor="floating-chat-input">Escribe tu mensaje</label>
        <textarea
          id="floating-chat-input"
          ref={inputRef}
          rows={1}
          value={draft}
          onChange={(event) => { setDraft(event.target.value); setError(null) }}
          onKeyDown={submitOnEnter}
          placeholder={isStudent ? 'Cuéntame qué quieres aprender…' : '¿Qué te gustaría preparar?'}
          disabled={loading}
          aria-describedby="chat-composer-hint"
        />
        <button className="chat-send-button" type="submit" disabled={loading || !draft.trim()} aria-label="Enviar mensaje">
          <ChatIcon name="send" />
        </button>
        <span id="chat-composer-hint" className="sr-only">Presiona Enter para enviar o Shift más Enter para escribir en otra línea.</span>
      </form>
      <p className="chat-footnote">Enter para enviar · Shift + Enter para nueva línea</p>
    </section>
  )
}
