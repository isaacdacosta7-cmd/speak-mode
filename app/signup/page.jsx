import Link from 'next/link';
import { redirect } from 'next/navigation';
import Brand from '@/components/Brand';
import SignupForm from '@/components/SignupForm';
import { createClient } from '@/lib/supabase/server';

export default async function SignupPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims?.sub) {
    redirect('/dashboard');
  }

  return (
    <main className="login-page">
      <section className="login-visual signup-visual">
        <Link href="/" aria-label="Speak Mode home"><Brand size="large" /></Link>
        <div className="login-copy">
          <span className="eyebrow">ENTER SPEAK MODE</span>
          <h1>Start training your English.</h1>
          <p>Build automatic responses through repetition, listening and real conversation practice.</p>
        </div>
        <div className="mini-stats">
          <div><strong>5</strong><span>learning paths</span></div>
          <div><strong>Daily</strong><span>speaking practice</span></div>
          <div><strong>Live</strong><span>coach sessions</span></div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-box">
          <span className="eyebrow">CREATE ACCOUNT</span>
          <h2>Let’s get you inside.</h2>
          <p className="muted">Your level, progress and practice history will stay connected to your account.</p>
          <SignupForm />
        </div>
      </section>
    </main>
  );
}
