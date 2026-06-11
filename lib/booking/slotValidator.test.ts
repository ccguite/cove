import { describe, it, expect, vi } from 'vitest';
import {
  timeStringToMinutes,
  minutesToTimeString,
  validateBookingBoundaries,
  validateGuestCount,
  checkSlotConflict,
  getAvailableSlots,
} from './slotValidator';

describe('Time Conversion Utilities', () => {
  it('should convert time string to minutes from midnight', () => {
    expect(timeStringToMinutes('10:00')).toBe(600);
    expect(timeStringToMinutes('23:00')).toBe(1380);
    expect(timeStringToMinutes('14:30')).toBe(870);
  });

  it('should convert minutes back to time string', () => {
    expect(minutesToTimeString(600)).toBe('10:00:00');
    expect(minutesToTimeString(1380)).toBe('23:00:00');
  });
});

describe('Booking Boundaries (Duration & 11PM Cutoff)', () => {
  it('should pass on valid durations and times', () => {
    expect(validateBookingBoundaries('10:00', 2)).toBe(true);
    expect(validateBookingBoundaries('18:00', 5)).toBe(true); // ends exactly at 23:00
  });

  it('should fail on duration violations (< 1 hr or > 5 hrs)', () => {
    expect(validateBookingBoundaries('10:00', 0)).toBe(false);
    expect(validateBookingBoundaries('10:00', 6)).toBe(false);
  });

  it('should fail on closing cutoff violations (ends after 11PM)', () => {
    expect(validateBookingBoundaries('22:00', 2)).toBe(false); // ends at 24:00 (midnight)
    expect(validateBookingBoundaries('19:00', 5)).toBe(false); // ends at 24:00
  });
});

describe('Guest Count Capacity Validation', () => {
  it('should validate Husk bounds (1-2)', () => {
    expect(validateGuestCount('husk', 1)).toBe(true);
    expect(validateGuestCount('husk', 2)).toBe(true);
    expect(validateGuestCount('husk', 3)).toBe(false);
    expect(validateGuestCount('husk', 0)).toBe(false);
  });

  it('should validate Haven bounds (3-8)', () => {
    expect(validateGuestCount('haven', 3)).toBe(true);
    expect(validateGuestCount('haven', 5)).toBe(true);
    expect(validateGuestCount('haven', 8)).toBe(true);
    expect(validateGuestCount('haven', 2)).toBe(false);
    expect(validateGuestCount('haven', 9)).toBe(false);
  });
});

describe('Database Conflict Detections', () => {
  // Mock Supabase client
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    single: vi.fn(),
  } as any;

  it('should detect overlaps with confirmed bookings', async () => {
    // Mock confirmed bookings data
    mockSupabase.from = vi.fn().mockImplementation((table) => {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                data: table === 'bookings' ? [{ start_time: '12:00:00', duration_hours: 2 }] : [],
                error: null,
              }),
              gt: () => ({
                data: [],
              })
            })
          })
        })
      };
    });

    // Overlapping slot lock proposed: 13:00 for 1 hr conflicts with [12:00, 14:00)
    const conflict = await checkSlotConflict(mockSupabase, 'room-1', '2026-06-12', '13:00', 1);
    expect(conflict).toBe(true);

    // Non-overlapping proposed: 10:00 for 2 hrs does not conflict with [12:00, 14:00)
    const noConflict = await checkSlotConflict(mockSupabase, 'room-1', '2026-06-12', '10:00', 2);
    expect(noConflict).toBe(false);
  });
});
