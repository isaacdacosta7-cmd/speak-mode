export const CORRECTION_GUIDES = {
  'start-01': {
    buildModel: "I'm from Venezuela.",
    answerModel: 'I work in marketing.',
    buildHints: ['from'],
    answerHints: ['work', 'student', 'study', 'job', 'business', 'marketing'],
  },
  'start-02': {
    buildModel: 'I usually start work at 8 a.m.',
    answerModel: 'I usually have breakfast and start work in the morning.',
    buildHints: ['usually'],
    answerHints: ['morning', 'usually', 'start', 'work', 'breakfast', 'wake'],
  },
  'start-03': {
    buildModel: 'What do you like to eat?',
    answerModel: 'What is your favorite food?',
    buildHints: ['what', 'do', 'you'],
    answerHints: ['what', 'food', 'favorite', '?'],
    requiresQuestion: true,
  },
  'start-04': {
    buildModel: "I'm looking for the restroom.",
    answerModel: 'Excuse me, could you tell me the Wi-Fi password, please?',
    buildHints: ['looking for'],
    answerHints: ['wi-fi', 'wifi', 'password', 'please', 'could'],
  },
  'start-05': {
    buildModel: "Nice to meet you. I'm from Venezuela.",
    answerModel: "Oh, really? That's great. What city are you from?",
    buildHints: ['nice to meet you'],
    answerHints: ['?', 'really', 'great', 'where', 'city', 'what'],
    requiresQuestion: true,
  },

  'response-01': {
    buildModel: 'Usually, I work in the morning and study at night.',
    answerModel: 'I usually spend time with my family and rest on weekends.',
    buildHints: ['usually'],
    answerHints: ['usually', 'weekend', 'family', 'rest', 'work', 'go'],
  },
  'response-02': {
    buildModel: 'Yeah, I do. I really enjoy traveling.',
    answerModel: 'Yeah, I do. I love traveling because I enjoy discovering new places.',
    buildHints: ['yeah', 'i do'],
    answerHints: ['travel', 'because', 'enjoy', 'love', 'like'],
  },
  'response-03': {
    buildModel: "Tomorrow, I'm meeting a client.",
    answerModel: 'Yesterday evening I stayed home and watched a movie.',
    buildHints: ['tomorrow'],
    answerHints: ['yesterday', 'last night', 'evening', 'went', 'stayed', 'watched', 'worked'],
  },
  'response-04': {
    buildModel: "Let me think. I'd say learning English takes consistency.",
    answerModel: "That's a good question. I'd say New York is one of the best cities I've visited.",
    buildHints: ['let me think'],
    answerHints: ["that's a good question", 'let me think', "i'd say", 'depends'],
  },
  'response-05': {
    buildModel: "Pretty good, actually. I've been busy with work.",
    answerModel: "Pretty good, actually. I've been busy with work, but things are going well.",
    buildHints: ['pretty good'],
    answerHints: ['pretty good', "i've been", 'busy', 'going well'],
  },

  'conversation-01': {
    buildModel: 'That sounds interesting. How did you get into it?',
    answerModel: 'Really? That sounds great. What was your favorite part of Mexico?',
    buildHints: ['that sounds interesting'],
    answerHints: ['?', 'really', 'how', 'what', 'where'],
    requiresQuestion: true,
  },
  'conversation-02': {
    buildModel: 'So, last Friday I was driving home when something unexpected happened.',
    answerModel: 'Last time I was late, traffic was terrible and I arrived about twenty minutes late.',
    buildHints: ['last'],
    answerHints: ['last', 'late', 'traffic', 'arrived', 'because'],
  },
  'conversation-03': {
    buildModel: 'Wow, that is a big change. I hope everything goes well.',
    answerModel: "Wow, that's a big move. I hope it goes really well. When are you leaving?",
    buildHints: ['wow'],
    answerHints: ['wow', 'great', 'big', 'hope', '?'],
    requiresQuestion: true,
  },
  'conversation-04': {
    buildModel: 'Personally, I think online learning is useful because it gives people flexibility.',
    answerModel: 'Personally, I think online learning is useful because people can study from anywhere.',
    buildHints: ['personally', 'i think'],
    answerHints: ['think', 'because', 'useful', 'helpful', 'flexible'],
  },
  'conversation-05': {
    buildModel: 'That reminds me of a difficult trip I took last year.',
    answerModel: 'That reminds me of a trip I took last year. We had the same problem. What did you do next?',
    buildHints: ['that reminds me'],
    answerHints: ['reminds me', 'trip', 'experience', '?'],
    requiresQuestion: true,
  },

  'fluency-01': {
    buildModel: "Now that you mention it, I've been thinking about changing my routine too.",
    answerModel: "I see the appeal, but I don't think working from home is more productive for everyone.",
    buildHints: ['now that you mention it'],
    answerHints: ['think', 'depends', 'everyone', 'productive', 'work from home'],
  },
  'fluency-02': {
    buildModel: "Looking back, I'm glad I made that decision.",
    answerModel: "The funny thing is, I almost said no. Looking back, it turned out to be a great decision.",
    buildHints: ['looking back'],
    answerHints: ['looking back', 'decision', 'turned out', 'glad'],
  },
  'fluency-03': {
    buildModel: "I see your point, but I think the situation is more complicated.",
    answerModel: "I see your point. Offices can help collaboration, although I think the best setup depends on the team.",
    buildHints: ['i see your point'],
    answerHints: ['i see your point', 'depends', 'although', 'to an extent', 'at the same time'],
  },
  'fluency-04': {
    buildModel: 'Sorry, what did you say after “the meeting”?',
    answerModel: 'I caught most of that, but could you repeat the last part?',
    buildHints: ['what did you say'],
    answerHints: ['repeat', 'last part', 'what did you say', 'run that by me'],
    requiresQuestion: true,
  },
  'fluency-05': {
    buildModel: 'That is interesting. That reminds me of something that happened at work.',
    answerModel: 'That is interesting. It reminds me of something similar that happened to me. How do you see it?',
    buildHints: ['that is interesting', "that's interesting"],
    answerHints: ['reminds me', 'interesting', '?', 'how do you'],
    requiresQuestion: true,
  },

  'native-01': {
    buildModel: "Off the top of my head, I'd say the biggest change will be how people collaborate with AI.",
    answerModel: "I get where you're coming from. I think AI will change creative work dramatically, although replacing most creative jobs within five years feels too absolute.",
    buildHints: ['off the top of my head'],
    answerHints: ['i think', 'although', 'depends', 'i get where', 'too absolute'],
  },
  'native-02': {
    buildModel: "I see the logic, although I'd be concerned about quality.",
    answerModel: "I see the appeal, but cutting the timeline in half could create quality problems. I'd rather reduce the scope first.",
    buildHints: ['i see the logic'],
    answerHints: ['but', 'although', 'concern', 'rather', 'what if'],
  },
  'native-03': {
    buildModel: 'If I think out loud for a second, the bigger issue may be how we define success.',
    answerModel: 'Let me think out loud for a second. I think an effective team needs trust, clear ownership and honest communication.',
    buildHints: ['think out loud'],
    answerHints: ['think out loud', 'effective', 'team', 'trust', 'communication', 'ownership'],
  },
  'native-04': {
    buildModel: 'In hindsight, that small conversation changed the direction of the whole project.',
    answerModel: "At the time it seemed like a small moment, but in hindsight it changed how I approached the project.",
    buildHints: ['in hindsight'],
    answerHints: ['in hindsight', 'at the time', 'looking back', 'changed'],
  },
  'native-05': {
    buildModel: "If I'm hearing you correctly, we agree on the goal but not on the approach.",
    answerModel: 'It sounds like both sides agree on the outcome. The open question is how quickly we should move and how much risk we can accept.',
    buildHints: ["if i'm hearing you correctly"],
    answerHints: ['agree', 'open question', 'sounds like', 'outcome', 'risk'],
  },
};

