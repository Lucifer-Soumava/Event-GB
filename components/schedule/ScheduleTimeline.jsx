'use client';

import { useState, useEffect, useCallback } from 'react';
import EventDetailModal from './EventDetailModal';

const FALLBACK_EVENTS = [
  {
    id: 'gb-01-inaugural',
    title: 'Vaidik Mantra Chanting',
    description: 'Auspicious Vedic mantra chanting and sacred ceremonial invocation inaugurating Goynar Baksho Annual Celebration 2026.',
    date: '2026-11-01',
    startTime: '13:00',
    endTime: '13:05',
    duration: '5 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Inauguration',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 1,
  },
  {
    id: 'gb-02-music-classical',
    title: 'Arkadeep (Song)',
    description: 'Live melodic Bengali vocal music recital and performance by Arkadeep.',
    date: '2026-11-01',
    startTime: '13:05',
    endTime: '13:10',
    duration: '5 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Music',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 2,
  },
  {
    id: 'gb-03-dance-shreyashi',
    title: 'Shreyashi (Dance)',
    description: 'Expressive classical and creative dance recital by Shreyashi featuring rhythmic footwork and mudras.',
    date: '2026-11-01',
    startTime: '13:10',
    endTime: '13:15',
    duration: '5 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Dance',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 3,
  },
  {
    id: 'gb-04-celebrity-intro',
    title: 'Celebrity Appearance',
    description: 'Inaugural celebrity stage appearance, warm festive greetings, and welcome address to the audience.',
    date: '2026-11-01',
    startTime: '13:15',
    endTime: '13:25',
    duration: '10 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Celebrity',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 4,
  },
  {
    id: 'gb-05-media-partner-1',
    title: 'Media Partner (I)',
    description: 'First official media partner broadcast showcase, stage dialogue, and live event coverage segment.',
    date: '2026-11-01',
    startTime: '13:25',
    endTime: '13:40',
    duration: '15 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Media',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 5,
  },
  {
    id: 'gb-06-bigboss-discussion',
    title: 'Bigg Boss Discussion',
    description: 'Engaging panel conversation and stage discussion covering exciting Bigg Boss highlights and insights.',
    date: '2026-11-01',
    startTime: '13:40',
    endTime: '13:50',
    duration: '10 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Discussion',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 6,
  },
  {
    id: 'gb-07-media-partner-2',
    title: 'Media Partner (II)',
    description: 'Second official media partner interaction, spotlight coverage, and press interactions.',
    date: '2026-11-01',
    startTime: '13:50',
    endTime: '14:05',
    duration: '15 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Media',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 7,
  },
  {
    id: 'gb-08-dance-joyeeta',
    title: 'Joyeeta (Dance)',
    description: 'Charming and rhythmic stage dance recital presented by Joyeeta.',
    date: '2026-11-01',
    startTime: '14:05',
    endTime: '14:10',
    duration: '5 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Dance',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 8,
  },
  {
    id: 'gb-09-sruti-performance',
    title: 'Sruti',
    description: 'Captivating acoustic recitation and musical performance by Sruti.',
    date: '2026-11-01',
    startTime: '14:10',
    endTime: '14:20',
    duration: '10 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Recitation',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 9,
  },
  {
    id: 'gb-10-celebrity-1',
    title: 'Celebrity 1st Session',
    description: 'Special on-stage celebrity session, audience interaction, and reflections.',
    date: '2026-11-01',
    startTime: '14:20',
    endTime: '14:30',
    duration: '10 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Celebrity',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 10,
  },
  {
    id: 'gb-11-media-partner-3',
    title: 'Media Partner (III)',
    description: 'Third media partner presentation, live broadcasting updates, and partner recognition.',
    date: '2026-11-01',
    startTime: '14:30',
    endTime: '14:45',
    duration: '15 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Media',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 11,
  },
  {
    id: 'gb-12-bisaida-diyadi-1',
    title: 'Bisai Da / Diya Di',
    description: 'Engaging stage hosting, humorous storytelling, and interactions with Bisai Da and Diya Di.',
    date: '2026-11-01',
    startTime: '14:45',
    endTime: '14:55',
    duration: '10 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Special',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 12,
  },
  {
    id: 'gb-13-book-launch',
    title: 'Book Release & Literary Segment',
    description: 'Ceremonial launch, reading, and celebration of the commemorative Goynar Baksho 2026 book publication.',
    date: '2026-11-01',
    startTime: '14:55',
    endTime: '15:15',
    duration: '20 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Literature',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 13,
  },
  {
    id: 'gb-14-media-partner-4',
    title: 'Media Partner (IV)',
    description: 'Fourth media partner feature, special interviews with festival dignitaries, and press showcase.',
    date: '2026-11-01',
    startTime: '15:15',
    endTime: '15:30',
    duration: '15 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Media',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 14,
  },
  {
    id: 'gb-15-ramp-walk',
    title: 'Ramp Walk & Cultural Fashion',
    description: 'Glamorous cultural ramp walk showcasing traditional Bengali heritage attires and contemporary aesthetics.',
    date: '2026-11-01',
    startTime: '15:30',
    endTime: '15:40',
    duration: '10 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Fashion',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 15,
  },
  {
    id: 'gb-16-celebrity-2-3',
    title: 'Celebrity 2 & 3 Special Stage',
    description: 'Dynamic joint appearance and interactive conversation with featured celebrity guests 2 and 3.',
    date: '2026-11-01',
    startTime: '15:40',
    endTime: '16:00',
    duration: '20 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Celebrity',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 16,
  },
  {
    id: 'gb-17-band-concert',
    title: 'Live Band Concert',
    description: 'Electrifying 30-minute headline live band musical performance featuring popular Bengali fusion and rock.',
    date: '2026-11-01',
    startTime: '16:00',
    endTime: '16:30',
    duration: '30 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Music',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 17,
  },
  {
    id: 'gb-18-bigboss-feature',
    title: 'Bigg Boss Special Feature',
    description: 'Exclusive Bigg Boss interactive stage segment, behind-the-scenes chatter, and audience interactions.',
    date: '2026-11-01',
    startTime: '16:30',
    endTime: '16:45',
    duration: '15 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Discussion',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 18,
  },
  {
    id: 'gb-19-song-debdootda',
    title: 'Debdoot Da (Song)',
    description: 'Heartfelt live vocal singing performance by Debdoot Da.',
    date: '2026-11-01',
    startTime: '16:45',
    endTime: '16:50',
    duration: '5 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Music',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 19,
  },
  {
    id: 'gb-20-group-dance',
    title: 'Grand Group Dance',
    description: 'High-energy synchronized group dance performance celebrating Bengal\'s folk and festive traditions.',
    date: '2026-11-01',
    startTime: '16:50',
    endTime: '17:00',
    duration: '10 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Dance',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 20,
  },
  {
    id: 'gb-21-the-bak-show',
    title: 'The Bak Show',
    description: 'The hallmark entertaining and witty stage presentation show by Goynar Baksho collective.',
    date: '2026-11-01',
    startTime: '17:00',
    endTime: '17:15',
    duration: '15 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Theatre',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 21,
  },
  {
    id: 'gb-22-celebrity-4',
    title: 'Celebrity 4 Stage Address',
    description: 'Special keynote stage appearance, blessings, and remarks by fourth celebrity guest.',
    date: '2026-11-01',
    startTime: '17:15',
    endTime: '17:25',
    duration: '10 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Celebrity',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 22,
  },
  {
    id: 'gb-23-felicitation',
    title: 'Felicitation Ceremony',
    description: 'Formal honours, citation presentations, and felicitation of artists, performers, and distinguished guests.',
    date: '2026-11-01',
    startTime: '17:25',
    endTime: '17:40',
    duration: '15 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Honors',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 23,
  },
  {
    id: 'gb-24-all-sponsors',
    title: 'All Sponsor Felicitation',
    description: 'Special token of appreciation and felicitation ceremony acknowledging all event sponsors and patrons.',
    date: '2026-11-01',
    startTime: '17:40',
    endTime: '17:50',
    duration: '10 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Honors',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 24,
  },
  {
    id: 'gb-25-diyadi-bisaida-2',
    title: 'Diya Di / Bisai Da Encore',
    description: 'Heartfelt reflections, encore hosting, and vote of appreciation with Diya Di and Bisai Da.',
    date: '2026-11-01',
    startTime: '17:50',
    endTime: '17:55',
    duration: '5 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Special',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 25,
  },
  {
    id: 'gb-26-media-partner-5',
    title: 'Media Partner (V)',
    description: 'Fifth media partner spotlight coverage, photo opportunities, and television broadcast wrap.',
    date: '2026-11-01',
    startTime: '17:55',
    endTime: '18:10',
    duration: '15 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Media',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 26,
  },
  {
    id: 'gb-27-media-partner-6',
    title: 'Media Partner (VI)',
    description: 'Sixth media partner broadcast summary, live interviews, and press felicitation.',
    date: '2026-11-01',
    startTime: '18:10',
    endTime: '18:25',
    duration: '15 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Media',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 27,
  },
  {
    id: 'gb-28-we-are-goynar-baksho-finale',
    title: 'We Are Goynar Baksho (Ending)',
    description: 'Grand united closing celebration, festival anthem, vote of thanks, and commemorative photo finale.',
    date: '2026-11-01',
    startTime: '18:25',
    endTime: '18:30',
    duration: '5 mins',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: 'Finale',
    image: '/images/hero-stage.jpg',
    status: 'scheduled',
    displayOrder: 28,
  },
];

