'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/admin/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide both username/email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Authentication failed. Please check credentials.');
        setLoading(false);
        return;
      }

      // Successful login -> Redirect to destination
      router.push(nextUrl);
      router.refresh();
    } catch (err) {
      console.error('Login submit error:', err);
      setError('A connection error occurred. Please verify server status.');
      setLoading(false);
    }
  };

  const fillCredentials = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="login-card">
      <div className="login-header">
        <div className="login-brand-emblem" aria-hidden="true">
          গ
        </div>
        <h1 className="login-title">Festival Control Center</h1>
        <p className="login-subtitle">
          গয়নার বাক্স বার্ষিক উদযাপন ২০২৬ • Secure Staff &amp; Administrator Portal
        </p>
      </div>

      {searchParams.get('next') && !error && (
        <div className="admin-alert-banner admin-alert-info" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div>
            <strong>Session Required:</strong> Please authenticate to access the requested administrative module.
          </div>
        </div>
      )}

      {error && (
        <div className="admin-alert-banner admin-alert-danger" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <div>
            <strong>Access Denied:</strong> {error}
          </div>
        </div>
      )}

      <form onSubmit={handleLogin} noValidate>
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label htmlFor="username" className="form-label" style={{ color: 'var(--color-gold-light)' }}>
            Username or Email Address
          </label>
          <input
            id="username"
            type="text"
            className="form-control"
            placeholder="e.g. admin or staff"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            autoComplete="username"
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label htmlFor="password" className="form-label" style={{ color: 'var(--color-gold-light)', marginBottom: 0 }}>
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-gold-primary)',
                fontSize: '0.72rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="form-control"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.85rem', fontWeight: 700, fontSize: '0.9rem' }}
          disabled={loading}
        >
          {loading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="spinner" style={{ width: '16px', height: '16px' }} />
              Verifying Credentials...
            </span>
          ) : (
            'Authenticate & Enter Portal'
          )}
        </button>
      </form>

      {/* Quick Testing Credentials Switcher */}
      <div className="quick-credentials-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--color-gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Demo Accounts
          </span>
          <span style={{ fontSize: '0.68rem', color: 'rgba(253,251,247,0.5)' }}>Click to autofill</span>
        </div>

        <div className="quick-cred-row">
          <div>
            <span className="role-badge role-badge-admin" style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem' }}>
              ADMIN
            </span>
            <span style={{ marginLeft: '0.5rem', color: '#fff' }}>admin</span>
            <span style={{ marginLeft: '0.4rem', color: 'rgba(253,251,247,0.5)' }}>Admin@Goynar2026!</span>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.68rem' }}
            onClick={() => fillCredentials('admin', 'Admin@Goynar2026!')}
          >
            Fill Admin
          </button>
        </div>

        <div className="quick-cred-row">
          <div>
            <span className="role-badge role-badge-staff" style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem' }}>
              CHECKIN_STAFF
            </span>
            <span style={{ marginLeft: '0.5rem', color: '#fff' }}>staff</span>
            <span style={{ marginLeft: '0.4rem', color: 'rgba(253,251,247,0.5)' }}>Staff@Goynar2026!</span>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.68rem' }}
            onClick={() => fillCredentials('staff', 'Staff@Goynar2026!')}
          >
            Fill Staff
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem' }}>
        <Link href="/" style={{ color: 'var(--color-gold-primary)', textDecoration: 'none' }}>
          ← Return to Festival Homepage
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="login-page-container">
      <Suspense fallback={<div className="spinner" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
