import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getModeSessions } from '@/lib/curriculum';
import DailySpeak from '@/components/DailySpeak';

export const dynamic = 'force-dynamic';

function localDateString(timeZone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZone || 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(new Date());
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function shiftDate(dateString, delta) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

function computeStreak(rows, today) {
  const completed = new Set(
    rows.filter((row) => row.completed).map((row) => row.activity_date)
  );

  let cursor = completed.has(today) ? today : shiftDate(today, -1);
  let streak = 0;

  while (completed.has(cursor)) {
    streak += 1;
    cursor = shiftDate(cursor, -1);
  }

  return streak;
}

const challengeBanks = {
  START_MODE: [
    'Say or write three sentences about yourself: your name, where you are from, and what you do.',
    'Describe your morning in three simple sentences.',
    'Ask three questions you could use when meeting someone new.',
    'Write one polite request you could use in a café, hotel, or store.',
    'Introduce yourself and finish with one question for the other person.',
  ],
  RESPONSE_MODE: [
    'Answer this naturally in 2–3 sentences: What do you usually do on weekends?',
    'Use “Let me think…” and answer: What is a place you would like to visit?',
    'Describe one thing you did yesterday and one thing you will do tomorrow.',
    'Give a short answer, then expand it: Do you enjoy cooking?',
    'Imagine an old friend asks “How have you been?” Write your natural response.',
  ],
  CONVERSATION_MODE: [
    'React to this and ask a follow-up question: “I just started a new job.”',
    'Tell a short story about something unexpected that happened recently.',
    'Give your opinion about online learning and ask the listener what they think.',
    'Respond naturally: “I just got back from a great trip.” Keep the conversation going.',
    'Connect someone else’s story to one of your own experiences.',
  ],
  FLUENCY_MODE: [
    'React naturally to: “Working from home is better for everyone.” Add your view.',
    'Tell a short story using “The funny thing is…” and “Looking back…”.',
    'Partly disagree with this idea: “Everyone should work in an office.”',
    'Ask for clarification after missing one detail in a fast conversation.',
    'Use “That reminds me of…” to transition into a short personal story.',
  ],
  NATIVE_FLOW: [
    'Give a nuanced response: “AI will replace most creative jobs.”',
    'Challenge this idea diplomatically: “We should cut the project timeline in half.”',
    'Think out loud about this question: What makes a team effective?',
    'Tell a short story where the meaning of the event became clearer later.',
    'Summarize two sides of an argument and identify the open question.',
  ],
};

export default async function DailyPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect('/login?next=/daily');
  }

  const [{ data: profile }, { data: activityRows }, { data: phraseRows }, { data: progressRows }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, placement_mode, timezone')
      .eq('id', claims.sub)
      .maybeSingle(),
    supabase
      .from('daily_activity')
      .select('activity_date, training_keys, phrase_keys, challenge_keys, completed, updated_at')
      .eq('user_id', claims.sub)
      .order('activity_date', { ascending: false })
      .limit(60),
    supabase
      .from('phrase_progress')
      .select('phrase_key, progress_percent, review_stage, next_review_at, last_practiced_at')
      .eq('user_id', claims.sub),
    supabase
      .from('training_progress')
      .select('session_key, completion_percent')
      .eq('user_id', claims.sub),
  ]);

  if (!profile?.placement_mode) {
    redirect('/placement-test');
  }

  const timezone = profile.timezone || 'UTC';
  const today = localDateString(timezone);
  const rows = activityRows || [];
  const todayRow = rows.find((row) => row.activity_date === today);

  const trainingCount = todayRow?.training_keys?.length || 0;
  const phraseCount = todayRow?.phrase_keys?.length || 0;
  const challengeCount = todayRow?.challenge_keys?.length || 0;
  const streak = computeStreak(rows, today);

  const dueCount = (phraseRows || []).filter((row) => (
    row.progress_percent >= 100 &&
    row.next_review_at &&
    new Date(row.next_review_at) <= new Date()
  )).length;

  const sessions = getModeSessions(profile.placement_mode);
  const progressMap = new Map(
    (progressRows || []).map((row) => [row.session_key, row.completion_percent || 0])
  );
  const nextSession =
    sessions.find((session) => (progressMap.get(session.key) || 0) < 100) ||
    sessions[sessions.length - 1];

  const bank = challengeBanks[profile.placement_mode] || challengeBanks.START_MODE;
  const dayNumber = Math.floor(new Date(`${today}T00:00:00Z`).getTime() / 86400000);
  const challengeIndex = Math.abs(dayNumber) % bank.length;
  const challengeKey = `${profile.placement_mode.toLowerCase()}-daily-${challengeIndex + 1}`;
  const challengePrompt = bank[challengeIndex];

  return (
    <DailySpeak
      firstName={profile.full_name?.trim()?.split(/\s+/)[0] || 'Student'}
      timezone={timezone}
      streak={streak}
      trainingDone={trainingCount >= 1}
      phraseCount={phraseCount}
      challengeDone={challengeCount >= 1}
      missionComplete={Boolean(todayRow?.completed)}
      dueCount={dueCount}
      challengeKey={challengeKey}
      challengePrompt={challengePrompt}
      nextSessionKey={nextSession.key}
      nextSessionTitle={nextSession.title}
    />
  );
}
