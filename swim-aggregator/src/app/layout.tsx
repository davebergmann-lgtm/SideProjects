import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Swim Aggregator",
  description: "Ingest, normalize, and search swimming drills, sets, and workouts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-[var(--border)] bg-[var(--card)]">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
            <Link href="/" className="font-semibold text-pool-600">
              🏊 Swim Aggregator
            </Link>
            <nav className="flex gap-4 text-sm text-[var(--muted)]">
              <Link href="/">Search</Link>
              <Link href="/add">Add</Link>
              <Link href="/jobs">Jobs</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
