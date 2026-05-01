# AIWatch

Zero-cost AI news aggregator with a dedicated AI Incident Feed.

**5 sections:**
- 🚨 **AI Incident Feed** — real-world AI failures, attacks, deepfakes, data leaks (auto-tagged by type/severity/country)
- 📰 **Today's AI News** — 15+ RSS feeds aggregated every 6 hours
- 🛠 **New Tools This Week** — AI tool launches from Product Hunt & Hacker News
- ⚰️ **AI Graveyard** — tools and startups that shut down or got acquired
- 📊 **Hype vs Reality Board** — AI predictions tracked against outcomes

**Stack:** Next.js 16 + TypeScript + Tailwind CSS v4 + Supabase + GitHub Actions + Vercel (all free)

---

## Setup (one-time, ~15 minutes)

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Open the **SQL Editor** and paste the contents of `supabase/schema.sql` — run it
3. Copy your project's **URL**, **anon key**, and **service role key** from *Project Settings → API*

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. GitHub repository secrets

For the GitHub Actions workflow to write to Supabase:

1. Push this repo to GitHub
2. Go to *Settings → Secrets and variables → Actions*
3. Add two secrets:
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key

### 4. Deploy to Vercel

1. Connect your GitHub repo at [vercel.com/new](https://vercel.com/new)
2. Add the two `NEXT_PUBLIC_*` env vars in Vercel's *Environment Variables* settings
3. Deploy

### 5. First data fetch

Trigger the GitHub Actions workflow manually:
*Actions → Fetch AI News & Incidents → Run workflow*

After that, it runs automatically every 6 hours.

---

## Manual content (10 min/week)

**AI Graveyard** and **Hype vs Reality** are manually curated. Add entries directly in Supabase:
- Table `graveyard`: columns `name`, `description`, `shutdown_date`, `reason` (shutdown/acquired/pivot), `acquired_by`, `notes`
- Table `hype_items`: columns `prediction`, `predicted_by`, `predicted_at`, `reality`, `status` (pending/confirmed/busted/partial), `verdict_date`

---

## Development

```bash
npm run dev       # Start dev server at localhost:3000
npm run build     # Production build
npm run fetch-news  # Run the RSS fetch script locally (requires .env.local)
```

## Project structure

```
app/
  page.tsx              # Homepage (preview of all sections)
  incidents/
    page.tsx            # AI Incident Feed (all incidents, grouped by severity)
    [slug]/page.tsx     # Individual incident detail page
  news/page.tsx         # Today's AI News
  tools/page.tsx        # New Tools This Week
  graveyard/page.tsx    # AI Graveyard
  hype/page.tsx         # Hype vs Reality Board

components/
  Navbar.tsx            # Top navigation
  Footer.tsx            # Footer
  IncidentCard.tsx      # Incident list card
  NewsCard.tsx          # News item card
  ToolCard.tsx          # Tool launch card
  GraveyardCard.tsx     # Graveyard entry card
  HypeCard.tsx          # Hype vs reality card
  SeverityBadge.tsx     # Severity label (critical/high/medium/low)

lib/
  supabase.ts           # Supabase client (frontend, anon key)
  types.ts              # TypeScript interfaces

scripts/
  fetch-news.ts         # GitHub Actions RSS fetch script

supabase/
  schema.sql            # Run once in Supabase SQL Editor

.github/workflows/
  fetch-news.yml        # Runs every 6 hours
```
