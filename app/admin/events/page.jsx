'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminEventsListPage() {
  const router = useRouter();

  // User & Authentication state
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Events & Categories data state
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Actions & Feedback state
  const [notification, setNotification] = useState(null);
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  // 1. Fetch Current User Session
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.authenticated) {
        router.push('/admin/login?next=/admin/events');
        return;
      }

      // Check role authorization: Only ADMIN can manage events
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

  // 2. Load All Events (including unpublished)
  const loadEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);
      const res = await fetch('/api/schedule?includeUnpublished=true&orderBy=displayOrder', {
        cache: 'no-store',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setEvents(data.data || []);
        if (data.categories) {
          setCategories(data.categories.filter((c) => c !== 'All'));
        }
      } else {
        setNotification({ type: 'danger', message: data.error || 'Failed to load events.' });
      }
    } catch (err) {
      console.error('Events load error:', err);
      setNotification({ type: 'danger', message: 'Network error while loading events.' });
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadEvents();
    }
  }, [user, loadEvents]);

  // Logout Handler
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

  // Toggle Publish / Unpublish Event
  const handleTogglePublish = async (event) => {
    const isCurrentlyPublished = event.status === 'published' || event.status === 'scheduled';
    const nextStatus = isCurrentlyPublished ? 'unpublished' : 'published';

    try {
      const res = await fetch(`/api/schedule/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({
          type: 'success',
          message: `Event "${event.title}" is now ${nextStatus === 'unpublished' ? 'Unpublished (hidden from public site)' : 'Published (visible on public site)'}.`,
        });
        loadEvents();
      } else {
        setNotification({ type: 'danger', message: data.error || 'Failed to update status.' });
      }
    } catch (err) {
      console.error('Publish toggle error:', err);
      setNotification({ type: 'danger', message: 'Failed to update publication status.' });
    }
  };

  // Move Event Up / Down in Display Order
  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= events.length) return;

    setIsReordering(true);
    const newOrderedList = [...events];
    const temp = newOrderedList[index];
    newOrderedList[index] = newOrderedList[targetIndex];
    newOrderedList[targetIndex] = temp;

    // Extract new array of IDs
    const orderedIds = newOrderedList.map((e) => e.id);

    try {
      const res = await fetch('/api/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEvents(data.data);
        setNotification({
          type: 'success',
          message: 'Schedule display order updated! The public timetable will reflect this ordering immediately.',
        });
      } else {
        setNotification({ type: 'danger', message: data.error || 'Failed to reorder items.' });
      }
    } catch (err) {
      console.error('Reorder error:', err);
      setNotification({ type: 'danger', message: 'Error reordering schedule items.' });
    } finally {
      setIsReordering(false);
    }
  };

  // Delete Event Handler
  const confirmDelete = async () => {
    if (!pendingDeleteEvent) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/schedule/${pendingDeleteEvent.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({
          type: 'success',
          message: `Event "${pendingDeleteEvent.title}" removed successfully from schedule.`,
        });
        setPendingDeleteEvent(null);
        loadEvents();
      } else {
        setNotification({ type: 'danger', message: data.error || 'Failed to delete event.' });
      }
    } catch (err) {
      console.error('Delete error:', err);
      setNotification({ type: 'danger', message: 'Server error while deleting event.' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Format 24h time to 12h display
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    return `${formattedH}:${minutes} ${ampm}`;
  };

  // Filter events client-side based on search and filters
  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      !searchTerm.trim() ||
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      ev.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStatus =
      selectedStatus === 'all' ||
      ev.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredEvents.length / pageSize) || 1;
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loadingUser) {
    return (
      <div className="admin-body" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto 1rem auto' }} />
          <p style={{ color: 'var(--color-gold-light)', fontSize: '0.9rem' }}>Verifying administrator privileges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-body">
      <AdminHeader user={user} activeSection="events" onLogout={handleLogout} />

      <main className="admin-workspace">
        {/* Toast / Notification Banner */}
        {notification && (
          <div
            className={`admin-alert-banner ${
              notification.type === 'success' ? 'admin-alert-success' : 'admin-alert-danger'
            }`}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}

        <div className="admin-card">
          {/* Card Header & Primary Action */}
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">🎭 Festival Events &amp; Programme Management</h2>
              <span style={{ fontSize: '0.75rem', color: 'rgba(253,251,247,0.6)' }}>
                Create, edit, reorder, or publish festival sessions. Changes sync in real-time to the public website.
              </span>
            </div>

            <div className="admin-header-actions">
              <Link href="/admin/events/create" className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}>
                + Add New Event
              </Link>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="admin-filter-bar">
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search by title, artist, or venue..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />

            <select
              className="admin-select"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Artform Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              className="admin-select"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Publication Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="live">Live</option>
              <option value="unpublished">Unpublished</option>
              <option value="completed">Completed</option>
            </select>

            <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-gold-light)', fontWeight: 600 }}>
              {filteredEvents.length} total event(s)
            </div>
          </div>

          {/* Events Table */}
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '70px', textAlign: 'center' }}>Order</th>
                  <th style={{ width: '60px' }}>Banner</th>
                  <th>Session Title &amp; Details</th>
                  <th>Category</th>
                  <th>Date &amp; Timings</th>
                  <th>Venue</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingEvents ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}>
                      <div className="spinner" style={{ width: '28px', height: '28px', margin: '0 auto 0.75rem auto' }} />
                      <span style={{ fontSize: '0.82rem', color: 'rgba(253,251,247,0.6)' }}>Loading event directory...</span>
                    </td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.6 }}>🎭</div>
                      <h4 style={{ color: 'var(--color-gold-light)', margin: '0 0 0.5rem 0' }}>No Events Found</h4>
                      <p style={{ fontSize: '0.82rem', color: 'rgba(253,251,247,0.6)', maxWidth: '400px', margin: '0 auto 1.25rem auto' }}>
                        No festival events match your search criteria. Try resetting filters or add a new event.
                      </p>
                      <Link href="/admin/events/create" className="btn btn-outline" style={{ fontSize: '0.78rem' }}>
                        Create First Event
                      </Link>
                    </td>
                  </tr>
                ) : (
                  paginatedEvents.map((ev, idx) => {
                    const globalIndex = (currentPage - 1) * pageSize + idx;
                    const isPublished = ev.status === 'published' || ev.status === 'scheduled';

                    return (
                      <tr key={ev.id}>
                        {/* Reordering Controls */}
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
                            <button
                              type="button"
                              className="btn-action-order"
                              onClick={() => handleMoveOrder(globalIndex, 'up')}
                              disabled={globalIndex === 0 || isReordering}
                              title="Move session earlier in schedule"
                            >
                              ▲
                            </button>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-gold-primary)' }}>
                              #{ev.displayOrder}
                            </span>
                            <button
                              type="button"
                              className="btn-action-order"
                              onClick={() => handleMoveOrder(globalIndex, 'down')}
                              disabled={globalIndex === events.length - 1 || isReordering}
                              title="Move session later in schedule"
                            >
                              ▼
                            </button>
                          </div>
                        </td>

                        {/* Banner Preview */}
                        <td>
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              background: '#0d0a07',
                              border: '1px solid rgba(201, 151, 43, 0.3)',
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={ev.image || '/images/hero-stage.jpg'}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = '/images/hero-stage.jpg';
                              }}
                            />
                          </div>
                        </td>

                        {/* Title & Description */}
                        <td style={{ maxWidth: '280px' }}>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem', marginBottom: '0.2rem' }}>
                            {ev.title}
                          </div>
                          <div
                            style={{
                              fontSize: '0.72rem',
                              color: 'rgba(253,251,247,0.55)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {ev.description}
                          </div>
                        </td>

                        {/* Category */}
                        <td>
                          <span className="badge-status badge-pending" style={{ fontSize: '0.68rem' }}>
                            {ev.category}
                          </span>
                        </td>

                        {/* Date & Timings */}
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--color-gold-light)', fontSize: '0.8rem' }}>
                            {formatTime(ev.startTime)} – {formatTime(ev.endTime)}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'rgba(253,251,247,0.5)' }}>
                            {ev.date}
                          </div>
                        </td>

                        {/* Venue */}
                        <td style={{ fontSize: '0.75rem', color: 'rgba(253,251,247,0.7)', maxWidth: '200px' }}>
                          {ev.venue}
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`badge-status badge-status-${ev.status || 'scheduled'}`}>
                            {ev.status === 'live' ? '● LIVE' : ev.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            type="button"
                            className="btn-action-toggle"
                            onClick={() => handleTogglePublish(ev)}
                            title={isPublished ? 'Unpublish from public view' : 'Publish to public view'}
                            style={{ marginRight: '0.35rem' }}
                          >
                            {isPublished ? 'Unpublish' : 'Publish'}
                          </button>

                          <Link
                            href={`/admin/events/${ev.id}/edit`}
                            className="btn-action-edit"
                            style={{ marginRight: '0.35rem' }}
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            className="btn-action-delete"
                            onClick={() => setPendingDeleteEvent(ev)}
                            title="Delete event permanently"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="admin-pagination">
              <div>
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredEvents.length)} of {filteredEvents.length} items
              </div>

              <div className="admin-pagination-controls">
                <button
                  type="button"
                  className="btn-page"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`btn-page ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  className="btn-page"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {pendingDeleteEvent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: '#140f09',
              border: '1px solid #E74C3C',
              borderRadius: '8px',
              padding: '1.75rem',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 10px 40px rgba(0,0,0,0.9)',
            }}
          >
            <h4 style={{ color: '#ff6b6b', margin: '0 0 0.75rem 0', fontSize: '1.15rem' }}>
              Confirm Event Deletion
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(253,251,247,0.8)', marginBottom: '0.75rem' }}>
              Are you sure you want to permanently delete:
            </p>
            <div
              style={{
                background: '#0a0805',
                border: '1px solid rgba(231, 76, 60, 0.3)',
                borderRadius: '6px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                {pendingDeleteEvent.title}
              </div>
              <div style={{ color: 'var(--color-gold-light)', fontSize: '0.75rem' }}>
                {pendingDeleteEvent.date} • {formatTime(pendingDeleteEvent.startTime)} – {formatTime(pendingDeleteEvent.endTime)}
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#ff9999', margin: '0 0 1.25rem 0' }}>
              ⚠️ This will remove the session from the public website timeline immediately.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
                onClick={() => setPendingDeleteEvent(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  background: '#E74C3C',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.85rem',
                  fontWeight: 600,
                }}
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
