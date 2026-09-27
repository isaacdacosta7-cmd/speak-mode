import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BetaAdminDashboard from '@/components/BetaAdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect('/login?next=/admin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', claims.sub)
    .maybeSingle();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const [
    { data: users, error: usersError },
    { data: feedback, error: feedbackError },
  ] = await Promise.all([
    supabase.rpc('get_beta_users_overview'),
    supabase.rpc('get_beta_feedback_queue'),
  ]);

  return (
    <BetaAdminDashboard
      users={usersError ? [] : (users || [])}
      feedback={feedbackError ? [] : (feedback || [])}
    />
  );
}
