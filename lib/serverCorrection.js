import nspell from 'nspell';
import dictionary from 'dictionary-en';
import { analyzeAnswer } from './correction.js';

let spellCache = null;

const EXTRA_ALLOWED = [
  'ai','wifi','zoom','meet','chatgpt','instagram','youtube','tiktok',
  'venezuela','caracas','miami','madrid','new','york','linkedin',
  'marketing','workflow','workflows','startup','startups'
];

function getSpell() {
  if (!spellCache) {
    spellCache = nspell(dictionary);

    for (const word of EXTRA_ALLOWED) {
      spellCache.add(word);
    }
  }

  return spellCache;
}

function spellAdapter() {
  const spell = getSpell();

  return {
    correct(word) {
      const value = String(word || '').toLowerCase();

      if (!value) return true;

      if (/^[A-Z]{2,6}$/.test(word)) return true;

      return spell.correct(value);
    },

    suggest(word) {
      return spell.suggest(String(word || '').toLowerCase()).slice(0, 3);
    },
  };
}

export function correctTrainingAnswer(text, sessionKey, type = 'answer') {
  return analyzeAnswer(text, {
    sessionKey,
    type,
    spell: spellAdapter(),
  });
}

export function correctOpenAnswer(text) {
  return analyzeAnswer(text, {
    type: 'open',
    spell: spellAdapter(),
  });
}

export function correctPhraseWriting(text, targetPhrase) {
  return analyzeAnswer(text, {
    type: 'phrase',
    targetText: targetPhrase,
    spell: spellAdapter(),
  });
}
