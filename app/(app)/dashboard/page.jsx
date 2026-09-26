import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

function titleCaseMode(mode) {
  return mode ? mode.replaceAll('_', ' ') : 'PLACEMENT PENDING';
}

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const [{ data: profile }, { data: progressRows }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, placement_score, placement_mode, daily_goal_minutes')
      .eq('id', claims.sub)
      .maybeSingle(),
    supabase
      .from('training_progress')
      .select('session_key, completion_percent, speaking_seconds, xp')
      .eq('user_id', claims.sub),
  ]);

  const firstName = profile?.full_name?.trim()?.split(/\s+/)[0] || claims.email?.split('@')[0] || 'Student';
  const progress = progressRows || [];
  const xp = progress.reduce((total, row) => total + (row.xp || 0), 0);
  const speakingSeconds = progress.reduce((total, row) => total + (row.speaking_seconds || 0), 0);
  const speakingMinutes = Math.floor(speakingSeconds / 60);
  const completedSessions = progress.filter((row) => row.completion_percent >= 100).length;
  const firstSession = progress.find((row) => row.session_key === 'start-01');
  const sessionProgress = firstSession?.completion_percent || 0;
  const mode = titleCaseMode(profile?.placement_mode);

  return (
    <div className="dashboard-stack">
      <section className="hero-training">
        <div>
          <span className="eyebrow">WELCOME, {firstName.toUpperCase()}</span>
          <h1>Ready for today’s English?</h1>
          <p>
            {profile?.placement_score == null
              ? 'Your account is active. Your placement result will determine the training path that appears here.'
              : `You are in ${mode}. Your training will adapt to the level assigned by your placement result.`}
          </p>
        </div>

        <div className="streak-pill">
          <span>⚡</span>
          <strong>{completedSessions}</strong>
          <small>sessions done</small>
        </div>
      </section>

      <section className="continue-card">
        <div className="continue-top">
          <div>
            <span className="tiny-label">{profile?.placement_score == null ? 'NEXT STEP' : 'CONTINUE TRAINING'}</span>
            <h2>{profile?.placement_score == null ? 'Connect your placement result' : 'Session 01 · Introduce Yourself'}</h2>
            <p>
              {profile?.placement_score == null
                ? 'Once your test score is saved, Speak Mode will unlock the correct learning path.'
                : 'Listen → Repeat → Build → Answer → Speak'}
            </p>
          </div>

          <div className="progress-orb">
            <strong>{sessionProgress}%</strong>
            <span>done</span>
          </div>
        </div>

        <div className="progress-track"><span style={{ width: `${sessionProgress}%` }} /></div>

        <div className="session-meta">
          <span>🎧 Listening</span>
          <span>🎙 Speaking</span>
          <span>⚡ Quick answers</span>
        </div>

        <Link href="/train" className="button button-primary">
          {profile?.placement_score == null ? 'Preview training →' : 'Start session →'}
        </Link>
      </section>

      <section className="dashboard-grid">
        <article className="metric-card">
          <span className="metric-icon">⚡</span>
          <strong>{xp}</strong>
          <small>Speaking XP</small>
          <em>Earn XP as you complete training</em>
        </article>

        <article className="metric-card">
          <span className="metric-icon">✓</span>
          <strong>{completedSessions}</strong>
          <small>Sessions Completed</small>
          <em>Your completed training sessions</em>
        </article>

        <article className="metric-card">
          <span className="metric-icon">🎙</span>
          <strong>{speakingMinutes}m</strong>
          <small>Speaking Time</small>
          <em>Daily goal: {profile?.daily_goal_minutes || 20} min</em>
        </article>
      </section>

      <section className="split-grid">
        <article className="panel-card">
          <span className="tiny-label">CURRENT MODE</span>
          <h3>{mode}</h3>
          <p>
            {profile?.placement_score == null
              ? 'Your placement score is waiting to be connected to this account.'
              : `Placement score: ${profile.placement_score}/100.`}
          </p>
          <Link href="/profile" className="text-link">View profile →</Link>
        </article>

        <article className="panel-card accent-panel">
          <span className="tiny-label">LIVE COACH</span>
          <h3>Your human conversation layer.</h3>
          <p>Coach sessions will unlock according to your training plan and progress.</p>
          <Link href="/live" className="text-link">View Live area →</Link>
        </article>
      </section>
    </div>
  );
}
