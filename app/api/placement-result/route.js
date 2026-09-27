import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const LIMITS = {
  listening_score: 35,
  reaction_score: 25,
  real_english_score: 20,
  writing_score: 20,
};

function isValidInteger(value, max) {
  return Number.isInteger(value) && value >= 0 && value <= max;
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;

  if (claimsError || !claims?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const scores = {
    listening_score: Number(body.listening_score),
    reaction_score: Number(body.reaction_score),
    real_english_score: Number(body.real_english_score),
    writing_score: Number(body.writing_score),
  };

  for (const [key, max] of Object.entries(LIMITS)) {
    if (!isValidInteger(scores[key], max)) {
      return NextResponse.json(
        { error: `${key} must be an integer between 0 and ${max}` },
        { status: 400 }
      );
    }
  }

  const { data, error } = await supabase.rpc('submit_placement_result', {
    p_listening_score: scores.listening_score,
    p_reaction_score: scores.reaction_score,
    p_real_english_score: scores.real_english_score,
    p_writing_score: scores.writing_score,
  });

  if (error || !data?.length) {
    return NextResponse.json(
      { error: error?.message || 'Could not save placement result' },
      { status: 500 }
    );
  }

  const result = data[0];

  return NextResponse.json({
    success: true,
    attempt_id: result.attempt_id,
    total_score: result.total_score,
    placement_mode: result.placement_mode,
    placement_completed_at: result.placement_completed_at,
    breakdown: scores,
  });
}
