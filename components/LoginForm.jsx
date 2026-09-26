'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage(error.message);
        return;
      }

      const next = searchParams.get('next');
      const safeNext = next && next.startsWith('/') ? next : '/dashboard';

      router.replace(safeNext);
      router.refresh();
    } catch {
      setMessage('We could not sign you in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {searchParams.get('confirmed') === '1' ? (
        <p className="form-success">Email confirmed. You can sign in now.</p>
      ) : null}

      {searchParams.get('auth_error') === '1' ? (
        <p className="form-message">The confirmation link could not be completed. Try signing in again.</p>
      ) : null}

      <label>
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </label>

      <label>
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </label>

      {message ? <p className="form-message">{message}</p> : null}

      <button className="button button-primary button-full" type="submit" disabled={loading}>
        {loading ? 'Entering…' : 'Enter Speak Mode'}
      </button>

      <p className="login-note">
        New here? <Link className="inline-auth-link" href="/signup">Create your account</Link>
      </p>
    </form>
  );
}
