'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import { z } from 'zod';
import Link from 'next/link';
import './login.css';

const validatePasswordStrength = (pwd: string): string | null => {
  if (pwd.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(pwd)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[a-z]/.test(pwd)) {
    return 'Password must contain at least one lowercase letter.';
  }
  if (!/[0-9]/.test(pwd)) {
    return 'Password must contain at least one number.';
  }
  if (!/[!@#$%^&*(),.?":{}|<>\-_=+]/.test(pwd)) {
    return 'Password must contain at least one special character (e.g. !, @, #, $, %, ^, &, *).';
  }
  return null;
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Clean up any leaked/active staff session on the customer login page
  React.useEffect(() => {
    const clearStaffSession = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile && ['admin', 'reception', 'kitchen'].includes(profile.role)) {
          await supabase.auth.signOut();
          try {
            document.cookie.split(';').forEach((c) => {
              document.cookie = c
                .replace(/^ +/, '')
                .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
            });
          } catch {}
          router.refresh();
        }
      }
    };
    clearStaffSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    // Validate email format
    const emailResult = z.string().email('Please enter a valid email address').safeParse(email);
    if (!emailResult.success) {
      setError(emailResult.error.issues[0].message);
      return;
    }

    // Validate password
    if (isSignUp) {
      const passwordError = validatePasswordStrength(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
    } else {
      if (!password) {
        setError('Please enter your password.');
        return;
      }
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();

      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        
        if (data.session) {
          const redirectUrl = next && !next.startsWith('/admin') && !next.startsWith('/reception') && !next.startsWith('/kitchen')
            ? next
            : '/';
          router.push(redirectUrl);
          router.refresh();
          return;
        }
        
        if (data.user) {
          setSignUpSuccess(true);
        }
        return;
      }

      // Sign In flow
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const user = data.user;
      if (!user) throw new Error('Authentication failed.');

      // Fetch role — block staff accounts from the customer portal
      const { data: profile } = await supabase
        .from('users')
        .select('role, is_staff')
        .eq('id', user.id)
        .single();

      if (profile?.is_staff) {
        // Immediately invalidate the session — staff must not enter customer portal
        await supabase.auth.signOut();
        setError('This account belongs to a staff member. Please use the Staff Portal.');
        return;
      }

      // Customer — redirect to intended destination
      const redirectUrl = next && !next.startsWith('/admin') && !next.startsWith('/reception') && !next.startsWith('/kitchen')
        ? next
        : '/';
      router.push(redirectUrl);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Please enter a valid 6-digit confirmation code.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup',
      });

      if (verifyError) throw verifyError;

      if (data.user) {
        const redirectUrl = next && !next.startsWith('/admin') && !next.startsWith('/reception') && !next.startsWith('/kitchen')
          ? next
          : '/';
        router.push(redirectUrl);
        router.refresh();
      } else {
        throw new Error('Verification succeeded but failed to establish a session.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed. Please check the code.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setInfoMessage(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (resendError) throw resendError;
      setInfoMessage('Verification code resent successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to resend verification code.';
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
          <Link href="/menu" className="nav-link">Cafe</Link>
          <Link href="/features" className="nav-link">Experience</Link>
          <Link href="/location" className="nav-link">Location</Link>
        </div>
      </nav>

      {/* Main card */}
      <main className="login-container">
        {signUpSuccess ? (
          <div className="login-card fade-in">
            <div className="login-card-accent"></div>
            
            <div className="login-header">
              <h1 className="login-header-logo">COVE</h1>
              <h2 className="login-title">Verify Your Email</h2>
              <p className="login-subtitle" style={{ lineHeight: 1.6 }}>
                We've sent a 6-digit verification code to <strong>{email}</strong>. Please enter the code below to verify your account.
              </p>
            </div>

            <form className="login-form" onSubmit={handleVerifyOtp}>
              <div className="input-group">
                <label className="input-label" htmlFor="otp">Verification Code</label>
                <input
                  type="text"
                  id="otp"
                  className="input-field"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  required
                  autoFocus
                  style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '20px', fontWeight: 'bold' }}
                />
              </div>

              {error && <p className="error-message" role="alert">{error}</p>}
              {infoMessage && <p className="success-message" role="alert" style={{ color: 'var(--color-primary)', fontSize: '12px', marginTop: '6px' }}>{infoMessage}</p>}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading || otp.length !== 6}
                style={{ marginTop: 'var(--space-4)' }}
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>

            <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'center' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleResendOtp}
                disabled={loading}
                style={{ width: '100%' }}
              >
                Resend Code
              </button>
              
              <button
                type="button"
                className="auth-footer-link"
                onClick={() => {
                  setIsSignUp(true);
                  setSignUpSuccess(false);
                  setOtp('');
                  setError(null);
                  setInfoMessage(null);
                }}
                disabled={loading}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Change Email / Back
              </button>
            </div>
          </div>
        ) : (
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
                {isSignUp && (
                  <div className="password-requirements" style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
                    Must be at least 8 characters and include uppercase, lowercase, number, and special character.
                  </div>
                )}
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
        )}
      </main>

      <footer className="auth-footer">
        <p>
          By continuing, you agree to our{' '}
          <Link href="/policies" className="auth-footer-link">Booking &amp; Refund Policies</Link> &amp;{' '}
          <Link href="/privacy" className="auth-footer-link">Privacy Policy</Link>.
        </p>
        <p style={{ marginTop: '8px', opacity: 0.7 }}>© 2026 COVE Cafe &amp; Lounge.</p>
        <p style={{ marginTop: '10px' }}>
          <Link href="/staff/login" className="auth-footer-link">
            Staff member? Use the Staff Portal →
          </Link>
        </p>
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
