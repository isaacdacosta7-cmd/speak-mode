import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import SpeakBuddy from '@/components/SpeakBuddy';

export const dynamic = 'force-dynamic';

export default async function LivePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect('/login?next=/live');
  }

  return (
    <div className="page-stack">
      <header className="page-header cartoon-hero">
        <div>
          <span className="eyebrow">🔒 LIVE CONVERSATION</span>
          <h1>Muy pronto.</h1>
          <p>
            Human conversation sessions are being connected to the Speak Mode plans.
            When this module opens, eligible members will be able to practice with a real coach from inside the platform.
          </p>
          <span className="locked-badge">🔒 COMING SOON</span>
        </div>
        <SpeakBuddy variant="locked" />
      </header>

      <section className="continue-card">
        <div className="continue-top">
          <div>
            <span className="tiny-label">WHAT WILL UNLOCK HERE</span>
            <h2>Real conversation with a coach.</h2>
            <p>
              Plan-based monthly sessions, scheduling, coach feedback and a clear next-focus assignment after every conversation.
            </p>
          </div>
          <div className="progress-orb"><strong>🔒</strong><span>soon</span></div>
        </div>

        <div className="session-meta">
          <span>👥 Human coach</span>
          <span>🗓 Monthly sessions</span>
          <span>📝 Feedback</span>
          <span>🎯 Next focus</span>
        </div>

        <Link href="/daily" className="button button-primary">
          Continue with Daily Speak →
        </Link>
      </section>
    </div>
  );
}
