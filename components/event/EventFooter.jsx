export default function EventFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="alpona-motif" aria-hidden="true"></div>
        <h3 className="type-h3" style={{ color: 'var(--color-gold-highlight)', marginBottom: '4px' }}>
          Goynar Baksho Annual Celebration 2026
        </h3>
        <p className="bengali-callout" style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-cream-warm)', marginBottom: '6px' }}>
          &ldquo;নতুন শিল্পী, নতুন কণ্ঠ, নতুন সুর&rdquo;
        </p>
        <p className="type-subtitle" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-cream-dim)', marginBottom: 'var(--space-md)' }}>
          1 November 2026 • Boys&apos; Own Library Auditorium, Hatibagan, Kolkata 700006
        </p>

        <div className="ornament-divider" aria-hidden="true"></div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-lg)', flexWrap: 'wrap', margin: 'var(--space-md) 0' }}>
          <a href="/#about" style={{ color: 'var(--color-cream-muted)', fontSize: '13px', textDecoration: 'none' }}>About</a>
          <a href="/#highlights" style={{ color: 'var(--color-cream-muted)', fontSize: '13px', textDecoration: 'none' }}>Highlights</a>
          <a href="/schedule" style={{ color: 'var(--color-cream-muted)', fontSize: '13px', textDecoration: 'none' }}>Schedule</a>
          <a href="/#vision" style={{ color: 'var(--color-cream-muted)', fontSize: '13px', textDecoration: 'none' }}>Why It Matters</a>
          <a href="/#audience" style={{ color: 'var(--color-cream-muted)', fontSize: '13px', textDecoration: 'none' }}>Audience</a>
          <a href="/#details" style={{ color: 'var(--color-cream-muted)', fontSize: '13px', textDecoration: 'none' }}>Event Details</a>
          <a href="/register" style={{ color: 'var(--color-gold-highlight)', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>Reserve Pass</a>
          <a href="/design-system" style={{ color: 'var(--color-gold-muted)', fontSize: '13px', textDecoration: 'none' }}>Design System</a>
          <a href="/admin/login" style={{ color: 'var(--color-gold-muted)', fontSize: '13px', textDecoration: 'none' }}>Portal Login</a>
        </div>

        <div className="footer-credits">
          A CELEBRATION OF BENGALI ARTISTRY, EMERGING VOICES &amp; CULTURAL HERITAGE • ALL RIGHTS RESERVED
        </div>
      </div>
    </footer>
  );
}
