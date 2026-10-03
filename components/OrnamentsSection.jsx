export default function OrnamentsSection() {
  return (
    <section id="ornaments" className="section-padding">
      <div className="container">
        <div className="section-header">
          <div className="type-kicker">CULTURAL MOTIFS &amp; BORDERS</div>
          <h2 className="section-title">Architectural <span className="gold-accent">Ornaments</span></h2>
          <p className="section-subtitle">
            Delicate Bengali Alpona flourishes, corner filigree brackets, and thin antique gold hairline boundaries inspired by traditional event posters.
          </p>
          <div className="ornament-divider" aria-hidden="true"></div>
        </div>

        <div className="grid-cols-3">
          {/* Corner Filigree Framing */}
          <div className="card-cultural corner-ornamented">
            <div className="card-header">
              <span className="type-kicker">ORNAMENT PATTERN 01</span>
              <h3 className="type-h3" style={{ marginTop: '6px' }}>Corner Filigree</h3>
            </div>
            <p className="type-body">
              Thin antique gold corner accents placed dynamically via SVG motifs. Adds refined poster-frame elegance without heavy box borders.
            </p>
            <div className="card-footer">
              <code className="type-caption">.corner-ornamented</code>
              <span className="text-gold-bright">1px Antique Gold</span>
            </div>
          </div>

          {/* Traditional Inset Double Frame */}
          <div className="frame-ornamental">
            <div className="card-header">
              <span className="type-kicker">ORNAMENT PATTERN 02</span>
              <h3 className="type-h3" style={{ marginTop: '6px' }}>Double Inset Frame</h3>
            </div>
            <p className="type-body">
              Traditional royal invitation poster style with an inner hairline gold border offset by 6px from the outer boundary.
            </p>
            <div className="card-footer" style={{ border: 'none', paddingTop: 0, marginTop: 'var(--space-md)' }}>
              <code className="type-caption">.frame-ornamental</code>
              <span className="text-gold-bright">Double Offset Line</span>
            </div>
          </div>

          {/* Ambient Candlelit Glow */}
          <div className="card-cultural glow-warm-md" style={{ borderColor: 'var(--color-gold-primary)' }}>
            <div className="card-header">
              <span className="type-kicker">ORNAMENT PATTERN 03</span>
              <h3 className="type-h3" style={{ marginTop: '6px' }}>Candlelit Aura</h3>
            </div>
            <p className="type-body">
              Warm 201, 151, 43 glow simulating theatrical warm golden lanterns against dark velvet. Never garish neon or blue SaaS glow.
            </p>
            <div className="card-footer">
              <code className="type-caption">.glow-warm-md</code>
              <span className="text-gold-bright">Warm Light Emission</span>
            </div>
          </div>
        </div>

        {/* Full-Width Cultural Divider Demonstration */}
        <div style={{ marginTop: 'var(--space-3xl)', textAlign: 'center' }}>
          <div className="type-caption" style={{ marginBottom: 'var(--space-sm)' }}>SYMMETRICAL CULTURAL DIVIDER MOTIF</div>
          <div className="ornament-divider ornament-divider-lg" aria-hidden="true"></div>
        </div>
      </div>
    </section>
  );
}
