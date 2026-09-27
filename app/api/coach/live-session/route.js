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

  const { data: result, error: manageError } = await supabase.rpc('manage_live_session', {
    p_session_id: body.session_id,
    p_status: body.status,
    p_coach_name: body.coach_name || null,
    p_meeting_url: body.meeting_url || null,
    p_coach_feedback: body.coach_feedback || null,
    p_homework: body.homework || null,
  });

  if (manageError || !result?.length) {
    return NextResponse.json(
      { error: manageError?.message || 'Could not update live session.' },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, session: result[0] });
}
