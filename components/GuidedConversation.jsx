'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './GuidedConversation.module.css';

const scenarios = {
  START_MODE: {
    label: 'START MODE',
    title: 'Meet Someone New',
    prompts: [
      'Hi! Nice to meet you. What’s your name?',
      'Where are you from?',
      'What do you do?',
      'Great. Ask me one simple question before we finish.',
    ],
  },
  RESPONSE_MODE: {
    label: 'RESPONSE MODE',
    title: 'Quick Everyday Conversation',
    prompts: [
      'Hey! How’s your day going?',
      'What have you been working on today?',
      'What do you usually do after work?',
      'Nice. Ask me one question back.',
    ],
  },
  CONVERSATION_MODE: {
    label: 'CONVERSATION MODE',
    title: 'Keep It Going',
    prompts: [
      'I just got back from a short trip. How would you respond?',
      'It was great. I spent most of the time near the beach. What would you ask next?',
      'The food was probably my favorite part. Tell me about a trip or place you enjoyed.',
      'Before we finish, ask one follow-up question about my trip.',
    ],
  },
  FLUENCY_MODE: {
    label: 'FLUENCY MODE',
    title: 'React & Expand',
    prompts: [
      'I’ve been thinking about working remotely for a few months. What do you think?',
      'The flexibility sounds great, but I’m worried about losing focus. How would you react?',
      'What environment helps you do your best work?',
      'Wrap up your view and ask me one natural question.',
    ],
  },
  NATIVE_FLOW: {
    label: 'NATIVE FLOW',
    title: 'Nuance & Spontaneity',
    prompts: [
      'I think AI is going to change the way most people work faster than we expect. What’s your take?',
      'That makes sense. Which part of that change do you think people are underestimating?',
      'If you could redesign one part of your current workflow with AI, what would you change?',
      'Before we wrap up, challenge one of my ideas or ask me a nuanced follow-up question.',
    ],
  },
};

function say(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.98;

  const voices = window.speechSynthesis.getVoices();
  const voice =
    voices.find((item) => item.lang === 'en-US') ||
    voices.find((item) => item.lang?.startsWith('en'));

  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

function feedbackFor(text, turn) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length < 4) return 'Good start. Add one more detail so the other person has something to react to.';
  if (turn === 3 && !text.includes('?')) return 'Strong answer. Add a question at the end to hand the conversation back naturally.';
  if (words.length >= 18) return 'Nice expansion. Your answer gives the conversation room to continue.';
  return 'Clear response. Keep the rhythm natural and say it once more out loud.';
}

export default function GuidedConversation({ fullName, mode }) {
  const router = useRouter();
  const scenario = scenarios[mode] || scenarios.START_MODE;
  const firstName = fullName.trim().split(/\s+/)[0] || 'Student';

  const [turn, setTurn] = useState(0);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [listening, setListening] = useState(false);
  const [micMessage, setMicMessage] = useState('');
  const [speakingSeconds, setSpeakingSeconds] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const recognitionRef = useRef(null);
  const startedAtRef = useRef(null);

  const prompt = scenario.prompts[turn];

  function startMic() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      setMicMessage('Voice recognition is unavailable in this browser. Type your answer and say it out loud before sending.');
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;
    startedAtRef.current = Date.now();
    setMicMessage('');

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      let transcript = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }
      setInput(transcript.trim());
    };

    recognition.onerror = () => {
      setMicMessage('I could not capture that clearly. Try again or type your answer.');
    };

    recognition.onend = () => {
      setListening(false);
      if (startedAtRef.current) {
        const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
        setSpeakingSeconds((value) => value + duration);
      }
    };

    recognition.start();
  }

  function stopMic() {
    recognitionRef.current?.stop();
  }

  async function submitAnswer() {
    const answer = input.trim();
    if (!answer) return;

    const entry = {
      prompt,
      answer,
      feedback: feedbackFor(answer, turn),
    };

    setHistory((current) => [...current, entry]);
    setInput('');

    if (turn < scenario.prompts.length - 1) {
      const nextTurn = turn + 1;
      setTurn(nextTurn);
      window.setTimeout(() => say(scenario.prompts[nextTurn]), 250);
      return;
    }

    setSaving(true);
    try {
      await fetch('/api/training-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module_key: mode.toLowerCase(),
          session_key: 'speak-lab-01',
          completion_percent: 100,
          speaking_seconds: speakingSeconds,
          xp: 50,
        }),
      });
      setFinished(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (finished) {
    return (
      <div className={styles.wrap}>
        <section className={styles.complete}>
          <div className={styles.completeIcon}>✓</div>
          <span>GUIDED CONVERSATION COMPLETE</span>
          <h1>Nice work, {firstName}.</h1>
          <p>You completed four conversation turns and earned +50 Speaking XP.</p>
          <div className={styles.completeActions}>
            <button onClick={() => router.push('/dashboard')}>Back to dashboard</button>
            <button onClick={() => {
              setTurn(0);
              setHistory([]);
              setFinished(false);
              setSpeakingSeconds(0);
            }}>Practice again</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <span>{scenario.label} · GUIDED CONVERSATION</span>
        <h1>{scenario.title}</h1>
        <p>Use the microphone when available. You can type as a fallback and still practice the answer out loud.</p>
      </header>

      <section className={styles.room}>
        <div className={styles.turnLabel}>TURN {turn + 1} / {scenario.prompts.length}</div>

        <div className={styles.coachBubble}>
          <div className={styles.coachAvatar}>SM</div>
          <div>
            <small>SPEAK MODE</small>
            <p>{prompt}</p>
            <button onClick={() => say(prompt)}>▶ Hear prompt</button>
          </div>
        </div>

        <div className={styles.responseBox}>
          <textarea
            rows={5}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Your answer will appear here…"
          />

          <div className={styles.controls}>
            {listening ? (
              <button className={styles.stop} onClick={stopMic}>■ Stop listening</button>
            ) : (
              <button className={styles.mic} onClick={startMic}>🎙 Speak answer</button>
            )}
            <button className={styles.send} disabled={!input.trim() || saving} onClick={submitAnswer}>
              {saving ? 'Saving…' : turn === scenario.prompts.length - 1 ? 'Finish conversation' : 'Send answer →'}
            </button>
          </div>

          {micMessage ? <p className={styles.micMessage}>{micMessage}</p> : null}
        </div>
      </section>

      {history.length ? (
        <section className={styles.history}>
          <span>YOUR CONVERSATION</span>
          {history.map((entry, index) => (
            <article key={index}>
              <small>{entry.prompt}</small>
              <strong>{entry.answer}</strong>
              <p>{entry.feedback}</p>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
