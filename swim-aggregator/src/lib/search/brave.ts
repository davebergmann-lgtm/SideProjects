export type WebResult = {
  title: string;
  url: string;
  description: string;
  source: string;
};

export async function braveSearch(query: string, count = 10): Promise<WebResult[]> {
  const key = process.env.BRAVE_SEARCH_API_KEY;
  if (!key) throw new Error("BRAVE_SEARCH_API_KEY not set");

  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", `${query} swim OR swimming OR drill OR set`);
  url.searchParams.set("count", String(count));
  url.searchParams.set("safesearch", "moderate");

  const res = await fetch(url, {
    headers: {
      "x-subscription-token": key,
      accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`Brave search failed: ${res.status}`);
  const json = (await res.json()) as {
    web?: {
      results?: Array<{
        title: string;
        url: string;
        description?: string;
        meta_url?: { hostname?: string };
      }>;
    };
  };

  return (json.web?.results ?? []).map((r) => ({
    title: r.title,
    url: r.url,
    description: r.description ?? "",
    source: r.meta_url?.hostname ?? new URL(r.url).hostname,
  }));
}
