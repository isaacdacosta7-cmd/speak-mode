import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function initials(name, email) {
  const source = name?.trim() || email || 'SM';
  const words = source.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? `${words[0][0]}${words[1][0]}` : source.slice(0, 2)).toUpperCase();
}

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, placement_score, placement_mode, daily_goal_minutes, role, plan_code, subscription_status')
    .eq('id', claims.sub)
    .maybeSingle();

  const { data: plan } = await supabase
    .from('plans')
    .select('name, live_sessions_per_month, live_session_minutes, live_session_type')
    .eq('code', profile?.plan_code || 'digital')
    .maybeSingle();

  const name = profile?.full_name || claims.email?.split('@')[0] || 'Student';
  const mode = profile?.placement_mode?.replaceAll('_', ' ') || 'PLACEMENT PENDING';

  return (
    <div className="page-stack">
      <header className="page-header">
        <span className="eyebrow">PROFILE</span>
        <h1>Your Speak Mode journey.</h1>
        <p>Your identity, placement, plan and training goals stay connected to this account.</p>
      </header>

      <section className="profile-card">
        <div className="big-avatar">{initials(profile?.full_name, claims.email)}</div>
        <div>
          <h2>{name}</h2>
          <p>{mode}{profile?.placement_score == null ? ' · placement pending' : ` · ${profile.placement_score}/100`}</p>
          <div className="tag-row">
            <span>Role: {profile?.role || 'student'}</span>
            <span>Daily target: {profile?.daily_goal_minutes || 20} min</span>
            <span>{plan?.name || 'Speak Mode Digital'}</span>
            <span>Plan status: {profile?.subscription_status || 'free'}</span>
          </div>
        </div>
      </section>

      <section className="split-grid">
        <article className="panel-card">
          <span className="tiny-label">PLACEMENT</span>
          <h3>{profile?.placement_score == null ? 'Placement pending' : `${profile.placement_score}/100 · ${mode}`}</h3>
          <p>Your saved placement result determines the training track shown in Train.</p>
          <Link href={profile?.placement_score == null ? '/placement-test' : '/placement-result'} className="text-link">
            {profile?.placement_score == null ? 'Take placement test →' : 'View & save result →'}
          </Link>
        </article>

        <article className="panel-card accent-panel">
          <span className="tiny-label">LIVE PLAN</span>
          <h3>{plan?.name || 'Speak Mode Digital'}</h3>
          <p>
            {plan?.live_sessions_per_month
              ? `${plan.live_sessions_per_month} human session(s) per month · ${plan.live_session_minutes} minutes.`
              : 'Human live sessions are available on plans with Live access.'}
          </p>
          <Link href="/live" className="text-link">Open Live Coach →</Link>
        </article>
      </section>
    </div>
  );
}
