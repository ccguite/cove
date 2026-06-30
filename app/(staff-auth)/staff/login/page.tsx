'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import { z } from 'zod';
import Link from 'next/link';
import './login.css';

const STAFF_ROLES = new Set(['admin', 'reception', 'kitchen']);

const staffLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Map role → their dashboard root
function dashboardFor(role: string): string {
  if (role === 'admin') return '/admin';
  if (role === 'reception') return '/reception';
  if (role === 'kitchen') return '/kitchen';
  return '/staff/login';
}

function StaffLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next');
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === 'unauthorized' ? 'You are not authorized to access that area.' : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = staffLoginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();

      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const user = data.user;
      if (!user) throw new Error('Authentication failed.');

      // Fetch role from public.users
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role, is_staff')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error('Unable to verify staff credentials. Please contact your administrator.');
      }

      // Block customers from the staff portal
      if (!profile.is_staff || !STAFF_ROLES.has(profile.role)) {
        await supabase.auth.signOut();
        setError('This account is not authorized for staff access.');
        return;
      }

      // Successful staff login — redirect to role dashboard
      const destination = nextPath && nextPath.startsWith('/' + profile.role)
        ? nextPath
        : dashboardFor(profile.role);

      router.push(destination);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-login-page">
      {/* Top bar */}
      <div className="staff-portal-topbar">
        <div className="staff-portal-brand">
          <span className="staff-portal-wordmark">COVE</span>
          <span className="staff-portal-badge">Staff Portal</span>
        </div>
        <Link href="/" className="staff-back-link">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Customer Site
        </Link>
      </div>

      {/* Card */}
      <main className="staff-login-container">
        <div className="staff-login-card">
          {/* Lock icon */}
          <div className="staff-lock-icon" aria-hidden="true">
            <span className="material-symbols-outlined">lock</span>
          </div>

          <h1 className="staff-login-title">Staff Sign In</h1>
          <p className="staff-login-subtitle">
            Use your COVE staff credentials to continue
          </p>

          {/* Error banner */}
          {error && (
            <div className="staff-error-banner" role="alert">
              <span className="material-symbols-outlined">error</span>
              <p>{error}</p>
            </div>
          )}

          <form className="staff-login-form" onSubmit={handleSubmit} noValidate>
            <div className="staff-input-group">
              <label className="staff-input-label" htmlFor="staff-email">
                Email Address
              </label>
              <input
                type="email"
                id="staff-email"
                className="staff-input-field"
                placeholder="staff@cove.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="staff-input-group">
              <label className="staff-input-label" htmlFor="staff-password">
                Password
              </label>
              <input
                type="password"
                id="staff-password"
                className="staff-input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="staff-btn-submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In to Staff Portal'}
            </button>
          </form>

          {/* Customer redirect note */}
          <div className="staff-customer-note">
            <p>
              Not a staff member?{' '}
              <Link href="/login">Customer login →</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function StaffLoginPage() {
  return (
    <Suspense fallback={<div className="staff-login-page" />}>
      <StaffLoginContent />
    </Suspense>
  );
}
