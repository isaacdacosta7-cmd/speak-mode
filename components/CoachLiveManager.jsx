'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './CoachLiveManager.module.css';

function formatSpeaking(seconds = 0) {
  const minutes = Math.floor(seconds / 60);
  return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default function CoachLiveManager({ initialSessions }) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');

  async function updateSession(session, status) {
    const coachInput = document.getElementById(`coach-${session.session_id}`);
    const meetingInput = document.getElementById(`meeting-${session.session_id}`);
    const feedbackInput = document.getElementById(`feedback-${session.session_id}`);
    const homeworkInput = document.getElementById(`homework-${session.session_id}`);

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
          coach_feedback: feedbackInput?.value || '',
          homework: homeworkInput?.value || '',
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

      setMessage(
        status === 'completed'
          ? 'Session completed. Feedback and homework are now visible to the student.'
          : 'Live session updated.'
      );
      router.refresh();
    } catch (error) {
      setMessage(error.message || 'Could not update session.');
    } finally {
      setSaving('');
    }
  }

  const active = sessions.filter((session) => ['pending', 'confirmed'].includes(session.status));
  const history = sessions.filter((session) => !['pending', 'confirmed'].includes(session.status));

  return (
    <div className={styles.wrap}>
      {message ? <p className={styles.message}>{message}</p> : null}

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span>ACTIVE REQUESTS</span>
          <strong>{active.length}</strong>
        </div>

        {active.length ? (
          <div className={styles.list}>
            {active.map((session) => (
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

                <div className={styles.studentContext}>
                  <div>
                    <small>MODE</small>
                    <strong>{session.placement_mode?.replaceAll('_', ' ') || 'Pending'}</strong>
                  </div>
                  <div>
                    <small>PLACEMENT</small>
                    <strong>{session.placement_score ?? '—'}/100</strong>
                  </div>
                  <div>
                    <small>ACTIVITIES</small>
                    <strong>{session.sessions_completed || 0}</strong>
                  </div>
                  <div>
                    <small>XP</small>
                    <strong>{session.total_xp || 0}</strong>
                  </div>
                  <div>
                    <small>SPEAKING</small>
                    <strong>{formatSpeaking(session.speaking_seconds)}</strong>
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

                <div className={styles.notes}>
                  <label>
                    <span>Coach feedback</span>
                    <textarea
                      id={`feedback-${session.session_id}`}
                      rows={4}
                      defaultValue={session.coach_feedback || ''}
                      placeholder="What did the student do well? What should improve?"
                      maxLength={1200}
                    />
                  </label>

                  <label>
                    <span>Homework / next focus</span>
                    <textarea
                      id={`homework-${session.session_id}`}
                      rows={4}
                      defaultValue={session.homework || ''}
                      placeholder="Example: Practice three follow-up questions before the next session."
                      maxLength={1200}
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
                    Complete + send feedback
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
                  <span>
                    {new Date(session.preferred_start).toLocaleString()} · {session.placement_mode?.replaceAll('_', ' ') || 'Pending'}
                  </span>
                  {session.coach_feedback ? <p>{session.coach_feedback}</p> : null}
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
