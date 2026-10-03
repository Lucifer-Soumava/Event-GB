'use client';

import { useState } from 'react';

const PRESET_IMAGES = [
  { label: 'Auditorium Stage', url: '/images/hero-stage.jpg' },
  { label: 'Classical Sitar / Music', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Bengali Dance / Mudra', url: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Poetry & Recitation', url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Dramatic Proscenium', url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80' },
];

export default function EventForm({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  submitButtonText = 'Save Event',
  categories = ['Inauguration', 'Music', 'Recitation', 'Dance', 'Theatre', 'Honors'],
}) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    category: initialData.category || 'Music',
    date: initialData.date || '2026-11-01',
    startTime: initialData.startTime || '17:00',
    endTime: initialData.endTime || '18:00',
    venue: initialData.venue || "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    description: initialData.description || '',
    status: initialData.status || 'scheduled',
    displayOrder: initialData.displayOrder !== undefined ? initialData.displayOrder : 1,
    image: initialData.image || '/images/hero-stage.jpg',
  });

  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(
    initialData.category && !categories.includes(initialData.category)
  );

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Event title is required.';
    } else if (formData.title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters.';
    }

    if (!formData.date) {
      errs.date = 'Event date is required.';
    }

    if (!formData.startTime) {
      errs.startTime = 'Start time is required.';
    }

    if (!formData.endTime) {
      errs.endTime = 'End time is required.';
    } else if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      errs.endTime = 'End time should be after start time.';
    }

    if (!formData.venue.trim()) {
      errs.venue = 'Auditorium venue is required.';
    }

    if (!formData.description.trim()) {
      errs.description = 'Event description is required.';
    }

    const effectiveCategory = isCustomCategory ? customCategory.trim() : formData.category;
    if (!effectiveCategory) {
      errs.category = 'Category is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const finalPayload = {
      ...formData,
      category: isCustomCategory ? customCategory.trim() : formData.category,
      displayOrder: Number(formData.displayOrder) || 1,
    };

    onSubmit(finalPayload);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="event-form-grid">
        {/* Left Column: Core Performance Information */}
        <div>
          <div className="event-form-section">
            <h3 className="event-form-section-title">
              <span>🎭</span> Performance Session Overview
            </h3>

            {/* Title */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="title" className="form-label" style={{ color: 'var(--color-gold-light)' }}>
                Session Title *
              </label>
              <input
                id="title"
                type="text"
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: null });
                }}
                placeholder="e.g. Sitar Jugalbandi: Raag Yaman & Folk Ensembles"
                required
              />
              {errors.title && (
                <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.title}
                </div>
              )}
            </div>

            {/* Category */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ color: 'var(--color-gold-light)' }}>
                Cultural Artform Category *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <select
                  className="form-control"
                  value={isCustomCategory ? '__custom__' : formData.category}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomCategory(true);
                    } else {
                      setIsCustomCategory(false);
                      setFormData({ ...formData, category: e.target.value });
                    }
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__custom__">+ Custom Artform Category...</option>
                </select>

                {isCustomCategory && (
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter custom category..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    required
                  />
                )}
              </div>
              {errors.category && (
                <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.category}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description" className="form-label" style={{ color: 'var(--color-gold-light)' }}>
                Programme Description &amp; Artists Details *
              </label>
              <textarea
                id="description"
                rows={4}
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) setErrors({ ...errors, description: null });
                }}
                placeholder="Detailed overview of the artists, classical ragas, choreography narrative, or theatre plot..."
                required
              />
              {errors.description && (
                <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.description}
                </div>
              )}
            </div>
          </div>

          {/* Date, Time & Auditorium Venue */}
          <div className="event-form-section">
            <h3 className="event-form-section-title">
              <span>⏱️</span> Date, Timings &amp; Auditorium Stage
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <label htmlFor="date" className="form-label" style={{ color: 'var(--color-gold-light)' }}>
                  Event Date *
                </label>
                <input
                  id="date"
                  type="date"
                  className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                    if (errors.date) setErrors({ ...errors, date: null });
                  }}
                  required
                />
                {errors.date && (
                  <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.date}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="startTime" className="form-label" style={{ color: 'var(--color-gold-light)' }}>
                  Start Time *
                </label>
                <input
                  id="startTime"
                  type="time"
                  className={`form-control ${errors.startTime ? 'is-invalid' : ''}`}
                  value={formData.startTime}
                  onChange={(e) => {
                    setFormData({ ...formData, startTime: e.target.value });
                    if (errors.startTime) setErrors({ ...errors, startTime: null });
                  }}
                  required
                />
                {errors.startTime && (
                  <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.startTime}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="endTime" className="form-label" style={{ color: 'var(--color-gold-light)' }}>
                  End Time *
                </label>
                <input
                  id="endTime"
                  type="time"
                  className={`form-control ${errors.endTime ? 'is-invalid' : ''}`}
                  value={formData.endTime}
                  onChange={(e) => {
                    setFormData({ ...formData, endTime: e.target.value });
                    if (errors.endTime) setErrors({ ...errors, endTime: null });
                  }}
                  required
                />
                {errors.endTime && (
                  <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.endTime}
                  </div>
                )}
              </div>
            </div>

            {/* Venue */}
            <div className="form-group">
              <label htmlFor="venue" className="form-label" style={{ color: 'var(--color-gold-light)' }}>
                Auditorium / Stage Venue *
              </label>
              <input
                id="venue"
                type="text"
                className={`form-control ${errors.venue ? 'is-invalid' : ''}`}
                value={formData.venue}
                onChange={(e) => {
                  setFormData({ ...formData, venue: e.target.value });
                  if (errors.venue) setErrors({ ...errors, venue: null });
                }}
                placeholder="Boys' Own Library Auditorium, Hatibagan, Kolkata 700006"
                required
              />
              {errors.venue && (
                <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.venue}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Status, Ordering, & Event Image */}
        <div>
          {/* Status & Visibility */}
          <div className="event-form-section">
            <h3 className="event-form-section-title">
              <span>📢</span> Publication Status
            </h3>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="status" className="form-label" style={{ color: 'var(--color-gold-light)' }}>
                Current Status
              </label>
              <select
                id="status"
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="scheduled">Scheduled (Published on site)</option>
                <option value="published">Published</option>
                <option value="live">Live (Ongoing right now)</option>
                <option value="completed">Completed</option>
                <option value="unpublished">Unpublished (Hidden from Public)</option>
              </select>
              <span style={{ fontSize: '0.72rem', color: 'rgba(253,251,247,0.5)', display: 'block', marginTop: '0.35rem' }}>
                &apos;Unpublished&apos; removes the event from the public website timeline immediately.
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="displayOrder" className="form-label" style={{ color: 'var(--color-gold-light)' }}>
                Display Priority / Order #
              </label>
              <input
                id="displayOrder"
                type="number"
                min="1"
                className="form-control"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
              />
              <span style={{ fontSize: '0.72rem', color: 'rgba(253,251,247,0.5)', display: 'block', marginTop: '0.35rem' }}>
                Items are rendered on the public timetable in ascending order (1, 2, 3...).
              </span>
            </div>
          </div>

          {/* Event Image */}
          <div className="event-form-section">
            <h3 className="event-form-section-title">
              <span>🖼️</span> Event Imagery
            </h3>

            <div className="image-preview-box">
              {formData.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formData.image}
                  alt="Event Banner Preview"
                  onError={(e) => {
                    e.target.src = '/images/hero-stage.jpg';
                  }}
                />
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'rgba(253,251,247,0.4)' }}>
                  No image selected
                </span>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label htmlFor="image" className="form-label" style={{ color: 'var(--color-gold-light)' }}>
                Image URL or Path
              </label>
              <input
                id="image"
                type="text"
                className="form-control"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="/images/hero-stage.jpg or https://..."
              />
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-gold-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                Curated Festival Presets:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    className={`image-preset-pill ${formData.image === preset.url ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, image: preset.url })}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Submit Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <button
              type="submit"
              className="btn btn-gold-primary"
              style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="spinner" style={{ width: '16px', height: '16px' }} />
                  Saving Changes...
                </span>
              ) : (
                submitButtonText
              )}
            </button>
            <a
              href="/admin/events"
              className="btn btn-gold-outline"
              style={{ width: '100%', padding: '0.65rem', textAlign: 'center', textDecoration: 'none' }}
            >
              Cancel &amp; Discard
            </a>
          </div>
        </div>
      </div>
    </form>
  );
}
