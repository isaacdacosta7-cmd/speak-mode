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
          <span className="eyebrow">✨ SPEAK MODE PRIVATE BETA</span>
          <h1>Start training your English.</h1>
          <p>
            Create your account, complete the placement test and Speak Mode will
            open the conversation path that matches your current level.
          </p>
        </div>

        <div className="mini-stats">
          <div><strong>15</strong><span>min placement</span></div>
          <div><strong>5</strong><span>Speak Modes</span></div>
          <div><strong>Daily</strong><span>guided practice</span></div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-box">
          <span className="eyebrow">CREATE BETA ACCOUNT</span>
          <h2>Let’s get you inside.</h2>
          <p className="muted">
            Your placement, progress, XP, phrases and daily streak stay connected to your account.
          </p>
          <SignupForm />
        </div>
      </section>
    </main>
  );
}
