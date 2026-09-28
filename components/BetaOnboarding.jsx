'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { playUISound } from '@/lib/uiSound';
import styles from './BetaOnboarding.module.css';

const steps = [
  {
    icon: '🎯',
    eyebrow: 'STEP 1',
    title: 'Your English starts with your MODE.',
    copy: 'Your placement result assigns one of five Speak Modes. That Mode determines the training path you see inside the app.',
    chips: ['Placement score', 'Personalized Mode', 'Structured path'],
  },
  {
    icon: '☀️',
    eyebrow: 'STEP 2',
    title: 'Use Daily Speak every day.',
    copy: 'Your daily routine is simple: one training session, three Power Phrases and one quick challenge. Complete all three to protect your streak.',
    chips: ['1 Train session', '3 Power Phrases', '1 Quick Challenge'],
  },
  {
    icon: '✨',
    eyebrow: 'STEP 3',
    title: 'Practice, repeat and tell us what you feel.',
    copy: 'Train builds the skill, Power Phrases keeps useful English active, Live gives eligible plans human conversation, and Beta Feedback helps us improve the product with you.',
    chips: ['Train', 'Phrases', 'Live', 'Beta Feedback'],
  },
];

export default function BetaOnboarding({ firstName }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const current = steps[step];

  function next() {
    playUISound('tap');
    setStep((value) => Math.min(steps.length - 1, value + 1));
  }

  async function finish() {
    setFinishing(true);

    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Could not complete onboarding.');
      }

      playUISound('complete');
      router.refresh();
    } finally {
      setFinishing(false);
    }
  }

  return (
    <div className={styles.backdrop}>
      <section className={styles.card}>
        <div className={styles.top}>
          <span className={styles.brand}>SPEAK MODE BETA</span>
          <div className={styles.dots}>
            {steps.map((_, index) => (
              <i key={index} className={index <= step ? styles.dotActive : ''} />
            ))}
          </div>
        </div>

        <div className={styles.icon}>{current.icon}</div>
        <span className={styles.eyebrow}>{current.eyebrow}</span>

        <h1>
          {step === 0 ? `Welcome, ${firstName}.` : current.title}
        </h1>

        {step === 0 ? <h2>{current.title}</h2> : null}

        <p>{current.copy}</p>

        <div className={styles.chips}>
          {current.chips.map((chip) => <span key={chip}>{chip}</span>)}
        </div>

        <div className={styles.actions}>
          {step > 0 ? (
            <button
              className={styles.secondary}
              type="button"
              onClick={() => {
                playUISound('tap');
                setStep((value) => value - 1);
              }}
            >
              Back
            </button>
          ) : null}

          {step < steps.length - 1 ? (
            <button className={styles.primary} type="button" onClick={next}>
              Continue →
            </button>
          ) : (
            <button className={styles.primary} type="button" onClick={finish} disabled={finishing}>
              {finishing ? 'Opening Speak Mode…' : 'Start using Speak Mode →'}
            </button>
          )}
        </div>

        <small className={styles.note}>Private beta · Your feedback helps shape the final product.</small>
      </section>
    </div>
  );
}