const GRAMMAR_RULES = [
  {
    regex: /\bi am agree\b/i,
    message: 'Use “I agree,” not “I am agree.” “Agree” is a verb.',
    replace: 'I agree',
  },
  {
    regex: /\bi goes\b/i,
    message: 'With “I,” use the base verb: “I go.”',
    replace: 'I go',
  },
  {
    regex: /\bi am go\b/i,
    message: 'Use “I go” for a routine or “I’m going” for an action in progress.',
    replace: "I'm going",
  },
  {
    regex: /\bi am (work|study|live|play|eat|want|need|like|think)\b/i,
    message: 'After “I am,” use an adjective/noun or an -ing form. For a simple present verb, remove “am.”',
  },
  {
    regex: /\bi (working|studying|going|living|playing|eating|thinking)\b/i,
    message: 'A present continuous sentence needs “am”: for example, “I am working.”',
  },
  {
    regex: /\b(he|she|it) (go|work|like|want|need|live|play|study|have|do|say|make|take|know|think)\b/i,
    message: 'In the present simple, he/she/it normally needs the third-person verb form.',
  },
  {
    regex: /\b(i|you|we|they) (goes|works|likes|wants|needs|lives|plays|studies|has|does|says|makes|takes|knows|thinks)\b/i,
    message: 'With I/you/we/they in the present simple, use the base form of the verb.',
  },
  {
    regex: /\b(he|she|it) don't\b/i,
    message: 'Use “doesn’t” with he, she or it.',
  },
  {
    regex: /\b(i|you|we|they) doesn't\b/i,
    message: 'Use “don’t” with I, you, we or they.',
  },
  {
    regex: /\b(i|you|we|they) is\b/i,
    message: 'Check the verb “to be”: use “I am,” “you are,” “we are,” or “they are.”',
  },
  {
    regex: /\b(he|she|it) are\b/i,
    message: 'Use “is” with he, she or it.',
  },
  {
    regex: /\bpeople is\b/i,
    message: '“People” is plural, so use “people are.”',
    replace: 'people are',
  },
  {
    regex: /\bpeople has\b/i,
    message: '“People” is plural, so use “people have.”',
    replace: 'people have',
  },
  {
    regex: /\bthere is (many|several|two|three|four|five|six|seven|eight|nine|ten)\b/i,
    message: 'Use “there are” before plural quantities.',
  },
  {
    regex: /\b(does|did|do)\s+\w+\s+(goes|went|saw|ate|had|did|made|took|said|came|got|thought|knew|wrote|spoke)\b/i,
    message: 'After do/does/did, use the base form of the main verb.',
  },
  {
    regex: /\b(don't|doesn't|didn't)\s+(goes|went|saw|ate|had|did|made|took|said|came|got|thought|knew|wrote|spoke)\b/i,
    message: 'After don’t/doesn’t/didn’t, use the base form of the main verb.',
  },
  {
    regex: /\bi no (understand|know|like|want|need|have)\b/i,
    message: 'Use “I don’t …” for a negative sentence, for example “I don’t understand.”',
  },
  {
    regex: /\bmore better\b/i,
    message: 'Use “better.” “More better” is not standard English.',
    replace: 'better',
  },
  {
    regex: /\bi have \d+ years(?: old)?\b/i,
    message: 'For age, use “I am … years old,” not “I have … years.”',
  },
  {
    regex: /\bdepends of\b/i,
    message: 'Use “depends on,” not “depends of.”',
    replace: 'depends on',
  },
  {
    regex: /\bmarried with\b/i,
    message: 'Use “married to,” not “married with.”',
    replace: 'married to',
  },
  {
    regex: /\bexplain me\b/i,
    message: 'Use “explain it to me” or “explain this to me.”',
    replace: 'explain it to me',
  },
  {
    regex: /\bdiscuss about\b/i,
    message: 'Use “discuss the topic.” The verb “discuss” does not need “about.”',
    replace: 'discuss',
  },
  {
    regex: /\bmuch people\b/i,
    message: 'Use “many people,” not “much people.”',
    replace: 'many people',
  },
  {
    regex: /\bi am interesting in\b/i,
    message: 'Use “I am interested in.” “Interesting” describes the thing; “interested” describes your feeling.',
    replace: 'I am interested in',
  },
  {
    regex: /\bi very like\b/i,
    message: 'A natural form is “I really like …,” not “I very like …”.',
    replace: 'I really like',
  },
  {
    regex: /\b(can|could|should|must|may|might|will|would) to \w+/i,
    message: 'After a modal verb such as can, should, must or would, use the base verb without “to.”',
  },
  {
    regex: /\byesterday\s+(i|we|he|she|they)\s+(go|see|eat|have|do|make|take|come|meet)\b/i,
    message: 'After “yesterday,” use the past form: went, saw, ate, had, did, made, took, came, met, etc.',
  },
  {
    regex: /\blast (night|week|month|year)\s+(i|we|he|she|they)\s+(go|see|eat|have|do|make|take|come|meet)\b/i,
    message: 'With a finished past-time expression such as “last night,” use a past-tense verb.',
  },
  {
    regex: /\btomorrow\s+(i|we|he|she|they)\s+(went|saw|ate|had|did|made|took|came|met)\b/i,
    message: '“Tomorrow” needs a future plan or arrangement, not a simple past form.',
  },
];

const CONTRACTIONS = new Set([
  "i'm","i've","i'll","i'd","you're","you've","you'll","you'd",
  "he's","he'll","he'd","she's","she'll","she'd","it's","it'll",
  "we're","we've","we'll","we'd","they're","they've","they'll","they'd",
  "that's","that'll","there's","here's","what's","who's","where's","when's",
  "how's","don't","doesn't","didn't","isn't","aren't","wasn't","weren't",
  "can't","couldn't","shouldn't","wouldn't","won't","haven't","hasn't","hadn't",
  "let's"
]);

const VERB_SIGNAL = new Set([
  'am','is','are','was','were','be','been','being','have','has','had','do','does','did',
  'can','could','will','would','shall','should','may','might','must',
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
  'remind','reminds','reminded','replace','replaces','replaced','depend','depends','depended',
  'approach','approaches','approached','collaborate','collaborates','collaborated',
  'create','creates','created','reduce','reduces','reduced','cut','cuts','move','moves','moved',
  'accept','accepts','accepted','arrive','arrives','arrived','watch','watches','watched',
  'visit','visits','visited','stay','stays','stayed','travel','travels','traveled','travelled',
  'discover','discovers','discovered','decide','decides','decided','drive','drives','drove',
  'happen','happens','happened','hope','hopes','hoped','leave','leaves','left',
  'turn','turns','turned','catch','catches','caught','repeat','repeats','repeated',
  'remember','remembers','remembered','write','writes','wrote','speak','speaks','spoke'
]);

function clean(text) {
  return String(text || '').trim().replace(/\s+/g, ' ');
}

function tokenize(text) {
  return [...clean(text).matchAll(/[A-Za-zÀ-ÖØ-öø-ÿ]+(?:['’][A-Za-zÀ-ÖØ-öø-ÿ]+)?/g)]
    .map((match) => ({
      value: match[0],
      lower: match[0].toLowerCase().replaceAll('’', "'"),
      index: match.index || 0,
    }));
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function wordCount(text) {
  return tokenize(text).length;
}

function applyRuleReplacement(text, rule) {
  if (!rule.replace) return text;
  return text.replace(rule.regex, rule.replace);
}

function hasVerbSignal(tokens) {
  return tokens.some((token) => {
    const lower = token.lower.replace(/'s$/, '');
    if (VERB_SIGNAL.has(lower)) return true;
    return /(?:ing|ed)$/.test(lower);
  });
}

function isLikelyProperNoun(token, tokenIndex, totalTokens) {
  if (!/^[A-Z][a-z]+$/.test(token.value)) return false;
  if (tokenIndex === 0 && totalTokens > 1) return false;
  return true;
}

export function analyzeAnswer(text, {
  sessionKey = '',
  type = 'answer',
  spell = null,
} = {}) {
  const value = clean(text);
  const guide = CORRECTION_GUIDES[sessionKey] || {};
  const model =
    type === 'build'
      ? guide.buildModel || null
      : type === 'answer'
        ? guide.answerModel || null
        : null;
  const hints =
    type === 'build'
      ? guide.buildHints || []
      : type === 'answer'
        ? guide.answerHints || []
        : [];

  const tokens = tokenize(value);
  const issues = [];
  let suggested = value;

  if (!value) {
    return {
      status: 'fix',
      title: 'Write an answer first.',
      corrections: ['Your answer is empty.'],
      spelling: [],
      model,
      suggested: null,
      canContinue: false,
    };
  }

  const accented = tokens.filter((token) => /[À-ÖØ-öø-ÿ]/.test(token.value));
  const spelling = [];

  if (spell) {
    tokens.forEach((token, tokenIndex) => {
      if (CONTRACTIONS.has(token.lower)) return;
      if (token.lower.length === 1 && ['a', 'i'].includes(token.lower)) return;
      if (/^[A-Z]{2,6}$/.test(token.value)) return;
      if (isLikelyProperNoun(token, tokenIndex, tokens.length)) return;

      if (!spell.correct(token.lower)) {
        spelling.push({
          word: token.value,
          suggestions: spell.suggest(token.lower).slice(0, 3),
        });
      }
    });
  }

  if (accented.length > 0) {
    issues.push('Use English words in this activity. The answer contains characters that normally indicate another language.');
  }

  if (spelling.length > 0) {
    const preview = spelling
      .slice(0, 5)
      .map((item) => {
        const suggestion = item.suggestions[0];
        return suggestion
          ? `“${item.word}” → did you mean “${suggestion}”?`
          : `“${item.word}” is not recognized as standard English.`;
      })
      .join(' ');

    issues.push(`Check spelling: ${preview}`);
  }

  const unknownRatio = tokens.length ? spelling.length / tokens.length : 0;
  if (
    tokens.length >= 3 &&
    (unknownRatio >= 0.4 || spelling.length >= Math.max(3, Math.ceil(tokens.length / 2)))
  ) {
    issues.push('This answer contains too many words that the English dictionary cannot recognize. It may be another language or contain several spelling mistakes.');
  }

  for (const rule of GRAMMAR_RULES) {
    if (rule.regex.test(value)) {
      issues.push(rule.message);
      suggested = applyRuleReplacement(suggested, rule);
    }
  }

  const minimumWords = type === 'build' ? 3 : type === 'open' ? 4 : 3;
  if (tokens.length < minimumWords) {
    issues.push(
      type === 'build'
        ? 'Write a complete sentence using the target structure.'
        : 'Expand your answer with at least one complete idea.'
    );
  }

  if (tokens.length >= 4 && !hasVerbSignal(tokens)) {
    issues.push('This does not yet read like a complete English sentence. Add a verb so the idea has a clear action or state.');
  }

  if (type === 'open' && !/[.!?]$/.test(value)) {
    issues.push('Finish the sentence with normal punctuation.');
  }

  if (type === 'answer' && guide.requiresQuestion && !value.includes('?')) {
    issues.push('This activity requires a follow-up question. Add a natural question before continuing.');
  }

  if (hints.length > 0) {
    const lower = value.toLowerCase();
    const matched = hints.some((hint) => lower.includes(String(hint).toLowerCase()));

    if (!matched) {
      issues.push(
        type === 'build'
          ? 'Use the target structure from this lesson. The sentence should practice the pattern shown in the prompt.'
          : 'Use at least one of the target conversation patterns from this activity so the answer practices the skill being trained.'
      );
    }
  }

  const corrections = unique(issues);
  const status = corrections.length === 0 ? 'correct' : 'fix';

  return {
    status,
    title:
      status === 'correct'
        ? 'Correct — your answer passes spelling, grammar and activity checks.'
        : 'Correction required before you continue.',
    corrections,
    spelling,
    model,
    suggested: suggested !== value ? suggested : null,
    canContinue: status === 'correct',
  };
}

export function evaluateTrainingAnswer(text, sessionKey, type = 'answer') {
  return analyzeAnswer(text, { sessionKey, type });
}

export function evaluateOpenAnswer(text) {
  return analyzeAnswer(text, { type: 'open' });
}
