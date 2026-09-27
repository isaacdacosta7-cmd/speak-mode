'use client';

import styles from './BetaAdminDashboard.module.css';

function readableMode(mode) {
  return mode ? mode.replaceAll('_', ' ') : 'PLACEMENT PENDING';
}

function speakingTime(seconds = 0) {
  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${remaining}m`;
}

function activityLabel(value) {
  if (!value || value === '-infinity') return 'No activity yet';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No activity yet';

  return date.toLocaleString();
}

export default function BetaAdminDashboard({ users, feedback }) {
  const placed = users.filter((user) => user.placement_mode).length;
  const active = users.filter((user) => user.last_activity_at && user.last_activity_at !== '-infinity').length;
  const totalXp = users.reduce((sum, user) => sum + (user.total_xp || 0), 0);
  const newFeedback = feedback.filter((item) => item.status === 'new').length;

  return (
    <div className={styles.wrap}>
      <header className="page-header">
        <span className="eyebrow">BETA ADMIN</span>
        <h1>See how people are using Speak Mode.</h1>
        <p>Use real beta behavior to decide what to improve before expanding the course.</p>
      </header>

      <section className={styles.metrics}>
        <article><strong>{users.length}</strong><span>Registered users</span></article>
        <article><strong>{placed}</strong><span>Placement completed</span></article>
        <article><strong>{active}</strong><span>Users with activity</span></article>
        <article><strong>{totalXp}</strong><span>Total XP earned</span></article>
        <article><strong>{newFeedback}</strong><span>New feedback</span></article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <span>TESTERS</span>
            <h2>User activity</h2>
          </div>
          <strong>{users.length}</strong>
        </div>

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Mode</th>
                <th>Score</th>
                <th>Activities</th>
                <th>XP</th>
                <th>Speaking</th>
                <th>Daily days</th>
                <th>Last activity</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id}>
                  <td>
                    <strong>{user.full_name || 'Student'}</strong>
                    <span>{user.email}</span>
                  </td>
                  <td>{readableMode(user.placement_mode)}</td>
                  <td>{user.placement_score ?? '—'}</td>
                  <td>{user.completed_activities || 0}</td>
                  <td>{user.total_xp || 0}</td>
                  <td>{speakingTime(user.speaking_seconds)}</td>
                  <td>{user.completed_daily_days || 0}</td>
                  <td>{activityLabel(user.last_activity_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <span>BETA FEEDBACK</span>
            <h2>What testers are telling you</h2>
          </div>
          <strong>{feedback.length}</strong>
        </div>

        {feedback.length ? (
          <div className={styles.feedbackList}>
            {feedback.map((item) => (
              <article key={item.feedback_id}>
                <div className={styles.feedbackTop}>
                  <div>
                    <span className={styles.type}>{item.feedback_type}</span>
                    <strong>{item.student_name}</strong>
                    <small>{item.email}</small>
                  </div>
                  <time>{new Date(item.created_at).toLocaleString()}</time>
                </div>

                <p>{item.message}</p>

                <footer>
                  <span>{item.page_path || 'Unknown page'}</span>
                  <span className={styles.status}>{item.status}</span>
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Feedback submitted by beta testers will appear here.</p>
        )}
      </section>
    </div>
  );
}
