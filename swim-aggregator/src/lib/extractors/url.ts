import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export async function extractUrl(url: string): Promise<{ title: string; content: string }> {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; SwimAggregatorBot/0.1; +https://example.com/bot)",
      accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`fetch ${url} failed: ${res.status}`);
  const html = await res.text();

  const dom = new JSDOM(html, { url });
  const article = new Readability(dom.window.document).parse();
  if (!article?.textContent) throw new Error("no readable content extracted");

  return {
    title: article.title ?? new URL(url).hostname,
    content: article.textContent.trim().slice(0, 30_000),
  };
}
