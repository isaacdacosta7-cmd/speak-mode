'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LiveBooking.module.css';

export default function LiveBooking({ plan, used, sessions, subscriptionActive }) {
  const router = useRouter();
  const [preferredStart, setPreferredStart] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const remaining = Math.max((plan.live_sessions_per_month || 0) - used, 0);
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    []
  );

  async function requestSession(event) {
    event.preventDefault();
    setMessage('');

    if (!preferredStart) {
      setMessage('Choose a preferred date and time.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/live-session/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferred_start: new Date(preferredStart).toISOString(),
          timezone,
          topic,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Could not request session.');
      }

      setPreferredStart('');
      setTopic('');
      setMessage('Request sent. A coach can now confirm the final time and meeting link.');
      router.refresh();
    } catch (error) {
      setMessage(error.message || 'Could not request session.');
    } finally {
      setLoading(false);
    }
  }

  const canBook = subscriptionActive && plan.live_sessions_per_month > 0 && remaining > 0;

  return (
    <div className={styles.grid}>
      <section className={styles.planCard}>
        <span className={styles.kicker}>YOUR PLAN</span>
        <h2>{plan.name}</h2>
        <p>
          {plan.live_sessions_per_month > 0
            ? `${plan.live_sessions_per_month} live conversation sessions per month · ${plan.live_session_minutes} minutes each`
            : 'Digital practice and AI tools. Human live sessions require a paid Live plan.'}
        </p>

        <div className={styles.quota}>
          <div><strong>{used}</strong><span>used</span></div>
          <div><strong>{remaining}</strong><span>remaining</span></div>
          <div><strong>{plan.live_sessions_per_month}</strong><span>monthly limit</span></div>
        </div>

        <small className={styles.type}>
          {plan.live_session_type === 'one_to_one' ? '1:1 coach conversation' :
           plan.live_session_type === 'group' ? 'Group conversation session' :
           'Human coaching unavailable on this plan'}
        </small>
      </section>

      <section className={styles.bookingCard}>
        <span className={styles.kicker}>BOOK A HUMAN CONVERSATION</span>
        <h2>{canBook ? 'Request your next session.' : 'Your live quota is currently closed.'}</h2>

        {canBook ? (
          <form onSubmit={requestSession} className={styles.form}>
            <label>
              <span>Preferred date and time</span>
              <input
                type="datetime-local"
                value={preferredStart}
                onChange={(event) => setPreferredStart(event.target.value)}
                required
              />
              <small>Timezone: {timezone}</small>
            </label>

            <label>
              <span>What would you like to practice?</span>
              <textarea
                rows={4}
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="For example: business introductions, travel conversation, pronunciation…"
                maxLength={500}
              />
            </label>

            {message ? <p className={styles.message}>{message}</p> : null}

            <button type="submit" disabled={loading}>
              {loading ? 'Sending request…' : 'Request live session'}
            </button>
          </form>
        ) : (
          <div className={styles.closed}>
            <strong>{!subscriptionActive && plan.live_sessions_per_month > 0 ? 'Subscription inactive' : plan.live_sessions_per_month === 0 ? 'Upgrade required' : 'Monthly limit reached'}</strong>
            <p>
              {!subscriptionActive && plan.live_sessions_per_month > 0
                ? 'Reactivate the paid plan to request another human conversation session.'
                : plan.live_sessions_per_month === 0
                ? 'Plus and Pro include a controlled number of human conversation sessions each month.'
                : 'Your quota refreshes with the next monthly cycle.'}
            </p>
          </div>
        )}
      </section>

      <section className={styles.history}>
        <div className={styles.historyHead}>
          <span className={styles.kicker}>LIVE SESSION HISTORY</span>
          <strong>{sessions.length} request{sessions.length === 1 ? '' : 's'}</strong>
        </div>

        {sessions.length ? (
          <div className={styles.sessionList}>
            {sessions.map((session) => (
              <article key={session.id}>
                <div>
                  <strong>{new Date(session.preferred_start).toLocaleString()}</strong>
                  <span>{session.session_type === 'one_to_one' ? '1:1' : 'Group'} · {session.duration_minutes} min</span>
                </div>
                <span className={styles.status}>{session.status}</span>
                {session.meeting_url ? (
                  <a href={session.meeting_url} target="_blank" rel="noreferrer">Join meeting</a>
                ) : (
                  <small>Meeting link pending confirmation</small>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Your live conversation requests will appear here.</p>
        )}
      </section>
    </div>
  );
}
