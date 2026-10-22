export default function EventInfoSection() {
  const details = [
    {
      title: 'EVENT DATE',
      value: '1 November 2026',
      sub: 'Sunday Evening Gala',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      title: 'VENUE LOCATION',
      value: "Boys' Own Library Auditorium",
      sub: 'Hatibagan, Kolkata 700006',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      title: 'TIMING & DURATION',
      value: '1:00 PM – 6:30 PM IST',
      sub: '5.5 Hours of Continuous Performances',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      title: 'EXPECTED ATTENDEES',
      value: '150+ Attendees',
      sub: 'Intimate Auditorium Capacity',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  return (
    <section id="details" className="section-padding section-secondary">
      <div className="container">
        <div className="section-header">
          <div className="type-kicker">ESSENTIAL LOGISTICS &amp; VENUE</div>
          <h2 className="section-title">
            Event <span className="gold-accent">Information</span>
          </h2>
          <p className="section-subtitle">
            Everything you need to plan your presence at the Goynar Baksho Annual Celebration 2026.
          </p>
          <div className="ornament-divider" aria-hidden="true"></div>
        </div>

        <div className="grid-cols-4">
          {details.map((item) => (
            <div key={item.title} className="card-cultural feature-card">
              <div className="card-header">
                <div className="feature-icon-box">
                  {item.icon}
                </div>
                <span className="type-kicker" style={{ color: 'var(--color-gold-muted)', fontSize: '11px' }}>
                  {item.title}
                </span>
                <div className="info-card-value">{item.value}</div>
                <div className="info-card-sub">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Venue Highlight Card with Decorative Inset Frame */}
        <div className="frame-ornamental" style={{ marginTop: 'var(--space-2xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
            <div>
              <span className="badge badge-gold">Heritage Kolkata Venue</span>
              <h3 className="type-h3" style={{ marginTop: 'var(--space-xs)', color: 'var(--color-white)' }}>
                Boys&apos; Own Library Auditorium
              </h3>
              <p className="type-body" style={{ color: 'var(--color-cream-muted)', marginTop: '4px' }}>
                Located in historic Hatibagan, North Kolkata (PIN 700006) — easily accessible via Shyambazar Metro and Bidhan Sarani transit lines.
              </p>
            </div>
            <div>
              <a
                href="#register"
                className="btn btn-gold-primary btn-sm"
              >
                <span>Reserve An Invitation</span>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
