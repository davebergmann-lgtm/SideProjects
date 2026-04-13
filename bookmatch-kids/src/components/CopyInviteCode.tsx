'use client';

import { useState } from 'react';

export function CopyInviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // No clipboard permission — no-op; the code is still visible.
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-dashed border-brand-300 bg-brand-50 px-4 py-3 text-left hover:bg-brand-100"
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-700">
          Invite code
        </p>
        <p className="font-mono text-lg font-bold tracking-widest text-brand-900">
          {code.toUpperCase()}
        </p>
      </div>
      <span className="text-xs font-semibold text-brand-700">
        {copied ? 'Copied!' : 'Tap to copy'}
      </span>
    </button>
  );
}
