import { YoutubeTranscript } from "youtube-transcript";

export function isYoutubeUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.hostname.includes("youtube.com") ||
      u.hostname === "youtu.be" ||
      u.hostname.endsWith(".youtube.com")
    );
  } catch {
    return false;
  }
}

export async function extractYoutube(
  url: string,
): Promise<{ title: string; content: string }> {
  const segments = await YoutubeTranscript.fetchTranscript(url);
  const transcript = segments.map((s) => s.text).join(" ");
  if (!transcript.trim()) throw new Error("no transcript available for this video");
  return {
    title: `YouTube transcript: ${url}`,
    content: transcript.slice(0, 40_000),
  };
}
