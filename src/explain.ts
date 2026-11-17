import type { AvailabilityResult } from '@/types';
import { fmtTime } from '@/availability';

export type ReasonCode =
  | 'AVAILABLE'
  | 'OVERLAP'
  | 'BLOCKED'
  | 'TOO_LONG'
  | 'PAST'
  | 'INVALID_TIME'
  | 'NO_ROOM'
  | 'UNAVAILABLE';

export interface ExplainInput {
  roomLabel: string;
  start: number;
  end: number;
  isAvailable: boolean;
  reasonCode: ReasonCode;
}

export interface ExplainResult {
  explanation: string;
  source: 'mock';
  fallback: boolean;
}

const REASON_CODES: ReasonCode[] = [
  'AVAILABLE',
  'OVERLAP',
  'BLOCKED',
  'TOO_LONG',
  'PAST',
  'INVALID_TIME',
  'NO_ROOM',
  'UNAVAILABLE',
];

const MAX_LABEL_LENGTH = 80;
const MAX_EXPLANATION_LENGTH = 200;

const FALLBACK: ExplainResult = {
  explanation:
    'An explanation is not available right now. The availability result shown above is still correct.',
  source: 'mock',
  fallback: true,
};

// Deterministic mapping from validateInterval reasons to a reason code.
export function reasonCodeFromResult(result: AvailabilityResult): ReasonCode {
  if (result.available) return 'AVAILABLE';
  const first = (result.reasons[0] ?? '').toLowerCase();
  if (first.includes('blocked')) return 'BLOCKED';
  if (first.includes('overlaps')) return 'OVERLAP';
  if (first.includes('120')) return 'TOO_LONG';
  if (first.includes('current time')) return 'PAST';
  if (first.includes('valid room')) return 'NO_ROOM';
  if (first.includes('00:00') || first.includes('before end')) return 'INVALID_TIME';
  return 'UNAVAILABLE';
}

function buildSentence(input: ExplainInput): string {
  const room = input.roomLabel.trim();
  const from = fmtTime(input.start);
  const to = fmtTime(input.end);
  const slot = `${room} from ${from} to ${to}`;

  switch (input.reasonCode) {
    case 'AVAILABLE':
      return `${room} is free from ${from} to ${to}. You can book this slot.`;
    case 'OVERLAP':
      return `${room} is unavailable from ${from} to ${to} because the slot overlaps an existing booking.`;
    case 'BLOCKED':
      return `${room} is blocked, so the slot from ${from} to ${to} cannot be booked.`;
    case 'TOO_LONG':
      return `The requested slot at ${slot} is longer than 120 minutes, which exceeds the booking limit.`;
    case 'PAST':
      return `The slot from ${from} to ${to} at ${room} starts at or before the current time, so it cannot be booked.`;
    case 'INVALID_TIME':
      return `The interval from ${from} to ${to} is not a valid time range for ${room}.`;
    case 'NO_ROOM':
      return `${room} is not a selectable room, so availability from ${from} to ${to} cannot be checked.`;
    case 'UNAVAILABLE':
    default:
      return `${room} is unavailable from ${from} to ${to} for the reason shown in the result above.`;
  }
}

function sanitize(text: string): string {
  const oneLine = text.replace(/\s+/g, ' ').trim();
  return oneLine.slice(0, MAX_EXPLANATION_LENGTH).trim();
}

export function explainAvailability(
  input: ExplainInput,
  options?: { simulate?: 'timeout' | 'error' },
): ExplainResult {
  try {
    if (options?.simulate === 'timeout' || options?.simulate === 'error') return FALLBACK;
    if (typeof input !== 'object' || input === null) return FALLBACK;
    if (typeof input.roomLabel !== 'string') return FALLBACK;
    const label = input.roomLabel.trim();
    if (label.length === 0 || label.length > MAX_LABEL_LENGTH) return FALLBACK;
    if (!Number.isInteger(input.start) || !Number.isInteger(input.end)) return FALLBACK;
    if (input.start < 0 || input.end > 1440 || input.start >= input.end) return FALLBACK;
    if (!REASON_CODES.includes(input.reasonCode)) return FALLBACK;

    return { explanation: sanitize(buildSentence(input)), source: 'mock', fallback: false };
  } catch {
    return FALLBACK;
  }
}
