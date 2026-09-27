'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './DailySpeak.module.css';

export default function DailySpeak({
  firstName,
  timezone,
  streak,
  trainingDone,
  phraseCount,
  challengeDone,
  missionComplete,
  dueCount,
  challengeKey,
  challengePrompt,
  nextSessionKey,
  nextSessionTitle,
}) {
  const router = useRouter();
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (!browserTimezone || browserTimezone === timezone) return;

    fetch('/api/timezone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timezone: browserTimezone }),
    })
      .then((res) => {
        if (res.ok) router.refresh();
      })
      .catch(() => {});
  }, [timezone, router]);

  async function completeChallenge(event) {
    event.preventDefault();
    if (response.trim().length < 2) return;

    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/daily-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_key: challengeKey,
          response_text: response,
        }),
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error || 'Could not save the challenge.');
      }

      setMessage('Daily challenge complete.');
      router.refresh();
    } catch (error) {
      setMessage(error.message || 'Could not save the challenge.');
    } finally {
      setSaving(false);
    }
  }

  const completedTasks = Number(trainingDone) + Number(phraseCount >= 3) + Number(challengeDone);

  return (
    <div className={styles.wrap}>
      <header className={styles.hero}>
        <div>
          <span className="eyebrow">DAILY SPEAK</span>
          <h1>{missionComplete ? 'Daily mission complete.' : `Your English for today, ${firstName}.`}</h1>
          <p>
            One training session, three Power Phrases and one quick challenge.
            Keep the routine small enough to repeat every day.
          </p>
        </div>

        <div className={styles.streak}>
          <span>🔥</span>
          <strong>{streak}</strong>
          <small>day streak</small>
        </div>
      </header>

      <section className={styles.progressCard}>
        <div>
          <span>TODAY</span>
          <strong>{completedTasks}/3 complete</strong>
        </div>
        <div className={styles.track}>
          <i style={{ width: `${Math.round((completedTasks / 3) * 100)}%` }} />
        </div>
        <small>Timezone: {timezone}</small>
      </section>

      <div className={styles.tasks}>
        <article className={`${styles.task} ${trainingDone ? styles.done : ''}`}>
          <div className={styles.icon}>{trainingDone ? '✓' : '01'}</div>
          <div className={styles.copy}>
            <span>TRAIN</span>
            <h2>{trainingDone ? 'Training complete for today' : nextSessionTitle}</h2>
            <p>Complete one structured conversation session.</p>
          </div>
          <Link href={`/train/${nextSessionKey}`}>
            {trainingDone ? 'Review' : 'Start'} →
          </Link>
        </article>

        <article className={`${styles.task} ${phraseCount >= 3 ? styles.done : ''}`}>
          <div className={styles.icon}>{phraseCount >= 3 ? '✓' : '02'}</div>
          <div className={styles.copy}>
            <span>POWER PHRASES</span>
            <h2>{Math.min(phraseCount, 3)}/3 phrases practiced</h2>
            <p>
              {dueCount > 0
                ? `${dueCount} spaced-review phrase${dueCount === 1 ? '' : 's'} due now.`
                : 'Practice three different phrases and say each one out loud.'}
            </p>
          </div>
          <Link href="/phrases">Practice →</Link>
        </article>

        <article className={`${styles.task} ${challengeDone ? styles.done : ''}`}>
          <div className={styles.icon}>{challengeDone ? '✓' : '03'}</div>
          <div className={styles.copy}>
            <span>QUICK CHALLENGE</span>
            <h2>{challengeDone ? 'Challenge complete' : 'Think, say it, then write it.'}</h2>
            <p>{challengePrompt}</p>

            {!challengeDone ? (
              <form className={styles.challenge} onSubmit={completeChallenge}>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={response}
                  onChange={(event) => setResponse(event.target.value)}
                  placeholder="Say your answer out loud first, then type the version you want to keep…"
                />
                {message ? <small>{message}</small> : null}
                <button type="submit" disabled={saving || response.trim().length < 2}>
                  {saving ? 'Saving…' : 'Complete challenge'}
                </button>
              </form>
            ) : null}
          </div>
        </article>
      </div>

      <section className={`${styles.finish} ${missionComplete ? styles.finishDone : ''}`}>
        <div>
          <span>{missionComplete ? '✓ DAILY SPEAK COMPLETE' : 'DAILY ROUTINE'}</span>
          <h2>{missionComplete ? 'Come back tomorrow.' : 'Finish all three to protect your streak.'}</h2>
          <p>
            The streak counts days where the full Daily Speak mission is completed.
          </p>
        </div>
        <strong>{missionComplete ? '100%' : `${Math.round((completedTasks / 3) * 100)}%`}</strong>
      </section>
    </div>
  );
}
