import { createClient } from '@/lib/supabase/server';

function initials(name, email) {
  const source = name?.trim() || email || 'SM';
  const words = source.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? `${words[0][0]}${words[1][0]}` : source.slice(0, 2)).toUpperCase();
}

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, placement_score, placement_mode, daily_goal_minutes, role')
    .eq('id', claims.sub)
    .maybeSingle();

  const name = profile?.full_name || claims.email?.split('@')[0] || 'Student';
  const mode = profile?.placement_mode?.replaceAll('_', ' ') || 'PLACEMENT PENDING';

  return (
    <div className="page-stack">
      <header className="page-header">
        <span className="eyebrow">PROFILE</span>
        <h1>Your Speak Mode journey.</h1>
        <p>Your identity, placement and training goals stay connected to this account.</p>
      </header>

      <section className="profile-card">
        <div className="big-avatar">{initials(profile?.full_name, claims.email)}</div>
        <div>
          <h2>{name}</h2>
          <p>{mode}{profile?.placement_score == null ? ' · placement pending' : ` · ${profile.placement_score}/100`}</p>
          <div className="tag-row">
            <span>Role: {profile?.role || 'student'}</span>
            <span>Daily target: {profile?.daily_goal_minutes || 20} min</span>
            <span>{claims.email}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
