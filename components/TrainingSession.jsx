'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './TrainingSession.module.css';
import { playUISound } from '@/lib/uiSound';

function speak(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.97;

  const voices = window.speechSynthesis.getVoices();
  const voice =
    voices.find((item) => item.lang === 'en-US') ||
    voices.find((item) => item.lang?.startsWith('en'));

  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export default function TrainingSession({
  fullName,
  mode,
  score,
  session,
  sessionNumber,
  totalSessions,
  nextSessionKey = null,
}) {
  const router = useRouter();
  const firstName = fullName.trim().split(/\s+/)[0] || 'Student';
  const phrase = session.phrase.replaceAll('{{name}}', firstName);
  const chunks = session.chunks.map((item) => item.replaceAll('{{name}}', firstName));

  const [step, setStep] = useState(0);
  const [heard, setHeard] = useState(false);
  const [repetitions, setRepetitions] = useState(0);
  const [buildAnswer, setBuildAnswer] = useState('');
  const [quickAnswer, setQuickAnswer] = useState('');
  const [roleChoice, setRoleChoice] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState(null);
  const [recordingUrl, setRecordingUrl] = useState('');
  const [speakingSeconds, setSpeakingSeconds] = useState(0);
  const [spokenFallback, setSpokenFallback] = useState(false);
  const [micError, setMicError] = useState('');
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const startTimeRef = useRef(null);

  const modeLabel = useMemo(() => mode.replaceAll('_', ' '), [mode]);

  useEffect(() => {
    if (!recordingBlob) {
      setRecordingUrl('');
      return undefined;
    }

    const url = URL.createObjectURL(recordingBlob);
    setRecordingUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [recordingBlob]);

  useEffect(() => () => {
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
  }, []);

  const next = () => {
    playUISound('tap');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep((value) => Math.min(5, value + 1));
  };

  const startRecording = async () => {
    try {
      setMicError('');

      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        throw new Error('unsupported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      startTimeRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const duration = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

        setSpeakingSeconds((value) => Math.max(value, duration));
        setRecordingBlob(blob);
        setRecording(false);

        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      recorder.start();
      setRecording(true);
    } catch {
      setMicError('Microphone access is unavailable here. Practice the prompt out loud and use the manual completion button.');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
  };

  const finishSession = async () => {
    setSaving(true);
    setMicError('');

    try {
      const response = await fetch('/api/training-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module_key: mode.toLowerCase(),
          session_key: session.key,
          completion_percent: 100,
          speaking_seconds: speakingSeconds || (spokenFallback ? 30 : 0),
          xp: 100,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Could not save progress.');
      }

      playUISound('complete');
      setCompleted(true);
      router.refresh();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setMicError(error.message || 'Could not save progress.');
    } finally {
      setSaving(false);
    }
  };

  if (completed) {
    return (
      <div className={styles.sessionShell}>
        <section className={`${styles.stage} ${styles.completeStage}`}>
          <div className={styles.completeIcon}>🏆</div>
          <span className={styles.kicker}>SESSION {String(sessionNumber).padStart(2, '0')} COMPLETE</span>
          <h1>🎉 +100 Speaking XP</h1>
          <p>
            You completed <strong>{session.title}</strong> in {modeLabel}. Your progress and speaking time are saved.
          </p>

          <div className={styles.completeActions}>
            {nextSessionKey ? (
              <button className={styles.primary} onClick={() => router.push(`/train/${nextSessionKey}`)}>
                Continue to Session {String(sessionNumber + 1).padStart(2, '0')}
              </button>
            ) : (
              <button className={styles.primary} onClick={() => router.push('/train')}>
                View completed block
              </button>
            )}

            <button className={styles.secondary} onClick={() => router.push('/phrases')}>
              Review Power Phrases
            </button>

            <button className={styles.secondary} onClick={() => router.push('/dashboard')}>
              Back to dashboard
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.sessionShell}>
      <header className={styles.sessionHeader}>
        <div>
          <span className={styles.kicker}>
            {modeLabel} · SESSION {String(sessionNumber).padStart(2, '0')} OF {String(totalSessions).padStart(2, '0')}
          </span>
          <h1>{session.title}</h1>
          <p>{session.subtitle}</p>
        </div>

        <div className={styles.scoreBadge}>
          <strong>{score}</strong>
          <span>placement</span>
        </div>
      </header>

      <div className={styles.stepper}>
        {['🎧 Hear', '🗣 Copy', '🧩 Build', '⚡ Answer', '💬 Use', '🎙 Speak'].map((label, index) => (
          <div
            key={label}
            className={`${styles.stepDot} ${index <= step ? styles.stepActive : ''}`}
          >
            <span>{index + 1}</span>
            <small>{label}</small>
          </div>
        ))}
      </div>

      {step === 0 ? (
        <section className={styles.stage}>
          <span className={styles.stageNumber}>01 · HEAR IT</span>
          <h2>Listen to the whole thought.</h2>
          <p className={styles.guidance}>Focus on rhythm and meaning first.</p>

          <div className={styles.phraseBox}>
            <button
              className={styles.play}
              onClick={() => {
                speak(phrase);
                setHeard(true);
              }}
            >
              ▶
            </button>
            <p>{phrase}</p>
          </div>

          <button className={styles.primary} disabled={!heard} onClick={next}>
            I heard it
          </button>
        </section>
      ) : null}

      {step === 1 ? (
        <section className={styles.stage}>
          <span className={styles.stageNumber}>02 · COPY IT</span>
          <h2>Copy the rhythm.</h2>
          <p className={styles.guidance}>
            Play each block and repeat it out loud. Complete at least three deliberate repetitions.
          </p>

          <div className={styles.chunkList}>
            {chunks.map((chunk) => (
              <button className={styles.chunk} key={chunk} onClick={() => speak(chunk)}>
                <span>▶</span>
                <strong>{chunk}</strong>
              </button>
            ))}
          </div>

          <div className={styles.repBox}>
            <span>REPETITIONS</span>
            <strong>{repetitions}/3</strong>
            <button onClick={() => setRepetitions((value) => {
              const nextValue = Math.min(3, value + 1);
              playUISound(nextValue === 3 ? 'success' : 'tap');
              return nextValue;
            })}>
              I repeated it
            </button>
          </div>

          <button className={styles.primary} disabled={repetitions < 3} onClick={next}>
            Continue
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className={styles.stage}>
          <span className={styles.stageNumber}>03 · BUILD IT</span>
          <h2>Make the structure yours.</h2>
          <p className={styles.guidance}>{session.buildPrompt}</p>

          <div className={styles.buildBox}>
            <strong>{session.buildStem}</strong>
            <input
              value={buildAnswer}
              onChange={(event) => setBuildAnswer(event.target.value)}
              placeholder="Complete the thought…"
            />
          </div>

          <button className={styles.primary} disabled={buildAnswer.trim().length < 2} onClick={next}>
            Use my sentence
          </button>
        </section>
      ) : null}

      {step === 3 ? (
        <section className={styles.stage}>
          <span className={styles.stageNumber}>04 · ANSWER IT</span>
          <h2>Respond without overthinking.</h2>
          <p className={styles.promptCard}>{session.quickPrompt}</p>

          <textarea
            className={styles.answerArea}
            value={quickAnswer}
            onChange={(event) => setQuickAnswer(event.target.value)}
            placeholder="Type the answer you would say out loud…"
            rows={4}
          />

          <p className={styles.tip}>Say your answer out loud once after typing it.</p>

          <button className={styles.primary} disabled={quickAnswer.trim().length < 4} onClick={next}>
            Continue
          </button>
        </section>
      ) : null}

      {step === 4 ? (
        <section className={styles.stage}>
          <span className={styles.stageNumber}>05 · USE IT</span>
          <h2>Choose your move.</h2>
          <p className={styles.promptCard}>{session.rolePrompt}</p>

          <div className={styles.roleOptions}>
            {session.roleOptions.map((option, index) => (
              <button
                key={option}
                onClick={() => {
                  setRoleChoice(index);
                  playUISound(index === session.best ? 'success' : 'tap');
                }}
                className={`${styles.roleOption} ${roleChoice === index ? styles.roleSelected : ''}`}
              >
                <span>{roleChoice === index ? '✓' : String.fromCharCode(65 + index)}</span>
                <p>{option}</p>
              </button>
            ))}
          </div>

          {roleChoice !== null ? (
            <div className={styles.feedback}>
              {roleChoice === session.best
                ? 'Natural choice. It responds, adds something useful and keeps the conversation open.'
                : 'Try the first option once out loud. Listen for the complete conversational thought.'}
            </div>
          ) : null}

          <button className={styles.primary} disabled={roleChoice === null} onClick={next}>
            Go to speaking
          </button>
        </section>
      ) : null}

      {step === 5 ? (
        <section className={styles.stage}>
          <span className={styles.stageNumber}>06 · SPEAK IT</span>
          <h2>Put everything together.</h2>
          <p className={styles.promptCard}>{session.speakPrompt}</p>

          <div className={styles.powerRow}>
            {session.power.map((item) => <span key={item}>{item}</span>)}
          </div>

          <div className={styles.recordBox}>
            {recording ? (
              <button className={`${styles.recordButton} ${styles.recording}`} onClick={stopRecording}>
                ■ Stop recording
              </button>
            ) : (
              <button className={styles.recordButton} onClick={startRecording}>
                {recordingBlob ? '↻ Record again' : '● Start speaking'}
              </button>
            )}

            {recordingUrl ? (
              <audio className={styles.audioPlayback} controls src={recordingUrl} />
            ) : null}

            <button
              className={styles.fallbackButton}
              onClick={() => {
                setSpokenFallback(true);
                setSpeakingSeconds((value) => Math.max(value, 30));
              }}
            >
              I practiced it out loud
            </button>
          </div>

          {speakingSeconds > 0 ? (
            <p className={styles.speakingTime}>Speaking practice: {speakingSeconds}s</p>
          ) : null}

          {micError ? <div className={styles.notice}>{micError}</div> : null}

          <button
            className={styles.primary}
            disabled={(!recordingBlob && !spokenFallback) || saving}
            onClick={finishSession}
          >
            {saving ? 'Saving progress…' : 'Complete session · +100 XP'}
          </button>
        </section>
      ) : null}
    </div>
  );
}
