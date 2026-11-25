import type { ReactNode } from 'react'
import ProfileAvatar from './ProfileAvatar'

export type Mode = 'student' | 'teacher'
export type Section = 'inicio' | 'diagnostico' | 'practica' | 'progreso' | 'lectura'

type NavbarProps = {
  mode: Mode
  activeSection: Section
  onModeChange: (mode: Mode) => void
  onNavigate: (section: Section) => void
  profileImage: string | null
  onProfileImageChange: (image: string | null) => void
}

const navItems: { id: Section; label: string; icon: string }[] = [
  { id: 'inicio', label: 'Inicio', icon: 'home' },
  { id: 'diagnostico', label: 'Diagnóstico', icon: 'spark' },
  { id: 'practica', label: 'Práctica', icon: 'practice' },
  { id: 'progreso', label: 'Mi progreso', icon: 'chart' },
  { id: 'lectura', label: 'Lectura', icon: 'book' },
]

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 6-7" /><path d="M17 6h3v3" /></>,
    practice: <><path d="m12 3 2.4 5 5.5.8-4 3.9.9 5.5-4.8-2.6-4.8 2.6.9-5.5-4-3.9 5.5-.8L12 3Z" /><path d="M19 17v4M17 19h4" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z" /><path d="M4 18a2.5 2.5 0 0 1 2.5-2.5H20M8 7h7M8 10.5h8" /></>,
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path d="M16 4.5 27.5 25H4.5L16 4.5Z" fill="currentColor" opacity=".95" />
        <path d="M11 20.5h10M13.3 16.5h5.4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="11" r="1.2" fill="#fff" />
      </svg>
    </div>
  )
}

export default function Navbar({ mode, activeSection, onModeChange, onNavigate, profileImage, onProfileImageChange }: NavbarProps) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#inicio" onClick={(event) => { event.preventDefault(); onNavigate('inicio') }} aria-label="AULA AI, ir al inicio">
        <BrandMark />
        <span className="brand-copy">
          <strong>AULA <span>AI</span></strong>
          <small>APRENDE A TU RITMO</small>
        </span>
      </a>

      <div className="sidebar-label">TU ESPACIO</div>
      {mode === 'student' ? (
        <nav className="primary-nav" aria-label="Navegación principal">
          {navItems.map((item) => (
            <button
              className={`nav-item ${activeSection === item.id ? 'is-active' : ''}`}
              type="button"
              key={item.id}
              aria-current={activeSection === item.id ? 'page' : undefined}
              onClick={() => onNavigate(item.id)}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
              {activeSection === item.id && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
      ) : (
        <div className="teacher-nav-note">
          <span className="nav-note-icon"><NavIcon name="chart" /></span>
          <span>Vista docente</span>
          <small>Resumen del grupo</small>
        </div>
      )}

      <div className="sidebar-bottom">
        <div className="mode-label">CAMBIAR MODO</div>
        <div className="mode-switch" role="group" aria-label="Seleccionar modo">
          <button type="button" className={mode === 'student' ? 'selected' : ''} onClick={() => onModeChange('student')} aria-pressed={mode === 'student'}>
            <span className="mode-symbol student-symbol" aria-hidden="true">✦</span>
            Alumno
          </button>
          <button type="button" className={mode === 'teacher' ? 'selected' : ''} onClick={() => onModeChange('teacher')} aria-pressed={mode === 'teacher'}>
            <span className="mode-symbol" aria-hidden="true">◈</span>
            Profesor
          </button>
        </div>

        <div className="profile-card">
          <ProfileAvatar name="Sofía" image={profileImage} variant="sidebar" onImageChange={onProfileImageChange} />
          <div className="profile-copy">
            <strong>{mode === 'student' ? 'Sofía' : 'Modo demostración'}</strong>
            <span>{mode === 'student' ? 'Estudiante · 2° secundaria' : 'AULA AI'}</span>
          </div>
          <span className="profile-status" title="Sesión activa" />
        </div>
        <div className="sidebar-footnote"><span className="tiny-spark">✦</span> Un paso a la vez</div>
      </div>
    </aside>
  )
}
