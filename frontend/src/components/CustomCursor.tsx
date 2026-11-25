import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [interactive, setInteractive] = useState(false)
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const root = document.documentElement
    let lastInteractive = false

    const updateCursorMode = () => {
      root.classList.toggle('aula-cursor-active', finePointer.matches)
    }
    const moveCursor = (event: PointerEvent) => {
      if (!finePointer.matches || (event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return
      const cursor = cursorRef.current
      if (!cursor) return
      cursor.style.transform = `translate3d(${event.clientX - 13}px, ${event.clientY - 13}px, 0)`
      cursor.classList.add('is-visible')

      const target = event.target instanceof Element
        ? event.target.closest('button:not(:disabled), a, input:not(:disabled), select, summary, [role="button"], [data-cursor="interactive"]')
        : null
      const nextInteractive = Boolean(target)
      if (nextInteractive !== lastInteractive) {
        lastInteractive = nextInteractive
        setInteractive(nextInteractive)
      }
    }
    const hideCursor = () => cursorRef.current?.classList.remove('is-visible')
    const pressCursor = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') setPressed(true)
    }
    const releaseCursor = () => setPressed(false)

    updateCursorMode()
    finePointer.addEventListener('change', updateCursorMode)
    window.addEventListener('pointermove', moveCursor, { passive: true })
    window.addEventListener('pointerleave', hideCursor)
    window.addEventListener('pointerdown', pressCursor)
    window.addEventListener('pointerup', releaseCursor)
    window.addEventListener('pointercancel', releaseCursor)

    return () => {
      finePointer.removeEventListener('change', updateCursorMode)
      window.removeEventListener('pointermove', moveCursor)
      window.removeEventListener('pointerleave', hideCursor)
      window.removeEventListener('pointerdown', pressCursor)
      window.removeEventListener('pointerup', releaseCursor)
      window.removeEventListener('pointercancel', releaseCursor)
      root.classList.remove('aula-cursor-active')
    }
  }, [])

  return createPortal(
    <div ref={cursorRef} className={`aula-custom-cursor ${interactive ? 'is-interactive' : ''} ${pressed ? 'is-pressed' : ''}`} aria-hidden="true">
      <span className="aula-cursor-ring" />
      <svg className="aula-cursor-star" viewBox="0 0 24 24" fill="none">
        <path d="M12 1.5 14.7 9.3 22.5 12l-7.8 2.7L12 22.5l-2.7-7.8L1.5 12l7.8-2.7L12 1.5Z" fill="currentColor" />
        <circle cx="12" cy="12" r="2" fill="#fff" />
      </svg>
    </div>,
    document.body,
  )
}
