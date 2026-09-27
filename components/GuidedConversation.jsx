'use client';

import { useEffect, useRef, useState } from 'react';
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

  if (words.length < 4) {
    return 'Good start. Add one more detail so the other person has something to react to.';
  }

  if (turn === 3 && !text.includes('?')) {
    return 'Strong answer. Add a question at the end to hand the conversation back naturally.';
  }

  if (words.length >= 18) {
    return 'Nice expansion. Your answer gives the conversation room to continue.';
  }

  return 'Clear response. Keep the rhythm natural and say it once more out loud.';
}

function recognitionErrorMessage(code) {
  const messages = {
    'no-speech': 'I did not receive a transcript this time. Your audio recording is still available below.',
    'audio-capture': 'The browser could not use speech recognition, but the audio recorder may still work.',
    'not-allowed': 'Speech recognition permission was blocked. Your recorded audio can still be used when microphone access is allowed.',
    network: 'Live transcription could not reach the browser speech service. Your audio is still being recorded.',
    aborted: '',
  };

  return messages[code] || 'Automatic transcription stopped. Your audio recording is still available.';
}

export default function GuidedConversation({ fullName, mode }) {
  const router = useRouter();
  const scenario = scenarios[mode] || scenarios.START_MODE;
  const firstName = fullName.trim().split(/\s+/)[0] || 'Student';

  const [turn, setTurn] = useState(0);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [listening, setListening] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [micMessage, setMicMessage] = useState('');
  const [speakingSeconds, setSpeakingSeconds] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  const recognitionRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const startedAtRef = useRef(null);
  const createdUrlsRef = useRef([]);
  const transcriptRef = useRef('');

  const prompt = scenario.prompts[turn];

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort?.();
      } catch {}

      if (recorderRef.current?.state === 'recording') {
        try {
          recorderRef.current.stop();
        } catch {}
      }

      streamRef.current?.getTracks?.().forEach((track) => track.stop());
      createdUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  async function startMic() {
    if (listening) return;

    setMicMessage('');
    setAudioUrl('');
    transcriptRef.current = '';
    setInput('');

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setMicMessage('This browser cannot record audio here. You can still type your answer and say it out loud.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      startedAtRef.current = Date.now();

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });

        const duration = Math.max(
          1,
          Math.round((Date.now() - startedAtRef.current) / 1000)
        );

        const url = URL.createObjectURL(blob);
        createdUrlsRef.current.push(url);

        setAudioUrl(url);
        setSpeakingSeconds((value) => value + duration);
        setListening(false);

        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (!transcriptRef.current.trim()) {
          setMicMessage(
            'Audio recorded successfully. Automatic transcription was unavailable for this answer, so you can replay the audio and continue with the voice answer.'
          );
        } else {
          setMicMessage('Audio recorded and transcript captured.');
        }
      };

      recorder.start();
      setListening(true);
      setMicMessage('Recording your answer… Speak naturally in English.');

      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!Recognition) {
        setMicMessage(
          'Recording your answer… This browser does not provide live speech-to-text, so the audio will be saved for replay.'
        );
        return;
      }

      const recognition = new Recognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;

      recognition.onresult = (event) => {
        let finalText = '';
        let interimText = '';

        for (let index = 0; index < event.results.length; index += 1) {
          const result = event.results[index];
          const text = result[0]?.transcript || '';

          if (result.isFinal) {
            finalText += `${text} `;
          } else {
            interimText += `${text} `;
          }
        }

        const combined = `${finalText}${interimText}`.trim();
        transcriptRef.current = combined;
        setInput(combined);
      };

      recognition.onerror = (event) => {
        const message = recognitionErrorMessage(event.error);
        if (message) setMicMessage(message);
      };

      recognition.onend = () => {
        recognitionRef.current = null;

        if (recorderRef.current?.state === 'recording' && !transcriptRef.current.trim()) {
          setMicMessage(
            'Live transcription ended, but your audio is still recording. Press “Stop recording” when you finish.'
          );
        }
      };

      recognition.start();
    } catch {
      setListening(false);
      streamRef.current?.getTracks?.().forEach((track) => track.stop());
      streamRef.current = null;
      setMicMessage(
        'Microphone access was not available. Check the browser microphone permission, or type your answer and practice it out loud.'
      );
    }
  }

  function stopMic() {
    try {
      recognitionRef.current?.stop?.();
    } catch {}

    recognitionRef.current = null;

    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
  }

  async function submitAnswer() {
    if (listening) return;

    const transcript = input.trim();
    const hasVoice = Boolean(audioUrl);

    if (!transcript && !hasVoice) return;

    const entry = {
      prompt,
      answer: transcript || 'Voice answer recorded.',
      audioUrl: hasVoice ? audioUrl : '',
      feedback: transcript
        ? feedbackFor(transcript, turn)
        : 'Your voice answer was recorded. Replay it once and listen for clarity, rhythm, and whether you fully answered the prompt.',
    };

    setHistory((current) => [...current, entry]);
    setInput('');
    setAudioUrl('');
    setMicMessage('');
    transcriptRef.current = '';

    if (turn < scenario.prompts.length - 1) {
      const nextTurn = turn + 1;
      setTurn(nextTurn);
      window.setTimeout(() => say(scenario.prompts[nextTurn]), 250);
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/training-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_key: 'speak-lab-01',
          speaking_seconds: speakingSeconds,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Could not save speaking progress.');
      }

      setFinished(true);
      router.refresh();
    } catch (error) {
      setMicMessage(error.message || 'Could not save speaking progress.');
    } finally {
      setSaving(false);
    }
  }

  function resetPractice() {
    setTurn(0);
    setInput('');
    setHistory([]);
    setAudioUrl('');
    setMicMessage('');
    setSpeakingSeconds(0);
    setFinished(false);
    transcriptRef.current = '';
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
            <button onClick={resetPractice}>Practice again</button>
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
        <p>
          Speak naturally. Speak Mode will try to transcribe your English while it also records the audio.
          If live transcription fails, you can replay the recording and continue with the voice answer.
        </p>
      </header>

      <section className={styles.room}>
        <div className={styles.turnLabel}>
          TURN {turn + 1} / {scenario.prompts.length}
        </div>

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
            onChange={(event) => {
              setInput(event.target.value);
              transcriptRef.current = event.target.value;
            }}
            placeholder="Your transcript will appear here when speech-to-text is available. You can also type or edit it."
          />

          {audioUrl ? (
            <div className={styles.audioCard}>
              <div>
                <span>VOICE ANSWER RECORDED</span>
                <small>Replay your answer before sending it.</small>
              </div>
              <audio controls src={audioUrl} />
            </div>
          ) : null}

          <div className={styles.controls}>
            {listening ? (
              <button className={styles.stop} onClick={stopMic}>
                ■ Stop recording
              </button>
            ) : (
              <button className={styles.mic} onClick={startMic}>
                🎙 Speak answer
              </button>
            )}

            <button
              className={styles.send}
              disabled={listening || (!input.trim() && !audioUrl) || saving}
              onClick={submitAnswer}
            >
              {saving
                ? 'Saving…'
                : turn === scenario.prompts.length - 1
                  ? 'Finish conversation'
                  : 'Send answer →'}
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
              {entry.audioUrl ? (
                <audio className={styles.historyAudio} controls src={entry.audioUrl} />
              ) : null}
              <p>{entry.feedback}</p>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
