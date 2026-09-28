const STORAGE_KEY = 'speakmode-sound';

export function soundEnabled() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) !== 'off';
}

export function setSoundEnabled(enabled) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
  window.dispatchEvent(new CustomEvent('speakmode:sound-changed', { detail: enabled }));
}

function tone(context, frequency, start, duration, gainValue = 0.035, type = 'sine') {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

export function playUISound(kind = 'tap') {
  if (typeof window === 'undefined' || !soundEnabled()) return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const context = new AudioContextClass();
    const now = context.currentTime + 0.01;

    if (kind === 'complete') {
      tone(context, 523.25, now, 0.22, 0.045);
      tone(context, 659.25, now + 0.08, 0.24, 0.042);
      tone(context, 783.99, now + 0.16, 0.28, 0.04);
    } else if (kind === 'success') {
      tone(context, 659.25, now, 0.13, 0.036);
      tone(context, 880, now + 0.07, 0.17, 0.03);
    } else {
      tone(context, 520, now, 0.07, 0.018, 'triangle');
    }

    window.setTimeout(() => {
      context.close().catch(() => {});
    }, 700);
  } catch {
    // Sound is optional UI feedback.
  }
}
