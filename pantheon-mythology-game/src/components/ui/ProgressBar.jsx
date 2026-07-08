export function ProgressBar({ value, max, color = 'amber', label, className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = {
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
  };
  return (
    <div className={`w-full ${className}`}>
      {label && <div className="text-xs text-stone-400 mb-1">{label}</div>}
      <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
