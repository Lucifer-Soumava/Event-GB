export default function BreakpointsSection() {
  return (
    <section className="section-padding">
      <div className="container">
        <div className="section-header">
          <div className="type-kicker">ARCHITECTURAL SPECIFICATION</div>
          <h2 className="section-title">Responsive <span className="gold-accent">Breakpoints</span></h2>
          <p className="section-subtitle">
            Systematic breakpoint scale guaranteeing immaculate layout across mobile devices, tablets, desktop workstations, and ultra-wide displays.
          </p>
          <div className="ornament-divider" aria-hidden="true"></div>
        </div>

        <div className="grid-cols-4">
          <div className="card-cultural">
            <span className="badge badge-gold">Mobile XS/SM</span>
            <h4 className="type-h4" style={{ marginTop: '8px' }}>&lt; 640px</h4>
            <p className="type-body" style={{ fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
              Single-column flow, clamped hero fonts, 16px safe margin gutters, touch-optimized button targets.
            </p>
          </div>

          <div className="card-cultural">
            <span className="badge badge-gold">Tablet MD</span>
            <h4 className="type-h4" style={{ marginTop: '8px' }}>640px – 1024px</h4>
            <p className="type-body" style={{ fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
              2-column responsive grids, expanded typography scale, integrated cultural side ornaments.
            </p>
          </div>

          <div className="card-cultural">
            <span className="badge badge-gold">Desktop LG</span>
            <h4 className="type-h4" style={{ marginTop: '8px' }}>1024px – 1280px</h4>
            <p className="type-body" style={{ fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
              3 &amp; 4-column cards, full ornamental framing, sticky cultural navigation, ambient lighting glows.
            </p>
          </div>

          <div className="card-cultural">
            <span className="badge badge-gold">Ultra-Wide XL</span>
            <h4 className="type-h4" style={{ marginTop: '8px' }}>&gt; 1280px</h4>
            <p className="type-body" style={{ fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
              Max container bound of 1240px, generous negative space, theatrical golden ambient backdrops.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
