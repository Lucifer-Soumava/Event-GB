'use client';

import { useState, useEffect } from 'react';

export default function EventNav({ activeSection }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'about', label: 'About', href: '/#about' },
    { id: 'highlights', label: 'Highlights', href: '/#highlights' },
    { id: 'schedule', label: 'Events', href: '/schedule' },
    { id: 'vision', label: 'Why It Matters', href: '/#vision' },
    { id: 'audience', label: 'Audience', href: '/#audience' },
    { id: 'details', label: 'Event Details', href: '/#details' },
  ];

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="site-header">
      <div className="container nav-container">
        <a href="/" className="brand-logo" style={{ textDecoration: 'none' }} aria-label="Goynar Baksho Annual Celebration 2026 Home">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="#C9972B" strokeWidth="1.5" aria-hidden="true">
            <polygon points="24,4 44,24 24,44 4,24" />
            <circle cx="24" cy="24" r="7" fill="rgba(201, 151, 43, 0.2)" stroke="#F2B83F" />
            <circle cx="24" cy="24" r="2" fill="#F4E7C5" stroke="none" />
          </svg>
          <div>
            <span className="brand-title">Goynar Baksho</span>
            <span className="brand-sub">ANNUAL CELEBRATION 2026</span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="nav-links desktop-nav" aria-label="Event Navigation">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/register"
            className="btn btn-gold-primary btn-sm"
            style={{ marginLeft: 'var(--space-sm)' }}
          >
            Register Pass
          </a>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-drawer"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Accessible Mobile Nav Drawer */}
      <div
        id="mobile-nav-drawer"
        className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="mobile-nav-inner">
          <div className="bengali-kicker-mobile" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontFamily: 'var(--font-family-bengali)', color: 'var(--color-gold-highlight)', fontSize: '1.05rem', letterSpacing: '0.04em' }}>
              &ldquo;নতুন শিল্পী, নতুন কণ্ঠ, নতুন সুর&rdquo;
            </span>
          </div>

          <nav className="mobile-nav-list" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className={`mobile-nav-item ${activeSection === link.id ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{link.label}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </a>
            ))}
          </nav>

          <div style={{ marginTop: '2rem', padding: '0 1rem' }}>
            <a
              href="/register"
              className="btn btn-gold-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Register Invitation Pass
            </a>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--color-cream-dim)' }}>
              1 November 2026 • Boys&apos; Own Library Auditorium
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
