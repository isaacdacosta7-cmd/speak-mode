import Link from 'next/link';
import { redirect } from 'next/navigation';
import Brand from '@/components/Brand';
import LoginForm from '@/components/LoginForm';
import { createClient } from '@/lib/supabase/server';

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims?.sub) {
    redirect('/dashboard');
  }

  const nextPath = params?.next?.startsWith('/') ? params.next : '/dashboard';

  return (
    <main className="login-page">
      <section className="login-visual">
        <Link href="/" aria-label="Speak Mode home"><Brand size="large" /></Link>
        <div className="login-copy">
          <span className="eyebrow">YOUR ENGLISH GYM</span>
          <h1>Speak until it feels natural.</h1>
          <p>Short sessions. Real reactions. Repeated phrases. Conversation every day.</p>
        </div>
        <div className="mini-stats">
          <div><strong>15–20</strong><span>min daily</span></div>
          <div><strong>5</strong><span>learning paths</span></div>
          <div><strong>1</strong><span>goal: speak</span></div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-box">
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Ready to train?</h2>
          <p className="muted">Continue exactly where you left off.</p>
          <LoginForm
            confirmed={params?.confirmed === '1'}
            authError={params?.auth_error === '1'}
            nextPath={nextPath}
          />
        </div>
      </section>
    </main>
  );
}
