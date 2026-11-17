import { describe, it, expect } from 'vitest';
import { explainAvailability, reasonCodeFromResult } from '@/explain';
import type { ExplainInput, ReasonCode } from '@/explain';
import type { AvailabilityResult } from '@/types';

const FALLBACK_TEXT =
  'An explanation is not available right now. The availability result shown above is still correct.';

function makeInput(overrides: Partial<ExplainInput> = {}): ExplainInput {
  return {
    roomLabel: 'Newton Lecture Hall',
    start: 660,
    end: 720,
    isAvailable: true,
    reasonCode: 'AVAILABLE',
    ...overrides,
  };
}

describe('explainAvailability', () => {
  it('AVAILABLE: fallback false, mentions room and the word "book"', () => {
    const res = explainAvailability(makeInput());
    expect(res.fallback).toBe(false);
    expect(res.source).toBe('mock');
    expect(res.explanation).toContain('Newton Lecture Hall');
    expect(res.explanation.toLowerCase()).toContain('book');
  });

  it('OVERLAP: explanation contains "unavailable"', () => {
    const res = explainAvailability(makeInput({ isAvailable: false, reasonCode: 'OVERLAP' }));
    expect(res.fallback).toBe(false);
    expect(res.explanation.toLowerCase()).toContain('unavailable');
  });

  it('BLOCKED: mentions "blocked"', () => {
    const res = explainAvailability(makeInput({ isAvailable: false, reasonCode: 'BLOCKED' }));
    expect(res.fallback).toBe(false);
    expect(res.explanation.toLowerCase()).toContain('blocked');
  });

  it('TOO_LONG: contains "120"', () => {
    const res = explainAvailability(
      makeInput({ isAvailable: false, reasonCode: 'TOO_LONG', end: 840 }),
    );
    expect(res.fallback).toBe(false);
    expect(res.explanation).toContain('120');
  });

  it('PAST: mentions "current time"', () => {
    const res = explainAvailability(
      makeInput({ isAvailable: false, reasonCode: 'PAST', start: 540, end: 570 }),
    );
    expect(res.fallback).toBe(false);
    expect(res.explanation.toLowerCase()).toContain('current time');
  });

  it('empty roomLabel: fallback true', () => {
    const res = explainAvailability(makeInput({ roomLabel: '   ' }));
    expect(res.fallback).toBe(true);
    expect(res.explanation).toBe(FALLBACK_TEXT);
  });

  it('200-char roomLabel: fallback true', () => {
    const res = explainAvailability(makeInput({ roomLabel: 'R'.repeat(200) }));
    expect(res.fallback).toBe(true);
  });

  it('simulate timeout: fallback true', () => {
    const res = explainAvailability(makeInput(), { simulate: 'timeout' });
    expect(res.fallback).toBe(true);
    expect(res.explanation).toBe(FALLBACK_TEXT);
  });

  it('simulate error: fallback true', () => {
    const res = explainAvailability(makeInput(), { simulate: 'error' });
    expect(res.fallback).toBe(true);
    expect(res.explanation).toBe(FALLBACK_TEXT);
  });

  it('normal explanation: no 4-digit year, no "Prof."', () => {
    const res = explainAvailability(makeInput());
    expect(res.fallback).toBe(false);
    expect(res.explanation).not.toMatch(/\d{4}/);
    expect(res.explanation).not.toContain('Prof.');
  });

  it('non-integer start: fallback true', () => {
    const res = explainAvailability(makeInput({ start: 660.5 }));
    expect(res.fallback).toBe(true);
  });

  it('start after end: fallback true', () => {
    const res = explainAvailability(makeInput({ start: 720, end: 660 }));
    expect(res.fallback).toBe(true);
  });

  it('unknown reasonCode: fallback true', () => {
    const res = explainAvailability(makeInput({ reasonCode: 'MYSTERY' as ReasonCode }));
    expect(res.fallback).toBe(true);
  });
});

describe('reasonCodeFromResult', () => {
  it('maps available result to AVAILABLE', () => {
    const result: AvailabilityResult = { available: true, reasons: [] };
    expect(reasonCodeFromResult(result)).toBe('AVAILABLE');
  });

  it('maps "Overlaps existing booking" to OVERLAP', () => {
    const result: AvailabilityResult = {
      available: false,
      reasons: ['Overlaps existing booking (10:00–11:00 by Alex).'],
    };
    expect(reasonCodeFromResult(result)).toBe('OVERLAP');
  });

  it('maps blocked reason to BLOCKED', () => {
    const result: AvailabilityResult = {
      available: false,
      reasons: ['This room is blocked — Test Room is currently unavailable.'],
    };
    expect(reasonCodeFromResult(result)).toBe('BLOCKED');
  });

  it('maps 120-minute reason to TOO_LONG', () => {
    const result: AvailabilityResult = {
      available: false,
      reasons: ['Booking cannot be longer than 120 minutes.'],
    };
    expect(reasonCodeFromResult(result)).toBe('TOO_LONG');
  });

  it('maps current-time reason to PAST', () => {
    const result: AvailabilityResult = {
      available: false,
      reasons: ['Start time must be strictly after the current time.'],
    };
    expect(reasonCodeFromResult(result)).toBe('PAST');
  });

  it('maps valid-room reason to NO_ROOM', () => {
    const result: AvailabilityResult = {
      available: false,
      reasons: ['Please select a valid room.'],
    };
    expect(reasonCodeFromResult(result)).toBe('NO_ROOM');
  });

  it('maps start-not-before-end reason to INVALID_TIME', () => {
    const result: AvailabilityResult = {
      available: false,
      reasons: ['Start time must be before end time.'],
    };
    expect(reasonCodeFromResult(result)).toBe('INVALID_TIME');
  });
});
