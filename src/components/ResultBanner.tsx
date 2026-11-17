import type { AvailabilityResult } from '@/types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ResultBannerProps {
  result: AvailabilityResult | null;
}

export function ResultBanner({ result }: ResultBannerProps) {
  if (!result) return null;

  return (
    <div
      className={[
        'rounded-xl border-2 p-5 transition-all',
        result.available
          ? 'border-emerald-300 bg-emerald-50'
          : 'border-red-300 bg-red-50',
      ].join(' ')}
    >
      <div className="flex items-center gap-3">
        {result.available ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        ) : (
          <XCircle className="h-6 w-6 text-red-600" />
        )}
        <span
          className={[
            'text-lg font-bold',
            result.available ? 'text-emerald-800' : 'text-red-800',
          ].join(' ')}
        >
          {result.available ? 'Available' : 'Unavailable'}
        </span>
      </div>
      {!result.available && result.reasons.length > 0 && (
        <ul className="mt-3 space-y-1 pl-1">
          {result.reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-red-700">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
              {r}
            </li>
          ))}
        </ul>
      )}
      {result.available && (
        <p className="mt-2 text-sm text-emerald-700">
          This room is free for the selected time slot. No existing bookings were modified.
        </p>
      )}
    </div>
  );
}
