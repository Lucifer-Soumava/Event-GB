'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import TokensSection from '@/components/TokensSection';
import TypographySection from '@/components/TypographySection';
import OrnamentsSection from '@/components/OrnamentsSection';
import ButtonsSection from '@/components/ButtonsSection';
import CardsSection from '@/components/CardsSection';
import FormsSection from '@/components/FormsSection';
import BreakpointsSection from '@/components/BreakpointsSection';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';

export default function DesignSystemPage() {
  const [activeSection, setActiveSection] = useState('tokens');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toastTimeoutRef = useRef(null);
  const formRef = useRef(null);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 2500);
  };

  const handleCopyToken = async (val) => {
    try {
      await navigator.clipboard.writeText(val);
      showToast(`Copied ${val} to clipboard`);
    } catch {
      showToast(`Token: ${val}`);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = ['tokens', 'typography', 'ornaments', 'buttons', 'cards', 'forms'];
      let current = '';

      sectionIds.forEach((id) => {
        const section = document.getElementById(id);
        if (section) {
          const sectionTop = section.offsetTop - 140;
          if (window.scrollY >= sectionTop) {
            current = id;
          }
        }
      });

      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      showToast('RSVP invitation request validated successfully!');
      setIsSubmitting(false);
      if (formRef.current) {
        formRef.current.reset();
      }
    }, 900);
  };

  return (
    <>
      <div style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-gold-alpha-25)', padding: '8px 16px', textAlign: 'center' }}>
        <a href="/" style={{ color: 'var(--color-gold-highlight)', fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          ← Return to Public Event Homepage
        </a>
      </div>
      <Header activeSection={activeSection} />
      <Hero />
      <main>
        <TokensSection onCopyToken={handleCopyToken} />
        <TypographySection />
        <OrnamentsSection />
        <ButtonsSection />
        <CardsSection />
        <FormsSection
          formRef={formRef}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
        <BreakpointsSection />
      </main>
      <Footer />
      <Toast message={toastMessage} visible={toastVisible} />
    </>
  );
}
