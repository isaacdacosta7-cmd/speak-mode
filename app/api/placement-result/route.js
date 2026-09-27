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

  const totalScore =
    scores.listening_score +
    scores.reaction_score +
    scores.real_english_score +
    scores.writing_score;

  const { data: attempt, error: attemptError } = await supabase
    .from('placement_attempts')
    .insert({
      user_id: claims.sub,
      ...scores,
    })
    .select('id, total_score, placement_mode, completed_at')
    .single();

  if (attemptError) {
    return NextResponse.json({ error: 'Could not save placement attempt' }, { status: 500 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({ placement_score: totalScore })
    .eq('id', claims.sub)
    .select('placement_score, placement_mode, placement_completed_at')
    .single();

  if (profileError) {
    return NextResponse.json({ error: 'Could not update student profile' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    attempt_id: attempt.id,
    total_score: profile.placement_score,
    placement_mode: profile.placement_mode,
    placement_completed_at: profile.placement_completed_at,
    breakdown: scores,
  });
}
