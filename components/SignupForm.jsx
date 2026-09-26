'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    if (password.length < 8) {
      setMessage('Use at least 8 characters for your password.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Your passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.session) {
        router.replace('/dashboard');
        router.refresh();
        return;
      }

      setSuccess(true);
    } catch {
      setMessage('We could not create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="auth-success-card">
        <span className="auth-success-icon">✓</span>
        <h3>Check your email</h3>
        <p>
          We created your Speak Mode account. Open the confirmation email to activate your access.
        </p>
        <Link className="button button-ghost button-full" href="/login">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label>
        <span>Full name</span>
        <input
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Your name"
          autoComplete="name"
          required
        />
      </label>

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
          placeholder="At least 8 characters"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      <label>
        <span>Confirm password</span>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Repeat your password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      {message ? <p className="form-message">{message}</p> : null}

      <button className="button button-primary button-full" type="submit" disabled={loading}>
        {loading ? 'Creating account…' : 'Create my account'}
      </button>

      <p className="login-note">
        Already have an account? <Link className="inline-auth-link" href="/login">Sign in</Link>
      </p>
    </form>
  );
}
