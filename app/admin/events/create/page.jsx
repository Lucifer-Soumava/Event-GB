'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '@/components/admin/AdminHeader';
import EventForm from '@/components/admin/EventForm';

export default function AdminCreateEventPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // 1. Fetch Current User Session & enforce ADMIN role
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.authenticated) {
        router.push('/admin/login?next=/admin/events/create');
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
  }, [router]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // 2. Fetch existing categories for suggestions
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/schedule', { cache: 'no-store' });
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

  const handleCreateSubmit = async (formData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Redirect to events list upon success
        router.push('/admin/events');
        router.refresh();
      } else {
        setErrorMessage(data.error || 'Failed to create festival event.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Create event error:', err);
      setErrorMessage('Network error while saving festival event.');
      setIsSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="admin-body" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto 1rem auto' }} />
          <p style={{ color: 'var(--color-gold-light)', fontSize: '0.9rem' }}>Verifying permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-body">
      <AdminHeader user={user} activeSection="events" onLogout={handleLogout} />

      <main className="admin-workspace">
        <div style={{ marginBottom: '1.25rem' }}>
          <Link href="/admin/events" style={{ color: 'var(--color-gold-primary)', textDecoration: 'none', fontSize: '0.8rem' }}>
            ← Return to Event Management
          </Link>
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

        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">✨ Schedule New Festival Performance Session</h2>
              <span style={{ fontSize: '0.75rem', color: 'rgba(253,251,247,0.6)' }}>
                Publish a newly scheduled performance, ceremony, or dramatic stage presentation to the festival timeline.
              </span>
            </div>
          </div>

          <EventForm
            onSubmit={handleCreateSubmit}
            isSubmitting={isSubmitting}
            submitButtonText="Create &amp; Publish Event"
            categories={categories.length > 0 ? categories : undefined}
          />
        </div>
      </main>
    </div>
  );
}
