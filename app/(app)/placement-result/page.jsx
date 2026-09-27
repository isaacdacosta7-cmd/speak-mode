import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PlacementResultCard from '@/components/PlacementResultCard';

export const dynamic = 'force-dynamic';

export default async function PlacementResultPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect('/login?next=/placement-result');
  }

  const [{ data: profile }, { data: attempt }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, placement_score, placement_mode')
      .eq('id', claims.sub)
      .maybeSingle(),
    supabase
      .from('placement_attempts')
      .select('listening_score, reaction_score, real_english_score, writing_score, total_score, placement_mode, completed_at')
      .eq('user_id', claims.sub)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!attempt) {
    redirect('/placement-test');
  }

  return (
    <PlacementResultCard
      fullName={profile?.full_name || claims.email?.split('@')[0] || 'Student'}
      result={attempt}
    />
  );
}
