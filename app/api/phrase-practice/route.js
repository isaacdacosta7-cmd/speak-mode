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
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const phraseKey = String(body.phrase_key || '');

  const { data: result, error: practiceError } = await supabase.rpc('practice_phrase', {
    p_phrase_key: phraseKey,
  });

  if (practiceError || !result?.length) {
    return NextResponse.json(
      { error: practiceError?.message || 'Could not save phrase practice.' },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, progress: result[0] });
}
