'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-body" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--color-gold-primary)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem', width: 36, height: 36, border: '3px solid rgba(201,151,43,0.2)', borderTopColor: 'var(--color-gold-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontFamily: 'var(--font-serif)', letterSpacing: '0.05em' }}>Loading Goynar Baksho Command Center...</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Session & User State
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Active Tab
  const initialTab = searchParams.get('tab') || 'analytics';
  const [activeTab, setActiveTab] = useState(initialTab); // 'analytics' | 'registrations' | 'checkin' | 'schedule' | 'security'

  // Data States
  const [analytics, setAnalytics] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [scheduleEvents, setScheduleEvents] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Search, Filter, Sort & Pagination States for Attendee Table
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Check-in Terminal State
  const [scanInput, setScanInput] = useState('');
  const [checkInResult, setCheckInResult] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingInId, setCheckingInId] = useState(null);

  // Security Demonstration State
  const [securityTestResult, setSecurityTestResult] = useState(null);

  // Delete Confirmation Modal State
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // 1. Fetch Current User Session
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!res.ok || !data.authenticated) {
        router.push('/admin/login?next=/admin/dashboard');
        return;
      }
      setUser(data.user);
      // If user came with no specific tab query: default to analytics for ADMIN, checkin for STAFF
      if (!searchParams.get('tab')) {
        setActiveTab(data.user.role === 'ADMIN' ? 'analytics' : 'checkin');
      }
    } catch (err) {
      console.error('Session fetch error:', err);
      router.push('/admin/login');
    } finally {
      setLoadingUser(false);
    }
  }, [router, searchParams]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Synchronize activeTab when URL searchParams ?tab=... changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // 2. Load Registrations from authoritative database
  const loadRegistrations = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const query = new URLSearchParams();
      if (searchTerm) query.set('search', searchTerm);
      if (statusFilter !== 'all') query.set('checkedIn', statusFilter === 'checked_in' ? '1' : '0');
      if (eventFilter !== 'all') query.set('eventId', eventFilter);
      query.set('sortBy', sortBy);
      query.set('sortOrder', sortOrder);

      const res = await fetch(`/api/admin/registrations?${query.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setRegistrations(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load registrations:', err);
    } finally {
      setLoadingData(false);
    }
  }, [user, searchTerm, statusFilter, eventFilter, sortBy, sortOrder]);

  // 3. Load Real-time Analytics (ADMIN only)
  const loadAnalytics = useCallback(async () => {
    if (!user || user.role !== 'ADMIN') return;
    setLoadingAnalytics(true);
    try {
      const res = await fetch('/api/admin/analytics');
      const data = await res.json();
      if (res.ok && data.success) {
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [user]);

  // 4. Load Schedule Events
  const loadSchedule = useCallback(async () => {
    try {
      const res = await fetch('/api/schedule');
      const data = await res.json();
      if (res.ok && data.success) {
        setScheduleEvents(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load schedule:', err);
    }
  }, []);

  // Reload data on user or dependency change
  useEffect(() => {
    if (user) {
      loadRegistrations();
      loadSchedule();
      if (user.role === 'ADMIN') {
        loadAnalytics();
      }
    }
  }, [user, loadRegistrations, loadSchedule, loadAnalytics]);

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

  // Check-in Handler
  const handlePerformCheckIn = async (tokenOrId, attendeeName) => {
    const target = (tokenOrId || scanInput).trim();
    if (!target) return;

    setCheckingIn(true);
    setCheckingInId(target);
    setCheckInResult(null);

    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: target }),
      });

      const data = await res.json();
      setCheckInResult({
        success: data.success,
        status: data.status,
        message: data.message || data.error,
        registration: data.registration,
        checkInTime: data.checkInTime || data.registration?.checkedInAt,
      });

      if (res.ok && data.success) {
        setScanInput('');
        setActionMessage({
          type: 'success',
          text: `✓ ${data.registration?.name || attendeeName || 'Attendee'} successfully checked in!`,
        });
        loadRegistrations();
        if (user?.role === 'ADMIN') loadAnalytics();
      } else {
        setActionMessage({
          type: 'danger',
          text: `⚠️ Check-in failed: ${data.message || data.error || 'Pass could not be verified.'}`,
        });
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setActionMessage({
        type: 'danger',
        text: 'Communication error occurred while contacting check-in gate.',
      });
      setCheckInResult({
        success: false,
        status: 'NETWORK_ERROR',
        message: 'Network error occurred while processing check-in.',
      });
    } finally {
      setCheckingIn(false);
      setCheckingInId(null);
    }
  };

  // Undo / Reset Check-in Handler
  const handleUndoCheckIn = async (tokenOrId, attendeeName) => {
    const target = (tokenOrId || '').trim();
    if (!target) return;

    setCheckingInId(target);
    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: target, action: 'undo' }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({
          type: 'success',
          text: `↺ Check-in status for ${attendeeName || 'attendee'} has been reset to "Not Arrived".`,
        });
        loadRegistrations();
        if (user?.role === 'ADMIN') loadAnalytics();
      } else {
        setActionMessage({
          type: 'danger',
          text: `⚠️ Could not reset check-in: ${data.message || data.error || 'Failed to undo check-in.'}`,
        });
      }
    } catch (err) {
      console.error('Undo check-in error:', err);
      setActionMessage({
        type: 'danger',
        text: 'Network error occurred while resetting check-in status.',
      });
    } finally {
      setCheckingInId(null);
    }
  };

  // Delete Registration Handler (ADMIN only)
  const confirmDeleteRegistration = async () => {
    if (!pendingDeleteId) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/admin/registrations/${pendingDeleteId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setActionMessage({ type: 'success', text: data.message });
        setPendingDeleteId(null);
        loadRegistrations();
        if (user?.role === 'ADMIN') loadAnalytics();
      } else {
        setActionMessage({ type: 'danger', text: data.error || 'Failed to delete registration.' });
      }
    } catch (err) {
      console.error('Delete error:', err);
      setActionMessage({ type: 'danger', text: 'Error connecting to delete endpoint.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Test Unauthorized Backend Security (CHECKIN_STAFF attempts DELETE or ANALYTICS)
  const runSecurityTest = async (testType) => {
    setSecurityTestResult(null);
    try {
      if (testType === 'DELETE') {
        const dummyId = registrations[0]?.registrationId || 'GB26-TEST-9999';
        const res = await fetch(`/api/admin/registrations/${dummyId}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        setSecurityTestResult({
          attempt: `DELETE /api/admin/registrations/${dummyId}`,
          statusCode: res.status,
          blocked: res.status === 403 || res.status === 401,
          message: data.error || data.message,
        });
      } else if (testType === 'ANALYTICS') {
        const res = await fetch('/api/admin/analytics');
        const data = await res.json();
        setSecurityTestResult({
          attempt: 'GET /api/admin/analytics',
          statusCode: res.status,
          blocked: res.status === 403 || res.status === 401,
          message: data.error || 'Access granted (Admin)',
        });
      }
    } catch (err) {
      console.error('Security test error:', err);
    }
  };

  // Column Sorting Handler
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
    setCurrentPage(1);
  };

  // Export CSV Handler
  const exportToCSV = () => {
    if (!registrations || registrations.length === 0) {
      alert('No registrations available to export.');
      return;
    }

    const headers = [
      'Registration ID',
      'Name',
      'Email',
      'Phone',
      'Organization',
      'Session Registered',
      'Registration Date',
      'Check-in Status',
      'Check-in Time',
      'Checked In By',
    ];

    const rows = registrations.map((r) => [
      `"${r.registrationId || ''}"`,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${(r.organization || '').replace(/"/g, '""')}"`,
      `"${(r.eventTitle || '').replace(/"/g, '""')}"`,
      `"${r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN') : ''}"`,
      r.checkedIn ? '"Checked In"' : '"Pending"',
      `"${r.checkedInAt ? new Date(r.checkedInAt).toLocaleString('en-IN') : ''}"`,
      `"${(r.checkedInBy || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `goynar_baksho_registrations_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Client-side pagination slicing
  const totalPages = Math.ceil(registrations.length / pageSize) || 1;
  const paginatedRegistrations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return registrations.slice(start, start + pageSize);
  }, [registrations, currentPage, pageSize]);

  // Max count calculation for chart bars
  const maxRegOverTime = useMemo(() => {
    if (!analytics?.registrationsOverTime?.length) return 1;
    return Math.max(...analytics.registrationsOverTime.map((d) => d.count), 1);
  }, [analytics]);

  const maxCheckInOverTime = useMemo(() => {
    if (!analytics?.checkInsOverTime?.length) return 1;
    return Math.max(...analytics.checkInsOverTime.map((d) => d.count), 1);
  }, [analytics]);

  if (loadingUser) {
    return (
      <div className="admin-body" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto 1rem auto' }} />
          <p style={{ color: 'var(--color-gold-light)', fontSize: '0.9rem' }}>Verifying session &amp; permissions...</p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="admin-body">
      {/* Top Operations Navbar */}
      <header className="admin-navbar">
        <div className="admin-navbar-inner">
          <Link href="/admin/dashboard" className="admin-brand">
            <div className="admin-brand-icon">গ</div>
            <div className="admin-brand-text">
              <h1>Goynar Baksho 2026</h1>
              <span>Festival Control Center • Operational Portal</span>
            </div>
          </Link>

          <div className="admin-user-profile">
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{user?.name}</span>
              <span className={`role-badge ${isAdmin ? 'role-badge-admin' : 'role-badge-staff'}`}>
                {isAdmin ? '★ System Administrator' : '✓ Check-in Staff'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="btn-admin-logout"
              title="End session and return to login"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Role Navigation Tabs */}
      <div className="admin-tabs-bar">
        <div className="admin-tabs-inner">
          {isAdmin && (
            <button
              className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <span>📊</span> Real-Time Analytics
            </button>
          )}

          <button
            className={`admin-tab-btn ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('registrations')}
          >
            <span>🎟️</span> {isAdmin ? 'Attendee Directory & Passes' : 'Attendee Verification List'}
          </button>

          <Link
            href="/admin/check-in"
            className="admin-tab-btn"
            style={{ textDecoration: 'none' }}
          >
            <span>📷</span> Camera QR Scanner ↗
          </Link>

          <button
            className={`admin-tab-btn ${activeTab === 'checkin' ? 'active' : ''}`}
            onClick={() => setActiveTab('checkin')}
          >
            <span>📱</span> Gate Terminal
          </button>

          {isAdmin && (
            <Link
              href="/admin/events"
              className="admin-tab-btn"
              style={{ textDecoration: 'none' }}
            >
              <span>🎭</span> Event Management ↗
            </Link>
          )}

          <button
            className={`admin-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <span>🛡️</span> Security &amp; RBAC Matrix
          </button>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-tab-btn"
            style={{ marginLeft: 'auto', borderLeft: '1px solid rgba(201, 151, 43, 0.25)' }}
            title="Open public website in a new tab"
          >
            <span>🌐</span> Public Site ↗
          </Link>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="admin-workspace">
        {/* Global Toast Action Message */}
        {actionMessage && (
          <div
            className={`admin-alert-banner ${
              actionMessage.type === 'success' ? 'admin-alert-success' : 'admin-alert-danger'
            }`}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>{actionMessage.text}</span>
            <button
              onClick={() => setActionMessage(null)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ===============================================================
            TAB 1: REAL-TIME EVENT ANALYTICS & VISUALIZATIONS (ADMIN ONLY)
            =============================================================== */}
        {activeTab === 'analytics' && isAdmin && (
          <div>
            {/* 5 Real-Time Operational Stat Cards */}
            <div className="admin-metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              {/* 1. Total registrations */}
              <div className="admin-metric-card">
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Total Registrations</span>
                  <span style={{ color: 'var(--color-gold-primary)' }}>🎟️</span>
                </div>
                <div className="admin-metric-value">{analytics?.totalRegistrations ?? '—'}</div>
                <div className="admin-metric-sub">Confirmed guest passes</div>
              </div>

              {/* 2. Checked-in attendees */}
              <div className="admin-metric-card">
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Checked-in Attendees</span>
                  <span style={{ color: '#2ECC71' }}>✓</span>
                </div>
                <div className="admin-metric-value" style={{ color: '#2ECC71' }}>
                  {analytics?.totalCheckedIn ?? '—'}
                </div>
                <div className="admin-metric-sub">
                  {analytics?.checkInRate ?? 0}% capacity absorption
                </div>
              </div>

              {/* 3. Not-yet-arrived attendees */}
              <div className="admin-metric-card">
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Not-Yet-Arrived</span>
                  <span style={{ color: '#F1C40F' }}>⌛</span>
                </div>
                <div className="admin-metric-value" style={{ color: '#F1C40F' }}>
                  {analytics?.notArrived ?? '—'}
                </div>
                <div className="admin-metric-sub">Awaiting auditorium arrival</div>
              </div>

              {/* 4. Today's registrations */}
              <div className="admin-metric-card">
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Today&apos;s Registrations</span>
                  <span style={{ color: 'var(--color-gold-light)' }}>⚡</span>
                </div>
                <div className="admin-metric-value">{analytics?.todayRegistrations ?? 0}</div>
                <div className="admin-metric-sub">Registered in the last 24h</div>
              </div>

              {/* 5. Today's check-ins */}
              <div className="admin-metric-card">
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Today&apos;s Check-ins</span>
                  <span style={{ color: '#2ECC71' }}>🚪</span>
                </div>
                <div className="admin-metric-value" style={{ color: '#2ECC71' }}>
                  {analytics?.todayCheckIns ?? 0}
                </div>
                <div className="admin-metric-sub">Turnstile entries today</div>
              </div>
            </div>

            {/* Visualizations Section */}
            <div className="analytics-charts-grid">
              {/* Visualization 1: Registration vs Check-in Count (Capacity Ratio) */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <h3 className="chart-card-title">
                    <span>⚖️</span> Registration vs. Check-in Ratio
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-gold-light)', fontWeight: 600 }}>
                    {analytics?.totalCheckedIn || 0} / {analytics?.totalRegistrations || 0} Admitted
                  </span>
                </div>

                <div className="comparison-bar-track">
                  <div
                    className="comparison-bar-fill-checkin"
                    style={{ width: `${analytics?.checkInRate || 0}%` }}
                    title={`Checked In: ${analytics?.totalCheckedIn || 0}`}
                  />
                  <div
                    className="comparison-bar-fill-pending"
                    style={{ width: `${100 - (analytics?.checkInRate || 0)}%` }}
                    title={`Pending Arrival: ${analytics?.notArrived || 0}`}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2ECC71' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#2ECC71', display: 'inline-block' }} />
                    Checked In ({analytics?.checkInRate || 0}%)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#F1C40F' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#F1C40F', display: 'inline-block' }} />
                    Not-Yet-Arrived ({100 - (analytics?.checkInRate || 0)}%)
                  </div>
                </div>

                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#050505', borderRadius: '6px', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'rgba(253,251,247,0.6)' }}>Auditorium Target:</span>
                    <strong style={{ color: '#fff' }}>150+ Attendees</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(253,251,247,0.6)' }}>Live Status:</span>
                    <strong style={{ color: 'var(--color-gold-primary)' }}>
                      {analytics?.notArrived === 0 && (analytics?.totalRegistrations || 0) > 0
                        ? '100% Full Attendance!'
                        : 'Gate Checkpoint Active'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Visualization 2: Registrations Over Time */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <h3 className="chart-card-title">
                    <span>📈</span> Registrations Over Time
                  </h3>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(253,251,247,0.5)' }}>Daily Trend</span>
                </div>

                {analytics?.registrationsOverTime?.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(253,251,247,0.4)', fontSize: '0.8rem' }}>
                    No time-series registration data recorded yet.
                  </div>
                ) : (
                  <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '0.5rem', padding: '0.5rem 0' }}>
                    {analytics?.registrationsOverTime?.map((item) => {
                      const heightPercent = Math.max(12, Math.round((item.count / maxRegOverTime) * 100));
                      return (
                        <div key={item.dateGroup} className="timeline-bar-column">
                          <span style={{ fontSize: '0.68rem', color: 'var(--color-gold-light)', fontWeight: 600 }}>
                            {item.count}
                          </span>
                          <div
                            className="timeline-bar-fill"
                            style={{ height: `${heightPercent}%` }}
                            title={`${item.dateGroup}: ${item.count} registration(s)`}
                          />
                          <span style={{ fontSize: '0.62rem', color: 'rgba(253,251,247,0.5)', whiteSpace: 'nowrap' }}>
                            {item.dateGroup.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Visualization 3: Check-ins Over Time */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <h3 className="chart-card-title">
                    <span>⏱️</span> Check-ins Over Time
                  </h3>
                  <span style={{ fontSize: '0.7rem', color: '#2ECC71' }}>Auditorium Gate Arrivals</span>
                </div>

                {analytics?.checkInsOverTime?.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(253,251,247,0.4)', fontSize: '0.8rem' }}>
                    No check-ins recorded yet. Passes scanned at the gate will populate this timeline.
                  </div>
                ) : (
                  <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '0.5rem', padding: '0.5rem 0' }}>
                    {analytics?.checkInsOverTime?.map((item) => {
                      const heightPercent = Math.max(12, Math.round((item.count / maxCheckInOverTime) * 100));
                      return (
                        <div key={item.dateGroup} className="timeline-bar-column">
                          <span style={{ fontSize: '0.68rem', color: '#2ECC71', fontWeight: 600 }}>
                            {item.count}
                          </span>
                          <div
                            className="timeline-bar-fill timeline-bar-fill-checkin"
                            style={{ height: `${heightPercent}%` }}
                            title={`${item.dateGroup}: ${item.count} check-in(s)`}
                          />
                          <span style={{ fontSize: '0.62rem', color: 'rgba(253,251,247,0.5)', whiteSpace: 'nowrap' }}>
                            {item.dateGroup.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Visualization 4: Attendance by Event / Session Breakdown */}
            <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
              <div className="admin-card-header">
                <div>
                  <h3 className="admin-card-title">
                    <span>🏛️</span> Attendance by Event / Session
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(253,251,247,0.6)' }}>
                    Real-time registration capacity and verified gate arrivals per performance session
                  </span>
                </div>
                <Link href="/admin/events" className="btn btn-outline" style={{ fontSize: '0.75rem' }}>
                  Manage Schedule Sessions ↗
                </Link>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Performance Session</th>
                      <th>Artform</th>
                      <th>Timings</th>
                      <th style={{ textAlign: 'right' }}>Registrations</th>
                      <th style={{ textAlign: 'right' }}>Checked In</th>
                      <th style={{ textAlign: 'right' }}>Pending Arrival</th>
                      <th style={{ width: '160px' }}>Session Capacity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.eventStats?.map((ev) => {
                      const rate = ev.totalRegistrations > 0
                        ? Math.round((ev.checkedInCount / ev.totalRegistrations) * 100)
                        : 0;

                      return (
                        <tr key={ev.id}>
                          <td style={{ fontWeight: 600, color: '#fff' }}>{ev.title}</td>
                          <td>
                            <span className="badge-status badge-pending" style={{ fontSize: '0.65rem' }}>
                              {ev.category}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.75rem', color: 'rgba(253,251,247,0.7)' }}>
                            {ev.startTime} - {ev.endTime}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-gold-light)' }}>
                            {ev.totalRegistrations}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#2ECC71' }}>
                            {ev.checkedInCount}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#F1C40F' }}>
                            {ev.pendingCount}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div
                                style={{
                                  flex: 1,
                                  height: '8px',
                                  background: 'rgba(255,255,255,0.1)',
                                  borderRadius: '9999px',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${rate}%`,
                                    background: rate > 50 ? '#2ECC71' : 'var(--color-gold-primary)',
                                    borderRadius: '9999px',
                                    transition: 'width 0.4s ease',
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--color-gold-light)', width: '32px' }}>
                                {rate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Action Banner linking to Attendee Table */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                background: 'rgba(201, 151, 43, 0.08)',
                border: '1px solid rgba(201, 151, 43, 0.25)',
                borderRadius: '8px',
              }}
            >
              <div>
                <strong style={{ color: 'var(--color-gold-light)', fontSize: '0.9rem' }}>
                  Detailed Attendee Roster Available
                </strong>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'rgba(253,251,247,0.65)' }}>
                  Search, sort, filter, or export attendee guest records to CSV with one click.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setActiveTab('registrations')}
                style={{ fontSize: '0.8rem' }}
              >
                View Full Attendee Table →
              </button>
            </div>
          </div>
        )}

        {/* ===============================================================
            TAB 2: ATTENDEE TABLE (SEARCH, FILTER, SORT, PAGINATE, EXPORT CSV)
            =============================================================== */}
        {activeTab === 'registrations' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title">
                  {isAdmin ? '🎟️ Registered Attendees & Pass Directory' : '👥 Attendee Verification Directory'}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'rgba(253,251,247,0.6)' }}>
                  {isAdmin
                    ? 'Search, sort, filter by session or status, and export full records to CSV'
                    : 'Basic attendee identity details for gate verification'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={exportToCSV}
                  className="btn-export-csv"
                  title="Download attendee roster as CSV spreadsheet"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="admin-filter-bar">
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search by name, ID, email, or organization..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <select
                className="admin-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Check-in Statuses</option>
                <option value="checked_in">Checked In (Auditorium)</option>
                <option value="pending">Not Yet Arrived</option>
              </select>

              <select
                className="admin-select"
                value={eventFilter}
                onChange={(e) => {
                  setEventFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Festival Sessions</option>
                {scheduleEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>

              <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-gold-light)', fontWeight: 600 }}>
                {registrations.length} attendee(s) found
              </div>
            </div>

            {/* Sortable Attendee Table */}
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="sortable-th" onClick={() => handleSort('name')}>
                      Attendee Name
                      <span className="sort-icon">
                        {sortBy === 'name' ? (sortOrder === 'ASC' ? '▲' : '▼') : '↕'}
                      </span>
                    </th>
                    <th className="sortable-th" onClick={() => handleSort('registrationId')}>
                      Registration ID
                      <span className="sort-icon">
                        {sortBy === 'registrationId' ? (sortOrder === 'ASC' ? '▲' : '▼') : '↕'}
                      </span>
                    </th>
                    <th className="sortable-th" onClick={() => handleSort('email')}>
                      Email
                      <span className="sort-icon">
                        {sortBy === 'email' ? (sortOrder === 'ASC' ? '▲' : '▼') : '↕'}
                      </span>
                    </th>
                    <th>Phone</th>
                    <th className="sortable-th" onClick={() => handleSort('eventTitle')}>
                      Session
                      <span className="sort-icon">
                        {sortBy === 'eventTitle' ? (sortOrder === 'ASC' ? '▲' : '▼') : '↕'}
                      </span>
                    </th>
                    <th className="sortable-th" onClick={() => handleSort('createdAt')}>
                      Registration Date
                      <span className="sort-icon">
                        {sortBy === 'createdAt' ? (sortOrder === 'ASC' ? '▲' : '▼') : '↕'}
                      </span>
                    </th>
                    <th className="sortable-th" onClick={() => handleSort('checkedIn')}>
                      Check-in Status
                      <span className="sort-icon">
                        {sortBy === 'checkedIn' ? (sortOrder === 'ASC' ? '▲' : '▼') : '↕'}
                      </span>
                    </th>
                    <th className="sortable-th" onClick={() => handleSort('checkedInAt')}>
                      Check-in Time
                      <span className="sort-icon">
                        {sortBy === 'checkedInAt' ? (sortOrder === 'ASC' ? '▲' : '▼') : '↕'}
                      </span>
                    </th>
                    <th className="actions-col">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingData ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem' }}>
                        <div className="spinner" style={{ width: '26px', height: '26px', margin: '0 auto 0.5rem auto' }} />
                        <span style={{ fontSize: '0.8rem', color: 'rgba(253,251,247,0.6)' }}>Loading attendees...</span>
                      </td>
                    </tr>
                  ) : registrations.length === 0 ? (
                    <tr>
                      <td colSpan={9}>
                        <div className="admin-empty-state">
                          <div className="admin-empty-icon" aria-hidden="true">🎟️</div>
                          <div className="admin-empty-title">No Registrations Found</div>
                          <div className="admin-empty-desc">
                            {searchTerm || statusFilter !== 'all' || eventFilter !== 'all'
                              ? 'No attendee records match the current search query or filter settings.'
                              : 'No registrations have been logged yet for the festival.'}
                          </div>
                          {(searchTerm || statusFilter !== 'all' || eventFilter !== 'all') && (
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ fontSize: '0.78rem', padding: '6px 16px' }}
                              onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setEventFilter('all');
                                setCurrentPage(1);
                              }}
                            >
                              Reset Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedRegistrations.map((reg) => (
                      <tr key={reg.registrationId}>
                        <td style={{ fontWeight: 600, color: '#fff' }}>
                          <div>{reg.name}</div>
                          {reg.organization && (
                            <div style={{ fontSize: '0.7rem', color: 'rgba(253,251,247,0.5)' }}>
                              {reg.organization}
                            </div>
                          )}
                        </td>
                        <td style={{ fontFamily: 'monospace', color: 'var(--color-gold-light)', fontWeight: 600 }}>
                          {reg.registrationId}
                        </td>
                        <td style={{ fontSize: '0.78rem' }}>{reg.email || '—'}</td>
                        <td style={{ fontSize: '0.78rem', color: 'rgba(253,251,247,0.6)' }}>{reg.phone || '—'}</td>
                        <td style={{ maxWidth: '200px' }}>
                          <span style={{ color: 'var(--color-gold-primary)', fontWeight: 500, display: 'block', fontSize: '0.82rem' }}>
                            {reg.eventTitle || 'Annual Celebration'}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'rgba(253,251,247,0.5)' }}>
                            {reg.eventCategory}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.75rem', color: 'rgba(253,251,247,0.65)' }}>
                          {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td>
                          {reg.checkedIn ? (
                            <span className="badge-status badge-checked-in">
                              ✓ Checked In
                            </span>
                          ) : (
                            <span className="badge-status badge-pending">
                              ⌛ Not Arrived
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.75rem' }}>
                          {reg.checkedInAt ? (
                            <span style={{ color: '#2ECC71', fontWeight: 600 }}>
                              {new Date(reg.checkedInAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          ) : (
                            <span style={{ color: 'rgba(253,251,247,0.4)' }}>—</span>
                          )}
                        </td>
                        <td className="actions-col">
                          {!reg.checkedIn ? (
                            <button
                              type="button"
                              className="btn-action-checkin"
                              style={{ marginRight: '0.4rem' }}
                              onClick={() => handlePerformCheckIn(reg.qrToken || reg.registrationId, reg.name)}
                              disabled={checkingInId === (reg.qrToken || reg.registrationId)}
                            >
                              {checkingInId === (reg.qrToken || reg.registrationId) ? (
                                <>
                                  <span className="spinner" style={{ width: '12px', height: '12px' }} />
                                  Checking In...
                                </>
                              ) : (
                                '✓ Check In'
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-action-undo"
                              style={{ marginRight: '0.4rem' }}
                              onClick={() => handleUndoCheckIn(reg.qrToken || reg.registrationId, reg.name)}
                              disabled={checkingInId === (reg.qrToken || reg.registrationId)}
                              title="Reset status back to Not Arrived"
                            >
                              {checkingInId === (reg.qrToken || reg.registrationId) ? (
                                <>
                                  <span className="spinner" style={{ width: '12px', height: '12px' }} />
                                  Resetting...
                                </>
                              ) : (
                                '↺ Undo'
                              )}
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              type="button"
                              className="btn-action-delete"
                              onClick={() => setPendingDeleteId(reg.registrationId)}
                              title="Delete registration permanently"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="admin-pagination">
                <div>
                  Showing {(currentPage - 1) * pageSize + 1} to{' '}
                  {Math.min(currentPage * pageSize, registrations.length)} of {registrations.length} attendees
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
        )}

        {/* ===============================================================
            TAB 3: GATE CHECK-IN TERMINAL (ADMIN & CHECKIN_STAFF)
            =============================================================== */}
        {activeTab === 'checkin' && (
          <div>
            {!isAdmin && (
              <div className="admin-alert-banner admin-alert-info">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <div>
                  <strong>Auditorium Gate Mode Active:</strong> You are signed in as <strong>{user?.name}</strong> (CHECKIN_STAFF).
                </div>
              </div>
            )}

            <div
              style={{
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(201, 151, 43, 0.1)',
                border: '1px solid rgba(201, 151, 43, 0.3)',
                borderRadius: '8px',
                padding: '0.85rem 1.25rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <strong style={{ color: 'var(--color-gold-light)', display: 'block', fontSize: '0.9rem' }}>
                  📷 Full Device Camera QR Scanner
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'rgba(253,251,247,0.7)' }}>
                  Dedicated full-screen video scanner optimized for mobile phones and tablets.
                </span>
              </div>
              <Link
                href="/admin/check-in"
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
              >
                Open Camera Scanner ↗
              </Link>
            </div>

            <div className="qr-terminal-wrapper">
              {/* Left Column: Quick Scan Bar */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">📱 Quick Gate Terminal</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-gold-light)' }}>
                    High-Throughput Mode
                  </span>
                </div>

                <div className="qr-scanner-screen">
                  <div className="qr-scanner-reticle" />
                  <p style={{ fontSize: '0.82rem', color: 'rgba(253,251,247,0.8)', margin: '0 0 0.5rem 0' }}>
                    Enter attendee token or scan code
                  </p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-gold-primary)' }}>
                    Supports Base64URL QR Tokens &amp; Memorable Ticket IDs (GB26-XXXXXX-XXXX)
                  </span>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePerformCheckIn();
                  }}
                  style={{ marginTop: '1.25rem' }}
                >
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ flex: 1 }}
                      placeholder="Scan or paste QR Token / Ticket ID..."
                      value={scanInput}
                      onChange={(e) => setScanInput(e.target.value)}
                      disabled={checkingIn}
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ padding: '0.45rem 1.15rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                      disabled={checkingIn || !scanInput.trim()}
                    >
                      {checkingIn ? 'Verifying...' : 'Check In Pass'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Check-in Verification Feedback */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Verification Outcome</h3>
                </div>

                {checkInResult ? (
                  <div>
                    {checkInResult.success ? (
                      <div className="result-card-confirmed">
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>✅</div>
                        <h4 style={{ color: '#2ECC71', fontSize: '1.2rem', margin: '0 0 0.5rem 0', textAlign: 'center' }}>
                          ENTRY CONFIRMED
                        </h4>
                        <p style={{ color: '#fff', fontSize: '0.88rem', marginBottom: '1rem', textAlign: 'center' }}>
                          {checkInResult.message}
                        </p>

                        {checkInResult.registration && (
                          <div
                            style={{
                              background: '#0d0a07',
                              border: '1px solid rgba(46, 204, 113, 0.3)',
                              borderRadius: '6px',
                              padding: '1rem',
                              fontSize: '0.82rem',
                            }}
                          >
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                              <div>
                                <span style={{ color: 'rgba(253,251,247,0.5)', display: 'block', fontSize: '0.7rem' }}>
                                  ATTENDEE NAME
                                </span>
                                <strong style={{ color: '#fff' }}>{checkInResult.registration.name}</strong>
                              </div>
                              <div>
                                <span style={{ color: 'rgba(253,251,247,0.5)', display: 'block', fontSize: '0.7rem' }}>
                                  TICKET ID
                                </span>
                                <span style={{ color: 'var(--color-gold-light)', fontFamily: 'monospace' }}>
                                  {checkInResult.registration.registrationId}
                                </span>
                              </div>
                              <div style={{ gridColumn: 'span 2' }}>
                                <span style={{ color: 'rgba(253,251,247,0.5)', display: 'block', fontSize: '0.7rem' }}>
                                  SESSION
                                </span>
                                <strong style={{ color: 'var(--color-gold-primary)' }}>
                                  {checkInResult.registration.eventTitle}
                                </strong>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className={
                          checkInResult.status === 'ALREADY_CHECKED_IN'
                            ? 'result-card-warning'
                            : 'result-card-error'
                        }
                      >
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                          {checkInResult.status === 'ALREADY_CHECKED_IN' ? '⚠️' : '❌'}
                        </div>
                        <h4
                          style={{
                            color: checkInResult.status === 'ALREADY_CHECKED_IN' ? '#F1C40F' : '#ff6b6b',
                            fontSize: '1.2rem',
                            margin: '0 0 0.5rem 0',
                            textAlign: 'center',
                          }}
                        >
                          {checkInResult.status === 'ALREADY_CHECKED_IN'
                            ? 'ALREADY CHECKED IN'
                            : 'INVALID QR CODE'}
                        </h4>
                        <p style={{ color: '#fff', fontSize: '0.88rem', textAlign: 'center' }}>
                          {checkInResult.message}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      height: '240px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed rgba(201, 151, 43, 0.2)',
                      borderRadius: '8px',
                      color: 'rgba(253,251,247,0.4)',
                      textAlign: 'center',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>🎫</div>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>
                      Ready to scan. Present an attendee pass QR code or enter Ticket ID.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===============================================================
            TAB 4: SECURITY & RBAC AUDIT / VERIFICATION TERMINAL
            =============================================================== */}
        {activeTab === 'security' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title">🛡️ Role-Based Access Control (RBAC) &amp; Authorization Matrix</h3>
                <span style={{ fontSize: '0.75rem', color: 'rgba(253,251,247,0.6)' }}>
                  Live backend permission enforcement verification (Never relying on frontend route hiding)
                </span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="table-responsive" style={{ marginBottom: '1.5rem' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Privilege / Action</th>
                    <th>ADMIN Role</th>
                    <th>CHECKIN_STAFF Role</th>
                    <th>Backend Enforcement Endpoint</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>View Analytics Dashboard</strong></td>
                    <td><span style={{ color: '#2ECC71', fontWeight: 700 }}>✓ Granted</span></td>
                    <td><span style={{ color: '#E74C3C', fontWeight: 700 }}>✗ Strictly Forbidden (403)</span></td>
                    <td><code>GET /api/admin/analytics</code></td>
                  </tr>
                  <tr>
                    <td><strong>Scan QR Passes &amp; Check In</strong></td>
                    <td><span style={{ color: '#2ECC71', fontWeight: 700 }}>✓ Granted</span></td>
                    <td><span style={{ color: '#2ECC71', fontWeight: 700 }}>✓ Granted</span></td>
                    <td><code>POST /api/check-in</code></td>
                  </tr>
                  <tr>
                    <td><strong>View Full Attendee Records</strong></td>
                    <td><span style={{ color: '#2ECC71', fontWeight: 700 }}>✓ Full (Email, Phone, Tokens)</span></td>
                    <td><span style={{ color: 'var(--color-gold-light)', fontWeight: 700 }}>⚡ Basic / Masked Details</span></td>
                    <td><code>GET /api/admin/registrations</code></td>
                  </tr>
                  <tr>
                    <td><strong>Delete Attendee Registrations</strong></td>
                    <td><span style={{ color: '#2ECC71', fontWeight: 700 }}>✓ Granted</span></td>
                    <td><span style={{ color: '#E74C3C', fontWeight: 700 }}>✗ Strictly Forbidden (403)</span></td>
                    <td><code>DELETE /api/admin/registrations/[id]</code></td>
                  </tr>
                  <tr>
                    <td><strong>Create / Edit Festival Schedule</strong></td>
                    <td><span style={{ color: '#2ECC71', fontWeight: 700 }}>✓ Granted</span></td>
                    <td><span style={{ color: '#E74C3C', fontWeight: 700 }}>✗ Strictly Forbidden (403)</span></td>
                    <td><code>POST / PUT / PATCH / DELETE /api/schedule</code></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Interactive Penetration / RBAC Test Button */}
            <div
              style={{
                background: 'rgba(201, 151, 43, 0.08)',
                border: '1px solid rgba(201, 151, 43, 0.3)',
                borderRadius: '8px',
                padding: '1.25rem',
              }}
            >
              <h4 style={{ color: 'var(--color-gold-light)', margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>
                Simulate Direct API Unauthorized Access
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'rgba(253,251,247,0.7)', marginBottom: '1rem' }}>
                Test backend authorization enforcement right now with your current session (<strong>{user?.role}</strong>).
                If you are CHECKIN_STAFF, the backend will reject the DELETE request with status <code>403 Forbidden</code>.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => runSecurityTest('DELETE')}
                  style={{ fontSize: '0.8rem' }}
                >
                  Test DELETE Registration Request
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => runSecurityTest('ANALYTICS')}
                  style={{ fontSize: '0.8rem' }}
                >
                  Test GET Analytics Request
                </button>
              </div>

              {securityTestResult && (
                <div
                  style={{
                    marginTop: '1rem',
                    background: '#0a0805',
                    border: `1px solid ${securityTestResult.blocked ? '#E74C3C' : '#2ECC71'}`,
                    borderRadius: '6px',
                    padding: '0.85rem',
                    fontSize: '0.82rem',
                    fontFamily: 'monospace',
                  }}
                >
                  <div style={{ color: 'var(--color-gold-light)' }}>
                    Endpoint: {securityTestResult.attempt}
                  </div>
                  <div style={{ color: securityTestResult.statusCode === 200 ? '#2ECC71' : '#ff6b6b' }}>
                    Response Status: {securityTestResult.statusCode} {securityTestResult.statusCode === 403 ? '(Forbidden)' : securityTestResult.statusCode === 200 ? '(OK)' : ''}
                  </div>
                  <div style={{ color: '#fff', marginTop: '0.35rem' }}>
                    Backend Message: {securityTestResult.message}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal (ADMIN only) */}
      {pendingDeleteId && (
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
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 10px 30px rgba(0,0,0,0.9)',
            }}
          >
            <h4 style={{ color: '#ff6b6b', margin: '0 0 0.75rem 0', fontSize: '1.1rem' }}>
              Confirm Attendee Deletion
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(253,251,247,0.8)', marginBottom: '1.25rem' }}>
              Are you sure you want to permanently delete registration <strong>{pendingDeleteId}</strong>?
              This action cannot be undone and will invalidate their gate pass.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
                onClick={() => setPendingDeleteId(null)}
                disabled={deleteLoading}
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
                }}
                onClick={confirmDeleteRegistration}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
