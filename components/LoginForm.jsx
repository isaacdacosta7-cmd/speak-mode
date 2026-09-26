'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  async function handleSubmit(event) {
    event.preventDefault();

    if (!configured) {
      router.push('/dashboard');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setMessage('We could not sign you in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label>
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required={configured}
        />
      </label>

      <label>
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required={configured}
        />
      </label>

      {message ? <p className="form-message">{message}</p> : null}

      <button className="button button-primary button-full" type="submit" disabled={loading}>
        {loading ? 'Entering…' : configured ? 'Enter Speak Mode' : 'Preview the app'}
      </button>

      <p className="login-note">
        {configured
          ? 'Your progress, level and speaking history will be connected to this account.'
          : 'Demo mode is active while the Supabase project is being connected.'}
      </p>
    </form>
  );
}
