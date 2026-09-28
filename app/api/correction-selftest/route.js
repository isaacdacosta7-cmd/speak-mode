import { NextResponse } from 'next/server';
import {
  correctEnglishAnswer,
  correctEnglishAnswerFull,
} from '@/lib/serverCorrection';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.VERCEL_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const localCases = [
    {
      label: 'Spanish',
      text: 'hola amigo como estas',
      options: { type: 'open' },
      expected: false,
    },
    {
      label: 'Misspelled Spanish',
      text: 'holaa amigoo komoo estas',
      options: { type: 'open' },
      expected: false,
    },
    {
      label: 'English spelling',
      text: 'I likke traveling becouse it is fun.',
      options: { type: 'open' },
      expected: false,
    },
    {
      label: 'Grammar rule',
      text: 'I goes to work every day.',
      options: { type: 'open' },
      expected: false,
    },
    {
      label: 'Valid English',
      text: 'I usually start work early in the morning.',
      options: { type: 'open' },
      expected: true,
    },
  ];

  const localResults = localCases.map((item) => {
    const result = correctEnglishAnswer(item.text, item.options);
    return {
      ...item,
      actual: result.canContinue,
      passed: result.canContinue === item.expected,
      corrections: result.corrections,
    };
  });

  const remoteCases = [
    {
      label: 'Context grammar',
      text: 'Please answers quickly.',
      expected: false,
    },
    {
      label: 'Confused word',
      text: 'Our team will have there project ready by January.',
      expected: false,
    },
    {
      label: 'Valid grammar',
      text: 'Our team will have their project ready by January.',
      expected: true,
    },
  ];

  const remoteResults = [];

  for (const item of remoteCases) {
    const result = await correctEnglishAnswerFull(item.text, {
      type: 'open',
    });

    remoteResults.push({
      ...item,
      actual: result.canContinue,
      passed: result.canContinue === item.expected,
      status: result.status,
      externalAvailable: result.externalAvailable,
      corrections: result.corrections,
    });
  }

  const all = [...localResults, ...remoteResults];
  const passed = all.every((item) => item.passed);

  return NextResponse.json(
    {
      passed,
      totals: {
        cases: all.length,
        passed: all.filter((item) => item.passed).length,
        failed: all.filter((item) => !item.passed).length,
      },
      localResults,
      remoteResults,
    },
    { status: passed ? 200 : 500 }
  );
}
