'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PlacementTest.module.css';

const LOGO_MAIN = 'https://i.imgur.com/Yc4jFBe.png';
const LOGO_SECONDARY = 'https://i.imgur.com/2oEF4No.png';

const listeningQuestions = [
  {
    id: 'l1',
    prompt: 'What time will the speaker probably arrive?',
    choices: [
      ['Around 6:45', 'a'],
      ['Around 7:15', 'b'],
      ['Around 7:50', 'c'],
    ],
    correct: 'b',
    weight: 7,
  },
  {
    id: 'l2',
    prompt: 'What should the other person do first?',
    choices: [
      ['Order dinner', 'a'],
      ['Wait outside', 'b'],
      ['Get a table near the window', 'c'],
    ],
    correct: 'c',
    weight: 7,
  },
  {
    id: 'l3',
    prompt: 'Why is the speaker very hungry?',
    choices: [
      ["They haven't eaten all day", 'a'],
      ['They just finished exercising', 'b'],
      ['Dinner was cancelled', 'c'],
    ],
    correct: 'a',
    weight: 7,
  },
  {
    id: 'l4',
    prompt: 'How often does the second speaker go to the office now?',
    choices: [
      ['Every day', 'a'],
      ['Three times a week', 'b'],
      ['Once a month', 'c'],
    ],
    correct: 'b',
    weight: 7,
  },
  {
    id: 'l5',
    prompt: 'Which part of going to the office does the speaker dislike?',
    choices: [
      ['Seeing coworkers', 'a'],
      ['Working in person', 'b'],
      ['The commute', 'c'],
    ],
    correct: 'c',
    weight: 7,
  },
];

const reactionQuestions = [
  {
    id: 'r1',
    prompt: '"Hey! How’s it going?"',
    choices: [
      ['Pretty good, just a bit tired. You?', 'a'],
      ['I am going to my house.', 'b'],
      ['My name is Laura.', 'c'],
    ],
    correct: 'a',
    weight: 5,
  },
  {
    id: 'r2',
    prompt: '"Do you mind if I sit here?"',
    choices: [
      ['Yes, I am sitting.', 'a'],
      ['Go ahead.', 'b'],
      ['I don’t know where.', 'c'],
    ],
    correct: 'b',
    weight: 5,
  },
  {
    id: 'r3',
    prompt: '"I haven’t seen you in ages!"',
    choices: [
      ['I know! It’s been forever.', 'a'],
      ['I saw you tomorrow.', 'b'],
      ['I have 28 years.', 'c'],
    ],
    correct: 'a',
    weight: 5,
  },
  {
    id: 'r4',
    prompt: '"So, what do you do?"',
    choices: [
      ['I do every day.', 'a'],
      ['I run a small business.', 'b'],
      ['I’m doing good.', 'c'],
    ],
    correct: 'b',
    weight: 5,
  },
  {
    id: 'r5',
    prompt: '"Could you give me a hand with this?"',
    choices: [
      ['Sure. What do you need?', 'a'],
      ['My hand is here.', 'b'],
      ['I have two hands.', 'c'],
    ],
    correct: 'a',
    weight: 5,
  },
];

const naturalQuestions = [
  {
    id: 'n1',
    prompt: 'Someone says: “I’ll get back to you.” What do they mean?',
    choices: [
      ['I’ll contact you later.', 'a'],
      ['I’m going back home.', 'b'],
      ['Stand behind me.', 'c'],
    ],
    correct: 'a',
    weight: 4,
  },
  {
    id: 'n2',
    prompt: '“That works for me.” usually means…',
    choices: [
      ['I have a job.', 'a'],
      ['That plan or time is fine for me.', 'b'],
      ['I need to work now.', 'c'],
    ],
    correct: 'b',
    weight: 4,
  },
  {
    id: 'n3',
    prompt: 'You didn’t understand the last sentence. Which response sounds natural?',
    choices: [
      ['I didn’t catch that. Could you say it again?', 'a'],
      ['Repeat the phrase immediately.', 'b'],
      ['I am not listening your words.', 'c'],
    ],
    correct: 'a',
    weight: 4,
  },
  {
    id: 'n4',
    prompt: 'A friend asks: “What have you been up to?” They want to know…',
    choices: [
      ['What you have been doing lately.', 'a'],
      ['How tall you are.', 'b'],
      ['Where you are standing.', 'c'],
    ],
    correct: 'a',
    weight: 4,
  },
  {
    id: 'n5',
    prompt: 'You want to correct one detail politely. Which opening sounds natural?',
    choices: [
      ['Actually, it was on Thursday.', 'a'],
      ['In actuality of Thursday.', 'b'],
      ['Realmente of Thursday.', 'c'],
    ],
    correct: 'a',
    weight: 4,
  },
];

