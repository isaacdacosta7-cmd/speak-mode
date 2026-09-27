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

  const preferredStart = String(body.preferred_start || '');
  const timezone = String(body.timezone || '');
  const topic = String(body.topic || '').slice(0, 500);

  if (!preferredStart || !timezone) {
    return NextResponse.json({ error: 'Date, time and timezone are required.' }, { status: 400 });
  }

  const { data: result, error: requestError } = await supabase.rpc('request_live_session', {
    p_preferred_start: preferredStart,
    p_timezone: timezone,
    p_topic: topic,
  });

  if (requestError || !result?.length) {
    return NextResponse.json(
      { error: requestError?.message || 'Could not request live session.' },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, booking: result[0] });
}
