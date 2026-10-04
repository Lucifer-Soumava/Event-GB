'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EventNav from '@/components/event/EventNav';
import EventFooter from '@/components/event/EventFooter';

const DEFAULT_SESSIONS = [
  { id: 'gb-01-inaugural', title: 'Inaugural Ceremony & Mangik Alpona Unveiling', category: 'Inauguration', startTime: '17:00' },
  { id: 'gb-02-music-classical', title: 'Raga Recital: Melodies of Awakening', category: 'Music', startTime: '17:35' },
  { id: 'gb-03-recitation-poetry', title: 'Kabita O Kanthoswar: Poetic Eloquence', category: 'Recitation', startTime: '18:20' },
  { id: 'gb-04-dance-choreography', title: 'Nritya Taranga: Classical & Creative Dance', category: 'Dance', startTime: '18:55' },
  { id: 'gb-05-theatre-drama', title: 'Natak: Intimate Proscenium Theatre', category: 'Theatre', startTime: '19:40' },
  { id: 'gb-06-honors-finale', title: 'Emerging Talent Recognition & Grand Collaborative Finale', category: 'Honors', startTime: '20:25' },
];

export default function RegisterPage() {
  const router = useRouter();
  // Pre-seed with default sessions so the pass category dropdown is never empty
  const [events, setEvents] = useState(DEFAULT_SESSIONS);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    eventId: DEFAULT_SESSIONS[0].id,
    consent: false,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Fetch available events for live session selection
  useEffect(() => {
    let isMounted = true;
    async function loadSessions() {
      try {
        const res = await fetch('/api/schedule');
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
            setEvents(json.data);
            setFormData((prev) => ({
              ...prev,
              eventId: prev.eventId || json.data[0].id,
            }));
          }
        }
      } catch (err) {
        console.warn('Using default celebration sessions list:', err);
      } finally {
        if (isMounted) setLoadingEvents(false);
      }
    }
    loadSessions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Frontend validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your full name (at least 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    const cleanPhone = formData.phone.replace(/[\s\-\(\)\+]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      newErrors.phone = 'Please enter a valid phone or WhatsApp number.';
    }

    if (!formData.eventId) {
      newErrors.eventId = 'Please select a session or pass category.';
    }

    if (!formData.consent) {
      newErrors.consent = 'You must confirm attendance consent to register.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field-specific error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setServerError('');

      // Ensure valid eventId is always submitted
      const payload = {
        ...formData,
        eventId: formData.eventId || events[0]?.id || 'gb-01-inaugural',
      };

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Registration failed. Please try again.');
      }

      // Store in sessionStorage for fast transition
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`gb_reg_${json.data.registrationId}`, JSON.stringify(json.data));
      }

      // Navigate to polished confirmation page
      router.push(`/register/confirmation?id=${encodeURIComponent(json.data.registrationId)}`);
    } catch (err) {
      console.error('Registration submission error:', err);
      setServerError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <EventNav activeSection="register" />

      {/* Header Banner */}
      <section className="hero-section" style={{ paddingBottom: 'var(--space-xl)' }}>
        <div className="hero-backdrop-glow"></div>
        <div className="container hero-content">
          <div className="alpona-motif" aria-hidden="true"></div>
          <div className="type-kicker">
            <span>OFFICIAL GALA REGISTRATION</span>
            <span>•</span>
            <span>KOLKATA 2026</span>
          </div>
          <h1 className="type-hero" style={{ marginTop: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
            Reserve Your <span className="gold-accent">Pass</span>
          </h1>
          <p className="bengali-callout" style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-gold-highlight)', marginBottom: 'var(--space-md)' }}>
            &ldquo;নতুন শিল্পী, নতুন কণ্ঠ, নতুন সুর&rdquo;
          </p>
          <p className="type-subtitle" style={{ maxWidth: '640px', margin: '0 auto' }}>
            1 November 2026 • Boys&apos; Own Library Auditorium, Hatibagan, Kolkata • 150+ Limited Seating
          </p>
          <div className="ornament-divider" aria-hidden="true"></div>
        </div>
      </section>

      {/* Registration Form Main Area */}
      <main className="section-padding" style={{ paddingTop: 0 }}>
        <div className="container container-narrow">
          <div className="card-cultural frame-four-corners">
            <div className="corner-flourish corner-flourish-tl"></div>
            <div className="corner-flourish corner-flourish-tr"></div>
            <div className="corner-flourish corner-flourish-bl"></div>
            <div className="corner-flourish corner-flourish-br"></div>

            <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
              <span className="badge badge-vip">Secure Entry Pass Reservation</span>
              <p className="type-body" style={{ color: 'var(--color-cream-muted)', marginTop: '8px', fontSize: 'var(--font-size-sm)' }}>
                Please provide accurate contact details. A unique cryptographic QR pass will be generated upon confirmation for smooth entry check-in.
              </p>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div
                style={{
                  backgroundColor: 'rgba(184, 71, 59, 0.15)',
                  border: '1px solid var(--color-status-error)',
                  borderRadius: 'var(--radius-xs)',
                  padding: 'var(--space-md)',
                  marginBottom: 'var(--space-lg)',
                  color: '#ff8578',
                  fontSize: 'var(--font-size-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>⚠️</span>
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="reg-full-name" className="form-label">
                  Full Name <span className="required-mark">*</span>
                </label>
                <input
                  type="text"
                  id="reg-full-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-cultural"
                  placeholder="e.g. Debolina Roy"
                  required
                />
                {errors.name ? (
                  <span className="form-error">{errors.name}</span>
                ) : (
                  <span className="form-helper">As printed on your invitation entry badge.</span>
                )}
              </div>

              {/* Email & Phone Grid */}
              <div className="grid-cols-2">
                <div className="form-group">
                  <label htmlFor="reg-email" className="form-label">
                    Email Address <span className="required-mark">*</span>
                  </label>
                  <input
                    type="email"
                    id="reg-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-cultural"
                    placeholder="debolina@example.com"
                    required
                  />
                  {errors.email ? (
                    <span className="form-error">{errors.email}</span>
                  ) : (
                    <span className="form-helper">Your digital pass &amp; QR badge will be delivered here.</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="reg-phone" className="form-label">
                    Phone / WhatsApp Number <span className="required-mark">*</span>
                  </label>
                  <input
                    type="tel"
                    id="reg-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-cultural"
                    placeholder="+91 98300 XXXXX"
                    required
                  />
                  {errors.phone ? (
                    <span className="form-error">{errors.phone}</span>
                  ) : (
                    <span className="form-helper">For entry updates and venue alerts.</span>
                  )}
                </div>
              </div>

              {/* Organization / College & Session Selection Grid */}
              <div className="grid-cols-2">
                <div className="form-group">
                  <label htmlFor="reg-org" className="form-label">
                    Organization / College <span className="type-caption">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="reg-org"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="input-cultural"
                    placeholder="e.g. Presidency University, Kolkata"
                  />
                  <span className="form-helper">Art school, theatre troupe, or institution.</span>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-event-id" className="form-label">
                    Session / Pass Category <span className="required-mark">*</span>
                  </label>
                  <select
                    id="reg-event-id"
                    name="eventId"
                    value={formData.eventId}
                    onChange={handleChange}
                    className="input-cultural"
                  >
                    {events.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.title} ({evt.category} • {evt.startTime})
                      </option>
                    ))}
                  </select>
                  {errors.eventId ? (
                    <span className="form-error">{errors.eventId}</span>
                  ) : (
                    <span className="form-helper">Select primary session focus or all-access gala.</span>
                  )}
                </div>
              </div>

              {/* Terms / Consent Checkbox */}
              <div style={{ marginBottom: 'var(--space-xl)', marginTop: 'var(--space-xs)' }}>
                <label className="checkbox-group">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    id="reg-consent-box"
                  />
                  <span className="checkbox-label" style={{ fontSize: '13px', lineHeight: 1.5 }}>
                    I acknowledge that admission is subject to venue capacity (150+ attendees) on 1 November 2026 at Boys&apos; Own Library Auditorium, Hatibagan, Kolkata, and agree to present my QR pass at the entrance.
                  </span>
                </label>
                {errors.consent && (
                  <span className="form-error" style={{ marginTop: '6px' }}>{errors.consent}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="form-actions-responsive" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-gold-ghost btn-sm"
                  onClick={() => router.push('/')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold-primary btn-lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#050505', borderRightColor: '#050505' }} />
                      <span>Generating Secure QR Pass...</span>
                    </span>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <EventFooter />
    </>
  );
}
