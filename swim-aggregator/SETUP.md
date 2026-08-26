# Setup — click-by-click

The Supabase project has already been created and both migrations are applied. You still need three secrets before the app will run: your Supabase service role key, an Anthropic API key, and a Brave Search API key.

## 1. Get your Supabase service role key

The MCP can't expose service role keys (they have admin access). Grab it from the dashboard:

1. Open [https://supabase.com/dashboard/project/dahnmxrwhfaluwotaxyf/settings/api](https://supabase.com/dashboard/project/dahnmxrwhfaluwotaxyf/settings/api)
2. Scroll to **Project API keys**
3. Find the row labeled **`service_role`** (has a "secret" tag next to it)
4. Click the eye icon to reveal, then the copy icon
5. Paste it into `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

## 2. Get an Anthropic API key

1. Open [https://console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Click **Create Key**
3. Name it `swim-aggregator`, leave the workspace on Default
4. Click **Create Key** in the modal
5. Copy the key that starts with `sk-ant-…`
6. Paste it into `.env.local` as `ANTHROPIC_API_KEY`
7. If you don't have credits yet: [https://console.anthropic.com/settings/billing](https://console.anthropic.com/settings/billing) → add $5 (each normalization call costs a fraction of a cent)

## 3. Get a Brave Search API key (free)

1. Open [https://api.search.brave.com/register](https://api.search.brave.com/register)
2. Sign up (Google/GitHub/email — no credit card required for the free tier)
3. Once signed in, go to [https://api.search.brave.com/app/keys](https://api.search.brave.com/app/keys)
4. Click **Add API Key**
5. Name: `swim-aggregator`. Plan: **Free — Data for Search** (2,000 queries/month, $0)
6. Click **Create**
7. Click the copy icon next to your new key
8. Paste it into `.env.local` as `BRAVE_SEARCH_API_KEY`

## 4. Create `.env.local`

From `swim-aggregator/`, run:

```bash
cp .env.example .env.local
```

Then edit `.env.local` to look like this (Supabase URL + anon key are already filled in below — just paste your three secrets):

```
ANTHROPIC_API_KEY=sk-ant-<paste from step 2>
SUPABASE_URL=https://dahnmxrwhfaluwotaxyf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<paste from step 1>
NEXT_PUBLIC_SUPABASE_URL=https://dahnmxrwhfaluwotaxyf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaG5teHJ3aGZhbHV3b3RheHlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NTQ5NDksImV4cCI6MjEwMzMzMDk0OX0.pLiXJeOYYR_CrZ-khkqgW5IktnPrlsF1YxyvJlpaurg
BRAVE_SEARCH_API_KEY=<paste from step 3>
```

## 5. Install and seed

```bash
pnpm install
pnpm seed        # optional — ingests 16 swim exercises so search isn't empty
pnpm dev         # http://localhost:3000
```

The seed run will hit Claude Opus 5 once per exercise (~16 API calls, a few cents total).

## 6. Try it

- **Search:** visit [localhost:3000](http://localhost:3000) → try `catch-up`, `10x100`, or filter by stroke = `freestyle`
- **Add from a URL:** click **Add** → **URL** tab → paste a swim blog post → **Ingest** → watch it move through queued → extracting → normalizing → ready on the **Jobs** page
- **Add from YouTube:** **Add** → **YouTube** tab → paste any coach's video URL that has captions
- **External search + ingest:** on the search page click **Search the web**, enter a query, then click **Ingest** on any result

## Deploying to Vercel (optional)

1. Push the branch to GitHub if you haven't (already done)
2. Open [https://vercel.com/new](https://vercel.com/new) → **Import** the `SideProjects` repo → set **Root Directory** to `swim-aggregator`
3. In **Environment Variables**, paste every line from your `.env.local`
4. **Deploy**
