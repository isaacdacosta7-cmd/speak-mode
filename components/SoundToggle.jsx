'use client';

import { useEffect, useState } from 'react';
import { playUISound, setSoundEnabled, soundEnabled } from '@/lib/uiSound';

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(soundEnabled());

    const update = (event) => setEnabled(Boolean(event.detail));
    window.addEventListener('speakmode:sound-changed', update);

    return () => window.removeEventListener('speakmode:sound-changed', update);
  }, []);

  function toggle() {
    const next = !enabled;
    setSoundEnabled(next);
    setEnabled(next);

    if (next) {
      window.setTimeout(() => playUISound('success'), 20);
    }
  }

  return (
    <button
      type="button"
      className="sound-toggle"
      onClick={toggle}
      aria-label={enabled ? 'Turn interface sounds off' : 'Turn interface sounds on'}
      title={enabled ? 'Sounds on' : 'Sounds off'}
    >
      <span aria-hidden="true">{enabled ? '🔊' : '🔇'}</span>
      <small>{enabled ? 'Sound' : 'Muted'}</small>
    </button>
  );
}
