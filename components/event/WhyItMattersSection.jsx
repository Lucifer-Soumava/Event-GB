export default function WhyItMattersSection() {
  const concepts = [
    {
      title: 'Fresh Talent',
      tag: 'ORIGINAL VOICES',
      desc: 'Creating an open, dignified springboard for unheralded artists to present their authentic voice, breakthrough original pieces, and creative interpretations.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      title: 'Young & Engaged Audience',
      tag: 'DYNAMIC PATRONS',
      desc: 'Channeling the curiosity, energy, and genuine enthusiasm of youth, university students, and forward-looking art lovers who champion live performing arts.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: 'Bengali Culture & Creativity',
      tag: 'LIVING HERITAGE',
      desc: 'Celebrating Bengal’s profound literary, musical, and theatrical roots while fostering contemporary creative interpretations that resonate across generations.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    {
      title: 'Artist / Community Collaboration',
      tag: 'SHARED COMMUNION',
      desc: 'Breaking down walls between performers, audiences, and senior mentors, fostering a vibrant ecosystem of sustained artistic dialogue and mutual support.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      ),
    },
    {
      title: 'Partner Visibility',
      tag: 'PURPOSEFUL ALLIANCE',
      desc: 'Offering meaningful, tasteful brand association for patrons, organizations, and cultural sponsors seeking intimate engagement with an impassioned, discerning audience.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
  ];

  return (
    <section id="vision" className="section-padding section-secondary">
      <div className="container">
        <div className="section-header">
          <div className="type-kicker">GUIDING PHILOSOPHY &amp; IMPACT</div>
          <h2 className="section-title">
            Why This Event <span className="gold-accent">Matters</span>
          </h2>
          <p className="section-subtitle">
            Five core pillars from our mission that define the spirit, relevance, and cultural significance of Goynar Baksho 2026.
          </p>
          <div className="ornament-divider" aria-hidden="true"></div>
        </div>

        <div className="grid-cols-5">
          {concepts.map((concept, index) => (
            <div key={concept.title} className="card-cultural feature-card">
              <div className="card-header">
                <div className="feature-icon-box">
                  {concept.icon}
                </div>
                <span className="type-caption" style={{ color: 'var(--color-gold-muted)', letterSpacing: '0.12em' }}>
                  {concept.tag}
                </span>
                <h3 className="type-h3" style={{ fontSize: 'var(--font-size-md)', marginTop: '6px', color: 'var(--color-white)' }}>
                  {concept.title}
                </h3>
              </div>

              <div className="card-body" style={{ flexGrow: 1 }}>
                <p className="type-body" style={{ fontSize: '13.5px', color: 'var(--color-cream-muted)', lineHeight: 1.55 }}>
                  {concept.desc}
                </p>
              </div>

              <div className="card-footer" style={{ borderTop: '1px solid var(--color-gold-alpha-15)', paddingTop: 'var(--space-sm)' }}>
                <span className="badge badge-gold" style={{ fontSize: '10px' }}>
                  Pillar 0{index + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
