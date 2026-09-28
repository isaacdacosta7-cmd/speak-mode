import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const challengeKey = String(body.challenge_key || '');
  const responseText = String(body.response_text || '');

  const { data: result, error: challengeError } = await supabase.rpc('complete_daily_challenge', {
    p_challenge_key: challengeKey,
    p_response_text: responseText,
  });

  if (challengeError || !result?.length) {
    return NextResponse.json(
      { error: challengeError?.message || 'Could not save daily challenge.' },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, activity: result[0] });
}
