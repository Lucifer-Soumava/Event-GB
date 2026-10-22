'use client';

import Link from 'next/link';

export default function ScheduleTeaserSection() {
  const highlightSegments = [
    {
      time: '13:00 – 13:15',
      title: 'Sacred Invocations & Opening Recitals',
      category: 'Inauguration & Music',
      desc: 'Vaidik Mantra Chanting, melodic vocal songs by Arkadeep, and classical dance by Shreyashi.',
      badge: 'Opening Segment',
    },
    {
      time: '13:15 – 14:45',
      title: 'Celebrity Guests & Media Partnerships',
      category: 'Celebrity & Media',
      desc: 'Star celebrity appearances, Bigg Boss panel discussion, Joyeeta dance, and media broadcasts.',
      badge: 'Star Encounters',
    },
    {
      time: '14:45 – 15:40',
      title: 'Literary Launch, Hosting & Ramp Walk',
      category: 'Literature & Fashion',
      desc: 'Bisai Da & Diya Di hosting, official Book Launch, and glamorous cultural Ramp Walk.',
      badge: 'Culture & Style',
    },
    {
      time: '15:40 – 16:45',
      title: 'Live Band Concert & Celebrity Guests 2 & 3',
      category: 'Live Music & Rock',
      desc: '30-minute electrifying headline Live Band, Star Guests 2 & 3, and Bigg Boss feature.',
      badge: 'Headline Concert',
    },
    {
      time: '16:45 – 17:25',
      title: 'Group Dance, Debdoot Da & The Bak Show',
      category: 'Theatre & Dance',
      desc: 'Soulful song by Debdoot Da, synchronized Grand Group Dance, and flagship The Bak Show.',
      badge: 'Signature Shows',
    },
    {
      time: '17:25 – 18:30',
      title: 'Grand Felicitation & United Finale',
      category: 'Honors & Finale',
      desc: 'Artist honors, All Sponsor felicitation, media partners, and "We Are Goynar Baksho" ending.',
      badge: 'Closing Ceremony',
    },
  ];

  return (
    <section id="schedule" className="section-padding" style={{ position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="type-kicker">
            <span>28 LIVE SESSIONS</span>
            <span>•</span>
            <span>1:00 PM – 6:30 PM</span>
            <span>•</span>
            <span>1 NOV 2026</span>
          </div>
          <h2 className="section-title">
            Festival <span className="gold-accent">Programme & Events</span>
          </h2>
          <p className="bengali-callout" style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-gold-highlight)', marginBottom: 'var(--space-xs)' }}>
            &ldquo;নতুন শিল্পী, নতুন কণ্ঠ, নতুন সুর&rdquo;
          </p>
          <p className="section-subtitle">
            An afternoon and evening cultural tapestry of 28 curated sessions — Vedic mantra chanting, dance recitals, live music bands, literary launches, Bigg Boss dialogues, ramp walk, and star celebrity appearances.
          </p>
          <div className="ornament-divider" aria-hidden="true"></div>
        </div>

        {/* Festival Quick Stat Badges */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-2xl)',
          }}
        >
          <div className="card-cultural" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
            <div style={{ color: 'var(--color-gold-highlight)', fontSize: '2rem', fontFamily: 'var(--font-family-display)', fontWeight: '700' }}>
              28
            </div>
            <div className="type-caption" style={{ color: 'var(--color-cream-muted)', letterSpacing: '0.08em', marginTop: '4px' }}>
              SCHEDULED EVENTS
            </div>
          </div>

          <div className="card-cultural" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
            <div style={{ color: 'var(--color-gold-highlight)', fontSize: '2rem', fontFamily: 'var(--font-family-display)', fontWeight: '700' }}>
              5.5 Hrs
            </div>
            <div className="type-caption" style={{ color: 'var(--color-cream-muted)', letterSpacing: '0.08em', marginTop: '4px' }}>
              NON-STOP CELEBRATION
            </div>
          </div>

          <div className="card-cultural" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
            <div style={{ color: 'var(--color-gold-highlight)', fontSize: '2rem', fontFamily: 'var(--font-family-display)', fontWeight: '700' }}>
              1:00 PM
            </div>
            <div className="type-caption" style={{ color: 'var(--color-cream-muted)', letterSpacing: '0.08em', marginTop: '4px' }}>
              STARTING TIME
            </div>
          </div>

          <div className="card-cultural" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
            <div style={{ color: 'var(--color-gold-highlight)', fontSize: '2rem', fontFamily: 'var(--font-family-display)', fontWeight: '700' }}>
              12+
            </div>
            <div className="type-caption" style={{ color: 'var(--color-cream-muted)', letterSpacing: '0.08em', marginTop: '4px' }}>
              ARTISTIC GENRES
            </div>
          </div>
        </div>

        {/* Highlights Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-lg)',
            marginBottom: 'var(--space-2xl)',
          }}
        >
          {highlightSegments.map((segment, idx) => (
            <div
              key={idx}
              className="card-cultural"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 'var(--space-xl)',
                transition: 'transform 0.3s ease, border-color 0.3s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <span className="schedule-time-badge" style={{ fontSize: '12px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{segment.time}</span>
                  </span>
                  <span className="badge badge-gold" style={{ fontSize: '10px' }}>
                    {segment.badge}
                  </span>
                </div>

                <h3 className="type-h3" style={{ fontSize: '1.25rem', color: 'var(--color-white)', marginBottom: '8px' }}>
                  {segment.title}
                </h3>

                <p className="type-body" style={{ fontSize: '0.9rem', color: 'var(--color-cream-muted)', lineHeight: '1.6' }}>
                  {segment.desc}
                </p>
              </div>

              <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--color-gold-alpha-15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-gold-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {segment.category}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-gold-highlight)', fontWeight: 600 }}>
                  Boys&apos; Own Library
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action for Dedicated Schedule Page */}
        <div
          className="card-cultural frame-four-corners"
          style={{
            maxWidth: '820px',
            margin: '0 auto',
            textAlign: 'center',
            padding: 'var(--space-2xl) var(--space-xl)',
            background: 'linear-gradient(180deg, rgba(30, 20, 10, 0.85) 0%, rgba(15, 10, 5, 0.95) 100%)',
          }}
        >
          <div className="corner-flourish corner-flourish-tl"></div>
          <div className="corner-flourish corner-flourish-tr"></div>
          <div className="corner-flourish corner-flourish-bl"></div>
          <div className="corner-flourish corner-flourish-br"></div>

          <h3 className="type-h2" style={{ color: 'var(--color-gold-highlight)', marginBottom: 'var(--space-xs)' }}>
            Full 28-Event Interactive Timetable
          </h3>
          <p className="type-body" style={{ color: 'var(--color-cream-muted)', maxWidth: '600px', margin: '0 auto var(--space-xl)' }}>
            To keep your homepage swift and uncluttered, explore every single performance, performer detail, exact start and end minute, and genre filters on our dedicated Events Schedule page.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/schedule" className="btn btn-gold-primary" style={{ padding: '12px 28px' }}>
              <span>View Complete 28-Event Schedule</span>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>

            <Link href="/register" className="btn btn-gold-outline" style={{ padding: '12px 24px' }}>
              <span>Reserve Your Pass</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
