import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CoachLiveManager from '@/components/CoachLiveManager';

export const dynamic = 'force-dynamic';

export default async function CoachLivePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect('/login?next=/coach/live');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', claims.sub)
    .maybeSingle();

  if (!['coach', 'admin'].includes(profile?.role)) {
    redirect('/dashboard');
  }

  const { data: queue, error: queueError } = await supabase.rpc('get_live_session_queue');

  return (
    <div className="page-stack">
      <header className="page-header">
        <span className="eyebrow">COACH DESK</span>
        <h1>Live conversation requests.</h1>
        <p>Confirm the coach, meeting link and status for paid Live sessions.</p>
      </header>

      <CoachLiveManager
        initialSessions={queueError ? [] : (queue || [])}
      />
    </div>
  );
}
