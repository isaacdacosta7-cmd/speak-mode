'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './BetaFeedback.module.css';

const types = [
  ['bug', 'Bug'],
  ['confusing', 'Confusing'],
  ['like', 'I like this'],
  ['suggestion', 'Suggestion'],
];

export default function BetaFeedback() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('suggestion');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (message.trim().length < 2) return;

    setSending(true);
    setStatus('');

    try {
      const response = await fetch('/api/beta-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback_type: type,
          message,
          page_path: pathname,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Could not send feedback.');
      }

      setMessage('');
      setStatus('Thank you. Your feedback was sent.');
      window.setTimeout(() => {
        setOpen(false);
        setStatus('');
      }, 1200);
    } catch (error) {
      setStatus(error.message || 'Could not send feedback.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.feedback}>
      {open ? (
        <section className={styles.panel}>
          <div className={styles.head}>
            <div>
              <span>SPEAK MODE BETA</span>
              <strong>Send feedback</strong>
            </div>
            <button type="button" onClick={() => setOpen(false)}>×</button>
          </div>

          <form onSubmit={submit}>
            <div className={styles.types}>
              {types.map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={type === value ? styles.active : ''}
                  onClick={() => setType(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              maxLength={2000}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tell us what happened or what you would improve…"
            />

            {status ? <p>{status}</p> : null}

            <button className={styles.send} type="submit" disabled={sending || message.trim().length < 2}>
              {sending ? 'Sending…' : 'Send feedback'}
            </button>
          </form>
        </section>
      ) : (
        <button className={styles.trigger} type="button" onClick={() => setOpen(true)}>
          Beta feedback
        </button>
      )}
    </div>
  );
}
