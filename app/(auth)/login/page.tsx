'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import { z } from 'zod';
import Link from 'next/link';
import './login.css';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }

      // Successful auth - redirect and refresh
      router.push(next || '/');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = () => {
    router.push('/');
  };

  return (
    <div className="login-page">
      {/* Desktop Header */}
      <nav className="nav-bar">
        <Link href="/" className="brand-name">COVE</Link>
        <div className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/rooms" className="nav-link">Rooms</Link>
          <Link href="/menu" className="nav-link">Menu</Link>
        </div>
        <button onClick={() => router.push('/rooms')} className="btn-book-now">
          Book Now
        </button>
      </nav>

      {/* Main card */}
      <main className="login-container">
        <div className="login-card fade-in">
          <div className="login-card-accent"></div>
          
          <div className="login-header">
            <h1 className="login-header-logo">COVE</h1>
            <h2 className="login-title">Welcome to COVE</h2>
            <p className="login-subtitle">
              {isSignUp ? 'Create an account to start booking.' : 'Sign in to access your account.'}
            </p>
          </div>

          {/* Sign In / Sign Up Toggles */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${!isSignUp ? 'active' : ''}`}
              onClick={() => {
                setIsSignUp(false);
                setError(null);
              }}
              disabled={loading}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${isSignUp ? 'active' : ''}`}
              onClick={() => {
                setIsSignUp(true);
                setError(null);
              }}
              disabled={loading}
            >
              Sign Up
            </button>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoFocus
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {error && <p className="error-message" role="alert">{error}</p>}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="actions-divider">
            <div className="divider-line-wrapper">
              <div className="divider-line"></div>
              <span className="divider-text">or</span>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleGuestContinue}
              disabled={loading}
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </main>

      <footer className="auth-footer">
        <p>
          By continuing, you agree to our{' '}
          <a href="#" className="auth-footer-link">Terms of Service</a> &amp;{' '}
          <a href="#" className="auth-footer-link">Privacy Policy</a>.
        </p>
        <p style={{ marginTop: '8px', opacity: 0.7 }}>© 2026 COVE Cafe &amp; Lounge.</p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="login-page">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
