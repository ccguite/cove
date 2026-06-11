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
