import Link from 'next/link';
import Brand from '@/components/Brand';
import SpeakBuddy from '@/components/SpeakBuddy';

export default function HomePage() {
  return (
    <main className="welcome-page">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      <section className="welcome-card">
        <div className="cartoon-hero">
          <div>
            <Brand size="large" />

            <span className="eyebrow">✨ PRIVATE BETA · CONVERSATIONAL ENGLISH</span>
            <h1>Turn English into a reflex.</h1>
          </div>

          <SpeakBuddy variant="phrases" />
        </div>

        <p>
          Speak Mode trains useful English through short daily practice, repetition,
          quick responses and conversation-focused sessions adapted to your level.
        </p>

        <div className="celebration-row">
          <span>🎯 Placement + personal MODE</span>
          <span>☀️ Daily Speak</span>
          <span>✨ Power Phrases</span>
          <span>🔥 Real streak</span>
        </div>

        <div className="welcome-actions">
          <Link className="button button-primary" href="/signup">Join the private beta →</Link>
          <Link className="button button-ghost" href="/login">I already have an account</Link>
        </div>

        <div className="beta-steps">
          <div>
            <strong>01</strong>
            <span>Take the placement test</span>
          </div>
          <div>
            <strong>02</strong>
            <span>Get your Speak Mode</span>
          </div>
          <div>
            <strong>03</strong>
            <span>Start your daily training</span>
          </div>
        </div>

        <small className="beta-note">
          Private beta · Speaking and Live remain locked until the production conversation plan is released.
        </small>
      </section>
    </main>
  );
}
