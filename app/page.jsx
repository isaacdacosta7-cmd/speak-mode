import Link from 'next/link';
import Brand from '@/components/Brand';

export default function HomePage() {
  return (
    <main className="welcome-page">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <section className="welcome-card">
        <Brand size="large" />
        <span className="eyebrow">CONVERSATIONAL ENGLISH TRAINING</span>
        <h1>Turn English into a reflex.</h1>
        <p>
          Practice. Repeat. Respond. Speak. Your training adapts to your level and keeps the conversation moving.
        </p>
        <div className="welcome-actions">
          <Link className="button button-primary" href="/login">Enter Speak Mode</Link>
          <Link className="button button-ghost" href="/dashboard">Preview dashboard</Link>
        </div>
      </section>
    </main>
  );
}
