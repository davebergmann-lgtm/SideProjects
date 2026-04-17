"use client";

import { useNotifications, type NotificationPreferences } from "@/contexts/NotificationContext";

const NOTIFICATION_TYPES: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  {
    key: "episodeWithin24h",
    label: "Episode Airing Soon",
    description: "Get notified when a new episode of a saved show airs within 24 hours",
  },
  {
    key: "episodeAired",
    label: "New Episode Out",
    description: "Get notified when a new episode of a saved show airs today",
  },
  {
    key: "newSeasonAnnounced",
    label: "New Season Announced",
    description: "Get notified when a new season premiere date is announced for a saved show",
  },
  {
    key: "showCanceled",
    label: "Show Canceled / Ended",
    description: "Get notified when a saved show is marked as ended or canceled",
  },
];

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  episode_soon: { label: "Airing Soon", color: "bg-blue-500/20 text-blue-400" },
  episode_aired: { label: "New Episode", color: "bg-green-500/20 text-green-400" },
  new_season: { label: "New Season", color: "bg-purple-500/20 text-purple-400" },
  show_canceled: { label: "Canceled", color: "bg-red-500/20 text-red-400" },
};

export default function NotificationsPage() {
  const {
    settings,
    toggleNotifications,
    updatePreferences,
    updateContactInfo,
    requestPermission,
    permissionState,
    recentNotifications,
    clearHistory,
  } = useNotifications();

  const handleToggle = async () => {
    if (!settings.enabled && permissionState === "default") {
      const granted = await requestPermission();
      if (granted) toggleNotifications();
    } else if (permissionState === "granted") {
      toggleNotifications();
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold">Notification Settings</h1>

      {/* Master Toggle */}
      <section className="bg-[#1e293b] rounded-lg border border-[#334155] p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Browser Notifications</h2>
            <p className="text-sm text-slate-400 mt-1">
              {permissionState === "denied"
                ? "Notifications are blocked by your browser. Enable them in browser settings."
                : permissionState === "unsupported"
                ? "Your browser doesn't support notifications."
                : settings.enabled
                ? "Notifications are active. You'll be notified when the app is open."
                : "Enable to receive alerts about your saved shows."}
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={permissionState === "denied" || permissionState === "unsupported"}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              settings.enabled ? "bg-blue-600" : "bg-[#334155]"
            } ${permissionState === "denied" || permissionState === "unsupported" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                settings.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </section>

      {/* Notification Types */}
      <section className="bg-[#1e293b] rounded-lg border border-[#334155] p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-semibold">What to Notify</h2>
        <p className="text-sm text-slate-400">Choose which types of notifications you want to receive.</p>
        <div className="space-y-3">
          {NOTIFICATION_TYPES.map(({ key, label, description }) => (
            <div
              key={key}
              className="flex items-start justify-between gap-4 py-3 border-b border-[#334155] last:border-0"
            >
              <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{description}</p>
              </div>
              <button
                onClick={() => updatePreferences({ [key]: !settings.preferences[key] })}
                className={`relative inline-flex h-6 w-10 flex-shrink-0 items-center rounded-full transition-colors ${
                  settings.preferences[key] ? "bg-blue-600" : "bg-[#334155]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.preferences[key] ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Email & SMS (Future) */}
      <section className="bg-[#1e293b] rounded-lg border border-[#334155] p-4 sm:p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Email & SMS Notifications</h2>
          <p className="text-sm text-slate-400 mt-1">
            Get notified even when the app isn&apos;t open. Save your contact info to receive alerts via email or text.
          </p>
          <p className="text-xs text-yellow-400/80 mt-2">
            Coming soon &mdash; email and SMS delivery requires additional backend setup. Your preferences are saved and will be used once enabled.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <div className="flex gap-2">
              <input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => updateContactInfo({ email: e.target.value })}
                placeholder="you@example.com"
                className="flex-1 px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => updateContactInfo({ emailEnabled: !settings.emailEnabled })}
                disabled={!settings.email}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  settings.emailEnabled
                    ? "bg-blue-600 text-white"
                    : "bg-[#334155] text-slate-400"
                } ${!settings.email ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {settings.emailEnabled ? "On" : "Off"}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1">
              Phone Number
            </label>
            <div className="flex gap-2">
              <input
                id="phone"
                type="tel"
                value={settings.phone}
                onChange={(e) => updateContactInfo({ phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="flex-1 px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => updateContactInfo({ smsEnabled: !settings.smsEnabled })}
                disabled={!settings.phone}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  settings.smsEnabled
                    ? "bg-blue-600 text-white"
                    : "bg-[#334155] text-slate-400"
                } ${!settings.phone ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {settings.smsEnabled ? "On" : "Off"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Notification History */}
      <section className="bg-[#1e293b] rounded-lg border border-[#334155] p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Notification History</h2>
          {recentNotifications.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        {recentNotifications.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            No notifications yet. Notifications will appear here as they are sent.
          </p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {recentNotifications.map((n, i) => {
              const typeInfo = TYPE_LABELS[n.type] || { label: "Notification", color: "bg-slate-500/20 text-slate-400" };
              return (
                <div
                  key={`${n.id}-${i}`}
                  className="flex items-start gap-3 py-2 border-b border-[#334155]/50 last:border-0"
                >
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap mt-0.5 ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{n.showName}</p>
                    <p className="text-xs text-slate-400 truncate">{n.episodeName}</p>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {formatTimestamp(n.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
