import ScheduleTimeline from '@/components/schedule/ScheduleTimeline';
import EventNav from '@/components/event/EventNav';
import EventFooter from '@/components/event/EventFooter';

export const metadata = {
  title: 'Festival Schedule & Programme — Goynar Baksho Annual Celebration 2026',
  description: 'Official live programme timetable and performance schedule for Goynar Baksho Annual Celebration 2026 at Boys\' Own Library Auditorium, Hatibagan, Kolkata.',
};

export default function SchedulePage() {
  return (
    <>
      <EventNav activeSection="schedule" />

      {/* Schedule Page Hero Banner */}
      <section className="hero-section" style={{ paddingBottom: 'var(--space-xl)' }}>
        <div className="hero-backdrop-glow"></div>
        <div className="container hero-content">
          <div className="alpona-motif" aria-hidden="true"></div>
          <div className="type-kicker">
            <span>OFFICIAL PROGRAMME TIMETABLE</span>
            <span>•</span>
            <span>1 NOVEMBER 2026</span>
          </div>
          <h1 className="type-hero" style={{ marginTop: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
            Celebration <span className="gold-accent">Schedule</span>
          </h1>
          <p className="bengali-callout" style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-gold-highlight)', marginBottom: 'var(--space-md)' }}>
            &ldquo;নতুন শিল্পী, নতুন কণ্ঠ, নতুন সুর&rdquo;
          </p>
          <p className="type-subtitle" style={{ maxWidth: '640px', margin: '0 auto' }}>
            Boys&apos; Own Library Auditorium, Hatibagan, Kolkata 700006 • 5:00 PM – 9:00 PM IST
          </p>
          <div className="ornament-divider" aria-hidden="true"></div>
        </div>
      </section>

      {/* Dynamic Schedule Component fetching from API */}
      <main>
        <ScheduleTimeline isFullPage={true} />
      </main>

      <EventFooter />
    </>
  );
}
