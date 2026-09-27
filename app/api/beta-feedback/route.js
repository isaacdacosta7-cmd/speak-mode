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

  const feedbackType = String(body.feedback_type || '');
  const message = String(body.message || '');
  const pagePath = String(body.page_path || '');

  const { data: id, error: feedbackError } = await supabase.rpc('submit_beta_feedback', {
    p_feedback_type: feedbackType,
    p_message: message,
    p_page_path: pagePath,
  });

  if (feedbackError) {
    return NextResponse.json({ error: feedbackError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, id });
}
