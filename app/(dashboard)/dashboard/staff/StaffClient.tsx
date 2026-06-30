'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type StaffUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: 'customer' | 'admin' | 'reception' | 'kitchen';
  created_at: string;
};

type StaffClientProps = {
  initialStaffList: StaffUser[];
  currentUserId: string;
};

export default function StaffClient({ initialStaffList, currentUserId }: StaffClientProps) {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffUser[]>(initialStaffList);

  // New staff form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'reception' | 'kitchen'>('reception');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Inline edit states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<'admin' | 'reception' | 'kitchen' | 'customer'>('reception');

  // Sync with prop updates
  useEffect(() => {
    setStaff(initialStaffList);
  }, [initialStaffList]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/staff/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to create staff account');
      }

      setSuccess(`Staff account created successfully for ${name}.`);
      setName('');
      setEmail('');
      setPassword('');
      setRole('reception');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'reception' | 'kitchen' | 'customer') => {
    setError(null);
    setSuccess(null);

    // Confirm demotion to customer
    if (newRole === 'customer' && !window.confirm('Demoting this staff member will immediately revoke their access to the dashboard. Proceed?')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/staff/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to update user role');
      }

      setSuccess('User role updated successfully.');
      setEditingUserId(null);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-size-headline-md)', color: 'var(--color-text-heading)', margin: 0 }}>
            Staff &amp; Credentials Panel
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-size-body-sm)', color: 'var(--color-text-secondary)', margin: 'var(--space-1) 0 0 0' }}>
            Provision secure staff accounts and manage dashboard access permissions.
          </p>
        </div>
      </div>

      {error && <div className="form-error-message" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>{error}</div>}
      {success && <div className="form-success-message" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-success-container)', color: 'var(--color-success)', border: '1px solid var(--color-success)' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)' }} className="md:grid-cols-12">
        {/* Table list of staff */}
        <div style={{ gridColumn: 'span 1' }} className="md:col-span-8">
          <div className="booking-history-card" style={{ padding: 'var(--space-6)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-size-headline-sm)', margin: '0 0 var(--space-4) 0', color: 'var(--color-text-heading)' }}>
              Operational Users
            </h3>
            
            <div style={{ overflowX: 'auto', flexGrow: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 'var(--text-size-body-sm)' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                    <th style={{ padding: '12px 8px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Name &amp; Email</th>
                    <th style={{ padding: '12px 8px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Role</th>
                    <th style={{ padding: '12px 8px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Date Added</th>
                    <th style={{ padding: '12px 8px', color: 'var(--color-text-secondary)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((user) => {
                    const isSelf = user.id === currentUserId;
                    return (
                      <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: '16px 8px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{user.name || 'Staff Member'} {isSelf && '(You)'}</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{user.email || 'No email'}</div>
                        </td>
                        <td style={{ padding: '16px 8px' }}>
                          {editingUserId === user.id ? (
                            <select
                              value={editingRole}
                              onChange={(e) => setEditingRole(e.target.value as any)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: '13px',
                                outline: 'none'
                              }}
                            >
                              <option value="reception">Reception</option>
                              <option value="kitchen">Kitchen</option>
                              <option value="admin">Admin</option>
                              <option value="customer">Demote (Customer)</option>
                            </select>
                          ) : (
                            <span className={`order-status-badge ${user.role === 'admin' ? 'status-placed' : user.role === 'reception' ? 'status-ready' : 'status-preparing'}`} style={{ textTransform: 'capitalize' }}>
                              {user.role}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '16px 8px', color: 'var(--color-text-secondary)' }}>
                          {formatDate(user.created_at)}
                        </td>
                        <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                          {isSelf ? (
                            <span style={{ fontSize: '12px', color: 'var(--color-text-disabled)' }}>Locked</span>
                          ) : editingUserId === user.id ? (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => setEditingUserId(null)}
                                style={{
                                  fontSize: '12px',
                                  color: 'var(--color-secondary)',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleUpdateRole(user.id, editingRole)}
                                style={{
                                  fontSize: '12px',
                                  color: 'var(--color-success)',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingUserId(user.id);
                                setEditingRole(user.role);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-primary)',
                                fontWeight: 600,
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                              Edit Role
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Form to add staff user */}
        <div style={{ gridColumn: 'span 1' }} className="md:col-span-4">
          <div className="booking-history-card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-size-headline-sm)', margin: '0 0 var(--space-4) 0', color: 'var(--color-text-heading)' }}>
              Add Staff Member
            </h3>
            <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-field">
                <label className="form-label" htmlFor="staffName">Full Name</label>
                <input
                  type="text"
                  id="staffName"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Min-jun Kim"
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="staffEmail">Email Address</label>
                <input
                  type="email"
                  id="staffEmail"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cove.com"
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="staffPassword">Initial Password</label>
                <input
                  type="password"
                  id="staffPassword"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  disabled={submitting}
                  minLength={6}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="staffRole">Operational Role</label>
                <select
                  id="staffRole"
                  className="form-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  disabled={submitting}
                  required
                  style={{ appearance: 'auto' }}
                >
                  <option value="reception">Reception Staff</option>
                  <option value="kitchen">Kitchen Staff</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="empty-state-btn"
                style={{ marginTop: 'var(--space-2)' }}
              >
                {submitting ? 'Creating...' : 'Create Staff Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
