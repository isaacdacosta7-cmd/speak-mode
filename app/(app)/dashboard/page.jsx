import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getModeSessions } from '@/lib/curriculum';

function titleCaseMode(mode) {
  return mode ? mode.replaceAll('_', ' ') : 'PLACEMENT PENDING';
}

function localDateString(timeZone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZone || 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(new Date());
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function shiftDate(dateString, delta) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

function computeStreak(rows, today) {
  const completed = new Set(
    rows.filter((row) => row.completed).map((row) => row.activity_date)
  );

  let cursor = completed.has(today) ? today : shiftDate(today, -1);
  let streak = 0;

  while (completed.has(cursor)) {
    streak += 1;
    cursor = shiftDate(cursor, -1);
  }

  return streak;
}

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect('/login');
  }

  const [{ data: profile }, { data: progressRows }, { data: dailyRows }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, placement_score, placement_mode, daily_goal_minutes, timezone')
      .eq('id', claims.sub)
      .maybeSingle(),
    supabase
      .from('training_progress')
      .select('session_key, completion_percent, speaking_seconds, xp')
      .eq('user_id', claims.sub),
    supabase
      .from('daily_activity')
      .select('activity_date, completed')
      .eq('user_id', claims.sub)
      .order('activity_date', { ascending: false })
      .limit(60),
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
  const today = localDateString(profile?.timezone || 'UTC');
  const streak = computeStreak(dailyRows || [], today);
  const todayComplete = Boolean((dailyRows || []).find((row) => row.activity_date === today)?.completed);

  return (
    <div className="dashboard-stack">
      <section className="hero-training">
        <div>
          <span className="eyebrow">WELCOME, {firstName.toUpperCase()}</span>
          <h1>Ready for today’s English?</h1>
          <p>
            {needsPlacement
              ? 'Your account is active. Complete the placement test to unlock your personalized conversation path.'
              : todayComplete
                ? `Daily Speak is complete. Your ${mode} training path is still available for extra practice.`
                : `Your Daily Speak routine is waiting. You are currently training in ${mode}.`}
          </p>
        </div>

        <div className="streak-pill">
          <span>🔥</span>
          <strong>{streak}</strong>
          <small>day streak</small>
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
          <span className="metric-icon">🔥</span>
          <strong>{streak}</strong>
          <small>Daily Speak Streak</small>
          <em>{todayComplete ? 'Today is complete' : 'Finish Daily Speak to extend it'}</em>
        </article>

        <article className="metric-card">
          <span className="metric-icon">⚡</span>
          <strong>{xp}</strong>
          <small>Speaking XP</small>
          <em>{completedActivities} completed activities</em>
        </article>

        <article className="metric-card">
          <span className="metric-icon">🎙</span>
          <strong>{speakingMinutes}m</strong>
          <small>Speaking Time</small>
          <em>Daily goal: {profile?.daily_goal_minutes || 20} min</em>
        </article>
      </section>

      <section className="split-grid">
        <article className="panel-card accent-panel">
          <span className="tiny-label">DAILY SPEAK</span>
          <h3>{todayComplete ? 'Today’s mission is complete.' : 'Your three-part daily routine is ready.'}</h3>
          <p>Train once, practice three Power Phrases and complete one quick English challenge.</p>
          <Link href="/daily" className="text-link">Open Daily Speak →</Link>
        </article>

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
      </section>

      <section className="panel-card">
        <span className="tiny-label">VOICE CONVERSATION</span>
        <h3>Voice Conversation is temporarily held for the beta infrastructure upgrade.</h3>
        <p>Structured training, Daily Speak, Power Phrases and Live human sessions remain active while the production speech service is integrated.</p>
      </section>
    </div>
  );
}
