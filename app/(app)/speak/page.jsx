import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import GuidedConversation from '@/components/GuidedConversation';

export const dynamic = 'force-dynamic';

export default async function SpeakPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect('/login?next=/speak');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, placement_mode')
    .eq('id', claims.sub)
    .maybeSingle();

  if (!profile?.placement_mode) {
    redirect('/placement-test');
  }

  return (
    <GuidedConversation
      fullName={profile.full_name || claims.email?.split('@')[0] || 'Student'}
      mode={profile.placement_mode}
    />
  );
}
