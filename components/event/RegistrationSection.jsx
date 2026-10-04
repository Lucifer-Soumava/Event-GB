'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DEFAULT_SESSIONS = [
  { id: 'gb-01-inaugural', title: 'Inaugural Ceremony & Mangik Alpona Unveiling', category: 'Inauguration', startTime: '17:00' },
  { id: 'gb-02-music-classical', title: 'Raga Recital: Melodies of Awakening', category: 'Music', startTime: '17:35' },
  { id: 'gb-03-recitation-poetry', title: 'Kabita O Kanthoswar: Poetic Eloquence', category: 'Recitation', startTime: '18:20' },
  { id: 'gb-04-dance-choreography', title: 'Nritya Taranga: Classical & Creative Dance', category: 'Dance', startTime: '18:55' },
  { id: 'gb-05-theatre-drama', title: 'Natak: Intimate Proscenium Theatre', category: 'Theatre', startTime: '19:40' },
  { id: 'gb-06-honors-finale', title: 'Emerging Talent Recognition & Grand Collaborative Finale', category: 'Honors', startTime: '20:25' },
];

export default function RegistrationSection() {
  const router = useRouter();
  const [sessions, setSessions] = useState(DEFAULT_SESSIONS);
  const [loadingSessions, setLoadingSessions] = useState(false);

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

  useEffect(() => {
    let isMounted = true;
    async function loadSessions() {
      try {
        const res = await fetch('/api/schedule');
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
            setSessions(json.data);
            setFormData((prev) => ({
              ...prev,
              eventId: prev.eventId || json.data[0].id,
            }));
          }
        }
      } catch (err) {
        console.warn('Using default sessions list in homepage registration:', err);
      } finally {
        if (isMounted) setLoadingSessions(false);
      }
    }
    loadSessions();
    return () => {
      isMounted = false;
    };
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your full name (at least 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }
    const cleanPhone = formData.phone.replace(/[\s\-\(\)\+]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      newErrors.phone = 'Please provide a valid phone or WhatsApp number.';
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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      setServerError('');

      const payload = {
        ...formData,
        eventId: formData.eventId || sessions[0]?.id || 'gb-01-inaugural',
      };

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Registration failed.');
      }

      // Cache for instant render
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`gb_reg_${json.data.registrationId}`, JSON.stringify(json.data));
      }

      // Navigate to confirmation page
      router.push(`/register/confirmation?id=${encodeURIComponent(json.data.registrationId)}`);
    } catch (err) {
      console.error('Registration error:', err);
      setServerError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="register" className="section-padding">
      <div className="container container-narrow">
        <div className="section-header">
          <div className="type-kicker">LIMITED AUDITORIUM SEATING</div>
          <h2 className="section-title">
            Reserve Your <span className="gold-accent">Invitation</span>
          </h2>
          <p className="section-subtitle">
            Seating is strictly limited to 150+ attendees to preserve the intimate, focused atmosphere of this cultural celebration.
          </p>
          <div className="ornament-divider" aria-hidden="true"></div>
        </div>

        <div className="card-cultural frame-four-corners">
          <div className="corner-flourish corner-flourish-tl"></div>
          <div className="corner-flourish corner-flourish-tr"></div>
          <div className="corner-flourish corner-flourish-bl"></div>
          <div className="corner-flourish corner-flourish-br"></div>

          <div style={{ marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
            <span className="badge badge-vip">Goynar Baksho Annual Celebration 2026</span>
            <div className="bengali-callout" style={{ fontSize: 'var(--font-size-md)', marginTop: '8px' }}>
              &ldquo;নতুন শিল্পী, নতুন কণ্ঠ, নতুন সুর&rdquo;
            </div>
            <div className="type-caption" style={{ marginTop: '4px', color: 'var(--color-cream-muted)' }}>
              1 NOVEMBER 2026 • BOYS&apos; OWN LIBRARY AUDITORIUM, HATIBAGAN, KOLKATA
            </div>
          </div>

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

          <form id="rsvp-registration-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="hp-reg-name" className="form-label">
                Full Name <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                id="hp-reg-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input-cultural ${errors.name ? 'is-invalid' : ''}`}
                placeholder="e.g. Debolina Roy"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                required
              />
              {errors.name ? (
                <span id="name-error" className="form-error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.name}
                </span>
              ) : (
                <span className="form-helper">As you wish your invitation pass to be issued.</span>
              )}
            </div>

            <div className="grid-cols-2">
              <div className="form-group">
                <label htmlFor="hp-reg-email" className="form-label">
                  Email Address <span className="required-mark">*</span>
                </label>
                <input
                  type="email"
                  id="hp-reg-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-cultural ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="debolina@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  required
                />
                {errors.email ? (
                  <span id="email-error" className="form-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.email}
                  </span>
                ) : (
                  <span className="form-helper">Digital pass &amp; QR badge will be delivered here.</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="hp-reg-phone" className="form-label">
                  Phone / WhatsApp Number <span className="required-mark">*</span>
                </label>
                <input
                  type="tel"
                  id="hp-reg-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input-cultural ${errors.phone ? 'is-invalid' : ''}`}
                  placeholder="+91 98300 XXXXX"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                  required
                />
                {errors.phone ? (
                  <span id="phone-error" className="form-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.phone}
                  </span>
                ) : (
                  <span className="form-helper">For entry updates and venue alerts.</span>
                )}
              </div>
            </div>

            <div className="grid-cols-2">
              <div className="form-group">
                <label htmlFor="hp-reg-org" className="form-label">
                  Organization / College <span className="type-caption">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="hp-reg-org"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="input-cultural"
                  placeholder="e.g. Presidency University, Kolkata"
                />
              </div>

              <div className="form-group">
                <label htmlFor="hp-reg-event-id" className="form-label">
                  Session / Pass Category <span className="required-mark">*</span>
                </label>
                <select
                  id="hp-reg-event-id"
                  name="eventId"
                  value={formData.eventId}
                  onChange={handleChange}
                  className="input-cultural"
                  disabled={loadingSessions}
                >
                  {loadingSessions ? (
                    <option value="">Loading sessions...</option>
                  ) : (
                    sessions.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.title} ({evt.category} • {evt.startTime})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Cultural Checkbox */}
            <div style={{ marginBottom: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  id="hp-reg-code"
                />
                <span className="checkbox-label" style={{ fontSize: '13px', lineHeight: 1.5 }}>
                  I confirm attendance on 1 November 2026 at Boys&apos; Own Library Auditorium, Hatibagan, Kolkata, and agree to present my QR pass at the entrance.
                </span>
              </label>
              {errors.consent && (
                <span className="form-error" style={{ marginTop: '4px' }}>{errors.consent}</span>
              )}
            </div>

            <div className="form-actions-responsive" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)', alignItems: 'center' }}>
              <button
                type="reset"
                className="btn btn-gold-ghost btn-sm"
                onClick={() => {
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    organization: '',
                    eventId: sessions.length > 0 ? sessions[0].id : '',
                    consent: false,
                  });
                  setErrors({});
                  setServerError('');
                }}
              >
                Reset
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
                    <span>Confirm Registration</span>
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
    </section>
  );
}
