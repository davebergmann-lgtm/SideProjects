'use client';

import { useState } from 'react';
import { INTERESTS } from '@/lib/constants';

export function InterestsPicker({ name = 'interests' }: { name?: string }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(interest: string) {
    setSelected((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  }

  return (
    <div>
      {/* One hidden input per selected interest so formData.getAll('interests') returns the list. */}
      {selected.map((i) => (
        <input key={i} type="hidden" name={name} value={i} />
      ))}
      <div className="flex flex-wrap gap-2">
        {INTERESTS.map((interest) => {
          const active = selected.includes(interest);
          return (
            <button
              key={interest}
              type="button"
              onClick={() => toggle(interest)}
              className={`chip ${active ? 'chip-active' : ''}`}
              aria-pressed={active}
            >
              {interest}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {selected.length === 0
          ? 'Pick a few — the more the better.'
          : `${selected.length} selected`}
      </p>
    </div>
  );
}
