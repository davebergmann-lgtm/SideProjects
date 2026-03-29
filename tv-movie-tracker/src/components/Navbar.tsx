"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNotifications } from "@/contexts/NotificationContext";
import SyncModal from "@/components/SyncModal";

export default function Navbar() {
  const pathname = usePathname();
  const { settings, toggleNotifications, requestPermission, permissionState } =
    useNotifications();
  const [syncOpen, setSyncOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Search" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/calendar", label: "Calendar" },
    { href: "/schedule", label: "Schedule" },
    { href: "/lists", label: "My Lists" },
  ];

  const handleNotificationToggle = async () => {
    if (permissionState === "default") {
      const granted = await requestPermission();
      if (granted) toggleNotifications();
    } else if (permissionState === "granted") {
      toggleNotifications();
    }
  };

  return (
    <nav className="bg-[#1e293b] border-b border-[#334155] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/" className="text-lg sm:text-xl font-bold text-blue-400">
              TV Tracker
            </Link>
            {/* Desktop nav */}
            <div className="hidden sm:flex gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-[#334155] hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setSyncOpen(true)}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-[#334155] hover:text-white transition-colors"
              title="Sync across devices"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm14.49 3.882a7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H3.986a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-1.45-.388z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">Sync</span>
            </button>
            <button
              onClick={handleNotificationToggle}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                settings.enabled
                  ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                  : "text-slate-400 hover:bg-[#334155] hover:text-white"
              }`}
              title={
                permissionState === "denied"
                  ? "Notifications blocked by browser"
                  : permissionState === "unsupported"
                  ? "Notifications not supported"
                  : settings.enabled
                  ? "Notifications enabled"
                  : "Enable notifications"
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 004.496 0 25.057 25.057 0 01-4.496 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="hidden sm:inline">
                {permissionState === "denied" ? (
                  <span className="text-red-400">Blocked</span>
                ) : (
                  <span>{settings.enabled ? "On" : "Off"}</span>
                )}
              </span>
            </button>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden flex items-center px-2 py-2 rounded-md text-slate-300 hover:bg-[#334155] hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                {mobileMenuOpen ? (
                  <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#334155] px-4 py-2 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                pathname === link.href
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-[#334155] hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
      <SyncModal open={syncOpen} onClose={() => setSyncOpen(false)} />
    </nav>
  );
}
