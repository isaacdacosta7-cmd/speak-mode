'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './GuidedConversation.module.css';

let localWhisperPromise = null;

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

function preferredMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';

  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported?.(type)) || '';
}

async function decodeAndResample(blob) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass || typeof OfflineAudioContext === 'undefined') {
    throw new Error('This browser cannot prepare audio for local transcription.');
  }

  const context = new AudioContextClass();

  try {
    const buffer = await blob.arrayBuffer();
    const decoded = await context.decodeAudioData(buffer.slice(0));
    const targetRate = 16000;
    const frameCount = Math.max(1, Math.ceil(decoded.duration * targetRate));
    const offline = new OfflineAudioContext(1, frameCount, targetRate);
    const source = offline.createBufferSource();

    source.buffer = decoded;
    source.connect(offline.destination);
    source.start(0);

    const rendered = await offline.startRendering();
    return new Float32Array(rendered.getChannelData(0));
  } finally {
    try {
      await context.close();
    } catch {}
  }
}

async function getLocalWhisper(onProgress) {
  if (!localWhisperPromise) {
    localWhisperPromise = (async () => {
      const { pipeline, env } = await import('@huggingface/transformers');

      env.allowLocalModels = false;
      env.useBrowserCache = true;

      return pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny.en',
        {
          progress_callback: (event) => {
            if (typeof onProgress !== 'function') return;

            if (event?.status === 'progress' && Number.isFinite(event.progress)) {
              onProgress(Math.round(event.progress));
            } else if (event?.status === 'ready') {
              onProgress(100);
            }
          },
        }
      );
    })().catch((error) => {
      localWhisperPromise = null;
      throw error;
    });
  }

  return localWhisperPromise;
}

async function transcribeLocally(blob, setMessage) {
  setMessage('Preparing local English transcription…');

  const audio = await decodeAndResample(blob);

  const transcriber = await getLocalWhisper((progress) => {
    if (progress > 0 && progress < 100) {
      setMessage(`Preparing local transcription model… ${progress}%`);
    }
  });

  setMessage('Transcribing locally on this device…');

  const output = await transcriber(audio, {
    chunk_length_s: 30,
    stride_length_s: 5,
    language: 'english',
    task: 'transcribe',
  });

  const text = Array.isArray(output)
    ? output.map((item) => item?.text || '').join(' ').trim()
    : output?.text?.trim();

  if (!text) {
    throw new Error('I could not detect enough English speech in that recording.');
  }

  return text;
}

export default function GuidedConversation({ fullName, mode }) {
  const router = useRouter();
  const scenario = scenarios[mode] || scenarios.START_MODE;
  const firstName = fullName.trim().split(/\s+/)[0] || 'Student';

  const [turn, setTurn] = useState(0);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [micMessage, setMicMessage] = useState('');
  const [speakingSeconds, setSpeakingSeconds] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const startedAtRef = useRef(null);
  const autoStopRef = useRef(null);

  const prompt = scenario.prompts[turn];

  useEffect(() => {
    return () => {
      if (autoStopRef.current) {
        window.clearTimeout(autoStopRef.current);
      }

      if (recorderRef.current?.state === 'recording') {
        try {
          recorderRef.current.stop();
        } catch {}
      }

      streamRef.current?.getTracks?.().forEach((track) => track.stop());
    };
  }, []);

  async function tryServerTranscription(blob) {
    if (sessionStorage.getItem('speakmode-local-transcription') === '1') {
      return null;
    }

    const extension = blob.type.includes('mp4') ? 'm4a' : 'webm';
    const formData = new FormData();

    formData.append(
      'audio',
      new File([blob], `speak-answer.${extension}`, {
        type: blob.type || 'audio/webm',
      })
    );

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    const payload = await response.json();

    if (!response.ok) {
      if (response.status === 503 || response.status === 403) {
        sessionStorage.setItem('speakmode-local-transcription', '1');
        return null;
      }

      throw new Error(payload.error || 'Could not transcribe your answer.');
    }

    return payload.text?.trim() || null;
  }

  async function transcribeRecording(blob, duration) {
    setTranscribing(true);
    setMicMessage('Transcribing your English…');

    try {
      let text = null;

      try {
        text = await tryServerTranscription(blob);
      } catch (serverError) {
        console.warn('Server transcription unavailable:', serverError);
      }

      if (!text) {
        text = await transcribeLocally(blob, setMicMessage);
      }

      setInput(text);
      setSpeakingSeconds((value) => value + duration);
      setMicMessage(
        'Transcript ready. Review it, edit anything you want, then send your answer.'
      );
    } catch (error) {
      console.error('Speak Mode local transcription failed', error);
      setMicMessage(
        error.message ||
          'I could not create a transcript. Try again with a shorter answer and speak close to the microphone.'
      );
    } finally {
      chunksRef.current = [];
      setTranscribing(false);
    }
  }

  async function startRecording() {
    if (recording || transcribing) return;

    setMicMessage('');
    setInput('');

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setMicMessage(
        'Audio recording is unavailable in this browser. Use a current version of Chrome, Edge, Safari, or Firefox.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = preferredMimeType();

      streamRef.current = stream;
      chunksRef.current = [];
      startedAtRef.current = Date.now();

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setMicMessage('The browser could not complete the recording. Please try again.');
      };

      recorder.onstop = async () => {
        if (autoStopRef.current) {
          window.clearTimeout(autoStopRef.current);
          autoStopRef.current = null;
        }

        const duration = Math.max(
          1,
          Math.round((Date.now() - startedAtRef.current) / 1000)
        );

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });

        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setRecording(false);

        if (blob.size < 200) {
          chunksRef.current = [];
          setMicMessage('The recording was too short. Try again and speak for a little longer.');
          return;
        }

        await transcribeRecording(blob, duration);
      };

      recorder.start(250);
      setRecording(true);
      setMicMessage('Recording… Speak naturally in English, then press Stop recording.');

      autoStopRef.current = window.setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 90000);
    } catch {
      streamRef.current?.getTracks?.().forEach((track) => track.stop());
      streamRef.current = null;
      setRecording(false);
      setMicMessage(
        'Microphone access was blocked. Allow microphone permission in your browser and try again.'
      );
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
  }

  async function submitAnswer() {
    if (recording || transcribing) return;

    const answer = input.trim();
    if (!answer) return;

    const entry = {
      prompt,
      answer,
      feedback: feedbackFor(answer, turn),
    };

    setHistory((current) => [...current, entry]);
    setInput('');
    setMicMessage('');

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
    setMicMessage('');
    setSpeakingSeconds(0);
    setFinished(false);
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
          Speak naturally. Your recording is used only to create the transcript and is discarded immediately afterward.
          The first local transcription on a device may take longer while the English model is prepared.
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
            onChange={(event) => setInput(event.target.value)}
            disabled={recording || transcribing}
            placeholder={
              transcribing
                ? 'Transcribing your English…'
                : 'Your transcript will appear here after you finish speaking. You can edit it before sending.'
            }
          />

          <div className={styles.controls}>
            {recording ? (
              <button className={styles.stop} onClick={stopRecording}>
                ■ Stop recording
              </button>
            ) : (
              <button
                className={styles.mic}
                onClick={startRecording}
                disabled={transcribing}
              >
                {transcribing ? '⏳ Transcribing…' : '🎙 Speak answer'}
              </button>
            )}

            <button
              className={styles.send}
              disabled={recording || transcribing || !input.trim() || saving}
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
              <p>{entry.feedback}</p>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
