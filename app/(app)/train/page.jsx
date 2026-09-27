import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const modeInfo = {
  START_MODE: {
    label: 'START MODE',
    headline: 'Build the English you can use immediately.',
    session: 'Introduce Yourself',
    focus: 'First conversation blocks',
  },
  RESPONSE_MODE: {
    label: 'RESPONSE MODE',
    headline: 'Turn familiar English into faster responses.',
    session: 'Answer Without Freezing',
    focus: 'Quick answers and conversation bridges',
  },
  CONVERSATION_MODE: {
    label: 'CONVERSATION MODE',
    headline: 'Learn to keep the conversation moving.',
    session: 'Keep It Going',
    focus: 'Reactions and follow-up questions',
  },
  FLUENCY_MODE: {
    label: 'FLUENCY MODE',
    headline: 'Train rhythm, speed and natural conversational chunks.',
    session: 'Sound More Natural',
    focus: 'Flexible phrases and spontaneous responses',
  },
  NATIVE_FLOW: {
    label: 'NATIVE FLOW',
    headline: 'Add nuance, precision and personality to your English.',
    session: 'Precision & Personality',
    focus: 'High-level reactions and conversational control',
  },
};

const loopSteps = [
  ['01', 'Hear It', 'Listen to the complete thought in natural English.'],
  ['02', 'Copy It', 'Repeat the rhythm until the phrase feels comfortable.'],
  ['03', 'Build It', 'Change the structure with your own information.'],
  ['04', 'Answer It', 'Respond quickly with your own words.'],
  ['05', 'Use It', 'Choose a natural move inside a real situation.'],
  ['06', 'Speak It', 'Finish by producing the English out loud.'],
];

export const dynamic = 'force-dynamic';

export default async function TrainPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect('/login?next=/train');
  }

  const [{ data: profile }, { data: progress }] = await Promise.all([
    supabase
      .from('profiles')
      .select('placement_score, placement_mode')
      .eq('id', claims.sub)
      .maybeSingle(),
    supabase
      .from('training_progress')
      .select('session_key, completion_percent, xp')
      .eq('user_id', claims.sub)
      .eq('session_key', 'session-01')
      .maybeSingle(),
  ]);

  if (!profile?.placement_mode) {
    return (
      <div className="page-stack">
        <header className="page-header">
          <span className="eyebrow">TRAIN</span>
          <h1>Your training path starts with placement.</h1>
          <p>Complete the 15-minute test and Speak Mode will open the right conversation track for you.</p>
        </header>

        <section className="continue-card">
          <div className="continue-top">
            <div>
              <span className="tiny-label">STEP 01</span>
              <h2>Take your placement test</h2>
              <p>Listening · Reaction · Real English · Writing · 100 points</p>
            </div>
            <div className="progress-orb"><strong>0%</strong><span>ready</span></div>
          </div>
          <div className="progress-track"><span style={{ width: '0%' }} /></div>
          <Link href="/placement-test" className="button button-primary">Start placement test →</Link>
        </section>

        <div className="loop-grid">
          {loopSteps.map(([number, title, text]) => (
            <article className="loop-card" key={title}>
              <span>{number}</span><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    );
  }

  const info = modeInfo[profile.placement_mode] || modeInfo.START_MODE;
  const completion = progress?.completion_percent || 0;

  return (
    <div className="page-stack">
      <header className="page-header">
        <span className="eyebrow">{info.label}</span>
        <h1>{info.headline}</h1>
        <p>Placement score: {profile.placement_score}/100 · Your first training session is ready.</p>
      </header>

      <section className="continue-card">
        <div className="continue-top">
          <div>
            <span className="tiny-label">SESSION 01 · {info.focus.toUpperCase()}</span>
            <h2>{info.session}</h2>
            <p>Hear → Copy → Build → Answer → Use → Speak</p>
          </div>
          <div className="progress-orb"><strong>{completion}%</strong><span>done</span></div>
        </div>

        <div className="progress-track"><span style={{ width: `${completion}%` }} /></div>

        <div className="session-meta">
          <span>🎧 Natural audio</span>
          <span>🗣 Repetition</span>
          <span>⚡ Quick response</span>
          <span>🎙 Speaking practice</span>
        </div>

        <Link href="/train/session-01" className="button button-primary">
          {completion >= 100 ? 'Practice session again →' : 'Start session →'}
        </Link>
      </section>

      <div className="loop-grid">
        {loopSteps.map(([number, title, text]) => (
          <article className="loop-card" key={title}>
            <span>{number}</span><h3>{title}</h3><p>{text}</p>
          </article>
        ))}
      </div>

      <section className="split-grid">
        <article className="panel-card">
          <span className="tiny-label">NEXT</span>
          <h3>Session 02</h3>
          <p>The next session will unlock as we build the complete {info.label} path.</p>
        </article>
        <article className="panel-card accent-panel">
          <span className="tiny-label">POWER PHRASES</span>
          <h3>Review useful conversation blocks.</h3>
          <p>Use the phrase library between sessions to keep the language fresh.</p>
          <Link href="/phrases" className="text-link">Open Power Phrases →</Link>
        </article>
      </section>
    </div>
  );
}
