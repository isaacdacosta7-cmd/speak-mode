import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TrainingSession from '@/components/TrainingSession';
import { getModeSessions, getSession, getSessionIndex } from '@/lib/curriculum';

export const dynamic = 'force-dynamic';

export default async function DynamicTrainingSessionPage({ params }) {
  const { sessionKey } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect(`/login?next=/train/${sessionKey}`);
  }

  const [{ data: profile }, { data: progressRows }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, placement_score, placement_mode')
      .eq('id', claims.sub)
      .maybeSingle(),
    supabase
      .from('training_progress')
      .select('session_key, completion_percent')
      .eq('user_id', claims.sub),
  ]);

  if (!profile?.placement_mode) {
    redirect('/placement-test');
  }

  const sessions = getModeSessions(profile.placement_mode);
  const session = getSession(profile.placement_mode, sessionKey);
  const sessionIndex = getSessionIndex(profile.placement_mode, sessionKey);

  if (!session || sessionIndex < 0) {
    redirect('/train');
  }

  const progressMap = new Map(
    (progressRows || []).map((row) => [row.session_key, row.completion_percent || 0])
  );

  const firstIncompleteIndex = sessions.findIndex(
    (item) => (progressMap.get(item.key) || 0) < 100
  );

  const unlockedThrough = firstIncompleteIndex === -1
    ? sessions.length - 1
    : firstIncompleteIndex;

  if (sessionIndex > unlockedThrough) {
    const target = sessions[unlockedThrough];
    redirect(`/train/${target.key}`);
  }

  const nextSessionKey = sessionIndex < sessions.length - 1
    ? sessions[sessionIndex + 1].key
    : null;

  return (
    <TrainingSession
      fullName={profile.full_name || claims.email?.split('@')[0] || 'Student'}
      mode={profile.placement_mode}
      score={profile.placement_score}
      session={session}
      sessionNumber={sessionIndex + 1}
      totalSessions={sessions.length}
      nextSessionKey={nextSessionKey}
    />
  );
}
