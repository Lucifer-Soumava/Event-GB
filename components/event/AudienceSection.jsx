export default function AudienceSection() {
  const audienceSegments = [
    {
      title: 'Youth & University Students',
      metric: '45%',
      desc: 'Active student community, campus drama clubs, fine arts scholars, and young creative practitioners eager to discover and champion peer voices.',
    },
    {
      title: 'Art Enthusiasts & Connoisseurs',
      metric: '35%',
      desc: 'Dedicated patrons of Bengali theatre, classical ragas, literary recitation, and cultural enthusiasts who value intimate, focused performances.',
    },
    {
      title: 'Senior Artists & Mentors',
      metric: '20%',
      desc: 'Respected senior practitioners, cultural journalists, and community mentors providing encouragement, feedback, and networking for emerging talent.',
    },
  ];

  return (
    <section id="audience" className="section-padding">
      <div className="container">
        <div className="section-header">
          <div className="type-kicker">CULTURAL COMMUNION &amp; COMMUNITY</div>
          <h2 className="section-title">
            The <span className="gold-accent">Audience</span>
          </h2>
          <p className="section-subtitle">
            An intimate gathering of 150+ engaged patrons, youth tastemakers, and passionate devotees of Bengali performing arts.
          </p>
          <div className="ornament-divider" aria-hidden="true"></div>
        </div>

        <div className="card-cultural frame-four-corners" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="corner-flourish corner-flourish-tl"></div>
          <div className="corner-flourish corner-flourish-tr"></div>
          <div className="corner-flourish corner-flourish-bl"></div>
          <div className="corner-flourish corner-flourish-br"></div>

          <div className="grid-cols-2" style={{ alignItems: 'center' }}>
            <div>
              <span className="badge badge-vip">150+ Expected Attendees</span>
              <h3 className="type-h2" style={{ marginTop: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                An Attentive, Vibrant &amp; Culturally Invested Gathering
              </h3>
              <p className="type-lead" style={{ marginBottom: 'var(--space-md)' }}>
                Unlike massive stadium spectacles, Goynar Baksho 2026 is intentionally staged in an intimate heritage auditorium where every whisper, note, and poetic cadence connects intimately with the listener.
              </p>
              <p className="type-body" style={{ color: 'var(--color-cream-muted)' }}>
                Our audience gathers not merely to spectate, but to actively encourage, converse with, and celebrate emerging artists who are shaping the contemporary renaissance of Bengali artistic expression.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {audienceSegments.map((segment) => (
                <div
                  key={segment.title}
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-gold-alpha-25)',
                    borderRadius: 'var(--radius-xs)',
                    padding: 'var(--space-md) var(--space-lg)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-md)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-family-display)',
                      fontSize: 'var(--font-size-xl)',
                      color: 'var(--color-gold-highlight)',
                      fontWeight: 700,
                      minWidth: '55px',
                    }}
                  >
                    {segment.metric}
                  </div>
                  <div>
                    <h4 className="type-h4" style={{ fontSize: 'var(--font-size-sm)', marginBottom: '2px', color: 'var(--color-white)' }}>
                      {segment.title}
                    </h4>
                    <p className="type-caption" style={{ color: 'var(--color-cream-muted)', lineHeight: 1.5 }}>
                      {segment.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
