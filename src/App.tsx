import { useMemo, useState } from 'react';
import { rooms as initialRooms, bookings as initialBookings } from '@/data';
import type { AvailabilityResult, BookingDraft } from '@/types';
import { validateInterval, fmtTime, MINUTES_PER_DAY } from '@/availability';
import { RoomCard } from '@/components/RoomCard';
import { TimePicker } from '@/components/TimePicker';
import { ResultBanner } from '@/components/ResultBanner';
import { BookingList } from '@/components/BookingList';
import { explainAvailability, reasonCodeFromResult } from '@/explain';
import type { ExplainResult } from '@/explain';
import { Clock, Building2, Search, CalendarDays, Sparkles } from 'lucide-react';

function App() {
  // Current time in minutes — simulated at 09:00 (540)
  const [currentTime] = useState(540);
  const [draft, setDraft] = useState<BookingDraft>({
    roomId: '',
    start: 600,
    end: 660,
    bookedBy: 'You',
  });
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [explanation, setExplanation] = useState<ExplainResult | null>(null);

  const rooms = initialRooms; // never mutated — AC5: no booking data changes
  const bookings = initialBookings;

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === draft.roomId),
    [rooms, draft.roomId],
  );

  const roomBookings = useMemo(
    () => (selectedRoom ? bookings.filter((b) => b.roomId === selectedRoom.id) : []),
    [bookings, selectedRoom],
  );

  const handleCheck = () => {
    const r = validateInterval(draft, rooms, bookings, currentTime);
    setResult(r);
  };

  const handleExplain = () => {
    if (!result || !selectedRoom) return;
    setExplanation(
      explainAvailability({
        roomLabel: selectedRoom.name,
        start: draft.start,
        end: draft.end,
        isAvailable: result.available,
        reasonCode: reasonCodeFromResult(result),
      }),
    );
  };

  const handleReset = () => {
    setResult(null);
    setExplanation(null);
    setDraft({ roomId: '', start: 600, end: 660, bookedBy: 'You' });
  };

  const duration = Math.max(0, draft.end - draft.start);
  const overLimit = duration > 120;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Smart Campus Room Availability
              </h1>
              <p className="flex items-center gap-1.5 text-sm text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                Current time: {fmtTime(currentTime)} (simulated)
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Step 1: Room selection */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">
              1
            </span>
            <h2 className="text-lg font-semibold text-slate-800">Select a room</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                selected={draft.roomId === room.id}
                onSelect={() => {
                  setDraft((d) => ({ ...d, roomId: room.id }));
                  setResult(null);
                  setExplanation(null);
                }}
              />
            ))}
          </div>
        </section>

        {/* Step 2: Time interval */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">
              2
            </span>
            <h2 className="text-lg font-semibold text-slate-800">Choose a time slot</h2>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <TimePicker
                label="Start time"
                value={draft.start}
                onChange={(val) => {
                  setDraft((d) => ({ ...d, start: val }));
                  setResult(null);
                  setExplanation(null);
                }}
              />
              <TimePicker
                label="End time"
                value={draft.end}
                onChange={(val) => {
                  setDraft((d) => ({ ...d, end: val }));
                  setResult(null);
                  setExplanation(null);
                }}
              />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700">Duration</span>
                <div
                  className={[
                    'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium',
                    overLimit
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-slate-300 bg-slate-50 text-slate-700',
                  ].join(' ')}
                >
                  <CalendarDays className="h-4 w-4" />
                  {duration} min
                  {overLimit && <span className="text-xs font-normal">(max 120)</span>}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCheck}
                disabled={!draft.roomId}
                className={[
                  'flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition',
                  draft.roomId
                    ? 'bg-sky-600 text-white hover:bg-sky-700 shadow-sm'
                    : 'cursor-not-allowed bg-slate-200 text-slate-400',
                ].join(' ')}
              >
                <Search className="h-4 w-4" />
                Check Availability
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* Result */}
        {result && (
          <section className="mb-8 space-y-4">
            <ResultBanner result={result} />
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  Want a plain-language summary of this result?
                </p>
                <button
                  type="button"
                  onClick={handleExplain}
                  className="flex items-center justify-center gap-2 self-start rounded-lg border border-sky-600 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 sm:self-auto"
                >
                  <Sparkles className="h-4 w-4" />
                  Explain availability
                </button>
              </div>
              {explanation && (
                <div role="status" aria-live="polite" className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI-generated explanation (not a booking confirmation)
                  </p>
                  <p className="text-sm leading-relaxed text-slate-700">{explanation.explanation}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Existing bookings for selected room */}
        {selectedRoom && (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-sm font-bold text-white">
                <CalendarDays className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-semibold text-slate-800">
                Existing bookings — {selectedRoom.name}
              </h2>
            </div>
            <BookingList bookings={roomBookings} roomName={selectedRoom.name} />
          </section>
        )}

        {/* Footer note */}
        <footer className="mt-10 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
          Fictional sample data only. Checking availability never modifies existing bookings.
          <br />
          Valid range: 00:00–24:00 ({MINUTES_PER_DAY} min). Max booking: 120 min.
        </footer>
      </main>
    </div>
  );
}

export default App;
