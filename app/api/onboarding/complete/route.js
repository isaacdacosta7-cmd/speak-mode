import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: completed, error: onboardingError } = await supabase.rpc('complete_onboarding');

  if (onboardingError) {
    return NextResponse.json({ error: onboardingError.message }, { status: 400 });
  }

  return NextResponse.json({ success: Boolean(completed) });
}
