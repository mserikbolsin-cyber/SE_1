import type { Booking } from '@/types';
import { fmtTime } from '@/availability';

interface BookingListProps {
  bookings: Booking[];
  roomName: string;
}

export function BookingList({ bookings, roomName }: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
        No existing bookings for {roomName}.
      </div>
    );
  }

  const sorted = [...bookings].sort((a, b) => a.start - b.start);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2.5">Start</th>
            <th className="px-4 py-2.5">End</th>
            <th className="px-4 py-2.5">Booked By</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map((b) => (
            <tr key={b.id} className="hover:bg-slate-50">
              <td className="px-4 py-2.5 font-medium text-slate-700">{fmtTime(b.start)}</td>
              <td className="px-4 py-2.5 font-medium text-slate-700">{fmtTime(b.end)}</td>
              <td className="px-4 py-2.5 text-slate-600">{b.bookedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
