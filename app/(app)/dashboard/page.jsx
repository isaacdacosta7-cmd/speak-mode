import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="dashboard-stack">
      <section className="hero-training">
        <div>
          <span className="eyebrow">GOOD AFTERNOON, ISAAC</span>
          <h1>Ready for today’s English?</h1>
          <p>Your next session is built to make five core phrases feel automatic.</p>
        </div>
        <div className="streak-pill"><span>🔥</span><strong>6</strong><small>day streak</small></div>
      </section>

      <section className="continue-card">
        <div className="continue-top">
          <div>
            <span className="tiny-label">CONTINUE TRAINING</span>
            <h2>Session 01 · Introduce Yourself</h2>
            <p>Listen → Repeat → Build → Answer → Speak</p>
          </div>
          <div className="progress-orb"><strong>18%</strong><span>done</span></div>
        </div>
        <div className="progress-track"><span style={{ width: '18%' }} /></div>
        <div className="session-meta">
          <span>🎧 5 min listening</span><span>🎙 6 min speaking</span><span>⚡ 12 quick answers</span>
        </div>
        <Link href="/train" className="button button-primary">Start session →</Link>
      </section>

      <section className="dashboard-grid">
        <article className="metric-card"><span className="metric-icon">⚡</span><strong>240</strong><small>Speaking XP</small><em>+40 this week</em></article>
        <article className="metric-card"><span className="metric-icon">✦</span><strong>14</strong><small>Power Phrases</small><em>5 ready to review</em></article>
        <article className="metric-card"><span className="metric-icon">🎙</span><strong>28m</strong><small>Speaking Time</small><em>Goal: 60m this week</em></article>
      </section>

      <section className="split-grid">
        <article className="panel-card">
          <span className="tiny-label">TODAY'S MISSION</span>
          <h3>Talk about yourself for 60 seconds.</h3>
          <p>Use at least three phrases from your current training set.</p>
          <Link href="/speak" className="text-link">Open Speak Lab →</Link>
        </article>
        <article className="panel-card accent-panel">
          <span className="tiny-label">NEXT LIVE UNLOCK</span>
          <h3>Complete 4 more sessions.</h3>
          <p>Your first coach conversation unlocks after Foundation Block 1.</p>
          <div className="mini-progress"><span style={{ width: '42%' }} /></div>
        </article>
      </section>
    </div>
  );
}
