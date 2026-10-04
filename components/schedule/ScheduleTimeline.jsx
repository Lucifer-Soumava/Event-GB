'use client';

import { useState, useEffect, useCallback } from 'react';
import EventDetailModal from './EventDetailModal';

const FALLBACK_EVENTS = [
  {
    id: 'gb-01-inaugural',
    title: 'Inaugural Ceremony & Mangik Alpona Unveiling',
    description: 'Opening prayers, ceremonial lighting of the brass pradip, and presentation of the ceremonial handmade Alpona motif honoring classical Bengali cultural heritage.',
    date: '2026-11-01',
    startTime: '17:00',
    endTime: '17:30',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Inauguration',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 1,
  },
  {
    id: 'gb-02-music-classical',
    title: 'Raga Recital: Melodies of Awakening',
    description: 'Emerging vocalists and instrumentalists perform traditional Bengali ragas and semi-classical khayal compositions on sitar, harmonium, and pakhawaj.',
    date: '2026-11-01',
    startTime: '17:35',
    endTime: '18:15',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Music',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 2,
  },
  {
    id: 'gb-03-recitation-poetry',
    title: 'Kabita O Kanthoswar: Poetic Eloquence',
    description: 'Youth elocutionists recite selected verses from Rabindranath Tagore, Kazi Nazrul Islam, Jibanananda Das, and contemporary emerging Bengali poets.',
    date: '2026-11-01',
    startTime: '18:20',
    endTime: '18:50',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Recitation',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 3,
  },
  {
    id: 'gb-04-dance-choreography',
    title: 'Nritya Taranga: Classical & Creative Dance',
    description: 'Expressive semiclassical and creative Bengali choreography depicting nature, folk heritage, and seasonal rhythms through mudras and rhythmic footwork.',
    date: '2026-11-01',
    startTime: '18:55',
    endTime: '19:35',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Dance',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 4,
  },
  {
    id: 'gb-05-theatre-drama',
    title: 'Natak: Intimate Proscenium Theatre',
    description: 'An original 35-minute dramatic stage production mounted by an emerging Kolkata youth theatre collective exploring contemporary social narratives and Bengali identity.',
    date: '2026-11-01',
    startTime: '19:40',
    endTime: '20:20',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Theatre',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 5,
  },
  {
    id: 'gb-06-honors-finale',
    title: 'Emerging Talent Recognition & Grand Collaborative Finale',
    description: 'Felicitation of all participating debut artists, presentation of commemorative Goynar Baksho 2026 citations, and an acoustic cross-genre jugalbandi finale.',
    date: '2026-11-01',
    startTime: '20:25',
    endTime: '21:00',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Honors',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 6,
  },
];

export default function ScheduleTimeline({ isFullPage = false }) {
  const [events, setEvents] = useState(FALLBACK_EVENTS);
  const [categories, setCategories] = useState(['All', 'Dance', 'Honors', 'Inauguration', 'Music', 'Recitation', 'Theatre']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all' | 'today' | 'upcoming'
  const [loading, setLoading] = useState(false);
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

      setEvents(json.data || FALLBACK_EVENTS);
      if (json.categories && json.categories.length > 0) {
        setCategories(json.categories);
      }
    } catch (err) {
      console.warn('Schedule live fetch notice:', err);
      // If we don't already have events, fall back gracefully
      setEvents((prev) => (prev.length > 0 ? prev : FALLBACK_EVENTS));
      setError(null);
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
