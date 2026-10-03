export default function Hero() {
  return (
    <header className="hero-section">
      <div className="hero-backdrop-glow"></div>
      <div className="container hero-content">
        <div className="alpona-motif" aria-hidden="true"></div>
        <div className="type-kicker">
          <span>ESTABLISHED DESIGN SYSTEM</span>
          <span>•</span>
          <span>BENGALI CULTURAL HERITAGE</span>
        </div>
        <h1 className="type-hero" style={{ marginTop: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
          Goynar Baksho <span className="gold-accent">2026</span>
        </h1>
        <p className="type-subtitle" style={{ marginBottom: 'var(--space-lg)' }}>
          A cinematic, elegant black &amp; antique-gold visual language for a prestigious cultural soiree.
        </p>
        <div className="ornament-divider" aria-hidden="true"></div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', flexWrap: 'wrap', marginTop: 'var(--space-lg)' }}>
          <span className="badge badge-vip">Annual Gala 2026</span>
          <span className="badge badge-gold">Bengali Cultural Event</span>
          <span className="badge badge-cream">Design Specification v1.0</span>
        </div>
      </div>
    </header>
  );
}
