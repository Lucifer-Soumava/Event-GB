export default function CardsSection() {
  return (
    <section id="cards" className="section-padding">
      <div className="container">
        <div className="section-header">
          <div className="type-kicker">CONTAINMENT &amp; SURFACES</div>
          <h2 className="section-title">Card &amp; Ticket <span className="gold-accent">Passes</span></h2>
          <p className="section-subtitle">
            Architectural card surfaces utilizing #171008 warm espresso backgrounds, hairline gold boundaries, and commemorative ticket notches.
          </p>
          <div className="ornament-divider" aria-hidden="true"></div>
        </div>

        <div className="grid-cols-3">
          {/* Standard Cultural Card */}
          <div className="card-cultural">
            <div className="card-header">
              <span className="badge badge-gold">Standard Tier</span>
              <h3 className="type-h3" style={{ marginTop: 'var(--space-sm)' }}>General Admission</h3>
              <div className="type-lead text-gold-bright" style={{ marginTop: '4px', fontWeight: 600 }}>₹ 1,500</div>
            </div>
            <div className="card-body">
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--font-size-sm)', color: 'var(--color-cream-muted)' }}>
                <li>✓ Access to Grand Cultural Auditorium</li>
                <li>✓ Evening Musical &amp; Dance Soiree</li>
                <li>✓ Commemorative Celebration Brochure</li>
              </ul>
            </div>
            <div className="card-footer">
              <button type="button" className="btn btn-gold-outline btn-sm" style={{ width: '100%' }}>Select Tier</button>
            </div>
          </div>

          {/* Featured VIP Card */}
          <div className="card-cultural card-cultural-featured corner-ornamented">
            <div className="card-header">
              <span className="badge badge-vip">★ Most Prestigious</span>
              <h3 className="type-h3" style={{ marginTop: 'var(--space-sm)' }}>VIP Patron Pass</h3>
              <div className="type-lead text-gold-bright" style={{ marginTop: '4px', fontWeight: 600 }}>₹ 4,500</div>
            </div>
            <div className="card-body">
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--font-size-sm)', color: 'var(--color-cream-warm)' }}>
                <li>✓ Reserved Front-Row Royal Seating</li>
                <li>✓ Exclusive Bengali Royal Banquet Dinner</li>
                <li>✓ Artist Meet &amp; Greet Reception</li>
                <li>✓ Hardcover Goynar Baksho 2026 Archive</li>
              </ul>
            </div>
            <div className="card-footer">
              <button type="button" className="btn btn-gold-primary btn-sm" style={{ width: '100%' }}>Reserve VIP Pass</button>
            </div>
          </div>

          {/* Commemorative Ticket Pass Card */}
          <div className="card-pass">
            <div className="card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="type-kicker">ADMIT ONE</span>
                <span className="badge badge-gold-solid">NO. GB-2026</span>
              </div>
              <h3 className="type-h3" style={{ marginTop: 'var(--space-sm)' }}>Gala Banquet Pass</h3>
            </div>
            <div className="card-body" style={{ flexGrow: 1 }}>
              <div style={{ marginBottom: 'var(--space-sm)' }}>
                <div className="type-caption">DATE &amp; TIME</div>
                <div className="type-body text-gold-bright">Nov 14, 2026 • 06:30 PM IST</div>
              </div>
              <div>
                <div className="type-caption">VENUE</div>
                <div className="type-body">The Grand Heritage Hall, Kolkata</div>
              </div>
            </div>
            <div className="card-footer" style={{ borderTop: '1px dashed var(--color-gold-muted)' }}>
              <span className="type-caption">VALID WITH PHOTO ID</span>
              <span className="text-gold-bright">AUTHENTIC SEAL</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
