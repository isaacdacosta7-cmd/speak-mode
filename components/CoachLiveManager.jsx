'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './CoachLiveManager.module.css';

export default function CoachLiveManager({ initialSessions }) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');

  async function updateSession(session, status) {
    const coachInput = document.getElementById(`coach-${session.session_id}`);
    const meetingInput = document.getElementById(`meeting-${session.session_id}`);

    setSaving(session.session_id);
    setMessage('');

    try {
      const response = await fetch('/api/coach/live-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.session_id,
          status,
          coach_name: coachInput?.value || '',
          meeting_url: meetingInput?.value || '',
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Could not update session.');
      }

      setSessions((current) => current.map((item) => (
        item.session_id === session.session_id
          ? { ...item, ...payload.session }
          : item
      )));
      setMessage('Live session updated.');
      router.refresh();
    } catch (error) {
      setMessage(error.message || 'Could not update session.');
    } finally {
      setSaving('');
    }
  }

  const pending = sessions.filter((session) => ['pending', 'confirmed'].includes(session.status));
  const history = sessions.filter((session) => !['pending', 'confirmed'].includes(session.status));

  return (
    <div className={styles.wrap}>
      {message ? <p className={styles.message}>{message}</p> : null}

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span>ACTIVE REQUESTS</span>
          <strong>{pending.length}</strong>
        </div>

        {pending.length ? (
          <div className={styles.list}>
            {pending.map((session) => (
              <article className={styles.card} key={session.session_id}>
                <div className={styles.top}>
                  <div>
                    <span className={styles.status}>{session.status}</span>
                    <h3>{session.student_name}</h3>
                    <p>
                      {new Date(session.preferred_start).toLocaleString()} · {session.timezone}
                    </p>
                  </div>
                  <div className={styles.meta}>
                    <strong>{session.plan_code.toUpperCase()}</strong>
                    <span>{session.session_type === 'one_to_one' ? '1:1' : 'Group'} · {session.duration_minutes} min</span>
                  </div>
                </div>

                {session.topic ? (
                  <div className={styles.topic}>
                    <small>STUDENT WANTS TO PRACTICE</small>
                    <p>{session.topic}</p>
                  </div>
                ) : null}

                <div className={styles.fields}>
                  <label>
                    <span>Coach name</span>
                    <input
                      id={`coach-${session.session_id}`}
                      defaultValue={session.coach_name || ''}
                      placeholder="Isaac Delgado"
                    />
                  </label>
                  <label>
                    <span>Zoom / Meet link</span>
                    <input
                      id={`meeting-${session.session_id}`}
                      defaultValue={session.meeting_url || ''}
                      placeholder="https://..."
                    />
                  </label>
                </div>

                <div className={styles.actions}>
                  <button
                    className={styles.confirm}
                    disabled={saving === session.session_id}
                    onClick={() => updateSession(session, 'confirmed')}
                  >
                    Confirm
                  </button>
                  <button
                    disabled={saving === session.session_id}
                    onClick={() => updateSession(session, 'completed')}
                  >
                    Mark completed
                  </button>
                  <button
                    className={styles.cancel}
                    disabled={saving === session.session_id}
                    onClick={() => updateSession(session, 'cancelled')}
                  >
                    Cancel
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>There are no pending Live requests.</p>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span>HISTORY</span>
          <strong>{history.length}</strong>
        </div>
        {history.length ? (
          <div className={styles.history}>
            {history.map((session) => (
              <article key={session.session_id}>
                <div>
                  <strong>{session.student_name}</strong>
                  <span>{new Date(session.preferred_start).toLocaleString()}</span>
                </div>
                <span className={styles.status}>{session.status}</span>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Completed and cancelled sessions will appear here.</p>
        )}
      </section>
    </div>
  );
}
