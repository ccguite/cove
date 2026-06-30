'use client';

import React, { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';

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

export default function SettingsTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    // 1. Validation rules
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // 2. Fetch session email
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user || !session.user.email) {
        setError('You must be logged in to change your password.');
        setLoading(false);
        return;
      }

      // 3. Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: currentPassword,
      });

      if (signInError) {
        setError('Current password is incorrect.');
        setLoading(false);
        return;
      }

      // 4. Update the user password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      setSuccess(true);
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while updating your password.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="settings-section" style={{ maxWidth: '480px', margin: 'var(--space-6) auto' }}>
      <h3 className="settings-tab-title" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-size-headline-sm)', marginBottom: 'var(--space-2)', color: 'var(--color-text-heading)', fontWeight: 600 }}>
        Change Password
      </h3>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-size-body-sm)', marginBottom: 'var(--space-6)', lineHeight: 1.5 }}>
        Update your login credentials below. Choose a strong password to ensure the security of your COVE account.
      </p>

      <form className="settings-form" onSubmit={handleUpdatePassword}>
        <div className="form-field">
          <label className="form-label" htmlFor="currentPassword">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            className="form-input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={loading}
            required
            placeholder="••••••••"
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            minLength={8}
            placeholder="••••••••"
          />
          <div className="password-requirements" style={{ fontSize: 'var(--text-size-body-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)', lineHeight: 1.4 }}>
            Must be at least 8 characters and include uppercase, lowercase, number, and special character.
          </div>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            className="form-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
            minLength={8}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="form-error-message" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="form-success-message" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
            Password updated successfully!
          </div>
        )}

        <div className="form-actions" style={{ marginTop: 'var(--space-4)' }}>
          <button
            type="submit"
            className="btn-save"
            disabled={loading || !currentPassword || !password || !confirmPassword}
            style={{ width: '100%' }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </section>
  );
}
