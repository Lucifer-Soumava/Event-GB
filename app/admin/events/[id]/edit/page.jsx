'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '@/components/admin/AdminHeader';
import EventForm from '@/components/admin/EventForm';

export default function AdminEditEventPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [eventData, setEventData] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // 1. Fetch Session & Check Role
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.authenticated) {
        router.push(`/admin/login?next=/admin/events/${eventId}/edit`);
        return;
      }

      if (data.user.role !== 'ADMIN') {
        router.push('/admin/dashboard');
        return;
      }

      setUser(data.user);
    } catch (err) {
      console.error('Session fetch error:', err);
      router.push('/admin/login');
    } finally {
      setLoadingUser(false);
    }
  }, [router, eventId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // 2. Fetch Target Event Details
  const fetchEvent = useCallback(async () => {
    try {
      setLoadingEvent(true);
      const res = await fetch(`/api/schedule/${eventId}`, { cache: 'no-store' });
      const data = await res.json();

      if (res.ok && data.success) {
        setEventData(data.data);
      } else {
        setErrorMessage(data.error || 'Event not found.');
      }
    } catch (err) {
      console.error('Fetch event error:', err);
      setErrorMessage('Network error while loading event data.');
    } finally {
      setLoadingEvent(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId, fetchEvent]);

  // 3. Fetch Categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/schedule');
        const data = await res.json();
        if (res.ok && data.categories) {
          setCategories(data.categories.filter((c) => c !== 'All'));
        }
      } catch (err) {
        console.error('Categories load error:', err);
      }
    }
    loadCategories();
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

  const handleEditSubmit = async (formData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/schedule/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage('Event updated successfully! Public website changes are live.');
        setEventData(data.data);
        setIsSubmitting(false);

        // Optionally navigate back after 1.5s or allow further edits
        setTimeout(() => {
          router.push('/admin/events');
          router.refresh();
        }, 1200);
      } else {
        setErrorMessage(data.error || 'Failed to update event.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Update event error:', err);
      setErrorMessage('Network error while saving changes.');
      setIsSubmitting(false);
    }
  };

  if (loadingUser || loadingEvent) {
    return (
      <div className="admin-body" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto 1rem auto' }} />
          <p style={{ color: 'var(--color-gold-light)', fontSize: '0.9rem' }}>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!eventData && !loadingEvent) {
    return (
      <div className="admin-body">
        <AdminHeader user={user} activeSection="events" onLogout={handleLogout} />
        <main className="admin-workspace">
          <div className="admin-alert-banner admin-alert-danger">
            {errorMessage || 'Event record could not be found.'}
          </div>
          <Link href="/admin/events" className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
            ← Back to Event Management
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-body">
      <AdminHeader user={user} activeSection="events" onLogout={handleLogout} />

      <main className="admin-workspace">
        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/admin/events" style={{ color: 'var(--color-gold-primary)', textDecoration: 'none', fontSize: '0.8rem' }}>
            ← Return to Event Management
          </Link>

          <span style={{ fontSize: '0.72rem', color: 'rgba(253,251,247,0.5)', fontFamily: 'monospace' }}>
            Event ID: {eventId}
          </span>
        </div>

        {errorMessage && (
          <div className="admin-alert-banner admin-alert-danger" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <div>{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="admin-alert-banner admin-alert-success" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div>{successMessage}</div>
          </div>
        )}

        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">✏️ Edit Festival Session: {eventData?.title}</h2>
              <span style={{ fontSize: '0.75rem', color: 'rgba(253,251,247,0.6)' }}>
                Modify session date, timings, venue, description, artform category, or banner image.
              </span>
            </div>
          </div>

          <EventForm
            initialData={eventData}
            onSubmit={handleEditSubmit}
            isSubmitting={isSubmitting}
            submitButtonText="Save Changes &amp; Sync Site"
            categories={categories.length > 0 ? categories : undefined}
          />
        </div>
      </main>
    </div>
  );
}
