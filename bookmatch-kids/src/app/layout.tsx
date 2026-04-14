import type { Metadata, Viewport } from 'next';
import { SentryInit } from '@/components/SentryInit';
import './globals.css';

export const metadata: Metadata = {
  title: 'BookMatch for Kids',
  description: "The next perfect book for your kid, without the work.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4b5eea',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <SentryInit />
        <div className="mx-auto w-full max-w-screen-sm px-4 pb-24">
          {children}
        </div>
      </body>
    </html>
  );
}
