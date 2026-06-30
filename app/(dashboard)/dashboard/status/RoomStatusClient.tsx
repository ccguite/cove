'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import { getTodaysBookingsClient, getTodaysBlockedSlotsClient } from '@/lib/orders/orderClientService';

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

type RoomStatusClientProps = {
  rooms: Room[];
  initialBookings: Booking[];
  initialBlocks: BlockedSlot[];
};

export default function RoomStatusClient({
  rooms,
  initialBookings,
  initialBlocks,
}: RoomStatusClientProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [blocks, setBlocks] = useState<BlockedSlot[]>(initialBlocks);
  const [cleaningRoomIds, setCleaningRoomIds] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const supabase = createSupabaseBrowserClient();

  const refreshData = useCallback(async () => {
    try {
      const [dailyBookings, dailyBlocks] = await Promise.all([
        getTodaysBookingsClient(),
        getTodaysBlockedSlotsClient(),
      ]);
      setBookings(dailyBookings as Booking[]);
      setBlocks(dailyBlocks as BlockedSlot[]);
    } catch (err) {
      console.error('Failed to refresh status data:', err);
    }
  }, []);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Subscribe to changes
  useEffect(() => {
    const bookingsChannel = supabase
      .channel('room-status-bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          refreshData();
        }
      )
      .subscribe();

    const blocksChannel = supabase
      .channel('room-status-blocks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blocked_slots' },
        () => {
          refreshData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(blocksChannel);
    };
  }, [supabase, refreshData]);

  // Toggle cleaning flag
  const toggleCleaning = (roomId: string) => {
    setCleaningRoomIds(prev =>
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    );
  };

  // Occupancy calculation logic
  const checkOccupancy = (roomId: string) => {
    const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes();

    // 1. Check today's confirmed bookings
    const activeBooking = bookings.find(b => {
      if (b.room_id !== roomId) return false;
      const [h, m] = b.start_time.split(':').map(Number);
      const startMins = h * 60 + m;
      const endMins = startMins + b.duration_hours * 60;
      return currentMins >= startMins && currentMins < endMins;
    });

    if (activeBooking) {
      const [h, m] = activeBooking.start_time.split(':').map(Number);
      const endMins = h * 60 + m + activeBooking.duration_hours * 60;
      const endH = Math.floor(endMins / 60) % 24;
      const endM = endMins % 60;
      const ampm = endH >= 12 ? 'PM' : 'AM';
      const dispH = endH % 12 || 12;
      const endStr = `${dispH}:${String(endM).padStart(2, '0')} ${ampm}`;
      return { status: 'occupied', label: `Occupied - Ends ${endStr}` };
    }

    // 2. Check today's manual blocks
    const activeBlock = blocks.find(bl => {
      if (bl.room_id !== roomId) return false;
      const [h, m] = bl.start_time.split(':').map(Number);
      const startMins = h * 60 + m;
      const endMins = startMins + bl.duration_hours * 60;
      return currentMins >= startMins && currentMins < endMins;
    });

    if (activeBlock) {
      return {
        status: 'occupied',
        label: activeBlock.reason ? `Blocked: ${activeBlock.reason}` : 'Blocked (Admin)',
      };
    }

    return null;
  };

  return (
    <div className="orders-queue-grid">
      {rooms.map(room => {
        const occupancy = checkOccupancy(room.id);
        const isCleaning = cleaningRoomIds.includes(room.id);

        let statusClass = 'bg-[#10b981]'; // Available (Green)
        let statusLabel = 'Available';
        let badgeClass = 'status-ready';

        if (occupancy) {
          statusClass = 'bg-error'; // Occupied (Red)
          statusLabel = occupancy.label;
          badgeClass = 'status-placed';
        } else if (isCleaning) {
          statusClass = 'bg-tertiary-fixed-dim'; // Cleaning Needed (Amber)
          statusLabel = 'Needs Cleaning';
          badgeClass = 'status-preparing';
        }

        return (
          <div key={room.id} className="booking-history-card" style={{ gap: 'var(--space-2)' }}>
            <div className="flex items-center justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className={`w-3.5 h-3.5 rounded-full ${statusClass}`} style={{ width: '14px', height: '14px', borderRadius: '50%' }}></div>
                <h4 className="booking-room-name" style={{ margin: 0 }}>
                  {room.name} Room
                </h4>
              </div>
              <span className={`order-status-badge ${badgeClass}`}>
                {occupancy ? 'Occupied' : isCleaning ? 'Cleaning' : 'Available'}
              </span>
            </div>

            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-size-body-md)',
              color: 'var(--color-text-secondary)',
              marginTop: 'var(--space-2)',
              borderTop: '1px solid var(--color-border-subtle)',
              paddingTop: 'var(--space-3)'
            }}>
              <strong>Status:</strong> {statusLabel}
            </div>

            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-size-body-sm)',
              color: 'var(--color-text-secondary)'
            }}>
              <strong>Capacity:</strong> {room.min_pax}-{room.max_pax} guests • <strong>Price:</strong> ₹{room.price_per_hour}/hr
            </div>

            <div className="booking-card-footer" style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
              <button
                disabled={!!occupancy}
                onClick={() => toggleCleaning(room.id)}
                className="empty-state-btn"
                style={{
                  backgroundColor: occupancy
                    ? 'var(--color-surface-low)'
                    : isCleaning
                    ? 'var(--color-secondary-container)'
                    : 'var(--color-primary)',
                  color: occupancy
                    ? 'var(--color-text-disabled)'
                    : isCleaning
                    ? 'var(--color-primary)'
                    : 'var(--color-text-on-primary)',
                  padding: 'var(--space-2) var(--space-4)',
                  fontSize: 'var(--text-size-label-sm)',
                  borderRadius: 'var(--radius-lg)',
                  border: isCleaning ? '1px solid var(--color-border)' : 'none',
                  fontWeight: 600,
                  cursor: occupancy ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  marginLeft: 'auto'
                }}
              >
                {isCleaning ? 'Mark Available / Cleaned' : 'Mark Needs Cleaning'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
