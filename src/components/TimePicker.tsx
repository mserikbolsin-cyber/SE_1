interface TimePickerProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
}

function minutesToTimeStr(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function timeStrToMinutes(str: string): number {
  const [h, m] = str.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return 0;
  return h * 60 + m;
}

export function TimePicker({ label, value, onChange }: TimePickerProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type="time"
        step="60"
        value={minutesToTimeStr(value)}
        onChange={(e) => onChange(timeStrToMinutes(e.target.value))}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
      />
    </label>
  );
}
