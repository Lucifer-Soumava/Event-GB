import { useEffect } from 'react';

export default function EventDetailModal({ event, onClose }) {
  useEffect(() => {
    if (!event) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [event, onClose]);

  if (!event) return null;

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

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-event-title"
    >
      <div className="modal-dialog frame-four-corners">
        <div className="corner-flourish corner-flourish-tl"></div>
        <div className="corner-flourish corner-flourish-tr"></div>
        <div className="corner-flourish corner-flourish-bl"></div>
        <div className="corner-flourish corner-flourish-br"></div>

        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close event details"
        >
          ✕
        </button>

        <div style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span className="badge badge-gold">{event.category}</span>
            <span className={`status-chip status-${event.status}`}>{event.status}</span>
          </div>

          <h2 id="modal-event-title" className="type-h2" style={{ color: 'var(--color-white)', marginTop: '4px' }}>
            {event.title}
          </h2>
        </div>

        {event.image && (
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-xs)',
              overflow: 'hidden',
              marginBottom: 'var(--space-lg)',
              border: '1px solid var(--color-gold-alpha-40)',
            }}
          >
            <img
              src={event.image}
              alt={event.title}
              style={{ width: '100%', maxHeight: '220px', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Timings & Logistics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'var(--space-md)',
            backgroundColor: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-gold-alpha-25)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-md)',
            marginBottom: 'var(--space-lg)',
          }}
        >
          <div>
            <span className="type-caption" style={{ color: 'var(--color-gold-muted)' }}>DATE</span>
            <div style={{ fontFamily: 'var(--font-family-display)', color: 'var(--color-gold-highlight)', fontWeight: 600 }}>
              {formatDate(event.date)}
            </div>
          </div>

          <div>
            <span className="type-caption" style={{ color: 'var(--color-gold-muted)' }}>TIMING</span>
            <div style={{ fontFamily: 'var(--font-family-display)', color: 'var(--color-gold-highlight)', fontWeight: 600 }}>
              {formatTime(event.startTime)} – {formatTime(event.endTime)}
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <span className="type-caption" style={{ color: 'var(--color-gold-muted)' }}>VENUE</span>
            <div style={{ color: 'var(--color-cream-warm)', fontSize: 'var(--font-size-sm)' }}>
              {event.venue}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h4 className="type-h4" style={{ fontSize: 'var(--font-size-sm)', marginBottom: '8px' }}>
            SESSION OVERVIEW
          </h4>
          <p className="type-body" style={{ color: 'var(--color-cream-warm)', lineHeight: 1.7 }}>
            {event.description}
          </p>
        </div>

        <div className="form-actions-responsive" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)', alignItems: 'center' }}>
          <button type="button" className="btn btn-gold-ghost btn-sm" onClick={onClose}>
            Close
          </button>
          <a
            href="/register"
            className="btn btn-gold-primary btn-sm"
            onClick={onClose}
          >
            <span>Reserve Pass for Gala</span>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
