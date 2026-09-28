import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { correctEnglishAnswer } from '@/lib/serverCorrection';

export const runtime = 'nodejs';

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
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const text = String(body.text || '').trim();
  const sessionKey = String(body.session_key || '').trim();
  const type = ['build', 'answer', 'open'].includes(body.type) ? body.type : 'answer';

  if (text.length < 1 || text.length > 1000) {
    return NextResponse.json(
      { error: 'Answer must be between 1 and 1000 characters.' },
      { status: 400 }
    );
  }

  const result = correctEnglishAnswer(text, {
    sessionKey,
    type,
  });

  return NextResponse.json({
    success: true,
    result,
  });
}
