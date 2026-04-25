import Link from 'next/link';
import { signOut } from '../login/actions';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="flex items-center justify-between pt-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-base">
            📚
          </span>
          <div className="leading-tight">
            <span className="text-lg font-bold text-slate-900">BookMatch</span>
            <p className="text-[10px] text-slate-400">Your kid&apos;s next favorite book</p>
          </div>
        </Link>
        <form action={signOut}>
          <button type="submit" className="btn-ghost text-xs">
            Sign out
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}
