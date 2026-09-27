import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TrainingSession from '@/components/TrainingSession';

export const dynamic = 'force-dynamic';

export default async function SessionOnePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect('/login?next=/train/session-01');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, placement_score, placement_mode')
    .eq('id', claims.sub)
    .maybeSingle();

  if (!profile?.placement_mode) {
    redirect('/placement-test');
  }

  return (
    <TrainingSession
      fullName={profile.full_name || claims.email?.split('@')[0] || 'Student'}
      mode={profile.placement_mode}
      score={profile.placement_score}
    />
  );
}
