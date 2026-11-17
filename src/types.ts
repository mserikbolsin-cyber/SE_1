export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
}

export interface Booking {
  id: string;
  roomId: string;
  start: number; // minutes from 00:00
  end: number;
  bookedBy: string;
}

export interface Interval {
  start: number; // minutes from 00:00
  end: number;
}

export interface AvailabilityResult {
  available: boolean;
  reasons: string[];
}

export interface BookingDraft extends Interval {
  roomId: string;
  bookedBy: string;
}
