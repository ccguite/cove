# Spec: Unit 8 — Booking Slot Validation Logic + Tests

## Goal

Build the core room booking business logic utilities inside `lib/booking/slotValidator.ts` and write a comprehensive unit test suite in `lib/booking/slotValidator.test.ts` using Vitest to enforce capacity bounds, time ranges, and slot overlap checks.

---

## Design

### Core Business Rules & Invariants
1. **Operating Hours**: The café experience rooms operate from **10:00 AM to 11:00 PM** daily.
   - The first bookable hourly slot starts at **10:00 AM**.
   - The last bookable hourly slot starts at **10:00 PM** (to finish by 11:00 PM).
2. **Booking Durations**: A customer can book a room for any integer duration between **1 and 5 hours**.
3. **Closing Time Cutoff**: A booking cannot extend past **11:00 PM**.
   - E.g., a booking starting at 9:00 PM can have a maximum duration of 2 hours.
4. **Guest Count Capacities**:
   - **Husk (Couple Room)**: Minimum 1 guest, maximum 2 guests.
   - **Haven (Group Room)**: Minimum 3 guests, maximum 8 guests.
5. **Slot Overlap Conflicts**: A time slot is unavailable if it overlaps with:
   - A confirmed booking (`bookings` table where `status = 'confirmed'`).
   - An active checkout lock (`slot_locks` table where `expires_at > now()`).
   - A manual admin block (`blocked_slots` table).
6. **Interval Overlap Math**:
   - For a given room and date, two time intervals $[S_A, E_A)$ and $[S_B, E_B)$ overlap if and only if:
     $$S_A < E_B \quad \text{AND} \quad S_B < E_A$$
   - Where the start time $S$ and end time $E$ are represented as minutes from midnight or decimal hours.

---

## Implementation

### 7.1 Folder Structure
Create files in the following directory layout:

```
cove/
└── lib/
    └── booking/
        ├── slotValidator.ts          # Validation logic utilities
        └── slotValidator.test.ts     # Vitest unit tests suite
```

---

### 7.2 Validation Logic — `lib/booking/slotValidator.ts`
Create `lib/booking/slotValidator.ts` implementing the core functions:

```ts
import type { SupabaseClient } from '@supabase/supabase-js';

// Convert "HH:MM:SS" or "HH:MM" string to minutes from midnight for mathematical checks
export function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Convert minutes from midnight back to "HH:MM:00" format
export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
}

// Enforce closing cutoff (11:00 PM / 23:00) and duration range (1 - 5 hours)
export function validateBookingBoundaries(startTimeStr: string, durationHours: number): boolean {
  if (durationHours < 1 || durationHours > 5) {
    return false;
  }

  const startMinutes = timeStringToMinutes(startTimeStr);
  const endMinutes = startMinutes + durationHours * 60;
  
  const openingMinutes = timeStringToMinutes('10:00');
  const closingMinutes = timeStringToMinutes('23:00');

  return startMinutes >= openingMinutes && endMinutes <= closingMinutes;
}

// Enforce Husk capacity (1-2 pax) and Haven capacity (3-8 pax)
export function validateGuestCount(roomSlug: string, guestCount: number): boolean {
  if (guestCount < 1) return false;
  
  if (roomSlug === 'husk') {
    return guestCount <= 2;
  }
  if (roomSlug === 'haven') {
    return guestCount >= 3 && guestCount <= 8;
  }
  return false;
}

// Check if a proposed slot conflicts with bookings, active locks, or blocked slots
export async function checkSlotConflict(
  supabase: SupabaseClient,
  roomId: string,
  date: string,
  startTimeStr: string,
  durationHours: number
): Promise<boolean> {
  const startMinutes = timeStringToMinutes(startTimeStr);
  const endMinutes = startMinutes + durationHours * 60;

  // 1. Fetch Confirmed Bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('start_time, duration_hours')
    .eq('room_id', roomId)
    .eq('date', date)
    .eq('status', 'confirmed');

  if (bookings) {
    for (const b of bookings) {
      const bStart = timeStringToMinutes(b.start_time);
      const bEnd = bStart + b.duration_hours * 60;
      if (startMinutes < bEnd && bStart < endMinutes) {
        return true; // Conflict found
      }
    }
  }

  // 2. Fetch Active Slot Locks (TTL 10 mins)
  const { data: locks } = await supabase
    .from('slot_locks')
    .select('start_time, duration_hours')
    .eq('room_id', roomId)
    .eq('date', date)
    .gt('expires_at', new Date().toISOString());

  if (locks) {
    for (const l of locks) {
      const lStart = timeStringToMinutes(l.start_time);
      const lEnd = lStart + l.duration_hours * 60;
      if (startMinutes < lEnd && lStart < endMinutes) {
        return true; // Conflict found
      }
    }
  }

  // 3. Fetch Manual Blocked Slots
  const { data: blocks } = await supabase
    .from('blocked_slots')
    .select('start_time, duration_hours')
    .eq('room_id', roomId)
    .eq('date', date);

  if (blocks) {
    for (const bl of blocks) {
      const blStart = timeStringToMinutes(bl.start_time);
      const blEnd = blStart + bl.duration_hours * 60;
      if (startMinutes < blEnd && blStart < endMinutes) {
        return true; // Conflict found
      }
    }
  }

  return false;
}

// Generate all hourly slots from 10:00 to 22:00 that are available on a given date
export async function getAvailableSlots(
  supabase: SupabaseClient,
  roomId: string,
  date: string
): Promise<string[]> {
  const allSlots = [
    '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  const availableSlots: string[] = [];

  for (const slot of allSlots) {
    // Assume a standard 1 hour check duration to determine slot starting availability
    const hasConflict = await checkSlotConflict(supabase, roomId, date, slot, 1);
    if (!hasConflict) {
      availableSlots.push(slot);
    }
  }

  return availableSlots;
}
```

---

### 7.3 Unit Tests — `lib/booking/slotValidator.test.ts`
Create `lib/booking/slotValidator.test.ts` to execute test sweeps:

```ts
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
        });
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
```

---

## Dependencies

Vitest must be installed as a development dependency.

```bash
npm install -D vitest
```

Update `package.json` to configure the test runner script:
```json
"scripts": {
  "test": "vitest run"
}
```

---

## Verification Checklist

### Code Safety
- [ ] `validateBookingBoundaries()` correctly blocks bookings longer than 5 hours.
- [ ] `validateBookingBoundaries()` correctly blocks bookings extending past 11:00 PM.
- [ ] `validateGuestCount()` correctly restricts Husk to 1-2 guests and Haven to 3-8 guests.
- [ ] Overlap math checks return a positive conflict on overlapping bounds.

### Tests Execution
- [ ] `npm run test` executes Vitest and reports all tests passing.
- [ ] No `any` type escapes are present in `lib/booking/slotValidator.ts`.
- [ ] All database schemas referenced match columns in migration files.
- [ ] TypeScript check compiles clean.
