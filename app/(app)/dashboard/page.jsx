import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getModeSessions } from '@/lib/curriculum';

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

  const firstName =
    profile?.full_name?.trim()?.split(/\s+/)[0] ||
    claims.email?.split('@')[0] ||
    'Student';

  const progress = progressRows || [];
  const xp = progress.reduce((total, row) => total + (row.xp || 0), 0);
  const speakingSeconds = progress.reduce((total, row) => total + (row.speaking_seconds || 0), 0);
  const speakingMinutes = Math.floor(speakingSeconds / 60);
  const completedActivities = progress.filter((row) => row.completion_percent >= 100).length;

  const mode = titleCaseMode(profile?.placement_mode);
  const needsPlacement = profile?.placement_score == null || !profile?.placement_mode;

  const sessions = needsPlacement ? [] : getModeSessions(profile.placement_mode);
  const progressMap = new Map(progress.map((row) => [row.session_key, row]));

  const completedCoreSessions = sessions.filter(
    (session) => (progressMap.get(session.key)?.completion_percent || 0) >= 100
  ).length;

  const firstIncompleteIndex = sessions.findIndex(
    (session) => (progressMap.get(session.key)?.completion_percent || 0) < 100
  );

  const activeIndex = needsPlacement
    ? -1
    : firstIncompleteIndex === -1
      ? sessions.length - 1
      : firstIncompleteIndex;

  const activeSession = activeIndex >= 0 ? sessions[activeIndex] : null;
  const activeProgress = activeSession
    ? progressMap.get(activeSession.key)?.completion_percent || 0
    : 0;

  const blockPercent = sessions.length
    ? Math.round((completedCoreSessions / sessions.length) * 100)
    : 0;

  const blockComplete = sessions.length > 0 && completedCoreSessions === sessions.length;

  return (
    <div className="dashboard-stack">
      <section className="hero-training">
        <div>
          <span className="eyebrow">WELCOME, {firstName.toUpperCase()}</span>
          <h1>Ready for today’s English?</h1>
          <p>
            {needsPlacement
              ? 'Your account is active. Complete the placement test to unlock your personalized conversation path.'
              : blockComplete
                ? `You completed Block 01 in ${mode}. You can review any session while the next block is prepared.`
                : `You are in ${mode}. Session ${String(activeIndex + 1).padStart(2, '0')} is ready for you.`}
          </p>
        </div>

        <div className="streak-pill">
          <span>⚡</span>
          <strong>{completedCoreSessions}</strong>
          <small>core sessions</small>
        </div>
      </section>

      <section className="continue-card">
        <div className="continue-top">
          <div>
            <span className="tiny-label">
              {needsPlacement
                ? 'YOUR NEXT STEP'
                : blockComplete
                  ? 'BLOCK 01 COMPLETE'
                  : `CONTINUE · SESSION ${String(activeIndex + 1).padStart(2, '0')} OF ${String(sessions.length).padStart(2, '0')}`}
            </span>

            <h2>
              {needsPlacement
                ? 'Take your 15-minute placement test'
                : activeSession?.title}
            </h2>

            <p>
              {needsPlacement
                ? 'Listening · Reaction · Real English · Writing · 100 points'
                : activeSession?.subtitle}
            </p>
          </div>

          <div className="progress-orb">
            <strong>{needsPlacement ? '0%' : blockComplete ? '100%' : `${activeProgress}%`}</strong>
            <span>{needsPlacement ? 'ready' : blockComplete ? 'block' : 'session'}</span>
          </div>
        </div>

        <div className="progress-track">
          <span style={{ width: needsPlacement ? '0%' : `${blockPercent}%` }} />
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
              <span>🎧 Hear</span>
              <span>🗣 Copy</span>
              <span>✍️ Build</span>
              <span>⚡ Answer</span>
              <span>💬 Use</span>
              <span>🎙 Speak</span>
            </>
          )}
        </div>

        <Link
          href={
            needsPlacement
              ? '/placement-test'
              : blockComplete
                ? '/train'
                : `/train/${activeSession.key}`
          }
          className="button button-primary"
        >
          {needsPlacement
            ? 'Start placement test →'
            : blockComplete
              ? 'Review completed block →'
              : 'Continue training →'}
        </Link>
      </section>

      <section className="dashboard-grid">
        <article className="metric-card">
          <span className="metric-icon">⚡</span>
          <strong>{xp}</strong>
          <small>Speaking XP</small>
          <em>Earn XP through training and speaking practice</em>
        </article>

        <article className="metric-card">
          <span className="metric-icon">✓</span>
          <strong>{completedActivities}</strong>
          <small>Activities Completed</small>
          <em>{completedCoreSessions}/{sessions.length || 0} core sessions in this block</em>
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
              : `Placement score: ${profile.placement_score}/100 · Block 01: ${blockPercent}% complete.`}
          </p>
          <Link href={needsPlacement ? '/placement-test' : '/placement-result'} className="text-link">
            {needsPlacement ? 'Take placement test →' : 'View placement result →'}
          </Link>
        </article>

        <article className="panel-card accent-panel">
          <span className="tiny-label">SPEAK LAB</span>
          <h3>Practice spontaneous conversation between sessions.</h3>
          <p>Your guided conversation room adapts to your current Speak Mode.</p>
          <Link href="/speak" className="text-link">Open Speak Lab →</Link>
        </article>
      </section>
    </div>
  );
}
