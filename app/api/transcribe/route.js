import { NextResponse } from 'next/server';
import { experimental_transcribe as transcribe } from 'ai';
import { gateway } from '@ai-sdk/gateway';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

export async function POST(request) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid audio upload.' }, { status: 400 });
  }

  const audio = formData.get('audio');

  if (!(audio instanceof File)) {
    return NextResponse.json({ error: 'Audio file is required.' }, { status: 400 });
  }

  if (audio.size < 200) {
    return NextResponse.json({ error: 'The recording is too short.' }, { status: 400 });
  }

  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: 'The recording is too large. Keep answers under 90 seconds.' }, { status: 413 });
  }

  try {
    const bytes = new Uint8Array(await audio.arrayBuffer());

    const result = await transcribe({
      model: gateway.transcriptionModel('openai/gpt-4o-mini-transcribe'),
      audio: bytes,
      providerOptions: {
        gateway: {
          only: ['openai'],
        },
      },
    });

    const text = result.text?.trim();

    if (!text) {
      return NextResponse.json(
        { error: 'I could not detect enough speech to create a transcript.' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      text,
      duration_in_seconds: result.durationInSeconds ?? null,
    });
  } catch (transcriptionError) {
    console.error('Speak Mode transcription failed', transcriptionError);

    return NextResponse.json(
      {
        error: 'Automatic transcription is temporarily unavailable. You can type your answer and continue.',
      },
      { status: 503 }
    );
  }
}
