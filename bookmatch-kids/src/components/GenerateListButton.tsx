'use client';

import { useFormStatus } from 'react-dom';

export function GenerateListButton({
  label = 'Get recommendations',
  pendingLabel = 'Matching books…',
  variant = 'primary',
}: {
  label?: string;
  pendingLabel?: string;
  variant?: 'primary' | 'secondary';
}) {
  const { pending } = useFormStatus();
  const cls = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  return (
    <button type="submit" disabled={pending} className={`${cls} w-full`}>
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          {pendingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}
