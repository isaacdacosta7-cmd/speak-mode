import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const sessionNames = {
  START_MODE: 'Introduce Yourself',
  RESPONSE_MODE: 'Answer Without Freezing',
  CONVERSATION_MODE: 'Keep It Going',
  FLUENCY_MODE: 'Sound More Natural',
  NATIVE_FLOW: 'Precision & Personality',
};

function titleCaseMode(mode) {
  return mode ? mode.replaceAll('_', ' ') : 'PLACEMENT PENDING';
}

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect('/login');
  }

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
  const firstSession = progress.find((row) => row.session_key === 'session-01');
  const sessionProgress = firstSession?.completion_percent || 0;
  const mode = titleCaseMode(profile?.placement_mode);
  const needsPlacement = profile?.placement_score == null;
  const sessionTitle = sessionNames[profile?.placement_mode] || 'Your First Conversation Session';

  return (
    <div className="dashboard-stack">
      <section className="hero-training">
        <div>
          <span className="eyebrow">WELCOME, {firstName.toUpperCase()}</span>
          <h1>Ready for today’s English?</h1>
          <p>
            {needsPlacement
              ? 'Your account is active. Complete the placement test to unlock your personalized conversation path.'
              : `You are in ${mode}. Your first active training session is ready.`}
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
            <span className="tiny-label">{needsPlacement ? 'YOUR NEXT STEP' : 'CONTINUE TRAINING'}</span>
            <h2>{needsPlacement ? 'Take your 15-minute placement test' : `Session 01 · ${sessionTitle}`}</h2>
            <p>
              {needsPlacement
                ? 'Listening · Reaction · Real English · Writing · 100 points'
                : 'Hear → Copy → Build → Answer → Use → Speak'}
            </p>
          </div>

          <div className="progress-orb">
            <strong>{needsPlacement ? '0%' : `${sessionProgress}%`}</strong>
            <span>{needsPlacement ? 'ready' : 'done'}</span>
          </div>
        </div>

        <div className="progress-track">
          <span style={{ width: needsPlacement ? '0%' : `${sessionProgress}%` }} />
        </div>

        <div className="session-meta">
          {needsPlacement ? (
            <>
              <span>🎧 Listening</span>
              <span>⚡ Reaction</span>
              <span>💬 Real English</span>
              <span>✍️ Writing</span>
            </>
          ) : (
            <>
              <span>🎧 Natural audio</span>
              <span>🗣 Repetition</span>
              <span>⚡ Quick answers</span>
              <span>🎙 Speaking</span>
            </>
          )}
        </div>

        <Link
          href={needsPlacement ? '/placement-test' : '/train/session-01'}
          className="button button-primary"
        >
          {needsPlacement ? 'Start placement test →' : sessionProgress >= 100 ? 'Practice again →' : 'Start session →'}
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
            {needsPlacement
              ? 'Your placement result will appear here immediately after the test.'
              : `Placement score: ${profile.placement_score}/100.`}
          </p>
          <Link href={needsPlacement ? '/placement-test' : '/profile'} className="text-link">
            {needsPlacement ? 'Take placement test →' : 'View profile →'}
          </Link>
        </article>

        <article className="panel-card accent-panel">
          <span className="tiny-label">POWER PHRASES</span>
          <h3>Train the phrases you want to become automatic.</h3>
          <p>Listen, repeat and revisit useful conversation blocks between sessions.</p>
          <Link href="/phrases" className="text-link">Open Power Phrases →</Link>
        </article>
      </section>
    </div>
  );
}
