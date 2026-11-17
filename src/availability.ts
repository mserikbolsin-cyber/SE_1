import type { Room, Booking, Interval, AvailabilityResult, BookingDraft } from '@/types';

export const MINUTES_PER_DAY = 1440;
export const MAX_BOOKING_MINUTES = 120;

export function overlaps(a: Interval, b: Interval): boolean {
  // Touching endpoints are allowed, so strict inequality
  return a.start < b.end && b.start < a.end;
}

export function validateInterval(
  draft: BookingDraft,
  rooms: Room[],
  bookings: Booking[],
  currentTime: number,
): AvailabilityResult {
  const reasons: string[] = [];

  // AC1: 0 <= start < end <= 1440 and start after current time
  if (draft.start < 0 || draft.end > MINUTES_PER_DAY) {
    reasons.push('Interval must be between 00:00 and 24:00.');
  }
  if (draft.start >= draft.end) {
    reasons.push('Start time must be before end time.');
  }
  if (draft.start <= currentTime) {
    reasons.push('Start time must be strictly after the current time.');
  }

  // AC2: Reject booking longer than 120 minutes
  if (draft.end - draft.start > MAX_BOOKING_MINUTES) {
    reasons.push('Booking cannot be longer than 120 minutes.');
  }

  const room = rooms.find((r) => r.id === draft.roomId);

  // AC3: Reject when room is blocked
  if (room?.blocked) {
    reasons.push(`This room is blocked — ${room.name} is currently unavailable.`);
  }

  // AC4: Reject overlap with existing bookings (touching endpoints allowed)
  if (room) {
    const roomBookings = bookings.filter((b) => b.roomId === draft.roomId);
    const conflicting = roomBookings.filter((b) =>
      overlaps({ start: draft.start, end: draft.end }, { start: b.start, end: b.end }),
    );
    if (conflicting.length > 0) {
      const first = conflicting[0];
      reasons.push(
        `Overlaps existing booking (${fmtTime(first.start)}–${fmtTime(first.end)} by ${first.bookedBy}).`,
      );
    }
  }

  if (!room) {
    reasons.push('Please select a valid room.');
  }
  
  return { available: reasons.length === 0, reasons };
}

export function fmtTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function minutesToLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const period = h < 12 ? 'AM' : 'PM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  if (m === 0) {
    return `${displayH} ${period}`;
  }
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}
