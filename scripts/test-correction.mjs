import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const corePath = path.join(root, 'lib', 'correction.js');
const serverPath = path.join(root, 'lib', 'serverCorrection.js');
const dictionaryPath = path.join(root, 'public', 'data', 'en.dic');

let coreSource = fs.readFileSync(corePath, 'utf8')
  .replace(/export const /g, 'const ')
  .replace(/export function /g, 'function ');

coreSource += '\nreturn { CORRECTION_GUIDES, analyzeAnswer };';
const core = new Function(coreSource)();

let serverSource = fs.readFileSync(serverPath, 'utf8')
  .replace(/^import .*$/gm, '')
  .replace(
    "  const dictionaryPath = path.join(process.cwd(), 'public', 'data', 'en.dic');\n  const raw = fs.readFileSync(dictionaryPath, 'utf8');",
    '  const raw = __DICT__;'
  )
  .replace(/export function /g, 'function ');

serverSource += '\nreturn { correctEnglishAnswer };';

const server = new Function(
  '__DICT__',
  'analyzeAnswer',
  'CORRECTION_GUIDES',
  serverSource
)(
  fs.readFileSync(dictionaryPath, 'utf8'),
  core.analyzeAnswer,
  core.CORRECTION_GUIDES
);

const mustFail = [
  ['hola amigo como estas', { type: 'open' }],
  ['holaa amigoo komoo estas', { type: 'open' }],
  ['yo trabajo en marketing.', { sessionKey: 'start-01', type: 'answer' }],
  ['I goes to work every day.', { sessionKey: 'start-02', type: 'answer' }],
  ['I likke traveling becouse it is fun.', { sessionKey: 'response-02', type: 'answer' }],
  ['I am agree with you.', { sessionKey: 'native-02', type: 'answer' }],
  ['She go to school every day.', { type: 'open' }],
  ['Yesterday I go to work.', { type: 'open' }],
  ['I can to help you.', { type: 'open' }],
  ['People is very friendly.', { type: 'open' }],
  ['blue table happy orange.', { type: 'open' }],
  ['I werk in marketting.', { sessionKey: 'start-01', type: 'answer' }],
  ["I get were your comming from.", {
    type: 'phrase',
    targetText: "I get where you're coming from.",
  }],
];

const mustPass = [
  ['I work in marketing.', { sessionKey: 'start-01', type: 'answer' }],
  ['I usually start work early in the morning.', { sessionKey: 'start-02', type: 'build' }],
  ['Personally, I think online learning is useful because it gives people flexibility.', {
    sessionKey: 'conversation-04',
    type: 'answer',
  }],
  ['I see your point. I agree with the goal, although I would approach it differently.', {
    sessionKey: 'fluency-03',
    type: 'answer',
  }],
  ['Let me think out loud for a second. I think an effective team needs trust and clear communication.', {
    sessionKey: 'native-03',
    type: 'answer',
  }],
  ["I get where you're coming from.", {
    type: 'phrase',
    targetText: "I get where you're coming from.",
  }],
  ["I'm from Venezuela.", {
    type: 'phrase',
    targetText: "I'm from…",
  }],
];

const failures = [];

for (const [input, options] of mustFail) {
  const result = server.correctEnglishAnswer(input, options);
  if (result.canContinue) {
    failures.push(`Expected rejection: ${input}`);
  }
}

for (const [input, options] of mustPass) {
  const result = server.correctEnglishAnswer(input, options);
  if (!result.canContinue) {
    failures.push(`Expected acceptance: ${input} -> ${result.corrections.join(' | ')}`);
  }
}

for (const [sessionKey, guide] of Object.entries(core.CORRECTION_GUIDES)) {
  for (const type of ['build', 'answer']) {
    const input = type === 'build' ? guide.buildModel : guide.answerModel;
    const result = server.correctEnglishAnswer(input, { sessionKey, type });

    if (!result.canContinue) {
      failures.push(
        `Model answer failed (${sessionKey}/${type}): ${result.corrections.join(' | ')}`
      );
    }
  }
}

if (failures.length) {
  console.error('Correction regression tests FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Correction regression tests passed: ${mustFail.length} invalid cases rejected, ${mustPass.length} valid cases accepted, 50 model answers accepted.`
);