export default function ScheduleTimeline({ isFullPage = false }) {
  const [events, setEvents] = useState(FALLBACK_EVENTS);
  const [categories, setCategories] = useState([
    'All',
    'Celebrity',
    'Dance',
    'Discussion',
    'Fashion',
    'Finale',
    'Honors',
    'Inauguration',
    'Literature',
    'Media',
    'Music',
    'Recitation',
    'Special',
    'Theatre',
  ]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all' | 'today' | 'upcoming'
  const [searchTerm, setSearchTerm] = useState('');
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

  const displayedEvents = events.filter((evt) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      (evt.title || '').toLowerCase().includes(term) ||
      (evt.description || '').toLowerCase().includes(term) ||
      (evt.category || '').toLowerCase().includes(term) ||
      (evt.venue || '').toLowerCase().includes(term)
    );
  });

  return (
    <section id="schedule" className="section-padding">
      <div className="container">
        <div className="section-header">
          <div className="type-kicker">LIVE PROGRAMME TIMETABLE</div>
          <h2 className="section-title">
            Festival <span className="gold-accent">Schedule & Events</span>
          </h2>
          <p className="section-subtitle">
            Complete timeline of all 28 performances, star appearances, honours, and celebrations on 1 November 2026.
          </p>
          <div className="ornament-divider" aria-hidden="true"></div>
        </div>

        {/* Filter & Search Navigation Bar */}
        <div className="schedule-filter-bar">
          {/* Search Box */}
          <div className="filter-group" style={{ flex: '1 1 240px', minWidth: '220px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Search 28 events, artists, sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(20, 15, 10, 0.85)',
                  border: '1px solid var(--color-gold-alpha-30)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '7px 12px 7px 34px',
                  color: 'var(--color-white)',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-gold-muted)',
                }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

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
        {!loading && !error && displayedEvents.length === 0 && (
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
              {searchTerm
                ? `No events matching "${searchTerm}" under selected filters.`
                : `There are currently no sessions scheduled under the selected filter criteria (${timeFilter !== 'all' ? timeFilter : ''} ${selectedCategory !== 'All' ? `• ${selectedCategory}` : ''}).`}
            </p>
            <button
              type="button"
              className="btn btn-gold-outline btn-sm"
              onClick={() => {
                setSelectedCategory('All');
                setTimeFilter('all');
                setSearchTerm('');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* TIMELINE / SCHEDULE LAYOUT */}
        {!loading && !error && displayedEvents.length > 0 && (
          <div className="timeline-track">
            {displayedEvents.map((evt, idx) => (
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

                      {evt.duration && (
                        <span
                          className="badge badge-gold"
                          style={{
                            fontSize: '10px',
                            background: 'rgba(201, 151, 43, 0.15)',
                            borderColor: 'var(--color-gold-alpha-30)',
                          }}
                        >
                          ⏱️ {evt.duration}
                        </span>
                      )}

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
