import { describe, it, expect } from 'vitest';
import { validateInterval } from '@/availability';
import type { Room, Booking, BookingDraft } from '@/types';

// Default fixture values (re-created fresh for every test)
const currentTime = 540;

function makeRooms(blocked = false): Room[] {
  return [{ id: 'r1', name: 'Test Room', building: 'North', capacity: 10, blocked }];
}

function makeBookings(): Booking[] {
  return [{ id: 'b1', roomId: 'r1', start: 600, end: 660, bookedBy: 'Test' }];
}

function makeDraft(start: number, end: number): BookingDraft {
  return { roomId: 'r1', start, end, bookedBy: 'Tester' };
}

// Helper: check that at least one reason contains the expected substring
function hasReason(reasons: string[], needle: string): boolean {
  return reasons.some((r) => r.includes(needle));
}

describe('validateInterval — AC mapping', () => {
  // T01 — AC4: touching after existing booking end → available
  it('T01 660–720 touching after: true', () => {
    const result = validateInterval(makeDraft(660, 720), makeRooms(), makeBookings(), currentTime);
    expect(result.available).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  // T02 — AC1: start equals current time (not strictly after) → unavailable
  it('T02 540–570 starts now: false', () => {
    const result = validateInterval(makeDraft(540, 570), makeRooms(), makeBookings(), currentTime);
    expect(result.available).toBe(false);
    expect(hasReason(result.reasons, 'strictly after the current time')).toBe(true);
  });

  // T03 — AC1: zero duration (start === end) → unavailable
  it('T03 720–720 zero duration: false', () => {
    const result = validateInterval(makeDraft(720, 720), makeRooms(), makeBookings(), currentTime);
    expect(result.available).toBe(false);
    expect(hasReason(result.reasons, 'before end time')).toBe(true);
  });

  // T04 — AC1: reversed interval (start > end) → unavailable
  it('T04 750–720 reversed: false', () => {
    const result = validateInterval(makeDraft(750, 720), makeRooms(), makeBookings(), currentTime);
    expect(result.available).toBe(false);
    expect(hasReason(result.reasons, 'before end time')).toBe(true);
  });

  // T05 — AC1: end past day end (1441 > 1440) → unavailable
  it('T05 1380–1441 past day end: false', () => {
    const result = validateInterval(makeDraft(1380, 1441), makeRooms(), makeBookings(), currentTime);
    expect(result.available).toBe(false);
    expect(hasReason(result.reasons, 'between 00:00 and 24:00')).toBe(true);
  });

  // T06 — AC2: exactly 120 minutes → available
  it('T06 720–840 exactly 120 min: true', () => {
    const result = validateInterval(makeDraft(720, 840), makeRooms(), makeBookings(), currentTime);
    expect(result.available).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  // T07 — AC2: 121 minutes exceeds max → unavailable
  it('T07 720–841 121 min: false', () => {
    const result = validateInterval(makeDraft(720, 841), makeRooms(), makeBookings(), currentTime);
    expect(result.available).toBe(false);
    expect(hasReason(result.reasons, '120 minutes')).toBe(true);
  });

  // T08 — AC4: touching before existing booking start → available
  it('T08 570–600 touching before: true', () => {
    const result = validateInterval(makeDraft(570, 600), makeRooms(), makeBookings(), currentTime);
    expect(result.available).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  // T09 — AC4: partial overlap with booking → unavailable
  it('T09 630–690 partial overlap: false', () => {
    const result = validateInterval(makeDraft(630, 690), makeRooms(), makeBookings(), currentTime);
    expect(result.available).toBe(false);
    expect(hasReason(result.reasons, 'Overlaps existing booking')).toBe(true);
  });

  // T10 — AC4: draft contains the booking → unavailable
  it('T10 570–690 contains booking: false', () => {
    const result = validateInterval(makeDraft(570, 690), makeRooms(), makeBookings(), currentTime);
    expect(result.available).toBe(false);
    expect(hasReason(result.reasons, 'Overlaps existing booking')).toBe(true);
  });

  // T11 — AC4: draft inside the booking → unavailable
  it('T11 615–645 inside booking: false', () => {
    const result = validateInterval(makeDraft(615, 645), makeRooms(), makeBookings(), currentTime);
    expect(result.available).toBe(false);
    expect(hasReason(result.reasons, 'Overlaps existing booking')).toBe(true);
  });

  // T12 — AC4: identical interval to booking → unavailable
  it('T12 600–660 identical: false', () => {
    const result = validateInterval(makeDraft(600, 660), makeRooms(), makeBookings(), currentTime);
    expect(result.available).toBe(false);
    expect(hasReason(result.reasons, 'Overlaps existing booking')).toBe(true);
  });

  // T13 — AC3: room blocked → unavailable
  it('T13 660–720, room blocked: false', () => {
    const result = validateInterval(makeDraft(660, 720), makeRooms(true), makeBookings(), currentTime);
    expect(result.available).toBe(false);
    expect(hasReason(result.reasons, 'blocked')).toBe(true);
  });

  // T14 — AC4: no bookings at all → available
  it('T14 630–690, bookings = []: true', () => {
    const result = validateInterval(makeDraft(630, 690), makeRooms(), [], currentTime);
    expect(result.available).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  // T15 — AC5: bookings array is not mutated by the call (approved case)
  it('T15 660–720: bookings array unchanged after call', () => {
    const bookings = makeBookings();
    const before = JSON.stringify(bookings);
    validateInterval(makeDraft(660, 720), makeRooms(), bookings, currentTime);
    expect(JSON.stringify(bookings)).toBe(before);
  });

  // T16 — AC1: end exactly at day end (1440) → available
  it('T16 1380–1440 ends exactly at day end: true', () => {
    const result = validateInterval(makeDraft(1380, 1440), makeRooms(), makeBookings(), currentTime);
    expect(result.available).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  // T17 — AC4: only the last booking (800–860) overlaps → unavailable
  it('T17 830–900 with bookings 600–660, 700–760, 800–860 (all r1): false', () => {
    const bookings: Booking[] = [
      { id: 'b1', roomId: 'r1', start: 600, end: 660, bookedBy: 'A' },
      { id: 'b2', roomId: 'r1', start: 700, end: 760, bookedBy: 'B' },
      { id: 'b3', roomId: 'r1', start: 800, end: 860, bookedBy: 'C' },
    ];
    const result = validateInterval(makeDraft(830, 900), makeRooms(), bookings, currentTime);
    expect(result.available).toBe(false);
    expect(hasReason(result.reasons, 'Overlaps existing booking')).toBe(true);
  });

  // T18 — AC4: overlapping booking in a different room must be ignored → available
  it('T18 630–690 with overlapping booking in room r2 (not r1): true', () => {
    const rooms: Room[] = [
      { id: 'r1', name: 'Test Room', building: 'North', capacity: 10, blocked: false },
      { id: 'r2', name: 'Other Room', building: 'South', capacity: 20, blocked: false },
    ];
    // Only booking is in r2 and overlaps 630–690; r1 has no bookings → must be ignored
    const bookings: Booking[] = [
      { id: 'b2', roomId: 'r2', start: 600, end: 700, bookedBy: 'Someone Else' },
    ];
    const result = validateInterval(makeDraft(630, 690), rooms, bookings, currentTime);
    expect(result.available).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  // T19 — AC5: bookings array is not mutated by the call (rejected case)
  it('T19 630–690 partial overlap: bookings array unchanged after call', () => {
    const bookings = makeBookings();
    const before = JSON.stringify(bookings);
    validateInterval(makeDraft(630, 690), makeRooms(), bookings, currentTime);
    expect(JSON.stringify(bookings)).toBe(before);
  });
});
