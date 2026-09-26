import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function TrainingLayout({ children }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, placement_score, placement_mode')
    .eq('id', claims.sub)
    .maybeSingle();

  const user = {
    id: claims.sub,
    email: claims.email || '',
    fullName: profile?.full_name || claims.user_metadata?.full_name || '',
    placementScore: profile?.placement_score ?? null,
    placementMode: profile?.placement_mode ?? null,
  };

  return <AppShell user={user}>{children}</AppShell>;
}
