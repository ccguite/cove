'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type Room = {
  id: string;
  name: string;
  slug: string;
  min_pax: number;
  max_pax: number;
  price_per_hour: number;
};

type Booking = {
  id: string;
  room_id: string;
  date: string;
  start_time: string;
  duration_hours: number;
  status: string;
};

type BlockedSlot = {
  id: string;
  room_id: string;
  date: string;
  start_time: string;
  duration_hours: number;
  reason: string | null;
};

type SlotsClientProps = {
  rooms: Room[];
  initialBookings: Booking[];
  initialBlocks: BlockedSlot[];
};

export default function SlotsClient({ rooms, initialBookings, initialBlocks }: SlotsClientProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [blocks, setBlocks] = useState<BlockedSlot[]>(initialBlocks);
  // Form states
  const [roomId, setRoomId] = useState(rooms[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [durationHours, setDurationHours] = useState('1');
  const [reason, setReason] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sync state with props
  useEffect(() => {
    setBookings(initialBookings);
    setBlocks(initialBlocks);
  }, [initialBookings, initialBlocks]);



  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/slots/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          date,
          startTime,
          durationHours: parseInt(durationHours, 10),
          reason: reason.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to create slot block');
      }

      setSuccess('Slot blocked successfully.');
      setReason('');
      // Refetch page data
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnblockClick = async (blockId: string) => {
    if (!window.confirm('Are you sure you want to unblock this slot?')) {
      return;
    }
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/slots/unblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to unblock slot');
      }

      setSuccess('Slot unblocked successfully.');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const formatTimeRange = (start: string, duration: number) => {
    try {
      const [hours, minutes] = start.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + duration * 60;
      
      const format12 = (totalMin: number) => {
        const h = Math.floor(totalMin / 60) % 24;
        const m = totalMin % 60;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const dispH = h % 12 || 12;
        return `${dispH}:${String(m).padStart(2, '0')} ${ampm}`;
      };
      
      return `${format12(hours * 60 + minutes)} - ${format12(totalMinutes)}`;
    } catch {
      return `${start} (${duration}h)`;
    }
  };

  const formatBlockDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const allHours = [
    '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-size-headline-md)', color: 'var(--color-text-heading)', margin: 0 }}>
            Space Blocks &amp; Operations
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-size-body-sm)', color: 'var(--color-text-secondary)', margin: 'var(--space-1) 0 0 0' }}>
            Manage manual reservations, space blocks, and operational statuses.
          </p>
        </div>
      </div>

      {error && <div className="form-error-message" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>{error}</div>}
      {success && <div className="form-success-message" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-success-container)', color: 'var(--color-success)', border: '1px solid var(--color-success)' }}>{success}</div>}



      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)' }} className="md:grid-cols-12">
        <div style={{ gridColumn: 'span 1' }} className="md:col-span-5">
          {/* 2. Block Creation Form */}
          <div className="booking-history-card" style={{ padding: 'var(--space-6)', height: '100%' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-size-headline-sm)', margin: '0 0 var(--space-4) 0', color: 'var(--color-text-heading)' }}>
              Create Manual Block
            </h3>
            <form onSubmit={handleBlockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-field">
                <label className="form-label" htmlFor="blockRoom">Target Lounge Space</label>
                <select
                  id="blockRoom"
                  className="form-input"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  disabled={submitting}
                  required
                >
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>{room.name} Room</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="blockDate">Target Date</label>
                <input
                  type="date"
                  id="blockDate"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-field">
                  <label className="form-label" htmlFor="blockStart">Start Time</label>
                  <select
                    id="blockStart"
                    className="form-input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={submitting}
                    required
                  >
                    {allHours.map(hour => {
                      const hourNum = parseInt(hour.split(':')[0], 10);
                      const ampm = hourNum >= 12 ? 'PM' : 'AM';
                      const dispHour = hourNum % 12 || 12;
                      return (
                        <option key={hour} value={hour}>{dispHour}:00 {ampm}</option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor="blockDuration">Duration (Hours)</label>
                  <select
                    id="blockDuration"
                    className="form-input"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    disabled={submitting}
                    required
                  >
                    {[1, 2, 3, 4, 5].map(h => (
                      <option key={h} value={h}>{h} {h === 1 ? 'Hour' : 'Hours'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="blockReason">Reason / Notes</label>
                <input
                  type="text"
                  id="blockReason"
                  className="form-input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. VIP Booking, Maintenance"
                  disabled={submitting}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="empty-state-btn"
                style={{ marginTop: 'var(--space-2)' }}
              >
                {submitting ? 'Blocking...' : 'Block Slot'}
              </button>
            </form>
          </div>
        </div>

        <div style={{ gridColumn: 'span 1' }} className="md:col-span-7">
          {/* 3. Timeline / Active Blocks Queue */}
          <div className="booking-history-card" style={{ padding: 'var(--space-6)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-size-headline-sm)', margin: '0 0 var(--space-4) 0', color: 'var(--color-text-heading)' }}>
              Active Manual Blocks
            </h3>
            
            {blocks.length === 0 ? (
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8) 0', color: 'var(--color-text-disabled)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>block</span>
                <p style={{ marginTop: '8px', fontSize: 'var(--text-size-body-sm)' }}>No manual slot blocks currently configured.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '400px', paddingRight: '4px' }}>
                {blocks
                  .slice()
                  .sort((a, b) => {
                    const dateCompare = a.date.localeCompare(b.date);
                    if (dateCompare !== 0) return dateCompare;
                    return a.start_time.localeCompare(b.start_time);
                  })
                  .map(block => {
                    const room = rooms.find(r => r.id === block.room_id);
                    return (
                      <div
                        key={block.id}
                        style={{
                          border: '1px solid var(--color-border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '12px var(--space-4)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: 'var(--color-surface-low)',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-size-body-md)', color: 'var(--color-text-heading)', fontWeight: 600 }}>
                            {room?.name || 'Private Room'} — {block.reason || 'Blocked'}
                          </span>
                          <span style={{ fontSize: 'var(--text-size-label-sm)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
                            {formatBlockDate(block.date)} • {formatTimeRange(block.start_time, block.duration_hours)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleUnblockClick(block.id)}
                          style={{
                            border: '1px solid var(--color-error)',
                            color: 'var(--color-error)',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: 'transparent',
                            transition: 'all 0.2s ease',
                          }}
                          className="unblock-btn-hover"
                        >
                          Unblock
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
