import fs from 'node:fs';
import path from 'node:path';
import { analyzeAnswer } from '@/lib/correction';

let dictionaryCache = null;
let bucketCache = null;

const EXTRA_WORDS = new Set([
  'ai','wifi','wi-fi','online','workflow','workflows','startup','startups',
  'marketing','instagram','zoom','chatgpt','email','emails','website','websites',
  'weekend','weekends','coworker','coworkers','teammate','teammates',
  'okay','yeah','yep','nope','hmm','uh','linkedin','youtube','tiktok'
]);

function normalize(word) {
  return String(word || '')
    .toLowerCase()
    .replaceAll('’', "'")
    .replace(/^[^a-z']+|[^a-z']+$/g, '');
}

function loadDictionary() {
  if (dictionaryCache && bucketCache) {
    return { roots: dictionaryCache, buckets: bucketCache };
  }

  const dictionaryPath = path.join(process.cwd(), 'public', 'data', 'en.dic');
  const raw = fs.readFileSync(dictionaryPath, 'utf8');
  const roots = new Set();
  const buckets = new Map();

  for (const line of raw.split(/\r?\n/).slice(1)) {
    if (!line) continue;

    const slash = line.indexOf('/');
    const source = slash >= 0 ? line.slice(0, slash) : line;
    const word = normalize(source);

    if (!word || !/^[a-z][a-z']*$/.test(word)) continue;

    roots.add(word);

    const key = `${word[0]}:${word.length}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(word);
  }

  for (const word of EXTRA_WORDS) roots.add(word);

  dictionaryCache = roots;
  bucketCache = buckets;

  return { roots, buckets };
}

function morphologyCandidates(word) {
  const values = new Set([word]);

  if (word.endsWith("'s")) values.add(word.slice(0, -2));

  if (word.endsWith('ies') && word.length > 4) {
    values.add(`${word.slice(0, -3)}y`);
  }

  if (word.endsWith('es') && word.length > 3) {
    values.add(word.slice(0, -2));
    values.add(word.slice(0, -1));
  }

  if (word.endsWith('s') && word.length > 3) {
    values.add(word.slice(0, -1));
  }

  if (word.endsWith('ied') && word.length > 4) {
    values.add(`${word.slice(0, -3)}y`);
  }

  if (word.endsWith('ed') && word.length > 4) {
    const stem = word.slice(0, -2);
    values.add(stem);
    values.add(`${stem}e`);

    if (stem.length > 2 && stem.at(-1) === stem.at(-2)) {
      values.add(stem.slice(0, -1));
    }
  }

  if (word.endsWith('ing') && word.length > 5) {
    const stem = word.slice(0, -3);
    values.add(stem);
    values.add(`${stem}e`);

    if (stem.length > 2 && stem.at(-1) === stem.at(-2)) {
      values.add(stem.slice(0, -1));
    }
  }

  if (word.endsWith('ly') && word.length > 4) {
    values.add(word.slice(0, -2));
  }

  if (word.endsWith('er') && word.length > 4) {
    values.add(word.slice(0, -2));
    values.add(`${word.slice(0, -1)}`);
  }

  if (word.endsWith('est') && word.length > 5) {
    values.add(word.slice(0, -3));
  }

  if (word.endsWith('ness') && word.length > 6) {
    values.add(word.slice(0, -4));
  }

  return [...values];
}

function correct(word) {
  const normalized = normalize(word);
  if (!normalized) return true;

  const { roots } = loadDictionary();

  if (EXTRA_WORDS.has(normalized) || roots.has(normalized)) return true;

  return morphologyCandidates(normalized).some((candidate) => (
    EXTRA_WORDS.has(candidate) || roots.has(candidate)
  ));
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = new Array(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost
      );
    }

    for (let j = 0; j <= b.length; j += 1) {
      previous[j] = current[j];
    }
  }

  return previous[b.length];
}

const suggestionMemo = new Map();

function suggest(word) {
  const normalized = normalize(word);

  if (!normalized || normalized.length < 2 || correct(normalized)) return [];
  if (suggestionMemo.has(normalized)) return suggestionMemo.get(normalized);

  const { buckets } = loadDictionary();
  const candidates = [];
  const first = normalized[0];

  for (let length = Math.max(2, normalized.length - 2); length <= normalized.length + 2; length += 1) {
    const bucket = buckets.get(`${first}:${length}`) || [];
    candidates.push(...bucket);
  }

  const maxDistance = normalized.length <= 5 ? 2 : 3;

  const ranked = candidates
    .map((candidate) => ({
      word: candidate,
      distance: levenshtein(normalized, candidate),
    }))
    .filter((item) => item.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance || a.word.length - b.word.length || a.word.localeCompare(b.word))
    .slice(0, 3)
    .map((item) => item.word);

  suggestionMemo.set(normalized, ranked);
  return ranked;
}

export function correctEnglishAnswer(text, options = {}) {
  return analyzeAnswer(text, {
    ...options,
    spell: { correct, suggest },
  });
}
