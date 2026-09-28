import fs from 'node:fs';
import path from 'node:path';
import { analyzeAnswer, CORRECTION_GUIDES } from '@/lib/correction';

let dictionaryCache = null;
let bucketCache = null;

const COMMON_MISSPELLINGS = new Map([
  ['becouse','because'],['beacuse','because'],['becuase','because'],
  ['likke','like'],['frend','friend'],['freind','friend'],
  ['comming','coming'],['writting','writing'],['studing','studying'],
  ['realy','really'],['marketting','marketing'],['grammer','grammar'],
  ['langauge','language'],['recieve','receive'],['definately','definitely'],
  ['definetly','definitely'],['seperate','separate'],['wich','which'],
  ['thier','their'],['tommorow','tomorrow'],['tomorow','tomorrow'],
  ['untill','until'],['goverment','government'],['happend','happened'],
  ['begining','beginning'],['accomodation','accommodation'],
  ['adress','address'],['buisness','business'],['calender','calendar'],
  ['collegue','colleague'],['enviroment','environment'],['existance','existence'],
  ['experiance','experience'],['finaly','finally'],['foriegn','foreign'],
  ['fourty','forty'],['foward','forward'],['greatful','grateful'],
  ['happend','happened'],['immediatly','immediately'],['independant','independent'],
  ['knowlege','knowledge'],['neccessary','necessary'],['occured','occurred'],
  ['prefered','preferred'],['pronounciation','pronunciation'],
  ['responsability','responsibility'],['succesful','successful'],
  ['suprise','surprise'],['tounge','tongue'],['truely','truly'],
  ['usefull','useful'],['wierd','weird'],['wether','whether'],
  ['alot','a lot'],['cant','can\'t'],['dont','don\'t'],['doesnt','doesn\'t'],
  ['didnt','didn\'t'],['im','i\'m'],['ive','i\'ve'],['id','i\'d']
]);

const EXTRA_WORDS = new Set([
  'ai','wifi','wi-fi','online','workflow','workflows','startup','startups',
  'marketing','instagram','zoom','chatgpt','email','emails','website','websites',
  'weekend','weekends','coworker','coworkers','teammate','teammates',
  'okay','yeah','yep','nope','hmm','uh','linkedin','youtube','tiktok',
  'a','an','the','and','or','but','so','because','although','though','if','when','while',
  'i','me','my','mine','you','your','yours','he','him','his','she','her','hers','it','its',
  'we','us','our','ours','they','them','their','theirs','this','that','these','those',
  'who','what','where','when','why','how','which',
  'am','is','are','was','were','be','been','being','do','does','did','have','has','had',
  'can','could','should','would','will','shall','may','might','must',
  'not','no','yes','very','really','usually','actually','personally','probably','maybe',
  'in','on','at','to','from','for','of','with','about','into','over','under','after','before',
  'by','through','during','without','within','between','among','around','up','down','out',
  'here','there','now','today','tomorrow','yesterday','later','early','late','again',
  'more','most','less','better','best','good','great','bad','big','small','new','old',
  'same','different','interesting','interested','useful','helpful','clear','natural',
  'first','last','next','another','other','every','each','some','any','many','much','few',
  'one','two','three','four','five','six','seven','eight','nine','ten',
  'thing','things','time','times','day','days','week','weeks','month','months','year','years',
  'people','person','family','friend','friends','work','job','business','school','home',
  'city','country','food','morning','afternoon','evening','night','place','places',
  'question','questions','answer','answers','idea','ideas','problem','problems','team','teams',
  'project','projects','client','clients','conversation','conversations','english',
  'go','goes','went','work','works','worked','study','studies','studied',
  'live','lives','lived','like','likes','liked','love','loves','loved',
  'want','wants','wanted','need','needs','needed','think','thinks','thought',
  'know','knows','knew','say','says','said','make','makes','made','take','takes','took',
  'see','sees','saw','eat','eats','ate','come','comes','came','meet','meets','met',
  'help','helps','helped','enjoy','enjoys','enjoyed','prefer','prefers','preferred',
  'feel','feels','felt','seem','seems','seemed','give','gives','gave','get','gets','got',
  'start','starts','started','finish','finishes','finished','learn','learns','learned',
  'use','uses','used','change','changes','changed','agree','agrees','agreed',
  'believe','believes','believed','understand','understands','understood',
  'ask','asks','asked','tell','tells','told','keep','keeps','kept',
  'spend','spends','spent','rest','rests','rested','sound','sounds','sounded',
  'remind','reminds','reminded','replace','replaces','replaced','replacing',
  'depend','depends','depended','approach','approaches','approached',
  'collaborate','collaborates','collaborated','create','creates','created',
  'reduce','reduces','reduced','cut','cuts','move','moves','moved',
  'accept','accepts','accepted','arrive','arrives','arrived','watch','watches','watched',
  'visit','visits','visited','stay','stays','stayed','travel','travels','traveled','travelled',
  'discover','discovers','discovered','decide','decides','decided','drive','drives','drove',
  'happen','happens','happened','hope','hopes','hoped','leave','leaves','left',
  'turn','turns','turned','catch','catches','caught','repeat','repeats','repeated',
  'remember','remembers','remembered','write','writes','wrote','speak','speaks','spoke'
]);

for (const guide of Object.values(CORRECTION_GUIDES)) {
  const source = [
    guide.buildModel,
    guide.answerModel,
    ...(guide.buildHints || []),
    ...(guide.answerHints || []),
  ].filter(Boolean).join(' ');

  for (const token of source.match(/[A-Za-z]+(?:['’][A-Za-z]+)?/g) || []) {
    EXTRA_WORDS.add(normalize(token));
  }
}

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

  if (COMMON_MISSPELLINGS.has(normalized)) return false;

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

  if (COMMON_MISSPELLINGS.has(normalized)) {
    return [COMMON_MISSPELLINGS.get(normalized)];
  }

  if (suggestionMemo.has(normalized)) return suggestionMemo.get(normalized);

  const { buckets } = loadDictionary();
  const candidates = [];
  const first = normalized[0];

  for (let length = Math.max(2, normalized.length - 2); length <= normalized.length + 2; length += 1) {
    const bucket = buckets.get(`${first}:${length}`) || [];
    candidates.push(...bucket);
  }

  const maxDistance = normalized.length <= 5 ? 2 : 3;

  const ranked = [...new Set(candidates)]
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
