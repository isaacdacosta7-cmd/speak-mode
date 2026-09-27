import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PhraseTrainer from '@/components/PhraseTrainer';

export const dynamic = 'force-dynamic';

export default async function PhrasesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect('/login?next=/phrases');
  }

  const [{ data: profile }, { data: progress }] = await Promise.all([
    supabase
      .from('profiles')
      .select('placement_mode')
      .eq('id', claims.sub)
      .maybeSingle(),
    supabase
      .from('phrase_progress')
      .select('phrase_key, repetitions, progress_percent, review_stage, next_review_at, last_practiced_at')
      .eq('user_id', claims.sub),
  ]);

  return (
    <PhraseTrainer
      mode={profile?.placement_mode || 'START_MODE'}
      initialProgress={progress || []}
    />
  );
}
