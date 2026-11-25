import type { Section } from '../components/Navbar'

export default function ReadingComingSoon({ onNavigate }: { onNavigate: (section: Section) => void }) {
  return (
    <section className="student-page" aria-labelledby="reading-title">
      <div className="student-page-heading"><div><span className="eyebrow muted-eyebrow">COMPRENSIÓN LECTORA</span><h1 id="reading-title">Leer también es descubrir.</h1><p>Un espacio para explorar textos, ideas y nuevas preguntas.</p></div></div>
      <div className="empty-state reading-empty glass-panel"><div className="student-symbol-large">Aa</div><span className="eyebrow"><span className="eyebrow-dot" /> PRÓXIMAMENTE</span><h2>Tu biblioteca de aprendizaje se está preparando</h2><p>El módulo de lectura corresponde al integrante 4. Esta ruta queda lista para integrarlo cuando entregue su componente.</p><button className="button button-secondary" type="button" onClick={() => onNavigate('practica')}>Volver a práctica <span aria-hidden="true">→</span></button></div>
    </section>
  )
}
