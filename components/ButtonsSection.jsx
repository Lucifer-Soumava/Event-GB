export default function ButtonsSection() {
  return (
    <section id="buttons" className="section-padding section-secondary">
      <div className="container">
        <div className="section-header">
          <div className="type-kicker">INTERACTIVE CALLS TO ACTION</div>
          <h2 className="section-title">Button <span className="gold-accent">Variants</span></h2>
          <p className="section-subtitle">
            Sculpted with antique gold gradients, micro-glow elevations, and delicate letterspaced uppercase typography.
          </p>
          <div className="ornament-divider" aria-hidden="true"></div>
        </div>

        <div className="card-cultural frame-four-corners">
          <div className="corner-flourish corner-flourish-tl"></div>
          <div className="corner-flourish corner-flourish-tr"></div>
          <div className="corner-flourish corner-flourish-bl"></div>
          <div className="corner-flourish corner-flourish-br"></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
            {/* Button Styles Row */}
            <div>
              <div className="type-kicker" style={{ marginBottom: 'var(--space-md)' }}>PRIMARY, OUTLINE &amp; GHOST STYLES</div>
              <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-gold-primary">
                  <span>Reserve VIP Invitation</span>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>

                <button type="button" className="btn btn-gold-outline">
                  <span>Explore Event Schedule</span>
                </button>

                <button type="button" className="btn btn-gold-ghost">
                  <span>View Cultural Program</span>
                </button>

                <button type="button" className="btn btn-gold-primary" disabled aria-disabled="true">
                  <span>Sold Out</span>
                </button>
              </div>
            </div>

            <hr className="divider-gold-hairline" style={{ margin: 0 }} />

            {/* Button Sizes Row */}
            <div>
              <div className="type-kicker" style={{ marginBottom: 'var(--space-md)' }}>PROPORTIONAL SIZES</div>
              <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-gold-primary btn-sm">Small (btn-sm)</button>
                <button type="button" className="btn btn-gold-primary">Medium (Default)</button>
                <button type="button" className="btn btn-gold-primary btn-lg">Large Gala (btn-lg)</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
