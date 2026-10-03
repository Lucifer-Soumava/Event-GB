export default function FormsSection({ formRef, onSubmit, isSubmitting }) {
  return (
    <section id="forms" className="section-padding section-secondary">
      <div className="container container-narrow">
        <div className="section-header">
          <div className="type-kicker">USER REGISTRATION &amp; RSVP</div>
          <h2 className="section-title">Form <span className="gold-accent">Controls</span></h2>
          <p className="section-subtitle">
            Thoughtfully crafted inputs, custom selects, and state indicators designed specifically for our dark and antique-gold aesthetic.
          </p>
          <div className="ornament-divider" aria-hidden="true"></div>
        </div>

        <div className="card-cultural frame-four-corners">
          <div className="corner-flourish corner-flourish-tl"></div>
          <div className="corner-flourish corner-flourish-tr"></div>
          <div className="corner-flourish corner-flourish-bl"></div>
          <div className="corner-flourish corner-flourish-br"></div>

          <form id="demo-rsvp-form" ref={formRef} onSubmit={onSubmit}>
            <div className="grid-cols-2">
              <div className="form-group">
                <label htmlFor="guest-name" className="form-label">
                  Guest Full Name <span className="required-mark">*</span>
                </label>
                <input
                  type="text"
                  id="guest-name"
                  className="input-cultural"
                  placeholder="e.g. Debolina Roy"
                  required
                />
                <span className="form-helper">As printed on your invitation card.</span>
              </div>

              <div className="form-group">
                <label htmlFor="guest-email" className="form-label">
                  Email Address <span className="required-mark">*</span>
                </label>
                <input
                  type="email"
                  id="guest-email"
                  className="input-cultural"
                  placeholder="debolina@example.com"
                  required
                />
                <span className="form-helper">Electronic passes will be dispatched here.</span>
              </div>
            </div>

            <div className="grid-cols-2">
              <div className="form-group">
                <label htmlFor="guest-pass-type" className="form-label">
                  Invitation Pass Category <span className="required-mark">*</span>
                </label>
                <select id="guest-pass-type" className="input-cultural" defaultValue="" required>
                  <option value="" disabled>Select an invitation tier</option>
                  <option value="vip">VIP Patron Pass (Reserved Royal Row)</option>
                  <option value="banquet">Gala Banquet Pass</option>
                  <option value="general">General Admission</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="guest-attendees" className="form-label">
                  Number of Attendees
                </label>
                <input
                  type="number"
                  id="guest-attendees"
                  className="input-cultural"
                  min="1"
                  max="5"
                  defaultValue="1"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="special-requests" className="form-label">
                Special Dietary or Accessibility Notes
              </label>
              <textarea
                id="special-requests"
                className="input-cultural"
                rows="3"
                placeholder="Traditional Bengali vegetarian preference, wheelchair assistance, etc."
              ></textarea>
            </div>

            {/* Custom Checkboxes & Radio Demonstration */}
            <div style={{ marginBottom: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <label className="checkbox-group">
                <input type="checkbox" id="souvenir-opt" defaultChecked />
                <span className="checkbox-label">Include the 2026 Commemorative Printed Souvenir Book</span>
              </label>

              <label className="checkbox-group">
                <input type="checkbox" id="terms-opt" required />
                <span className="checkbox-label">I acknowledge the cultural dress code (Traditional Bengali Festive Attire preferred)</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)', alignItems: 'center' }}>
              <button type="reset" className="btn btn-gold-ghost btn-sm">Reset</button>
              <button type="submit" className="btn btn-gold-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>Submit RSVP Invitation</span>
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
