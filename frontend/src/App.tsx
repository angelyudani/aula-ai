import { useCallback, useEffect, useState } from 'react'
import Navbar, { type Mode, type Section } from './components/Navbar'
import StudentDiagnostic from './pages/StudentDiagnostic'
import StudentPractice from './pages/StudentPractice'
import StudentProgress from './pages/StudentProgress'
import StudentReading from './pages/StudentReading'
import TeacherDashboard from './pages/TeacherDashboard'
import ProfileAvatar from './components/ProfileAvatar'
import CustomCursor from './components/CustomCursor'
import FloatingChatBubble from './components/FloatingChatBubble'
import { initialPracticeStats, type DiagnosticReport, type PracticeStats } from './types/student'

export type NavigationRequest = { section: Section; sequence: number }
type Theme = 'dark' | 'light'

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return window.localStorage.getItem('aula-ai-theme') === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem('aula-ai-profile-photo')
    } catch {
      return null
    }
  })
  const [mode, setMode] = useState<Mode>('student')
  const [activeSection, setActiveSection] = useState<Section>('inicio')
  const [navigationRequest, setNavigationRequest] = useState<NavigationRequest>({ section: 'inicio', sequence: 0 })
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null)
  const [practiceStats, setPracticeStats] = useState<PracticeStats>(initialPracticeStats)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      window.localStorage.setItem('aula-ai-theme', theme)
    } catch {
      // Keep the selected theme for this session when storage is unavailable.
    }
  }, [theme])

  useEffect(() => {
    try {
      if (profileImage) window.localStorage.setItem('aula-ai-profile-photo', profileImage)
      else window.localStorage.removeItem('aula-ai-profile-photo')
    } catch {
      // The chosen image stays available for this session if storage is unavailable.
    }
  }, [profileImage])

  const handleNavigate = useCallback((section: Section) => {
    setNavigationRequest((current) => ({ section, sequence: current.sequence + 1 }))
    setActiveSection(section)
  }, [])

  const handleSectionChange = useCallback((section: Section) => {
    setActiveSection(section)
  }, [])

  const handleModeChange = (nextMode: Mode) => {
    setMode(nextMode)
    if (nextMode === 'student') setActiveSection('inicio')
  }

  const sectionTitles: Record<Section, string> = {
    inicio: 'Aprende a tu ritmo',
    diagnostico: 'Tu punto de partida',
    practica: 'Practica a tu ritmo',
    progreso: 'Tus avances, paso a paso',
    lectura: 'Explora y comprende',
  }

  return (
    <div className="app-shell">
      <CustomCursor />
      <div className="ambient ambient-top" aria-hidden="true" />
      <div className="ambient ambient-side" aria-hidden="true" />
      <Navbar mode={mode} activeSection={activeSection} onModeChange={handleModeChange} onNavigate={handleNavigate} profileImage={profileImage} onProfileImageChange={setProfileImage} />

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-title">
            <span className="breadcrumb">AULA AI <span>/</span> {mode === 'student' ? 'ESPACIO DEL ESTUDIANTE' : 'ESPACIO DOCENTE'}</span>
            <h2>{mode === 'student' ? sectionTitles[activeSection] : 'Tu grupo, más cerca'}</h2>
          </div>
          <div className="topbar-right">
            <button
              className="theme-toggle"
              type="button"
              onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
              aria-label={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
              aria-pressed={theme === 'light'}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                {theme === 'dark' ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></> : <path d="M20.5 15.2A8.7 8.7 0 0 1 8.8 3.5a8.8 8.8 0 1 0 11.7 11.7Z" />}
              </svg>
              <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
            </button>
            <span className="session-pill"><span className="live-dot" /> Sesión de demostración</span>
            <ProfileAvatar name="Sofía" image={profileImage} variant="topbar" onImageChange={setProfileImage} />
          </div>
        </header>

        {mode === 'student' ? (
          <>
            <div hidden={activeSection !== 'inicio' && activeSection !== 'diagnostico'}>
              <StudentDiagnostic
                navigationRequest={navigationRequest}
                onSectionChange={handleSectionChange}
                onComplete={setDiagnosticReport}
                onStart={() => setDiagnosticReport(null)}
                onExploreReading={() => handleNavigate('lectura')}
                profileImage={profileImage}
              />
            </div>
            <div hidden={activeSection !== 'practica'}>
              <StudentPractice report={diagnosticReport} stats={practiceStats} onStatsChange={setPracticeStats} onNavigate={handleNavigate} />
            </div>
            <div hidden={activeSection !== 'progreso'}>
              <StudentProgress report={diagnosticReport} stats={practiceStats} onNavigate={handleNavigate} />
            </div>
            <div hidden={activeSection !== 'lectura'}>
              <StudentReading onNavigate={handleNavigate} />
            </div>
          </>
        ) : (
          <TeacherDashboard />
        )}

        <footer className="app-footer">
          <span>Hecho para aprender, paso a paso.</span>
          <span className="footer-right"><span className="footer-star">✦</span> AULA AI <span className="footer-separator">·</span> 2026</span>
        </footer>
      </main>

      <FloatingChatBubble
        role={mode}
        contextHint={mode === 'student' ? sectionTitles[activeSection] : 'Panel Docente'}
      />
    </div>
  )
}

export default App