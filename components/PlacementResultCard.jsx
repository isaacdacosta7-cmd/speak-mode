'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PlacementResultCard.module.css';

function readableMode(mode) {
  return {
    START_MODE: 'START MODE',
    RESPONSE_MODE: 'RESPONSE MODE',
    CONVERSATION_MODE: 'CONVERSATION MODE',
    FLUENCY_MODE: 'FLUENCY MODE',
    NATIVE_FLOW: 'NATIVE FLOW',
  }[mode] || 'PLACEMENT MODE';
}

function resultCopy(mode) {
  return {
    START_MODE: 'Build your first automatic conversation patterns and essential responses.',
    RESPONSE_MODE: 'Turn the English you already know into faster, more automatic responses.',
    CONVERSATION_MODE: 'Keep conversations moving with reactions, questions and stories.',
    FLUENCY_MODE: 'Develop more natural rhythm, faster processing and flexible conversational language.',
    NATIVE_FLOW: 'Work on nuance, precision, personality and advanced conversational control.',
  }[mode] || 'Your Speak Mode path is ready.';
}

function fillRoundedRect(ctx, x, y, width, height, radius, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

export default function PlacementResultCard({ fullName, result }) {
  const router = useRouter();
  const [working, setWorking] = useState(false);

  const breakdown = [
    ['LISTENING', result.listening_score, 35],
    ['REACTION', result.reaction_score, 25],
    ['REAL ENGLISH', result.real_english_score, 20],
    ['WRITING', result.writing_score, 20],
  ];

  async function createResultImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1500;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f5f5ef';
    ctx.fillRect(0, 0, 1200, 1500);

    ctx.fillStyle = '#6570ff';
    ctx.beginPath();
    ctx.arc(1085, 115, 220, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d8ff59';
    ctx.beginPath();
    ctx.arc(70, 1400, 220, 0, Math.PI * 2);
    ctx.fill();

    fillRoundedRect(ctx, 90, 100, 1020, 1300, 48, '#ffffff');

    ctx.fillStyle = '#111318';
    ctx.font = '900 48px Arial';
    ctx.fillText('SPEAK MODE', 150, 190);

    ctx.fillStyle = '#6570ff';
    ctx.font = '900 24px Arial';
    ctx.fillText('PLACEMENT RESULT', 150, 235);

    ctx.fillStyle = '#686d75';
    ctx.font = '700 28px Arial';
    ctx.fillText(fullName, 150, 330);

    ctx.fillStyle = '#111318';
    ctx.font = '900 190px Arial';
    ctx.fillText(String(result.total_score), 150, 570);

    ctx.fillStyle = '#777b83';
    ctx.font = '700 30px Arial';
    ctx.fillText('/ 100', 470, 565);

    ctx.fillStyle = '#111318';
    ctx.font = '900 56px Arial';
    ctx.fillText(readableMode(result.placement_mode), 150, 690);

    let y = 820;
    breakdown.forEach(([label, value, max]) => {
      ctx.fillStyle = '#777b83';
      ctx.font = '800 22px Arial';
      ctx.fillText(label, 150, y);

      ctx.fillStyle = '#111318';
      ctx.font = '900 28px Arial';
      ctx.fillText(`${value}/${max}`, 850, y);

      fillRoundedRect(ctx, 150, y + 25, 820, 16, 8, '#e7e8e1');
      fillRoundedRect(ctx, 150, y + 25, 820 * (value / max), 16, 8, '#6570ff');

      y += 120;
    });

    ctx.fillStyle = '#111318';
    ctx.font = '800 23px Arial';
    ctx.fillText('Isaac Delgado · Teacher', 150, 1305);

    ctx.fillStyle = '#777b83';
    ctx.font = '600 20px Arial';
    ctx.fillText('Speak Mode · Conversation is a skill. Train it.', 150, 1345);

    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  }

  async function download() {
    setWorking(true);
    try {
      const blob = await createResultImage();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `speak-mode-${fullName.toLowerCase().replace(/\s+/g, '-')}-result.png`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setWorking(false);
    }
  }

  async function share() {
    setWorking(true);
    try {
      const blob = await createResultImage();
      if (!blob) return;
      const file = new File([blob], 'speak-mode-result.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'Speak Mode Placement Result',
          text: `${fullName} · ${readableMode(result.placement_mode)} · ${result.total_score}/100`,
          files: [file],
        });
      } else {
        await download();
      }
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <span>PLACEMENT RESULT</span>
        <h1>{readableMode(result.placement_mode)}</h1>
        <p>{resultCopy(result.placement_mode)}</p>
      </header>

      <section className={styles.card}>
        <div className={styles.student}>
          <div>
            <small>STUDENT</small>
            <strong>{fullName}</strong>
          </div>
          <div className={styles.score}>
            <strong>{result.total_score}</strong>
            <span>/100</span>
          </div>
        </div>

        <div className={styles.breakdown}>
          {breakdown.map(([label, value, max]) => (
            <div className={styles.row} key={label}>
              <div>
                <span>{label}</span>
                <strong>{value}/{max}</strong>
              </div>
              <div className={styles.track}>
                <i style={{ width: `${Math.round((value / max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.primary} onClick={() => router.push('/train')}>Go to my training</button>
          <button className={styles.secondary} onClick={share} disabled={working}>Share result image</button>
          <button className={styles.secondary} onClick={download} disabled={working}>
            {working ? 'Generating…' : 'Save corrected image'}
          </button>
        </div>

        <p className={styles.teacher}>Isaac Delgado · Teacher</p>
      </section>
    </div>
  );
}
