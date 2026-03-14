const BASE_URL = "https://api.tvmaze.com";

export interface Show {
  id: number;
  name: string;
  type: string;
  language: string;
  genres: string[];
  status: string;
  runtime: number | null;
  averageRuntime: number | null;
  premiered: string | null;
  ended: string | null;
  officialSite: string | null;
  schedule: {
    time: string;
    days: string[];
  };
  rating: {
    average: number | null;
  };
  weight: number;
  network: {
    id: number;
    name: string;
    country: { name: string; code: string; timezone: string } | null;
    officialSite: string | null;
  } | null;
  webChannel: {
    id: number;
    name: string;
    country: { name: string; code: string; timezone: string } | null;
    officialSite: string | null;
  } | null;
  externals: {
    tvrage: number | null;
    thetvdb: number | null;
    imdb: string | null;
  };
  image: {
    medium: string;
    original: string;
  } | null;
  summary: string | null;
  updated: number;
  _links: {
    self: { href: string };
    previousepisode?: { href: string };
    nextepisode?: { href: string };
  };
}

export interface Episode {
  id: number;
  name: string;
  season: number;
  number: number | null;
  type: string;
  airdate: string;
  airtime: string;
  airstamp: string;
  runtime: number | null;
  rating: { average: number | null };
  image: { medium: string; original: string } | null;
  summary: string | null;
  _links: {
    self: { href: string };
    show: { href: string };
  };
}

export interface SearchResult {
  score: number;
  show: Show;
}

export interface ScheduleEntry {
  id: number;
  name: string;
  season: number;
  number: number | null;
  type: string;
  airdate: string;
  airtime: string;
  airstamp: string;
  runtime: number | null;
  rating: { average: number | null };
  image: { medium: string; original: string } | null;
  summary: string | null;
  show: Show;
}

export async function searchShows(query: string): Promise<SearchResult[]> {
  const res = await fetch(`${BASE_URL}/search/shows?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function getShow(id: number): Promise<Show> {
  const res = await fetch(`${BASE_URL}/shows/${id}`);
  if (!res.ok) throw new Error("Show not found");
  return res.json();
}

export async function getShowEpisodes(id: number): Promise<Episode[]> {
  const res = await fetch(`${BASE_URL}/shows/${id}/episodes`);
  if (!res.ok) throw new Error("Episodes not found");
  return res.json();
}

export async function getSchedule(date?: string, country?: string): Promise<ScheduleEntry[]> {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (country) params.set("country", country);
  const res = await fetch(`${BASE_URL}/schedule?${params.toString()}`);
  if (!res.ok) throw new Error("Schedule fetch failed");
  return res.json();
}

export async function getStreamingSchedule(date?: string): Promise<ScheduleEntry[]> {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  const res = await fetch(`${BASE_URL}/schedule/web?${params.toString()}`);
  if (!res.ok) throw new Error("Streaming schedule fetch failed");
  return res.json();
}

export function getNetworkName(show: Show): string {
  if (show.network) return show.network.name;
  if (show.webChannel) return show.webChannel.name;
  return "Unknown";
}

export function getAirTimeET(show: Show): string {
  const { schedule } = show;
  if (!schedule.time && schedule.days.length === 0) return "TBA";

  const days = schedule.days.length > 0 ? schedule.days.join(", ") : "TBA";
  const time = schedule.time || "TBA";

  if (time === "TBA") return `${days} - Time TBA`;

  // Convert time to ET display
  const network = show.network;
  const timezone = network?.country?.timezone || "America/New_York";

  // If the show is already in US/Eastern, display as-is
  if (timezone === "America/New_York" || timezone === "US/Eastern") {
    return `${days} at ${formatTime12h(time)} ET`;
  }

  // For other timezones, note the original time
  return `${days} at ${formatTime12h(time)} (${getTimezoneAbbr(timezone)})`;
}

function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${ampm}`;
}

function getTimezoneAbbr(tz: string): string {
  const map: Record<string, string> = {
    "America/New_York": "ET",
    "US/Eastern": "ET",
    "America/Chicago": "CT",
    "America/Denver": "MT",
    "America/Los_Angeles": "PT",
    "Europe/London": "GMT",
  };
  return map[tz] || tz;
}

export function stripHtml(html: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}