const writingQuestions = [
  {
    id: 'w1',
    title: 'Natural correction',
    prompt: 'Rewrite this naturally in English: “I have 32 years.”',
    placeholder: 'Type your sentence…',
  },
  {
    id: 'w2',
    title: 'Real-life message',
    prompt: 'You are about 20 minutes late. Write one short message to the person waiting for you.',
    placeholder: 'Write a natural message…',
  },
  {
    id: 'w3',
    title: 'Keep the conversation moving',
    prompt: 'Ask someone what they have been working on lately.',
    placeholder: 'Write your question…',
  },
  {
    id: 'w4',
    title: 'Quick response',
    prompt: 'Reply naturally: “Do you mind if I sit here?”',
    placeholder: 'Write your reply…',
  },
  {
    id: 'w5',
    title: 'Polite correction',
    prompt: 'Someone says the meeting is Friday. You know it is Thursday. Correct the detail politely.',
    placeholder: 'Write your reply…',
  },
];

const clips = [
  "Hey, I’m running a little late. I should be there around seven fifteen. If you get there first, just grab us a table near the window. I haven’t eaten all day, so I’m starving.",
  "I used to work from home every day, but now I go into the office three times a week. Honestly, I thought I’d hate it, but I actually like seeing people again. The commute is the only part I could live without.",
];

const steps = ['intro', 'listening', 'reaction', 'natural', 'writing', 'results'];

