import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getModeSessions } from '@/lib/curriculum';

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

  const sessionKey = String(body.session_key || '');
  const speakingSeconds = Number(body.speaking_seconds || 0);

  if (!Number.isInteger(speakingSeconds) || speakingSeconds < 0 || speakingSeconds > 7200) {
    return NextResponse.json({ error: 'Invalid speaking time' }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('placement_mode')
    .eq('id', claims.sub)
    .maybeSingle();

  if (!profile?.placement_mode) {
    return NextResponse.json({ error: 'Placement required' }, { status: 409 });
  }

  const sessions = getModeSessions(profile.placement_mode);
  const sessionIndex = sessions.findIndex((session) => session.key === sessionKey);
  const isSpeakLab = sessionKey === 'speak-lab-01';

  if (sessionIndex < 0 && !isSpeakLab) {
    return NextResponse.json({ error: 'Unknown training session' }, { status: 400 });
  }

  if (sessionIndex > 0) {
    const previousSessionKey = sessions[sessionIndex - 1].key;

    const { data: previousProgress } = await supabase
      .from('training_progress')
      .select('completion_percent')
      .eq('user_id', claims.sub)
      .eq('session_key', previousSessionKey)
      .maybeSingle();

    if ((previousProgress?.completion_percent || 0) < 100) {
      return NextResponse.json(
        { error: 'Complete the previous session first.' },
        { status: 409 }
      );
    }
  }

  const payload = {
    p_module_key: isSpeakLab ? 'speak_lab' : profile.placement_mode.toLowerCase(),
    p_session_key: sessionKey,
    p_completion_percent: 100,
    p_speaking_seconds: speakingSeconds,
    p_xp: isSpeakLab ? 50 : 100,
  };

  const { data, error } = await supabase.rpc('save_training_progress', payload);

  if (error || !data?.length) {
    return NextResponse.json(
      { error: error?.message || 'Could not save training progress' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    progress: data[0],
    reward: {
      xp: payload.p_xp,
      session_key: sessionKey,
    },
  });
}
