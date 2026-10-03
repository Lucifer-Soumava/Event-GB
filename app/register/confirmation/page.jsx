'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import EventNav from '@/components/event/EventNav';
import EventFooter from '@/components/event/EventFooter';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const registrationId = searchParams.get('id');

  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!registrationId) {
      setError('No registration ID provided.');
      setLoading(false);
      return;
    }

    // 1. Try to read from sessionStorage first for instant render
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(`gb_reg_${registrationId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setRegistration(parsed);
          setLoading(false);
          return;
        } catch {
          // Fall back to server fetch
        }
      }
    }

    // 2. Fetch from server API
    async function fetchRegistration() {
      try {
        const res = await fetch(`/api/register?id=${encodeURIComponent(registrationId)}`);
        const json = await res.json();
        if (json.success && json.data) {
          setRegistration(json.data);
        } else {
          setError(json.error || 'Registration record could not be found.');
        }
      } catch (err) {
        console.error('Failed to retrieve registration:', err);
        setError('Network error while retrieving your registration record.');
      } finally {
        setLoading(false);
      }
    }

    fetchRegistration();
  }, [registrationId]);

  const handleDownloadQr = () => {
    if (!registration?.qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.href = registration.qrCodeDataUrl;
    link.download = `GoynarBaksho2026-Pass-${registration.registrationId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    return `${formattedH}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container container-narrow section-padding" style={{ textAlign: 'center' }}>
        <div className="card-cultural" style={{ padding: 'var(--space-3xl)' }}>
          <div className="skeleton-line" style={{ width: '40%', height: '24px', margin: '0 auto 16px' }}></div>
          <div className="skeleton-line" style={{ width: '60%', height: '18px', margin: '0 auto 24px' }}></div>
          <div className="skeleton-line" style={{ width: '220px', height: '220px', margin: '0 auto' }}></div>
        </div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="container container-narrow section-padding" style={{ textAlign: 'center' }}>
        <div className="card-cultural frame-four-corners" style={{ padding: 'var(--space-3xl)' }}>
          <div className="corner-flourish corner-flourish-tl"></div>
          <div className="corner-flourish corner-flourish-tr"></div>
          <div className="corner-flourish corner-flourish-bl"></div>
          <div className="corner-flourish corner-flourish-br"></div>

          <div style={{ fontSize: '36px', marginBottom: '8px' }}>⚠️</div>
          <h2 className="type-h2" style={{ color: 'var(--color-status-error)', marginBottom: '8px' }}>
            Registration Not Found
          </h2>
          <p className="type-body" style={{ color: 'var(--color-cream-muted)', marginBottom: 'var(--space-xl)' }}>
            {error || 'Unable to locate your invitation pass.'}
          </p>
          <a href="/register" className="btn btn-gold-primary">
            Register for Event
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container container-narrow section-padding" style={{ paddingTop: 'var(--space-xl)' }}>
      {/* Success Badge & Headline */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
        <div className="alpona-motif" aria-hidden="true"></div>
        {registration.checkedIn ? (
          <span className="badge" style={{ backgroundColor: 'rgba(46, 204, 113, 0.15)', border: '1px solid #2ECC71', color: '#2ECC71', fontSize: '12px', padding: '6px 16px' }}>
            ✓ ADMITTED TO AUDITORIUM
          </span>
        ) : (
          <span className="badge badge-vip" style={{ fontSize: '12px', padding: '6px 16px' }}>
            ✓ REGISTRATION SUCCESSFUL
          </span>
        )}
        <h1 className="type-h1" style={{ marginTop: 'var(--space-sm)', color: 'var(--color-white)' }}>
          {registration.checkedIn ? (
            <>Pass Verified &amp; <span className="gold-accent">Admitted</span></>
          ) : (
            <>Your Invitation Pass is <span className="gold-accent">Confirmed</span></>
          )}
        </h1>
        <p className="bengali-callout" style={{ fontSize: 'var(--font-size-md)', marginTop: '4px' }}>
          &ldquo;নতুন শিল্পী, নতুন কণ্ঠ, নতুন সুর&rdquo;
        </p>
      </div>

      {/* Commemorative Pass Card with QR Code */}
      <div className="card-pass frame-four-corners" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="corner-flourish corner-flourish-tl"></div>
        <div className="corner-flourish corner-flourish-tr"></div>
        <div className="corner-flourish corner-flourish-bl"></div>
        <div className="corner-flourish corner-flourish-br"></div>

        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-sm)', borderBottom: '1px solid var(--color-gold-alpha-25)', paddingBottom: 'var(--space-md)' }}>
          <div>
            <span className="type-kicker" style={{ color: 'var(--color-gold-primary)', fontSize: '11px' }}>
              OFFICIAL ENTRY PASS • GOYNAR BAKSHO 2026
            </span>
            <h2 className="type-h3" style={{ color: 'var(--color-white)', marginTop: '4px' }}>
              {registration.eventTitle}
            </h2>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="type-caption" style={{ color: 'var(--color-gold-muted)' }}>REGISTRATION ID</span>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 'var(--font-size-md)',
                color: 'var(--color-gold-highlight)',
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}
            >
              {registration.registrationId}
            </div>
          </div>
        </div>

        {/* Center: QR Code & Guest Metadata */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 'var(--space-2xl)',
            alignItems: 'center',
            margin: 'var(--space-xl) 0',
          }}
          className="confirmation-qr-grid"
        >
          {/* QR Code Presentation */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '12px',
                backgroundColor: '#F4E7C5',
                borderRadius: 'var(--radius-xs)',
                border: '2px solid var(--color-gold-primary)',
                boxShadow: '0 0 25px rgba(201, 151, 43, 0.3)',
              }}
            >
              <img
                src={registration.qrCodeDataUrl}
                alt={`QR verification pass for registration ${registration.registrationId}`}
                width={200}
                height={200}
                style={{ display: 'block' }}
              />
            </div>
            <div className="type-caption" style={{ marginTop: '8px', color: 'var(--color-gold-highlight)', fontSize: '11px', letterSpacing: '0.08em' }}>
              SCAN AT ENTRANCE
            </div>
          </div>

          {/* Attendee & Event Metadata */}
          <div>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <span className="type-caption" style={{ color: 'var(--color-gold-muted)' }}>GUEST NAME</span>
              <div className="type-h3" style={{ color: 'var(--color-white)', fontSize: 'var(--font-size-lg)' }}>
                {registration.name}
              </div>
              {registration.organization && (
                <div className="type-caption" style={{ color: 'var(--color-cream-muted)', marginTop: '2px' }}>
                  {registration.organization}
                </div>
              )}
            </div>

            <div className="pass-meta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
              <div>
                <span className="type-caption" style={{ color: 'var(--color-gold-muted)' }}>DATE</span>
                <div style={{ fontFamily: 'var(--font-family-display)', color: 'var(--color-cream-warm)', fontWeight: 600 }}>
                  {formatDate(registration.eventDate)}
                </div>
              </div>

              <div>
                <span className="type-caption" style={{ color: 'var(--color-gold-muted)' }}>TIMING</span>
                <div style={{ fontFamily: 'var(--font-family-display)', color: 'var(--color-cream-warm)', fontWeight: 600 }}>
                  {formatTime(registration.startTime)} – {formatTime(registration.endTime)}
                </div>
              </div>
            </div>

            <div>
              <span className="type-caption" style={{ color: 'var(--color-gold-muted)' }}>VENUE</span>
              <div style={{ color: 'var(--color-cream-muted)', fontSize: 'var(--font-size-sm)' }}>
                {registration.eventVenue}
              </div>
            </div>

            {registration.checkedIn && (
              <div style={{ marginTop: 'var(--space-sm)', padding: '6px 12px', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.4)', borderRadius: '4px' }}>
                <span style={{ fontSize: '12px', color: '#2ECC71', fontWeight: 600 }}>
                  ✓ Gate Entry Verified {registration.checkedInAt ? `at ${new Date(registration.checkedInAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST` : ''}
                  {registration.checkedInBy ? ` by ${registration.checkedInBy}` : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Pass Actions: Download QR & Print */}
        <div
          className="confirmation-actions-bar"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-md)',
            borderTop: '1px dashed var(--color-gold-muted)',
            paddingTop: 'var(--space-md)',
          }}
        >
          <div className="type-caption" style={{ color: 'var(--color-gold-muted)' }}>
            DIGITALLY SIGNED CRYPTOGRAPHIC PASS
          </div>

          <div className="confirmation-btn-group" style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button
              type="button"
              className="btn btn-gold-outline btn-sm"
              onClick={handlePrint}
            >
              <span>Print Pass</span>
            </button>
            <button
              type="button"
              className="btn btn-gold-primary btn-sm"
              onClick={handleDownloadQr}
            >
              <span>Download QR Pass</span>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Entry Instructions Section */}
      <div className="card-cultural" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-2xl)' }}>
        <div className="card-header">
          <span className="type-kicker" style={{ color: 'var(--color-gold-primary)' }}>IMPORTANT ADMISSION PROTOCOL</span>
          <h3 className="type-h3" style={{ color: 'var(--color-white)', marginTop: '4px' }}>
            Instructions for Entry &amp; Attendance
          </h3>
        </div>

        <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--color-cream-muted)', fontSize: 'var(--font-size-sm)' }}>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ color: 'var(--color-gold-highlight)', fontWeight: 'bold' }}>1.</span>
            <span>
              <strong>Present Your QR Code:</strong> Keep this QR code handy on your smartphone or carry a printed copy. The reception team will scan it at the auditorium entrance for instant check-in.
            </span>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ color: 'var(--color-gold-highlight)', fontWeight: 'bold' }}>2.</span>
            <span>
              <strong>Valid Photo Identification:</strong> Please carry a government or institutional photo ID matching your registered name (<strong>{registration.name}</strong>).
            </span>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ color: 'var(--color-gold-highlight)', fontWeight: 'bold' }}>3.</span>
            <span>
              <strong>Arrival Time:</strong> Registration counters and doors open <strong>30 minutes prior to session start</strong>. Due to limited auditorium seating (150+ seats), prompt arrival guarantees optimal seating.
            </span>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ color: 'var(--color-gold-highlight)', fontWeight: 'bold' }}>4.</span>
            <span>
              <strong>Dress Code:</strong> In honor of this heritage cultural festival, traditional Bengali festive attire (Kurtas, Sarees, Punjabis) is warmly encouraged.
            </span>
          </li>
        </ul>
      </div>

      {/* Navigation Return Links */}
      <div style={{ textAlign: 'center' }}>
        <a href="/" className="btn btn-gold-ghost btn-sm">
          ← Return to Festival Homepage
        </a>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <>
      <EventNav activeSection="register" />
      <main>
        <Suspense
          fallback={
            <div className="container container-narrow section-padding" style={{ textAlign: 'center' }}>
              <div className="card-cultural" style={{ padding: 'var(--space-3xl)' }}>
                <p className="type-body">Loading your confirmation pass...</p>
              </div>
            </div>
          }
        >
          <ConfirmationContent />
        </Suspense>
      </main>
      <EventFooter />
    </>
  );
}
