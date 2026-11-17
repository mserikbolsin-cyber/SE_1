import type { Room, Booking } from '@/types';

export const rooms: Room[] = [
  { id: 'r1', name: 'Selene Hall', building: 'North Wing', capacity: 120, blocked: false },
  { id: 'r2', name: 'Kepler Lab', building: 'Tech Block', capacity: 40, blocked: true },
  { id: 'r3', name: 'Newton Lecture Hall', building: 'Science Wing', capacity: 80, blocked: false },
  { id: 'r4', name: 'Curie Seminar Room', building: 'Research Center', capacity: 25, blocked: false },
  { id: 'r5', name: 'Turing Auditorium', building: 'East Campus', capacity: 200, blocked: false },
];

export const bookings: Booking[] = [
  { id: 'b1', roomId: 'r1', start: 540, end: 600, bookedBy: 'Dr. Almeida' },
  { id: 'b2', roomId: 'r1', start: 840, end: 960, bookedBy: 'Student Council' },
  { id: 'b3', roomId: 'r3', start: 600, end: 660, bookedBy: 'Prof. Sharma' },
  { id: 'b4', roomId: 'r3', start: 720, end: 780, bookedBy: 'Dept. of Physics' },
  { id: 'b5', roomId: 'r4', start: 900, end: 960, bookedBy: 'Lab Group C' },
  { id: 'b6', roomId: 'r5', start: 600, end: 780, bookedBy: 'Open Day Committee' },
  { id: 'b7', roomId: 'r5', start: 1080, end: 1140, bookedBy: 'Guest Lecture Series' },
];
