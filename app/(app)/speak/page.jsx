import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function SpeakPage() {
  return (
    <div className="page-stack">
      <header className="page-header">
        <span className="eyebrow">VOICE CONVERSATION · BETA</span>
        <h1>Voice Conversation is being upgraded.</h1>
        <p>
          This area will reopen when the production speech-to-text service is connected.
          The beta currently focuses on structured conversation training, Daily Speak,
          Power Phrases and human Live sessions.
        </p>
      </header>

      <section className="continue-card">
        <div className="continue-top">
          <div>
            <span className="tiny-label">AVAILABLE NOW</span>
            <h2>Keep training your conversational English.</h2>
            <p>Use the active parts of Speak Mode while voice transcription is in standby.</p>
          </div>
          <div className="progress-orb"><strong>β</strong><span>voice</span></div>
        </div>

        <div className="session-meta">
          <span>☀ Daily Speak</span>
          <span>▶ Structured Train</span>
          <span>✦ Power Phrases</span>
          <span>◉ Human Live</span>
        </div>

        <Link href="/daily" className="button button-primary">
          Open Daily Speak →
        </Link>
      </section>

      <section className="split-grid">
        <article className="panel-card">
          <span className="tiny-label">TRAIN</span>
          <h3>Continue your level path.</h3>
          <p>Complete the five structured sessions assigned to your current Speak Mode.</p>
          <Link href="/train" className="text-link">Open Train →</Link>
        </article>

        <article className="panel-card accent-panel">
          <span className="tiny-label">LIVE</span>
          <h3>Practice with a real person.</h3>
          <p>Eligible plans can request human conversation sessions with a coach.</p>
          <Link href="/live" className="text-link">Open Live →</Link>
        </article>
      </section>
    </div>
  );
}
