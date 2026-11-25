import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { createPortal } from 'react-dom'

type ProfileAvatarProps = {
  name: string
  image: string | null
  variant: 'sidebar' | 'topbar'
  onImageChange: (image: string | null) => void
}

const maxFileSize = 10 * 1024 * 1024
const maxImageSide = 512

export default function ProfileAvatar({ name, image, variant, onImageChange }: ProfileAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLElement>(null)
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const errorId = `${variant}-profile-photo-error`

  useEffect(() => {
    if (!isOpen) return
    modalRef.current?.querySelector<HTMLButtonElement>('.profile-modal-close')?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      triggerRef.current?.focus()
    }
  }, [isOpen])

  const readImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Elige un archivo de imagen.')
      event.target.value = ''
      return
    }
    if (file.size > maxFileSize) {
      setError('La imagen debe pesar menos de 10 MB.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onerror = () => setError('No se pudo leer la imagen. Intenta con otro archivo.')
    reader.onload = () => {
      const photo = new Image()
      photo.onerror = () => setError('No se pudo abrir la imagen. Intenta con otro archivo.')
      photo.onload = () => {
        const scale = Math.min(1, maxImageSide / Math.max(photo.naturalWidth, photo.naturalHeight))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(photo.naturalWidth * scale))
        canvas.height = Math.max(1, Math.round(photo.naturalHeight * scale))
        const context = canvas.getContext('2d')
        if (!context) {
          setError('No se pudo preparar la imagen. Intenta de nuevo.')
          return
        }

        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.drawImage(photo, 0, 0, canvas.width, canvas.height)
        onImageChange(canvas.toDataURL('image/jpeg', 0.84))
        setError('')
        if (variant === 'topbar') setIsOpen(false)
        event.target.value = ''
      }
      photo.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className={`profile-avatar-control profile-avatar-${variant}`}>
      <button
        ref={triggerRef}
        className={`profile-avatar-trigger ${variant === 'sidebar' ? 'avatar' : 'topbar-avatar'}`}
        type="button"
        title="Cambiar foto de perfil"
        aria-label={image ? `Cambiar foto de perfil de ${name}` : `Agregar foto de perfil a ${name}`}
        aria-describedby={error ? errorId : undefined}
        onClick={() => {
          setError('')
          if (variant === 'topbar') setIsOpen(true)
          else inputRef.current?.click()
        }}
      >
        {image ? <img src={image} alt="" aria-hidden="true" /> : <span className="profile-avatar-initial">{name.charAt(0).toUpperCase()}</span>}
        <span className="profile-avatar-camera" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7h3l1.5-2h7L17 7h3v12H4z" /><circle cx="12" cy="13" r="3.2" />
          </svg>
        </span>
      </button>
      {image && (
        <button
          className="profile-avatar-remove"
          type="button"
          aria-label={`Quitar foto de perfil de ${name}`}
          title="Quitar foto"
          onClick={() => { onImageChange(null); setError('') }}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m3 4v5m6-5v5" /></svg>
        </button>
      )}
      <input ref={inputRef} className="profile-avatar-input" type="file" accept="image/*" aria-label="Elegir una foto de perfil" onChange={readImage} />
      {error && (variant !== 'topbar' || !isOpen) && <span className="profile-avatar-error" id={errorId} role="alert">{error}</span>}
      {variant === 'topbar' && isOpen && createPortal(
        <div className="profile-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false) }}>
          <section ref={modalRef} className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title" aria-describedby={error ? errorId : undefined} onKeyDown={(event) => {
            if (event.key !== 'Tab') return
            const focusable = modalRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
            if (!focusable?.length) return
            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
          }}>
            <button className="profile-modal-close profile-icon-button" type="button" aria-label="Cerrar" title="Cerrar" onClick={() => setIsOpen(false)}>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
            <div className="profile-modal-photo" key={image ?? 'empty'}>
              {image ? <img src={image} alt={`Foto de perfil de ${name}`} /> : <span>{name.charAt(0).toUpperCase()}</span>}
            </div>
            <span className="eyebrow muted-eyebrow">TU PERFIL</span>
            <h2 id="profile-modal-title">Foto de {name}</h2>
            <p className="profile-modal-caption">Personaliza tu espacio con una foto de perfil.</p>
            <div className="profile-modal-actions">
              <button className="profile-icon-button profile-change-button" type="button" aria-label={image ? 'Cambiar foto de perfil' : 'Agregar foto de perfil'} title={image ? 'Cambiar foto' : 'Agregar foto'} onClick={() => inputRef.current?.click()}>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h3l1.5-2h8L18 7h2v12H4z" /><circle cx="12" cy="13" r="3.3" /><path d="M17 9h.01" /></svg>
              </button>
              {image && <button className="profile-icon-button profile-delete-button" type="button" aria-label="Borrar foto de perfil" title="Borrar foto" onClick={() => { onImageChange(null); setError(''); setIsOpen(false) }}>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m3 4v5m6-5v5" /></svg>
              </button>}
            </div>
            {error && <span className="profile-modal-error" id={errorId} role="alert">{error}</span>}
          </section>
        </div>,
        document.body,
      )}
    </div>
  )
}
