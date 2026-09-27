import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PlacementTest from '@/components/PlacementTest';

export const dynamic = 'force-dynamic';

export default async function PlacementTestPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect('/login?next=/placement-test');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, placement_score, placement_mode')
    .eq('id', claims.sub)
    .maybeSingle();

  return (
    <PlacementTest
      fullName={profile?.full_name || claims.email?.split('@')[0] || 'Student'}
      previousScore={profile?.placement_score ?? null}
      previousMode={profile?.placement_mode ?? null}
    />
  );
}
