'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './TrainingSession.module.css';
import { playUISound } from '@/lib/uiSound';
import { evaluateTrainingAnswer } from '@/lib/correction';
import SpeakBuddy from '@/components/SpeakBuddy';

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

function CorrectionBox({ feedback }) {
  if (!feedback) return null;

  return (
    <div className={`${styles.correctionBox} ${styles[`correction_${feedback.status}`]}`}>
      <div className={styles.correctionHead}>
        <span>
          {feedback.status === 'correct' ? '✅' : feedback.status === 'almost' ? '⚠️' : '❌'}
        </span>
        <strong>{feedback.title}</strong>
      </div>

      {feedback.corrections?.length ? (
        <ul>
          {feedback.corrections.map((item) => <li key={item}>{item}</li>)}
        </ul>
      ) : (
        <p>Your sentence is clear, complete and fits the target pattern.</p>
      )}

      {feedback.suggested ? (
        <div className={styles.correctionExample}>
          <small>A QUICK FIX</small>
          <strong>{feedback.suggested}</strong>
        </div>
      ) : null}

      {feedback.model ? (
        <div className={styles.correctionExample}>
          <small>MODEL ANSWER</small>
          <strong>{feedback.model}</strong>
          <button type="button" onClick={() => speak(feedback.model)}>▶ Hear it</button>
        </div>
      ) : null}
    </div>
  );
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
  const [buildFeedback, setBuildFeedback] = useState(null);
  const [quickAnswer, setQuickAnswer] = useState('');
  const [quickFeedback, setQuickFeedback] = useState(null);
  const [roleChoice, setRoleChoice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [completed, setCompleted] = useState(false);

  const modeLabel = useMemo(() => mode.replaceAll('_', ' '), [mode]);

  const next = () => {
    playUISound('tap');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep((value) => Math.min(4, value + 1));
  };

  function checkBuild() {
    const feedback = evaluateTrainingAnswer(buildAnswer, session.key, 'build');
    setBuildFeedback(feedback);
    playUISound(feedback.status === 'correct' ? 'success' : 'tap');
  }

  function checkQuickAnswer() {
    const feedback = evaluateTrainingAnswer(quickAnswer, session.key, 'answer');
    setQuickFeedback(feedback);
    playUISound(feedback.status === 'correct' ? 'success' : 'tap');
  }

  const finishSession = async () => {
    if (roleChoice !== session.best) return;

    setSaving(true);
    setSaveError('');

    try {
      const response = await fetch('/api/training-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_key: session.key,
          speaking_seconds: 0,
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
      setSaveError(error.message || 'Could not save progress.');
    } finally {
      setSaving(false);
    }
  };

  if (completed) {
    return (
      <div className={styles.sessionShell}>
        <section className={`${styles.stage} ${styles.completeStage}`}>
          <SpeakBuddy variant="celebrate" compact />
          <span className={styles.kicker}>SESSION {String(sessionNumber).padStart(2, '0')} COMPLETE</span>
          <h1>🎉 +100 Training XP</h1>
          <p>
            You completed <strong>{session.title}</strong> in {modeLabel}. Your progress is saved.
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

        <div className={styles.headerBuddy}>
          <SpeakBuddy variant="study" compact />
        </div>

        <div className={styles.scoreBadge}>
          <strong>{score}</strong>
          <span>placement</span>
        </div>
      </header>

      <div className={styles.stepper}>
        {[
          ['🎧 Hear', false],
          ['🗣 Copy', false],
          ['🧩 Build', false],
          ['⚡ Answer', false],
          ['💬 Use', false],
          ['🔒 Speaking', true],
        ].map(([label, locked], index) => (
          <div
            key={label}
            className={`${styles.stepDot} ${index <= step && !locked ? styles.stepActive : ''} ${locked ? styles.stepLocked : ''}`}
          >
            <span>{locked ? '🔒' : index + 1}</span>
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
          <h2>Build it — then check it.</h2>
          <p className={styles.guidance}>{session.buildPrompt}</p>

          <div className={styles.buildBox}>
            <strong>{session.buildStem}</strong>
            <input
              value={buildAnswer}
              onChange={(event) => {
                setBuildAnswer(event.target.value);
                setBuildFeedback(null);
              }}
              placeholder="Complete the thought…"
            />
          </div>

          <div className={styles.checkActions}>
            <button className={styles.checkButton} disabled={buildAnswer.trim().length < 2} onClick={checkBuild}>
              ✓ Check my sentence
            </button>

            {buildFeedback && buildFeedback.status !== 'correct' && buildFeedback.model ? (
              <button
                className={styles.modelButton}
                type="button"
                onClick={() => {
                  setBuildAnswer(buildFeedback.model);
                  setBuildFeedback(null);
                }}
              >
                Use model answer
              </button>
            ) : null}
          </div>

          <CorrectionBox feedback={buildFeedback} />

          <button
            className={styles.primary}
            disabled={!buildFeedback?.canContinue}
            onClick={next}
          >
            Continue
          </button>
        </section>
      ) : null}

      {step === 3 ? (
        <section className={styles.stage}>
          <span className={styles.stageNumber}>04 · ANSWER IT</span>
          <h2>Answer — and get corrected.</h2>
          <p className={styles.promptCard}>{session.quickPrompt}</p>

          <textarea
            className={styles.answerArea}
            value={quickAnswer}
            onChange={(event) => {
              setQuickAnswer(event.target.value);
              setQuickFeedback(null);
            }}
            placeholder="Write the answer you would use in a real conversation…"
            rows={4}
          />

          <div className={styles.checkActions}>
            <button className={styles.checkButton} disabled={quickAnswer.trim().length < 4} onClick={checkQuickAnswer}>
              ✓ Check my answer
            </button>

            {quickFeedback && quickFeedback.status !== 'correct' && quickFeedback.model ? (
              <button
                className={styles.modelButton}
                type="button"
                onClick={() => {
                  setQuickAnswer(quickFeedback.model);
                  setQuickFeedback(null);
                }}
              >
                Use model answer
              </button>
            ) : null}
          </div>

          <CorrectionBox feedback={quickFeedback} />

          <button
            className={styles.primary}
            disabled={!quickFeedback?.canContinue}
            onClick={next}
          >
            Continue
          </button>
        </section>
      ) : null}

      {step === 4 ? (
        <section className={styles.stage}>
          <span className={styles.stageNumber}>05 · USE IT</span>
          <h2>Choose the most natural move.</h2>
          <p className={styles.promptCard}>{session.rolePrompt}</p>

          <div className={styles.roleOptions}>
            {session.roleOptions.map((option, index) => {
              const selected = roleChoice === index;
              const correct = index === session.best;

              return (
                <button
                  key={option}
                  onClick={() => {
                    setRoleChoice(index);
                    playUISound(correct ? 'success' : 'tap');
                  }}
                  className={`${styles.roleOption} ${selected ? styles.roleSelected : ''} ${selected && !correct ? styles.roleWrong : ''} ${selected && correct ? styles.roleCorrect : ''}`}
                >
                  <span>{selected ? (correct ? '✓' : '✕') : String.fromCharCode(65 + index)}</span>
                  <p>{option}</p>
                </button>
              );
            })}
          </div>

          {roleChoice !== null ? (
            <div className={`${styles.feedback} ${roleChoice === session.best ? styles.feedbackCorrect : styles.feedbackWrong}`}>
              {roleChoice === session.best ? (
                <>
                  <strong>✅ Correct.</strong>
                  <p>This response sounds natural, responds to the other person and keeps the conversation moving.</p>
                </>
              ) : (
                <>
                  <strong>❌ That answer needs correction.</strong>
                  <p>
                    A more natural answer is: <b>{session.roleOptions[session.best]}</b>
                  </p>
                  <button type="button" onClick={() => speak(session.roleOptions[session.best])}>▶ Hear the correct answer</button>
                </>
              )}
            </div>
          ) : null}

          <div className={styles.lockedPreview}>
            <SpeakBuddy variant="locked" compact />
            <div>
              <span>🔒 SPEAKING · MUY PRONTO</span>
              <h3>Real voice conversation is coming in the next release.</h3>
              <p>
                This module will unlock with the production speaking plan. For now, complete the corrected training lesson and keep building the language you will use there.
              </p>
            </div>
          </div>

          {saveError ? <div className={styles.notice}>{saveError}</div> : null}

          <button
            className={styles.primary}
            disabled={roleChoice !== session.best || saving}
            onClick={finishSession}
          >
            {saving ? 'Saving progress…' : 'Complete corrected session · +100 XP'}
          </button>
        </section>
      ) : null}
    </div>
  );
}
