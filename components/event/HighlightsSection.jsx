export default function HighlightsSection() {
  const highlights = [
    {
      num: '01',
      title: 'Live Performances',
      desc: 'Mesmerizing on-stage performances featuring vibrant musical arrangements, dynamic choreography, and emotive theatrical enactments presented live with authentic acoustics.',
      badge: 'On-Stage Excellence',
    },
    {
      num: '02',
      title: 'Multiple Art Forms',
      desc: 'A rich tapestry spanning classical and contemporary vocal music, expressive dance recitals, spoken poetry recitation, and dramatic theatre all within a single evening.',
      badge: 'Diverse Disciplines',
    },
    {
      num: '03',
      title: 'Artist Collaboration',
      desc: 'Unique interdisciplinary collaborations where musicians, spoken-word poets, and dancers coalesce to create cross-genre artistic works born specifically for this celebration.',
      badge: 'Creative Unity',
    },
    {
      num: '04',
      title: 'Recognition of Emerging Talent',
      desc: 'A dedicated platform committed to spotlighting promising debut artists, celebrating authentic craft, and providing career-defining visibility to the next generation.',
      badge: 'Honor & Visibility',
    },
  ];

  return (
    <section id="highlights" className="section-padding">
      <div className="container">
        <div className="section-header">
          <div className="type-kicker">CURATED FESTIVAL PROGRAM</div>
          <h2 className="section-title">
            Event <span className="gold-accent">Highlights</span>
          </h2>
          <p className="section-subtitle">
            An evening crafted to honor pure artistic craftsmanship, collaborative spirit, and the boundless potential of emerging artists.
          </p>
          <div className="ornament-divider" aria-hidden="true"></div>
        </div>

        <div className="grid-cols-4">
          {highlights.map((item) => (
            <div key={item.num} className="card-cultural corner-ornamented feature-card">
              <div className="card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
                  <span className="type-kicker" style={{ color: 'var(--color-gold-muted)', fontSize: '13px' }}>
                    {item.num}
                  </span>
                  <span className="badge badge-gold" style={{ fontSize: '10px' }}>
                    {item.badge}
                  </span>
                </div>
                <h3 className="type-h3" style={{ fontSize: 'var(--font-size-lg)', marginTop: '8px', color: 'var(--color-gold-highlight)' }}>
                  {item.title}
                </h3>
              </div>

              <div className="card-body" style={{ flexGrow: 1 }}>
                <p className="type-body" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-cream-muted)', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>

              <div className="card-footer" style={{ borderTop: '1px solid var(--color-gold-alpha-15)', paddingTop: 'var(--space-sm)' }}>
                <span className="type-caption" style={{ color: 'var(--color-gold-muted)' }}>
                  Goynar Baksho 2026
                </span>
                <span className="text-gold-bright" style={{ fontSize: '12px' }}>
                  ✦ Featured
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