function shuffle(array) {
  const copy = [...array];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function normalize(value = '') {
  return value
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9'\s:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreWriting(answers) {
  let score = 0;

  const w1 = normalize(answers.w1);
  if (/\b(i am|i'm) 32( years old)?\b/.test(w1)) score += 4;
  else if (w1.includes('32') && (w1.includes('year') || w1.includes('old'))) score += 2;

  const w2 = normalize(answers.w2);
  if (w2.includes('sorry')) score += 1;
  if (w2.includes('late')) score += 1;
  if (w2.includes('20') || w2.includes('twenty') || w2.includes('minute')) score += 1;
  if (
    w2.includes('be there') ||
    w2.includes('arrive') ||
    w2.includes('get there') ||
    w2.includes('on my way')
  ) score += 1;

  const w3 = normalize(answers.w3);
  if (w3.includes('what')) score += 1;
  if (w3.includes('you')) score += 1;
  if (w3.includes('working')) score += 1;
  if (w3.includes('lately') || w3.includes('recently')) score += 1;

  const w4 = normalize(answers.w4);
  if (
    w4.includes('go ahead') ||
    w4.includes('not at all') ||
    w4.includes('of course') ||
    w4.includes('feel free') ||
    /^sure\b/.test(w4)
  ) score += 4;
  else if (w4.length >= 3) score += 1;

  const w5 = normalize(answers.w5);
  if (w5.includes('actually')) score += 1;
  if (w5.includes('thursday')) score += 2;
  if (w5.includes("it's") || w5.includes('it is') || w5.includes('meeting')) score += 1;

  return Math.min(20, score);
}

function readableMode(mode) {
  const labels = {
    START_MODE: 'START MODE',
    RESPONSE_MODE: 'RESPONSE MODE',
    CONVERSATION_MODE: 'CONVERSATION MODE',
    FLUENCY_MODE: 'FLUENCY MODE',
    NATIVE_FLOW: 'NATIVE FLOW',
  };

  return labels[mode] || 'PLACEMENT MODE';
}

function resultCopy(mode) {
  const copy = {
    START_MODE: 'Build your first automatic conversation patterns and essential responses.',
    RESPONSE_MODE: 'Turn the English you already know into faster, more automatic responses.',
    CONVERSATION_MODE: 'Learn to keep conversations moving through follow-up questions, stories and reactions.',
    FLUENCY_MODE: 'Develop more natural rhythm, faster processing and flexible conversational language.',
    NATIVE_FLOW: 'Work on nuance, precision, personality, advanced reactions and high-level conversation.',
  };

  return copy[mode] || 'Your Speak Mode path is ready.';
}

export default function PlacementTest({ fullName, previousScore, previousMode }) {
  const router = useRouter();
  const [step, setStep] = useState('intro');
  const [answers, setAnswers] = useState({});
  const [writing, setWriting] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [started, setStarted] = useState(false);
  const [plays, setPlays] = useState([0, 0]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [result, setResult] = useState(null);
  const submittedRef = useRef(false);

  const sections = useMemo(() => ({
    listening: listeningQuestions.map((question) => ({
      ...question,
      choices: shuffle(question.choices),
    })),
    reaction: reactionQuestions.map((question) => ({
      ...question,
      choices: shuffle(question.choices),
    })),
    natural: naturalQuestions.map((question) => ({
      ...question,
      choices: shuffle(question.choices),
    })),
  }), []);

  useEffect(() => {
    if (!started || step === 'results' || secondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [started, step, secondsLeft]);

  useEffect(() => {
    if (started && secondsLeft === 0 && !result && !submittedRef.current) {
      finishTest();
    }
  });

  const formatTime = (value) => {
    const minutes = Math.floor(value / 60).toString().padStart(2, '0');
    const seconds = (value % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const go = (next) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(next);
  };

  const playClip = (index) => {
    if (plays[index] >= 2 || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clips[index]);
    utterance.lang = 'en-US';
    utterance.rate = 1.02;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((voice) => voice.lang === 'en-US') ||
      voices.find((voice) => voice.lang?.startsWith('en'));

    if (preferred) utterance.voice = preferred;

    window.speechSynthesis.speak(utterance);
    setPlays((current) => current.map((value, itemIndex) => (
      itemIndex === index ? value + 1 : value
    )));
  };

  const scoreSection = (questions) => (
    questions.reduce(
      (sum, question) => sum + (answers[question.id] === question.correct ? question.weight : 0),
      0
    )
  );

  const finishTest = async () => {
    if (submittedRef.current) return;

    submittedRef.current = true;
    setSaving(true);
    setSaveError('');

    const breakdown = {
      listening_score: scoreSection(listeningQuestions),
      reaction_score: scoreSection(reactionQuestions),
      real_english_score: scoreSection(naturalQuestions),
      writing_score: scoreWriting(writing),
    };

    try {
      const response = await fetch('/api/placement-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(breakdown),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Could not save your result.');
      }

      setResult({
        ...payload,
        breakdown,
      });
      setStep('results');
      router.refresh();
    } catch (error) {
      submittedRef.current = false;
      setSaveError(error.message || 'Could not save your result.');
    } finally {
      setSaving(false);
    }
  };

  const createResultImage = async () => {
    if (!result) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1500;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f5f5ef';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#6570ff';
    ctx.beginPath();
    ctx.arc(1080, 120, 230, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d8ff59';
    ctx.beginPath();
    ctx.arc(80, 1360, 250, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(90, 100, 1020, 1300, 48);
    ctx.fill();

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

    const items = [
      ['LISTENING', result.breakdown.listening_score, 35],
      ['REACTION', result.breakdown.reaction_score, 25],
      ['REAL ENGLISH', result.breakdown.real_english_score, 20],
      ['WRITING', result.breakdown.writing_score, 20],
    ];

    let y = 820;
    items.forEach(([label, value, max]) => {
      ctx.fillStyle = '#777b83';
      ctx.font = '800 22px Arial';
      ctx.fillText(label, 150, y);

      ctx.fillStyle = '#111318';
      ctx.font = '900 28px Arial';
      ctx.fillText(`${value}/${max}`, 850, y);

      ctx.fillStyle = '#e7e8e1';
      ctx.beginPath();
      ctx.roundRect(150, y + 25, 820, 16, 8);
      ctx.fill();

      ctx.fillStyle = '#6570ff';
      ctx.beginPath();
      ctx.roundRect(150, y + 25, 820 * (value / max), 16, 8);
      ctx.fill();

      y += 120;
    });

    ctx.fillStyle = '#111318';
    ctx.font = '800 23px Arial';
    ctx.fillText('Isaac Delgado · Teacher', 150, 1305);

    ctx.fillStyle = '#777b83';
    ctx.font = '600 20px Arial';
    ctx.fillText('Speak Mode · Conversation is a skill. Train it.', 150, 1345);

    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  };

  const downloadResultImage = async () => {
    const blob = await createResultImage();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `speak-mode-${fullName.toLowerCase().replace(/\s+/g, '-')}-result.png`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const shareResultImage = async () => {
    const blob = await createResultImage();
    if (!blob) return;

    const file = new File([blob], 'speak-mode-result.png', { type: 'image/png' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: 'Speak Mode Placement Result',
        text: `${fullName} · ${readableMode(result.placement_mode)} · ${result.total_score}/100`,
        files: [file],
      });
      return;
    }

    downloadResultImage();
  };

  const renderQuestion = (question) => (
    <div className={styles.question} key={question.id}>
      <p className={styles.questionText}>{question.prompt}</p>
      <div className={styles.choices}>
        {question.choices.map(([label, value]) => {
          const selected = answers[question.id] === value;

          return (
            <button
              type="button"
              key={value}
              className={`${styles.choice} ${selected ? styles.selected : ''}`}
              onClick={() => setAnswers((current) => ({ ...current, [question.id]: value }))}
            >
              <span className={styles.choiceDot}>{selected ? '✓' : ''}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const sectionAnswered = (questions) => questions.every((question) => Boolean(answers[question.id]));
  const writingComplete = writingQuestions.every((question) => (writing[question.id] || '').trim().length >= 2);
  const progressIndex = Math.max(0, steps.indexOf(step));
  const progress = Math.min(100, Math.round((progressIndex / (steps.length - 1)) * 100));

  return (
    <div className={styles.shell}>
      <div className={styles.testTopbar}>
        <div className={styles.logos}>
          <img src={LOGO_MAIN} alt="Speak Mode" className={styles.mainLogo} />
          <span className={styles.logoDivider} />
          <img src={LOGO_SECONDARY} alt="Speak Mode partner" className={styles.secondaryLogo} />
        </div>

        {started && step !== 'results' ? (
          <div className={styles.timer}>{formatTime(secondsLeft)}</div>
        ) : null}
      </div>

      <div className={styles.progressTrack}>
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      </div>

      {step === 'intro' ? (
        <section className={`${styles.card} ${styles.hero}`}>
          <div className={styles.eyebrow}>15-MINUTE PLACEMENT TEST</div>
          <h1>Let’s find your <span>Speak Mode.</span></h1>
          <p className={styles.lead}>
            This check measures listening, quick reactions, real conversational English and writing.
            Your result will unlock the training path that matches your current level.
          </p>

          <div className={styles.studentStrip}>
            <span>STUDENT</span>
            <strong>{fullName}</strong>
            {previousScore !== null ? (
              <small>Current result: {previousScore}/100 · {readableMode(previousMode)}</small>
            ) : (
              <small>Your first placement result is waiting.</small>
            )}
          </div>

          <div className={styles.metricRow}>
            <div><b>15</b><span>minutes</span></div>
            <div><b>4</b><span>skills</span></div>
            <div><b>100</b><span>points</span></div>
          </div>

          <button
            className={styles.primary}
            type="button"
            onClick={() => {
              setStarted(true);
              setSecondsLeft(15 * 60);
              go('listening');
            }}
          >
            {previousScore !== null ? 'Retake placement test' : 'Start my placement test'}
          </button>

          <p className={styles.micro}>
            Use headphones if possible. Your multiple-choice answers are presented in a mixed order.
          </p>
        </section>
      ) : null}

      {step === 'listening' ? (
        <section className={styles.card}>
          <div className={styles.sectionHead}>
            <span>01</span>
            <div><p>LISTENING · 35 POINTS</p><h2>Catch the message.</h2></div>
          </div>
          <p className={styles.instruction}>Each clip can be played twice. Focus on meaning and details.</p>

          <div className={styles.audioCard}>
            <div><small>CLIP 1</small><strong>Late for dinner</strong></div>
            <button className={styles.audioButton} onClick={() => playClip(0)} disabled={plays[0] >= 2}>
              {plays[0] >= 2 ? '2/2 plays used' : `▶ Play audio · ${plays[0]}/2`}
            </button>
          </div>

          {sections.listening.slice(0, 3).map(renderQuestion)}

          <div className={`${styles.audioCard} ${styles.secondAudio}`}>
            <div><small>CLIP 2</small><strong>Back at the office</strong></div>
            <button className={styles.audioButton} onClick={() => playClip(1)} disabled={plays[1] >= 2}>
              {plays[1] >= 2 ? '2/2 plays used' : `▶ Play audio · ${plays[1]}/2`}
            </button>
          </div>

          {sections.listening.slice(3).map(renderQuestion)}

          <button
            className={styles.primary}
            disabled={!sectionAnswered(listeningQuestions)}
            onClick={() => go('reaction')}
          >
            Continue
          </button>
        </section>
      ) : null}

      {step === 'reaction' ? (
        <section className={styles.card}>
          <div className={styles.sectionHead}>
            <span>02</span>
            <div><p>REACTION · 25 POINTS</p><h2>What would you say?</h2></div>
          </div>
          <p className={styles.instruction}>
            Choose the response that feels most natural in a real conversation. Trust your first reaction.
          </p>

          {sections.reaction.map(renderQuestion)}

          <button
            className={styles.primary}
            disabled={!sectionAnswered(reactionQuestions)}
            onClick={() => go('natural')}
          >
            Continue
          </button>
        </section>
      ) : null}

      {step === 'natural' ? (
        <section className={styles.card}>
          <div className={styles.sectionHead}>
            <span>03</span>
            <div><p>REAL ENGLISH · 20 POINTS</p><h2>Understand the phrase.</h2></div>
          </div>
          <p className={styles.instruction}>
            Pick the meaning or response that fits everyday conversational English.
          </p>

          {sections.natural.map(renderQuestion)}

          <button
            className={styles.primary}
            disabled={!sectionAnswered(naturalQuestions)}
            onClick={() => go('writing')}
          >
            Continue to writing
          </button>
        </section>
      ) : null}

      {step === 'writing' ? (
        <section className={styles.card}>
          <div className={styles.sectionHead}>
            <span>04</span>
            <div><p>WRITING · 20 POINTS</p><h2>Write like you would speak.</h2></div>
          </div>
          <p className={styles.instruction}>
            Keep your answers short and natural. These tasks measure the English you can produce on your own.
          </p>

          <div className={styles.writingList}>
            {writingQuestions.map((question, index) => (
              <label className={styles.writingCard} key={question.id}>
                <span className={styles.writingNumber}>0{index + 1}</span>
                <div>
                  <small>{question.title}</small>
                  <p>{question.prompt}</p>
                  <textarea
                    value={writing[question.id] || ''}
                    onChange={(event) => setWriting((current) => ({
                      ...current,
                      [question.id]: event.target.value,
                    }))}
                    placeholder={question.placeholder}
                    rows={3}
                    maxLength={240}
                  />
                </div>
              </label>
            ))}
          </div>

          {saveError ? <div className={styles.notice}>{saveError}</div> : null}

          <button
            className={styles.primary}
            disabled={!writingComplete || saving}
            onClick={finishTest}
          >
            {saving ? 'Calculating your Speak Mode…' : 'Finish and see my result'}
          </button>
        </section>
      ) : null}

      {step === 'results' && result ? (
        <section className={`${styles.card} ${styles.resultCard}`}>
          <div className={styles.eyebrow}>YOUR SPEAK MODE IS READY</div>
          <p className={styles.hello}>Placement complete, {fullName}.</p>

          <div className={styles.scoreCircle}>
            <strong>{result.total_score}</strong>
            <span>/100</span>
          </div>

          <h1 className={styles.resultLevel}>{readableMode(result.placement_mode)}</h1>
          <p className={styles.resultNote}>{resultCopy(result.placement_mode)}</p>

          <div className={styles.scoreGrid}>
            <div><span>Listening</span><b>{result.breakdown.listening_score}/35</b></div>
            <div><span>Reaction</span><b>{result.breakdown.reaction_score}/25</b></div>
            <div><span>Real English</span><b>{result.breakdown.real_english_score}/20</b></div>
            <div><span>Writing</span><b>{result.breakdown.writing_score}/20</b></div>
          </div>

          <div className={styles.nextBox}>
            <small>NEXT STEP</small>
            <h3>Your training path is unlocked.</h3>
            <p>
              Your dashboard and Train area can now use this result to show the right conversation practice.
            </p>
          </div>

          <div className={styles.resultActions}>
            <button className={styles.primary} onClick={() => router.push('/train')}>
              Start my training
            </button>
            <button className={styles.secondary} onClick={shareResultImage}>
              Share result image
            </button>
            <button className={styles.secondary} onClick={downloadResultImage}>
              Save result image
            </button>
          </div>

          <p className={styles.teacher}>Isaac Delgado · Teacher</p>
        </section>
      ) : null}

      <footer className={styles.footer}>
        <span>Speak Mode</span>
        <span>Isaac Delgado · Teacher</span>
      </footer>
    </div>
  );
}
