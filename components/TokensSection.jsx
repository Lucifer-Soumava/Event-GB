export default function TokensSection({ onCopyToken }) {
  const tokens = [
    {
      name: 'Primary Background',
      variable: '--color-bg-primary',
      value: '#050505',
      textColor: '#F4E7C5',
      bgColor: '#050505',
      desc: 'Deep obsidian near-black foundation.',
    },
    {
      name: 'Secondary Background',
      variable: '--color-bg-secondary',
      value: '#171008',
      textColor: '#F4E7C5',
      bgColor: '#171008',
      desc: 'Rich warm espresso for cards & modules.',
    },
    {
      name: 'Antique Gold',
      variable: '--color-gold-primary',
      value: '#C9972B',
      textColor: '#050505',
      bgColor: '#C9972B',
      desc: 'Primary brand metal and border accents.',
    },
    {
      name: 'Highlight Gold',
      variable: '--color-gold-highlight',
      value: '#F2B83F',
      textColor: '#050505',
      bgColor: '#F2B83F',
      desc: 'Luminous sparks, CTA halos & active states.',
    },
    {
      name: 'Warm Cream',
      variable: '--color-cream-warm',
      value: '#F4E7C5',
      textColor: '#050505',
      bgColor: '#F4E7C5',
      desc: 'Gentle candlelit text tone for body copy.',
    },
    {
      name: 'Muted Gold',
      variable: '--color-gold-muted',
      value: '#8F6A25',
      textColor: '#F5F5F5',
      bgColor: '#8F6A25',
      desc: 'Fine structural lines, dividers & captions.',
    },
    {
      name: 'Crisp White',
      variable: '--color-white',
      value: '#F5F5F5',
      textColor: '#050505',
      bgColor: '#F5F5F5',
      desc: 'Primary headers & maximum contrast points.',
    },
    {
      name: 'Gold Atmosphere',
      variable: '--color-gold-alpha-15',
      value: 'rgba(201, 151, 43, 0.15)',
      textColor: '#F2B83F',
      bgCustom: 'rgba(201, 151, 43, 0.15)',
      borderDashed: true,
      displayLabel: 'Alpha 15%',
      desc: 'Atmospheric glow layers and backdrops.',
    },
  ];

  return (
    <section id="tokens" className="section-padding">
      <div className="container">
        <div className="section-header">
          <div className="type-kicker">PALETTE &amp; CHROMATICS</div>
          <h2 className="section-title">Color <span className="gold-accent">Tokens</span></h2>
          <p className="section-subtitle">
            Near-black depths paired with rich antique gold accents and warm candlelit creams. Gold is reserved strictly for accents and ornamental framing.
          </p>
          <div className="ornament-divider" aria-hidden="true"></div>
        </div>

        <div className="grid-cols-4">
          {tokens.map((token) => (
            <div
              key={token.variable}
              className="card-cultural"
              data-token-value={token.value}
              style={{ cursor: 'pointer' }}
              title="Click to copy token value"
              onClick={() => onCopyToken(token.value)}
            >
              <div
                className="token-swatch"
                style={{
                  backgroundColor: token.bgColor,
                  background: token.bgCustom || token.bgColor,
                  color: token.textColor,
                  border: token.borderDashed ? '1px dashed #C9972B' : undefined,
                }}
              >
                {token.displayLabel || token.value}
              </div>
              <h4 className="type-h4" style={{ fontSize: 'var(--font-size-sm)', marginBottom: '2px' }}>
                {token.name}
              </h4>
              <div className="type-muted" style={{ fontFamily: 'monospace' }}>
                {token.variable}
              </div>
              <p className="type-caption" style={{ marginTop: '6px' }}>
                {token.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
