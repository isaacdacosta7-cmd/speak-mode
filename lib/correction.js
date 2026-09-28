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
    answerHints: ["that's a good question", "let me think", "i'd say", 'depends'],
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

const ERROR_RULES = [
  {
    test: /\bi am agree\b/i,
    message: 'Use “I agree,” not “I am agree.” “Agree” is a verb.',
    replacement: ['i am agree', 'I agree'],
  },
  {
    test: /\bi goes\b/i,
    message: 'With “I,” use the base verb: “I go,” not “I goes.”',
    replacement: ['i goes', 'I go'],
  },
  {
    test: /\bi am go\b/i,
    message: 'Use “I go” for a routine or “I’m going” for an action in progress.',
    replacement: ['i am go', "I'm going"],
  },
  {
    test: /\b(he|she|it) go\b/i,
    message: 'In the present simple, use “goes” with he, she or it.',
  },
  {
    test: /\bpeople is\b/i,
    message: '“People” is plural, so use “people are.”',
    replacement: ['people is', 'people are'],
  },
  {
    test: /\bdid\s+\w+\s+(went|saw|ate|did|had)\b/i,
    message: 'After “did,” use the base form of the verb: “did you go,” not “did you went.”',
  },
  {
    test: /\bmore better\b/i,
    message: 'Use “better.” “More better” is not standard English.',
    replacement: ['more better', 'better'],
  },
  {
    test: /\bi have \d+ years\b/i,
    message: 'For age, English uses “I am … years old,” not “I have … years.”',
  },
  {
    test: /\bdepends of\b/i,
    message: 'Use “depends on,” not “depends of.”',
    replacement: ['depends of', 'depends on'],
  },
  {
    test: /\bmarried with\b/i,
    message: 'Use “married to,” not “married with.”',
    replacement: ['married with', 'married to'],
  },
  {
    test: /\bexplain me\b/i,
    message: 'Say “explain it to me” or “explain this to me.”',
    replacement: ['explain me', 'explain it to me'],
  },
  {
    test: /\bdiscuss about\b/i,
    message: 'Use “discuss the topic.” The verb “discuss” does not need “about.”',
    replacement: ['discuss about', 'discuss'],
  },
];

function clean(text) {
  return String(text || '').trim().replace(/\s+/g, ' ');
}

function wordCount(text) {
  return clean(text).split(/\s+/).filter(Boolean).length;
}

function applySimpleReplacement(text, pair) {
  if (!pair) return text;
  const [from, to] = pair;
  return text.replace(new RegExp(from, 'ig'), to);
}

export function evaluateTrainingAnswer(text, sessionKey, type = 'answer') {
  const value = clean(text);
  const guide = CORRECTION_GUIDES[sessionKey] || {};
  const model = type === 'build' ? guide.buildModel : guide.answerModel;
  const hints = type === 'build' ? (guide.buildHints || []) : (guide.answerHints || []);
  const corrections = [];
  let suggested = value;

  for (const rule of ERROR_RULES) {
    if (rule.test.test(value)) {
      corrections.push(rule.message);
      suggested = applySimpleReplacement(suggested, rule.replacement);
    }
  }

  if (wordCount(value) < (type === 'build' ? 3 : 5)) {
    corrections.push(
      type === 'build'
        ? 'Your sentence is too short. Complete the structure with a full idea.'
        : 'Expand your answer with at least one complete idea or detail.'
    );
  }

  if (guide.requiresQuestion && !value.includes('?')) {
    corrections.push('This response should include a follow-up question. Add a question mark and hand the conversation back.');
  }

  const lower = value.toLowerCase();
  const matchedHints = hints.filter((hint) => lower.includes(String(hint).toLowerCase()));
  const hasUsefulStructure = hints.length === 0 || matchedHints.length > 0;

  if (!hasUsefulStructure) {
    corrections.push(
      type === 'build'
        ? 'Use the target structure from this activity so the sentence practices the pattern you are learning.'
        : 'Your answer is understandable, but it does not yet use the conversational language this activity is training.'
    );
  }

  let status = 'correct';

  if (corrections.length >= 2 || ERROR_RULES.some((rule) => rule.test.test(value))) {
    status = 'fix';
  } else if (corrections.length === 1) {
    status = 'almost';
  }

  const title =
    status === 'correct'
      ? 'Correct — this works naturally.'
      : status === 'almost'
        ? 'Almost there — make one adjustment.'
        : 'Fix this before you continue.';

  return {
    status,
    title,
    corrections,
    model,
    suggested: suggested !== value ? suggested : null,
    canContinue: status === 'correct',
  };
}
