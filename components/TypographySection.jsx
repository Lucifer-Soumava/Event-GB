export default function TypographySection() {
  return (
    <section id="typography" className="section-padding section-secondary">
      <div className="container">
        <div className="section-header">
          <div className="type-kicker">CINEMATIC TYPOGRAPHY</div>
          <h2 className="section-title">Typographic <span className="gold-accent">Hierarchy</span></h2>
          <p className="section-subtitle">
            Harmonious pairing of classical serif display fonts, authentic Bengali script typefaces, and contemporary legible UI sans-serif.
          </p>
          <div className="ornament-divider" aria-hidden="true"></div>
        </div>

        <div className="grid-cols-2">
          {/* Headings Hierarchy Card */}
          <div className="card-cultural frame-four-corners">
            <div className="corner-flourish corner-flourish-tl"></div>
            <div className="corner-flourish corner-flourish-tr"></div>
            <div className="corner-flourish corner-flourish-bl"></div>
            <div className="corner-flourish corner-flourish-br"></div>

            <div className="card-header">
              <span className="badge badge-gold">Headings &amp; Scales</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div>
                <span className="type-muted" style={{ fontFamily: 'monospace' }}>H1 / Cinzel Display</span>
                <div className="type-h1">Gala Performance &amp; Honors</div>
              </div>
              <hr className="divider-gold-hairline" style={{ margin: 0 }} />
              <div>
                <span className="type-muted" style={{ fontFamily: 'monospace' }}>H2 / Cinzel Regular</span>
                <div className="type-h2">An Evening of Cultural Heritage</div>
              </div>
              <hr className="divider-gold-hairline" style={{ margin: 0 }} />
              <div>
                <span className="type-muted" style={{ fontFamily: 'monospace' }}>H3 / Cormorant Serif</span>
                <div className="type-h3">Celebrating traditional artistry and storytelling</div>
              </div>
              <hr className="divider-gold-hairline" style={{ margin: 0 }} />
              <div>
                <span className="type-muted" style={{ fontFamily: 'monospace' }}>H4 / Gold Accent</span>
                <div className="type-h4">Distinguished Guest Speakers &amp; Artists</div>
              </div>
            </div>
          </div>

          {/* Bengali Cultural Font & Body Copy */}
          <div className="card-cultural frame-four-corners">
            <div className="corner-flourish corner-flourish-tl"></div>
            <div className="corner-flourish corner-flourish-tr"></div>
            <div className="corner-flourish corner-flourish-bl"></div>
            <div className="corner-flourish corner-flourish-br"></div>

            <div className="card-header">
              <span className="badge badge-vip">Bengali Script &amp; Body Text</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div>
                <span className="type-muted" style={{ fontFamily: 'monospace' }}>Bengali Title / Anek Bangla</span>
                <div className="bengali-callout" style={{ fontSize: 'var(--font-size-xl)', marginTop: '4px' }}>
                  গয়নার বাক্স বার্ষিক উৎসব ২০২৬
                </div>
                <div className="type-caption" style={{ marginTop: '2px' }}>
                  &ldquo;ঐতিহ্য, সংস্কৃতি ও নান্দনিকতার মিলনমেলা&rdquo;
                </div>
              </div>
              <hr className="divider-gold-hairline" style={{ margin: 0 }} />
              <div>
                <span className="type-muted" style={{ fontFamily: 'monospace' }}>Lead Body / Plus Jakarta Sans</span>
                <p className="type-lead" style={{ marginTop: '4px' }}>
                  Join us for an unforgettable gathering celebrating our rich heritage with musical recitals, theatrics, and classical Bengali culinary treasures.
                </p>
              </div>
              <hr className="divider-gold-hairline" style={{ margin: 0 }} />
              <div>
                <span className="type-muted" style={{ fontFamily: 'monospace' }}>Standard Body &amp; Caption</span>
                <p className="type-body" style={{ marginTop: '4px' }}>
                  Each attendee receives an exclusive collector&apos;s souvenir program with embossed antique-gold detailing and commemorative passes.
                </p>
                <div className="type-caption" style={{ marginTop: '8px' }}>
                  SATURDAY, NOVEMBER 14, 2026 • GRAND ROYAL BALLROOM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
