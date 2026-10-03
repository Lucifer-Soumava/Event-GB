'use client';

import { useState, useEffect, useCallback } from 'react';
import EventDetailModal from './EventDetailModal';

export default function ScheduleTimeline({ isFullPage = false }) {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all' | 'today' | 'upcoming'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (timeFilter && timeFilter !== 'all') {
        params.append('timeFrame', timeFilter);
      }

      const res = await fetch(`/api/schedule?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load schedule (Status: ${res.status})`);
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Server returned an error.');
      }

      setEvents(json.data || []);
      if (json.categories && json.categories.length > 0) {
        setCategories(json.categories);
      }
    } catch (err) {
      console.error('Schedule fetch error:', err);
      setError(err.message || 'Unable to connect to the schedule service.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, timeFilter]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

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
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <section id="schedule" className="section-padding">
      <div className="container">
        <div className="section-header">
          <div className="type-kicker">LIVE PROGRAMME TIMETABLE</div>
          <h2 className="section-title">
            Festival <span className="gold-accent">Schedule</span>
          </h2>
          <p className="section-subtitle">
            Dynamic timeline of performances, ceremonies, and honours retrieved in real-time from our schedule database.
          </p>
          <div className="ornament-divider" aria-hidden="true"></div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="schedule-filter-bar">
          {/* TimeFrame Filter: Today, Upcoming, All */}
          <div className="filter-group">
            <span className="type-caption" style={{ color: 'var(--color-gold-muted)', marginRight: '4px' }}>
              TIMEFRAME:
            </span>
            <button
              type="button"
              className={`filter-btn ${timeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTimeFilter('all')}
            >
              All Events
            </button>
            <button
              type="button"
              className={`filter-btn ${timeFilter === 'today' ? 'active' : ''}`}
              onClick={() => setTimeFilter('today')}
            >
              Today&apos;s Events
            </button>
            <button
              type="button"
              className={`filter-btn ${timeFilter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setTimeFilter('upcoming')}
            >
              Upcoming Events
            </button>
          </div>

          {/* Categories Filter */}
          <div className="filter-group">
            <span className="type-caption" style={{ color: 'var(--color-gold-muted)', marginRight: '4px' }}>
              GENRE:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="timeline-track">
            {[1, 2, 3].map((i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-marker">
                  <div className="timeline-node" style={{ opacity: 0.5 }}></div>
                </div>
                <div className="timeline-card" style={{ cursor: 'default' }}>
                  <div className="skeleton-line" style={{ width: '35%', height: '20px' }}></div>
                  <div className="skeleton-line" style={{ width: '70%', height: '24px', margin: '12px 0' }}></div>
                  <div className="skeleton-line" style={{ width: '90%' }}></div>
                  <div className="skeleton-line" style={{ width: '50%' }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div
            className="card-cultural"
            style={{
              maxWidth: '680px',
              margin: '0 auto',
              textAlign: 'center',
              borderColor: 'var(--color-status-error)',
              padding: 'var(--space-2xl)',
            }}
          >
            <div style={{ color: 'var(--color-status-error)', fontSize: '28px', marginBottom: '8px' }}>⚠️</div>
            <h3 className="type-h3" style={{ color: 'var(--color-white)', marginBottom: '8px' }}>
              Unable to Retrieve Schedule
            </h3>
            <p className="type-body" style={{ color: 'var(--color-cream-muted)', marginBottom: 'var(--space-lg)' }}>
              {error}
            </p>
            <button type="button" className="btn btn-gold-primary btn-sm" onClick={fetchSchedule}>
              Retry Connection
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && events.length === 0 && (
          <div
            className="card-cultural frame-four-corners"
            style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: 'var(--space-3xl)' }}
          >
            <div className="corner-flourish corner-flourish-tl"></div>
            <div className="corner-flourish corner-flourish-tr"></div>
            <div className="corner-flourish corner-flourish-bl"></div>
            <div className="corner-flourish corner-flourish-br"></div>

            <div className="alpona-motif" aria-hidden="true"></div>
            <h3 className="type-h3" style={{ color: 'var(--color-gold-highlight)', marginBottom: '8px' }}>
              No Events Found
            </h3>
            <p className="type-body" style={{ color: 'var(--color-cream-muted)', marginBottom: 'var(--space-lg)' }}>
              There are currently no sessions scheduled under the selected filter criteria ({timeFilter !== 'all' ? timeFilter : ''} {selectedCategory !== 'All' ? `• ${selectedCategory}` : ''}).
            </p>
            <button
              type="button"
              className="btn btn-gold-outline btn-sm"
              onClick={() => {
                setSelectedCategory('All');
                setTimeFilter('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* TIMELINE / SCHEDULE LAYOUT */}
        {!loading && !error && events.length > 0 && (
          <div className="timeline-track">
            {events.map((evt, idx) => (
              <div key={evt.id || idx} className="timeline-item">
                {/* Node & Timestamp */}
                <div className="timeline-marker">
                  <div className="timeline-node"></div>
                  <span
                    className="type-caption"
                    style={{
                      marginTop: '8px',
                      color: 'var(--color-gold-highlight)',
                      fontFamily: 'var(--font-family-display)',
                      fontSize: '11px',
                      fontWeight: 600,
                      textAlign: 'center',
                    }}
                  >
                    {formatTime(evt.startTime)}
                  </span>
                </div>

                {/* Event Card */}
                <div
                  className="timeline-card"
                  onClick={() => setSelectedEvent(evt)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedEvent(evt);
                    }
                  }}
                  aria-label={`View details for ${evt.title}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="schedule-time-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{formatTime(evt.startTime)} – {formatTime(evt.endTime)}</span>
                      </span>

                      <span className="badge badge-gold" style={{ fontSize: '10px' }}>
                        {evt.category}
                      </span>
                    </div>

                    <span className={`status-chip status-${evt.status}`}>
                      {evt.status}
                    </span>
                  </div>

                  <h3 className="type-h3" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-white)', marginTop: '4px', marginBottom: '6px' }}>
                    {evt.title}
                  </h3>

                  <p className="type-body" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-cream-muted)', lineHeight: 1.6, marginBottom: 'var(--space-md)' }}>
                    {evt.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid var(--color-gold-alpha-15)', paddingTop: 'var(--space-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-gold-muted)', fontSize: '12px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{evt.venue}</span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-gold-ghost btn-sm"
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(evt);
                      }}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Full Schedule Page Link if on homepage */}
        {!isFullPage && (
          <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
            <a href="/schedule" className="btn btn-gold-outline">
              <span>View Dedicated Schedule Page</span>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </a>
          </div>
        )}

        {/* DETAIL MODAL VIEW */}
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      </div>
    </section>
  );
}
