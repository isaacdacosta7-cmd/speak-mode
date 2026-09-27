'use client';

import { useMemo, useState } from 'react';
import styles from './PhraseTrainer.module.css';

const libraries = {
  START_MODE: [
    ['start-what-about-you', 'What about you?', 'Hand the conversation back to the other person.'],
    ['start-let-me-think', 'Let me think.', 'Give yourself a moment to organize your answer.'],
    ['start-im-from', "I'm from…", 'Say where you are from in a natural way.'],
    ['start-i-work-in', 'I work in…', 'Explain your work area or industry.'],
    ['start-could-you-repeat', 'Could you repeat that?', 'Ask someone to say something again naturally.'],
  ],
  RESPONSE_MODE: [
    ['response-actually', 'Actually…', 'Correct, clarify, or add a small nuance.'],
    ['response-usually', 'Usually, I…', 'Talk about habits quickly and naturally.'],
    ['response-it-depends', 'It depends.', 'Open a flexible answer.'],
    ['response-let-me-think', 'Let me think for a second.', 'Buy a moment when you need to think.'],
    ['response-what-about-you', 'What about you?', 'Keep the exchange moving.'],
  ],
  CONVERSATION_MODE: [
    ['conversation-really', 'Really?', 'Show a reaction and create room for more.'],
    ['conversation-how-was-it', 'How was it?', 'Ask for more detail.'],
    ['conversation-what-next', 'What happened next?', 'Keep a story moving forward.'],
    ['conversation-reminds-me', 'That reminds me of…', 'Connect the topic to your own experience.'],
    ['conversation-how-get-into', 'How did you get into that?', 'Go deeper into the topic.'],
  ],
  FLUENCY_MODE: [
    ['fluency-now-that', 'Now that you mention it…', 'Bring in a related idea naturally.'],
    ['fluency-makes-sense', 'That makes sense.', 'React naturally to what someone said.'],
    ['fluency-pretty-much', 'Pretty much.', 'Give a short, natural confirmation.'],
    ['fluency-by-the-way', 'By the way…', 'Shift the topic smoothly.'],
    ['fluency-to-be-fair', 'To be fair…', 'Add balance or nuance to your point.'],
  ],
  NATIVE_FLOW: [
    ['native-get-where', "I get where you're coming from.", 'Acknowledge the other person’s perspective.'],
    ['native-off-top', 'Off the top of my head…', 'Give a spontaneous answer without overplanning it.'],
    ['native-caught-off', 'That caught me off guard.', 'Express surprise in a natural way.'],
    ['native-put-it-this-way', "I'd put it this way…", 'Reframe your idea more precisely.'],
    ['native-that-said', 'That said…', 'Add a contrast or a more advanced nuance.'],
  ],
};

function speak(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.96;

  const voices = window.speechSynthesis.getVoices();
  const voice =
    voices.find((item) => item.lang === 'en-US') ||
    voices.find((item) => item.lang?.startsWith('en'));

  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export default function PhraseTrainer({ mode, initialProgress }) {
  const phrases = libraries[mode] || libraries.START_MODE;

  const initialMap = useMemo(
    () => Object.fromEntries(initialProgress.map((item) => [item.phrase_key, item])),
    [initialProgress]
  );

  const [progress, setProgress] = useState(initialMap);
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');

  async function practice(key) {
    const previous = progress[key] || {
      phrase_key: key,
      repetitions: 0,
      progress_percent: 0,
    };

    const optimistic = {
      ...previous,
      repetitions: (previous.repetitions || 0) + 1,
      progress_percent: Math.min(100, (previous.progress_percent || 0) + 20),
      last_practiced_at: new Date().toISOString(),
    };

    setProgress((current) => ({ ...current, [key]: optimistic }));
    setSaving(key);
    setMessage('');

    try {
      const response = await fetch('/api/phrase-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase_key: key }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Could not save practice.');
      }

      setProgress((current) => ({
        ...current,
        [key]: payload.progress,
      }));
    } catch (error) {
      setProgress((current) => ({
        ...current,
        [key]: previous,
      }));
      setMessage(error.message || 'Could not save this repetition. Please try again.');
    } finally {
      setSaving('');
    }
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <span className="eyebrow">POWER PHRASES</span>
        <h1>Make useful English automatic.</h1>
        <p>Listen, repeat and mark each phrase every time you practice it out loud.</p>
      </header>

      {message ? (
        <section className="panel-card">
          <span className="tiny-label">SYNC MESSAGE</span>
          <p>{message}</p>
        </section>
      ) : null}

      <div className={styles.list}>
        {phrases.map(([key, phrase, meaning]) => {
          const item = progress[key];
          const percent = item?.progress_percent || 0;
          const reps = item?.repetitions || 0;

          return (
            <article className={styles.card} key={key}>
              <button
                className={styles.play}
                type="button"
                onClick={() => speak(phrase)}
                aria-label={`Play phrase: ${phrase}`}
              >
                ▶
              </button>

              <div className={styles.copy}>
                <strong>{phrase}</strong>
                <small>{meaning}</small>
                <div className={styles.track}>
                  <i style={{ width: `${percent}%` }} />
                </div>
              </div>

              <div className={styles.progress}>
                <strong>{percent}%</strong>
                <span>{reps} {reps === 1 ? 'rep' : 'reps'}</span>
              </div>

              <button
                className={styles.practice}
                type="button"
                onClick={() => practice(key)}
                disabled={saving === key}
              >
                {saving === key
                  ? 'Saving…'
                  : percent >= 100
                    ? 'Practice again'
                    : 'I repeated it'}
              </button>
            </article>
          );
        })}
      </div>

      <section className="panel-card accent-panel">
        <span className="tiny-label">HOW THE PERCENTAGE WORKS</span>
        <h3>Each deliberate repetition adds 20%.</h3>
        <p>
          1 repetition = 20% · 2 = 40% · 3 = 60% · 4 = 80% · 5 = 100%.
          After 100%, the phrase stays available for future review.
        </p>
      </section>
    </div>
  );
}
