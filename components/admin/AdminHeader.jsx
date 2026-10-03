import Link from 'next/link';

export default function AdminHeader({ user, activeSection, onLogout }) {
  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
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
              onClick={onLogout}
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

      {/* Role Navigation Bar */}
      <div className="admin-tabs-bar">
        <div className="admin-tabs-inner">
          <Link
            href="/admin/dashboard"
            className={`admin-tab-btn ${activeSection === 'dashboard' ? 'active' : ''}`}
          >
            <span>📊</span> Dashboard
          </Link>

          {isAdmin && (
            <Link
              href="/admin/events"
              className={`admin-tab-btn ${activeSection === 'events' ? 'active' : ''}`}
            >
              <span>🎭</span> Event Management
            </Link>
          )}

          <Link
            href="/admin/check-in"
            className={`admin-tab-btn ${activeSection === 'checkin' ? 'active' : ''}`}
          >
            <span>📱</span> Gate Check-in
          </Link>

          <Link
            href="/admin/dashboard?tab=registrations"
            className={`admin-tab-btn ${activeSection === 'registrations' ? 'active' : ''}`}
          >
            <span>🎟️</span> Registrations
          </Link>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-tab-btn"
            style={{ marginLeft: 'auto', borderLeft: '1px solid rgba(201, 151, 43, 0.25)' }}
            title="Open public website in a new tab"
          >
            <span>🌐</span> View Public Site ↗
          </Link>
        </div>
      </div>
    </>
  );
}
