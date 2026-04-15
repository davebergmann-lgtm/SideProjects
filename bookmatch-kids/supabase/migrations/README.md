# Database migrations — what you need to do

This folder holds SQL files that update the database after the initial
`supabase/schema.sql` was applied. Each file is **safe to run on an existing
database** — it uses `create or replace`, `if not exists`, and idempotent
backfills, so running it twice will not break anything.

You apply these **in order** (01, 02, 03, …). You only need to apply each
one once per environment (your dev project, then later your production
project).

---

## Migration 01 — Community ratings

**File:** `01_community_ratings.sql`

### What this does (in plain English)

Right now, every kid's ratings stay on their own profile. This migration adds
a site-wide "community score" for every book, so the recommendation engine
can also see which books are hits with other kids on the site.

Concretely:
- Adds a trigger that automatically updates `books.community_score` and
  `books.total_ratings` every time anyone rates a book.
- Backfills those numbers for books that already have ratings.
- Adds an index so "most popular" lookups are fast.
- Adds a function (`popular_books`) the app calls to fetch the top 20
  community favorites. Claude then uses those as a shortlist of proven hits
  when generating a reading list.

Nothing breaks if you don't apply this — the app will just skip the
shortlist and fall back to pure AI recommendations. But you'll want to
apply it, because it meaningfully improves the recommendations once a few
kids are on the site.

---

### Click-by-click: how to apply it

You're going to paste the SQL file into the Supabase SQL editor and hit Run.
That's it. Here is every click:

1. Open your web browser and go to **https://supabase.com/dashboard**.
2. Sign in if you aren't already signed in.
3. On the dashboard, **click your BookMatch project** (the one with the
   database this app uses — if you have a dev and a prod project, start
   with dev).
4. In the left sidebar, **click the icon that looks like `</>`** — it's
   labelled **SQL Editor**. (It's usually the third icon from the top, below
   Table Editor.)
5. At the top of the SQL editor, **click the `+ New query` button** (top
   left). A blank query tab opens.
6. In a **separate tab in your file explorer or VS Code**, open the file
   `bookmatch-kids/supabase/migrations/01_community_ratings.sql`.
7. **Select all of the file** (Cmd+A on Mac, Ctrl+A on Windows) and
   **copy it** (Cmd+C / Ctrl+C).
8. Click back into the Supabase SQL editor tab. Click inside the empty
   query area and **paste** (Cmd+V / Ctrl+V). You should now see the full
   SQL (it starts with `-- Community ratings rollup`).
9. At the bottom-right of the SQL editor, **click the green `Run` button**
   (keyboard shortcut: Cmd+Enter on Mac, Ctrl+Enter on Windows).
10. Wait a few seconds. If everything worked, you'll see a small green
    **"Success. No rows returned"** message at the bottom. That's what you
    want.
11. You're done. Close the tab or save the query if you want a record of it.

If you see a **red error message** instead, copy the full error text and
send it over — we'll fix it together. **Do not re-run the file blindly**
if the first run failed; the error message tells us which piece of the
migration choked.

---

### How to verify it worked

You don't have to do this, but if you want to double-check:

1. Still in the SQL editor, **click `+ New query`** again.
2. **Paste this one-line query** into the new tab:

   ```sql
   select id, title, community_score, total_ratings
   from public.books
   order by total_ratings desc
   limit 5;
   ```

3. **Click Run.** You should see up to 5 rows come back. `community_score`
   should be a number between 0 and 1 (e.g. `0.83`) and `total_ratings` an
   integer. If your database has no ratings yet, you'll see 0 rows or all
   zeros — that's fine, it just means nobody has rated anything yet.
4. **Another check:** paste this into a new query and Run.

   ```sql
   select * from public.popular_books(1, 10);
   ```

   This calls the new function. If the migration applied, it returns up to
   10 rows (or an empty table if no books have been rated yet). If it
   returns an error like `function public.popular_books does not exist`,
   the migration didn't apply — re-check step 10 above.

---

### After you apply it — what changes in the app

Nothing visible on the surface. The difference shows up the next time you
click **"Generate reading list"** for a kid: the Claude prompt now includes
a "PROVEN HITS" section listing the top community favorites (filtered to
exclude anything that kid has already rated). Claude uses it as a shortlist
of strong candidates to cross-reference against the child's taste.

You don't need to restart or redeploy the app for the SQL change itself to
take effect. The app code change that reads `popular_books` is deployed
through your normal code-push flow (git push → Vercel).

---

### Do I apply this on production too?

**Yes — but only after you've tested it on your dev project first.** The
steps are identical, just select the production project in step 3 instead
of dev. Apply it during a quiet moment if you can; the backfill loop at
the bottom of the file touches every row in `public.books` once, which
takes longer the more books you have. For a few thousand books it's
sub-second; for millions it would be noticeable — but you're nowhere near
that yet.

---

## When new migrations are added

When you see a new file in this folder (e.g. `02_something.sql`), repeat
the same process: open the file, copy it, paste into a new SQL editor
query, Run. Apply them **in numerical order** and apply each one only
once per environment.
