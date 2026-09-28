import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getModeSessions } from '@/lib/curriculum';
import BetaOnboarding from '@/components/BetaOnboarding';
import SpeakBuddy from '@/components/SpeakBuddy';

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
      .select('full_name, placement_score, placement_mode, daily_goal_minutes, timezone, onboarding_completed')
      .eq('id', claims.sub)
      .maybeSingle(),
    supabase
      .from('training_progress')
      .select('session_key, completion_percent, xp')
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
    <>
      {!profile?.onboarding_completed ? (
        <BetaOnboarding firstName={firstName} />
      ) : null}

      <div className="dashboard-stack">
        <section className="hero-training cartoon-hero">
          <div>
            <span className="eyebrow">✨ WELCOME, {firstName.toUpperCase()}</span>
            <h1>Ready for today’s English?</h1>
            <p>
              {needsPlacement
                ? 'Complete the placement test to unlock your personalized conversation path.'
                : todayComplete
                  ? `Daily Speak is complete. Your ${mode} training path is still available for extra practice.`
                  : `Your Daily Speak routine is waiting. You are currently training in ${mode}.`}
            </p>
            <div className="celebration-row">
              <span>🔥 {streak} day streak</span>
              <span>⚡ {xp} Training XP</span>
              <span>✅ {completedActivities} activities</span>
            </div>
          </div>

          <SpeakBuddy variant={todayComplete ? 'celebrate' : 'study'} />
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
                <span>🧩 Build + correction</span>
                <span>⚡ Answer + correction</span>
                <span>💬 Use</span>
                <span>🔒 Speaking soon</span>
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
                : 'Continue corrected training →'}
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
            <small>Training XP</small>
            <em>Earn XP by completing corrected lessons</em>
          </article>

          <article className="metric-card">
            <span className="metric-icon">✅</span>
            <strong>{completedActivities}</strong>
            <small>Activities Completed</small>
            <em>{completedCoreSessions}/{sessions.length || 0} core sessions in this block</em>
          </article>
        </section>

        <section className="split-grid">
          <article className="panel-card accent-panel">
            <span className="tiny-label">☀️ DAILY SPEAK</span>
            <h3>{todayComplete ? 'Today’s mission is complete.' : 'Your three-part daily routine is ready.'}</h3>
            <p>Train once, practice three Power Phrases and complete one quick English challenge.</p>
            <Link href="/daily" className="text-link">Open Daily Speak →</Link>
          </article>

          <article className="panel-card">
            <span className="tiny-label">🎯 CURRENT MODE</span>
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

        <section className="cartoon-card">
          <SpeakBuddy variant="locked" compact />
          <div>
            <span className="locked-badge">🔒 SPEAKING · MUY PRONTO</span>
            <h3>Voice conversation is the next major unlock.</h3>
            <p>
              Speaking and Live are intentionally locked while the production conversation plan is integrated.
              Training now focuses on strong correction, useful phrases and daily repetition.
            </p>
            <Link href="/speak" className="text-link">See what is coming →</Link>
          </div>
        </section>
      </div>
    </>
  );
}
