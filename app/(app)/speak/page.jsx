import Link from 'next/link';
import SpeakBuddy from '@/components/SpeakBuddy';

export const dynamic = 'force-dynamic';

export default function SpeakPage() {
  return (
    <div className="page-stack">
      <header className="page-header cartoon-hero">
        <div>
          <span className="eyebrow">🔒 SPEAKING · VOICE CONVERSATION</span>
          <h1>Muy pronto se libera.</h1>
          <p>
            This is where Speak Mode will turn into a real voice conversation experience.
            We are connecting the production speech system before opening it to beta testers.
          </p>
          <span className="locked-badge">🔒 COMING SOON</span>
        </div>
        <SpeakBuddy variant="locked" />
      </header>

      <section className="continue-card">
        <div className="continue-top">
          <div>
            <span className="tiny-label">NEXT SPEAK MODE RELEASE</span>
            <h2>Talk, get transcribed and receive correction.</h2>
            <p>
              The final flow will listen to your English, convert it to text, correct your answer and keep the conversation moving.
            </p>
          </div>
          <div className="progress-orb"><strong>🎙</strong><span>voice</span></div>
        </div>

        <div className="session-meta">
          <span>🎙 Voice</span>
          <span>📝 Transcript</span>
          <span>✅ Correction</span>
          <span>💬 Conversation</span>
        </div>

        <Link href="/train" className="button button-primary">
          Train with corrections now →
        </Link>
      </section>

      <section className="split-grid">
        <article className="panel-card">
          <span className="tiny-label">🎯 TRAIN</span>
          <h3>Practice with correction now.</h3>
          <p>Build and Answer activities now tell you what is correct, what needs fixing and how to improve it.</p>
          <Link href="/train" className="text-link">Open corrected training →</Link>
        </article>

        <article className="panel-card accent-panel">
          <span className="tiny-label">✨ POWER PHRASES</span>
          <h3>Build the language you will use in Speaking.</h3>
          <p>Your expanded phrase library prepares the expressions that will later become automatic in voice conversation.</p>
          <Link href="/phrases" className="text-link">Open phrases →</Link>
        </article>
      </section>
    </div>
  );
}
