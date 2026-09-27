import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LiveBooking from '@/components/LiveBooking';

export const dynamic = 'force-dynamic';

export default async function LivePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect('/login?next=/live');
  }

  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const [{ data: profile }, { data: sessions }] = await Promise.all([
    supabase
      .from('profiles')
      .select('plan_code, subscription_status')
      .eq('id', claims.sub)
      .maybeSingle(),
    supabase
      .from('live_sessions')
      .select('id, session_type, duration_minutes, preferred_start, timezone, topic, status, coach_name, meeting_url, coach_feedback, homework, created_at')
      .eq('user_id', claims.sub)
      .order('preferred_start', { ascending: false })
      .limit(12),
  ]);

  const { data: plan } = await supabase
    .from('plans')
    .select('code, name, live_sessions_per_month, live_session_minutes, live_session_type')
    .eq('code', profile?.plan_code || 'digital')
    .maybeSingle();

  const allSessions = sessions || [];
  const used = allSessions.filter((session) => {
    const date = new Date(session.preferred_start);
    return (
      ['pending', 'confirmed', 'completed'].includes(session.status) &&
      date >= monthStart &&
      date < nextMonth
    );
  }).length;

  const resolvedPlan = plan || {
    code: 'digital',
    name: 'Speak Mode Digital',
    live_sessions_per_month: 0,
    live_session_minutes: 0,
    live_session_type: 'none',
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <span className="eyebrow">LIVE COACH</span>
        <h1>Practice with a real person.</h1>
        <p>
          Paid plans can include a controlled number of human conversation sessions each month.
          Your coach can see your level and training context before the session.
        </p>
      </header>

      {profile?.subscription_status !== 'active' && resolvedPlan.code !== 'digital' ? (
        <section className="panel-card">
          <span className="tiny-label">PLAN STATUS</span>
          <h3>Live access paused</h3>
          <p>Your paid subscription needs to be active before a new live session can be requested.</p>
        </section>
      ) : null}

      <LiveBooking
        plan={resolvedPlan}
        used={used}
        sessions={allSessions}
        subscriptionActive={profile?.subscription_status === 'active' || resolvedPlan.code === 'digital'}
      />
    </div>
  );
}
