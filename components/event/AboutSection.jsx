export default function AboutSection() {
  const artDisciplines = [
    { title: 'Music', desc: 'Vocal recitals, classical ragas, and contemporary acoustic melodies', icon: '🎵' },
    { title: 'Dance', desc: 'Evocative classical, semiclassical, and creative Bengali choreography', icon: '💃' },
    { title: 'Recitation', desc: 'Poignant poetry, literary eloquence, and dramatic voice artistry', icon: '📜' },
    { title: 'Theatre', desc: 'Intimate stage plays, emotive monologues, and dramatic narrative expressions', icon: '🎭' },
  ];

  return (
    <section id="about" className="section-padding section-secondary">
      <div className="container">
        <div className="section-header">
          <div className="type-kicker">CULTURAL GATHERING &amp; ESSENCE</div>
          <h2 className="section-title">
            About the <span className="gold-accent">Celebration</span>
          </h2>
          <p className="section-subtitle">
            A grand evening dedicated to nurturing Bengali creativity, cultural lineage, and original voices.
          </p>
          <div className="ornament-divider" aria-hidden="true"></div>
        </div>

        <div className="card-cultural frame-four-corners">
          <div className="corner-flourish corner-flourish-tl"></div>
          <div className="corner-flourish corner-flourish-tr"></div>
          <div className="corner-flourish corner-flourish-bl"></div>
          <div className="corner-flourish corner-flourish-br"></div>

          <div className="grid-cols-2" style={{ alignItems: 'center' }}>
            <div>
              <div className="bengali-callout" style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-sm)' }}>
                গয়নার বাক্স বার্ষিক উৎসব ২০২৬
              </div>
              <h3 className="type-h2" style={{ marginBottom: 'var(--space-md)', color: 'var(--color-white)' }}>
                A Living Convergence of Emerging Bengali Artistry
              </h3>
              <p className="type-lead" style={{ marginBottom: 'var(--space-md)' }}>
                <strong>Goynar Baksho Annual Celebration 2026</strong> is a prestigious cultural event bringing together emerging artists from music, dance, recitation, theatre, and other art forms on a shared heritage stage.
              </p>
              <p className="type-body" style={{ color: 'var(--color-cream-muted)', marginBottom: 'var(--space-md)' }}>
                Rooted in Bengal&apos;s celebrated legacy of literature, performing arts, and expressive storytelling, the celebration offers a dedicated sanctuary for original voices and new performers to share their craft before an appreciative, culturally attuned audience.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap', marginTop: 'var(--space-md)' }}>
                <span className="badge badge-gold">Bengali Performing Arts</span>
                <span className="badge badge-cream">Emerging Voices Showcase</span>
                <span className="badge badge-vip">1 November 2026</span>
              </div>
            </div>

            {/* Art Forms Matrix */}
            <div className="disciplines-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)' }}>
              {artDisciplines.map((art) => (
                <div
                  key={art.title}
                  style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-gold-alpha-25)',
                    borderRadius: 'var(--radius-xs)',
                    padding: 'var(--space-md)',
                    transition: 'border-color var(--transition-base), transform var(--transition-base)',
                  }}
                  className="card-cultural"
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{art.icon}</div>
                  <h4 className="type-h4" style={{ fontSize: 'var(--font-size-md)', marginBottom: '4px' }}>
                    {art.title}
                  </h4>
                  <p className="type-caption" style={{ color: 'var(--color-cream-muted)', lineHeight: 1.5 }}>
                    {art.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
