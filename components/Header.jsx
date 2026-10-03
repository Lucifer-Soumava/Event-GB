export default function Header({ activeSection }) {
  const navItems = [
    { id: 'tokens', label: 'Tokens' },
    { id: 'typography', label: 'Typography' },
    { id: 'ornaments', label: 'Ornaments' },
    { id: 'buttons', label: 'Buttons' },
    { id: 'cards', label: 'Cards' },
    { id: 'forms', label: 'Form Controls' },
  ];

  return (
    <header className="site-header">
      <div className="container nav-container">
        <div className="brand-logo">
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none" stroke="#C9972B" strokeWidth="1.5">
            <polygon points="24,4 44,24 24,44 4,24" />
            <circle cx="24" cy="24" r="7" fill="rgba(201, 151, 43, 0.2)" stroke="#F2B83F" />
            <circle cx="24" cy="24" r="2" fill="#F4E7C5" stroke="none" />
          </svg>
          <div>
            <span className="brand-title">Goynar Baksho</span>
            <span className="brand-sub">ANNUAL CELEBRATION 2026</span>
          </div>
        </div>

        <nav className="nav-links" aria-label="Design System Navigation">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
