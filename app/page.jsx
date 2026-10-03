'use client';

import { useState, useEffect, useRef } from 'react';
import EventNav from '@/components/event/EventNav';
import EventHero from '@/components/event/EventHero';
import AboutSection from '@/components/event/AboutSection';
import HighlightsSection from '@/components/event/HighlightsSection';
import ScheduleTimeline from '@/components/schedule/ScheduleTimeline';
import WhyItMattersSection from '@/components/event/WhyItMattersSection';
import AudienceSection from '@/components/event/AudienceSection';
import EventInfoSection from '@/components/event/EventInfoSection';
import RegistrationSection from '@/components/event/RegistrationSection';
import EventFooter from '@/components/event/EventFooter';
import Toast from '@/components/Toast';

export default function EventHomepage() {
  const [activeSection, setActiveSection] = useState('hero');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toastTimeoutRef = useRef(null);
  const formRef = useRef(null);

  // Toast helper
  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 3200);
  };

  // Nav Scroll Spy
  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = ['about', 'highlights', 'schedule', 'vision', 'audience', 'details', 'register'];
      let current = 'hero';

      sectionIds.forEach((id) => {
        const section = document.getElementById(id);
        if (section) {
          const sectionTop = section.offsetTop - 140;
          if (window.scrollY >= sectionTop) {
            current = id;
          }
        }
      });

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Registration Form Submission Handler
  const handleRegistration = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      showToast('Registration Confirmed! Your invitation pass for Goynar Baksho 2026 has been reserved.');
      setIsSubmitting(false);
      if (formRef.current) {
        formRef.current.reset();
      }
    }, 1100);
  };

  return (
    <>
      <EventNav activeSection={activeSection} />
      <EventHero />
      <main>
        <AboutSection />
        <HighlightsSection />
        <ScheduleTimeline isFullPage={false} />
        <WhyItMattersSection />
        <AudienceSection />
        <EventInfoSection />
        <RegistrationSection />
      </main>
      <EventFooter />
      <Toast message={toastMessage} visible={toastVisible} />
    </>
  );
}
