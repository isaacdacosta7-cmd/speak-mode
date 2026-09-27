'use client';

import { useMemo, useState } from 'react';
import styles from './PhraseTrainer.module.css';

const libraries = {
  START_MODE: [
    ['start-what-about-you', 'What about you?', 'Devuelve la conversación a la otra persona.'],
    ['start-let-me-think', 'Let me think.', 'Gana un momento para organizar tu respuesta.'],
    ['start-im-from', "I'm from…", 'Di de dónde eres de forma natural.'],
    ['start-i-work-in', 'I work in…', 'Explica tu área de trabajo.'],
    ['start-could-you-repeat', 'Could you repeat that?', 'Pide que repitan algo con naturalidad.'],
  ],
  RESPONSE_MODE: [
    ['response-actually', 'Actually…', 'Corrige, aclara o añade un matiz.'],
    ['response-usually', 'Usually, I…', 'Habla de hábitos con rapidez.'],
    ['response-it-depends', 'It depends.', 'Abre una respuesta flexible.'],
    ['response-let-me-think', 'Let me think for a second.', 'Evita quedarte en blanco.'],
    ['response-what-about-you', 'What about you?', 'Mantén el intercambio activo.'],
  ],
  CONVERSATION_MODE: [
    ['conversation-really', 'Really?', 'Muestra reacción y abre espacio.'],
    ['conversation-how-was-it', 'How was it?', 'Pide más detalles.'],
    ['conversation-what-next', 'What happened next?', 'Mantén viva una historia.'],
    ['conversation-reminds-me', 'That reminds me of…', 'Conecta con una experiencia propia.'],
    ['conversation-how-get-into', 'How did you get into that?', 'Profundiza en el tema.'],
  ],
  FLUENCY_MODE: [
    ['fluency-now-that', 'Now that you mention it…', 'Introduce una idea relacionada.'],
    ['fluency-makes-sense', 'That makes sense.', 'Reacciona con naturalidad.'],
    ['fluency-pretty-much', 'Pretty much.', 'Respuesta breve y natural.'],
    ['fluency-by-the-way', 'By the way…', 'Cambia de tema suavemente.'],
    ['fluency-to-be-fair', 'To be fair…', 'Introduce un matiz.'],
  ],
  NATIVE_FLOW: [
    ['native-get-where', "I get where you're coming from.", 'Reconoce la perspectiva de la otra persona.'],
    ['native-off-top', 'Off the top of my head…', 'Responde de forma espontánea.'],
    ['native-caught-off', 'That caught me off guard.', 'Expresa sorpresa con naturalidad.'],
    ['native-put-it-this-way', "I'd put it this way…", 'Reformula tu idea con precisión.'],
    ['native-that-said', 'That said…', 'Añade un contraste o matiz avanzado.'],
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

  async function practice(key) {
    setSaving(key);
    try {
      const response = await fetch('/api/phrase-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase_key: key }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Could not save practice.');
      setProgress((current) => ({ ...current, [key]: payload.progress }));
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

      <div className={styles.list}>
        {phrases.map(([key, phrase, meaning]) => {
          const item = progress[key];
          const percent = item?.progress_percent || 0;
          return (
            <article className={styles.card} key={key}>
              <button className={styles.play} type="button" onClick={() => speak(phrase)}>▶</button>
              <div className={styles.copy}>
                <strong>{phrase}</strong>
                <small>{meaning}</small>
                <div className={styles.track}><i style={{ width: `${percent}%` }} /></div>
              </div>
              <div className={styles.progress}>
                <strong>{percent}%</strong>
                <span>{item?.repetitions || 0} reps</span>
              </div>
              <button
                className={styles.practice}
                type="button"
                onClick={() => practice(key)}
                disabled={saving === key}
              >
                {saving === key ? 'Saving…' : percent >= 100 ? 'Practice again' : 'I repeated it'}
              </button>
            </article>
          );
        })}
      </div>

      <section className="panel-card accent-panel">
        <span className="tiny-label">HOW IT WORKS</span>
        <h3>Five deliberate repetitions build the first mastery marker.</h3>
        <p>Each phrase remains available after 100% so you can keep revisiting it over time.</p>
      </section>
    </div>
  );
}
