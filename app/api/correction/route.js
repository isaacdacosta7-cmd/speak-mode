import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  correctOpenAnswer,
  correctPhraseWriting,
  correctTrainingAnswer,
} from '@/lib/serverCorrection';

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
  const kind = String(body.kind || 'open');

  if (text.length < 1 || text.length > 1500) {
    return NextResponse.json({ error: 'Answer length is invalid.' }, { status: 400 });
  }

  try {
    let result;

    if (kind === 'training') {
      result = correctTrainingAnswer(
        text,
        String(body.session_key || ''),
        body.answer_type === 'build' ? 'build' : 'answer'
      );
    } else if (kind === 'phrase') {
      const targetPhrase = String(body.target_phrase || '').trim();

      if (!targetPhrase) {
        return NextResponse.json({ error: 'Target phrase is required.' }, { status: 400 });
      }

      result = correctPhraseWriting(text, targetPhrase);
    } else {
      result = correctOpenAnswer(text);
    }

    return NextResponse.json({ success: true, result });
  } catch (correctionError) {
    console.error('Correction error', correctionError);

    return NextResponse.json(
      { error: 'Could not evaluate this answer.' },
      { status: 500 }
    );
  }
}
