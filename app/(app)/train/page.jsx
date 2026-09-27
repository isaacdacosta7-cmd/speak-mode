import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MODE_META, getModeSessions } from '@/lib/curriculum';
import styles from './TrainPath.module.css';

const loopSteps = [
  ['01', 'Hear It', 'Listen to the complete thought in natural English.'],
  ['02', 'Copy It', 'Repeat the rhythm until the phrase feels comfortable.'],
  ['03', 'Build It', 'Change the structure with your own information.'],
  ['04', 'Answer It', 'Respond quickly with your own words.'],
  ['05', 'Use It', 'Choose a natural move inside a real situation.'],
  ['06', 'Speak It', 'Finish by producing the English out loud.'],
];

export const dynamic = 'force-dynamic';

export default async function TrainPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect('/login?next=/train');
  }

  const [{ data: profile }, { data: progressRows }] = await Promise.all([
    supabase
      .from('profiles')
      .select('placement_score, placement_mode')
      .eq('id', claims.sub)
      .maybeSingle(),
    supabase
      .from('training_progress')
      .select('session_key, completion_percent, xp')
      .eq('user_id', claims.sub),
  ]);

  if (!profile?.placement_mode) {
    return (
      <div className="page-stack">
        <header className="page-header">
          <span className="eyebrow">TRAIN</span>
          <h1>Your training path starts with placement.</h1>
          <p>Complete the 15-minute test and Speak Mode will open the right conversation track for you.</p>
        </header>

        <section className="continue-card">
          <div className="continue-top">
            <div>
              <span className="tiny-label">STEP 01</span>
              <h2>Take your placement test</h2>
              <p>Listening · Reaction · Real English · Writing · 100 points</p>
            </div>
            <div className="progress-orb"><strong>0%</strong><span>ready</span></div>
          </div>
          <div className="progress-track"><span style={{ width: '0%' }} /></div>
          <Link href="/placement-test" className="button button-primary">Start placement test →</Link>
        </section>

        <div className="loop-grid">
          {loopSteps.map(([number, title, text]) => (
            <article className="loop-card" key={title}>
              <span>{number}</span><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    );
  }

  const mode = profile.placement_mode;
  const meta = MODE_META[mode] || MODE_META.START_MODE;
  const sessions = getModeSessions(mode);
  const progressMap = new Map(
    (progressRows || []).map((row) => [row.session_key, row])
  );

  const completedCount = sessions.filter(
    (session) => (progressMap.get(session.key)?.completion_percent || 0) >= 100
  ).length;

  const firstIncompleteIndex = sessions.findIndex(
    (session) => (progressMap.get(session.key)?.completion_percent || 0) < 100
  );

  const activeIndex = firstIncompleteIndex === -1
    ? sessions.length - 1
    : firstIncompleteIndex;

  const activeSession = sessions[activeIndex];
  const activeProgress = progressMap.get(activeSession.key)?.completion_percent || 0;
  const blockPercent = Math.round((completedCount / sessions.length) * 100);
  const totalXp = sessions.reduce(
    (sum, session) => sum + (progressMap.get(session.key)?.xp || 0),
    0
  );

  return (
    <div className="page-stack">
      <header className="page-header">
        <span className="eyebrow">{meta.label}</span>
        <h1>{meta.headline}</h1>
        <p>
          Placement score: {profile.placement_score}/100 · Block 1 contains {sessions.length} conversation sessions.
        </p>
      </header>

      <section className={styles.blockOverview}>
        <div>
          <span className="tiny-label">BLOCK 01 · CONVERSATION FOUNDATION</span>
          <h2>{meta.description}</h2>
          <p>{completedCount} of {sessions.length} sessions complete · {totalXp} XP earned in this block.</p>
        </div>
        <div className={styles.blockScore}>
          <strong>{blockPercent}%</strong>
          <span>block</span>
        </div>
        <div className={styles.blockTrack}>
          <span style={{ width: `${blockPercent}%` }} />
        </div>
      </section>

      <section className="continue-card">
        <div className="continue-top">
          <div>
            <span className="tiny-label">
              {completedCount === sessions.length ? 'BLOCK COMPLETE · PRACTICE AGAIN' : `NEXT · SESSION ${String(activeIndex + 1).padStart(2, '0')}`}
            </span>
            <h2>{activeSession.title}</h2>
            <p>{activeSession.subtitle}</p>
          </div>
          <div className="progress-orb">
            <strong>{activeProgress}%</strong>
            <span>done</span>
          </div>
        </div>

        <div className="progress-track"><span style={{ width: `${activeProgress}%` }} /></div>

        <div className="session-meta">
          <span>🎧 Hear</span>
          <span>🗣 Copy</span>
          <span>✍️ Build</span>
          <span>⚡ Answer</span>
          <span>💬 Use</span>
          <span>🎙 Speak</span>
        </div>

        <Link href={`/train/${activeSession.key}`} className="button button-primary">
          {activeProgress >= 100 ? 'Practice again →' : 'Start next session →'}
        </Link>
      </section>

      <section className={styles.pathSection}>
        <div className={styles.pathHeader}>
          <div>
            <span className="tiny-label">YOUR PATH</span>
            <h2>Block 01 sessions</h2>
          </div>
          <span>{completedCount}/{sessions.length} complete</span>
        </div>

        <div className={styles.sessionList}>
          {sessions.map((session, index) => {
            const progress = progressMap.get(session.key)?.completion_percent || 0;
            const complete = progress >= 100;
            const unlocked = index <= activeIndex || complete;
            const active = index === activeIndex && !complete;

            return (
              <article
                key={session.key}
                className={`${styles.sessionCard} ${active ? styles.activeCard : ''} ${!unlocked ? styles.lockedCard : ''}`}
              >
                <div className={styles.sessionNumber}>
                  {complete ? '✓' : String(index + 1).padStart(2, '0')}
                </div>

                <div className={styles.sessionCopy}>
                  <span>{session.focus}</span>
                  <h3>{session.title}</h3>
                  <p>{session.subtitle}</p>
                  <div className={styles.sessionTrack}>
                    <i style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className={styles.sessionAction}>
                  {complete ? <small>Completed</small> : active ? <small>Ready</small> : <small>Locked</small>}
                  {unlocked ? (
                    <Link href={`/train/${session.key}`}>
                      {complete ? 'Review' : 'Start'} →
                    </Link>
                  ) : (
                    <span>🔒</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="loop-grid">
        {loopSteps.map(([number, title, text]) => (
          <article className="loop-card" key={title}>
            <span>{number}</span><h3>{title}</h3><p>{text}</p>
          </article>
        ))}
      </div>

      <section className="split-grid">
        <article className="panel-card">
          <span className="tiny-label">BLOCK REWARD</span>
          <h3>{sessions.length * 100} Speaking XP</h3>
          <p>Complete the five sessions to finish the first conversation block in {meta.label}.</p>
        </article>

        <article className="panel-card accent-panel">
          <span className="tiny-label">POWER PHRASES</span>
          <h3>Review useful conversation blocks.</h3>
          <p>Use the phrase library between sessions so the language becomes automatic.</p>
          <Link href="/phrases" className="text-link">Open Power Phrases →</Link>
        </article>
      </section>
    </div>
  );
}
