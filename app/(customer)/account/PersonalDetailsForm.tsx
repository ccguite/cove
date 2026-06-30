'use client';

import React, { useState } from 'react';

type PersonalDetailsFormProps = {
  initialName: string | null;
  initialEmail: string | null;
  initialPhone: string | null;
};

export default function PersonalDetailsForm({
  initialName,
  initialEmail,
  initialPhone,
}: PersonalDetailsFormProps) {
  const [name, setName] = useState(initialName || '');
  const [phone, setPhone] = useState(initialPhone || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while updating profile.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="details-section">
      <h3 className="details-title">My Details</h3>
      <form className="details-form" onSubmit={handleSave}>
        <div className="form-field">
          <label className="form-label" htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        
        <div className="form-field">
          <label className="form-label" htmlFor="emailAddress">Email</label>
          <input
            type="email"
            id="emailAddress"
            className="form-input"
            value={initialEmail || ''}
            disabled
          />
          <span className="form-hint">✓ Login Email</span>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            className="form-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            disabled={loading}
            placeholder="9876543210"
          />
        </div>

        {error && (
          <div className="form-error-message" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="form-success-message" role="alert">
            Profile changes saved successfully!
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn-save"
            disabled={loading || (name === initialName && phone === initialPhone)}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  );
}
