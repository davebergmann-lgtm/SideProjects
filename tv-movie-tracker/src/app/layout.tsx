import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ListsProvider } from "@/contexts/ListsContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "TV & Movie Tracker",
  description: "Search, track, and get notified about your favorite TV shows and movies",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <ListsProvider>
          <NotificationProvider>
            <Suspense>
              <Navbar />
            </Suspense>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
          </NotificationProvider>
        </ListsProvider>
      </body>
    </html>
  );
}
