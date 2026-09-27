import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const payload = {
    p_module_key: String(body.module_key || ''),
    p_session_key: String(body.session_key || ''),
    p_completion_percent: Number(body.completion_percent || 0),
    p_speaking_seconds: Number(body.speaking_seconds || 0),
    p_xp: Number(body.xp || 0),
  };

  if (
    !Number.isInteger(payload.p_completion_percent) ||
    !Number.isInteger(payload.p_speaking_seconds) ||
    !Number.isInteger(payload.p_xp)
  ) {
    return NextResponse.json({ error: 'Invalid numeric values' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('save_training_progress', payload);

  if (error || !data?.length) {
    return NextResponse.json(
      { error: error?.message || 'Could not save training progress' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, progress: data[0] });
}
