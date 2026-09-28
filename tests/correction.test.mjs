import test from 'node:test';
import assert from 'node:assert/strict';

import {
  correctOpenAnswer,
  correctPhraseWriting,
  correctTrainingAnswer,
} from '../lib/serverCorrection.js';

test('rejects Spanish / non-English input', () => {
  const result = correctOpenAnswer('hola perro komo estas');
  assert.equal(result.canContinue, false);
  assert.equal(result.status, 'fix');
  assert.ok(result.corrections.some((item) => /English|Spanish|spelling|recognized/i.test(item)));
});

test('rejects obvious English spelling mistakes', () => {
  const result = correctOpenAnswer('I realy likke working with peopel.');
  assert.equal(result.canContinue, false);
  assert.equal(result.status, 'fix');
  assert.ok(result.spelling.length >= 2);
});

test('rejects I am agree', () => {
  const result = correctOpenAnswer('I am agree with you.');
  assert.equal(result.canContinue, false);
  assert.ok(result.corrections.some((item) => /I agree/i.test(item)));
});

test('rejects I goes', () => {
  const result = correctOpenAnswer('I goes to work every day.');
  assert.equal(result.canContinue, false);
  assert.ok(result.corrections.some((item) => /base verb|I go/i.test(item)));
});

test('accepts a clean open English answer', () => {
  const result = correctOpenAnswer('I work in marketing and I really enjoy helping clients.');
  assert.equal(result.canContinue, true, JSON.stringify(result, null, 2));
  assert.equal(result.status, 'correct');
});

test('training correction enforces the lesson pattern', () => {
  const bad = correctTrainingAnswer('I like pizza.', 'native-01', 'build');
  assert.equal(bad.canContinue, false);

  const good = correctTrainingAnswer(
    "Off the top of my head, I'd say AI will change how people work.",
    'native-01',
    'build'
  );
  assert.equal(good.canContinue, true, JSON.stringify(good, null, 2));
});

test('phrase writing rejects misspelling and accepts exact phrase', () => {
  const bad = correctPhraseWriting('I get were you are coming from.', "I get where you're coming from.");
  assert.equal(bad.canContinue, false);

  const good = correctPhraseWriting("I get where you're coming from.", "I get where you're coming from.");
  assert.equal(good.canContinue, true, JSON.stringify(good, null, 2));
});
