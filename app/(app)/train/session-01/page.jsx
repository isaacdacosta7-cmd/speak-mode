import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getModeSessions } from '@/lib/curriculum';

export const dynamic = 'force-dynamic';

export default async function LegacySessionOnePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect('/login?next=/train');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('placement_mode')
    .eq('id', claims.sub)
    .maybeSingle();

  if (!profile?.placement_mode) {
    redirect('/placement-test');
  }

  const firstSession = getModeSessions(profile.placement_mode)[0];
  redirect(`/train/${firstSession.key}`);
}
