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

  const timezone = String(body.timezone || '').trim();

  const { data: saved, error: timezoneError } = await supabase.rpc('set_user_timezone', {
    p_timezone: timezone,
  });

  if (timezoneError) {
    return NextResponse.json({ error: timezoneError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, timezone: saved });
}
