'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '@/components/admin/AdminHeader';
import CameraScanner from '@/components/admin/CameraScanner';
import { PASS_CATEGORIES } from '@/lib/passes';

export default function AdminCheckInPage() {
  const router = useRouter();

  // Authentication & session
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Events list for gate session filtering
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('all');

  // Scanner state
  const [isScanning, setIsScanning] = useState(true);
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraStatus, setCameraStatus] = useState(null);

  // Authoritative check-in verification result:
  // status: 'ENTRY_CONFIRMED' | 'ALREADY_CHECKED_IN' | 'INVALID_QR_CODE' | 'WRONG_EVENT' | null
  const [checkInResult, setCheckInResult] = useState(null);

  // Audio feedback (beep sound synthesis using Web Audio API)
  const playBeep = (type) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.1); // D6
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'warning') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(330, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(165, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // AudioContext unavailable or blocked
    }
  };

  // 1. Fetch Session (ADMIN or CHECKIN_STAFF permitted)
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!res.ok || !data.authenticated) {
        router.push('/admin/login?next=/admin/check-in');
        return;
      }
      setUser(data.user);
    } catch (err) {
      console.error('Session fetch error:', err);
      router.push('/admin/login');
    } finally {
      setLoadingUser(false);
    }
  }, [router]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // 2. Load scheduled events for gate filtering
  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch('/api/schedule');
        const data = await res.json();
        if (res.ok && data.success) {
          setEvents(data.data || []);
        }
      } catch (err) {
        console.error('Failed to load events for check-in filter:', err);
      }
    }
    loadEvents();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/admin/login');
    }
  };

  // Process QR or Manual Token Verification
  const processCheckIn = async (tokenString) => {
    if (!tokenString || !tokenString.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setIsScanning(false); // Pause scanner while showing outcome

    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenString.trim(),
          eventId: selectedEventId !== 'all' ? selectedEventId : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // ✅ ENTRY CONFIRMED
        playBeep('success');
        setCheckInResult({
          status: 'ENTRY_CONFIRMED',
          message: 'ENTRY CONFIRMED',
          registration: data.registration,
          checkInTime: data.checkInTime || data.registration?.checkedInAt,
        });
      } else {
        if (data.status === 'ALREADY_CHECKED_IN') {
          // ⚠️ ALREADY CHECKED IN
          playBeep('warning');
          setCheckInResult({
            status: 'ALREADY_CHECKED_IN',
            message: 'ALREADY CHECKED IN',
            registration: data.registration,
            checkInTime: data.registration?.checkedInAt,
          });
        } else if (data.status === 'WRONG_EVENT') {
          playBeep('warning');
          setCheckInResult({
            status: 'WRONG_EVENT',
            message: data.message || 'Pass belongs to another festival session.',
            registration: data.registration,
          });
        } else {
          // ❌ INVALID QR CODE
          playBeep('error');
          setCheckInResult({
            status: 'INVALID_QR_CODE',
            message: 'INVALID QR CODE',
            errorDetail: data.error || data.message || 'No matching festival pass found.',
          });
        }
      }
    } catch (err) {
      console.error('Check-in network error:', err);
      playBeep('error');
      setCheckInResult({
        status: 'INVALID_QR_CODE',
        message: 'INVALID QR CODE',
        errorDetail: 'Communication error with gate server.',
      });
    } finally {
      setIsSubmitting(false);
      setManualTokenInput('');
    }
  };

  // Resume Scanner for next attendee
  const handleScanNext = () => {
    setCheckInResult(null);
    setIsScanning(true);
  };

  // Format timestamp for display
  const formatTime = (isoString) => {
    if (!isoString) return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (loadingUser) {
    return (
      <div className="admin-body" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto 1rem auto' }} />
          <p style={{ color: 'var(--color-gold-light)', fontSize: '0.9rem' }}>Connecting to gate checkpoint...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-body">
      <AdminHeader user={user} activeSection="checkin" onLogout={handleLogout} />

      <main className="admin-workspace">
        {/* Gate Selection Bar (optimized for mobile tablets & phone scanners) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2 className="admin-card-title" style={{ fontSize: '1.25rem', margin: 0 }}>
              📱 Live Auditorium Gate Scanner
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'rgba(253,251,247,0.6)' }}>
              Boys&apos; Own Library Auditorium • Authoritative Gate Check-in
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-gold-light)', fontWeight: 600 }}>
              Session Gate:
            </span>
            <select
              className="admin-select"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{ minWidth: '220px' }}
            >
              <option value="all">All Festival Sessions (Universal Pass)</option>
              <optgroup label="Pass Categories">
                {PASS_CATEGORIES.map((pass) => (
                  <option key={pass.id} value={pass.id}>
                    🎟️ {pass.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Auditorium Timeline Sessions">
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.startTime})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Primary Scanner Grid */}
        <div className="qr-terminal-wrapper">
          {/* Left Column: Mobile Camera Viewfinder */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Live Camera Viewfinder</h3>
              {cameraStatus?.cameraError ? (
                <span style={{ fontSize: '0.72rem', color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff6b6b', display: 'inline-block' }} />
                  Sensor Offline
                </span>
              ) : !cameraStatus?.isCameraActive ? (
                <span style={{ fontSize: '0.72rem', color: 'var(--color-gold-light)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-gold-light)', display: 'inline-block' }} />
                  Connecting...
                </span>
              ) : isScanning && !isSubmitting ? (
                <span style={{ fontSize: '0.72rem', color: '#2ECC71', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ECC71', display: 'inline-block' }} />
                  Sensor Active
                </span>
              ) : (
                <span style={{ fontSize: '0.72rem', color: '#F1C40F', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F1C40F', display: 'inline-block' }} />
                  Scanner Standby
                </span>
              )}
            </div>

            <CameraScanner
              onScan={(token) => processCheckIn(token)}
              isScanning={isScanning && !isSubmitting}
              onStatusChange={setCameraStatus}
            />

            {/* Manual Entry Fallback for Damaged Displays or Verbal Ticket IDs */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                processCheckIn(manualTokenInput);
              }}
              style={{ marginTop: '1.25rem' }}
            >
              <label
                htmlFor="manualInput"
                style={{ fontSize: '0.75rem', color: 'var(--color-gold-light)', display: 'block', marginBottom: '0.35rem' }}
              >
                Manual Ticket ID / Token Fallback:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="manualInput"
                  type="text"
                  className="admin-search-input"
                  style={{ flex: 1 }}
                  placeholder="e.g. GB26-XXXXXX-XXXX or token"
                  value={manualTokenInput}
                  onChange={(e) => setManualTokenInput(e.target.value)}
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', whiteSpace: 'nowrap' }}
                  disabled={isSubmitting || !manualTokenInput.trim()}
                >
                  {isSubmitting ? 'Verifying...' : 'Verify Pass'}
                </button>
              </div>

              {/* Quick test shortcuts for evaluation */}
              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(253,251,247,0.5)' }}>Quick test:</span>
                <button
                  type="button"
                  onClick={() => processCheckIn('GB26-799183-7209')}
                  disabled={isSubmitting}
                  style={{
                    background: 'rgba(46, 204, 113, 0.1)',
                    border: '1px solid rgba(46, 204, 113, 0.3)',
                    color: '#a3f0b8',
                    fontSize: '0.68rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Valid Pass (Soumava)
                </button>
                <button
                  type="button"
                  onClick={() => processCheckIn('GB26-94F085-8808')}
                  disabled={isSubmitting}
                  style={{
                    background: 'rgba(241, 196, 15, 0.1)',
                    border: '1px solid rgba(241, 196, 15, 0.3)',
                    color: '#f9e79f',
                    fontSize: '0.68rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Already Checked (Debolina)
                </button>
                <button
                  type="button"
                  onClick={() => processCheckIn('INVALID-TEST-TOKEN')}
                  disabled={isSubmitting}
                  style={{
                    background: 'rgba(231, 76, 60, 0.1)',
                    border: '1px solid rgba(231, 76, 60, 0.3)',
                    color: '#ff8a80',
                    fontSize: '0.68rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Invalid Pass
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Authoritative Outcome Display */}
          <div className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="admin-card-header">
              <h3 className="admin-card-title">Verification Outcome</h3>
              <span style={{ fontSize: '0.72rem', color: 'rgba(253,251,247,0.6)' }}>
                Authoritative Backend Validation
              </span>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {isSubmitting ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1rem auto' }} />
                  <h4 style={{ color: 'var(--color-gold-light)', margin: 0, fontSize: '1.1rem' }}>
                    Validating with Server...
                  </h4>
                  <p style={{ color: 'rgba(253,251,247,0.6)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    Checking registration uniqueness and duplicate arrival records
                  </p>
                </div>
              ) : checkInResult ? (
                <div>
                  {/* =========================================================
                      CASE 1: ✅ ENTRY CONFIRMED
                      ========================================================= */}
                  {checkInResult.status === 'ENTRY_CONFIRMED' && (
                    <div className="result-card-confirmed">
                      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                        <div style={{ fontSize: '3rem', lineHeight: 1, marginBottom: '0.5rem' }}>✅</div>
                        <h3 style={{ color: '#2ECC71', fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '0.05em' }}>
                          ENTRY CONFIRMED
                        </h3>
                        <span style={{ fontSize: '0.78rem', color: '#a3f0b8' }}>
                          Valid attendee admitted to Boys&apos; Own Library Auditorium
                        </span>
                      </div>

                      <div
                        style={{
                          background: 'rgba(5, 15, 8, 0.85)',
                          border: '1px solid rgba(46, 204, 113, 0.4)',
                          borderRadius: '8px',
                          padding: '1.25rem',
                          marginBottom: '1.25rem',
                        }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <span style={{ fontSize: '0.68rem', color: 'rgba(253,251,247,0.5)', display: 'block', textTransform: 'uppercase' }}>
                              Attendee Name
                            </span>
                            <strong style={{ fontSize: '1.15rem', color: '#fff' }}>
                              {checkInResult.registration?.name}
                            </strong>
                          </div>

                          <div>
                            <span style={{ fontSize: '0.68rem', color: 'rgba(253,251,247,0.5)', display: 'block', textTransform: 'uppercase' }}>
                              Registration ID
                            </span>
                            <span style={{ fontFamily: 'monospace', fontSize: '1rem', color: 'var(--color-gold-light)', fontWeight: 700 }}>
                              {checkInResult.registration?.registrationId}
                            </span>
                          </div>

                          <div style={{ gridColumn: 'span 2' }}>
                            <span style={{ fontSize: '0.68rem', color: 'rgba(253,251,247,0.5)', display: 'block', textTransform: 'uppercase' }}>
                              Festival Event
                            </span>
                            <strong style={{ fontSize: '0.95rem', color: 'var(--color-gold-primary)' }}>
                              {checkInResult.registration?.eventTitle || 'Goynar Baksho Annual Celebration 2026'}
                            </strong>
                          </div>

                          <div style={{ gridColumn: 'span 2' }}>
                            <span style={{ fontSize: '0.68rem', color: 'rgba(253,251,247,0.5)', display: 'block', textTransform: 'uppercase' }}>
                              Check-in Time
                            </span>
                            <span style={{ fontSize: '0.85rem', color: '#2ECC71', fontWeight: 600 }}>
                              {formatTime(checkInResult.checkInTime)} IST
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleScanNext}
                        style={{ width: '100%', padding: '0.85rem', fontWeight: 700, fontSize: '0.9rem' }}
                      >
                        Scan Next Pass →
                      </button>
                    </div>
                  )}

                  {/* =========================================================
                      CASE 2: ⚠️ ALREADY CHECKED IN
                      ========================================================= */}
                  {checkInResult.status === 'ALREADY_CHECKED_IN' && (
                    <div className="result-card-warning">
                      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                        <div style={{ fontSize: '3rem', lineHeight: 1, marginBottom: '0.5rem' }}>⚠️</div>
                        <h3 style={{ color: '#F1C40F', fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '0.05em' }}>
                          ALREADY CHECKED IN
                        </h3>
                        <span style={{ fontSize: '0.78rem', color: '#ffeaa7' }}>
                          Pass duplicate detected! This ticket has already passed the turnstile.
                        </span>
                      </div>

                      <div
                        style={{
                          background: 'rgba(20, 15, 5, 0.85)',
                          border: '1px solid rgba(241, 196, 15, 0.4)',
                          borderRadius: '8px',
                          padding: '1.25rem',
                          marginBottom: '1.25rem',
                        }}
                      >
                        <div style={{ marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.68rem', color: 'rgba(253,251,247,0.5)', display: 'block', textTransform: 'uppercase' }}>
                            Registered Attendee
                          </span>
                          <strong style={{ fontSize: '1.1rem', color: '#fff' }}>
                            {checkInResult.registration?.name}
                          </strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-gold-light)' }}>
                            {checkInResult.registration?.registrationId}
                          </span>
                        </div>

                        <div>
                          <span style={{ fontSize: '0.68rem', color: 'rgba(253,251,247,0.5)', display: 'block', textTransform: 'uppercase' }}>
                            Previous Check-in Time
                          </span>
                          <strong style={{ color: '#F1C40F', fontSize: '0.95rem' }}>
                            {formatTime(checkInResult.checkInTime)} IST
                          </strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={handleScanNext}
                        style={{ width: '100%', padding: '0.85rem', fontWeight: 700, fontSize: '0.9rem' }}
                      >
                        Acknowledge &amp; Scan Next →
                      </button>
                    </div>
                  )}

                  {/* =========================================================
                      CASE 3: ❌ INVALID QR CODE
                      ========================================================= */}
                  {(checkInResult.status === 'INVALID_QR_CODE' || checkInResult.status === 'WRONG_EVENT') && (
                    <div className="result-card-error">
                      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                        <div style={{ fontSize: '3rem', lineHeight: 1, marginBottom: '0.5rem' }}>❌</div>
                        <h3 style={{ color: '#E74C3C', fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '0.05em' }}>
                          INVALID QR CODE
                        </h3>
                        <p style={{ color: '#ffaaaa', fontSize: '0.82rem', margin: '0.5rem 0 0 0' }}>
                          {checkInResult.errorDetail || checkInResult.message || 'Pass does not match any confirmed festival registration.'}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={handleScanNext}
                        style={{ width: '100%', padding: '0.85rem', fontWeight: 700, fontSize: '0.9rem' }}
                      >
                        Try Again / Scan Next Pass →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '3rem 1.5rem',
                    border: '1px dashed rgba(201, 151, 43, 0.25)',
                    borderRadius: '8px',
                    color: 'rgba(253, 251, 247, 0.45)',
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.5 }}>🎫</div>
                  <h4 style={{ color: 'var(--color-gold-light)', margin: '0 0 0.5rem 0' }}>
                    Checkpoint Ready
                  </h4>
                  <p style={{ fontSize: '0.82rem', margin: 0 }}>
                    Align attendee mobile pass or printed QR code with the camera reticle on the left.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
