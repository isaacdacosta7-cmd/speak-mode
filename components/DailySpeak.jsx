'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './DailySpeak.module.css';
import { playUISound } from '@/lib/uiSound';
import SpeakBuddy from '@/components/SpeakBuddy';

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
  const [feedback, setFeedback] = useState(null);
  const [checking, setChecking] = useState(false);
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

  async function checkChallenge() {
    setChecking(true);
    setMessage('');

    try {
      const res = await fetch('/api/correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'open',
          text: response,
        }),
      });

      const payload = await res.json();

      if (!res.ok || !payload.result) {
        throw new Error(payload.error || 'Could not check this answer.');
      }

      setFeedback(payload.result);
      playUISound(payload.result.status === 'correct' ? 'success' : 'tap');
    } catch (error) {
      setFeedback(null);
      setMessage(error.message || 'Could not check this answer.');
    } finally {
      setChecking(false);
    }
  }

  async function completeChallenge(event) {
    event.preventDefault();

    if (!feedback?.canContinue) {
      checkChallenge();
      return;
    }

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

      setMessage(payload.activity?.completed ? '🎉 Daily Speak complete!' : '✅ Daily challenge complete.');
      playUISound(payload.activity?.completed ? 'complete' : 'success');
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
          <span className="eyebrow">☀️ DAILY SPEAK</span>
          <h1>{missionComplete ? 'Daily mission complete.' : `Your English for today, ${firstName}.`}</h1>
          <p>
            One corrected training session, three Power Phrases and one checked challenge.
            Keep the routine small enough to repeat every day.
          </p>
          <div className="celebration-row">
            <span>🎯 One corrected session</span>
            <span>✨ Three useful phrases</span>
            <span>✅ One checked challenge</span>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <SpeakBuddy variant={missionComplete ? 'celebrate' : 'study'} compact />
          <div className={styles.streak}>
            <span>🔥</span>
            <strong>{streak}</strong>
            <small>day streak</small>
          </div>
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
          <div className={styles.icon}>{trainingDone ? '✅' : '🎯'}</div>
          <div className={styles.copy}>
            <span>TRAIN</span>
            <h2>{trainingDone ? 'Training complete for today' : nextSessionTitle}</h2>
            <p>Complete one structured lesson with correction before moving on.</p>
          </div>
          <Link href={`/train/${nextSessionKey}`}>
            {trainingDone ? 'Review' : 'Start'} →
          </Link>
        </article>

        <article className={`${styles.task} ${phraseCount >= 3 ? styles.done : ''}`}>
          <div className={styles.icon}>{phraseCount >= 3 ? '✅' : '✨'}</div>
          <div className={styles.copy}>
            <span>POWER PHRASES</span>
            <h2>{Math.min(phraseCount, 3)}/3 phrases practiced</h2>
            <p>
              {dueCount > 0
                ? `${dueCount} spaced-review phrase${dueCount === 1 ? '' : 's'} due now.`
                : 'Practice three different phrases from your conversation library.'}
            </p>
          </div>
          <Link href="/phrases">Practice →</Link>
        </article>

        <article className={`${styles.task} ${challengeDone ? styles.done : ''}`}>
          <div className={styles.icon}>{challengeDone ? '✅' : '🧠'}</div>
          <div className={styles.copy}>
            <span>QUICK CHALLENGE · CORRECTED</span>
            <h2>{challengeDone ? 'Challenge complete' : 'Think it, write it, check it.'}</h2>
            <p>{challengePrompt}</p>

            {!challengeDone ? (
              <form className={styles.challenge} onSubmit={completeChallenge}>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={response}
                  onChange={(event) => {
                    setResponse(event.target.value);
                    setFeedback(null);
                    setMessage('');
                  }}
                  placeholder="Write a complete English answer…"
                />

                <div className={styles.challengeActions}>
                  <button
                    type="button"
                    className={styles.check}
                    disabled={response.trim().length < 4 || checking}
                    onClick={checkChallenge}
                  >
                    {checking ? 'Checking English…' : '✓ Check my answer'}
                  </button>

                  <button
                    type="submit"
                    disabled={saving || !feedback?.canContinue}
                  >
                    {saving ? 'Saving…' : 'Save corrected challenge'}
                  </button>
                </div>

                {feedback ? (
                  <div className={`${styles.feedback} ${styles[`feedback_${feedback.status}`]}`}>
                    <strong>
                      {feedback.status === 'correct' ? '✅ ' : feedback.status === 'almost' ? '⚠️ ' : '❌ '}
                      {feedback.title}
                    </strong>

                    {feedback.corrections?.length ? (
                      <ul>
                        {feedback.corrections.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    ) : (
                      <p>Your answer is complete enough to save for today.</p>
                    )}

                    {feedback.suggested ? (
                      <div>
                        <small>QUICK FIX</small>
                        <p>{feedback.suggested}</p>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {message ? <small>{message}</small> : null}
              </form>
            ) : null}
          </div>
        </article>
      </div>

      <section className={`${styles.finish} ${missionComplete ? styles.finishDone : ''}`}>
        <div>
          <span>{missionComplete ? '🎉 DAILY SPEAK COMPLETE' : '🌱 DAILY ROUTINE'}</span>
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
