import type { Room } from '@/types';
import { Lock, Users, MapPin } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  selected: boolean;
  onSelect: () => void;
}

export function RoomCard({ room, selected, onSelect }: RoomCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all',
        selected
          ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-200'
          : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-md',
        'cursor-pointer',
      ].join(' ')}
    >
      {room.blocked && (
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
          <Lock className="h-3 w-3" /> Blocked
        </span>
      )}
      <span className="text-base font-semibold text-slate-900">{room.name}</span>
      <span className="flex items-center gap-1.5 text-sm text-slate-500">
        <MapPin className="h-3.5 w-3.5" /> {room.building}
      </span>
      <span className="flex items-center gap-1.5 text-sm text-slate-500">
        <Users className="h-3.5 w-3.5" /> {room.capacity} seats
      </span>
    </button>
  );
}
