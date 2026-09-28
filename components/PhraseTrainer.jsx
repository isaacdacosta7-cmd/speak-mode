'use client';

import { useMemo, useState } from 'react';
import styles from './PhraseTrainer.module.css';
import { playUISound } from '@/lib/uiSound';
import SpeakBuddy from '@/components/SpeakBuddy';

const libraries = {
  START_MODE: [
    ['start-what-about-you', 'What about you?', 'Hand the conversation back to the other person.', 'Conversation'],
    ['start-let-me-think', 'Let me think.', 'Give yourself a moment to organize your answer.', 'Conversation'],
    ['start-nice-to-meet', 'Nice to meet you.', 'Use this when meeting someone for the first time.', 'Conversation'],
    ['start-im-from', "I'm from…", 'Say where you are from in a natural way.', 'About me'],
    ['start-i-live-in', 'I live in…', 'Say where you currently live.', 'About me'],
    ['start-i-work-in', 'I work in…', 'Explain your work area or industry.', 'About me'],
    ['start-i-like', 'I like…', 'Share a simple preference.', 'About me'],
    ['start-usually', 'I usually…', 'Describe a normal routine.', 'Daily life'],
    ['start-in-the-morning', 'In the morning, I…', 'Talk about the beginning of your day.', 'Daily life'],
    ['start-on-weekends', 'On weekends, I…', 'Talk about your weekend routine.', 'Daily life'],
    ['start-could-you-repeat', 'Could you repeat that?', 'Ask someone to say something again naturally.', 'Survival'],
    ['start-could-you-help', 'Could you help me?', 'Ask politely for help.', 'Survival'],
    ['start-looking-for', "I'm looking for…", 'Explain what you need to find.', 'Survival'],
    ['start-how-much', 'How much is it?', 'Ask for a price.', 'Survival'],
    ['start-where-is', 'Where is the restroom?', 'Ask for a place or direction.', 'Survival'],
  ],

  RESPONSE_MODE: [
    ['response-actually', 'Actually…', 'Correct, clarify, or add a small nuance.', 'Response'],
    ['response-usually', 'Usually, I…', 'Talk about habits quickly and naturally.', 'Response'],
    ['response-it-depends', 'It depends.', 'Open a flexible answer.', 'Response'],
    ['response-let-me-think', 'Let me think for a second.', 'Buy a moment when you need to think.', 'Response'],
    ['response-pretty-good', 'Pretty good, actually.', 'Give a more natural answer than only “fine.”', 'Response'],
    ['response-not-really', 'Not really.', 'Give a soft negative answer.', 'Reaction'],
    ['response-most-time', 'Most of the time…', 'Describe what normally happens.', 'Reaction'],
    ['response-thats-good-question', "That's a good question.", 'React while giving yourself time to think.', 'Reaction'],
    ['response-what-about-you', 'What about you?', 'Keep the exchange moving.', 'Conversation'],
    ['response-how-about-you', 'How about you?', 'Return the question naturally.', 'Conversation'],
    ['response-lately', "Lately, I've been…", 'Talk about recent activity.', 'Time'],
    ['response-yesterday', 'Yesterday, I…', 'Start talking about the recent past.', 'Time'],
    ['response-tomorrow', "Tomorrow, I'm…", 'Start talking about a future plan.', 'Time'],
    ['response-going-to', "I'm going to…", 'Talk about an intention or plan.', 'Time'],
    ['response-right-now', 'Right now, I’m…', 'Say what is happening at the moment.', 'Time'],
  ],

  CONVERSATION_MODE: [
    ['conversation-really', 'Really?', 'Show a reaction and create room for more.', 'React'],
    ['conversation-no-way', 'No way!', 'React naturally to surprising information.', 'React'],
    ['conversation-amazing', "That's amazing.", 'Respond positively to exciting news.', 'React'],
    ['conversation-i-can-imagine', 'I can imagine.', 'Show empathy or understanding.', 'React'],
    ['conversation-how-was-it', 'How was it?', 'Ask for more detail.', 'Follow-up'],
    ['conversation-what-next', 'What happened next?', 'Keep a story moving forward.', 'Follow-up'],
    ['conversation-how-get-into', 'How did you get into that?', 'Go deeper into the topic.', 'Follow-up'],
    ['conversation-what-made-you', 'What made you decide that?', 'Explore someone’s reason or motivation.', 'Follow-up'],
    ['conversation-reminds-me', 'That reminds me of…', 'Connect the topic to your own experience.', 'Connect'],
    ['conversation-speaking-of', 'Speaking of that…', 'Link the current topic to a related idea.', 'Connect'],
    ['conversation-in-my-experience', 'In my experience…', 'Introduce a personal example.', 'Opinion'],
    ['conversation-personally', 'Personally, I think…', 'Give your opinion clearly.', 'Opinion'],
    ['conversation-main-reason', 'The main reason is…', 'Support your opinion with a reason.', 'Opinion'],
    ['conversation-what-think', 'What do you think?', 'Invite the other person’s opinion.', 'Conversation'],
    ['conversation-have-told-you', 'Have I ever told you about…?', 'Open a related personal story.', 'Story'],
  ],

  FLUENCY_MODE: [
    ['fluency-now-that', 'Now that you mention it…', 'Bring in a related idea naturally.', 'Natural flow'],
    ['fluency-makes-sense', 'That makes sense.', 'React naturally to what someone said.', 'Natural flow'],
    ['fluency-pretty-much', 'Pretty much.', 'Give a short, natural confirmation.', 'Natural flow'],
    ['fluency-by-the-way', 'By the way…', 'Shift the topic smoothly.', 'Natural flow'],
    ['fluency-to-be-fair', 'To be fair…', 'Add balance or nuance to your point.', 'Nuance'],
    ['fluency-see-your-point', 'I see your point.', 'Acknowledge another perspective.', 'Nuance'],
    ['fluency-to-an-extent', 'To an extent…', 'Show partial agreement.', 'Nuance'],
    ['fluency-at-same-time', 'At the same time…', 'Introduce another side of the idea.', 'Nuance'],
    ['fluency-funny-thing', 'The funny thing is…', 'Highlight an unexpected detail in a story.', 'Story'],
    ['fluency-believe-it', 'Believe it or not…', 'Introduce something surprising.', 'Story'],
    ['fluency-turns-out', 'Turns out…', 'Reveal what eventually happened.', 'Story'],
    ['fluency-looking-back', 'Looking back…', 'Reflect on a past experience.', 'Story'],
    ['fluency-caught-most', 'I caught most of that.', 'Signal partial understanding.', 'Repair'],
    ['fluency-last-part', 'What was that last part?', 'Ask for one missing detail.', 'Repair'],
    ['fluency-run-that-by', 'Could you run that by me again?', 'Ask someone to repeat naturally.', 'Repair'],
  ],

  NATIVE_FLOW: [
    ['native-get-where', "I get where you're coming from.", 'Acknowledge the other person’s perspective.', 'Nuance'],
    ['native-off-top', 'Off the top of my head…', 'Give a spontaneous answer without overplanning it.', 'Spontaneous'],
    ['native-caught-off', 'That caught me off guard.', 'Express surprise in a natural way.', 'Reaction'],
    ['native-put-it-this-way', "I'd put it this way…", 'Reframe your idea more precisely.', 'Precision'],
    ['native-that-said', 'That said…', 'Add contrast or advanced nuance.', 'Nuance'],
    ['native-see-logic', 'I see the logic.', 'Recognize the reasoning behind an idea.', 'Diplomacy'],
    ['native-not-convinced', "I'm not entirely convinced…", 'Disagree without sounding abrupt.', 'Diplomacy'],
    ['native-my-concern', 'My concern would be…', 'Introduce a specific objection professionally.', 'Diplomacy'],
    ['native-what-if', 'What if we…?', 'Offer an alternative collaboratively.', 'Diplomacy'],
    ['native-think-out-loud', 'Let me think out loud for a second.', 'Build an answer while sounding composed.', 'Spontaneous'],
    ['native-bigger-question', 'The bigger question is…', 'Reframe a discussion at a higher level.', 'Precision'],
    ['native-narrow-down', 'If I had to narrow it down…', 'Move toward a clear conclusion.', 'Precision'],
    ['native-in-hindsight', 'In hindsight…', 'Add reflection to a past experience.', 'Story'],
    ['native-hearing-correctly', "If I'm hearing you correctly…", 'Summarize another person’s position.', 'Leadership'],
    ['native-open-question', 'The open question is…', 'Identify what still needs to be resolved.', 'Leadership'],
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

function reviewStatus(item) {
  if (!item || (item.progress_percent || 0) < 100) {
    return { label: 'Learning', due: false };
  }

  if (!item.next_review_at) {
    return { label: 'Review schedule pending', due: false };
  }

  const dueDate = new Date(item.next_review_at);

  if (dueDate <= new Date()) {
    return { label: 'Review due now', due: true };
  }

  return {
    label: `Next review: ${dueDate.toLocaleDateString()}`,
    due: false,
  };
}

export default function PhraseTrainer({ mode, initialProgress }) {
  const phrases = libraries[mode] || libraries.START_MODE;

  const initialMap = useMemo(
    () => Object.fromEntries(initialProgress.map((item) => [item.phrase_key, item])),
    [initialProgress]
  );

  const categories = useMemo(
    () => ['All', ...new Set(phrases.map((item) => item[3]))],
    [phrases]
  );

  const [category, setCategory] = useState('All');
  const [progress, setProgress] = useState(initialMap);
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');

  const orderedPhrases = useMemo(() => {
    const now = new Date();

    return [...phrases]
      .filter((item) => category === 'All' || item[3] === category)
      .sort(([keyA], [keyB]) => {
        const a = progress[keyA];
        const b = progress[keyB];

        const aDue = a?.progress_percent >= 100 && a?.next_review_at && new Date(a.next_review_at) <= now;
        const bDue = b?.progress_percent >= 100 && b?.next_review_at && new Date(b.next_review_at) <= now;

        return Number(bDue) - Number(aDue);
      });
  }, [phrases, progress, category]);

  const mastered = phrases.filter(([key]) => (progress[key]?.progress_percent || 0) >= 100).length;
  const due = phrases.filter(([key]) => {
    const item = progress[key];
    return item?.progress_percent >= 100 && item?.next_review_at && new Date(item.next_review_at) <= new Date();
  }).length;

  async function practice(key) {
    const previous = progress[key] || {
      phrase_key: key,
      repetitions: 0,
      progress_percent: 0,
      review_stage: 0,
      next_review_at: null,
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

      const reachedMastery =
        (previous.progress_percent || 0) < 100 &&
        (payload.progress?.progress_percent || 0) >= 100;

      playUISound(reachedMastery || reviewStatus(previous).due ? 'complete' : 'success');
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
      <header className="page-header cartoon-hero">
        <div>
          <span className="eyebrow">✨ POWER PHRASES</span>
          <h1>Build a real conversation library.</h1>
          <p>
            Your current Mode now includes 15 high-value phrases. Listen, repeat and revisit them when Speak Mode brings them back for review.
          </p>
          <div className="celebration-row">
            <span>📚 {phrases.length} phrases</span>
            <span>🌟 {mastered} mastered</span>
            <span>🧠 {due} due now</span>
          </div>
        </div>
        <SpeakBuddy variant="phrases" />
      </header>

      <div className={styles.filters}>
        {categories.map((item) => (
          <button
            type="button"
            key={item}
            className={category === item ? styles.filterActive : ''}
            onClick={() => {
              setCategory(item);
              playUISound('tap');
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {message ? (
        <section className="panel-card">
          <span className="tiny-label">SYNC MESSAGE</span>
          <p>{message}</p>
        </section>
      ) : null}

      <div className={styles.list}>
        {orderedPhrases.map(([key, phrase, meaning, phraseCategory]) => {
          const item = progress[key];
          const percent = item?.progress_percent || 0;
          const reps = item?.repetitions || 0;
          const review = reviewStatus(item);

          return (
            <article className={`${styles.card} ${review.due ? styles.dueCard : ''}`} key={key}>
              <button
                className={styles.play}
                type="button"
                onClick={() => speak(phrase)}
                aria-label={`Play phrase: ${phrase}`}
              >
                ▶
              </button>

              <div className={styles.copy}>
                <span className={styles.category}>{phraseCategory}</span>
                <strong>{percent >= 100 ? '🌟 ' : ''}{phrase}</strong>
                <small>{meaning}</small>
                <em className={review.due ? styles.due : ''}>{review.label}</em>
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
                  : review.due
                    ? 'Review now'
                    : percent >= 100
                      ? 'Practice again'
                      : 'I repeated it'}
              </button>
            </article>
          );
        })}
      </div>

      <section className="panel-card accent-panel">
        <span className="tiny-label">🧠 SPACED REVIEW</span>
        <h3>Learn it five times, then Speak Mode brings it back.</h3>
        <p>
          Initial practice builds from 20% to 100%. After mastery, reviews are scheduled
          around 24 hours, 3 days, 7 days and 14 days to keep the phrase active.
        </p>
      </section>
    </div>
  );
}
