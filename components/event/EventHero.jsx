export default function EventHero() {
  return (
    <section className="hero-section" id="hero">
      <div className="hero-backdrop-glow" style={{ animation: 'subtleGlowPulse 6s ease-in-out infinite' }}></div>
      <div className="container hero-content">
        {/* Subtle entrance animation on badge and kicker */}
        <div className="animate-entrance">
          <div className="alpona-motif" aria-hidden="true"></div>
          <div className="type-kicker">
            <span>PREMIER BENGALI CULTURAL FESTIVAL</span>
            <span>•</span>
            <span>KOLKATA 2026</span>
          </div>
        </div>

        {/* Large Event Title */}
        <h1
          className="type-hero animate-entrance animate-delay-1"
          style={{ marginTop: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}
        >
          Goynar Baksho <br />
          <span className="gold-accent">Annual Celebration 2026</span>
        </h1>

        {/* Bengali Tagline */}
        <div className="animate-entrance animate-delay-1">
          <p
            className="bengali-callout"
            style={{
              fontSize: 'clamp(1.4rem, 1.2rem + 1.2vw, 2.2rem)',
              margin: 'var(--space-md) auto',
              fontWeight: 600,
              textShadow: '0 0 20px rgba(242, 184, 63, 0.4)',
              letterSpacing: '0.04em',
            }}
          >
            &ldquo;নতুন শিল্পী, নতুন কণ্ঠ, নতুন সুর&rdquo;
          </p>
          <div className="ornament-divider" aria-hidden="true"></div>
        </div>

        {/* Event Date & Venue Ribbon */}
        <div className="animate-entrance animate-delay-2" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="event-meta-ribbon">
            <div className="event-meta-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>1 NOVEMBER 2026</span>
            </div>

            <div className="event-meta-divider"></div>

            <div className="event-meta-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>BOYS&apos; OWN LIBRARY AUDITORIUM, HATIBAGAN, KOLKATA 700006</span>
            </div>

            <div className="event-meta-divider"></div>

            <div className="event-meta-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>150+ EXPECTED ATTENDEES</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="animate-entrance animate-delay-2"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-md)',
            flexWrap: 'wrap',
            marginTop: 'var(--space-xl)',
          }}
        >
          <a href="#register" className="btn btn-gold-primary btn-lg">
            <span>Register Now</span>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>

          <a href="#about" className="btn btn-gold-outline btn-lg">
            <span>Explore Event</span>
          </a>
        </div>

        {/* Cinematic Stage Imagery with Ornamental Gold Framing */}
        <div className="hero-media-wrapper animate-entrance animate-delay-3">
          <div className="corner-flourish corner-flourish-tl"></div>
          <div className="corner-flourish corner-flourish-tr"></div>
          <div className="corner-flourish corner-flourish-bl"></div>
          <div className="corner-flourish corner-flourish-br"></div>

          <div className="hero-media-container">
            <img
              src="/images/hero-stage.jpg"
              alt="Goynar Baksho Annual Celebration 2026 - Classical Bengali stage with sitar, harmonium, tabla, and expressive dancers under warm golden theatrical lights"
              width={980}
              height={551}
              loading="eager"
            />
            <div className="hero-media-caption">
              <span className="type-caption" style={{ color: 'var(--color-gold-highlight)', letterSpacing: '0.15em' }}>
                AN INTIMATE HERITAGE STAGE CELEBRATING EMERGING BENGALI ARTS AND CULTURE
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
