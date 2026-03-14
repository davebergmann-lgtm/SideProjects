"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNotifications } from "@/contexts/NotificationContext";

export default function Navbar() {
  const pathname = usePathname();
  const { settings, toggleNotifications, requestPermission, permissionState } =
    useNotifications();

  const links = [
    { href: "/", label: "Search" },
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
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-blue-400">
              TV Tracker
            </Link>
            <div className="flex gap-1">
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
          <button
            onClick={handleNotificationToggle}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
            {permissionState === "denied" ? (
              <span className="text-red-400">Blocked</span>
            ) : (
              <span>{settings.enabled ? "On" : "Off"}</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
